import generate, { getOperationName } from "./generate";
import { printAst } from "./index";

describe("getOperationName", () => {
  it("should use the id", () => {
    expect(getOperationName("GET", "/pets", "list pets")).toEqual("listPets");
  });
  it("should use the verb and path", () => {
    expect(getOperationName("GET", "/pets/{color}/{status}")).toEqual(
      "getPetsByColorAndStatus"
    );
  });
  it("should not use ids with special chars", () => {
    expect(
      getOperationName("GET", "/pets", "API\\PetController::listPetAction")
    ).toEqual("getPets");
  });
});

describe("generate", () => {
  let artefact: string;
  it("should generate an api", () => {
    artefact = printAst(generate(require("../../demo/petstore.json")));
  });

  /* https://github.com/cotype/build-client/issues/5 */
  it("should generate same api a second time", () => {
    expect(printAst(generate(require("../../demo/petstore.json")))).toBe(
      artefact
    );
  });
});
