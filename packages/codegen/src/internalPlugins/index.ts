import type { OazapftsContext } from "../context";
import type { UNSTABLE_OazapftsPlugin } from "../plugin";
import { numericBooleanQueryParametersPlugin } from "./numericBooleanQueryParameters";

export function getInternalPlugins(
  _ctx: OazapftsContext,
): UNSTABLE_OazapftsPlugin[] {
  return [numericBooleanQueryParametersPlugin()];
}
