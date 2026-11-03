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
  describe("query parameter declared after a path parameter with the same name", () => {
    const operation = {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "id",
          in: "query",
          required: false,
          schema: { type: "integer" },
        },
      ],
      responses: { "200": { description: "ok" } },
    } as OpenAPIV3.OperationObject;

    const generate = (opts: Parameters<typeof createContext>[1]) =>
      cg.printNodes(
        generateClientMethod(
          "GET",
          "/{id}/",
          operation,
          {},
          createContext(
            {
              openapi: "3.0.0",
              info: { title: "Test", version: "1.0.0" },
              paths: {},
            } as OpenAPIV3.Document,
            { futureStripLegacyMethods: true, ...opts },
          ),
          UNSTABLE_createHooks(),
        ),
      );

    it("keeps the original name in the optional parameters object", () => {
      expect(generate({})).toMatchInlineSnapshot(`
        "export function getById(id: string, { id: idQuery }: {
            id?: number;
        } = {}, opts?: Oazapfts.RequestOpts) {
            return oazapfts.fetchText(\`/\${encodeURIComponent(id)}/\${QS.query(QS.explode({
                id: idQuery
            }))}\`, {
                ...opts
            });
        }"
      `);
    });

    it("suffixes only colliding property names in object style", () => {
      expect(generate({ argumentStyle: "object" })).toMatchInlineSnapshot(`
        "export function getById({ id, idQuery }: {
            id: string;
            idQuery?: number;
        }, opts?: Oazapfts.RequestOpts) {
            return oazapfts.fetchText(\`/\${encodeURIComponent(id)}/\${QS.query(QS.explode({
                id: idQuery
            }))}\`, {
                ...opts
            });
        }"
      `);
    });
  });

  it("keeps suffixes for colliding names within the optional parameters object", () => {
    const ctx = createContext(
      {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.0" },
        paths: {},
      } as OpenAPIV3.Document,
      { futureStripLegacyMethods: true },
    );

    const statements = generateClientMethod(
      "GET",
      "/items",
      {
        parameters: [
          { name: "id", in: "query", schema: { type: "integer" } },
          { name: "id", in: "header", schema: { type: "string" } },
        ],
        responses: { "200": { description: "ok" } },
      } as OpenAPIV3.OperationObject,
      {},
      ctx,
      UNSTABLE_createHooks(),
    );

    expect(cg.printNodes(statements)).toMatchInlineSnapshot(`
      "export function getItems({ id, idHeader }: {
          id?: number;
          idHeader?: string;
      } = {}, opts?: Oazapfts.RequestOpts) {
          return oazapfts.fetchText(\`/items\${QS.query(QS.explode({
              id
          }))}\`, {
              ...opts,
              headers: oazapfts.mergeHeaders(opts?.headers, {
                  id: idHeader
              })
          });
      }"
    `);
  });
});
