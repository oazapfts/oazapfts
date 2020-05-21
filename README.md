# 🍻 oazapfts!

Generate TypeScript clients to tap into OpenAPI servers.

[![Build Status](https://travis-ci.org/cellular/oazapfts.svg?branch=master)](https://travis-ci.org/cellular/oazapfts)

## Features

- **AST-based**:
  Unlike other code generators `oazapfts` does not use templates to generate code but uses TypeScript's built-in API to generate and pretty-print an abstract syntax tree.
- **Fast**: The cli does not use any of the official Java-based tooling, so the code generation is super fast.
- **Tree-shakeable**: Individually exported functions allow you to bundle only the ones you actually use.
- **Human friendly signatures**: The generated api methods don't leak an HTTP-specific implementation details. For example, all optional parameters are grouped together in one object, no matter whether they end up in the headers, path or query-string.

## Installation

```
npm install oazapfts
```

**NOTE:** With version 3.0.0 oazapfts has become a runtime dependency and the generated code does no longer include all the fetch logic.

## Usage

```
oazapfts <spec> [filename]

Options:
--exclude, -e tag to exclude
--include, -i tag to include
```

Where `<spec>` is the URL or local path of an OpenAPI or Swagger spec (in either json or yml) and `<filename>` is the location of the `.ts` file to be generated. If the filename is omitted, the code is written to stdout.

## Overriding the defaults

The generated file exports a `defaults` constant that can be used to override the `basePath`, provide a custom `fetch` implementation or to send additional headers with each request:

```ts
import * as api from "./api.ts";
import nodeFetch from "node-fetch";

api.default.basePath = "https://example.com/api";

api.defaults.headers = {
  access_token: "secret",
};

api.defaults.fetch = nodeFetch;
```

## Consuming the generated API

For each operation defined in the spec the generated API will export a function with a name matching the `operationId`. If no id is specified, a reasonable name is generated from the HTTP verb and the path.

The **last argument** of each function is an optional `RequestOpts` object that can be used to pass options to the `fetch` call, for example to pass additional headers or an `AbortSignal` to cancel the request later on.

Each function **returns** a Promise for an `ApiResponse` which is an object with a `status` and a `data` property, holding the HTTP status code and the properly typed data from the response body. Since an operation can return different types depending on the status code, the actual return type is a _union_ of all possible responses, discriminated by their status.

Consider the following code generated from the `petstore.json` example:

```ts
export function getPetById(petId: number, opts?: RequestOpts) {
  return fetchJson<
    | {
        status: 200;
        data: Pet;
      }
    | {
        status: 400;
        data: string;
      }
    | {
        status: 404;
        data: string;
      }
  >(`/pet/${petId}`, {
    ...opts,
  });
}
```

In this case the `data` property is typed as `Pet|string`. We can use a type guard to narrow down the type to `Pet`:

```ts
const res = await api.getPetById(1);
if (res.status === 200) {
  const pet = res.data;
  // ...
} else {
  const message = res.data;
  // handle the error
}
```

Alternatively we can use the `ok`-helper provided by oazapfts:

```ts
import { ok } from "oazapfts";

const pet = await ok(api.getPetById(1));
```

With this pattern `pet` will be typed as `Pet` and a `HttpError` will be thrown in case of an error.

## About the name

The name comes from a combination of syllables **oa** (OpenAPI) and **ts** (TypeScript) and is [pronounced 🗣](https://youtu.be/chvb-K95rBE) like the Bavarian _O'zapt'is!_ (it's tapped), the famous words that mark the beginning of the Oktoberfest.

# License

MIT
