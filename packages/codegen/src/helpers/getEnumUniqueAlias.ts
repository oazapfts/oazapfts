import { OazapftsContext } from "../context";
import { getUniqueAlias } from "./getUniqueAlias";

/**
 * Return a unique alias for an enum declaration.
 * Reuses the existing name when the same enum values have already been registered.
 */
export function getEnumUniqueAlias(
  name: string,
  values: string,
  ctx: OazapftsContext,
) {
  if (ctx.enumRefs[name] && ctx.enumRefs[name].values === values) {
    return name;
  }

  return getUniqueAlias(name, ctx);
}
