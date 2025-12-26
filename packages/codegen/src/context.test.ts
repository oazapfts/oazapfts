import { describe, expect, it } from "vitest";
import { createContext } from "./context";
import { printNodes } from "./generate/tscodegen";
import type { Document } from "./helpers/openApi3-x";

function minimalSpec(overrides: Partial<Document> = {}): Document {
  return {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: {},
    ...overrides,
  } as Document;
}

describe("createContext", () => {
  it("creates a context with stable template parts and empty internal state", () => {
    const spec = minimalSpec();
    const ctx = createContext(spec);

    // Template parts (API contract)
    expect(ctx.banner)
      .toBe(`DO NOT MODIFY - This file has been generated using oazapfts.
See https://www.npmjs.com/package/oazapfts`);

    expect(ctx.imports).toEqual([
      [{ namespace: "Oazapfts" }, { from: "@oazapfts/runtime" }],
      [{ namespace: "QS" }, { from: "@oazapfts/runtime/query" }],
    ]);

    expect(ctx.defaults).toEqual({ baseUrl: "/", headers: {} });
    expect(ctx.servers).toEqual([]);

    // Internal state starts empty
    expect(ctx.discriminatingSchemas).toBeInstanceOf(Set);
    expect(ctx.discriminatingSchemas.size).toBe(0);
    expect(ctx.aliases).toEqual([]);
    expect(ctx.enumAliases).toEqual([]);
    expect(ctx.enumRefs).toEqual({});
    expect(ctx.refs).toEqual({});
    expect(ctx.refsOnlyMode).toBeInstanceOf(Map);
    expect(ctx.refsOnlyMode.size).toBe(0);
    expect(ctx.typeAliases).toEqual({});
  });

  it("computes defaults.baseUrl from the first server, including variable defaults", () => {
    const spec = minimalSpec({
      servers: [
        {
          url: "http://example.{tld}/{path}",
          variables: {
            tld: { default: "org", enum: ["org", "com"] },
            path: { default: "" },
          },
        },
      ],
    });

    const ctx = createContext(spec);
    expect(ctx.defaults.baseUrl).toBe("http://example.org/");
  });

  it("clones the input spec into ctx.spec (ctx.inputSpec keeps the original reference)", () => {
    const spec = minimalSpec({
      servers: [{ url: "http://example.org" }],
      info: { title: "Original", version: "1.0.0" },
    });

    const ctx = createContext(spec);

    // ctx.spec is a deep clone: changing one does not affect the other
    ctx.spec.info.title = "Changed in ctx.spec";
    expect(spec.info.title).toBe("Original");

    spec.info.title = "Changed in input";
    expect(ctx.spec.info.title).toBe("Changed in ctx.spec");

    // Arrays are cloned too (servers comes from the cloned spec)
    expect(ctx.servers).not.toBe(spec.servers);
    expect(ctx.servers).toEqual([{ url: "http://example.org" }]);
  });

  it("creates init statements for: const oazapfts = Oazapfts.runtime(defaults);", () => {
    const ctx = createContext(minimalSpec());

    expect(printNodes(ctx.init)).toMatchInlineSnapshot(`
      "const oazapfts = Oazapfts.runtime(defaults);"
    `);
  });
});
