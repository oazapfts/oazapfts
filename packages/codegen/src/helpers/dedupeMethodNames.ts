import ts from "typescript";
import * as cg from "../tscodegen";

/**
 * According to OAS, the operationId must be unique. However, it is quite common
 * that this is not the case. So we'll gracefully handle this by appending a
 * counter to the method name.
 */
export function dedupeMethodNames(methods: ts.FunctionDeclaration[]) {
  const methodNames: Record<string, number> = {};

  return methods.map((method) => {
    const name = method.name?.text;
    if (name) {
      if (methodNames[name]) {
        return cg.updateFunctionDeclaration(method, {
          name: ts.factory.createIdentifier(`${name}${++methodNames[name]}`),
        });
      }

      methodNames[name] = 1;
    }

    return method;
  });
}
