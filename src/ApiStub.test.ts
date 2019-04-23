import { QS } from "./ApiStub";
const { query, pipe, form, space, deep, explode } = QS;

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
