import { describe, it, expect } from "vitest";
import ts from "typescript";
import {
  createDefaultsStatement,
  createHeaderValueLiteral,
} from "./createDefaultsStatement";
import * as cg from "./tscodegen";

describe("createDefaultsStatement", () => {
  it("creates defaults statement with filtered headers and optional fields", () => {
    const statement = createDefaultsStatement({
      headers: {
        "x-string": "value",
        "x-number": 42,
        "x-bool": true,
        "x-null": null,
        "x-skip": undefined,
      },
      baseUrl: "https://api.example.com",
      fetch: ts.factory.createIdentifier("customFetch"),
      FormData: ts.factory.createIdentifier("NodeFormData"),
    });

    expect(cg.printNode(statement)).toMatchInlineSnapshot(`
      "export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
          headers: { "x-string": "value", "x-number": 42, "x-bool": true, "x-null": null },
          baseUrl: "https://api.example.com",
          fetch: customFetch,
          FormData: NodeFormData
      };"
    `);
  });

  it("always creates headers object even when defaults are empty", () => {
    const statement = createDefaultsStatement({});

    expect(cg.printNode(statement)).toMatchInlineSnapshot(`
      "export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
          headers: {}
      };"
    `);
  });
});

describe("createHeaderValueLiteral", () => {
  it("converts primitive values to matching literal nodes", () => {
    expect(cg.printNode(createHeaderValueLiteral("abc"))).toBe(`"abc"`);
    expect(cg.printNode(createHeaderValueLiteral(7))).toBe("7");
    expect(cg.printNode(createHeaderValueLiteral(true))).toBe("true");
    expect(cg.printNode(createHeaderValueLiteral(false))).toBe("false");
    expect(cg.printNode(createHeaderValueLiteral(null))).toBe("null");
    expect(cg.printNode(createHeaderValueLiteral(undefined))).toBe(`"undefined"`);
  });
});
