import { generateClientMethod } from "../generate/generateClientMethod";
import { createPlugin, OAZAPFTS_PLUGIN_PRECEDENCE } from "../plugin";

export function defaultGenerateMethodPlugin() {
  return createPlugin(
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
      precedence: OAZAPFTS_PLUGIN_PRECEDENCE.LAZY,
    },
  );
}
