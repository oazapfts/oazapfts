import type { OazapftsContext } from "../context";
import type { OazapftsPlugin } from "../plugin";
import { defaultComposeSourcePlugin } from "./defaultComposeSource";
import { defaultGenerateMethodPlugin } from "./defaultGenerateMethod";
import { includeExcludeFilterEndpointPlugin } from "./includeExcludeFilterEndpoint";
import { numericBooleanQueryParametersPlugin } from "./numericBooleanQueryParameters";

export function getInternalPlugins(_ctx: OazapftsContext): OazapftsPlugin[] {
  return [
    includeExcludeFilterEndpointPlugin(),
    numericBooleanQueryParametersPlugin(),
    defaultGenerateMethodPlugin(),
    defaultComposeSourcePlugin(),
  ];
}
