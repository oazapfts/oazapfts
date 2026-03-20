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
});
