import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../context";
import { SchemaObject } from "../helpers/openApi3-x";
import * as cg from "../generate/tscodegen";
import * as h from "../helpers";
import { getEnumUniqueAlias } from "../helpers/getEnumUniqueAlias";
import { getCustomNames } from "../helpers/getCustomNames";

/**
 * Creates a enum "ref" if not used, reuse existing if values and name matches or creates a new one
 * with a new name adding a number
 */
export function getTrueEnum(
  schema: SchemaObject,
  propName: string,
  ctx: OazapftsContext,
) {
  if (typeof schema === "boolean") {
    // this should never be thrown, since `getTrueEnum` calls are
    // behind an `isNamedEnumSchema` check, which returns false for boolean schemas.
    throw new Error(
      "cannot get enum from boolean schema. schema must be an object",
    );
  }
  const baseName = schema.title || _.upperFirst(propName);
  // TODO: use _.camelCase in future major version
  // (currently we allow _ and $ for backwards compatibility)
  const proposedName = baseName
    .split(/[^A-Za-z0-9$_]/g)
    .map((n) => _.upperFirst(n))
    .join("");
  const stringEnumValue = (schema.enum ?? []).join("_");

  const name = getEnumUniqueAlias(proposedName, stringEnumValue, ctx);

  if (ctx.enumRefs[proposedName] && proposedName === name) {
    return ctx.enumRefs[proposedName].type;
  }

  const values = schema.enum ? schema.enum : [];

  const names = getCustomNames(schema, values);

  const members = values.map((s, index) => {
    if (
      schema.type === "number" ||
      schema.type === "integer" ||
      schema.type === "string"
    ) {
      const name = names ? names[index] : String(s);
      return ts.factory.createEnumMember(
        ts.factory.createIdentifier(h.toIdentifier(name, true)),
        cg.createLiteral(s),
      );
    }
    return ts.factory.createEnumMember(
      ts.factory.createIdentifier(h.toIdentifier(String(s), true)),
      cg.createLiteral(s),
    );
  });
  ctx.enumAliases.push(
    ts.factory.createEnumDeclaration([cg.modifier.export], name, members),
  );

  const type = ts.factory.createTypeReferenceNode(name, undefined);

  ctx.enumRefs[proposedName] = {
    values: stringEnumValue,
    type: ts.factory.createTypeReferenceNode(name, undefined),
  };

  return type;
}
