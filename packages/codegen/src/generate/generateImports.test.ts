import { describe, it, expect } from "vitest";
import { createImportStatement } from "./generateImports";
import * as cg from "./tscodegen";

describe("createImportStatement", () => {
  it("creates side effect imports", () => {
    expect(
      cg.printNode(createImportStatement("@oazapfts/runtime")),
    ).toMatchInlineSnapshot(`"import "@oazapfts/runtime";"`);
  });

  it("creates namespace imports", () => {
    expect(
      cg.printNode(
        createImportStatement([{ namespace: "Oazapfts" }, { from: "runtime" }]),
      ),
    ).toMatchInlineSnapshot(`"import * as Oazapfts from "runtime";"`);
  });

  it("creates default imports", () => {
    expect(
      cg.printNode(createImportStatement(["Client", { from: "./client" }])),
    ).toMatchInlineSnapshot(`"import Client from "./client";"`);
  });

  it("creates named imports with aliases", () => {
    expect(
      cg.printNode(
        createImportStatement([
          ["foo", { name: "bar", as: "baz" }],
          { from: "./shared" },
        ]),
      ),
    ).toMatchInlineSnapshot(`"import { foo, bar as baz } from "./shared";"`);
  });

  it("creates mixed default and named imports", () => {
    expect(
      cg.printNode(
        createImportStatement([
          "Client",
          ["fetcher", { name: "RequestOpts", as: "Opts" }],
          { from: "./runtime" },
        ]),
      ),
    ).toMatchInlineSnapshot(
      `"import Client, { fetcher, RequestOpts as Opts } from "./runtime";"`,
    );
  });

  it("throws on invalid import format", () => {
    expect(() =>
      createImportStatement(["invalid"] as unknown as Parameters<
        typeof createImportStatement
      >[0]),
    ).toThrow("Invalid import format");
  });
});
