import { OazapftsContext } from "../context";
import * as cg from "../tscodegen";

export function getEmptySchemaType(ctx: OazapftsContext) {
  return ctx.opts.useUnknown ? cg.keywordType.unknown : cg.keywordType.any;
}
