import * as qs from "./query";
import { joinUrl, parseMultipart, stripUndefined } from "./util";
import { ok } from "../";

export type RequestOpts = {
  baseUrl?: string;
  fetch?: typeof fetch;
  formDataConstructor?: new () => FormData;
  headers?: Record<string, string | number | boolean | undefined>;
} & Omit<RequestInit, "body" | "headers">;

type FetchRequestOpts = RequestOpts & {
  body?: string | FormData | Blob;
};

type JsonRequestOpts = RequestOpts & {
  body?: any;
};

type FormRequestOpts = RequestOpts & {
  body?: Record<string, any>;
};

export type ApiResponse = { status: number; data?: any };

export type WithHeaders<T extends ApiResponse> = T & { headers: Headers };

type MultipartRequestOpts = RequestOpts & {
  body?: Record<string, unknown>;
};

export function runtime(defaults: RequestOpts) {
  async function fetchText(url: string, req?: FetchRequestOpts) {
    const res = await doFetch(url, req);
    let data;
    try {
      data = await res.text();
    } catch (err) {}

    return {
      status: res.status,
      headers: res.headers,
      contentType: res.headers.get("content-type"),
      data,
    };
  }

  async function fetchJson<T extends ApiResponse>(
    url: string,
    req: FetchRequestOpts = {},
  ) {
    const { status, headers, contentType, data } = await fetchText(url, {
      ...req,
      headers: {
        Accept: "application/json",
        ...req.headers,
      },
    });

    const isJson = contentType ? contentType.includes("json") : false;

    if (isJson) {
      return {
        status,
        headers,
        data: data ? JSON.parse(data) : null,
      } as WithHeaders<T>;
    }

    return { status, headers, data } as WithHeaders<T>;
  }

  async function fetchBlob<T extends ApiResponse>(
    url: string,
    req: FetchRequestOpts = {},
  ) {
    const res = await doFetch(url, req);
    let data;
    try {
      data = await res.blob();
    } catch (err) {}
    return { status: res.status, headers: res.headers, data } as WithHeaders<T>;
  }

  async function fetchMultipart<T extends ApiResponse>(
    url: string,
    req: FetchRequestOpts = {},
  ) {
    const res = await doFetch(url, req);
    let data;
    try {
      data = parseMultipart(await res.formData());
    } catch (err) {}

    return { status: res.status, headers: res.headers, data } as WithHeaders<T>;
  }

  async function doFetch(url: string, req: FetchRequestOpts = {}) {
    const {
      baseUrl,
      headers,
      fetch: customFetch,
      ...init
    } = {
      ...defaults,
      ...req,
    };
    const href = joinUrl(baseUrl, url);
    const res = await (customFetch || fetch)(href, {
      ...init,
      headers: stripUndefined({ ...defaults.headers, ...headers }),
    });
    return res;
  }

  /* TODO: maybe we want to get rid of this checks (ensureJsonContentType & ensureFormContentType)
  in a future major release (ref https://github.com/oazapfts/oazapfts/pull/456) */
  function ensureJsonContentType(contentTypeHeader: string) {
    return contentTypeHeader?.match(/\bjson\b/i)
      ? contentTypeHeader
      : "application/json";
  }

  function ensureFormContentType(contentTypeHeader: string) {
    return contentTypeHeader?.startsWith("application/x-www-form-urlencoded")
      ? contentTypeHeader
      : "application/x-www-form-urlencoded";
  }

  function ensureMultipartContentType(contentTypeHeader: string) {
    return contentTypeHeader?.startsWith("multipart/form-data")
      ? contentTypeHeader
      : "multipart/form-data";
  }

  return {
    ok,
    fetchText,
    fetchJson,
    fetchBlob,
    fetchMultipart,

    json({ body, headers, ...req }: JsonRequestOpts) {
      return {
        ...req,
        ...(body != null && { body: JSON.stringify(body) }),
        headers: {
          ...headers,
          "Content-Type": ensureJsonContentType(
            String(headers?.["Content-Type"]),
          ),
        },
      };
    },

    form({ body, headers, ...req }: FormRequestOpts) {
      return {
        ...req,
        ...(body != null && { body: qs.form(body) }),
        headers: {
          ...headers,
          "Content-Type": ensureFormContentType(
            String(headers?.["Content-Type"]),
          ),
        },
      };
    },

    multipart({ body, headers, ...req }: MultipartRequestOpts) {
      if (body == null) return req;
      const data = new (defaults.formDataConstructor ||
        req.formDataConstructor ||
        FormData)();

      const append = (name: string, value: unknown) => {
        if (typeof value === "string" || value instanceof Blob) {
          data.append(name, value);
        } else {
          data.append(
            name,
            new Blob([JSON.stringify(value)], { type: "application/json" }),
          );
        }
      };

      Object.entries(body).forEach(([name, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => append(name, v));
        } else {
          append(name, value);
        }
      });

      return {
        ...req,
        body: data,
        headers: {
          ...headers,
          "Content-Type": ensureMultipartContentType(
            String(headers?.["Content-Type"]),
          ),
        },
      };
    },
  };
}
