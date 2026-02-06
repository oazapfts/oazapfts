import { OazapftsContext } from "../context";
import { getUniqueAlias } from "./getUniqueAlias";

export function getEnumUniqueAlias(
  name: string,
  values: string,
  ctx: OazapftsContext,
) {
  // If enum name already exists and have the same values
  if (ctx.enumRefs[name] && ctx.enumRefs[name].values == values) {
    return name;
  }

  return getUniqueAlias(name, ctx);
}
