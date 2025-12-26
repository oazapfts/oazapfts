import { factory } from "typescript";
import { OazapftsContext } from "../context";
import { isTrueEnum, resolve, toIdentifier } from "../helpers";
import * as OpenApi from "../helpers/openApi3-x";
import { getTrueEnum } from "./getTrueEnum";
import { getTypeFromEnum } from "./getTypeFromEnum";

/**
 * Get enum member reference type for discriminator values when useEnumType is enabled
 */
export function getDiscriminatorType(
  ctx: OazapftsContext,
  discriminatingSchemaRef:
    | Exclude<OpenApi.SchemaObject, boolean>
    | OpenApi.ReferenceObject,
  propertyName: string,
  matches: string[],
) {
  if (!ctx.opts.useEnumType) {
    return getTypeFromEnum(matches);
  }

  const discriminatingSchema = resolve(discriminatingSchemaRef, ctx);
  // Get the discriminator property schema to check if it should use enum types
  // Check the schema's own properties first, then search in allOf parents
  let discriminatorPropertySchema = resolve(
    discriminatingSchema.properties?.[propertyName],
    ctx,
  );

  if (!discriminatorPropertySchema && discriminatingSchema.allOf) {
    // Search in allOf parents
    for (const allOfSchema of discriminatingSchema.allOf) {
      const resolvedAllOf = resolve(allOfSchema, ctx);
      if (resolvedAllOf.properties?.[propertyName]) {
        discriminatorPropertySchema = resolve(
          resolvedAllOf.properties[propertyName],
          ctx,
        );
        break;
      }
    }
  }

  if (
    !discriminatorPropertySchema ||
    !isTrueEnum(discriminatorPropertySchema, ctx, propertyName)
  ) {
    return getTypeFromEnum(matches);
  }

  const enumTypeRef = getTrueEnum(
    discriminatorPropertySchema,
    propertyName,
    ctx,
  );

  const memberTypes = matches.map((value) => {
    return factory.createTypeReferenceNode(
      factory.createQualifiedName(
        enumTypeRef.typeName,
        factory.createIdentifier(toIdentifier(value, true)),
      ),
    );
  });

  return memberTypes.length === 1
    ? memberTypes[0]
    : factory.createUnionTypeNode(memberTypes);
}
