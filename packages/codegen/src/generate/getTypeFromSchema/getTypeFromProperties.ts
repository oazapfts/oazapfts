import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../../context";
import { ReferenceObject, SchemaObject } from "../../helpers/openApi3-x";
import * as cg from "../tscodegen";
import { checkSchemaOnlyMode } from "../../helpers";
import { getTypeFromSchema } from "./getTypeFromSchema";
import { getEmptySchemaType } from "../../helpers/emptySchemaType";

/**
 * Recursively creates a type literal with the given props.
 */
export function getTypeFromProperties(
  props: {
    [prop: string]: SchemaObject | ReferenceObject;
  },
  ctx: OazapftsContext,
  required?: string[],
  additionalProperties?: boolean | SchemaObject | ReferenceObject,
): ts.TypeLiteralNode {
  const currentMode = ctx.mode;

  // Check if any of the props are readOnly or writeOnly schemas
  const propertyNames = Object.keys(props);
  const filteredPropertyNames = propertyNames.filter((name) => {
    const schema = props[name];
    const { readOnly, writeOnly } = checkSchemaOnlyMode(schema, ctx, false);

    switch (currentMode) {
      case "readOnly":
        return readOnly || !writeOnly;
      case "writeOnly":
        return writeOnly || !readOnly;
      default:
        return !readOnly && !writeOnly;
    }
  });

  const members: ts.TypeElement[] = filteredPropertyNames.map((name) => {
    const schema = props[name];
    const isRequired = required && required.includes(name);
    let type = getTypeFromSchema(ctx, schema, name);
    if (!isRequired && ctx.opts.unionUndefined) {
      type = ts.factory.createUnionTypeNode([type, cg.keywordType.undefined]);
    }

    const signature = cg.createPropertySignature({
      questionToken: !isRequired,
      name,
      type,
    });

    if (
      typeof schema !== "boolean" &&
      "description" in schema &&
      schema.description
    ) {
      // Escape any JSDoc comment closing tags in description
      const description = schema.description.replace("*/", "*\\/");

      ts.addSyntheticLeadingComment(
        signature,
        ts.SyntaxKind.MultiLineCommentTrivia,
        // Ensures it is formatted like a JSDoc comment: /** description here */
        `* ${description} `,
        true,
      );
    }

    return signature;
  });
  if (additionalProperties) {
    const type =
      additionalProperties === true
        ? getEmptySchemaType(ctx)
        : getTypeFromSchema(ctx, additionalProperties);

    members.push(
      cg.createIndexSignature(getIndexSignatureType(type, members, ctx)),
    );
  }
  return ts.factory.createTypeLiteralNode(members);
}

/**
 * Named properties are not constrained by `additionalProperties`, but
 * TypeScript requires every property to be assignable to the index signature.
 * Adds the property types (and `undefined` for optional ones) to the index type.
 * `any` properties are skipped: they are already assignable and would erase it.
 */
function getIndexSignatureType(
  type: ts.TypeNode,
  members: ts.TypeElement[],
  ctx: OazapftsContext,
) {
  const constituents = getUnionConstituents(type);
  if (
    constituents.some(
      (t) =>
        t.kind === ts.SyntaxKind.AnyKeyword ||
        t.kind === ts.SyntaxKind.UnknownKeyword,
    )
  ) {
    return type;
  }

  const properties = members
    .filter(ts.isPropertySignature)
    .map((member) => ({
      member,
      types: member.type ? getUnionConstituents(member.type) : [],
    }))
    .filter(({ types }) => !types.some((t) => isAnyType(t, ctx)));
  const memberTypes = properties.flatMap(({ types }) => types);
  if (properties.some(({ member }) => member.questionToken)) {
    memberTypes.push(cg.keywordType.undefined);
  }
  const missingTypes = _.differenceBy(
    _.uniqBy(memberTypes, cg.printNode),
    constituents,
    cg.printNode,
  );

  return missingTypes.length
    ? ts.factory.createUnionTypeNode([...constituents, ...missingTypes])
    : type;
}

/**
 * Whether the type is `any`, directly or through a generated alias such as
 * `type AnyValue = any` for a `$ref` to an empty schema.
 */
function isAnyType(
  type: ts.TypeNode,
  ctx: OazapftsContext,
  seen = new Set<string>(),
): boolean {
  if (type.kind === ts.SyntaxKind.AnyKeyword) return true;
  if (!ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) {
    return false;
  }
  const name = type.typeName.text;
  if (seen.has(name)) return false;
  seen.add(name);
  const alias = ctx.aliases.find(
    (a): a is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(a) && a.name.text === name,
  );
  return (
    !!alias &&
    getUnionConstituents(alias.type).some((t) => isAnyType(t, ctx, seen))
  );
}

function getUnionConstituents(type: ts.TypeNode): ts.TypeNode[] {
  if (ts.isParenthesizedTypeNode(type)) return getUnionConstituents(type.type);
  return ts.isUnionTypeNode(type)
    ? type.types.flatMap(getUnionConstituents)
    : [type];
}
