type Encoders = Array<(s: string) => string>;

// Encode param names and values as URIComponent
export const encodeReserved = [encodeURIComponent, encodeURIComponent];
export const allowReserved = [encodeURIComponent, encodeURI];

function join(
  value: object,
  encoder: Encoders[0] = encodeURIComponent,
  delimiter = ","
) {
  if (Array.isArray(value)) {
    return value.map(encoder).join(delimiter);
  }
  const flat = Object.entries(value).reduce(
    (flat, entry) => [...flat, ...entry],
    [] as any
  );
  return flat.map(encoder).join(delimiter);
}

/**
 * Creates a tag-function to encode template strings with the given encoders.
 */
export function encode(encoders: Encoders, delimiter = ",") {
  const q = (v: any, i: number) => {
    const encoder = encoders[i % encoders.length];
    if (typeof v === "undefined") {
      return "";
    }
    if (typeof v === "object") {
      return join(v, encoder, delimiter);
    }

    return encoder(String(v));
  };

  return (strings: TemplateStringsArray, ...values: any[]) => {
    return strings.reduce((prev, s, i) => {
      return `${prev}${s}${q(values[i], i)}`;
    }, "");
  };
}

export function simple(delimiter = ",") {
  return (
    param: unknown[] | Record<string, unknown>,
    encoders = encodeReserved
  ) => {
    return join(param, encoders[1], delimiter);
  };
}

/**
 * Separate array values by the given delimiter.
 */
export function form(delimiter = ",") {
  return (params: Record<string, any>, encoders = encodeReserved) =>
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => encode(encoders, delimiter)`${name}=${value}`)
      .join("&");
}

/**
 * Deeply remove all properties with undefined values.
 */
export function stripUndefined<T>(obj: T) {
  return obj && JSON.parse(JSON.stringify(obj));
}

export function joinUrl(...parts: Array<string | undefined>) {
  return parts
    .filter(Boolean)
    .map((s, i) => (i === 0 ? s : s!.replace(/^\/+/, "")))
    .map((s, i, a) => (i === a.length - 1 ? s : s!.replace(/\/+$/, "")))
    .join("/");
}
