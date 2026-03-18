import { generateClientMethod } from "../generate/generateClientMethod";
import {
  UNSTABLE_createPlugin,
  UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE,
} from "../plugin";

export function defaultGenerateMethodPlugin() {
  return UNSTABLE_createPlugin(
    (hooks) => {
      hooks.generateMethod.tapPromise(
        "defaultGenerateMethod",
        async (endpoint, ctx) => {
          return generateClientMethod(
            endpoint.method,
            endpoint.path,
            endpoint.operation,
            endpoint.pathItem,
            ctx,
            hooks,
          );
        },
      );
    },
    {
      precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.LAZY,
    },
  );
}
