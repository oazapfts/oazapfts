import * as qs from "./query";

describe("delimited", () => {
  it("should use commas", () => {
    expect(qs.form({ id: [3, 4, 5] })).toEqual("id=3,4,5");
  });
  it("should use pipes for form", () => {
    expect(qs.formPipe({ id: [3, 4, 5] })).toEqual("id=3|4|5");
  });
  it("should use spaces for form", () => {
    expect(qs.formSpace({ id: [3, 4, 5] })).toEqual("id=3%204%205");
  });
  it("should use pipes", () => {
    expect(qs.pipe([3, 4, 5])).toEqual("3|4|5");
  });
  it("should use spaces", () => {
    expect(qs.space([3, 4, 5])).toEqual("3%204%205");
  });
  it("should enumerate entries", () => {
    expect(qs.form({ author: { firstName: "Felix", role: "admin" } })).toEqual(
      "author=firstName,Felix,role,admin"
    );
  });
  it("should omit undefined values", () => {
    expect(qs.form({ id: 23, foo: undefined })).toEqual("id=23");
  });
  it("should keep zeros", () => {
    expect(qs.form({ id: 0 })).toEqual("id=0");
  });
});

describe("explode", () => {
  it("should explode arrays", () => {
    expect(qs.explode({ id: [3, 4, 5] })).toEqual("id=3&id=4&id=5");
  });
  it("should explode objects", () => {
    expect(
      qs.explode({ author: { firstName: "Felix", role: "admin" } })
    ).toEqual("firstName=Felix&role=admin");
  });
  it("should omit undefined values", () => {
    expect(qs.explode({ id: 23, foo: undefined })).toEqual("id=23");
  });
});

describe("deep", () => {
  it("should serialize objects", () => {
    expect(qs.deep({ author: { firstName: "Felix", role: "admin" } })).toEqual(
      "author[firstName]=Felix&author[role]=admin"
    );
  });
  it("should serialize nested objects", () => {
    expect(
      qs.deep({ author: { name: { first: "Felix", last: "Gnass" } } })
    ).toEqual("author[name][first]=Felix&author[name][last]=Gnass");
  });
  it("should omit undefined values", () => {
    expect(qs.deep({ author: { name: "Felix", role: undefined } })).toEqual(
      "author[name]=Felix"
    );
  });
  it("should serialize nested arrays", () => {
    expect(qs.deep({ names: ["Felix", "Dario"] })).toEqual(
      "names[]=Felix&names[]=Dario"
    );
  });
});

describe("query", () => {
  it("should return an empty string", () => {
    expect(qs.query()).toEqual("");
  });
  it("should add a leading questionmark", () => {
    expect(qs.query("foo=bar")).toEqual("?foo=bar");
  });
  it("should join multiple params", () => {
    expect(qs.query("foo=bar", "boo=baz")).toEqual("?foo=bar&boo=baz");
  });
});
