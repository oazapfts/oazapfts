import ts from "typescript";
import { AsyncSeriesWaterfallHook, AsyncSeriesHook } from "tapable";
import type { OazapftsContext } from "./context";
import type * as OpenApi from "./openApi3-x";

/**
 * A plugin is a function that receives hooks and can tap into them.
 */
export type OazapftsPlugin = (hooks: Hooks) => void | Promise<void>;

/**
 * Hooks available for plugins to tap into during code generation.
 *
 * Hook types:
 * - AsyncSeriesHook: side-effect only, all taps run in series
 * - AsyncSeriesWaterfallHook: each tap can transform/replace the first argument
 */
export class Hooks {
  /**
   * Called after context is created with all template parts initialized.
   * Use this to modify the spec, context, or template parts.
   * This is the only hook where ctx.spec is mutable.
   */
  public prepare = new AsyncSeriesHook<[OazapftsContext]>(["ctx"], "prepare");

  /**
   * Generate or modify a client method for an endpoint.
   * First argument is the array of generated FunctionDeclarations (may be empty).
   * Return modified array to change the methods for this endpoint.
   */
  public generateMethod = new AsyncSeriesWaterfallHook<
    [
      ts.FunctionDeclaration[],
      {
        method: string;
        path: string;
        operation: OpenApi.OperationObject;
        pathItem: OpenApi.PathItemObject;
      },
      OazapftsContext,
    ]
  >(["functions", "endpoint", "ctx"], "generateMethod");

  /**
   * Called after the full AST has been generated, before printing to string.
   * Use this to add/modify/remove statements from the final source file.
   */
  public astGenerated = new AsyncSeriesWaterfallHook<
    [ts.SourceFile, OazapftsContext]
  >(["sourceFile", "ctx"], "astGenerated");
}

/**
 * Create a fresh Hooks instance for a generation run.
 */
export function createHooks(): Hooks {
  return new Hooks();
}

/**
 * Apply plugins to a hooks instance.
 * Plugins are applied in order, and each can tap into hooks.
 */
export async function applyPlugins(
  hooks: Hooks,
  plugins: OazapftsPlugin[],
): Promise<void> {
  for (const plugin of plugins) {
    await plugin(hooks);
  }
}
