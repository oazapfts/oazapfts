import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { createContext } from "../context";
import { getResponseType } from "./getResponseType";

function createTestContext() {
  return createContext({
    openapi: "3.0.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
  } as OpenAPIV3.Document);
}

describe("getResponseType", () => {
  it("returns text when responses are missing or have no content", () => {
    const ctx = createTestContext();
    expect(getResponseType(ctx)).toBe("text");
    expect(
      getResponseType(ctx, {
        "204": {
          description: "No content",
        },
      }),
    ).toBe("text");
  });

  it("returns json when any response has a json mime type", () => {
    const ctx = createTestContext();
    expect(
      getResponseType(ctx, {
        "200": {
          description: "OK",
          content: {
            "application/problem+json": {
              schema: { type: "object" },
            },
          },
        },
      }),
    ).toBe("json");
  });

  it("returns text for text/* payloads and blob otherwise", () => {
    const ctx = createTestContext();
    expect(
      getResponseType(ctx, {
        "200": {
          description: "OK",
          content: {
            "text/csv": {
              schema: { type: "string" },
            },
          },
        },
      }),
    ).toBe("text");

    expect(
      getResponseType(ctx, {
        "200": {
          description: "OK",
          content: {
            "application/octet-stream": {
              schema: { type: "string", format: "binary" },
            },
          },
        },
      }),
    ).toBe("blob");
  });
});
