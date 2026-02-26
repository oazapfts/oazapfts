import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { createContext } from "../context";
import { getTypeFromResponses } from "./getTypeFromResponses";
import * as cg from "./tscodegen";

describe("getTypeFromResponses", () => {
  it("builds a discriminated union with status and data when available", () => {
    const ctx = createContext({
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
    } as OpenAPIV3.Document);

    const type = getTypeFromResponses(
      {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id"],
                properties: { id: { type: "number" } },
              },
            },
          },
        },
        "204": {
          description: "No content",
        },
        default: {
          description: "Fallback",
          content: {
            "text/plain": {
              schema: { type: "string" },
            },
          },
        },
      },
      ctx,
    );

    expect(cg.printNode(type)).toMatchInlineSnapshot(`
      "{
          status: 200;
          data: {
              id: number;
          };
      } | {
          status: 204;
      } | {
          status: number;
          data: string;
      }"
    `);
  });
});
