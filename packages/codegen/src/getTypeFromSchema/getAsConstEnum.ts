import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../context";
import { SchemaObject } from "../helpers/openApi3-x";
import * as cg from "../generate/tscodegen";
import * as h from "../helpers";
import { getEnumUniqueAlias } from "../helpers/getEnumUniqueAlias";
import { getCustomNames } from "../helpers/getCustomNames";

/**
 * Creates an `as const` object declaration with a companion type alias.
 *
 * Generates:
 * ```
 * export const Name = { A: 'a', B: 'b' } as const;
 * export type Name = (typeof Name)[keyof typeof Name];
 * ```
 */
export function getAsConstEnum(
  schema: SchemaObject,
  propName: string,
  ctx: OazapftsContext,
) {
  if (typeof schema === "boolean") {
    throw new Error(
      "cannot get enum from boolean schema. schema must be an object",
    );
  }

  const baseName = schema.title || _.upperFirst(propName);
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

  const properties = values.map((s, index) => {
    if (
      schema.type === "number" ||
      schema.type === "integer" ||
      schema.type === "string"
    ) {
      const memberName = names ? names[index] : String(s);
      return ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(h.toIdentifier(memberName, true)),
        cg.createLiteral(s),
      );
    }
    return ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier(h.toIdentifier(String(s), true)),
      cg.createLiteral(s),
    );
  });

  // export const Name = { ... } as const;
  const constStatement = ts.factory.createVariableStatement(
    [cg.modifier.export],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          name,
          undefined,
          undefined,
          ts.factory.createAsExpression(
            ts.factory.createObjectLiteralExpression(properties, true),
            ts.factory.createTypeReferenceNode("const"),
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

  // export type Name = (typeof Name)[keyof typeof Name];
  const typeStatement = cg.createTypeAliasDeclaration({
    modifiers: [cg.modifier.export],
    name,
    type: ts.factory.createIndexedAccessTypeNode(
      ts.factory.createParenthesizedType(
        ts.factory.createTypeQueryNode(ts.factory.createIdentifier(name)),
      ),
      ts.factory.createTypeOperatorNode(
        ts.SyntaxKind.KeyOfKeyword,
        ts.factory.createTypeQueryNode(ts.factory.createIdentifier(name)),
      ),
    ),
  });

  ctx.enumAliases.push(constStatement, typeStatement);

  const type = ts.factory.createTypeReferenceNode(name, undefined);

  ctx.enumRefs[proposedName] = {
    values: stringEnumValue,
    type,
  };

  return type;
}
