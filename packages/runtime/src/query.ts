import { encode, delimited, encodeReserved } from "./util";

/**
 * Join params using an ampersand and prepends a questionmark if not empty.
 */
export function query(...params: string[]) {
  const s = params.filter(Boolean).join("&");
  return s && `?${s}`;
}

/**
 * Serializes nested objects according to the `deepObject` style specified in
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#style-values
 */
export function deep(
  params: Record<string, any>,
  [k, v] = encodeReserved,
): string {
  const qk = encode([(s) => String(s), k]);
  const qv = encode([(s) => String(s), v]);
  // don't add index to arrays
  // https://github.com/expressjs/body-parser/issues/289
  const visit = (obj: any, prefix = ""): string =>
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([prop, v]) => {
        const index = Array.isArray(obj) ? "" : prop;
        const key = prefix ? qk`${prefix}[${index}]` : prop;
        if (typeof v === "object") {
          return visit(v, key);
        }
        return qv`${key}=${v}`;
      })
      .join("&");

  return visit(params);
}

/**
 * Property values of type array or object generate separate parameters
 * for each value of the array, or key-value-pair of the map.
 * For other types of properties this property has no effect.
 * See https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#encoding-object
 */
export function explode(
  params: Record<string, any>,
  encoders = encodeReserved,
): string {
  const q = encode(encoders);
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => q`${name}=${v}`).join("&");
      }
      if (typeof value === "object") {
        return explode(value, encoders);
      }
      return q`${name}=${value}`;
    })
    .join("&");
}

export function json(
  params: Record<string, any>,
  encoders = encodeReserved,
): string {
  const q = encode(encoders);
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => {
      const v = JSON.stringify(value);
      return q`${name}=${v}`;
    })
    .join("&");
}

export const form = delimited();
export const pipe = delimited("|");
export const space = delimited("%20");

export { numericBooleanReserved } from "./util";
