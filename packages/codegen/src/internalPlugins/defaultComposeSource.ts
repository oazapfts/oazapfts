import ts from "typescript";
import * as h from "../helpers";
import { createDefaultsStatement } from "../generate/createDefaultsStatement";
import { createImportStatement } from "../generate/generateImports";
import { createServersStatement } from "../generate/generateServers";
import {
  UNSTABLE_createPlugin,
  UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE,
} from "../plugin";

export function defaultComposeSourcePlugin() {
  return UNSTABLE_createPlugin(
    (hooks) => {
      hooks.composeSource.tap("defaultComposeSource", (ctx, methods) => {
        return [
          ...ctx.imports.map(createImportStatement),
          createDefaultsStatement(ctx.defaults),
          ...ctx.init,
          createServersStatement(ctx.servers),
          ...ctx.aliases,
          ...h.dedupeMethodNames(methods),
          ...ctx.enumAliases,
        ] satisfies ts.Statement[];
      });
    },
    {
      precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.LAZY,
    },
  );
}
