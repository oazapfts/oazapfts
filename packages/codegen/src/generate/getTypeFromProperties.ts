import ts from "typescript";
import { OazapftsContext, OnlyMode } from "../context";
import { ReferenceObject, SchemaObject } from "../openApi3-x";
import * as cg from "../tscodegen";
import { checkSchemaOnlyMode } from "../helpers";
import { getTypeFromSchema } from "./getTypeForSchema";
import { getEmptySchemaType } from "../helpers/emptySchemaType";

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
  onlyMode?: OnlyMode,
): ts.TypeLiteralNode {
  // Check if any of the props are readOnly or writeOnly schemas
  const propertyNames = Object.keys(props);
  const filteredPropertyNames = propertyNames.filter((name) => {
    const schema = props[name];
    const { readOnly, writeOnly } = checkSchemaOnlyMode(schema, ctx, false);

    switch (onlyMode) {
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
    let type = getTypeFromSchema(ctx, schema, name, onlyMode);
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
        : getTypeFromSchema(ctx, additionalProperties, undefined, onlyMode);

    members.push(cg.createIndexSignature(type));
  }
  return ts.factory.createTypeLiteralNode(members);
}
