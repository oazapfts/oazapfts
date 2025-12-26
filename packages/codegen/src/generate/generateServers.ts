import _ from "lodash";
import * as cg from "./tscodegen";
import ts from "typescript";
import { OpenAPIV3 } from "openapi-types";
import { ServerObject } from "../helpers/openApi3-x";

const factory = ts.factory;

function createTemplate(url: string) {
  const tokens = url.split(/{([\s\S]+?)}/g);
  const chunks = _.chunk(tokens.slice(1), 2);
  return cg.createTemplateString(
    tokens[0],
    chunks.map(([expression, literal]) => ({
      expression: factory.createIdentifier(expression),
      literal,
    })),
  );
}

function createServerFunction(
  template: string,
  vars: Record<string, OpenAPIV3.ServerVariableObject>,
) {
  const params = [
    cg.createParameter(
      cg.createObjectBinding(
        Object.entries(vars || {}).map(([name, value]) => {
          return {
            name,
            initializer: cg.createLiteral(value.default),
          };
        }),
      ),
      {
        type: factory.createTypeLiteralNode(
          Object.entries(vars || {}).map(([name, value]) => {
            return cg.createPropertySignature({
              name,
              type: value.enum
                ? cg.createEnumTypeNode(value.enum)
                : factory.createUnionTypeNode([
                    cg.keywordType.string,
                    cg.keywordType.number,
                    cg.keywordType.boolean,
                  ]),
            });
          }),
        ),
      },
    ),
  ];

  return cg.createArrowFunction(params, createTemplate(template));
}

function generateServerExpression(server: ServerObject) {
  return server.variables
    ? createServerFunction(server.url, server.variables)
    : factory.createStringLiteral(server.url);
}

function defaultUrl(server?: ServerObject) {
  if (!server) return "/";
  const { url, variables } = server;
  if (!variables) return url;
  return url.replace(/\{(.+?)\}/g, (m, name) =>
    variables[name] ? String(variables[name].default) : m,
  );
}

export function defaultBaseUrl(servers?: ServerObject[]) {
  return defaultUrl(servers?.[0]);
}

function serverName(server: ServerObject, index: number) {
  return server.description
    ? _.camelCase(server.description.replace(/\W+/, " "))
    : `server${index + 1}`;
}

export function generateServers(servers: ServerObject[]) {
  return cg.createObjectLiteral(
    servers.map((server, i) => [
      serverName(server, i),
      generateServerExpression(server),
    ]),
  );
}

export function createServersStatement(servers: ServerObject[]) {
  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          "servers",
          undefined,
          undefined,
          generateServers(servers),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
}
