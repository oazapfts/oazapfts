import ts from "typescript";
import { createCall } from "../generate/tscodegen";

/**
 * Create a call expression for one of the QS runtime functions.
 */
export function callQsFunction(name: string, args: ts.Expression[]) {
  return createCall(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("QS"),
      name,
    ),
    { args },
  );
}
