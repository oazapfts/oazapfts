import { describe, it, expect } from "vitest";
import ApiGenerator, {
  OpenAPIDocument,
  getOperationName,
  isJsonMimeType,
  isMimeType,
} from "./generate";
import { printNode } from "./tscodegen";
import { OpenAPIV3 } from "openapi-types";

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

describe("getUnionType", () => {
  describe("discriminator with propertyName", () => {
    describe("propertyName doesn’t exists", () => {
      it("should use the schema’s name as variant name", () => {
        const spec = {
          components: {
            schemas: {
              LoginSuccess: {
                type: "object",
                properties: {},
              },
              LoginRedirect: {
                type: "object",
                properties: {},
              },
            },
          },
        } as unknown as OpenAPIV3.Document;
        const generator = new ApiGenerator(spec);
        const variants = [
          {
            $ref: "#/components/schemas/LoginSuccess",
          },
          {
            $ref: "#/components/schemas/LoginRedirect",
          },
        ];

        const discriminator = { propertyName: "response_type" };
        const unionTypeNode = generator.getUnionType(variants, discriminator);
        const result = printNode(unionTypeNode);
        expect(result).toBe(`({
    response_type: "LoginSuccess";
} & LoginSuccess) | ({
    response_type: "LoginRedirect";
} & LoginRedirect)`);
      });
    });
    describe("propertyName exists and leads to an enum", () => {
      it("should use the enum given as variant name", () => {
        const spec = {
          components: {
            schemas: {
              LoginSuccess: {
                type: "object",
                properties: {
                  response_type: {
                    type: "string",
                    enum: ["success"],
                  },
                },
              },
              LoginRedirect: {
                type: "object",
                properties: {
                  response_type: {
                    type: "string",
                    enum: ["redirect"],
                  },
                },
              },
            },
          },
        } as unknown as OpenAPIV3.Document;
        const generator = new ApiGenerator(spec);
        const variants = [
          {
            $ref: "#/components/schemas/LoginSuccess",
          },
          {
            $ref: "#/components/schemas/LoginRedirect",
          },
        ];

        const discriminator = { propertyName: "response_type" };
        const unionTypeNode = generator.getUnionType(variants, discriminator);
        const result = printNode(unionTypeNode);
        expect(result).toBe(`({
    response_type: "success";
} & LoginSuccess) | ({
    response_type: "redirect";
} & LoginRedirect)`);
      });
    });
  });
});
