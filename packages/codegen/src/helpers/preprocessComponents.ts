import { OazapftsContext } from "../context";
import * as OpenApi from "./openApi3-x";
import { getRefBasename } from "./getRefBasename";
import { isReference } from "./isReference";
import { resolve } from "./resolve";

/**
 * In order to support discriminated unions.
 *
 * @see https://github.com/oazapfts/oazapfts/pull/473
 *
 * Does three things:
 * 1. Add a `x-component-ref-path` property.
 * 2. Record discriminating schemas in `this.discriminatingSchemas`. A discriminating schema
 *    refers to a schema that has a `discriminator` property which is neither used in conjunction
 *    with `oneOf` nor `anyOf`.
 * 3. Make all mappings of discriminating schemas explicit to generate types immediately.
 */
export function preprocessComponents(ctx: OazapftsContext) {
  if (!ctx.spec.components?.schemas) {
    return;
  }

  const prefix = "#/components/schemas/";
  const schemas = ctx.spec.components.schemas;

  // First scan: Add `x-component-ref-path` property and record discriminating schemas
  for (const name of Object.keys(schemas)) {
    const schema = schemas[name];
    if (isReference(schema) || typeof schema === "boolean") continue;

    if (schema.discriminator && !schema.oneOf && !schema.anyOf) {
      ctx.discriminatingSchemas.add(schema);
    }
  }

  const isExplicit = (
    discriminator: OpenApi.DiscriminatorObject,
    ref: string,
  ) => {
    const refs = Object.values(discriminator.mapping || {});
    return refs.includes(ref);
  };

  // Second scan: Make all mappings of discriminating schemas explicit
  for (const name of Object.keys(schemas)) {
    const schema = schemas[name];

    if (isReference(schema) || typeof schema === "boolean" || !schema.allOf) {
      continue;
    }

    for (const childSchema of schema.allOf) {
      if (
        !isReference(childSchema) ||
        !ctx.discriminatingSchemas.has(
          resolve<OpenApi.SchemaObject>(childSchema, ctx),
        )
      ) {
        continue;
      }

      const discriminatingSchema = schemas[
        getRefBasename(childSchema.$ref)
      ] as OpenApi.UNSTABLE_DiscriminatingSchemaObject;
      if (isReference(discriminatingSchema)) {
        throw new Error("Unexpected nested reference");
      }

      const discriminator = discriminatingSchema.discriminator!;

      if (isExplicit(discriminator, prefix + name)) continue;
      if (!discriminator.mapping) {
        discriminator.mapping = {};
      }
      discriminator.mapping[name] = prefix + name;
    }
  }
}
