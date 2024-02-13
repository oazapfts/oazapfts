import { describe, it, expect } from "vitest";
import generateServers from "./generateServers";
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
});
