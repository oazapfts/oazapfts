import ts, { factory } from "typescript";
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
import { getEmptySchemaType } from "../helpers/emptySchemaType";
import { getDiscriminatorType } from "./getDiscriminatorType";

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
  if (schema === undefined) return getEmptySchemaType(ctx);
  if (h.isReference(schema)) {
    return getRefAlias(schema, ctx, onlyMode) as ts.TypeReferenceNode;
  }

  if (schema === true) {
    return getEmptySchemaType(ctx);
  }

  if (schema === false) {
    return cg.keywordType.never;
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
  if (schema.discriminator?.mapping) {
    // discriminating schema -> union
    const mapping = schema.discriminator.mapping;
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
        ctx.discriminatingSchemas.has(
          h.resolve(childSchema, ctx) as OpenApi.SchemaObject,
        )
      ) {
        const discriminatingSchema =
          h.resolve<OpenApi.DiscriminatingSchemaObject>(childSchema, ctx);
        const discriminator = discriminatingSchema.discriminator;

        const matches = Object.entries(discriminator.mapping ?? {})
          .filter(([, ref]) => h.resolve({ $ref: ref }, ctx) === schema)
          .map(([discriminatorValue]) => discriminatorValue);
        if (matches.length > 0) {
          types.push(
            ts.factory.createTypeLiteralNode([
              cg.createPropertySignature({
                name: discriminator.propertyName,
                type: getDiscriminatorType(
                  ctx,
                  childSchema,
                  discriminator.propertyName,
                  matches,
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
        types.push(
          getTypeFromSchema(
            ctx,
            {
              required: schema.required,
              ...childSchema,
            },
            undefined,
            onlyMode,
          ),
        );
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
  // Union types defined by an array in schema.type
  if (Array.isArray(schema.type)) {
    return factory.createUnionTypeNode(
      schema.type.map((type) => {
        const subSchema = { ...schema, type } as Exclude<
          OpenApi.SchemaObject,
          boolean
        >;
        // Remove items if the type isn't array since it's not relevant
        if ("items" in subSchema && type !== "array") {
          delete subSchema.items;
        }
        if ("properties" in subSchema && type !== "object") {
          delete subSchema.properties;
        }

        return getBaseTypeFromSchema(ctx, subSchema, name, onlyMode);
      }),
    );
  }
  if ("items" in schema) {
    const schemaItems = schema.items;

    // items -> array of enums or unions
    if (schemaItems && !h.isReference(schemaItems) && schemaItems.enum) {
      const enumType = h.isTrueEnum(schemaItems, ctx, name)
        ? getTrueEnum(schemaItems, name, ctx)
        : cg.createEnumTypeNode(schemaItems.enum);

      return factory.createArrayTypeNode(enumType);
    }

    // items -> array
    return ts.factory.createArrayTypeNode(
      getTypeFromSchema(ctx, schema.items, undefined, onlyMode),
    );
  }
  if ("prefixItems" in schema && Array.isArray(schema.prefixItems)) {
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
  if ("const" in schema && schema.const) {
    return getTypeFromEnum([schema.const]);
  }
  if (schema.type !== undefined) {
    if (schema.type === null) return cg.keywordType.null;
    if (isKeyOfKeywordType(schema.type)) return cg.keywordType[schema.type];
  }

  return getEmptySchemaType(ctx);
}

function isKeyOfKeywordType(key: string): key is keyof typeof cg.keywordType {
  return key in cg.keywordType;
}
