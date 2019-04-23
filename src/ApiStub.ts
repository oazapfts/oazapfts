/**
 * DO NOT MODIFY - This file has been generated using oazapfts.
 */
type Encoders = Array<(s: string) => string>;

// Encode param names and values as URIComponent
const encodeReserved = [encodeURIComponent, encodeURIComponent];

// Allow reserved chars in param values
const allowReserved = [encodeURIComponent, encodeURI];

type RequestOpts = {
  headers?: Record<string, string | undefined>;
  method?: string;
};

type FetchRequestOpts = RequestOpts & {
  body?: string | FormData;
};

type JsonRequestOpts = RequestOpts & {
  body: object;
};

type MultipartRequestOpts = RequestOpts & {
  body: Record<string, string | Blob | undefined | any>;
};

export class Api {
  private _baseUrl: string;
  private _fetchOpts: RequestInit;

  constructor({
    baseUrl = "",
    ...fetchOpts
  }: { baseUrl?: string } & RequestInit = {}) {
    this._baseUrl = baseUrl;
    this._fetchOpts = fetchOpts;
  }

  private async _fetch(url: string, req: FetchRequestOpts = {}) {
    // remove headers with undefined keys...
    const headers = req.headers && JSON.parse(JSON.stringify(req.headers));
    const res = await fetch(this._baseUrl + url, {
      ...this._fetchOpts,
      ...req,
      headers
    });
    return res.text();
  }

  private async _fetchJson(url: string, req: FetchRequestOpts = {}) {
    const res = await this._fetch(url, {
      ...req,
      headers: {
        ...req.headers,
        Accept: "application/json"
      }
    });
    return JSON.parse(res);
  }

  private _json({ body, headers, ...req }: JsonRequestOpts) {
    return {
      ...req,
      body: JSON.stringify(body),
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    };
  }

  private _form({ body, headers, ...req }: JsonRequestOpts) {
    return {
      ...req,
      body: QS.form(body),
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
  }

  private _multipart({ body, ...req }: MultipartRequestOpts) {
    const data = new FormData();
    Object.entries(body).forEach(([name, value]) => {
      data.append(name, value);
    });
    return {
      ...req,
      body: data
    };
  }
}

/**
 * Creates a tag-function to encode template strings with the given encoders.
 */
function encode(encoders: Encoders, delimiter = ",") {
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
}

/**
 * Separate array values by the given delimiter.
 */
function delimited(delimiter = ",") {
  return (params: Record<string, any>, encoders = encodeReserved) =>
    Object.entries(params)
      .map(([name, value]) => encode(encoders, delimiter)`${name}=${value}`)
      .join("&");
}

/**
 * Functions to serialize query paramters in different styles.
 */
export const QS = {
  encode,
  encodeReserved,
  allowReserved,

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
  deep(params: Record<string, any>, [k, v] = encodeReserved): string {
    const qk = encode([s => s, k]);
    const qv = encode([s => s, v]);
    const visit = (obj: any, prefix = ""): string =>
      Object.entries(obj)
        .map(([prop, v]) => {
          const key = prefix ? qk`${prefix}[${prop}]` : prop;
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
  explode(params: Record<string, any>, encoders = encodeReserved): string {
    const q = encode(encoders);
    return Object.entries(params)
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

  form: delimited(),
  pipe: delimited("|"),
  space: delimited("%20")
};
