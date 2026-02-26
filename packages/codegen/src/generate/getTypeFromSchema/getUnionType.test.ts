import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { printNode } from "../tscodegen";
import { createContext } from "../../context";
import { getUnionType } from "./getUnionType";

describe("getUnionType", () => {
  describe("discriminator with propertyName", () => {
    describe("propertyName doesn't exists", () => {
      it("should use the schema's name as variant name", () => {
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
        const variants = [
          {
            $ref: "#/components/schemas/LoginSuccess",
          },
          {
            $ref: "#/components/schemas/LoginRedirect",
          },
        ];

        const discriminator = { propertyName: "response_type" };
        const unionTypeNode = getUnionType(
          variants,
          createContext(spec, {}),
          discriminator,
        );
        const result = printNode(unionTypeNode);
        expect(result).toMatchInlineSnapshot(`
          "({
              response_type: "LoginSuccess";
          } & LoginSuccess) | ({
              response_type: "LoginRedirect";
          } & LoginRedirect)"
        `);
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
        const variants = [
          {
            $ref: "#/components/schemas/LoginSuccess",
          },
          {
            $ref: "#/components/schemas/LoginRedirect",
          },
        ];

        const discriminator = { propertyName: "response_type" };
        const unionTypeNode = getUnionType(
          variants,
          createContext(spec, {}),
          discriminator,
        );
        const result = printNode(unionTypeNode);
        expect(result).toMatchInlineSnapshot(`
          "({
              response_type: "success";
          } & LoginSuccess) | ({
              response_type: "redirect";
          } & LoginRedirect)"
        `);
      });
    });
  });
});
