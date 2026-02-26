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

export enum OAZAPFTS_PLUGIN_PRECEDENCE {
  EAGER = "eager",
  DEFAULT = "default",
  LAZY = "lazy",
}

export type OazapftsPluginOptions = {
  name?: string;
  version?: string;
  precedence?: OAZAPFTS_PLUGIN_PRECEDENCE;
};
/**
 * A plugin initiator function that receives hooks and can tap into them.
 */
export type OazapftsPluginFn = (
  hooks: OazapftsPluginHooks,
) => void | Promise<void>;
export type OazapftsPlugin = OazapftsPluginFn & OazapftsPluginOptions;

export type QuerySerializerHookArgs = [
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

export type EndpointHookArgs = [
  {
    method: HttpMethod;
    path: string;
    operation: OpenApi.OperationObject;
    pathItem: OpenApi.PathItemObject;
  },
  OazapftsContext,
];

export type ComposeSourceHookArgs = [OazapftsContext, ts.Statement[]];

export type OazapftsPluginHooks = {
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
    EndpointHookArgs,
    ts.Statement[] | undefined
  >;
  /**
   * Refine client methods for an endpoint.
   * Receives generated methods and can return a modified array.
   * Runs after generateMethod for each endpoint.
   */
  refineMethod: AsyncSeriesWaterfallHook<[ts.Statement[], ...EndpointHookArgs]>;
  /**
   * Compose top-level source statements from context and generated methods.
   * This is a bail hook: the first plugin that returns a value wins.
   * Return `undefined` to delegate to later plugins.
   */
  composeSource: AsyncSeriesBailHook<
    ComposeSourceHookArgs,
    ts.Statement[] | undefined
  >;
  /**
   * Refine top-level source statements before SourceFile construction.
   * Receives composed statements and can return a modified array.
   * Runs after composeSource.
   */
  refineSource: AsyncSeriesWaterfallHook<
    [ts.Statement[], ...ComposeSourceHookArgs]
  >;
  /**
   * Customize query serializer call arguments for each formatter call.
   * Default behavior is identity (returns the original args unchanged).
   */
  querySerializerArgs: SyncWaterfallHook<QuerySerializerHookArgs>;
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
    composeSource: new AsyncSeriesBailHook(["ctx", "methods"], "composeSource"),
    refineSource: new AsyncSeriesWaterfallHook(
      ["statements", "ctx", "methods"],
      "refineSource",
    ),
    querySerializerArgs: new SyncWaterfallHook(
      ["args", "queryContext", "ctx"],
      "querySerializerArgs",
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
  const eagerPlugins: Plugin[] = [];
  const defaultPlugins: Plugin[] = [];
  const lazyPlugins: Plugin[] = [];
  for (const plugin of plugins) {
    switch (plugin.precedence) {
      case OAZAPFTS_PLUGIN_PRECEDENCE.EAGER:
        eagerPlugins.push(plugin);
        break;
      case OAZAPFTS_PLUGIN_PRECEDENCE.LAZY:
        lazyPlugins.push(plugin);
        break;
      case OAZAPFTS_PLUGIN_PRECEDENCE.DEFAULT:
      default:
        defaultPlugins.push(plugin);
        break;
    }
  }

  return [...eagerPlugins, ...defaultPlugins, ...lazyPlugins];
}
