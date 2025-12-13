import ts from "typescript";
import { OazapftsContext, OnlyMode } from "../context";
import * as OpenApi from "../openApi3-x";
import * as cg from "../tscodegen";
import { resolve } from "../helpers";
import { getTypeFromSchema } from "./getTypeForSchema";
import { getSchemaFromContent } from "./getSchemaFromContent";

export function getTypeFromResponses(
  responses: OpenApi.ResponsesObject,
  ctx: OazapftsContext,
  onlyMode?: OnlyMode,
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

      const dataType = getTypeFromResponse(res, ctx, onlyMode);
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

function getTypeFromResponse(
  resOrRef: OpenApi.ResponseObject | OpenApi.ReferenceObject,
  ctx: OazapftsContext,
  onlyMode?: OnlyMode,
) {
  const res = resolve(resOrRef, ctx);
  if (!res || !res.content) return cg.keywordType.void;
  return getTypeFromSchema(
    ctx,
    getSchemaFromContent(res.content),
    undefined,
    onlyMode,
  );
}
