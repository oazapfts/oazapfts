import * as qs from "./query";
import { joinUrl } from "./util";
import { ok } from "./index";
import { CustomHeaders, mergeHeaders, normalizeHeaders } from "./headers";

export { type CustomHeaders };

export type RequestOpts = {
  baseUrl?: string;
  fetch?: typeof fetch;
  formDataConstructor?: new () => FormData;
  headers?: HeadersInit | CustomHeaders;
} & Omit<RequestInit, "body" | "headers">;

export type Defaults<Headers extends RequestOpts["headers"] = CustomHeaders> =
  Omit<RequestOpts, "headers" | "baseUrl"> & {
    baseUrl: string;
    headers: Headers;
  };

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

export function runtime(defaults: RequestOpts = {}) {
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
      headers: mergeHeaders(
        {
          Accept: "application/json",
        },
        req.headers,
      ),
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

  async function doFetch(url: string, req: FetchRequestOpts = {}) {
    const {
      baseUrl,
      fetch: customFetch,
      ...init
    } = {
      ...defaults,
      ...req,
      headers: mergeHeaders(defaults.headers, req.headers),
    };
    const href = joinUrl(baseUrl, url);
    const res = await (customFetch || fetch)(href, init);
    return res;
  }

  return {
    ok,
    fetchText,
    fetchJson,
    fetchBlob,
    mergeHeaders,

    json({ body, headers, ...req }: JsonRequestOpts) {
      return {
        ...req,
        ...(body != null && { body: JSON.stringify(body) }),
        headers: mergeHeaders(
          {
            "Content-Type": "application/json",
          },
          headers,
        ),
      };
    },

    form({ body, headers, ...req }: FormRequestOpts) {
      return {
        ...req,
        ...(body != null && { body: qs.form(body) }),
        headers: mergeHeaders(
          {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          headers,
        ),
      };
    },

    multipart({ body, headers, ...req }: MultipartRequestOpts) {
      if (body == null)
        return { ...req, body, headers: normalizeHeaders(headers) };

      const data = new (req.formDataConstructor ||
        defaults.formDataConstructor ||
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
        headers: normalizeHeaders(headers),
      };
    },
  };
}
