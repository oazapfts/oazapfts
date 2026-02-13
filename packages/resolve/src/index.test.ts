import { describe, expect, it } from "vitest";
import {
  createResolver,
  Document,
  getRefBasename,
  getRefName,
  getReferenceName,
  isReference,
  resolve,
  resolveArray,
} from "./index";

function minimalSpec(overrides: Partial<Document> = {}): Document {
  return {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

describe("@oazapfts/resolve public API", () => {
  it("resolves escaped local references and decodes URI segments", () => {
    const schemaWithSlash = { type: "string" as const, enum: ["ok"] };
    const schemaWithTilde = { type: "number" as const };
    const schemaWithEncodedSpace = { type: "boolean" as const };
    const spec = minimalSpec({
      components: {
        schemas: {
          "pet/name": schemaWithSlash,
          "meta~data": schemaWithTilde,
          "space name": schemaWithEncodedSpace,
        },
      },
    });

    const ctx = { spec };

    expect(resolve({ $ref: "#/components/schemas/pet~1name" }, ctx)).toBe(
      schemaWithSlash,
    );
    expect(resolve({ $ref: "#/components/schemas/meta~0data" }, ctx)).toBe(
      schemaWithTilde,
    );
    expect(resolve({ $ref: "#/components/schemas/space%20name" }, ctx)).toBe(
      schemaWithEncodedSpace,
    );
  });

  it("createResolver and resolveArray share the same reference resolution behavior", () => {
    const first = { type: "object" as const, required: ["id"] };
    const second = {
      type: "array" as const,
      items: { type: "string" as const },
    };
    const passthrough = { type: "integer" };
    const spec = minimalSpec({
      components: {
        schemas: {
          First: first,
          Second: second,
        },
      },
    });

    const byResolver = createResolver(spec);

    const resolvedSingle = byResolver({ $ref: "#/components/schemas/First" });
    const resolvedArray = resolveArray({ spec }, [
      { $ref: "#/components/schemas/First" },
      passthrough,
      { $ref: "#/components/schemas/Second" },
    ]);

    expect(resolvedSingle).toBe(first);
    expect(resolvedArray).toEqual([first, passthrough, second]);
    expect(resolveArray({ spec })).toEqual([]);
  });

  it("throws a clear error for unsupported or missing references", () => {
    const spec = minimalSpec({
      components: {
        schemas: {
          Existing: { type: "string" },
        },
      },
    });

    expect(() =>
      resolve({ $ref: "#/components/schemas/Missing" }, { spec }),
    ).toThrowError("Can't find components,schemas,Missing");
    expect(() =>
      resolve(
        { $ref: "https://example.com/openapi.yml#/components/schemas/X" },
        { spec },
      ),
    ).toThrowError("External refs are not supported");
  });

  it("isReference acts as a narrow guard and resolve is a pass-through for plain objects", () => {
    const notARef = { type: "string", $id: "abc" };
    const spec = minimalSpec({ components: { schemas: {} } });

    expect(isReference(null)).toBe(false);
    expect(isReference("not-an-object")).toBe(false);
    expect(isReference({ type: "string" })).toBe(false);
    expect(isReference({ $ref: "#/components/schemas/Pet" })).toBe(true);

    const resolved = resolve(notARef, { spec });
    expect(resolved).toBe(notARef);
  });

  it("getRefBasename extracts the last segment for local and URL refs", () => {
    expect(getRefBasename("#/components/schemas/Pet")).toBe("Pet");
    expect(
      getRefBasename("https://example.com/openapi.yml#/components/schemas/Pet"),
    ).toBe("Pet");
    expect(getRefBasename("urn:example:schemas/Pet")).toBe("Pet");
  });

  it("getRefName prefers basename unless numeric, then uses decoded full path", () => {
    expect(getRefName("#/components/schemas/Pet")).toBe("Pet");
    expect(getRefName("#/components/schemas/space%20name")).toBe(
      "space%20name",
    );

    // Numeric basenames become a stable full-path identifier.
    expect(getRefName("#/components/schemas/123Pet")).toBe(
      "components_schemas_123Pet",
    );
    expect(getRefName("#/components/schemas/123~1Pet")).toBe(
      "components_schemas_123/Pet",
    );
  });

  it("getReferenceName returns basename for references and undefined otherwise", () => {
    expect(getReferenceName({ $ref: "#/components/schemas/Pet" })).toBe("Pet");
    expect(
      getReferenceName({
        $ref: "https://example.com/openapi.yml#/components/schemas/space%20name",
      }),
    ).toBe("space%20name");

    expect(getReferenceName({ type: "string" })).toBeUndefined();
    expect(getReferenceName(null)).toBeUndefined();
  });
});
