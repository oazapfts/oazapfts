# 🍻 oazapfts!

Generate TypeScript clients to tap into OpenAPI servers.

## Usage

```
npx oazapfts <spec> [filename]
```

Where `<spec>` is the URL or local path of an OpenAPI 3.x JSON spec and `<filename>` is the location of the `.ts` file to be generated.

## Features

- **AST-based**:
  Unlike other code generators `oazapfts` does not use templates to generate code but uses TypeScript's built-in API to generate and pretty-print an abstract syntax tree.
- **Fast**: The cli does not use any of the official Java-based tooling, so the code generation is super fast.
- **Dependency free**: The generated code does not use any external dependencies
- **Human friendly signatures**: The generated api methods don't leak an HTTP-specific implementation details. For example, all optional parameters are grouped together in one object, no matter whether they end up in the headers, path or query-string.

## About the name

The name is [pronounced 🗣](https://youtu.be/chvb-K95rBE) like the Bavarian _O'zapt'is!_ (it's tapped), the famous words that mark the beginning of the Oktoberfest.

# License

MIT
