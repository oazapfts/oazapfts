import { joinUrl, parseMultipart } from "./util";

describe("joinUrl", () => {
  it("should join urls", () => {
    expect(joinUrl("http://example.com/", "/foo")).toEqual(
      "http://example.com/foo",
    );
    expect(joinUrl("http://example.com", "foo")).toEqual(
      "http://example.com/foo",
    );
    expect(joinUrl("http://example.com", "/foo")).toEqual(
      "http://example.com/foo",
    );
    expect(joinUrl("//example.com/", "/foo")).toEqual("//example.com/foo");
    expect(joinUrl(undefined, "/foo")).toEqual("/foo");
    expect(joinUrl("/", "/foo")).toEqual("/foo");
    expect(joinUrl("", "/foo/")).toEqual("/foo/");
  });
});

describe("parseMultipart", () => {
  it("should parse repeated fields", async () => {
    const fd = new FormData();
    fd.append("key1", "value1");
    fd.append("key1", "value2");

    const res = await parseMultipart(fd);
    expect(res["key1"]).toEqual(["value1", "value2"]);
  });

  it("should parse json parts", async () => {
    const fd = new FormData();
    fd.append(
      "key1",
      new Blob([JSON.stringify({ foobar: 123 })], { type: "application/json" }),
    );

    const res = await parseMultipart(fd);

    expect(res["key1"]).toEqual({ foobar: 123 });
  });

  it("should parse mixed types", async () => {
    const fd = new FormData();
    fd.append("key1", "value1");
    fd.append(
      "key2",
      new Blob([JSON.stringify({ foobar: 123 })], { type: "application/json" }),
    );
    fd.append("key3", new Blob(["blob"]));

    const res = await parseMultipart(fd);

    expect(res["key1"]).toEqual("value1");
    expect(res["key2"]).toEqual({ foobar: 123 });
    // .text is a method on blobs
    expect(await res["key3"].text()).toEqual("blob");
  });
});
