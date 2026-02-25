import ts from "typescript";
import _ from "lodash";
import { resolve, getRefName } from "@oazapfts/resolve";
import { OazapftsContext, OnlyMode } from "../context";
import * as cg from "./tscodegen";
import * as OpenApi from "../helpers/openApi3-x";
import * as h from "../helpers";
import { getTypeFromSchema } from "./getTypeFromSchema";

/**
 * Create a type alias for the schema referenced by the given ReferenceObject
 */
export function getRefAlias(
  obj: OpenApi.ReferenceObject,
  ctx: OazapftsContext,
  onlyMode?: OnlyMode,
  // If true, the discriminator property of the schema referenced by `obj` will be ignored.
  // This is meant to be used when getting the type of a discriminating schema in an `allOf`
  // construct.
  ignoreDiscriminator?: boolean,
) {
  const $ref = ignoreDiscriminator
    ? h.findAvailableRef(obj.$ref + "Base", ctx)
    : obj.$ref;

  if (!ctx.refs[$ref]) {
    let schema = resolve<OpenApi.SchemaObject>(obj, ctx);
    if (typeof schema !== "boolean" && ignoreDiscriminator) {
      schema = _.cloneDeep(schema);
      delete schema.discriminator;
    }
    const name =
      (typeof schema !== "boolean" && schema.title) || getRefName($ref);
    const identifier = h.toIdentifier(name, true);

    // When this is a named enum (enum or as-const) we can reference it directly,
    // no need to create a type alias
    if (
      h.getEnumStyle(ctx.opts) !== "union" &&
      h.isNamedEnumSchema(schema, name)
    ) {
      return getTypeFromSchema(ctx, schema, name);
    }

    const alias = h.getUniqueAlias(identifier, ctx);

    ctx.refs[$ref] = {
      base: ts.factory.createTypeReferenceNode(alias, undefined),
      readOnly: undefined,
      writeOnly: undefined,
    };

    const type = getTypeFromSchema(ctx, schema, undefined);
    ctx.aliases.push(
      cg.createTypeAliasDeclaration({
        modifiers: [cg.modifier.export],
        name: alias,
        type,
      }),
    );

    const { readOnly, writeOnly } = h.checkSchemaOnlyMode(schema, ctx);

    if (readOnly) {
      const readOnlyAlias = h.getUniqueAlias(
        h.toIdentifier(name, true, "readOnly"),
        ctx,
      );
      ctx.refs[$ref]["readOnly"] = ts.factory.createTypeReferenceNode(
        readOnlyAlias,
        undefined,
      );

      const readOnlyType = getTypeFromSchema(ctx, schema, name, "readOnly");
      ctx.aliases.push(
        cg.createTypeAliasDeclaration({
          modifiers: [cg.modifier.export],
          name: readOnlyAlias,
          type: readOnlyType,
        }),
      );
    }

    if (writeOnly) {
      const writeOnlyAlias = h.getUniqueAlias(
        h.toIdentifier(name, true, "writeOnly"),
        ctx,
      );
      ctx.refs[$ref]["writeOnly"] = ts.factory.createTypeReferenceNode(
        writeOnlyAlias,
        undefined,
      );
      const writeOnlyType = getTypeFromSchema(ctx, schema, name, "writeOnly");
      ctx.aliases.push(
        cg.createTypeAliasDeclaration({
          modifiers: [cg.modifier.export],
          name: writeOnlyAlias,
          type: writeOnlyType,
        }),
      );
    }
  }

  // If not ref fallback to the regular reference
  return ctx.refs[$ref][onlyMode || "base"] ?? ctx.refs[$ref].base;
}
