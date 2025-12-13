import * as cg from "./tscodegen";
import ts from "typescript";
import SwaggerParser from "@apidevtools/swagger-parser";
import converter from "swagger2openapi";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import { createContext } from "./context";
import { generateApi } from "./generate/generateApi";
import {
  type OazapftsPlugin,
  type Hooks,
  createHooks,
  applyPlugins,
} from "./plugins";

export { cg };

// Re-export plugin system for library consumers
export { type OazapftsPlugin, type Hooks, createHooks } from "./plugins";

export const optsArgumentStyles = ["positional", "object"];
export type Opts = {
  include?: string[];
  exclude?: string[];
  optimistic?: boolean;
  unionUndefined?: boolean;
  useEnumType?: boolean;
  mergeReadWriteOnly?: boolean;
  useUnknown?: boolean;
  argumentStyle?: (typeof optsArgumentStyles)[number];
  /**
   * Plugins to apply during code generation.
   * Each plugin receives hooks and can tap into generation steps.
   */
  plugins?: OazapftsPlugin[];
};

export async function generateAst(
  doc: OpenAPIV3.Document,
  opts: Opts,
  isConverted: boolean,
): Promise<ts.SourceFile> {
  const ctx = createContext(doc, opts, isConverted);

  // Prepend title and version to banner
  const { title, version } = doc.info;
  ctx.banner = [title, version, ctx.banner].filter(Boolean).join("\n");

  // Create hooks and apply user plugins
  const hooks = createHooks();
  if (opts.plugins) {
    await applyPlugins(hooks, opts.plugins);
  }

  return generateApi(ctx, hooks);
}

export function printAst(ast: ts.SourceFile) {
  return cg.printFile(ast);
}

export async function generateSource(
  spec: string,
  opts: Opts = {},
): Promise<string> {
  const { doc, isConverted } = await parseSpec(spec);
  const ast = await generateAst(doc, opts, isConverted);
  return printAst(ast);
}

function isOpenApiV3(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
  return "openapi" in doc && doc.openapi.startsWith("3");
}

export async function parseSpec(spec: string) {
  const doc = await SwaggerParser.bundle(spec);
  if (isOpenApiV3(doc)) {
    return {
      doc,
      isConverted: false,
    };
  } else {
    const converted = await converter.convertObj(doc, {});
    return {
      doc: converted.openapi as OpenAPIV3.Document,
      isConverted: true,
    };
  }
}
