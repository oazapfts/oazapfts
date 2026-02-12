import { describe, it, expect, vi } from "vitest";
import ts from "typescript";
import { generateAst, printAst } from "./index";
import {
  UNSTABLE_OazapftsPlugin,
  UNSTABLE_sortPlugins,
  UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE,
  UNSTABLE_QuerySerializerHookArgs,
} from "./plugin";
import {
  Document,
  OperationObject,
  ParameterObject,
  PathItemObject,
} from "./helpers/openApi3-x";
import { createContext, OazapftsContext } from "./context";

// Minimal spec for testing
function createMinimalSpec(overrides: Partial<Document> = {}): Document {
  return {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

const TEST_CONTEXT = Symbol("TEST_CONTEXT");

// Helper to generate source from inline spec
async function generate(
  spec: Document,
  plugins: UNSTABLE_OazapftsPlugin[] = [],
): Promise<string> {
  const ctx = createContext(spec);
  ctx[TEST_CONTEXT] = true;
  const ast = await generateAst(ctx, plugins);
  return printAst(ast);
}

function isTestContext(ctx: unknown): ctx is OazapftsContext {
  return typeof ctx === "object" && ctx !== null && ctx[TEST_CONTEXT] === true;
}

describe("Plugin System", () => {
  describe("sortPlugins", () => {
    it("should sort plugins in order", () => {
      expect(
        UNSTABLE_sortPlugins([
          {
            name: "plugin1",
            precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.LAZY,
          },
          {
            name: "plugin2",
            precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.DEFAULT,
          },
          {
            name: "plugin3",
            precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.EAGER,
          },
          {
            name: "plugin4",
            precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.EAGER,
          },
          {
            name: "plugin5",
            precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.DEFAULT,
          },
          {
            name: "plugin6",
            precedence: UNSTABLE_OAZAPFTS_PLUGIN_PRECEDENCE.LAZY,
          },
        ]).map(({ name }) => name),
      ).toEqual([
        "plugin3",
        "plugin4",
        "plugin2",
        "plugin5",
        "plugin1",
        "plugin6",
      ]);
    });
  });

  describe("Hooks lifecycle", () => {
    it("should call prepare hook with context including template parts", async () => {
      const prepareMock = vi.fn();
      const spec = createMinimalSpec({
        paths: {
          "/users": {
            get: {
              operationId: "getUsers",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", prepareMock);
      };

      await generate(spec, [plugin]);

      expect(prepareMock).toHaveBeenCalledTimes(1);
      const [ctx] = prepareMock.mock.calls[0];

      // Verify context structure
      expect(ctx.spec.openapi).toBe("3.0.0");
      expect(ctx.spec.info.title).toBe("Test API");
      expect(ctx.spec.paths).toHaveProperty("/users");
      expect(ctx.opts).toBeDefined();
      expect(ctx.aliases).toEqual([]);
      expect(ctx.discriminatingSchemas).toBeInstanceOf(Set);

      // Verify template parts are flat on context
      expect(ctx.banner).toContain("oazapfts");
      expect(ctx.imports).toHaveLength(2);
      expect(ctx.defaults).toEqual({
        baseUrl: "/",
        headers: {},
      });
      expect(ctx.servers).toEqual([]);
      expect(ctx.init.length).toBeGreaterThan(0);
    });

    it("should call hooks in correct order", async () => {
      const callOrder: string[] = [];
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "test",
              parameters: [
                {
                  name: "test",
                  in: "query",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", () => callOrder.push("prepare"));
        hooks.generateMethod.tap("test", (methods) => {
          callOrder.push("generateMethod");
          return methods;
        });
        hooks.querySerializerArgs.tap("test", (args) => {
          callOrder.push("querySerializerArgs");
          return args;
        });
        hooks.astGenerated.tap("test", (ast) => {
          callOrder.push("astGenerated");
          return ast;
        });
      };

      await generate(spec, [plugin]);

      expect(callOrder).toEqual([
        "prepare",
        "querySerializerArgs",
        "generateMethod",
        "astGenerated",
      ]);
    });

    it("should support async plugins", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/async": {
            get: {
              operationId: "asyncOp",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      // Async plugin that modifies spec after a delay
      const asyncPlugin: UNSTABLE_OazapftsPlugin = async (hooks) => {
        await new Promise((resolve) => setTimeout(resolve, 5));

        hooks.prepare.tapPromise("async", async (ctx) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          // Add a new endpoint asynchronously
          ctx.spec.paths!["/added-async"] = {
            get: {
              operationId: "addedByAsyncPlugin",
              responses: { "200": { description: "OK" } },
            },
          };
        });
      };

      const src = await generate(spec, [asyncPlugin]);

      // Assert on actual generated output
      expect(src).toContain("asyncOp");
      expect(src).toContain("addedByAsyncPlugin");
    });
  });

  describe("prepare hook", () => {
    it("should allow modifying spec paths", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/keep": {
            get: {
              operationId: "keepThis",
              responses: { "200": { description: "OK" } },
            },
          },
          "/remove": {
            get: {
              operationId: "removeThis",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          if (ctx.spec.paths) {
            delete ctx.spec.paths["/remove"];
          }
        });
      };

      const src = await generate(spec, [plugin]);

      expect(src).toContain("keepThis");
      expect(src).not.toContain("removeThis");
    });

    it("should allow adding servers via ctx.servers", async () => {
      const spec = createMinimalSpec({
        servers: [{ url: "https://original.example.com" }],
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          // Simply push a new server - much simpler!
          ctx.servers.push({
            url: "https://injected.example.com",
            description: "Injected",
          });
        });
      };

      const src = await generate(spec, [plugin]);
      // Both original and injected servers should be present
      expect(src).toContain("https://original.example.com");
      expect(src).toContain("https://injected.example.com");
    });
  });

  describe("template modification via ctx", () => {
    it("should allow modifying banner", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          ctx.banner = "CUSTOM BANNER TEXT";
        });
      };

      const src = await generate(spec, [plugin]);
      expect(src).toContain("CUSTOM BANNER TEXT");
    });

    it("should allow adding imports", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          ctx.imports.unshift("side-effect");
          ctx.imports.push([
            "DefaultImport",
            [
              "Specifier",
              { name: "Specifier2" },
              { name: "specifier", as: "Specifier3" },
            ],
            { from: "custom-module" },
          ]);
          ctx.imports.push([
            { namespace: "CustomImport" },
            { from: "custom-module" },
          ]);
        });
      };

      const src = (await generate(spec, [plugin])).split("\n");
      const sideEffectsIndex = src.indexOf('import "side-effect";');
      expect(src.slice(sideEffectsIndex, 9).join("\n")).toMatchInlineSnapshot(`
        "import "side-effect";
        import * as Oazapfts from "@oazapfts/runtime";
        import * as QS from "@oazapfts/runtime/query";
        import DefaultImport, { Specifier, Specifier2, specifier as Specifier3 } from "custom-module";
        import * as CustomImport from "custom-module";"
      `);
    });

    it("should allow replacing servers", async () => {
      const spec = createMinimalSpec({
        servers: [{ url: "https://original.example.com" }],
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          // Replace all servers with a custom one
          ctx.servers = [
            { url: "https://custom.example.com", description: "Custom" },
          ];
        });
      };

      const src = await generate(spec, [plugin]);
      expect(src).toContain("custom"); // identifier from description
      expect(src).toContain("https://custom.example.com");
      // Note: defaults.baseUrl still has the original URL since we only replaced servers
      expect(src).toMatch(/servers\s*=\s*\{[^}]*custom/);
    });

    it("should allow modifying defaults", async () => {
      const spec = createMinimalSpec({
        servers: [{ url: "https://original.example.com" }],
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          ctx.defaults.baseUrl = "https://modified.example.com";
        });
      };

      const src = await generate(spec, [plugin]);
      expect(src).toContain("https://modified.example.com");
    });

    it("should allow setting custom fetch as arrow function", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          // Set fetch to an arrow function expression
          ctx.defaults.fetch = ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                "url",
              ),
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                "options",
              ),
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createCallExpression(
              ts.factory.createIdentifier("customFetch"),
              undefined,
              [
                ts.factory.createIdentifier("url"),
                ts.factory.createIdentifier("options"),
              ],
            ),
          );
        });
      };

      const src = await generate(spec, [plugin]);
      expect(src).toContain(
        "fetch: (url, options) => customFetch(url, options)",
      );
    });

    it("should allow setting custom fetch as identifier", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          // Set fetch to an identifier reference
          ctx.defaults.fetch = ts.factory.createIdentifier("myCustomFetch");
        });
      };

      const src = (await generate(spec, [plugin])).split("\n");
      const defaultsIndex = src.findIndex((line) =>
        line.startsWith("export const defaults"),
      );
      expect(src.slice(defaultsIndex, defaultsIndex + 5).join("\n"))
        .toMatchInlineSnapshot(`
        "export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
            headers: {},
            baseUrl: "/",
            fetch: myCustomFetch
        };"
      `);
    });

    it("should allow setting custom FormData as identifier", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          // Set FormData to an identifier reference
          ctx.defaults.FormData = ts.factory.createIdentifier("CustomFormData");
        });
      };

      const src = (await generate(spec, [plugin])).split("\n");
      const defaultsIndex = src.findIndex((line) =>
        line.startsWith("export const defaults"),
      );
      expect(src.slice(defaultsIndex, defaultsIndex + 5).join("\n"))
        .toMatchInlineSnapshot(`
        "export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
            headers: {},
            baseUrl: "/",
            FormData: CustomFormData
        };"
      `);
    });

    it("should allow setting custom FormData as class expression", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          // Set FormData to a class expression
          ctx.defaults.FormData = ts.factory.createClassExpression(
            undefined,
            undefined,
            undefined,
            undefined,
            [
              ts.factory.createMethodDeclaration(
                undefined,
                undefined,
                "append",
                undefined,
                undefined,
                [],
                undefined,
                ts.factory.createBlock([]),
              ),
            ],
          );
        });
      };

      const src = (await generate(spec, [plugin])).split("\n");
      const defaultsIndex = src.findIndex((line) =>
        line.startsWith("export const defaults"),
      );
      expect(src.slice(defaultsIndex, defaultsIndex + 7).join("\n"))
        .toMatchInlineSnapshot(`
          "export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
              headers: {},
              baseUrl: "/",
              FormData: class {
                  append() { }
              }
          };"
        `);
    });

    it("should allow adding init statements", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("test", (ctx) => {
          ctx.init.push(
            ts.factory.createVariableStatement(
              undefined,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.createVariableDeclaration(
                    "customInit",
                    undefined,
                    undefined,
                    ts.factory.createStringLiteral("initialized"),
                  ),
                ],
                ts.NodeFlags.Const,
              ),
            ),
          );
        });
      };

      const src = await generate(spec, [plugin]);
      expect(src).toContain("customInit");
      expect(src).toContain('"initialized"');
    });
  });

  describe("generateMethod hook", () => {
    it("should receive endpoint metadata", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/users/{id}": {
            get: {
              operationId: "getUserById",
              tags: ["users"],
              parameters: [
                {
                  name: "id",
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      let capturedEndpoint: {
        method: string;
        path: string;
        operationId?: string;
        tags?: string[];
      } | null = null;

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("test", (methods, endpoint) => {
          capturedEndpoint = {
            method: endpoint.method,
            path: endpoint.path,
            operationId: endpoint.operation.operationId,
            tags: endpoint.operation.tags,
          };
          return methods;
        });
      };

      await generate(spec, [plugin]);

      expect(capturedEndpoint).not.toBeNull();
      expect(capturedEndpoint!.method).toBe("GET");
      expect(capturedEndpoint!.path).toBe("/users/{id}");
      expect(capturedEndpoint!.operationId).toBe("getUserById");
      expect(capturedEndpoint!.tags).toContain("users");
    });

    it("should allow filtering out methods", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/public": {
            get: {
              operationId: "publicEndpoint",
              responses: { "200": { description: "OK" } },
            },
          },
          "/private": {
            get: {
              operationId: "privateEndpoint",
              tags: ["internal"],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("test", (methods, endpoint) => {
          if (endpoint.operation.tags?.includes("internal")) {
            return [];
          }
          return methods;
        });
      };

      const src = await generate(spec, [plugin]);

      expect(src).toContain("publicEndpoint");
      expect(src).not.toContain("privateEndpoint");
    });

    it("should allow renaming methods", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "originalName",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("test", (methods) => {
          return methods.map((method) => {
            return ts.factory.updateFunctionDeclaration(
              method,
              method.modifiers,
              method.asteriskToken,
              ts.factory.createIdentifier("renamedMethod"),
              method.typeParameters,
              method.parameters,
              method.type,
              method.body,
            );
          });
        });
      };

      const src = await generate(spec, [plugin]);

      expect(src).toContain("renamedMethod");
      expect(src).not.toContain("originalName");
    });

    it("should allow adding comments to methods", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "testOp",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("test", (methods, endpoint) => {
          return methods.map((method) => {
            return ts.addSyntheticLeadingComment(
              method,
              ts.SyntaxKind.MultiLineCommentTrivia,
              `* @custom ${endpoint.operation.operationId} `,
              true,
            );
          });
        });
      };

      const src = await generate(spec, [plugin]);
      expect(src).toContain("@custom testOp");
    });

    it("should allow completely replacing method implementation", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "testOp",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("test", () => {
          const customMethod = ts.factory.createFunctionDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            undefined,
            "customImplementation",
            undefined,
            [],
            undefined,
            ts.factory.createBlock([
              ts.factory.createReturnStatement(
                ts.factory.createStringLiteral("custom"),
              ),
            ]),
          );
          return [customMethod];
        });
      };

      const src = await generate(spec, [plugin]);

      expect(src).toContain("customImplementation");
      expect(src).toContain('return "custom"');
      expect(src).not.toContain("testOp");
    });
  });

  describe("querySerializerArgs hook", () => {
    it("should support modifying query serializer args", async () => {
      const path = "/test";
      const parameters: ParameterObject[] = [
        {
          name: "one",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "two",
          in: "query",
          required: true,
          style: "deepObject",
          schema: { type: "object", properties: { test: { type: "string" } } },
        },
      ];
      const pathItem: PathItemObject = {
        get: {
          operationId: "testOp",
          parameters,
          responses: { "200": { description: "OK" } },
        },
      };
      const operation: OperationObject = {
        operationId: "testOp",
        parameters,
        responses: { "200": { description: "OK" } },
      };
      const spec = createMinimalSpec({
        paths: {
          [path]: pathItem,
        },
      });

      const spy = vi.fn((..._: UNSTABLE_QuerySerializerHookArgs) => [
        ts.factory.createIdentifier("hiiiiii"),
      ]);

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.querySerializerArgs.tap("test", spy);
      };

      const src = await generate(spec, [plugin]);
      expect(src).toContain(
        "/test${QS.query(QS.explode(hiiiiii), QS.deep(hiiiiii))}",
      );

      expect(spy).toHaveBeenCalledTimes(2);
      const [exp, queryContext, ctx] = spy.mock.calls[0];
      expect(ts.isObjectLiteralExpression(exp[0])).toEqual(true);
      expect(queryContext).toEqual({
        formatter: "explode",
        method: "GET",
        operation,
        parameters: [parameters[0]],
        path,
        pathItem,
        query: parameters,
      });
      expect(isTestContext(ctx)).toEqual(true);
    });
  });

  describe("astGenerated hook", () => {
    it("should receive complete AST", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "testOp",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      let statementCount = 0;
      let hasFunctionDeclaration = false;

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.astGenerated.tap("test", (sourceFile) => {
          statementCount = sourceFile.statements.length;
          hasFunctionDeclaration = sourceFile.statements.some((s) =>
            ts.isFunctionDeclaration(s),
          );
          return sourceFile;
        });
      };

      await generate(spec, [plugin]);

      expect(statementCount).toBeGreaterThan(0);
      expect(hasFunctionDeclaration).toBe(true);
    });

    it("should allow adding custom exports", async () => {
      const spec = createMinimalSpec();

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.astGenerated.tap("test", (sourceFile) => {
          const customType = ts.factory.createTypeAliasDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            "CustomType",
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
          );

          const customConst = ts.factory.createVariableStatement(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  "API_VERSION",
                  undefined,
                  undefined,
                  ts.factory.createStringLiteral("1.0.0"),
                ),
              ],
              ts.NodeFlags.Const,
            ),
          );

          return ts.factory.updateSourceFile(sourceFile, [
            ...sourceFile.statements,
            customType,
            customConst,
          ]);
        });
      };

      const src = await generate(spec, [plugin]);

      expect(src).toContain("export type CustomType = string");
      expect(src).toContain('export const API_VERSION = "1.0.0"');
    });

    it("should allow removing methods from AST", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/keep": {
            get: {
              operationId: "keepMe",
              responses: { "200": { description: "OK" } },
            },
          },
          "/remove": {
            delete: {
              operationId: "deleteMe",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const plugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.astGenerated.tap("test", (sourceFile) => {
          const filtered = sourceFile.statements.filter((stmt) => {
            if (ts.isFunctionDeclaration(stmt) && stmt.name) {
              return stmt.name.text !== "deleteMe";
            }
            return true;
          });
          return ts.factory.updateSourceFile(sourceFile, filtered);
        });
      };

      const src = await generate(spec, [plugin]);

      expect(src).toContain("keepMe");
      expect(src).not.toContain("deleteMe");
    });
  });

  describe("Multiple plugins", () => {
    it("should apply plugins in order", async () => {
      const spec = createMinimalSpec();
      const callOrder: string[] = [];

      const plugin1: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("p1", () => callOrder.push("plugin1"));
      };

      const plugin2: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("p2", () => callOrder.push("plugin2"));
      };

      await generate(spec, [plugin1, plugin2]);

      expect(callOrder).toEqual(["plugin1", "plugin2"]);
    });

    it("should chain waterfall transformations", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "original",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const prefixPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("prefix", (methods) => {
          return methods.map((m) => {
            const name = m.name?.text || "";
            return ts.factory.updateFunctionDeclaration(
              m,
              m.modifiers,
              m.asteriskToken,
              ts.factory.createIdentifier(`prefix_${name}`),
              m.typeParameters,
              m.parameters,
              m.type,
              m.body,
            );
          });
        });
      };

      const suffixPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("suffix", (methods) => {
          return methods.map((m) => {
            const name = m.name?.text || "";
            return ts.factory.updateFunctionDeclaration(
              m,
              m.modifiers,
              m.asteriskToken,
              ts.factory.createIdentifier(`${name}_suffix`),
              m.typeParameters,
              m.parameters,
              m.type,
              m.body,
            );
          });
        });
      };

      const src = await generate(spec, [prefixPlugin, suffixPlugin]);

      expect(src).toContain("prefix_original_suffix");
    });

    it("should allow data sharing between plugins via closure", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/a": {
            get: {
              operationId: "opA",
              responses: { "200": { description: "OK" } },
            },
          },
          "/b": {
            post: {
              operationId: "opB",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const collectedOps: string[] = [];

      const collectorPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("collector", (methods, endpoint) => {
          if (endpoint.operation.operationId) {
            collectedOps.push(endpoint.operation.operationId);
          }
          return methods;
        });
      };

      const reporterPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.astGenerated.tap("reporter", (sourceFile) => {
          const report = ts.factory.createVariableStatement(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  "operations",
                  undefined,
                  undefined,
                  ts.factory.createArrayLiteralExpression(
                    collectedOps.map((op) =>
                      ts.factory.createStringLiteral(op),
                    ),
                  ),
                ),
              ],
              ts.NodeFlags.Const,
            ),
          );
          return ts.factory.updateSourceFile(sourceFile, [
            ...sourceFile.statements,
            report,
          ]);
        });
      };

      const src = await generate(spec, [collectorPlugin, reporterPlugin]);

      expect(src).toContain("export const operations");
      expect(src).toContain('"opA"');
      expect(src).toContain('"opB"');
    });
  });

  describe("Parity", () => {
    it("should produce identical output with empty plugins array", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "testOp",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const srcWithout = await generate(spec);
      const srcWithEmpty = await generate(spec, []);

      expect(srcWithEmpty).toBe(srcWithout);
    });

    it("should produce identical output with no-op plugin", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "testOp",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const noopPlugin: UNSTABLE_OazapftsPlugin = () => {};

      const srcWithout = await generate(spec);
      const srcWithNoop = await generate(spec, [noopPlugin]);

      expect(srcWithNoop).toBe(srcWithout);
    });

    it("should produce identical output with identity transform plugins", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/test": {
            get: {
              operationId: "testOp",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const identityPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.prepare.tap("id", () => {});
        hooks.generateMethod.tap("id", (m) => m);
        hooks.astGenerated.tap("id", (a) => a);
      };

      const srcWithout = await generate(spec);
      const srcWithIdentity = await generate(spec, [identityPlugin]);

      expect(srcWithIdentity).toBe(srcWithout);
    });
  });

  describe("Real-world scenarios", () => {
    it("should support filtering endpoints by tag", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/public/data": {
            get: {
              operationId: "getPublicData",
              tags: ["public"],
              responses: { "200": { description: "OK" } },
            },
          },
          "/admin/users": {
            get: {
              operationId: "getAdminUsers",
              tags: ["admin"],
              responses: { "200": { description: "OK" } },
            },
          },
          "/internal/health": {
            get: {
              operationId: "getHealth",
              tags: ["internal"],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const publicOnlyPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("public-only", (methods, endpoint) => {
          if (endpoint.operation.tags?.includes("public")) {
            return methods;
          }
          return [];
        });
      };

      const src = await generate(spec, [publicOnlyPlugin]);

      expect(src).toContain("getPublicData");
      expect(src).not.toContain("getAdminUsers");
      expect(src).not.toContain("getHealth");
    });

    it("should support prefixing methods by tag", async () => {
      const spec = createMinimalSpec({
        paths: {
          "/users": {
            get: {
              operationId: "list",
              tags: ["users"],
              responses: { "200": { description: "OK" } },
            },
          },
          "/posts": {
            get: {
              operationId: "list",
              tags: ["posts"],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const tagPrefixPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        hooks.generateMethod.tap("tag-prefix", (methods, endpoint) => {
          const tag = endpoint.operation.tags?.[0];
          if (!tag) return methods;

          return methods.map((m) => {
            const name = m.name?.text || "";
            return ts.factory.updateFunctionDeclaration(
              m,
              m.modifiers,
              m.asteriskToken,
              ts.factory.createIdentifier(`${tag}_${name}`),
              m.typeParameters,
              m.parameters,
              m.type,
              m.body,
            );
          });
        });
      };

      const src = await generate(spec, [tagPrefixPlugin]);

      expect(src).toContain("users_list");
      expect(src).toContain("posts_list");
    });

    it("should support adding metadata export", async () => {
      const spec = createMinimalSpec({
        info: { title: "My API", version: "2.0.0" },
        paths: {
          "/test": {
            get: {
              operationId: "test",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      });

      const metadataPlugin: UNSTABLE_OazapftsPlugin = (hooks) => {
        let apiTitle = "";
        let apiVersion = "";

        hooks.prepare.tap("metadata", (ctx) => {
          apiTitle = ctx.spec.info.title;
          apiVersion = ctx.spec.info.version || "";
        });

        hooks.astGenerated.tap("metadata", (sourceFile) => {
          const metadata = ts.factory.createVariableStatement(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  "apiMetadata",
                  undefined,
                  undefined,
                  ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment(
                      "title",
                      ts.factory.createStringLiteral(apiTitle),
                    ),
                    ts.factory.createPropertyAssignment(
                      "version",
                      ts.factory.createStringLiteral(apiVersion),
                    ),
                  ]),
                ),
              ],
              ts.NodeFlags.Const,
            ),
          );

          return ts.factory.updateSourceFile(sourceFile, [
            ...sourceFile.statements,
            metadata,
          ]);
        });
      };

      const src = await generate(spec, [metadataPlugin]);

      expect(src).toContain("export const apiMetadata");
      expect(src).toContain('"My API"');
      expect(src).toContain('"2.0.0"');
    });
  });
});
