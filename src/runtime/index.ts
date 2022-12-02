import * as qs from "./query";
import { joinUrl, stripUndefined } from "./util";
import { ok } from "../";

export type RequestOpts = {
  baseUrl?: string;
  fetch?: typeof fetch;
  formDataConstructor?: new () => FormData;
  headers?: Record<string, string | undefined>;
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
  body?: Record<string, string | Blob | undefined | any>;
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
    req: FetchRequestOpts = {}
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
    req: FetchRequestOpts = {}
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

  return {
    ok,
    fetchText,
    fetchJson,
    fetchBlob,

    json({ body, headers, ...req }: JsonRequestOpts) {
      return {
        ...req,
        ...(body != null && { body: JSON.stringify(body) }),
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      };
    },

    form({ body, headers, ...req }: FormRequestOpts) {
      return {
        ...req,
        ...(body != null && { body: qs.form(body) }),
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
    },

    multipart({ body, ...req }: MultipartRequestOpts) {
      if (body == null) return req;
      const data = new (defaults.formDataConstructor ||
        req.formDataConstructor ||
        FormData)();
      Object.entries(body).forEach(([name, value]) => {
        data.append(name, value);
      });
      return {
        ...req,
        body: data,
      };
    },
  };
}
