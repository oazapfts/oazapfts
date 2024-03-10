import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../../context";
import { SchemaObject } from "../../openApi3-x";
import * as cg from "../../tscodegen";
import * as h from "../helpers";

/*
    Creates a enum "ref" if not used, reuse existing if values and name matches or creates a new one
    with a new name adding a number
  */
export function getTrueEnum(
  schema: SchemaObject,
  propName: string,
  ctx: OazapftsContext,
) {
  const baseName = schema.title || _.upperFirst(propName);
  // TODO: use _.camelCase in future major version
  // (currently we allow _ and $ for backwards compatibility)
  const proposedName = baseName
    .split(/[^A-Za-z0-9$_]/g)
    .map((n) => _.upperFirst(n))
    .join("");
  const stringEnumValue = getEnumValuesString(schema.enum ? schema.enum : []);

  const name = getEnumUniqueAlias(proposedName, stringEnumValue, ctx);

  if (ctx.enumRefs[proposedName] && proposedName === name) {
    return ctx.enumRefs[proposedName].type;
  }

  const values = schema.enum ? schema.enum : [];

  const names = schema["x-enumNames"] ?? schema["x-enum-varnames"];
  if (names) {
    if (!Array.isArray(names)) {
      throw new Error("enum names must be an array");
    }
    if (names.length !== values.length) {
      throw new Error("enum names must have the same length as enum values");
    }
  }

  const members = values.map((s, index) => {
    if (schema.type === "number" || schema.type === "integer") {
      const name = names ? names[index] : String(s);
      return ts.factory.createEnumMember(
        ts.factory.createIdentifier(h.toIdentifier(name, true)),
        ts.factory.createNumericLiteral(s),
      );
    }
    return ts.factory.createEnumMember(
      ts.factory.createIdentifier(h.toIdentifier(s, true)),
      ts.factory.createStringLiteral(s),
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

function getEnumValuesString(values: string[]) {
  return values.join("_");
}

function getEnumUniqueAlias(
  name: string,
  values: string,
  ctx: OazapftsContext,
) {
  // If enum name already exists and have the same values
  if (ctx.enumRefs[name] && ctx.enumRefs[name].values == values) {
    return name;
  }

  return h.getUniqueAlias(name, ctx);
}
