import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../../context";
import generateServers, { defaultBaseUrl } from "../../generateServers";
import * as cg from "../../tscodegen";
import * as h from "../helpers";
import { generateMethods } from "./generateMethods";

export function generateApi(ctx: OazapftsContext) {
  h.preprocessComponents(ctx);

  // Parse ApiStub.ts so that we don't have to generate everything manually
  const stub = ts.createSourceFile(
    "ApiStub.ts",
    __API_STUB_PLACEHOLDER__, // replaced with ApiStub.ts during build
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS,
  );

  // ApiStub contains `const servers = {}`, find it ...
  const servers = cg.findFirstVariableDeclaration(stub.statements, "servers");
  // servers.initializer is readonly, this might break in a future TS version, but works fine for now.
  Object.assign(servers, {
    initializer: generateServers(ctx.spec.servers || []),
  });

  const { initializer } = cg.findFirstVariableDeclaration(
    stub.statements,
    "defaults",
  );
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error("No object literal: defaults");
  }

  cg.changePropertyValue(
    initializer,
    "baseUrl",
    defaultBaseUrl(ctx.spec.servers || []),
  );

  const methods = generateMethods(ctx);

  Object.assign(stub, {
    statements: cg.appendNodes(
      stub.statements,
      ...[...ctx.aliases, ...methods],
      ...ctx.enumAliases,
    ),
  });

  return stub;
}
