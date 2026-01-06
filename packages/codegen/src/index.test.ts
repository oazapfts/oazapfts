import { beforeAll, describe, expect, it } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import oazapftsLib, {
  generateAst,
  generateSource,
  oazapfts,
  parseSpec,
  printAst,
  UNSTABLE_cg,
  type OazapftsOptions,
  type OpenAPI,
} from "./index";
import { createProject, ts } from "@ts-morph/bootstrap";
import { ScriptTarget } from "typescript";

const rootFolder = path.join(__dirname, "../../..");
const demoFolder = path.join(rootFolder, "demo");

function findCodeSection(
  src: string,
  opts: {
    matching: RegExp | string;
    before?: number;
    after?: number;
  },
) {
  const lines = src.split("\n");
  const lineIndex = lines.findIndex((line) => line.match(opts.matching));
  if (lineIndex === -1) {
    const pattern =
      opts.matching instanceof RegExp
        ? opts.matching.toString()
        : JSON.stringify(opts.matching);
    throw new Error(
      `Pattern ${pattern} not found in source code. Cannot extract code section.`,
    );
  }
  return lines
    .slice(lineIndex - (opts.before || 0), lineIndex + (opts.after || 0) + 1)
    .join("\n");
}

/**
 * Generate an API from a relative path and convert it into a single line.
 */
async function generate(
  file: string,
  opts: OazapftsOptions & { minify?: boolean } = { minify: true },
) {
  const src = await generateSource(file, opts);
  const error = await checkForTypeErrors(src);
  expect(error).toBeUndefined();
  return opts.minify !== false ? src.replace(/\s+/g, " ") : src;
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

describe("index exports (public API surface)", () => {
  it("exports generateSource as default and as oazapfts alias", () => {
    expect(oazapftsLib).toBe(generateSource);
    expect(oazapfts).toBe(generateSource);
  });

  it("exports the core helpers as functions", () => {
    expect(typeof generateAst).toBe("function");
    expect(typeof printAst).toBe("function");
    expect(typeof parseSpec).toBe("function");
  });

  it("exports UNSTABLE_cg utilities", () => {
    expect(typeof UNSTABLE_cg).toBe("object");
  });

  it("exports OpenAPI and OazapftsOptions types (compile-time)", () => {
    const _: OpenAPI.Document = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
    };
    const __: OazapftsOptions = {
      argumentStyle: "positional",
      include: ["*"],
      exclude: [],
      mergeReadWriteOnly: true,
      useEnumType: true,
      useUnknown: true,
      optimistic: true,
      unionUndefined: true,
      UNSTABLE_plugins: [],
    };
  });
});

describe("generateSource", () => {
  it("no longer supports non-OpenAPI v3 specs", async () => {
    await expect(
      generateSource({
        // A minimal Swagger 2.0 spec (OpenAPI 2)
        swagger: "2.0",
        info: {
          title: "Swagger API",
          version: "1.0.0",
        },
      } as any),
    ).rejects.toThrow(
      "Only OpenAPI v3 is supported\nYou may convert you spec with https://github.com/swagger-api/swagger-converter or swagger2openapi package",
    );
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

  describe("discriminator mappings with allOf", () => {
    let src: string;

    beforeAll(async () => {
      src = await generate(__dirname + "/__fixtures__/allOf.json");
    });

    it("should handle properties both inside and outside of allOf", async () => {
      expect(src).toContain(
        "export type Circle = Shape & { radius?: number; } & { circumference?: number; };",
      );
    });

    it("should support discriminator used in conjunction with allOf", async () => {
      expect(src).toContain("export type PetBase = { petType: string; };");
      expect(src).toContain(
        'export type Cat = { petType: "cat"; } & PetBase & { name?: string; };',
      );
      expect(src).toContain(
        'export type Dog = { petType: "dog" | "poodle"; } & PetBase & { bark?: string; };',
      );
      expect(src).toContain(
        'export type Lizard = { petType: "Lizard"; } & PetBase & { lovesRocks?: boolean; };',
      );
      expect(src).toContain("export type Pet = Dog | Cat | Lizard;");
    });
  });

  describe("discriminator with useEnumType", () => {
    it("should use enum member references in discriminator types when useEnumType is true", async () => {
      // Create a modified allOf fixture with enum discriminator
      const allOfFixture = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "__fixtures__", "allOf.json"),
          "utf8",
        ),
      );

      // Modify the Pet schema to have an enum discriminator
      allOfFixture.components.schemas.Pet.properties.petType = {
        type: "string",
        enum: ["dog", "Cat", "Lizard"],
      };

      // Update the discriminator mapping to include all enum values
      allOfFixture.components.schemas.Pet.discriminator.mapping = {
        dog: "#/components/schemas/Dog",
        Cat: "#/components/schemas/Cat",
        Lizard: "#/components/schemas/Lizard",
      };

      const src = await generate(allOfFixture, {
        useEnumType: true,
        minify: false,
      });

      // Should create the enum
      expect(
        findCodeSection(src, {
          matching: "export enum PetType",
          after: 4,
        }),
      ).toMatchInlineSnapshot(`
        "export enum PetType {
            Dog = "dog",
            Cat = "Cat",
            Lizard = "Lizard"
        }"
      `);

      // Should use enum member references instead of literal strings in discriminator types
      expect(
        findCodeSection(src, {
          matching: "export type Dog =",
          after: 4,
        }),
      ).toMatchInlineSnapshot(`
        "export type Dog = {
            petType: PetType.Dog;
        } & PetBase & {
            bark?: string;
        };"
      `);
      expect(
        findCodeSection(src, {
          matching: "export type Cat =",
          after: 4,
        }),
      ).toMatchInlineSnapshot(`
        "export type Cat = {
            petType: PetType.Cat;
        } & PetBase & {
            name?: string;
        };"
      `);
      expect(
        findCodeSection(src, {
          matching: "export type Lizard =",
          after: 4,
        }),
      ).toMatchInlineSnapshot(`
        "export type Lizard = {
            petType: PetType.Lizard;
        } & PetBase & {
            lovesRocks?: boolean;
        };"
      `);

      // Should not contain literal string types for discriminator properties in the generated types
      expect(src).not.toContain('petType: "dog"');
      expect(src).not.toContain('petType: "Cat"');
      expect(src).not.toContain('petType: "Lizard"');

      // Base should use the enum type
      expect(
        findCodeSection(src, {
          matching: "export type PetBase =",
          after: 2,
        }),
      ).toMatchInlineSnapshot(`
        "export type PetBase = {
            petType: PetType;
        };"
      `);
    });

    it("should use enum member references in oneOf discriminator types when useEnumType is true", async () => {
      const src = await generate(
        path.join(__dirname, "__fixtures__", "oneOfDiscriminator.json"),
        {
          useEnumType: true,
          minify: false,
        },
      );

      // Should create enums for each variant's petType
      expect(
        findCodeSection(src, {
          matching: "export enum PetType",
          after: 2,
        }),
      ).toMatchInlineSnapshot(`
        "export enum PetType {
            Dog = "dog"
        }"
      `);
      expect(
        findCodeSection(src, {
          matching: "export enum PetType2",
          after: 2,
        }),
      ).toMatchInlineSnapshot(`
        "export enum PetType2 {
            Cat = "cat"
        }"
      `);

      // The Pet union type should use enum member references
      expect(
        findCodeSection(src, {
          matching: /^export type Pet =/,
          after: 3,
        }),
      ).toMatchInlineSnapshot(`
        "export type Pet = ({
            petType: PetType.Dog;
        } & Dog) | ({
            petType: PetType2.Cat;"
      `);
    });

    it("should use enum member union for multiple discriminator matches when useEnumType is true", async () => {
      // Create a modified allOf fixture with multiple discriminator values mapping to same schema
      const allOfFixture = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "__fixtures__", "allOf.json"),
          "utf8",
        ),
      );

      // Modify the Pet schema to have an enum discriminator
      allOfFixture.components.schemas.Pet.properties.petType = {
        type: "string",
        enum: ["dog", "poodle", "cat"],
      };

      // Keep the original mapping where both "dog" and "poodle" map to Dog
      allOfFixture.components.schemas.Pet.discriminator.mapping = {
        dog: "#/components/schemas/Dog",
        poodle: "#/components/schemas/Dog",
        cat: "#/components/schemas/Cat",
      };

      // Remove Lizard schema since it's not in our test enum
      delete allOfFixture.components.schemas.Lizard;

      const src = await generate(allOfFixture, {
        useEnumType: true,
        minify: false,
      });

      // Dog should have union of enum members for multiple matches
      expect(
        findCodeSection(src, {
          matching: "export type Dog",
          after: 4,
        }),
      ).toMatchInlineSnapshot(`
        "export type Dog = {
            petType: PetType.Dog | PetType.Poodle;
        } & PetBase & {
            bark?: string;
        };"
      `);

      // Cat should have single enum member
      expect(
        findCodeSection(src, {
          matching: "export type Cat",
          after: 4,
        }),
      ).toMatchInlineSnapshot(`
        "export type Cat = {
            petType: PetType.Cat;
        } & PetBase & {
            name?: string;
        };"
      `);
    });
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

  it("should support unknown for boolean schemas", async () => {
    const src = await generate(__dirname + "/__fixtures__/booleanSchema.json", {
      useUnknown: true,
    });
    expect(src).toContain(
      "export type BlogEntry = { id: number; title: string; content: unknown | null; };",
    );
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

  it("should create string enums with enumNames", () => {
    expect(src).toContain(
      `export enum Channel { Pending = "P", Margin = "M", Gap = "G" }`,
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
