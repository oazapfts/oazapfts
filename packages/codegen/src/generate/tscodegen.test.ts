import { describe, it, expect } from "vitest";
import {
  createMethod,
  printNode,
  isValidIdentifier,
  getDocComment,
} from "./tscodegen";

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

describe("getDocComment", () => {
  it("returns undefined when there is nothing to document", () => {
    expect(getDocComment()).toBeUndefined();
    expect(getDocComment("", false)).toBeUndefined();
  });

  it("returns the description untouched", () => {
    expect(getDocComment("  keep  spacing ")).toBe("  keep  spacing ");
  });

  it("appends @deprecated on its own line", () => {
    expect(getDocComment("Old", true)).toBe("Old\n@deprecated");
    expect(getDocComment(undefined, true)).toBe("@deprecated");
  });

  it("escapes every comment terminator", () => {
    expect(getDocComment("a */ b */ c")).toBe("a *\\/ b *\\/ c");
  });
});
