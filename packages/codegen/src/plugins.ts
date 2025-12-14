import ts from "typescript";
import { AsyncSeriesWaterfallHook, AsyncSeriesHook } from "tapable";
import type { OazapftsContext } from "./context";
import type * as OpenApi from "./openApi3-x";
import { HttpMethod } from "./helpers";

export type OazapftsPluginOptions = {
  name?: string;
  version?: string;
  precedence?: "early" | "default" | "late";
};
/**
 * A plugin initiator function that receives hooks and can tap into them.
 */
export type OazapftsPluginFn = (
  hooks: OazapftsPluginHooks,
) => void | Promise<void>;
export type OazapftsPlugin = OazapftsPluginFn & OazapftsPluginOptions;

export type OazapftsPluginHooks = {
  /**
   * Called after context is created with all template parts initialized.
   * Use this to modify the spec, context, or template parts.
   * This is the only hook where ctx.spec is mutable.
   */
  prepare: AsyncSeriesHook<[OazapftsContext]>;
  /**
   * Generate or modify a client method for an endpoint.
   * First argument is the array of generated FunctionDeclarations (may be empty).
   * Return modified array to change the methods for this endpoint.
   */
  generateMethod: AsyncSeriesWaterfallHook<
    [
      ts.FunctionDeclaration[],
      {
        method: HttpMethod;
        path: string;
        operation: OpenApi.OperationObject;
        pathItem: OpenApi.PathItemObject;
      },
      OazapftsContext,
    ]
  >;
  /**
   * Called after the full AST has been generated, before printing to string.
   * Use this to add/modify/remove statements from the final source file.
   */
  astGenerated: AsyncSeriesWaterfallHook<[ts.SourceFile, OazapftsContext]>;
};

/**
 * Create a oazapfts plugin
 */
export function createPlugin(
  fn: OazapftsPluginFn,
  options: OazapftsPluginOptions = {},
) {
  return Object.assign(fn, options);
}

/**
 * Create a fresh Hooks instance for a generation run.
 */
export function createHooks() {
  return {
    prepare: new AsyncSeriesHook(["ctx"], "prepare"),
    generateMethod: new AsyncSeriesWaterfallHook(
      ["methods", "endpoint", "ctx"],
      "generateMethod",
    ),
    astGenerated: new AsyncSeriesWaterfallHook(["ast", "ctx"], "astGenerated"),
  } satisfies OazapftsPluginHooks;
}

/**
 * Apply plugins to a hooks instance.
 * Plugins are applied in order, and each can tap into hooks.
 */
export async function applyPlugins(
  hooks: OazapftsPluginHooks,
  plugins: OazapftsPlugin[],
): Promise<void> {
  for (const plugin of sortPlugins(plugins)) {
    await plugin(hooks);
  }
}

export function sortPlugins<Plugin extends Pick<OazapftsPlugin, "precedence">>(
  plugins: Plugin[],
) {
  const earlyPlugins: Plugin[] = [];
  const defaultPlugins: Plugin[] = [];
  const latePlugins: Plugin[] = [];
  for (const plugin of plugins) {
    if (plugin.precedence === "early") {
      earlyPlugins.push(plugin);
    }
    if (!plugin.precedence || plugin.precedence === "default") {
      defaultPlugins.push(plugin);
    }
    if (plugin.precedence === "late") {
      latePlugins.push(plugin);
    }
  }

  return [...earlyPlugins, ...defaultPlugins, ...latePlugins];
}
