import { describe, it, expect } from "vitest";
import { OpenAPIV3 } from "openapi-types";
import { createContext } from "../context";
import { createHooks } from "../plugin";
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
    const hooks = createHooks();

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
      createHooks(),
    );

    expect(cg.printNodes(statements)).toMatchInlineSnapshot(`
      "export function status(opts?: Oazapfts.RequestOpts) {
          return oazapfts.fetchText("/status", {
              ...opts
          });
      }"
    `);
  });
});
