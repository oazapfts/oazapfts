import { resolve } from "@oazapfts/resolve";
import { OazapftsContext } from "../context";
import { ResponsesObject } from "../helpers/openApi3-x";
import * as h from "../helpers";

export function getResponseType(
  ctx: OazapftsContext,
  responses?: ResponsesObject,
): "json" | "text" | "blob" {
  // backwards-compatibility
  if (!responses) return "text";

  const resolvedResponses = Object.values(responses).map((response) =>
    resolve(response, ctx),
  );

  // if no content is specified, assume `text` (backwards-compatibility)
  if (
    !resolvedResponses.some((res) => Object.keys(res.content ?? {}).length > 0)
  ) {
    return "text";
  }

  const isJson = resolvedResponses.some((response) => {
    const responseMimeTypes = Object.keys(response.content ?? {});
    return responseMimeTypes.some(h.isJsonMimeType);
  });

  // if there’s `application/json` or `*/*`, assume `json`
  if (isJson) {
    return "json";
  }

  // if there’s `text/*`, assume `text`
  if (
    resolvedResponses.some((res) =>
      Object.keys(res.content ?? []).some((type) => type.startsWith("text/")),
    )
  ) {
    return "text";
  }

  // for the rest, assume `blob`
  return "blob";
}
