import { createPlugin } from "../plugin";

export function includeExcludeFilterEndpointPlugin() {
  return createPlugin((hooks) => {
    hooks.filterEndpoint.tap(
      "includeExcludeFilterEndpoint",
      (shouldGenerate, endpoint, ctx) => {
        if (!shouldGenerate) {
          return false;
        }

        const tags = endpoint.operation.tags;
        const excluded =
          tags && tags.some((t) => ctx.opts?.exclude?.includes(t));

        if (excluded) {
          return false;
        }

        if (ctx.opts?.include) {
          return Boolean(
            tags && tags.some((t) => ctx.opts.include?.includes(t)),
          );
        }

        return true;
      },
    );
  });
}
