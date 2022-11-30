import ApiGenerator, { getOperationName } from "./generate";
import { printAst } from "./index";
import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIV3 } from "openapi-types";

describe("getOperationName", () => {
  it("should use the id", () => {
    expect(getOperationName("GET", "/pets", "list pets")).toEqual("listPets");
  });
  it("should use the verb and path", () => {
    expect(getOperationName("GET", "/pets/{color}/{status}")).toEqual(
      "getPetsByColorAndStatus"
    );
  });
  it("should not use ids with special chars", () => {
    expect(
      getOperationName("GET", "/pets", "API\\PetController::listPetAction")
    ).toEqual("getPets");
  });
});

describe("generate", () => {
  let artefact: string;
  let spec: { petstore: OpenAPIV3.Document; allOf: OpenAPIV3.Document };

  beforeAll(async () => {
    spec = {
      petstore: (await SwaggerParser.bundle(
        __dirname + "/../../demo/petstore.json"
      )) as any,
      allOf: (await SwaggerParser.bundle(
        __dirname + "/../../demo/allOf.json"
      )) as any,
    };
  });

  it("should generate an api", async () => {
    artefact = printAst(new ApiGenerator(spec.petstore).generateApi());
  });

  /* https://github.com/cotype/build-client/issues/5 */
  it("should generate same api a second time", async () => {
    expect(printAst(new ApiGenerator(spec.petstore).generateApi())).toBe(
      artefact
    );
  });

  it("should handle properties both inside and outside of allOf", async () => {
    const api = printAst(new ApiGenerator(spec.allOf).generateApi());
    const oneLine = api.replace(/\s+/g, " ");

    const circleTypeDefinition =
      "export type Circle = Shape & { radius?: number; } & { circumference?: number; };";

    expect(oneLine).toContain(circleTypeDefinition);
  });

  it("should handle enums as union types", async () => {
    const api = printAst(new ApiGenerator(spec.petstore).generateApi());
    const oneLine = api.replace(/\s+/g, " ");

    const enumTypeDefinition = `export type Option = ("one" | "two" | "three")[];`;

    expect(oneLine).toContain(enumTypeDefinition);
  });

  it("should create real enums", async () => {
    const api = printAst(
      new ApiGenerator(spec.petstore, { useEnumType: true }).generateApi()
    );
    const oneLine = api.replace(/\s+/g, " ");

    // Enum type string
    const enumDefinition = `export enum Status { Available = "Available", Pending = "Pending", Sold = "Sold" }`;

    expect(oneLine).toContain(enumDefinition);

    // Enum type number
    const enumNumberDefinition = `export enum Size { P = 0, M = 1, G = 2 }`;

    expect(oneLine).toContain(enumNumberDefinition);

    // Enums with different values but same name should result in a different instance name
    const sameNameDefinition = `export enum Status2 { Placed = "Placed", Approved = "Approved", Delivered = "Delivered" }`;

    expect(oneLine).toContain(sameNameDefinition);
  });

  it("should avoid name conflicts between types and enums", async () => {
    const api = printAst(
      new ApiGenerator(spec.petstore, { useEnumType: true }).generateApi()
    );
    const oneLine = api.replace(/\s+/g, " ");

    // Type Category is defined as `Category`
    const typeDefinition = `export type Category = { id?: number; name?: string; };`;
    expect(oneLine).toContain(typeDefinition);

    // Enum Category is defined as `Category2` to avoid name conflict with type Category
    const enumDefinition = `export enum Category2 { Rich = "Rich", Wealthy = "Wealthy", Poor = "Poor" }`;
    expect(oneLine).toContain(enumDefinition);
  });
});

describe("generate with application/geo+json", () => {
  let spec: OpenAPIV3.Document;

  beforeAll(async () => {
    spec = (await SwaggerParser.bundle(
      __dirname + "/../../demo/geojson.json"
    )) as any;
  });

  it("should generate an api", async () => {
    const artefact = printAst(new ApiGenerator(spec).generateApi());
    const oneLine = artefact.replace(/\s+/g, " ");
    expect(oneLine).toContain(
      'return oazapfts.fetchJson<{ status: 200; data: FeatureCollection; }>("/geojson", { ...opts });'
    );
  });
});

describe("generate with blob download", () => {
  let spec: OpenAPIV3.Document;

  beforeAll(async () => {
    spec = (await SwaggerParser.bundle(
      __dirname + "/../../demo/binary.json"
    )) as any;
  });

  it("should generate an api using fetchBlob", async () => {
    const artefact = printAst(new ApiGenerator(spec).generateApi());
    const oneLine = artefact.replace(/\s+/g, " ");
    expect(oneLine).toContain(
      "return oazapfts.fetchBlob<{ status: 200; data: Blob; }>(`/file/${encodeURIComponent(fileId)}/download`, { ...opts });"
    );
  });
});

describe("generate with const", () => {
  let spec: OpenAPIV3.Document;

  beforeAll(async () => {
    spec = (await SwaggerParser.bundle(
      __dirname + "/../../demo/const.json"
    )) as any;
  });

  it("should generate an api with literal type set to const value", async () => {
    const artefact = printAst(new ApiGenerator(spec).generateApi());
    const oneLine = artefact.replace(/\s+/g, " ");
    const constTypeDefinition = `export type Shape = "circle";`;
    expect(oneLine).toContain(constTypeDefinition);
  });
});
