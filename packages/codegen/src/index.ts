import * as cg from "./tscodegen";
import ApiGenerator from "./generate";
import ts from "typescript";
import SwaggerParser from "@apidevtools/swagger-parser";
import converter from "swagger2openapi";
import { OpenAPI, OpenAPIV3 } from "openapi-types";

export { cg };

export const optsArgumentStyles = ["positional", "object"];
export type Opts = {
  include?: string[];
  exclude?: string[];
  optimistic?: boolean;
  unionUndefined?: boolean;
  useEnumType?: boolean;
  mergeReadWriteOnly?: boolean;
  useUnknown?: boolean;
  argumentStyle?: (typeof optsArgumentStyles)[number];
};

export function generateAst(
  doc: OpenAPIV3.Document,
  opts: Opts,
  isConverted: boolean,
) {
  return new ApiGenerator(doc, opts, isConverted).generateApi();
}

export function printAst(ast: ts.SourceFile) {
  return cg.printFile(ast);
}

export async function generateSource(spec: string, opts: Opts = {}) {
  const { doc, isConverted } = await parseSpec(spec);
  const ast = generateAst(doc, opts, isConverted);
  const { title, version } = doc.info;
  const preamble = ["$&", title, version].filter(Boolean).join("\n * ");
  const src = printAst(ast);
  return src.replace(/^\/\*\*/, preamble);
}

function isOpenApiV3(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
  return "openapi" in doc && doc.openapi.startsWith("3");
}

export async function parseSpec(spec: string) {
  const doc = await SwaggerParser.bundle(spec);
  if (isOpenApiV3(doc)) {
    return {
      doc,
      isConverted: false,
    };
  } else {
    const converted = await converter.convertObj(doc, {});
    return {
      doc: converted.openapi as OpenAPIV3.Document,
      isConverted: true,
    };
  }
}
