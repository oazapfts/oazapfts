import ts from "typescript";
import { createDefaultsStatement } from "../generate/createDefaultsStatement";
import { createImportStatement } from "../generate/generateImports";
import { createServersStatement } from "../generate/generateServers";
import {
  createPlugin,
  OAZAPFTS_PLUGIN_PRECEDENCE,
} from "../plugin";

export function defaultComposeSourcePlugin() {
  return createPlugin(
    (hooks) => {
      hooks.composeSource.tap("defaultComposeSource", (ctx, methods) => {
        return [
          ...ctx.imports.map(createImportStatement),
          createDefaultsStatement(ctx.defaults),
          ...ctx.init,
          createServersStatement(ctx.servers),
          ...ctx.aliases,
          ...methods,
          ...ctx.enumAliases,
        ] satisfies ts.Statement[];
      });
    },
    {
      precedence: OAZAPFTS_PLUGIN_PRECEDENCE.LAZY,
    },
  );
}
