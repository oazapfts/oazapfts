import type { OpenAPIV3_1, OpenAPIV3 } from "openapi-types";
import { isReference, type ReferenceObject } from "./isReference";
import { refPathToPropertyPath } from "./refPathToPropertyPath";
import { getAtPath } from "./getAtPath";
import { ResolverError } from "./ResolverError";

export type Document = OpenAPIV3.Document | OpenAPIV3_1.Document;

export type Context = {
  spec: Document;
};

export function resolve<T>(obj: T | ReferenceObject, { spec }: Context) {
  if (!isReference(obj)) return obj;
  const ref = obj.$ref;
  const path = refPathToPropertyPath(ref);
  const resolved = getAtPath(spec, path);
  if (typeof resolved === "undefined") {
    throw new ResolverError(`Can't find ${path}`);
  }
  return resolved as T;
}

export function createResolver(spec: Document) {
  return <T>(obj: T | ReferenceObject) => resolve(obj, { spec });
}

export function resolveArray<T>(
  ctx: Context,
  array?: Array<T | ReferenceObject>,
) {
  return array ? array.map((el) => resolve(el, ctx)) : [];
}
