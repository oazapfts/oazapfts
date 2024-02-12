import { describe, it, expect } from "vitest";
import { getOperationName, isJsonMimeType, isMimeType } from "./generate";

describe("getOperationName", () => {
  it("should use the id", () => {
    expect(getOperationName("GET", "/pets", "list pets")).toEqual("listPets");
  });
  it("should use the verb and path", () => {
    expect(getOperationName("GET", "/pets/{color}/{status}")).toEqual(
      "getPetsByColorAndStatus",
    );
  });
  it("should not use ids with special chars", () => {
    expect(
      getOperationName("GET", "/pets", "API\\PetController::listPetAction"),
    ).toEqual("getPets");
  });
});

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
