import generateServers from './generateServers';
import * as cg from "./tscodegen";

function normalize(str: string) {
  return str.trim().replace(/\n|\r|\n\r/g, '\n ').replace(/ +/g, ' ')
}

describe('generateServer', () => {
  it('creates a Server class', () => {
    const servers = generateServers([{ url: 'http://example.org' }]);

    expect(normalize(cg.printNodes(servers)))
      .toBe(normalize(`export class Server {
        url: string;
        constructor() {
          this.url = \"http://example.org\";
        }
      }`));
  });

  it('creates Server classes with Names', () => {
    const servers = generateServers([
      { url: 'http://example.org', description: "Super API" },
      { url: 'http://example.org/2' },
    ]);

    expect(normalize(cg.printNodes(servers)))
      .toBe(normalize(`
        export class SuperApiServer {
          url: string;
          constructor() {
            this.url = \"http://example.org\";
          }
        }
        export class Server2 {
          url: string;
          constructor() {
            this.url = \"http://example.org/2\";
          }
        }
      `));
  });

  it('creates a Server with variables', () => {
    const servers = generateServers([{
      variables: {
        tld: {
          enum: ['org', 'com'],
          default: 'org'
        },
        path: {
          default: ''
        }
      },
      url: 'http://example.{tld}/{path}'
    }]);

    expect(normalize(cg.printNodes(servers)))
      .toBe(normalize(`export class Server {
        url: string;
        constructor({ tld = "org", path = "" }: {
          tld: "org" | "com";
          path: string | number | boolean;
        }) {
          this.url = \`http://example.\${tld}/\${path}\`;
        }
      }`));
  })
});
