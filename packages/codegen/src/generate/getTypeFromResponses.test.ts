import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { createContext } from "../context";
import {
  getTypeFromResponses,
  getTypeFromResponse,
} from "./getTypeFromResponses";
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

describe("getTypeFromResponse", () => {
  function makeCtx() {
    return createContext({
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
    } as OpenAPIV3.Document);
  }

  it("returns void for a response with no content", () => {
    const type = getTypeFromResponse({ description: "No Content" }, makeCtx());
    expect(cg.printNode(type)).toBe("void");
  });

  it("returns the schema type for a JSON response", () => {
    const type = getTypeFromResponse(
      {
        description: "OK",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: { name: { type: "string" } },
            },
          },
        },
      },
      makeCtx(),
    );
    expect(cg.printNode(type)).toMatchInlineSnapshot(`
      "{
          name: string;
      }"
    `);
  });

  it("returns string for a plain text response", () => {
    const type = getTypeFromResponse(
      {
        description: "OK",
        content: {
          "text/plain": {
            schema: { type: "string" },
          },
        },
      },
      makeCtx(),
    );
    expect(cg.printNode(type)).toBe("string");
  });
});
