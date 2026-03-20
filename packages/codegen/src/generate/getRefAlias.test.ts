import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { createContext, withMode } from "../context";
import { getRefAlias } from "./getRefAlias";
import * as cg from "./tscodegen";

describe("getRefAlias", () => {
  it("creates and caches aliases for referenced schemas", () => {
    const ctx = createContext({
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
      components: {
        schemas: {
          Pet: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    } as OpenAPIV3.Document);

    const ref = { $ref: "#/components/schemas/Pet" } as const;
    const first = getRefAlias(ref, ctx);
    const second = getRefAlias(ref, ctx);

    expect(cg.printNode(first)).toBe("Pet");
    expect(first).toBe(second);
    expect(ctx.aliases).toHaveLength(1);
    expect(cg.printNode(ctx.aliases[0])).toMatchInlineSnapshot(`
      "export type Pet = {
          id: string;
          name?: string;
      };"
    `);
  });

  it("creates read/write variants when schema has readOnly and writeOnly fields", () => {
    const ctx = createContext({
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
      components: {
        schemas: {
          Credentials: {
            type: "object",
            properties: {
              id: { type: "string", readOnly: true },
              secret: { type: "string", writeOnly: true },
              label: { type: "string" },
            },
          },
        },
      },
    } as OpenAPIV3.Document);

    const ref = { $ref: "#/components/schemas/Credentials" } as const;
    const base = getRefAlias(ref, ctx);
    const read = getRefAlias(ref, withMode(ctx, "readOnly"));
    const write = getRefAlias(ref, withMode(ctx, "writeOnly"));

    expect(cg.printNode(base)).toBe("Credentials");
    expect(cg.printNode(read)).toBe("CredentialsRead");
    expect(cg.printNode(write)).toBe("CredentialsWrite");
    expect(cg.printNodes(ctx.aliases)).toMatchInlineSnapshot(`
      "export type Credentials = {
          label?: string;
      };
      export type CredentialsRead = {
          id?: string;
          label?: string;
      };
      export type CredentialsWrite = {
          secret?: string;
          label?: string;
      };"
    `);
  });
});
