import ts from "typescript";
import _ from "lodash";
import { OazapftsContext, OnlyMode } from "../context";
import * as OpenApi from "../openApi3-x";
import * as cg from "../tscodegen";
import * as h from "../helpers";
import { getRefAlias } from "./getRefAlias";
import { getUnionType } from "./getUnionType";
import { getTypeFromProperties } from "./getTypeFromProperties";
import { getTrueEnum } from "./getTrueEnum";
import { getTypeFromEnum } from "./getTypeFromEnum";

/**
 * Creates a type node from a given schema.
 * Delegates to getBaseTypeFromSchema internally and
 * optionally adds a union with null.
 */
export function getTypeFromSchema(
  ctx: OazapftsContext,
  schema?: OpenApi.SchemaObject | OpenApi.ReferenceObject,
  name?: string,
  onlyMode?: OnlyMode,
) {
  const type = getBaseTypeFromSchema(ctx, schema, name, onlyMode);
  return h.isNullable(schema)
    ? ts.factory.createUnionTypeNode([type, cg.keywordType.null])
    : type;
}

/**
 * This is the very core of the OpenAPI to TS conversion - it takes a
 * schema and returns the appropriate type.
 */
function getBaseTypeFromSchema(
  ctx: OazapftsContext,
  schema?: OpenApi.SchemaObject | OpenApi.ReferenceObject,
  name?: string,
  onlyMode?: OnlyMode,
): ts.TypeNode {
  if (!schema) return cg.keywordType.any;
  if (h.isReference(schema)) {
    return getRefAlias(schema, ctx, onlyMode) as ts.TypeReferenceNode;
  }

  if (schema.oneOf) {
    const clone = { ...schema };
    delete clone.oneOf;
    // oneOf -> union
    return getUnionType(
      schema.oneOf.map((variant) =>
        // ensure that base properties from the schema are included in the oneOf variants
        _.mergeWith({}, clone, variant, (objValue, srcValue) => {
          if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
          }
        }),
      ),
      ctx,
      schema.discriminator,
      onlyMode,
    );
  }
  if (schema.anyOf) {
    // anyOf -> union
    return getUnionType(schema.anyOf, ctx, undefined, onlyMode);
  }
  if (schema.discriminator) {
    // discriminating schema -> union
    const mapping = schema.discriminator.mapping || {};
    return getUnionType(
      Object.values(mapping).map((ref) => ({ $ref: ref })),
      ctx,
      undefined,
      onlyMode,
    );
  }
  if (schema.allOf) {
    // allOf -> intersection
    const types: ts.TypeNode[] = [];
    for (const childSchema of schema.allOf) {
      if (
        h.isReference(childSchema) &&
        ctx.discriminatingSchemas.has(childSchema.$ref)
      ) {
        const discriminatingSchema = h.resolve<OpenApi.SchemaObject>(
          childSchema,
          ctx,
        );
        const discriminator = discriminatingSchema.discriminator!;
        const matched = Object.entries(discriminator.mapping || {}).find(
          ([, ref]) => ref === schema["x-component-ref-path"],
        );
        if (matched) {
          const [discriminatorValue] = matched;
          types.push(
            ts.factory.createTypeLiteralNode([
              cg.createPropertySignature({
                name: discriminator.propertyName,
                type: ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral(discriminatorValue),
                ),
              }),
            ]),
          );
        }
        types.push(
          getRefAlias(
            childSchema,
            ctx,
            onlyMode,
            /* ignoreDiscriminator */ true,
          ),
        );
      } else {
        types.push(getTypeFromSchema(ctx, childSchema, undefined, onlyMode));
      }
    }

    if (schema.properties || schema.additionalProperties) {
      // properties -> literal type
      types.push(
        getTypeFromProperties(
          schema.properties || {},
          ctx,
          schema.required,
          schema.additionalProperties,
          onlyMode,
        ),
      );
    }
    return ts.factory.createIntersectionTypeNode(types);
  }
  if ("items" in schema) {
    // items -> array
    return ts.factory.createArrayTypeNode(
      getTypeFromSchema(ctx, schema.items, undefined, onlyMode),
    );
  }
  if ("prefixItems" in schema && schema.prefixItems) {
    // prefixItems -> typed tuple
    return ts.factory.createTupleTypeNode(
      schema.prefixItems.map((schema) => getTypeFromSchema(ctx, schema)),
    );
  }
  if (schema.properties || schema.additionalProperties) {
    // properties -> literal type
    return getTypeFromProperties(
      schema.properties || {},
      ctx,
      schema.required,
      schema.additionalProperties,
      onlyMode,
    );
  }
  if (schema.enum) {
    // enum -> enum or union
    return h.isTrueEnum(schema, ctx, name)
      ? getTrueEnum(schema, name, ctx)
      : cg.createEnumTypeNode(schema.enum);
  }
  if (schema.format == "binary") {
    return ts.factory.createTypeReferenceNode("Blob", []);
  }
  if (schema.const) {
    return getTypeFromEnum([schema.const]);
  }
  if (schema.type) {
    // string, boolean, null, number, array
    if (Array.isArray(schema.type)) {
      return ts.factory.createUnionTypeNode(
        schema.type.map((type) => {
          if (type === "null") return cg.keywordType.null;
          if (type === "integer") return cg.keywordType.number;
          if (isKeyOfKeywordType(type)) return cg.keywordType[type];

          return cg.keywordType.any;
        }),
      );
    }
    if (schema.type === "integer") return cg.keywordType.number;
    if (isKeyOfKeywordType(schema.type)) return cg.keywordType[schema.type];
    return cg.keywordType.any;
  }

  return cg.keywordType.any;
}

function isKeyOfKeywordType(key: string): key is keyof typeof cg.keywordType {
  return key in cg.keywordType;
}
