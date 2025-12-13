import { RequestBodyObject } from "../openApi3-x";
import { contentTypes, isJsonMimeType } from "./mimeTypes";

export function getBodyFormatter(body?: RequestBodyObject) {
  if (body?.content) {
    for (const contentType of Object.keys(body.content)) {
      const formatter = contentTypes[contentType];
      if (formatter) return formatter;
      if (isJsonMimeType(contentType)) return "json";
    }
  }
}
