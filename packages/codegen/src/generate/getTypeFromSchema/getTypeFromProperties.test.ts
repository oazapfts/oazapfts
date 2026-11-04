import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { createContext } from "../../context";
import { printNode } from "../tscodegen";
import { getTypeFromProperties } from "./getTypeFromProperties";

const print = (props: Parameters<typeof getTypeFromProperties>[0]) =>
  printNode(
    getTypeFromProperties(
      props,
      createContext({} as unknown as OpenAPIV3.Document, {}),
    ),
  );

describe("getTypeFromProperties", () => {
  it("keeps the single-line description comment for regular properties", () => {
    expect(print({ name: { type: "string", description: "The name" } }))
      .toMatchInlineSnapshot(`
      "{
          /** The name */
          name?: string;
      }"
    `);
  });

  it("emits no comment when there is neither a description nor a deprecation", () => {
    expect(print({ name: { type: "string", deprecated: false } }))
      .toMatchInlineSnapshot(`
      "{
          name?: string;
      }"
    `);
  });

  it("tags deprecated properties with @deprecated", () => {
    expect(print({ name: { type: "string", deprecated: true } }))
      .toMatchInlineSnapshot(`
      "{
          /**
           * @deprecated
           */
          name?: string;
      }"
    `);
  });

  it("keeps the description above the @deprecated tag", () => {
    expect(
      print({
        name: {
          type: "string",
          description: "Use fullName instead",
          deprecated: true,
        },
      }),
    ).toMatchInlineSnapshot(`
      "{
          /**
           * Use fullName instead
           * @deprecated
           */
          name?: string;
      }"
    `);
  });

  it("only tags the deprecated property", () => {
    expect(
      print({
        old: { type: "string", deprecated: true },
        current: { type: "string", description: "Current" },
      }),
    ).toMatchInlineSnapshot(`
      "{
          /**
           * @deprecated
           */
          old?: string;
          /** Current */
          current?: string;
      }"
    `);
  });

  it("indents multi-line deprecation descriptions as a JSDoc block", () => {
    expect(
      print({
        name: {
          type: "string",
          description: "First line\nSecond line",
          deprecated: true,
        },
      }),
    ).toMatchInlineSnapshot(`
      "{
          /**
           * First line
           * Second line
           * @deprecated
           */
          name?: string;
      }"
    `);
  });

  it("escapes comment terminators in deprecated descriptions", () => {
    const output = print({
      name: { type: "string", description: "a */ b */ c", deprecated: true },
    });

    expect(output).toContain("a *\\/ b *\\/ c");
    expect(output.match(/\*\//g)).toHaveLength(1);
  });

  it("tags required deprecated properties", () => {
    const output = printNode(
      getTypeFromProperties(
        { id: { type: "string", deprecated: true } },
        createContext({} as unknown as OpenAPIV3.Document, {}),
        ["id"],
      ),
    );

    expect(output).toContain("@deprecated");
    expect(output).toContain("id: string;");
  });

  it("tags deprecated properties that sit next to a $ref (OpenAPI 3.1)", () => {
    const ctx = createContext(
      {
        openapi: "3.1.0",
        info: { title: "Test", version: "1.0.0" },
        paths: {},
        components: {
          schemas: { User: { type: "object", properties: {} } },
        },
      } as unknown as OpenAPIV3.Document,
      {},
    );

    const output = printNode(
      getTypeFromProperties(
        {
          owner: {
            $ref: "#/components/schemas/User",
            deprecated: true,
          } as unknown as OpenAPIV3.SchemaObject,
        },
        ctx,
      ),
    );

    expect(output).toContain("@deprecated");
    expect(output).toContain("owner?: User;");
  });
});
