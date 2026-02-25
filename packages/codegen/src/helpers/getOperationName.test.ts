import { describe, it, expect } from "vitest";
import { getOperationName, getOperationNames } from "./getOperationName";

describe("getOperationName", () => {
  it("should use the id", () => {
    expect(getOperationName("GET", "/pets", "list pets")).toEqual("listPets");
  });

  it("should use the verb and path", () => {
    expect(getOperationName("GET", "/pets/{color}/{status}")).toEqual(
      "getPetsByColorAndStatus",
    );
  });

  it("should normalize ids with special chars", () => {
    expect(
      getOperationName("GET", "/pets", "API\\PetController::listPetAction"),
    ).toEqual("apiPetControllerListPetAction");
  });

  it("should normalize dotted ids", () => {
    expect(getOperationName("GET", "/users", "scope1.userAccount.get")).toEqual(
      "scope1UserAccountGet",
    );
  });

  it("should normalize ids with dashes and underscores", () => {
    expect(getOperationName("POST", "/items", "create-new_item")).toEqual(
      "createNewItem",
    );
  });
});

describe("getOperationNames", () => {
  it("should return only primaryName for simple operationId", () => {
    const result = getOperationNames("GET", "/pets", "listPets");
    expect(result).toEqual({
      primaryName: "listPets",
    });
    expect(result.deprecatedLegacyName).toBeUndefined();
  });

  it("should return only primaryName when no operationId (fallback)", () => {
    const result = getOperationNames("GET", "/pets");
    expect(result).toEqual({
      primaryName: "getPets",
    });
    expect(result.deprecatedLegacyName).toBeUndefined();
  });

  it("should return deprecatedLegacyName for dotted operationId", () => {
    const result = getOperationNames(
      "GET",
      "/users/{id}",
      "scope1.userAccount.get",
    );
    expect(result).toEqual({
      primaryName: "scope1UserAccountGet",
      deprecatedLegacyName: "getUsersById",
    });
  });

  it("should return deprecatedLegacyName for namespace-style operationId", () => {
    const result = getOperationNames(
      "GET",
      "/pets",
      "API\\PetController::listPetAction",
    );
    expect(result).toEqual({
      primaryName: "apiPetControllerListPetAction",
      deprecatedLegacyName: "getPets",
    });
  });

  it("should return deprecatedLegacyName for operationId with colons", () => {
    const result = getOperationNames("POST", "/items", "items:create");
    expect(result).toEqual({
      primaryName: "itemsCreate",
      deprecatedLegacyName: "postItems",
    });
  });

  it("should not return deprecatedLegacyName for operationId with only word chars and spaces", () => {
    const result = getOperationNames("GET", "/pets", "list all pets");
    expect(result).toEqual({
      primaryName: "listAllPets",
    });
    expect(result.deprecatedLegacyName).toBeUndefined();
  });

  it("should strip leading digits from normalized operationId", () => {
    const result = getOperationNames("GET", "/test", "123.start.method");
    expect(result).toEqual({
      primaryName: "startMethod",
      deprecatedLegacyName: "getTest",
    });
  });

  it("should fallback to verb+path when operationId normalizes to empty string", () => {
    const result = getOperationNames("GET", "/test", "...");
    expect(result).toEqual({
      primaryName: "getTest",
    });
    expect(result.deprecatedLegacyName).toBeUndefined();
  });

  it("should de-collide primary names using operationNames map", () => {
    const operationNames = new Map<string, number>();

    const first = getOperationNames("GET", "/pets", "listPets", operationNames);
    const second = getOperationNames("GET", "/dogs", "listPets", operationNames);

    expect(first.primaryName).toBe("listPets");
    expect(second.primaryName).toBe("listPets2");
  });

  it("should de-collide deprecated legacy alias names as well", () => {
    const operationNames = new Map<string, number>();

    const first = getOperationNames(
      "GET",
      "/pets",
      "API\\PetController::listPetAction",
      operationNames,
    );
    const second = getOperationNames(
      "GET",
      "/pets",
      "API\\PetController::listPetAction",
      operationNames,
    );

    expect(first).toEqual({
      primaryName: "apiPetControllerListPetAction",
      deprecatedLegacyName: "getPets",
    });
    expect(second).toEqual({
      primaryName: "apiPetControllerListPetAction2",
      deprecatedLegacyName: "getPets2",
    });
  });

  it("should de-collide based on usage count plus collision index", () => {
    const operationNames = new Map<string, number>();

    const explicitHello1 = getOperationNames("GET", "/a", "hello1", operationNames);
    const firstHello = getOperationNames("GET", "/b", "hello", operationNames);
    const secondHello = getOperationNames("GET", "/c", "hello", operationNames);
    const thirdHello = getOperationNames("GET", "/d", "hello", operationNames);
    const explicitHello2 = getOperationNames("GET", "/e", "hello2", operationNames);

    expect(explicitHello1.primaryName).toBe("hello1");
    expect(firstHello.primaryName).toBe("hello");
    expect(secondHello.primaryName).toBe("hello2");
    expect(thirdHello.primaryName).toBe("hello3");
    expect(explicitHello2.primaryName).toBe("hello22");
  });
});
