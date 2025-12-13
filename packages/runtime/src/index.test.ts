import {
  describe,
  beforeAll,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import * as Oazapfts from "./runtime";
import { HttpError, ok } from "./index";

const oazapfts = Oazapfts.runtime({});

const fetchMock = () => ({
  ok: true,
  text: "hello",
  headers: {
    get: (name: string) => undefined,
  },
});

describe("request", () => {
  let g: any;
  let fetchSpy: any;

  beforeAll(async () => {
    g = global as any;
    g.fetch = g.fetch || (() => {});
  });

  beforeEach(() => {
    fetchSpy = vi.spyOn(g, "fetch").mockImplementation(fetchMock);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("should use global fetch", async () => {
    await oazapfts.fetchText("bar", { baseUrl: "foo/" });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith("foo/bar", expect.any(Object));
  });

  it("should not use global fetch if local is provided", async () => {
    const customFetch = vi.fn(fetchMock);

    await oazapfts.fetchText("bar", {
      baseUrl: "foo/",
      fetch: customFetch as any,
    });

    expect(customFetch).toHaveBeenCalledWith("foo/bar", expect.any(Object));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should throw error with headers", async () => {
    const fn = () =>
      ok(
        oazapfts.fetchText("bar", {
          fetch: async () => {
            return new Response("", {
              status: 401,
              headers: { "x-request-id": "1234" },
            });
          },
        }),
      );

    let throwed;
    let err: HttpError | undefined;
    try {
      await fn();
    } catch (e) {
      err = e as HttpError;
      throwed = true;
    }

    expect(throwed).toBe(true);
    expect(err).toBeInstanceOf(HttpError);
    expect(err?.headers?.get("x-request-id")).toBe("1234");
  });

  it("allows 'Content-Type' header to be customized", () => {
    const jsonUTF8ContentType = "application/json; charset=UTF-8";
    const formUTF8ContentType =
      "application/x-www-form-urlencoded; charset=UTF-8";
    const customContentType = "application/acme-custom; charset=UTF-8";

    const jsonRequest = oazapfts.json({
      body: { value: "body value" },
      headers: { "Content-Type": jsonUTF8ContentType },
    });
    const formRequest = oazapfts.form({
      body: { value: "body value" },
      headers: { "Content-Type": formUTF8ContentType },
    });
    const multipartRequest = oazapfts.multipart({
      body: { value: "body value" },
      headers: { "Content-Type": customContentType },
    });

    expect(jsonRequest.headers.get("Content-Type")).toBe(jsonUTF8ContentType);
    expect(formRequest.headers.get("Content-Type")).toBe(formUTF8ContentType);
    expect(multipartRequest.headers.get("Content-Type")).toBe(
      customContentType,
    );
  });

  it("sets default Content-Type headers to json and form requests", () => {
    expect(
      oazapfts
        .json({
          body: { value: "body value" },
        })
        .headers.get("Content-Type"),
    ).toBe("application/json");

    expect(
      oazapfts
        .form({
          body: { value: "body value" },
        })
        .headers.get("Content-Type"),
    ).toBe("application/x-www-form-urlencoded");
  });

  // https://github.com/oazapfts/oazapfts/issues/512
  it("does not set default Content-Type headers for multipart requests", () => {
    expect(
      oazapfts
        .multipart({
          body: { value: "body value" },
        })
        .headers.has("Content-Type"),
    ).toBe(false);
  });

  it("casts numbers and booleans to strings while forming multipart/form-data", () => {
    const multipartRequest = oazapfts.multipart({
      body: {
        numberValue: 42,
        booleanValue: true,
      },
    });

    expect(multipartRequest.body?.get("booleanValue")).toBe("true");
    expect(multipartRequest.body?.get("numberValue")).toBe("42");
  });

  it("allows multiple headers with the same name", () => {
    const headers = new Headers();
    headers.append("x-header", "value1");
    headers.append("x-header", "value2");
    const request = oazapfts.json({ headers });

    expect(request.headers.get("x-header")).toBe("value1, value2");
  });
});
