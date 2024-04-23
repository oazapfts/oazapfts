import { describe, it, expect } from "vitest";
import { isMimeType, isJsonMimeType } from "./mimeTypes";

describe("content types", () => {
  it("should identify strings that look like mime types", () => {
    expect(isMimeType("*/*")).toBe(true);
    expect(isMimeType("foo/bar")).toBe(true);
    expect(isMimeType("foo/bar+baz")).toBe(true);
    expect(isMimeType(undefined)).toBe(false);
    expect(isMimeType("")).toBe(false);
    expect(isMimeType("foo")).toBe(false);
    expect(isMimeType("foo/bar/boo")).toBe(false);
  });

  it("should treat some content types as json", () => {
    expect(isJsonMimeType("application/json")).toBe(true);
    expect(isJsonMimeType("application/json+foo")).toBe(true);
    expect(isJsonMimeType("*/*")).toBe(true);
    expect(isJsonMimeType("text/plain")).toBe(false);
  });
});
