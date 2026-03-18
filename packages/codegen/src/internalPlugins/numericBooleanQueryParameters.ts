import ts from "typescript";
import { resolve } from "@oazapfts/resolve";
import type { OazapftsContext } from "../context";
import type { ParameterObject } from "../helpers/openApi3-x";
import {
  UNSTABLE_createPlugin,
  UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE,
} from "../plugin";

function hasBooleanQueryParameter(
  query: ParameterObject[],
  ctx: OazapftsContext,
) {
  return query.some((param) => {
    const schema = param.schema && resolve(param.schema, ctx);
    return !!schema && typeof schema === "object" && schema.type === "boolean";
  });
}

export function numericBooleanQueryParametersPlugin() {
  return UNSTABLE_createPlugin(
    (hooks) => {
      hooks.querySerializerArgs.tap(
        "numericBooleanQueryParameters",
        (args, queryContext, ctx) => {
          if (!ctx.opts.numericBooleanQueryParameters) {
            return args;
          }

          if (!hasBooleanQueryParameter(queryContext.query, ctx)) {
            return args;
          }

          return [
            ...args,
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("QS"),
              "numericBooleanReserved",
            ),
          ];
        },
      );
    },
    {
      precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.LAZY,
    },
  );
}
