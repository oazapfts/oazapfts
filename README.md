# 🍻 oazapfts!

[![CI](https://github.com/oazapfts/oazapfts/actions/workflows/ci.yml/badge.svg)](https://github.com/oazapfts/oazapfts/actions/workflows/ci.yml)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

Generate TypeScript clients to tap into OpenAPI servers.

![](https://avatars.githubusercontent.com/u/119607625?s=200&v=4)

## Features

- **AST-based**:
  Unlike other code generators `oazapfts` does not use templates to generate code but uses TypeScript's built-in API to generate and pretty-print an abstract syntax tree.
- **Fast**: The CLI does not use any of the common Java-based tooling, so the code generation is super fast.
- **Single file**: All functions and types are co-located in one single self-contained file.
- **Tree-shakeable**: Individually exported functions allow you to bundle only the ones you actually use.
- **Human friendly signatures**: The generated API methods don't leak any HTTP-specific implementation details. For example, all optional parameters are grouped together in one object, no matter whether they end up in the headers, path or query-string.

## Installation

```
npm install oazapfts
```

> **Note**
> With version 3.0.0 oazapfts has become a runtime dependency and the generated code does no longer include all the fetch logic.  
> As of 6.0.0 the runtime has been moved to a separate package, `@oazapfts/runtime`.

## Usage

```
oazapfts <spec> [filename]

Options:
--exclude, -e tag to exclude
--include, -i tag to include
--optimistic
--useEnumType
--mergeReadWriteOnly
--argumentStyle=<positional | object> (default: positional)
```

Where `<spec>` is the URL or local path of an OpenAPI or Swagger spec (in either json or yml) and `<filename>` is the location of the `.ts` file to be generated. If the filename is omitted, the code is written to stdout.

### Options

- `--optimistic` generate a client in [optimistic mode](#optimistic-mode)

- `--useEnumType` generate enums instead of union types

- `--mergeReadWriteOnly` by default oazapfs will generate separate types for read-only and write-only properties. This option will merge them into one type.

- `--argumentStyle` if "object" generated functions take single object style argument for parameters and requestBody, by default it's "positional" and parameters are separate as positional arguments

## Consuming the generated API

For each operation defined in the spec the generated API will export a function with a name matching the `operationId`. If no ID is specified, a reasonable name is generated from the HTTP verb and the path.

```ts
import * as api from "./my-generated-api.ts";
const res = api.getPetById(1);
```

> **Note**
> If your API is large, and you want to take advantage of tree-shaking to exclude unused code, use individual named imports instead:

```ts
import { getPetById } from "./my-generated-api.ts";
```

## Fetch options

The **last argument** of each function is an optional [`RequestOpts`](https://github.com/oazapfts/oazapfts/blob/27b296c6fc28fec4869f1b7e1a4a5585ebbd5ee9/src/runtime/index.ts#L5) object that can be used to pass options to the `fetch` call, for example to pass additional `headers` or an `AbortSignal` to cancel the request later on.

```ts
const res = getPetById(1, {
  credentials: "include",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

You can also use this to override the default `baseUrl` or to provide a custom `fetch` implementation.

> **Note**
> Instead of passing custom options to each function call, consider [overwriting the global defaults](#overriding-the-defaults).

## Optimistic vs. explicit responses

Oazapfts supports two different modes to handle results,
an [explicit](#explicit-mode) mode (the default) and an [optimistic](#optimistic-mode) mode, that makes the response handling less verbose.

## Explicit mode

By default, each function returns an `ApiResponse` object that exposes the `status` code, response `headers` and the `data`.

> **Note**
> This mode is best suited for APIs that return different types for different response codes or APIs where you need to access not only the response body, but also the response headers. If your API is simple, and you don't need this flexibility, consider using the [optimistic mode](#optimistic-mode) instead.

In explicit mode, each function returns a Promise for an `ApiResponse` which is an object with a `status` and a `data` property, holding the HTTP status code and the properly typed data from the response body.

Since an operation can return different types depending on the status code, the actual return type is a _union_ of all possible responses, discriminated by their status.

Consider the following code generated from the `petstore.json` example:

```ts
/**
 * Find pet by ID
 */
export function getPetById(petId: number, opts?: Oazapfts.RequestOpts) {
  return oazapfts.fetchJson<
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
      }
  >(`/pet/${encodeURIComponent(petId)}`, {
    ...opts,
  });
}
```

In this case, the `data` property is typed as `Pet|string`. We can use a type guard to narrow down the type to `Pet`:

```ts
const res = await api.getPetById(1);
if (res.status === 200) {
  const pet = res.data;
  // pet is properly typed as Pet
}
if (res.status === 404) {
  const message = res.data;
  // message is a string
} else {
  // handle the error
}
```

The above code can be simplified by using the `handle` helper:

```ts
import { handle } from "@oazapfts/runtime";

await handle(api.getPetById(1), {
  200(pet) {
    // pet is properly typed as Pet
  },
  404(message) {
    // message is as string
  },
});
```

The helper will throw an `HttpError` error for any unhandled status code, unless you add a `default` handler:

```ts
await handle(api.getPetById(1), {
  200(pet) {
    // ...
  },
  default(status, data) {
    // handle error
  },
});
```

## Optimistic mode

You can opt into the _optimistic mode_ by using the `--optimistic` command line argument.

In this mode, each function will return a Promise for the happy path, i.e. the type specified for the first `2xx` response.

Looking back at our Pet Store example from above, consuming the response is now much easier and less verbose:

```ts
const pet = await api.getPetById(1);
// pet is now typed as Pet!
```

In case of a response other than `200` the promise will be rejected with a `HttpError`.

## Mixing both modes

Sometimes you might want to use the optimistic mode for some of your API calls, but need the full `ApiResponse` for others.

In that case, you can use the `ok`-helper function to selectively apply optimistic response handling:

```ts
import { ok } from "@oazapfts/runtime";

const pet = await ok(api.getPetById(1));
```

## Overriding the defaults

The generated file exports a `defaults` constant that can be used to override the `basePath`, provide a custom `fetch` implementation or to send additional `headers` with each request. Basically, you can set a default for any [fetch option](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) you want.

```ts
import * as api from "./api.ts";
import nodeFetch from "node-fetch";

// Override the spec's basePath
api.defaults.basePath = "https://example.com/api";

// Send this header with each request
api.defaults.headers = {
  access_token: "secret",
};

// Include credentials in CORS requests, too
api.defaults.credentials = "include";

// Use this instead of the global fetch
api.defaults.fetch = nodeFetch;
```

## Alternatives and integrations

If this library doesn't fit your needs, take a look at [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) which follows a similar philosophy but creates many individual files instead of one single self-contained file.

If your frontend uses React, take a look at [react-api-query](https://www.npmjs.com/package/react-api-query) which makes it easy to use an oazapfts client with React hooks in a convenient and type-safe way.

## About the name

The name comes from a combination of syllables **oa** (OpenAPI) and **ts** (TypeScript) and is [pronounced 🗣](https://www.youtube.com/watch?v=chvb-K95rBE) like the Bavarian _O'zapt'is!_ (it's tapped), the famous words that mark the beginning of the Oktoberfest.

# License

MIT
