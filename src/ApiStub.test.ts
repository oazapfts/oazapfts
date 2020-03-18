import { _, QS } from "./ApiStub";
const { query, pipe, form, space, deep, explode } = QS;

describe("Api", () => {
  let g: any;

  beforeAll(() => {
    g = global as any;
    g.fetch = g.fetch || (() => {});
  });

  it("should use global fetch", () => {
    jest.spyOn(g, "fetch").mockImplementationOnce(() => ({
      ok: true,
      text: () => "hello"
    }));

    _.fetch("bar", { baseUrl: "foo/" });

    expect(g.fetch).toHaveBeenCalledWith("foo/bar", expect.any(Object));
  });

  it("should join urls", () => {
    expect(_.joinUrl("http://example.com/", "/foo")).toEqual(
      "http://example.com/foo"
    );
    expect(_.joinUrl("http://example.com", "foo")).toEqual(
      "http://example.com/foo"
    );
    expect(_.joinUrl("http://example.com", "/foo")).toEqual(
      "http://example.com/foo"
    );
    expect(_.joinUrl("//example.com/", "/foo")).toEqual("//example.com/foo");
    expect(_.joinUrl(undefined, "/foo")).toEqual("/foo");
  });

  it("should not use global fetch if local is provided", () => {
    jest.spyOn(g, "fetch");
    const customFetch = jest.fn(
      () =>
        ({
          ok: true,
          text: () => "hello"
        } as any)
    );

    _.fetch("bar", { baseUrl: "foo/", fetch: customFetch });

    expect(customFetch).toHaveBeenCalledWith("foo/bar", expect.any(Object));
    expect(g.fetch).not.toHaveBeenCalled();
  });
});

describe("delimited", () => {
  it("should use commas", () => {
    expect(form({ id: [3, 4, 5] })).toEqual("id=3,4,5");
  });
  it("should use pipes", () => {
    expect(pipe({ id: [3, 4, 5] })).toEqual("id=3|4|5");
  });
  it("should use spaces", () => {
    expect(space({ id: [3, 4, 5] })).toEqual("id=3%204%205");
  });
  it("should enumerate entries", () => {
    expect(form({ author: { firstName: "Felix", role: "admin" } })).toEqual(
      "author=firstName,Felix,role,admin"
    );
  });
  it("should omit undefined values", () => {
    expect(form({ id: 23, foo: undefined })).toEqual("id=23");
  });
});

describe("explode", () => {
  it("should explode arrays", () => {
    expect(explode({ id: [3, 4, 5] })).toEqual("id=3&id=4&id=5");
  });
  it("should explode objects", () => {
    expect(explode({ author: { firstName: "Felix", role: "admin" } })).toEqual(
      "firstName=Felix&role=admin"
    );
  });
  it("should omit undefined values", () => {
    expect(explode({ id: 23, foo: undefined })).toEqual("id=23");
  });
});

describe("deep", () => {
  it("should serialize objects", () => {
    expect(deep({ author: { firstName: "Felix", role: "admin" } })).toEqual(
      "author[firstName]=Felix&author[role]=admin"
    );
  });
  it("should serialize nested objects", () => {
    expect(
      deep({ author: { name: { first: "Felix", last: "Gnass" } } })
    ).toEqual("author[name][first]=Felix&author[name][last]=Gnass");
  });
  it("should omit undefined values", () => {
    expect(deep({ author: { name: "Felix", role: undefined } })).toEqual(
      "author[name]=Felix"
    );
  });
  it("should serialize nested arrays", () => {
    expect(deep({ names: ["Felix", "Dario"] })).toEqual(
      "names[]=Felix&names[]=Dario"
    );
  });
});

describe("query", () => {
  it("should return an empty string", () => {
    expect(query()).toEqual("");
  });
  it("should add a leading questionmark", () => {
    expect(query("foo=bar")).toEqual("?foo=bar");
  });
  it("should join multiple params", () => {
    expect(query("foo=bar", "boo=baz")).toEqual("?foo=bar&boo=baz");
  });
});
