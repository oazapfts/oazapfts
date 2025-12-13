import _ from "lodash";
import { OazapftsContext } from "../context";
import { ReferenceObject } from "../openApi3-x";
import { isReference } from "./isReference";
import { refPathToPropertyPath } from "./refPathToPropertyPath";

export function resolve<T>(
  obj: T | ReferenceObject,
  { spec }: OazapftsContext,
) {
  if (!isReference(obj)) return obj;
  const ref = obj.$ref;
  const path = refPathToPropertyPath(ref);
  const resolved = _.get(spec, path);
  if (typeof resolved === "undefined") {
    throw new Error(`Can't find ${path}`);
  }
  return resolved as T;
}

export function resolveArray<T>(
  ctx: OazapftsContext,
  array?: Array<T | ReferenceObject>,
) {
  return array ? array.map((el) => resolve(el, ctx)) : [];
}
