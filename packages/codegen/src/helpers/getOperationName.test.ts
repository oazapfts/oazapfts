import { describe, it, expect } from "vitest";
import { getOperationName } from "./getOperationName";

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
