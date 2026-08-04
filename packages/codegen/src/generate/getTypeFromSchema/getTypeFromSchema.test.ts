import { describe, it, expect } from "vitest";
import { printNode } from "../tscodegen";
import { getTypeFromSchema } from "./getTypeFromSchema";
import { createContext } from "../../context";
import { OpenAPIV3 } from "openapi-types";

describe("getTypeFromSchema", () => {
  it("should generate type with required properties when extending a schema with the 'allOf' operator", () => {
    const node = getTypeFromSchema(
      createContext({} as unknown as OpenAPIV3.Document, {}),
      {
        type: "object",
        allOf: [
          {
            type: "object",
            properties: {
              firstName: {
                type: "string",
              },
              secondName: {
                type: "string",
              },
            },
          },
        ],
        required: ["firstName"],
      },
      "Person",
    );

    expect(printNode(node)).toMatchInlineSnapshot(`
      "{
          firstName: string;
          secondName?: string;
      }"
    `);
  });

  it("should apply 'required' of an 'allOf' member to properties of its siblings", () => {
    const spec = {
      components: {
        schemas: {
          ApiResponseWrapper: {
            type: "object",
            required: ["status", "data"],
            properties: {
              status: { type: "integer" },
              data: { description: "The operation payload." },
            },
          },
        },
      },
    } as unknown as OpenAPIV3.Document;

    const node = getTypeFromSchema(
      createContext(spec, {}),
      {
        allOf: [
          { $ref: "#/components/schemas/ApiResponseWrapper" },
          {
            type: "object",
            properties: {
              data: {
                type: "object",
                required: ["id"],
                properties: { id: { type: "string" } },
              },
            },
          },
        ],
      },
      "Thing",
    );

    expect(printNode(node)).toMatchInlineSnapshot(`
      "Omit<ApiResponseWrapper, "data"> & {
          data: {
              id: string;
          };
      }"
    `);
  });

  it("should drop unconstrained properties that an 'allOf' sibling constrains", () => {
    const node = getTypeFromSchema(
      createContext({} as unknown as OpenAPIV3.Document, {}),
      {
        allOf: [
          {
            type: "object",
            properties: {
              data: { description: "The operation payload." },
              status: { type: "integer" },
            },
          },
          {
            type: "object",
            required: ["data"],
            properties: { data: { type: "string" } },
          },
        ],
      },
      "Thing",
    );

    expect(printNode(node)).toMatchInlineSnapshot(`
      "{
          status?: number;
      } & {
          data: string;
      }"
    `);
  });
});
