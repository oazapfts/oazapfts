import * as cg from "./generate/tscodegen";
import { type SourceFile } from "typescript";
import SwaggerParser from "@apidevtools/swagger-parser";
import { createContext, OazapftsContext } from "./context";
import { generateApi } from "./generate/generateApi";
import * as OpenAPI from "./helpers/openApi3-x";
import {
  type UNSTABLE_OazapftsPlugin,
  UNSTABLE_createHooks,
  UNSTABLE_applyPlugins,
} from "./plugin";
import { ArgumentStyle } from "./generate/generateClientMethod";
import { EnumStyle } from "./helpers/getEnumStyle";

export { cg as UNSTABLE_cg, type OpenAPI };

export type OazapftsOptions = {
  include?: string[];
  exclude?: string[];
  optimistic?: boolean;
  unionUndefined?: boolean;
  /**
   * @deprecated Use `enumStyle: "enum"` instead.
   */
  useEnumType?: boolean;
  /**
   * Controls how enums are generated in TypeScript.
   * Takes precedence over `useEnumType` if both are specified.
   */
  enumStyle?: EnumStyle;
  mergeReadWriteOnly?: boolean;
  useUnknown?: boolean;
  argumentStyle?: ArgumentStyle;
  allSchemas?: boolean;
  /**
   * When true, skip generating deprecated legacy method aliases for backward
   * compatibility. Only the primary normalized operationId-based names will
   * be generated.
   */
  futureStripLegacyMethods?: boolean;
  /**
   * Plugins to apply during code generation.
   * Each plugin receives hooks and can tap into generation steps.
   */
  UNSTABLE_plugins?: UNSTABLE_OazapftsPlugin[];
};

/**
 * Create a a TypeScript source file from an OpenAPI spec.
 *
 * @param spec - Path to an OpenAPI spec file or source string
 * @param opts - Options for the code generation
 * @returns The generated TypeScript source file
 */
export async function generateSource(spec: string, opts: OazapftsOptions = {}) {
  const doc = await parseSpec(spec);

  const ctx = createContext(doc, opts);
  ctx.banner = [doc.info.title, doc.info.version, ctx.banner]
    .filter(Boolean)
    .join("\n");

  const ast = await generateAst(ctx, opts.UNSTABLE_plugins);

  return printAst(ast);
}
export { generateSource as default, generateSource as oazapfts };

/**
 * Create an Typescript AST from an OpenAPI document.
 *
 * @param ctx - Oazapfts context
 * @param UNSTABLE_plugins - Unstable plugins to apply
 * @returns The generated TypeScript AST
 */
export async function generateAst(
  ctx: OazapftsContext,
  UNSTABLE_plugins: UNSTABLE_OazapftsPlugin[] = [],
) {
  const hooks = UNSTABLE_createHooks();
  await UNSTABLE_applyPlugins(hooks, UNSTABLE_plugins);

  return generateApi(ctx, hooks);
}

/**
 * Print a TypeScript AST to a string.
 *
 * @param ast - The TypeScript AST to print
 * @returns The printed TypeScript source
 */
export function printAst(ast: SourceFile) {
  return cg.printFile(ast);
}

/**
 * Parse an OpenAPI spec into a document object.
 *
 * @param spec - Path to a local OpenAPI spec file,
 *                or a URL to an OpenAPI spec file
 *                or a OpenAPI document object
 * @returns The parsed OpenAPI document
 */
export async function parseSpec(spec: string | OpenAPI.Document) {
  if (typeof spec === "string" && spec.startsWith("http")) {
    const response = await fetch(spec);
    spec = await response.json();
  }

  const doc = await SwaggerParser.bundle(spec);
  if (!isOpenApiV3(doc)) {
    throw new Error(
      "Only OpenAPI v3 is supported\nYou may convert you spec with https://github.com/swagger-api/swagger-converter or swagger2openapi package",
    );
  }

  return doc;
}

function isOpenApiV3(
  doc: Awaited<ReturnType<typeof SwaggerParser.bundle>>,
): doc is OpenAPI.Document {
  return "openapi" in doc && doc.openapi.startsWith("3");
}
