import ts from "typescript";
import type { ServerDefinition } from "../context";
import * as h from "../helpers";

/** Creates: export const servers = { server1: "url1", server2: "url2", ... }; */
export function createServersStatement(
  servers: ServerDefinition[],
): ts.VariableStatement {
  const properties = servers.map((server, i) => {
    const name = server.description
      ? h.toIdentifier(server.description)
      : `server${i + 1}`;
    return ts.factory.createPropertyAssignment(
      name,
      ts.factory.createStringLiteral(server.url),
    );
  });

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          "servers",
          undefined,
          undefined,
          ts.factory.createObjectLiteralExpression(properties, true),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
}
