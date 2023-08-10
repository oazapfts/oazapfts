import * as Oazapfts from ".";
import { HttpError, ok } from "../";

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

  beforeAll(() => {
    g = global as any;
    g.fetch = g.fetch || (() => {});
  });

  it("should use global fetch", async () => {
    jest.spyOn(g, "fetch").mockImplementationOnce(fetchMock);

    await oazapfts.fetchText("bar", { baseUrl: "foo/" });

    expect(g.fetch).toHaveBeenCalledWith("foo/bar", expect.any(Object));
  });

  it("should not use global fetch if local is provided", async () => {
    jest.spyOn(g, "fetch");
    const customFetch = jest.fn(fetchMock);

    await oazapfts.fetchText("bar", {
      baseUrl: "foo/",
      fetch: customFetch as any,
    });

    expect(customFetch).toHaveBeenCalledWith("foo/bar", expect.any(Object));
    expect(g.fetch).not.toHaveBeenCalled();
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

  it("should allow 'Content-Type' header to be customized", async () => {
    const jsonUTF8ContentType = "application/json; charset=UTF-8";
    const formUTF8ContentType =
      "application/x-www-form-urlencoded; charset=UTF-8";

    const jsonResponse = oazapfts.json({
      body: { value: "body value" },
      headers: { "Content-Type": jsonUTF8ContentType },
    });
    const formResponse = oazapfts.form({
      body: { value: "body value" },
      headers: { "Content-Type": formUTF8ContentType },
    });

    expect(jsonResponse.headers["Content-Type"]).toEqual(jsonUTF8ContentType);
    expect(formResponse.headers["Content-Type"]).toEqual(formUTF8ContentType);
  });
});
