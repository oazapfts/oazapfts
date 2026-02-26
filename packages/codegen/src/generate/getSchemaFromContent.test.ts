import { describe, it, expect } from "vitest";
import { getSchemaFromContent } from "./getSchemaFromContent";

describe("getSchemaFromContent", () => {
  it("returns schema from the first supported mime type", () => {
    const schema = getSchemaFromContent({
      "application/json": {
        schema: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
    });

    expect(schema).toEqual({
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    });
  });

  it("falls back to string for empty and text content", () => {
    expect(getSchemaFromContent({})).toEqual({ type: "string" });
    expect(
      getSchemaFromContent({
        "text/plain": {},
      }),
    ).toEqual({ type: "string" });
  });

  it("falls back to binary for non-text non-json payloads without schema", () => {
    expect(
      getSchemaFromContent({
        "application/octet-stream": {},
      }),
    ).toEqual({
      type: "string",
      format: "binary",
    });
  });
});
