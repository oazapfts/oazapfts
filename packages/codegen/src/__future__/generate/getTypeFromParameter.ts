import { OazapftsContext } from "../../context";
import { ParameterObject } from "../../openApi3-x";
import { isReference } from "../helpers";
import { getSchemaFromContent } from "./getSchemaFromContent";
import { getTypeFromSchema } from "./getTypeForSchema";

export function getTypeFromParameter(p: ParameterObject, ctx: OazapftsContext) {
  if (p.content) {
    const schema = getSchemaFromContent(p.content);
    return getTypeFromSchema(ctx, schema);
  }
  return getTypeFromSchema(ctx, isReference(p) ? p : p.schema);
}
