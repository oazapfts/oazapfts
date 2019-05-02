import fs from "fs";
import got from "got";
import * as oapi from "@loopback/openapi-v3-types";
import * as cg from "./tscodegen";
import generate from "./generate";
import ts from "typescript";

export { cg };

export async function fetchSpec(spec: string) {
  let source;
  if (spec.includes("://")) {
    source = (await got(spec)).body;
  } else {
    source = fs.readFileSync(spec, "utf8");
  }
  return JSON.parse(source) as oapi.OpenApiSpec;
}

export function generateAst(spec: oapi.OpenApiSpec) {
  return generate(spec);
}

export function printAst(ast: ts.SourceFile) {
  return cg.printFile(ast);
}

export async function generateSource(spec: string) {
  const json = await fetchSpec(spec);
  const ast = generateAst(json);
  return printAst(ast);
}
