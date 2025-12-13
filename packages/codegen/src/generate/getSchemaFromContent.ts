import * as OpenApi from "../openApi3-x";
import { isMimeType } from "../helpers";

export function getSchemaFromContent(
  content: Record<string, OpenApi.MediaTypeObject>,
): OpenApi.SchemaObject | OpenApi.ReferenceObject {
  const contentType = Object.keys(content).find(isMimeType);
  if (contentType) {
    const { schema } = content[contentType];
    if (schema) {
      return schema;
    }
  }

  // if no content is specified -> string
  // `text/*` -> string
  if (
    Object.keys(content).length === 0 ||
    Object.keys(content).some((type) => type.startsWith("text/"))
  ) {
    return { type: "string" };
  }

  // rest (e.g. `application/octet-stream`, `application/gzip`, …) -> binary
  return { type: "string", format: "binary" };
}
