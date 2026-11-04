import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { createContext } from "../context";
import { UNSTABLE_createHooks } from "../plugin";
import { generateClientMethod } from "./generateClientMethod";
import * as cg from "./tscodegen";

describe("generateClientMethod", () => {
  it("generates positional method with query, header, body and deprecated alias", () => {
    const ctx = createContext(
      {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.0" },
        paths: {},
      } as OpenAPIV3.Document,
      { futureStripLegacyMethods: false },
    );
    const hooks = UNSTABLE_createHooks();

    const statements = generateClientMethod(
      "POST",
      "/pets/{id}",
      {
        operationId: "pets.create",
        summary: "Create a pet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                },
              },
            },
          },
        },
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer" },
          },
          {
            name: "x-trace",
            in: "header",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "ok",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "string" } },
                },
              },
            },
          },
        },
      } as OpenAPIV3.OperationObject,
      {
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
      } as OpenAPIV3.PathItemObject,
      ctx,
      hooks,
    );

    expect(statements).toHaveLength(2);
    expect(cg.printNodes(statements)).toMatchInlineSnapshot(`
      "/**
       * Create a pet
       */
      export function petsCreate(id: string, body: {
          name: string;
      }, { limit, xTrace }: {
          limit?: number;
          xTrace?: string;
      } = {}, opts?: Oazapfts.RequestOpts) {
          return oazapfts.fetchJson<{
              status: 200;
              data: {
                  id?: string;
              };
          }>(\`/pets/\${encodeURIComponent(id)}\${QS.query(QS.explode({
              limit
          }))}\`, oazapfts.json({
              ...opts,
              method: "POST",
              body,
              headers: oazapfts.mergeHeaders(opts?.headers, {
                  "x-trace": xTrace
              })
          }));
      }
      /**
       * @deprecated Use {@link petsCreate} instead.
       * Create a pet
       */
      export function postPetsById(id: string, body: {
          name: string;
      }, { limit, xTrace }: {
          limit?: number;
          xTrace?: string;
      } = {}, opts?: Oazapfts.RequestOpts) {
          return oazapfts.fetchJson<{
              status: 200;
              data: {
                  id?: string;
              };
          }>(\`/pets/\${encodeURIComponent(id)}\${QS.query(QS.explode({
              limit
          }))}\`, oazapfts.json({
              ...opts,
              method: "POST",
              body,
              headers: oazapfts.mergeHeaders(opts?.headers, {
                  "x-trace": xTrace
              })
          }));
      }"
    `);
  });

  it("generates object-style signature without empty object argument", () => {
    const ctx = createContext(
      {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.0" },
        paths: {},
      } as OpenAPIV3.Document,
      { argumentStyle: "object", futureStripLegacyMethods: true },
    );

    const statements = generateClientMethod(
      "GET",
      "/status",
      {
        operationId: "status",
        responses: {
          "200": {
            description: "ok",
          },
        },
      },
      {},
      ctx,
      UNSTABLE_createHooks(),
    );

    expect(cg.printNodes(statements)).toMatchInlineSnapshot(`
      "export function status(opts?: Oazapfts.RequestOpts) {
          return oazapfts.fetchText("/status", {
              ...opts
          });
      }"
    `);
  });

  describe("deprecated operations", () => {
    const generate = (
      operation: Partial<OpenAPIV3.OperationObject>,
      opts: { futureStripLegacyMethods: boolean } = {
        futureStripLegacyMethods: true,
      },
    ) => {
      const ctx = createContext(
        {
          openapi: "3.0.0",
          info: { title: "Test", version: "1.0.0" },
          paths: {},
        } as OpenAPIV3.Document,
        opts,
      );

      return generateClientMethod(
        "GET",
        "/pets",
        {
          operationId: "pets.list",
          responses: { "200": { description: "ok" } },
          ...operation,
        } as OpenAPIV3.OperationObject,
        {} as OpenAPIV3.PathItemObject,
        ctx,
        UNSTABLE_createHooks(),
      );
    };

    it("adds a bare @deprecated tag when there is no summary", () => {
      const output = cg.printNodes(generate({ deprecated: true }));

      expect(output).toMatch(
        /^\/\*\*\n \* @deprecated\n \*\/\nexport function petsList\(/,
      );
    });

    it("keeps the summary above the @deprecated tag", () => {
      const output = cg.printNodes(
        generate({ deprecated: true, summary: "List pets" }),
      );

      expect(output).toMatch(
        /^\/\*\*\n \* List pets\n \* @deprecated\n \*\/\nexport function petsList\(/,
      );
    });

    it("falls back to the description when there is no summary", () => {
      const output = cg.printNodes(
        generate({ deprecated: true, description: "Use /v2/pets" }),
      );

      expect(output).toContain(" * Use /v2/pets\n * @deprecated\n");
    });

    it("does not tag operations that are not deprecated", () => {
      expect(cg.printNodes(generate({ summary: "List pets" }))).not.toContain(
        "@deprecated",
      );
      expect(
        cg.printNodes(generate({ summary: "List pets", deprecated: false })),
      ).not.toContain("@deprecated");
      expect(cg.printNodes(generate({}))).not.toContain("@deprecated");
    });

    it("escapes comment terminators in summaries, including on the legacy alias", () => {
      const output = cg.printNodes(
        generate(
          { summary: "a */ b */ c" },
          { futureStripLegacyMethods: false },
        ),
      );

      expect(output).toContain("a *\\/ b *\\/ c");
      expect(output.match(/\*\//g)).toHaveLength(2);
    });

    it("does not trim descriptions of operations that are not deprecated", () => {
      expect(cg.printNodes(generate({ summary: "  padded  " }))).toContain(
        " *   padded",
      );
    });

    it("tags the primary method and the legacy alias once each", () => {
      const output = cg.printNodes(
        generate(
          { deprecated: true, summary: "List pets" },
          { futureStripLegacyMethods: false },
        ),
      );

      expect(output.match(/@deprecated/g)).toHaveLength(2);
      expect(output).toMatch(
        / \* List pets\n \* @deprecated\n \*\/\nexport function petsList\(/,
      );
      expect(output).toMatch(
        / \* @deprecated Use \{@link petsList\} instead\.\n \* List pets\n \*\/\nexport function getPets\(/,
      );
    });
  });
});
