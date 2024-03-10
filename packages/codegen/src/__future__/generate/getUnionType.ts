import ts from "typescript";
import { OazapftsContext, OnlyMode } from "../../context";
import * as OpenApi from "../../openApi3-x";
import { isReference, getRefBasename } from "../helpers";
import { createPropertySignature } from "../../tscodegen";
import { getTypeFromSchema } from "./getTypeForSchema";

export function getUnionType(
  variants: (OpenApi.ReferenceObject | OpenApi.SchemaObject)[],
  ctx: OazapftsContext,
  discriminator?: OpenApi.DiscriminatorObject,
  onlyMode?: OnlyMode,
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
            .map((schema) => [
              getRefBasename((schema as OpenApi.ReferenceObject).$ref),
              schema,
            ]),
        ] as [string, OpenApi.ReferenceObject][]
      ).map(([discriminatorValue, variant]) =>
        // Yields: { [discriminator.propertyName]: discriminatorValue } & variant
        ts.factory.createIntersectionTypeNode([
          ts.factory.createTypeLiteralNode([
            createPropertySignature({
              name: discriminator.propertyName,
              type: ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(discriminatorValue),
              ),
            }),
          ]),
          getTypeFromSchema(ctx, variant, undefined, onlyMode),
        ]),
      ),
    );
  } else {
    // oneOf -> untagged union
    return ts.factory.createUnionTypeNode(
      variants.map((schema) =>
        getTypeFromSchema(ctx, schema, undefined, onlyMode),
      ),
    );
  }
}
