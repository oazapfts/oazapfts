import ts, { factory } from "typescript";
import { OazapftsContext } from "../context";
import {
  getEnumStyle,
  isNamedEnumSchema,
  resolve,
  toIdentifier,
} from "../helpers";
import * as OpenApi from "../helpers/openApi3-x";
import { getTrueEnum } from "./getTrueEnum";
import { getAsConstEnum } from "./getAsConstEnum";
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
  const enumStyle = getEnumStyle(ctx.opts);
  if (enumStyle === "union") {
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
    !isNamedEnumSchema(discriminatorPropertySchema, propertyName)
  ) {
    return getTypeFromEnum(matches);
  }

  const enumTypeRef =
    enumStyle === "as-const"
      ? getAsConstEnum(discriminatorPropertySchema, propertyName, ctx)
      : getTrueEnum(discriminatorPropertySchema, propertyName, ctx);

  const enumName = ts.isIdentifier(enumTypeRef.typeName)
    ? (enumTypeRef.typeName.escapedText as string)
    : "";

  const memberTypes = matches.map((value) => {
    if (enumStyle === "as-const") {
      return factory.createTypeQueryNode(
        factory.createQualifiedName(
          factory.createIdentifier(enumName),
          factory.createIdentifier(toIdentifier(value, true)),
        ),
      );
    }
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
