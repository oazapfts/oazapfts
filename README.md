# 🍻 oazapfts!

Generate TypeScript clients to tap into OpenAPI servers.

[![Build Status](https://travis-ci.org/cellular/oazapfts.svg?branch=master)](https://travis-ci.org/cellular/oazapfts)

## Features

- **AST-based**:
  Unlike other code generators `oazapfts` does not use templates to generate code but uses TypeScript's built-in API to generate and pretty-print an abstract syntax tree.
- **Fast**: The cli does not use any of the official Java-based tooling, so the code generation is super fast.
- **Dependency free**: The generated code does not use any external dependencies
- **Tree-shakeable**: Individually exported functions allow you to bundle only the ones you actually use.
- **Human friendly signatures**: The generated api methods don't leak an HTTP-specific implementation details. For example, all optional parameters are grouped together in one object, no matter whether they end up in the headers, path or query-string.

## Usage

```
npx oazapfts <spec> [filename]
```

Where `<spec>` is the URL or local path of an OpenAPI or Swagger spec (in either json or yml) and `<filename>` is the location of the `.ts` file to be generated.

**NOTE:** The generated functions are named according to their `operationId`. If no operation id is specified in the spec, a reasonable name is generated from the HTTP verb and the path.

## Overriding Defaults

The generated file exports a `defaults` constant that can be used to override the `basePath`, provide a custom `fetch` implementation or to send additional headers with each request:

```ts
import * as api from "./api.ts";

api.defaults.headers = {
  access_token: "secret",
};
```

## About the name

The name is [pronounced 🗣](https://youtu.be/chvb-K95rBE) like the Bavarian _O'zapt'is!_ (it's tapped), the famous words that mark the beginning of the Oktoberfest.

# License

MIT
