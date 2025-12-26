import ts from "typescript";
import { createCall } from "../generate/tscodegen";

/**
 * Create a call expression for one of the oazapfts runtime functions.
 */
export function callOazapftsFunction(
  name: string,
  args: ts.Expression[],
  typeArgs?: ts.TypeNode[],
) {
  return createCall(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("oazapfts"),
      name,
    ),
    { args, typeArgs },
  );
}
