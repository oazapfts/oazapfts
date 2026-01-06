import ts from "typescript";
import * as cg from "./tscodegen";

export function setDefaultBaseUrl(
  defaults: ts.VariableDeclaration,
  baseUrl: string,
) {
  if (
    !defaults.initializer ||
    !ts.isObjectLiteralExpression(defaults.initializer)
  ) {
    throw new Error("No object literal: defaults");
  }

  return cg.updateVariableDeclaration(defaults, {
    initializer: ts.factory.createObjectLiteralExpression([
      // remove baseUrl if it exists
      ...defaults.initializer.properties.filter(
        (p) =>
          !ts.isPropertyAssignment(p) ||
          !ts.isIdentifier(p.name) ||
          p.name.text !== "baseUrl",
      ),

      ts.factory.createPropertyAssignment(
        "baseUrl",
        ts.factory.createStringLiteral(baseUrl),
      ),
    ]),
  });
}
