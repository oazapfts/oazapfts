import _ from "lodash";
import { OnlyMode } from "../context";
import { isValidIdentifier } from "../generate/tscodegen";
import { getOnlyModeSuffix } from "./getOnlyModeSuffix";

export function toIdentifier(s: string, upper = false, onlyMode?: OnlyMode) {
  let cc = _.camelCase(s) + getOnlyModeSuffix(onlyMode);
  if (upper) cc = _.upperFirst(cc);
  if (isValidIdentifier(cc)) return cc;
  return "$" + cc;
}
