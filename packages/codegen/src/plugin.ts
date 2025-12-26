import ts from "typescript";
import { AsyncSeriesWaterfallHook, AsyncSeriesHook } from "tapable";
import type { OazapftsContext } from "./context";
import type * as OpenApi from "./helpers/openApi3-x";
import { HttpMethod } from "./helpers";

export enum UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE {
  EAGER = "eager",
  DEFAULT = "default",
  LAZY = "lazy",
}

export type UNSTABLE_OazapftsPluginOptions = {
  name?: string;
  version?: string;
  precedence?: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE;
};
/**
 * A plugin initiator function that receives hooks and can tap into them.
 */
export type UNSTABLE_OazapftsPluginFn = (
  hooks: UNSTABLE_OazapftsPluginHooks,
) => void | Promise<void>;
export type UNSTABLE_OazapftsPlugin = UNSTABLE_OazapftsPluginFn &
  UNSTABLE_OazapftsPluginOptions;

export type UNSTABLE_OazapftsPluginHooks = {
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
export function UNSTABLE_createPlugin(
  fn: UNSTABLE_OazapftsPluginFn,
  options: UNSTABLE_OazapftsPluginOptions = {},
) {
  return Object.assign(fn, options);
}

/**
 * Create a fresh Hooks instance for a generation run.
 */
export function UNSTABLE_createHooks() {
  return {
    prepare: new AsyncSeriesHook(["ctx"], "prepare"),
    generateMethod: new AsyncSeriesWaterfallHook(
      ["methods", "endpoint", "ctx"],
      "generateMethod",
    ),
    astGenerated: new AsyncSeriesWaterfallHook(["ast", "ctx"], "astGenerated"),
  } satisfies UNSTABLE_OazapftsPluginHooks;
}

/**
 * Apply plugins to a hooks instance.
 * Plugins are applied in order, and each can tap into hooks.
 */
export async function UNSTABLE_applyPlugins(
  hooks: UNSTABLE_OazapftsPluginHooks,
  plugins: UNSTABLE_OazapftsPlugin[],
): Promise<void> {
  for (const plugin of UNSTABLE_sortPlugins(plugins)) {
    await plugin(hooks);
  }
}

export function UNSTABLE_sortPlugins<
  Plugin extends Pick<UNSTABLE_OazapftsPlugin, "precedence">,
>(plugins: Plugin[]) {
  const eagerPlugins: Plugin[] = [];
  const defaultPlugins: Plugin[] = [];
  const lazyPlugins: Plugin[] = [];
  for (const plugin of plugins) {
    switch (plugin.precedence) {
      case UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.EAGER:
        eagerPlugins.push(plugin);
        break;
      case UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.LAZY:
        lazyPlugins.push(plugin);
        break;
      case UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.DEFAULT:
      default:
        defaultPlugins.push(plugin);
        break;
    }
  }

  return [...eagerPlugins, ...defaultPlugins, ...lazyPlugins];
}
