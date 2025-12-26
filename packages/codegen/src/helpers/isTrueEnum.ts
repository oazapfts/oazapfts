import { OazapftsContext } from "../context";
import { SchemaObject } from "./openApi3-x";

export function isTrueEnum(
  schema: SchemaObject,
  ctx: OazapftsContext,
  name?: string,
): name is string {
  return Boolean(
    typeof schema !== "boolean" &&
    schema.enum &&
    ctx.opts.useEnumType &&
    name &&
    schema.type !== "boolean",
  );
}
