import _ from "lodash";
import { toIdentifier } from "./toIdentifier";
import { isValidIdentifier } from "../generate/tscodegen";

/**
 * Result of getOperationNames containing the primary method name and
 * optionally a deprecated legacy name for backward compatibility.
 */
export type OperationNames = {
  primaryName: string;
  /**
   * When set, indicates the legacy fallback name that older versions of
   * oazapfts would have generated. A deprecated alias should be emitted.
   */
  deprecatedLegacyName?: string;
};

/**
 * Create method name(s) for a given operation, either from its operationId or
 * the HTTP verb and path. Returns the primary name and optionally a deprecated
 * legacy name for backward compatibility.
 */
export function getOperationNames(
  verb: string,
  path: string,
  operationId?: string,
  operationNames: Map<string, number> = new Map(),
): OperationNames {
  const fallbackName = getFallbackName(verb, path);
  const legacyId = getLegacyOperationIdentifier(operationId);
  const newId = getOperationIdentifier(operationId);

  // If new normalization produces a valid identifier but legacy did not,
  // we need to emit a deprecated alias for backward compatibility.
  if (newId && !legacyId) {
    const primaryName = reserveOperationName(newId, operationNames);
    const deprecatedLegacyName = reserveOperationName(
      fallbackName,
      operationNames,
    );
    return {
      primaryName,
      deprecatedLegacyName,
    };
  }

  // Either both agree on the id, or both fall back
  const primaryName = reserveOperationName(
    newId || fallbackName,
    operationNames,
  );
  return {
    primaryName,
  };
}

/**
 * Create a method name for a given operation, either from its operationId or
 * the HTTP verb and path.
 * @deprecated Use getOperationNames instead for backward compatibility support.
 */
export function getOperationName(
  verb: string,
  path: string,
  operationId?: string,
) {
  return getOperationNames(verb, path, operationId).primaryName;
}

/**
 * Make sure the name is unique by appending a counter to the name.
 */
function reserveOperationName(
  name: string,
  operationNames: Map<string, number>,
): string {
  let count = operationNames.get(name) ?? 0;
  if (count === 0) {
    operationNames.set(name, 1);
    return name;
  }

  count += 1;
  let dedupedName = `${name}${count}`;
  while (operationNames.has(dedupedName)) {
    count += 1;
    dedupedName = `${name}${count}`;
  }

  operationNames.set(name, count);
  operationNames.set(dedupedName, 1);
  return dedupedName;
}

/**
 * Compute the fallback name from verb + path (used when operationId is missing
 * or cannot be normalized to a valid identifier).
 */
function getFallbackName(verb: string, path: string) {
  path = path.replace(/\{(.+?)\}/, "by $1").replace(/\{(.+?)\}/, "and $1");
  return toIdentifier(`${verb} ${path}`);
}

/**
 * Normalize an operationId into a valid camelCase identifier.
 * - Replaces non-word characters (except whitespace) with spaces
 * - Strips invalid leading characters (digits, etc.)
 * - Returns undefined if the result is empty or invalid
 */
function getOperationIdentifier(id?: string): string | undefined {
  if (!id) return;

  // Replace any non-word, non-whitespace character with a space
  // This handles dots, colons, backslashes, dashes, etc.
  const normalized = id.replace(/[^\w\s]/g, " ");

  let camelCased = _.camelCase(normalized);
  if (!camelCased) return;

  // Strip invalid leading characters (digits, etc.) until we have a valid start
  camelCased = camelCased.replace(/^[^a-zA-Z_$]+/, "");

  // Ensure it starts lowercase (function-style)
  camelCased = _.lowerFirst(camelCased);

  if (!camelCased) return;
  if (isValidIdentifier(camelCased)) return camelCased;
}

/**
 * Legacy operationId handling: only accepts IDs with word characters and
 * whitespace. This matches the old behavior before relaxed operationId support.
 */
function getLegacyOperationIdentifier(id?: string): string | undefined {
  if (!id) return;
  // Old behavior: reject any special characters
  if (id.match(/[^\w\s]/)) return;
  const camelCased = _.camelCase(id);
  if (isValidIdentifier(camelCased)) return camelCased;
}
