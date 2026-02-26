import ts from "typescript";
import { OazapftsContext } from "../context";
import * as h from "../helpers";
import * as OpenAPI from "../helpers/openApi3-x";
import type { OazapftsPluginHooks } from "../plugin";
import { getRefAlias } from "./getRefAlias";

export async function generateApi(
  ctx: OazapftsContext,
  hooks: OazapftsPluginHooks,
): Promise<ts.SourceFile> {
  // Preprocess components (needs mutable context)
  h.preprocessComponents(ctx);

  // Hook: prepare - allow plugins to modify spec, context, or template parts
  await hooks.prepare.promise(ctx);

  // Generate methods with hook support
  const methods: ts.Statement[] = [];
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
    for (const [name] of Object.entries(ctx.spec.components.schemas)) {
      getRefAlias({ $ref: `#/components/schemas/${name}` }, ctx);
    }
  }

  // Hook: composeSource/refineSource - compose and refine top-level statements
  const composedStatements =
    (await hooks.composeSource.promise(ctx, methods)) ?? [];
  const statements = await hooks.refineSource.promise(
    composedStatements,
    ctx,
    methods,
  );

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
  let apiSourceFile = ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  // Hook: astGenerated - allow plugins to modify final AST
  apiSourceFile = await hooks.astGenerated.promise(apiSourceFile, ctx);

  return apiSourceFile;
}
