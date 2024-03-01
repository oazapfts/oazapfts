import { OazapftsContext } from "../../context";
import {
  OpenAPIDiscriminatorObject,
  OpenAPIReferenceObject,
  OpenAPISchemaObject,
} from "../../openApi3-x";
import { getRefBasename } from "../helpers/getRefBasename";
import { isReference } from "../helpers/isReference";

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
export function preprocessComponents({
  spec,
  discriminatingSchemas,
}: OazapftsContext) {
  if (!spec.components?.schemas) {
    return;
  }

  const prefix = "#/components/schemas/";
  const schemas: Record<string, OpenAPISchemaObject | OpenAPIReferenceObject> =
    spec.components.schemas;

  // First scan: Add `x-component-ref-path` property and record discriminating schemas
  for (const name of Object.keys(schemas)) {
    const schema = schemas[name];
    if (isReference(schema)) continue;

    schema["x-component-ref-path"] = prefix + name;

    if (schema.discriminator && !schema.oneOf && !schema.anyOf) {
      discriminatingSchemas.add(prefix + name);
    }
  }

  const isExplicit = (
    discriminator: OpenAPIDiscriminatorObject,
    ref: string,
  ) => {
    const refs = Object.values(discriminator.mapping || {});
    return refs.includes(ref);
  };

  // Second scan: Make all mappings of discriminating schemas explicit
  for (const name of Object.keys(schemas)) {
    const schema = schemas[name];

    if (isReference(schema) || !schema.allOf) continue;

    for (const childSchema of schema.allOf) {
      if (
        !isReference(childSchema) ||
        !discriminatingSchemas.has(childSchema.$ref)
      ) {
        continue;
      }

      const discriminatingSchema = schemas[getRefBasename(childSchema.$ref)];
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
