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
  body?: object;
};

export type ApiResponse<S extends number = number, T = unknown> = Omit<
  Response,
  keyof Body | "status"
> & {
  status: S;
  data: T;
};

type MultipartRequestOpts = RequestOpts & {
  body?: Record<string, string | Blob | undefined | any>;
};

export function runtime(defaults: RequestOpts) {
  async function fetchText(
    url: string,
    req?: FetchRequestOpts
  ): Promise<ApiResponse<number, string | undefined> & { contentType: string | null }> {
    const res = await doFetch(url, req);
    let data;
    try {
      data = await res.text();
    } catch (err) {}

    return Object.assign(res, {
      contentType: res.headers.get("content-type"),
      data,
    });
  }

  async function fetchJson<T extends ApiResponse>(
    url: string,
    req: FetchRequestOpts = {}
  ): Promise<T> {
    const res = await fetchText(url, {
      ...req,
      headers: {
        ...req.headers,
        Accept: "application/json",
      },
    });

    const { contentType, data } = res;
    const jsonTypes = [
      "application/json",
      "application/hal+json",
      "application/problem+json",
    ];
    const isJson = contentType
      ? jsonTypes.some((mimeType) => contentType.includes(mimeType))
      : false;

    if (isJson) {
      return Object.assign(res, {
        data: data ? JSON.parse(data) : null,
      }) as ApiResponse as T;
    }

    return Object.assign(res, { data }) as ApiResponse as T;
  }

  async function fetchBlob<T extends ApiResponse>(
    url: string,
    req: FetchRequestOpts = {}
  ): Promise<T> {
    const res = await doFetch(url, req);
    let data;
    try {
      data = await res.blob();
    } catch (err) {}
    return Object.assign(res, { data }) as ApiResponse as T;
  }

  async function doFetch(
    url: string,
    req: FetchRequestOpts = {}
  ): Promise<Response> {
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
    return (customFetch || fetch)(href, {
      ...init,
      headers: stripUndefined({ ...defaults.headers, ...headers }),
    });
  }

  return {
    ok,
    fetchText,
    fetchJson,
    fetchBlob,

    json({ body, headers, ...req }: JsonRequestOpts) {
      return {
        ...req,
        ...(body && { body: JSON.stringify(body) }),
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
      };
    },

    form({ body, headers, ...req }: JsonRequestOpts) {
      return {
        ...req,
        ...(body && { body: qs.form(body) }),
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
    },

    multipart({ body, ...req }: MultipartRequestOpts) {
      if (!body) return req;
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
