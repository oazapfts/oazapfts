import * as path from "node:path";
import { generateSource } from "./index";

import { createProject, ts } from "@ts-morph/bootstrap";
import { ScriptTarget } from "typescript";

/**
 * Generate an API from a releative path and convert it into a single line.
 */
async function generate(file: string, opts = {}) {
  const spec = path.join(__dirname, file);
  const src = await generateSource(spec, opts);
  const error = await checkForTypeErrors(src);
  expect(error).toBeUndefined();
  return src.replace(/\s+/g, " ");
}

/**
 * Type-check the given TypeScript source code.
 */
async function checkForTypeErrors(source: string) {
  const project = await createProject({
    tsConfigFilePath: __dirname + "/../../tsconfig.json",
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      noEmit: true,
      target: ScriptTarget.ESNext,
      paths: {
        "oazapfts/lib/*": [__dirname + "/../../lib/*"],
      },
    },
  });

  project.createSourceFile(__dirname + "/api.ts", source);
  const program = project.createProgram();
  const [error] = ts.getPreEmitDiagnostics(program);
  return error?.messageText;
}

describe("generateSource", () => {
  it("should generate the same api twice", async () => {
    const spec = "/../../demo/petstore.json";
    const src1 = await generate(spec);
    const src2 = await generate(spec);
    expect(src1).toBe(src2);
  });

  it("should handle enums as union types", async () => {
    const src = await generate("/../../demo/petstore.json");
    expect(src).toContain(`export type Option = ("one" | "two" | "three")[];`);
  });

  it("should handle properties both inside and outside of allOf", async () => {
    const src = await generate("/__fixtures__/allOf.json");
    expect(src).toContain(
      "export type Circle = Shape & { radius?: number; } & { circumference?: number; };",
    );
  });

  it("should handle application/geo+json", async () => {
    const src = await generate("/__fixtures__/geojson.json");
    expect(src).toContain(
      'return oazapfts.fetchJson<{ status: 200; data: FeatureCollection; }>("/geojson", { ...opts });',
    );
  });

  it("should generate an api using fetchBlob", async () => {
    const src = await generate("/__fixtures__/binary.json");
    expect(src).toContain(
      "return oazapfts.fetchBlob<{ status: 200; data: Blob; }>(`/file/${encodeURIComponent(fileId)}/download`, { ...opts });",
    );
  });

  it("should generate an api with literal type set to const value", async () => {
    const src = await generate("/__fixtures__/const.json");
    expect(src).toContain(`export type Shape = "circle";`);
  });

  it("should generate valid identifiers", async () => {
    const src = await generate("/__fixtures__/invalidIdentifiers.yaml");
    expect(src).toContain("getPets($0Limit: number, { $delete }");
  });

  it("should not generate duplicate identifiers", async () => {
    const src = await generate("/__fixtures__/duplicateIdentifiers.yaml");
    expect(src).toContain("getPetById(id: number, { idQuery }");
  });

  it("should generate correct array type for prefixItems", async () => {
    const src = await generate("/__fixtures__/prefixItems.json");
    expect(src).toContain("export type Coordinates = [ number, number ];");
  });

  it("should generate valid identifiers for oneOf with refs", async () => {
    const src = await generate("/__fixtures__/oneOfRef.yaml");
    expect(src).toContain("PathsFilterGetParameters0SchemaOneOf0");
  });

  it("should support parameters specified with content", async () => {
    const src = await generate("/__fixtures__/contentParams.json");
    expect(src).toContain(
      "export function queryFiles({ filter }: { filter?: { where?: { fileId?: number; }; }; } = {}, opts?: Oazapfts.RequestOpts)",
    );
    expect(src).toContain(
      "return oazapfts.fetchBlob<{ status: 200; data: Blob; }>(`/file${QS.query(QS.json({ filter }))}`, { ...opts });",
    );
  });

  it("should generate a base interface and extended interfaces with readOnly and writeOnly properties", async () => {
    const src = await generate("/__fixtures__/readOnlyWriteOnly.yaml");
    expect(src).toContain(
      "export interface ExampleSchema { always_present: string; } export interface ExampleSchemaRead extends ExampleSchema { read_only_prop: string; } export interface ExampleSchemaWrite extends ExampleSchema { write_only_prop: string; }",
    );
  });

  it("shouldn't filter all properties of schema when using readOnly/writeOnly", async () => {
    const src = await generate("/__fixtures__/issue-419.json");

    expect(src).toContain("message: string");
  });
});

describe("useEnumType", () => {
  let src: string;

  beforeAll(async () => {
    src = await generate("/../../demo/petstore.json", { useEnumType: true });
  });

  it("should create string enums", () => {
    expect(src).toContain(
      `export enum Status { Available = "available", Pending = "pending", Sold = "sold", Private = "private", $10Percent = "10percent" }`,
    );
  });

  it("should create number enums", () => {
    expect(src).toContain(
      `export enum Size { P = "P", M = "M", G = "G", $0 = "0" }`,
    );
  });

  it("should handle values with the same name", () => {
    expect(src).toContain(
      `export enum Status2 { Placed = "placed", Approved = "approved", Delivered = "delivered" }`,
    );
  });

  it("should avoid name conflicts between types and enums", () => {
    // Type Category is defined as `Category`
    expect(src).toContain(
      `export type Category = { id?: number; name?: string; };`,
    );

    // Enum Category is also defined as `Category` which would be a conflict to type `Category`
    expect(src).not.toContain(`export enum Category {`);

    // Enum Category is defined as `Category2` to avoid name conflict with type Category
    expect(src).toContain(
      `export enum Category2 { Rich = "rich", Wealthy = "wealthy", Poor = "poor" }`,
    );
  });
});
