export type CustomHeaders = Record<
  string,
  string | null | boolean | number | undefined
>;

export function mergeHeaders(
  base: HeadersInit | CustomHeaders | undefined,
  overwrite?: HeadersInit | CustomHeaders,
) {
  const baseHeaders = normalizeHeaders(base);
  const overwriteHeaders = normalizeHeaders(overwrite);

  overwriteHeaders.forEach((value, key) => {
    baseHeaders.set(key, value);
  });

  return baseHeaders;
}

export function normalizeHeaders(
  headers: HeadersInit | CustomHeaders | undefined,
) {
  // This might be custom header config containing null | boolean | number | undefined
  // By default Headers constructor will convert them to string but we don't want that
  // for nullish values.
  if (headers && !(headers instanceof Headers) && !Array.isArray(headers)) {
    return new Headers(
      Object.fromEntries(
        Object.entries(headers)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)]),
      ),
    );
  }

  return new Headers(headers);
}
