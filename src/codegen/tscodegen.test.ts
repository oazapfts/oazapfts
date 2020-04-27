import { createMethod, printNode, isValidIdentifier } from "./tscodegen";

describe("isValidIdentifier", () => {
  it("should return true for valid identifiers", () => {
    expect(isValidIdentifier("foo42")).toBe(true);
    expect(isValidIdentifier("_Foo")).toBe(true);
  });
  it("should return false for invalid identifiers", () => {
    expect(isValidIdentifier("")).toBe(false);
    expect(isValidIdentifier("42foo")).toBe(false);
    expect(isValidIdentifier("foo bar")).toBe(false);
    expect(isValidIdentifier("foo bar")).toBe(false);
  });
});

describe("createMethod", () => {
  it("should generate a method", () => {
    printNode(createMethod("foo"));
  });
});
