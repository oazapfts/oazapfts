import ts from "typescript";
import { toIdentifier } from "./toIdentifier";
import { createCall, createTemplateString } from "../../tscodegen";

/**
 * Create a template string literal from the given OpenAPI urlTemplate.
 * Curly braces in the path are turned into identifier expressions,
 * which are read from the local scope during runtime.
 */
export function createUrlExpression(path: string, qs?: ts.Expression) {
  const spans: Array<{ expression: ts.Expression; literal: string }> = [];
  // Use a replacer function to collect spans as a side effect:
  const head = path.replace(
    /(.*?)\{(.+?)\}(.*?)(?=\{|$)/g,
    (_substr, head, name, literal) => {
      const expression = toIdentifier(name);
      spans.push({
        expression: createCall(
          ts.factory.createIdentifier("encodeURIComponent"),
          {
            args: [ts.factory.createIdentifier(expression)],
          },
        ),
        literal,
      });
      return head;
    },
  );

  if (qs) {
    // add the query string as last span
    spans.push({ expression: qs, literal: "" });
  }
  return createTemplateString(head, spans);
}
