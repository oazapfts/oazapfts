import { describe, it, expect, beforeAll, assert } from "vitest";
import * as path from "node:path";
import { Opts, generateSource } from "./index";
import { readFile } from "node:fs/promises";
import { createProject, ts } from "@ts-morph/bootstrap";
import { ScriptTarget } from "typescript";

const rootFolder = path.join(__dirname, "../../..");
const demoFolder = path.join(rootFolder, "demo");

/**
 * Generate an API from a relative path and convert it into a single line.
 */
async function generate(file: string, opts: Opts = {}) {
  const src = await generateSource(file, opts);
  const error = await checkForTypeErrors(src);
  expect(error).toBeUndefined();
  return src.replace(/\s+/g, " ");
}

/**
 * Type-check the given TypeScript source code.
 */
async function checkForTypeErrors(source: string) {
  const project = await createProject({
    tsConfigFilePath: path.resolve(rootFolder, "./tsconfig.base.json"),
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      noEmit: true,
      target: ScriptTarget.ESNext,
      paths: {
        "@oazapfts/runtime": [path.resolve(__dirname, "../../runtime/src")],
        "@oazapfts/runtime/*": [path.join(__dirname, "../../runtime/src/*")],
      },
    },
  });

  project.createSourceFile(__dirname + "/api.ts", source);
  const program = project.createProgram();
  const [error] = ts.getPreEmitDiagnostics(program);
  return error?.messageText;
}

describe("generateSource", () => {
  beforeAll(async () => {
    global.__API_STUB_PLACEHOLDER__ = (
      await readFile(__dirname + "/../template/ApiStub.ts")
    ).toString();
  });

  it("should generate the same api twice", async () => {
    const spec = path.join(demoFolder, "./petstore.json");
    const src1 = await generate(spec);
    const src2 = await generate(spec);
    expect(src1).toBe(src2);
  });

  it("should handle enums as union types", async () => {
    const src = await generate(path.join(demoFolder, "./petstore.json"));
    expect(src).toContain(`export type Option = ("one" | "two" | "three")[];`);
  });

  it("should handle properties both inside and outside of allOf", async () => {
    const src = await generate(__dirname + "/__fixtures__/allOf.json");
    expect(src).toContain(
      "export type Circle = Shape & { radius?: number; } & { circumference?: number; };",
    );
  });

  it("should support discriminator used in conjunction with allOf", async () => {
    const src = await generate(__dirname + "/__fixtures__/allOf.json");
    expect(src).toContain("export type PetBase = { petType: string; };");
    expect(src).toContain("export type Pet = Dog | Cat | Lizard;");
    expect(src).toContain(
      'export type Dog = { petType: "dog"; } & PetBase & { bark?: string; };',
    );
    expect(src).toContain(
      'export type Lizard = { petType: "Lizard"; } & PetBase & { lovesRocks?: boolean; };',
    );
  });

  it("should support recursive schemas", async () => {
    const src = await generate(__dirname + "/__fixtures__/recursive.yaml");
    expect(src).toContain(
      "export type FolderDto = { name?: string; files?: string[]; folders?: FolderDto[]; };",
    );
  });

  it("should support boolean schemas", async () => {
    const src = await generate(__dirname + "/__fixtures__/booleanSchema.json");
    expect(src).toContain(
      "export type BlogEntry = { id: number; title: string; content: any | null; };",
    );
    expect(src).toContain("export type Paradox = { foo: never; };");
  });

  it("should support referenced boolean schemas", async () => {
    const src = await generate(
      __dirname + "/__fixtures__/booleanSchemaRefs.json",
    );
    expect(src).toContain(
      "export type BlogEntry = { id: number; title: string; content: AlwaysAccept; };",
    );
    expect(src).toContain("export type Paradox = { foo: NeverAccept; };");
    expect(src).toContain("export type AlwaysAccept = any | null;");
    expect(src).toContain("export type NeverAccept = never;");
  });

  it("should handle application/geo+json", async () => {
    const src = await generate(__dirname + "/__fixtures__/geojson.json");
    expect(src).toContain(
      'return oazapfts.fetchJson<{ status: 200; data: FeatureCollection; }>("/geojson", { ...opts });',
    );
  });

  it("should generate an api using fetchBlob", async () => {
    const src = await generate(__dirname + "/__fixtures__/binary.json");
    expect(src).toContain(
      "return oazapfts.fetchBlob<{ status: 200; data: Blob; }>(`/file/${encodeURIComponent(fileId)}/download`, { ...opts });",
    );
  });

  it("should generate an api with literal type set to const value", async () => {
    const src = await generate(__dirname + "/__fixtures__/const.json");
    expect(src).toContain(`export type Shape = "circle";`);
  });

  it("should generate valid identifiers", async () => {
    const src = await generate(
      __dirname + "/__fixtures__/invalidIdentifiers.yaml",
    );
    expect(src).toContain("getPets($0Limit: number, { $delete }");
  });

  it("should not generate duplicate identifiers", async () => {
    const src = await generate(
      __dirname + "/__fixtures__/duplicateIdentifiers.yaml",
    );
    expect(src).toContain("getPetById(id: number, { idQuery }");
  });

  it("should generate correct array type for prefixItems", async () => {
    const src = await generate(__dirname + "/__fixtures__/prefixItems.json");
    expect(src).toContain("export type Coordinates = [ number, number ];");
  });

  it("should generate valid identifiers for oneOf with refs", async () => {
    const src = await generate(__dirname + "/__fixtures__/oneOfRef.yaml");
    expect(src).toContain("PathsFilterGetParameters0SchemaOneOf0");
  });

  it("should merge properties within oneOf schema variations", async () => {
    const src = await generate(__dirname + "/__fixtures__/oneOfMerge.yaml");
    expect(src).toContain(
      '{ param1?: { c: string; d: "enum1" | "enum2"; a?: string; } | { c?: string; d: "enum1" | "enum2"; b: string; }',
    );
  });

  it("should support parameters specified with content", async () => {
    const src = await generate(__dirname + "/__fixtures__/contentParams.json");
    expect(src).toContain(
      "export function queryFiles({ filter }: { filter?: { where?: { fileId?: number; }; }; } = {}, opts?: Oazapfts.RequestOpts)",
    );
    expect(src).toContain(
      "return oazapfts.fetchBlob<{ status: 200; data: Blob; }>(`/file${QS.query(QS.json({ filter }))}`, { ...opts });",
    );
  });

  it("should generate a base types and extended types with readOnly and writeOnly properties", async () => {
    const src = await generate(
      __dirname + "/__fixtures__/readOnlyWriteOnly.yaml",
    );

    // Base types + Read & Write
    expect(src).toContain(
      "export type ExampleSchema = { always_present: string; }; export type ExampleSchemaRead = { always_present: string; read_only_prop: string; }; export type ExampleSchemaWrite = { always_present: string; write_only_prop: string; }",
    );
    // Parent types using Read/Write nested types
    expect(src).toContain(
      "export type ExampleParentSchema = { child_schema: ExampleSchema; }; export type ExampleParentSchemaRead = { child_schema: ExampleSchemaRead; }; export type ExampleParentSchemaWrite = { child_schema: ExampleSchemaWrite; }",
    );

    // oneOf using Read nested types
    expect(src).toContain("data: ExampleSchemaRead | ExampleBaseSchema");
    // oneOf using Write nested types
    expect(src).toContain("body: ExampleSchemaWrite | ExampleBaseSchema");

    // allOf using Read nested types
    expect(src).toContain("data: ExampleSchemaRead & ExampleBaseSchema");
    // allOf using Write nested types
    expect(src).toContain("body: ExampleSchemaWrite & ExampleBaseSchema");
  });

  it("should generate merged types with mergeReadWriteOnly", async () => {
    const src = await generate(
      __dirname + "/__fixtures__/readOnlyWriteOnly.yaml",
      {
        mergeReadWriteOnly: true,
      },
    );

    // Base types + Read & Write
    expect(src).toContain(
      "export type ExampleSchema = { always_present: string; read_only_prop: string; write_only_prop: string; }",
    );
    expect(src).not.toContain("ExampleSchemaRead");
    expect(src).not.toContain("ExampleSchemaWrite");

    // Parent types using Read/Write nested types
    expect(src).toContain(
      "export type ExampleParentSchema = { child_schema: ExampleSchema; };",
    );
    expect(src).not.toContain("ExampleParentSchemaRead");
    expect(src).not.toContain("ExampleParentSchemaWrite");
  });

  it("shouldn't filter all properties of schema when using readOnly/writeOnly", async () => {
    const src = await generate(__dirname + "/__fixtures__/issue-419.json");

    expect(src).toContain("message: string");
  });

  it("should handle type array with nullable fields", async () => {
    const src = await generate(__dirname + "/__fixtures__/array-type.yaml");

    expect(src).toContain("name?: string | null; no?: number | null;");
  });
});

describe("useEnumType", () => {
  let src: string;

  beforeAll(async () => {
    src = await generate(path.join(demoFolder, "./petstore.json"), {
      useEnumType: true,
    });
  });

  it("should create string enums", () => {
    expect(src).toContain(
      `export enum Status { Available = "available", Pending = "pending", Sold = "sold", Private = "private", $10Percent = "10percent" }`,
    );
  });

  it("should create array of enums", () => {
    expect(src).toContain(
      `export enum Activities { Running = "running", Playing = "playing", Laying = "laying", Begging = "begging" }`,
    );

    expect(src).toContain(`: Activities[]`);
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

describe("argumentStyle", () => {
  let src: string;

  describe("positional", () => {
    beforeAll(async () => {
      src = await generate(path.join(demoFolder, "./petstore.json"), {
        argumentStyle: "positional",
      });
    });

    it("should generate positional argument", () => {
      // for path parameter and requestBody
      expect(src).toContain(
        `function updatePetWithForm(petId: number, body?: { /** Updated name of the pet */ name?: string; /** Updated status of the pet */ status?: string; }, opts?: Oazapfts.RequestOpts) { return oazapfts.fetchText(\`/pet/\${encodeURIComponent(petId)}\`, oazapfts.form({ ...opts, method: "POST", body })); }`,
      );

      // for query and header parameter
      expect(src).toContain(
        `function customizePet(petId: number, { furColor, color, xColorOptions }: { furColor?: string; color?: string; xColorOptions?: boolean; } = {}, opts?: Oazapfts.RequestOpts) { return oazapfts.fetchText(\`/pet/\${encodeURIComponent(petId)}/customize\${QS.query(QS.explode({ "fur.color": furColor, color }))}\`, { ...opts, method: "POST", headers: oazapfts.mergeHeaders(opts?.headers, { "x-color-options": xColorOptions }) }); }`,
      );
    });

    it("should not generate argument when no parameters nor requestBody specified", () => {
      expect(src).toContain(
        `function getInventory(opts?: Oazapfts.RequestOpts) { return oazapfts.fetchJson<{ status: 200; data: { [key: string]: number; }; }>("/store/inventory", { ...opts }); }`,
      );
    });
  });

  describe("object", () => {
    beforeAll(async () => {
      src = await generate(path.join(demoFolder, "./petstore.json"), {
        argumentStyle: "object",
      });
    });

    it("should generate object argument", () => {
      // for path parameter and requestBody
      expect(src).toContain(
        `function updatePetWithForm({ petId, body }: { petId: number; body?: { /** Updated name of the pet */ name?: string; /** Updated status of the pet */ status?: string; }; }, opts?: Oazapfts.RequestOpts) { return oazapfts.fetchText(\`/pet/\${encodeURIComponent(petId)}\`, oazapfts.form({ ...opts, method: "POST", body })); }`,
      );

      // for query and header parameter
      expect(src).toContain(
        `function customizePet({ petId, furColor, color, xColorOptions }: { petId: number; furColor?: string; color?: string; xColorOptions?: boolean; }, opts?: Oazapfts.RequestOpts) { return oazapfts.fetchText(\`/pet/\${encodeURIComponent(petId)}/customize\${QS.query(QS.explode({ "fur.color": furColor, color }))}\`, { ...opts, method: "POST", headers: oazapfts.mergeHeaders(opts?.headers, { "x-color-options": xColorOptions }) }); }`,
      );
    });

    it("should not generate argument when no parameters nor requestBody specified", () => {
      expect(src).toContain(
        `function getInventory(opts?: Oazapfts.RequestOpts) { return oazapfts.fetchJson<{ status: 200; data: { [key: string]: number; }; }>("/store/inventory", { ...opts }); }`,
      );
    });
  });
});
