import { OazapftsContext } from "../../context";

export function getUniqueAlias(name: string, ctx: OazapftsContext) {
  let used = ctx.typeAliases[name] || 0;
  if (used) {
    ctx.typeAliases[name] = ++used;
    name += used;
  }

  ctx.typeAliases[name] = 1;
  return name;
}
