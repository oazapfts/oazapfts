import { ParameterObject } from "../openApi3-x";
import { isJsonMimeType } from "./mimeTypes";

/**
 * Get the name of a formatter function for a given parameter.
 */
export function getFormatter({
  style = "form",
  explode = true,
  content,
}: ParameterObject) {
  if (content) {
    const medias = Object.keys(content);
    if (medias.length !== 1) {
      throw new Error(
        "Parameters with content property must specify one media type",
      );
    }
    if (!isJsonMimeType(medias[0])) {
      throw new Error(
        "Parameters with content property must specify a JSON compatible media type",
      );
    }
    return "json";
  }
  if (explode && style === "deepObject") return "deep";
  if (explode) return "explode";
  if (style === "spaceDelimited") return "space";
  if (style === "pipeDelimited") return "pipe";
  return "form";
}
