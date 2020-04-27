import * as Oazapfts from ".";

const oazapfts = Oazapfts.runtime({});

describe("request", () => {
  let g: any;

  beforeAll(() => {
    g = global as any;
    g.fetch = g.fetch || (() => {});
  });

  it("should use global fetch", () => {
    jest.spyOn(g, "fetch").mockImplementationOnce(() => ({
      ok: true,
      text: () => "hello",
    }));

    oazapfts.fetchText("bar", { baseUrl: "foo/" });

    expect(g.fetch).toHaveBeenCalledWith("foo/bar", expect.any(Object));
  });

  it("should not use global fetch if local is provided", () => {
    jest.spyOn(g, "fetch");
    const customFetch = jest.fn(
      () =>
        ({
          ok: true,
          text: () => "hello",
        } as any)
    );

    oazapfts.fetchText("bar", { baseUrl: "foo/", fetch: customFetch });

    expect(customFetch).toHaveBeenCalledWith("foo/bar", expect.any(Object));
    expect(g.fetch).not.toHaveBeenCalled();
  });
});
