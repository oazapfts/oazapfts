import type { OazapftsContext } from "../context";
import type { UNSTABLE_OazapftsPlugin } from "../plugin";
import { defaultGenerateMethodPlugin } from "./defaultGenerateMethod";
import { includeExcludeFilterEndpointPlugin } from "./includeExcludeFilterEndpoint";
import { numericBooleanQueryParametersPlugin } from "./numericBooleanQueryParameters";

export function getInternalPlugins(
  _ctx: OazapftsContext,
): UNSTABLE_OazapftsPlugin[] {
  return [
    includeExcludeFilterEndpointPlugin(),
    numericBooleanQueryParametersPlugin(),
    defaultGenerateMethodPlugin(),
  ];
}
