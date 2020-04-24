import _ from "lodash";
import * as cg from "./tscodegen";
import ts, { TypeNode, TemplateLiteral } from "typescript";
import { OpenAPIV3 } from "openapi-types";

function createLiteral(v: string | boolean | number) {
  switch (typeof v) {
    case "string":
      return ts.createStringLiteral(v);
    case "boolean":
      return v ? ts.createTrue() : ts.createFalse();
    case "number":
      return ts.createNumericLiteral(String(v));
  }
}

function createUnion(strs: (string | boolean | number)[]): TypeNode[] {
  return strs.map(
    (e): TypeNode => {
      return ts.createLiteralTypeNode(createLiteral(e));
    }
  );
}

function createTemplate(url: string): TemplateLiteral {
  const tokens = url.split(/{([\s\S]+?)}/g);
  const chunks = _.chunk(tokens.slice(1), 2);
  return ts.createTemplateExpression(ts.createTemplateHead(tokens[0]), [
    ...chunks.map(([expression, literal], i) => {
      return ts.createTemplateSpan(
        ts.createIdentifier(expression),
        (i === chunks.length - 1
          ? ts.createTemplateTail
          : ts.createTemplateMiddle)(literal)
      );
    }),
  ]);
}

function createServerFunction(
  template: string,
  vars: Record<string, OpenAPIV3.ServerVariableObject>
) {
  const params = [
    cg.createParameter(
      cg.createObjectBinding(
        Object.entries(vars || {}).map(([name, value]) => {
          return {
            name,
            initializer: createLiteral(value.default),
          };
        })
      ),
      {
        type: ts.createTypeLiteralNode(
          Object.entries(vars || {}).map(([name, value]) => {
            return cg.createPropertySignature({
              name,
              type: value.enum
                ? ts.createUnionTypeNode(createUnion(value.enum))
                : ts.createUnionTypeNode([
                    cg.keywordType.string,
                    cg.keywordType.number,
                    cg.keywordType.boolean,
                  ]),
            });
          })
        ),
      }
    ),
  ];

  return cg.createArrowFunction(params, createTemplate(template));
}

function generateServerExpression(server: OpenAPIV3.ServerObject) {
  return server.variables
    ? createServerFunction(server.url, server.variables)
    : ts.createStringLiteral(server.url);
}

function defaultUrl(server?: OpenAPIV3.ServerObject) {
  if (!server) return "/";
  const { url, variables } = server;
  if (!variables) return url;
  return url.replace(/\{(.+?)\}/g, (m, name) =>
    variables[name] ? String(variables[name].default) : m
  );
}

export function defaultBaseUrl(servers: OpenAPIV3.ServerObject[]) {
  return ts.createStringLiteral(defaultUrl(servers[0]));
}

function serverName(server: OpenAPIV3.ServerObject, index: number) {
  return server.description
    ? _.camelCase(server.description.replace(/\W+/, " "))
    : `server${index + 1}`;
}

export default function generateServers(servers: OpenAPIV3.ServerObject[]) {
  const props = servers.map((server, i) => {
    return [serverName(server, i), generateServerExpression(server)] as [
      string,
      ts.Expression
    ];
  });

  return cg.createObjectLiteral(props);
}
