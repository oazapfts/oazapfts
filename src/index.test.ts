import { getOperationName, generateApi } from "./index";

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

describe("createApi", () => {
  it("should generate an api", () => {
    generateApi(require("../demo/petstore.json"));
  });
});
