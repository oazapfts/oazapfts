import ts from "typescript";
import { OazapftsContext } from "../context";
import * as h from "../helpers";
import { createImportStatement } from "./generateImports";
import { createDefaultsStatement } from "./createDefaultsStatement";
import * as OpenAPI from "../helpers/openApi3-x";
import type { UNSTABLE_OazapftsPluginHooks } from "../plugin";
import { createServersStatement } from "./generateServers";
import { getRefAlias } from "./getRefAlias";

export async function generateApi(
  ctx: OazapftsContext,
  hooks: UNSTABLE_OazapftsPluginHooks,
): Promise<ts.SourceFile> {
  // Preprocess components (needs mutable context)
  h.preprocessComponents(ctx);

  // Hook: prepare - allow plugins to modify spec, context, or template parts
  await hooks.prepare.promise(ctx);

  // Generate methods with hook support
  const methods: ts.FunctionDeclaration[] = [];
  for (const [path, pathItem] of Object.entries(ctx.spec.paths || {})) {
    if (!pathItem) continue;

    for (const [verb, operation] of Object.entries(pathItem)) {
      if (!operation) continue;
      const method = verb.toUpperCase();
      if (!h.isHttpMethod(method)) continue;
      const endpoint = {
        method,
        path,
        operation: operation as OpenAPI.OperationObject,
        pathItem,
      };

      // Hook: filterEndpoint - allow plugins to skip endpoint generation
      const shouldGenerate = hooks.filterEndpoint.call(true, endpoint, ctx);
      if (!shouldGenerate) continue;

      // Hook: generateMethod - first plugin returning methods wins
      const generatedMethods =
        (await hooks.generateMethod.promise(endpoint, ctx)) ?? [];
      const refinedMethods = await hooks.refineMethod.promise(
        generatedMethods,
        endpoint,
        ctx,
      );

      methods.push(...refinedMethods);
    }
  }

  if (ctx.opts.allSchemas && ctx.spec.components?.schemas) {
    for (const [name, schema] of Object.entries(ctx.spec.components.schemas)) {
      getRefAlias({ $ref: `#/components/schemas/${name}` }, ctx, schema);
    }
  }

  // Compose the final source file from template parts
  let apiSourceFile = composeSourceFile(ctx, methods);

  // Hook: astGenerated - allow plugins to modify final AST
  apiSourceFile = await hooks.astGenerated.promise(apiSourceFile, ctx);

  return apiSourceFile;
}

/**
 * Compose the final source file from all template parts and generated code.
 */
export function composeSourceFile(
  ctx: OazapftsContext,
  methods: ts.FunctionDeclaration[],
): ts.SourceFile {
  // Build statements array from flat context properties
  let statements: ts.Statement[] = [
    ...ctx.imports.map(createImportStatement),
    createDefaultsStatement(ctx.defaults),
    ...ctx.init,
    createServersStatement(ctx.servers),
    ...ctx.aliases,
    ...h.dedupeMethodNames(methods),
    ...ctx.enumAliases,
  ];

  // Add banner comment to first statement if present
  if (ctx.banner && statements.length > 0) {
    const bannerComment = `*\n * ${ctx.banner.split("\n").join("\n * ")}\n `;
    statements[0] = ts.addSyntheticLeadingComment(
      statements[0],
      ts.SyntaxKind.MultiLineCommentTrivia,
      bannerComment,
      true,
    );
  }

  // Create the source file with all parts in order
  return ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );
}
