import * as cg from "./tscodegen";
import generate from "./generate";
import ts from "typescript";
import SwaggerParser from "@apidevtools/swagger-parser";
import converter from "swagger2openapi";
import { OpenAPIV3 } from "openapi-types";

export { cg };

export function generateAst(spec: OpenAPIV3.Document) {
  return generate(spec);
}

export function printAst(ast: ts.SourceFile) {
  return cg.printFile(ast);
}

export async function generateSource(spec: string) {
  let v3Doc;
  const doc = await SwaggerParser.bundle(spec);
  const isOpenApiV3 = "openapi" in doc && doc.openapi.startsWith("3");
  if (isOpenApiV3) {
    v3Doc = doc as OpenAPIV3.Document;
  } else {
    const result = await converter.convertObj(doc, {});
    v3Doc = result.openapi as OpenAPIV3.Document;
  }
  const ast = generateAst(v3Doc);
  const { title, version } = v3Doc.info;
  const preamble = ["$&", title, version].filter(Boolean).join("\n * ");
  const src = printAst(ast);
  return src.replace(/^\/\*\*/, preamble);
}
