import { describe, expect, it } from "vitest";
import { createContext } from "../context";
import { preprocessComponents } from "./preprocessComponents";
import type { Document } from "../helpers/openApi3-x";
import type * as OpenApi from "../helpers/openApi3-x";

function minimalSpec(overrides: Partial<Document> = {}): Document {
  return {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: {},
    ...overrides,
  } as Document;
}

function schemasSpec(schemas: Record<string, unknown>) {
  return minimalSpec({ components: { schemas } } as unknown as Document);
}

describe("preprocessComponents", () => {
  it("returns early when no component schemas exist", () => {
    const ctx = createContext(minimalSpec());

    expect(() => preprocessComponents(ctx)).not.toThrow();
    expect(ctx.discriminatingSchemas.size).toBe(0);
  });

  it("records only discriminating schemas (excluding oneOf/anyOf, refs, and booleans)", () => {
    const spec = schemasSpec({
      Animal: {
        type: "object",
        discriminator: { propertyName: "kind" },
      },
      UnionByOneOf: {
        type: "object",
        discriminator: { propertyName: "kind" },
        oneOf: [],
      },
      UnionByAnyOf: {
        type: "object",
        discriminator: { propertyName: "kind" },
        anyOf: [],
      },
      AnimalRef: { $ref: "#/components/schemas/Animal" },
      FeatureFlag: true,
    });
    const ctx = createContext(spec);

    preprocessComponents(ctx);

    expect(ctx.discriminatingSchemas.size).toBe(1);
    expect(
      ctx.discriminatingSchemas.has(
        ctx.spec.components!.schemas!.Animal as OpenApi.SchemaObject,
      ),
    ).toBe(true);
  });

  it("adds explicit mapping entries for schemas extending discriminating schemas via allOf", () => {
    const spec = schemasSpec({
      Animal: {
        type: "object",
        discriminator: { propertyName: "kind" },
      },
      Cat: {
        allOf: [
          { $ref: "#/components/schemas/Animal" },
          { type: "object", properties: { paws: { type: "number" } } },
        ],
      },
      Dog: {
        allOf: [
          { $ref: "#/components/schemas/Animal" },
          { type: "object", properties: { bark: { type: "string" } } },
        ],
      },
    });
    const ctx = createContext(spec);

    preprocessComponents(ctx);

    const animal = ctx.spec.components!.schemas!
      .Animal as OpenApi.UNSTABLE_DiscriminatingSchemaObject;
    expect(animal.discriminator?.mapping).toEqual({
      Cat: "#/components/schemas/Cat",
      Dog: "#/components/schemas/Dog",
    });
  });

  it("keeps already-explicit mappings and only adds missing ones", () => {
    const spec = schemasSpec({
      Animal: {
        type: "object",
        discriminator: {
          propertyName: "kind",
          mapping: {
            feline: "#/components/schemas/Cat",
          },
        },
      },
      Cat: {
        allOf: [{ $ref: "#/components/schemas/Animal" }],
      },
      Dog: {
        allOf: [{ $ref: "#/components/schemas/Animal" }],
      },
    });
    const ctx = createContext(spec);

    preprocessComponents(ctx);

    const mapping = (
      ctx.spec.components!.schemas!
        .Animal as OpenApi.UNSTABLE_DiscriminatingSchemaObject
    ).discriminator.mapping;
    expect(mapping).toEqual({
      feline: "#/components/schemas/Cat",
      Dog: "#/components/schemas/Dog",
    });
    expect(mapping).not.toHaveProperty("Cat");
  });

  it("throws on unexpected nested references when a discriminating schema resolves to a ref", () => {
    const spec = schemasSpec({
      BaseAnimal: {
        type: "object",
        discriminator: { propertyName: "kind" },
      },
      Animal: { $ref: "#/components/schemas/BaseAnimal" },
      Kitten: {
        allOf: [{ $ref: "#/components/schemas/Animal" }],
      },
    });
    const ctx = createContext(spec);
    // Simulate a pre-marked discriminating schema that still resolves to a ref.
    // This exercises the defensive guard branch.
    ctx.discriminatingSchemas.add(
      ctx.spec.components!.schemas!.Animal as unknown as OpenApi.SchemaObject,
    );

    expect(() => preprocessComponents(ctx)).toThrow(
      "Unexpected nested reference",
    );
  });

  it("only maps direct allOf references to discriminating schemas", () => {
    const spec = schemasSpec({
      Animal: {
        type: "object",
        discriminator: { propertyName: "kind" },
      },
      Bird: {
        allOf: [{ $ref: "#/components/schemas/Animal" }],
      },
      Eagle: {
        allOf: [{ $ref: "#/components/schemas/Bird" }],
      },
    });
    const ctx = createContext(spec);

    preprocessComponents(ctx);

    const mapping = (
      ctx.spec.components!.schemas!
        .Animal as OpenApi.UNSTABLE_DiscriminatingSchemaObject
    ).discriminator.mapping;
    expect(mapping).toEqual({
      Bird: "#/components/schemas/Bird",
    });
    expect(mapping).not.toHaveProperty("Eagle");
  });
});
