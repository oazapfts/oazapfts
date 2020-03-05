/**
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
export const defaults: RequestOpts = {
  baseUrl: "/"
};

export const servers = {};

type Encoders = Array<(s: string) => string>;

export type RequestOpts = {
  baseUrl?: string;
  fetch?: typeof fetch;
  headers?: Record<string, string | undefined>;
} & Omit<RequestInit, "body" | "headers">;

type FetchRequestOpts = RequestOpts & {
  body?: string | FormData;
};

type JsonRequestOpts = RequestOpts & {
  body: object;
};

type MultipartRequestOpts = RequestOpts & {
  body: Record<string, string | Blob | undefined | any>;
};

export const _ = {
  async fetch(url: string, req?: FetchRequestOpts) {
    const { baseUrl, headers, fetch: customFetch, ...init } = {
      ...defaults,
      ...req
    };
    const res = await (customFetch || fetch)(baseUrl + url, {
      ...init,
      headers: _.stripUndefined({ ...defaults.headers, ...headers })
    });
    if (!res.ok) {
      throw new HttpError(res.status, res.statusText, baseUrl + url);
    }
    return res.text();
  },

  async fetchJson(url: string, req: FetchRequestOpts = {}) {
    const res = await _.fetch(url, {
      ...req,
      headers: {
        ...req.headers,
        Accept: "application/json"
      }
    });
    return res && JSON.parse(res);
  },

  json({ body, headers, ...req }: JsonRequestOpts) {
    return {
      ...req,
      body: JSON.stringify(body),
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    };
  },

  form({ body, headers, ...req }: JsonRequestOpts) {
    return {
      ...req,
      body: QS.form(body),
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
  },

  multipart({ body, ...req }: MultipartRequestOpts) {
    const data = new FormData();
    Object.entries(body).forEach(([name, value]) => {
      data.append(name, value);
    });
    return {
      ...req,
      body: data
    };
  },

  /**
   * Deeply remove all properties with undefined values.
   */
  stripUndefined<T>(obj: T) {
    return obj && JSON.parse(JSON.stringify(obj));
  },

  // Encode param names and values as URIComponent
  encodeReserved: [encodeURIComponent, encodeURIComponent],
  allowReserved: [encodeURIComponent, encodeURI],

  /**
   * Creates a tag-function to encode template strings with the given encoders.
   */
  encode(encoders: Encoders, delimiter = ",") {
    const q = (v: any, i: number) => {
      const encoder = encoders[i % encoders.length];
      if (typeof v === "object") {
        if (Array.isArray(v)) {
          return v.map(encoder).join(delimiter);
        }
        const flat = Object.entries(v).reduce(
          (flat, entry) => [...flat, ...entry],
          [] as any
        );
        return flat.map(encoder).join(delimiter);
      }

      return encoder(String(v));
    };

    return (strings: TemplateStringsArray, ...values: any[]) => {
      return strings.reduce((prev, s, i) => {
        return `${prev}${s}${q(values[i] || "", i)}`;
      }, "");
    };
  },

  /**
   * Separate array values by the given delimiter.
   */
  delimited(delimiter = ",") {
    return (params: Record<string, any>, encoders = _.encodeReserved) =>
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) => _.encode(encoders, delimiter)`${name}=${value}`)
        .join("&");
  }
};

/**
 * Functions to serialize query parameters in different styles.
 */
export const QS = {
  /**
   * Join params using an ampersand and prepends a questionmark if not empty.
   */
  query(...params: string[]) {
    const s = params.join("&");
    return s && `?${s}`;
  },

  /**
   * Serializes nested objects according to the `deepObject` style specified in
   * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#style-values
   */
  deep(params: Record<string, any>, [k, v] = _.encodeReserved): string {
    const qk = _.encode([s => s, k]);
    const qv = _.encode([s => s, v]);
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
  },

  /**
   * Property values of type array or object generate separate parameters
   * for each value of the array, or key-value-pair of the map.
   * For other types of properties this property has no effect.
   * See https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#encoding-object
   */
  explode(params: Record<string, any>, encoders = _.encodeReserved): string {
    const q = _.encode(encoders);
    return Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => q`${name}=${v}`).join("&");
        }
        if (typeof value === "object") {
          return QS.explode(value, encoders);
        }
        return q`${name}=${value}`;
      })
      .join("&");
  },

  form: _.delimited(),
  pipe: _.delimited("|"),
  space: _.delimited("%20")
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string, url: string) {
    super(`${url} - ${message} (${status})`);
    this.status = status;
  }
}

export type ApiResult<Fn> = Fn extends (...args: any) => Promise<infer T>
  ? T
  : never;
