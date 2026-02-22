import ts from "typescript";
import {
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
  AsyncSeriesHook,
  SyncWaterfallHook,
} from "tapable";
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

export type UNSTABLE_QuerySerializerHookArgs = [
  ts.Expression[],
  {
    method: HttpMethod;
    path: string;
    operation: OpenApi.OperationObject;
    pathItem: OpenApi.PathItemObject;
    formatter: string;
    parameters: OpenApi.ParameterObject[];
    query: OpenApi.ParameterObject[];
  },
  OazapftsContext,
];

export type UNSTABLE_EndpointHookArgs = [
  {
    method: HttpMethod;
    path: string;
    operation: OpenApi.OperationObject;
    pathItem: OpenApi.PathItemObject;
  },
  OazapftsContext,
];

export type UNSTABLE_OazapftsPluginHooks = {
  /**
   * Called after context is created with all template parts initialized.
   * Use this to modify the spec, context, or template parts.
   * This is the only hook where ctx.spec is mutable.
   */
  prepare: AsyncSeriesHook<[OazapftsContext]>;
  /**
   * Decide whether a given endpoint should be generated.
   * Receives the current decision (default true) as first argument.
   * Return false to skip endpoint generation.
   */
  filterEndpoint: SyncWaterfallHook<
    [
      boolean,
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
   * Generate client methods for an endpoint.
   * This is a bail hook: the first plugin that returns a value wins.
   * Return `undefined` to delegate to later plugins.
   */
  generateMethod: AsyncSeriesBailHook<
    UNSTABLE_EndpointHookArgs,
    ts.FunctionDeclaration[] | undefined
  >;
  /**
   * Refine client methods for an endpoint.
   * Receives generated methods and can return a modified array.
   * Runs after generateMethod for each endpoint.
   */
  refineMethod: AsyncSeriesWaterfallHook<
    [ts.FunctionDeclaration[], ...UNSTABLE_EndpointHookArgs]
  >;
  /**
   * Customize query serializer call arguments for each formatter call.
   * Default behavior is identity (returns the original args unchanged).
   */
  querySerializerArgs: SyncWaterfallHook<UNSTABLE_QuerySerializerHookArgs>;
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
    filterEndpoint: new SyncWaterfallHook(
      ["generate", "endpoint", "ctx"],
      "filterEndpoint",
    ),
    generateMethod: new AsyncSeriesBailHook(
      ["endpoint", "ctx"],
      "generateMethod",
    ),
    refineMethod: new AsyncSeriesWaterfallHook(
      ["methods", "endpoint", "ctx"],
      "refineMethod",
    ),
    querySerializerArgs: new SyncWaterfallHook(
      ["args", "queryContext", "ctx"],
      "querySerializerArgs",
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
