import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../../context";
import generateServers, { defaultBaseUrl } from "../../generateServers";
import * as cg from "../../tscodegen";
import * as h from "../helpers";
import { generateClientMethod } from "./generateClientMethod";
import { setDefaultBaseUrl } from "./setDefaultBaseUrl";
import * as OpenAPI from "../../openApi3-x";

export function generateApi(ctx: OazapftsContext) {
  // TODO-HOOK(prepare): context is complete but we haven't started generating anything
  prepare(ctx);

  // TODO-HOOK(createSourceFile): create the base file that we'll be adding everything to
  const sourceTemplateFile = createSourceFile(
    __API_STUB_PLACEHOLDER__, // replaced with template/ApiStub.ts during build
    ctx,
  );

  const sourceFile = cg.transform(sourceTemplateFile, (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.name.text === "servers") {
        // TODO-HOOK(modifyServers): modify the servers variable
        return modifyServers(node, sourceTemplateFile, ctx);
      }

      if (node.name.text === "defaults") {
        // TODO-HOOK(getDefaultBaseUrl): get the default base url
        const defaultBaseUrl = getDefaultBaseUrl(ctx, sourceTemplateFile);

        const defaultsWithBaseUrl = setDefaultBaseUrl(node, defaultBaseUrl);

        // TODO-HOOK(modifyDefaults): modify the defaults variable
        return (
          modifyDefaults(defaultsWithBaseUrl, sourceTemplateFile, ctx) ||
          defaultsWithBaseUrl
        );
      }
    }
  });

  const methods = Object.entries(ctx.spec.paths || {}).flatMap(
    ([path, pathItem]) => {
      if (!pathItem) return [];

      return Object.entries(pathItem).flatMap(([verb, operation]) => {
        if (!operation) return [];
        const method = verb.toUpperCase();
        if (!h.isHttpMethod(method)) return [];

        // TODO-HOOK(generateMethod): generate the methods
        return generateMethod(
          method,
          path,
          operation as OpenAPI.OperationObject,
          pathItem,
          ctx,
          sourceFile,
        );
      });
    },
  );

  const apiSourceFile = ts.factory.updateSourceFile(sourceFile, [
    ...sourceFile.statements,
    ...[...ctx.aliases, ...h.dedupeMethodNames(methods)],
    ...ctx.enumAliases,
  ]);

  return apiSourceFile;
}

function prepare(ctx: OazapftsContext) {
  h.preprocessComponents(ctx);
}

function createSourceFile(sourceText: string, _: OazapftsContext) {
  // Parse ApiStub.ts so that we don't have to generate everything manually
  return ts.createSourceFile(
    "ApiStub.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.TS,
  );
}

function modifyServers(
  servers: ts.VariableDeclaration,
  _: ts.SourceFile,
  ctx: OazapftsContext,
) {
  return cg.updateVariableDeclaration(servers, {
    initializer: generateServers(ctx.spec.servers || []),
  });
}

function modifyDefaults(
  _: ts.VariableDeclaration,
  __: ts.SourceFile,
  ___: OazapftsContext,
): ts.VariableDeclaration | undefined {
  return;
}

function getDefaultBaseUrl(ctx: OazapftsContext, _: ts.SourceFile) {
  return defaultBaseUrl(ctx.spec.servers || []);
}

function generateMethod(
  method: h.HttpMethod,
  path: string,
  operation: OpenAPI.OperationObject,
  pathItem: OpenAPI.PathItemObject,
  ctx: OazapftsContext,
  _: ts.SourceFile,
) {
  return generateClientMethod(method, path, operation, pathItem, ctx);
}
