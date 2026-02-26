import { describe, it, expect } from "vitest";
import {
  createServersStatement,
  defaultBaseUrl,
  generateServers,
} from "./generateServers";
import * as cg from "./tscodegen";

describe("generateServer", () => {
  it("creates an object with servers", () => {
    const servers = generateServers([{ url: "http://example.org" }]);

    expect(cg.printNode(servers)).toMatchInlineSnapshot(`
      "{
          server1: "http://example.org"
      }"
    `);
  });

  it("uses the description as name", () => {
    const servers = generateServers([
      { url: "http://example.org", description: "Super API" },
      { url: "http://example.org/2" },
    ]);

    expect(cg.printNode(servers)).toMatchInlineSnapshot(`
      "{
          superApi: "http://example.org",
          server2: "http://example.org/2"
      }"
    `);
  });

  it("supports variables", () => {
    const servers = generateServers([
      {
        variables: {
          tld: {
            enum: ["org", "com"],
            default: "org",
          },
          path: {
            default: "",
          },
        },
        url: "http://example.{tld}/{path}",
      },
    ]);

    expect(cg.printNode(servers)).toMatchInlineSnapshot(`
      "{
          server1: ({ tld = "org", path = "" }: {
              tld: "org" | "com";
              path: string | number | boolean;
          }) => \`http://example.\${tld}/\${path}\`
      }"
    `);
  });

  it("creates exported servers statement", () => {
    const statement = createServersStatement([{ url: "https://api.example.com" }]);

    expect(cg.printNode(statement)).toMatchInlineSnapshot(`
      "export const servers = {
          server1: "https://api.example.com"
      };"
    `);
  });
});

describe("defaultBaseUrl", () => {
  it("uses first server and applies variable defaults", () => {
    expect(defaultBaseUrl()).toBe("/");
    expect(
      defaultBaseUrl([
        {
          url: "https://{env}.example.com/{version}",
          variables: {
            env: { default: "api" },
            version: { default: "v1" },
          },
        },
      ]),
    ).toBe("https://api.example.com/v1");
  });
});
