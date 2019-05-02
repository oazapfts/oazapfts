import generate, { getOperationName } from "./generate";

describe("getOperationName", () => {
  it("should use the id", () => {
    expect(getOperationName("GET", "/pets", "list pets")).toEqual("listPets");
  });
  it("should use the verb and path", () => {
    expect(getOperationName("GET", "/pets/{color}/{status}")).toEqual(
      "getPetsByColorAndStatus"
    );
  });
});

describe("generate", () => {
  it("should generate an api", () => {
    generate(require("../demo/petstore.json"));
  });
});
