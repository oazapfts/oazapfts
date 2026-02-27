import ts from "typescript";
import { resolve } from "@oazapfts/resolve";
import { OazapftsContext } from "../context";
import * as OpenApi from "../helpers/openApi3-x";
import * as cg from "./tscodegen";
import { getTypeFromSchema } from "./getTypeFromSchema";
import { getSchemaFromContent } from "./getSchemaFromContent";

export function getTypeFromResponses(
  responses: OpenApi.ResponsesObject,
  ctx: OazapftsContext,
) {
  return ts.factory.createUnionTypeNode(
    Object.entries(responses).map(([code, res]) => {
      const statusType =
        code === "default"
          ? cg.keywordType.number
          : ts.factory.createLiteralTypeNode(
              ts.factory.createNumericLiteral(code),
            );

      const props = [
        cg.createPropertySignature({
          name: "status",
          type: statusType,
        }),
      ];

      const dataType = getTypeFromResponse(res, ctx);
      if (dataType !== cg.keywordType.void) {
        props.push(
          cg.createPropertySignature({
            name: "data",
            type: dataType,
          }),
        );
      }
      return ts.factory.createTypeLiteralNode(props);
    }),
  );
}

export function getTypeFromResponse(
  resOrRef: OpenApi.ResponseObject | OpenApi.ReferenceObject,
  ctx: OazapftsContext,
) {
  const res = resolve(resOrRef, ctx);
  if (!res || !res.content) return cg.keywordType.void;
  return getTypeFromSchema(ctx, getSchemaFromContent(res.content));
}
