import ts from "typescript";
import type { Defaults } from "../context";

/** Creates: export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = { ... }; */
export function createDefaultsStatement(
  defaults: Defaults,
): ts.VariableStatement {
  const properties: ts.PropertyAssignment[] = [];

  // headers (always include, default to empty object)
  properties.push(
    ts.factory.createPropertyAssignment(
      "headers",
      defaults.headers
        ? ts.factory.createObjectLiteralExpression(
            Object.entries(defaults.headers)
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) =>
                ts.factory.createPropertyAssignment(
                  ts.factory.createStringLiteral(key),
                  createHeaderValueLiteral(value),
                ),
              ),
          )
        : ts.factory.createObjectLiteralExpression([]),
    ),
  );

  // baseUrl (include if defined)
  if (defaults.baseUrl !== undefined) {
    properties.push(
      ts.factory.createPropertyAssignment(
        "baseUrl",
        ts.factory.createStringLiteral(defaults.baseUrl),
      ),
    );
  }

  // fetch (expression-based: FunctionExpression, ArrowFunction, or Identifier)
  if (defaults.fetch) {
    properties.push(
      ts.factory.createPropertyAssignment("fetch", defaults.fetch),
    );
  }

  // FormData (expression-based: ClassExpression or Identifier)
  if (defaults.FormData) {
    properties.push(
      ts.factory.createPropertyAssignment("FormData", defaults.FormData),
    );
  }

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          "defaults",
          undefined,
          ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
              ts.factory.createIdentifier("Oazapfts"),
              "Defaults",
            ),
            [
              ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                  ts.factory.createIdentifier("Oazapfts"),
                  "CustomHeaders",
                ),
              ),
            ],
          ),
          ts.factory.createObjectLiteralExpression(properties, true),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
}

/** Create a literal expression for a header value (string | number | boolean | null) */
export function createHeaderValueLiteral(
  value: string | number | boolean | null | undefined,
): ts.Expression {
  if (value === null) {
    return ts.factory.createNull();
  }
  if (typeof value === "boolean") {
    return value ? ts.factory.createTrue() : ts.factory.createFalse();
  }
  if (typeof value === "number") {
    return ts.factory.createNumericLiteral(value);
  }
  return ts.factory.createStringLiteral(String(value));
}
