import { isReference } from "@oazapfts/resolve";
import { OazapftsContext } from "../context";
import { ParameterObject } from "../helpers/openApi3-x";
import { getSchemaFromContent } from "./getSchemaFromContent";
import { getTypeFromSchema } from "./getTypeForSchema";

export function getTypeFromParameter(p: ParameterObject, ctx: OazapftsContext) {
  if (p.content) {
    const schema = getSchemaFromContent(p.content);
    return getTypeFromSchema(ctx, schema);
  }
  return getTypeFromSchema(ctx, isReference(p) ? p : p.schema);
}
