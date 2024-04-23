import { OazapftsContext } from "../../context";

export function skip(ctx: OazapftsContext, tags?: string[]) {
  const excluded = tags && tags.some((t) => ctx.opts?.exclude?.includes(t));
  if (excluded) {
    return true;
  }
  if (ctx.opts?.include) {
    const included = tags && tags.some((t) => ctx.opts.include?.includes(t));
    return !included;
  }
  return false;
}
