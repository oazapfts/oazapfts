import ts from "typescript";
import _ from "lodash";
import { isReference, resolve, getRefBasename } from "@oazapfts/resolve";
import { OazapftsContext } from "../../context";
import * as OpenApi from "../../helpers/openApi3-x";
import { createPropertySignature } from "../tscodegen";
import { getTypeFromSchema } from "./getTypeFromSchema";
import { getDiscriminatorType } from "./getDiscriminatorType";

export function getUnionType(
  variants: (OpenApi.ReferenceObject | OpenApi.SchemaObject)[],
  ctx: OazapftsContext,
  discriminator?: OpenApi.DiscriminatorObject,
) {
  if (discriminator) {
    // oneOf + discriminator -> tagged union (polymorphism)
    if (discriminator.propertyName === undefined) {
      throw new Error("Discriminators require a propertyName");
    }

    // By default, the last component of the ref name (i.e., after the last trailing slash) is
    // used as the discriminator value for each variant. This can be overridden using the
    // discriminator.mapping property.
    const mappedValues = new Set(
      Object.values(discriminator.mapping || {}).map(getRefBasename),
    );

    return ts.factory.createUnionTypeNode(
      (
        [
          ...Object.entries(discriminator.mapping || {}).map(
            ([discriminatorValue, variantRef]) => [
              discriminatorValue,
              { $ref: variantRef },
            ],
          ),
          ...variants
            .filter((variant) => {
              if (!isReference(variant)) {
                // From the Swagger spec: "When using the discriminator, inline schemas will not be
                // considered."
                throw new Error(
                  "Discriminators require references, not inline schemas",
                );
              }
              return !mappedValues.has(getRefBasename(variant.$ref));
            })
            .map((schema) => {
              const schemaBaseName = getRefBasename(
                (schema as OpenApi.ReferenceObject).$ref,
              );
              // TODO: handle boolean
              const resolvedSchema = resolve(schema, ctx) as Exclude<
                OpenApi.SchemaObject,
                boolean
              >;
              const discriminatorProperty =
                resolvedSchema.properties?.[discriminator.propertyName];
              const variantName =
                discriminatorProperty && "enum" in discriminatorProperty
                  ? discriminatorProperty?.enum?.[0]
                  : "";
              return [variantName || schemaBaseName, schema];
            }),
        ] as [string, OpenApi.ReferenceObject][]
      ).map(([discriminatorValue, variant]) =>
        // Yields: { [discriminator.propertyName]: discriminatorValue } & variant
        ts.factory.createIntersectionTypeNode([
          ts.factory.createTypeLiteralNode([
            createPropertySignature({
              name: discriminator.propertyName,
              type: getDiscriminatorType(
                ctx,
                variant,
                discriminator.propertyName,
                [discriminatorValue],
              ),
            }),
          ]),
          getTypeFromSchema(ctx, variant),
        ]),
      ),
    );
  } else {
    // oneOf -> untagged union
    return ts.factory.createUnionTypeNode(
      _.uniq(variants.map((schema) => getTypeFromSchema(ctx, schema))),
    );
  }
}
