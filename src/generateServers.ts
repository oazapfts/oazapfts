import _ from 'lodash';
import * as oapi from "@loopback/openapi-v3-types";
import * as cg from "./tscodegen";
import ts, { TypeNode, TemplateLiteral } from "typescript";

function createLiteral(v: string | boolean | number) {
  switch (typeof v) {
    case 'string':
      return ts.createStringLiteral(v);
    case 'boolean':
      return v ? ts.createTrue() : ts.createFalse();
    case 'number':
      return ts.createNumericLiteral(String(v));
  }
}

function createUnion(strs: (string | boolean | number)[]): TypeNode[] {
  return strs.map((e): TypeNode => {
    return ts.createLiteralTypeNode(createLiteral(e));
  });
}

function createTemplate(server: oapi.ServerObject): TemplateLiteral {
  const tokens = server.url.split(/{([\s\S]+?)}/g);
  const chunks = _.chunk(tokens.slice(1), 2);
  return ts.createTemplateExpression(
    ts.createTemplateHead(tokens[0]),
    [...chunks.map(([expression, literal], i) => {
      return ts.createTemplateSpan(
        ts.createIdentifier(expression),
        (i === chunks.length -1 ? ts.createTemplateTail : ts.createTemplateMiddle)(literal)
      )
    })]
  )
}

export default function generateServers(servers: oapi.ServerObject[]) {
  return servers.map((server, i) => {
    const name: string = server.description ?
      _.upperFirst(_.camelCase(`${server.description.replace(/\W+/, ' ')} Server`)) :
      `Server${i === 0 ? '' : String(i + 1)}`;

    return cg.createClassDeclaration({
      name,
      modifiers: [cg.modifier.export],
      members: [
        ts.createProperty(undefined, undefined, 'url', undefined, cg.keywordType.string, undefined),
        cg.createConstructor({
          parameters: server.variables ? [cg.createParameter(
            cg.createObjectBinding(Object.entries((server.variables || {})).map(
              ([name, value]) => {
                return {
                  name,
                  initializer: createLiteral(value.default)
                }
              }
            )),
            {
              type: ts.createTypeLiteralNode(Object.entries((server.variables || {})).map(
                ([name, value]) => {
                  return cg.createPropertySignature({
                    name,
                    type: value.enum ?
                      ts.createUnionTypeNode(createUnion(value.enum)) :
                      ts.createUnionTypeNode([
                        cg.keywordType.string,
                        cg.keywordType.number,
                        cg.keywordType.boolean
                      ])
                  });
                }
              ))
            }
          )] : [],        
          body: cg.block(
            ts.createExpressionStatement(
              ts.createBinary(
                ts.createPropertyAccess(
                  ts.createThis(),
                  ts.createIdentifier('url')
                ),
                ts.SyntaxKind.EqualsToken,
                server.variables ? createTemplate(server) : ts.createStringLiteral(server.url)
              )
            )
          )
        })
      ]
    })
  });
}
