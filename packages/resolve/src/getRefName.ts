import { getRefBasename } from "./getRefBasename";
import { refPathToPropertyPath } from "./refPathToPropertyPath";

/**
 * Returns a name for the given ref that can be used as basis for a type
 * alias. This usually is the baseName, unless the ref starts with a number,
 * in which case the whole ref is returned, with slashes turned into
 * underscores.
 */
export function getRefName(ref: string) {
  const base = getRefBasename(ref);
  if (/^\d+/.test(base)) {
    return refPathToPropertyPath(ref).join("_");
  }
  return base;
}
