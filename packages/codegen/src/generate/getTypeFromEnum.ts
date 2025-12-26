import ts from "typescript";
import { keywordType } from "./tscodegen";

/**
 * Creates literal type (or union) from an array of values
 */
export function getTypeFromEnum(values: unknown[]) {
  const types = values.map((s) => {
    if (s === null) return keywordType.null;
    if (typeof s === "boolean")
      return s
        ? ts.factory.createLiteralTypeNode(
            ts.factory.createToken(ts.SyntaxKind.TrueKeyword),
          )
        : ts.factory.createLiteralTypeNode(
            ts.factory.createToken(ts.SyntaxKind.FalseKeyword),
          );
    if (typeof s === "number")
      return ts.factory.createLiteralTypeNode(
        ts.factory.createNumericLiteral(s),
      );
    if (typeof s === "string")
      return ts.factory.createLiteralTypeNode(
        ts.factory.createStringLiteral(s),
      );
    throw new Error(`Unexpected ${String(s)} of type ${typeof s} in enum`);
  });
  return types.length > 1 ? ts.factory.createUnionTypeNode(types) : types[0];
}
