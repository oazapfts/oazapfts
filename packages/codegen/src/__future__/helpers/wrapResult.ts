import ts from "typescript";
import { OazapftsContext } from "../../context";
import { callOazapftsFunction } from "./callOazapftsFunction";

export function wrapResult(ex: ts.Expression, ctx: OazapftsContext) {
  return ctx.opts?.optimistic ? callOazapftsFunction("ok", [ex]) : ex;
}
