# 🍻 oazapfts

Generate TypeScript clients to tap into OpenAPI servers.

This is a fork of [oazapfts](https://github.com/cellular/oazapfts) to allow for API generation from [tzkt](https://tzkt.io)-specific swagger.

For original documentation for this package please see the link above.

## How to use this package

### Install

Make sure to install it not as dev-dependency. Besides code generation functionalities, this libarary provides some runtime exports. [More on this.](https://github.com/cellular/oazapfts#installation)

```bash
npm i @tzkt/oazapfts
```

### Generate

```bash
npx oazapfts <spec> [filename]

Options:
--exclude, -e tag to exclude
--include, -i tag to include
```

Where `<spec>` is the URL or local path of an OpenAPI or Swagger spec (in either json or yml) and `<filename>` is the location of the `.ts` file to be generated. If the filename is omitted, the code is written to stdout.

### Read original documentation

On things like [overriding the defaults](https://github.com/cellular/oazapfts#overriding-the-defaults), [consuming the generated api](https://github.com/cellular/oazapfts#consuming-the-generated-api), [creating an optimistic api](https://github.com/cellular/oazapfts#optimistic-apis), and many more - please refer to the [original documentation](https://github.com/cellular/oazapfts).

## Differencies from the original package

### Codegen extensions

Despite this feature being developed specifically to account for [tzkt](https://tzkt.io)-specific endpoints, it may (and indeed should!) be used for generating API SDKs from any other OpenAPI docs.

## How to create your codegen extensions

### Create config file

Create an `oazapfts.config.ts` in the root of your project. Similar to how you would do with `webpack.config.js`, etc.

For now only Typescript config files are supported as this library is primarily aimed at TS users

### Add type imports

Add necessary type imports. This will provide the necessary IDE autocomplete suggestions when writing your extensions down the line.

Types for every available type of extension are also available to be imported from the same location. More on each extension type [below](#extensions-types).

```ts
import {
  OazapftsExtensions,
  SchemaParserExtension,
  ParameterParserExtension,
  QueryStringParserExtension,
} from "@tzkt/oazapfts/lib/codegen/extensions";
```

### Get on to writing your extensions

For reference use of this library with available extensions see [@tzkt/api-sdk-ts](https://github.com/tzkt/api-sdk-ts).

## Extensions Types

Every extension is essentially an array of methods that you `export default` from `oazapfts.config.ts` in a single object of type `OazapftsExtensions`. You will see detailed examples on how to do it later.

```ts
// oazapfts.config.ts
import { OazapftsExtensions } from "@tzkt/oazapfts/lib/codegen/extensions";

const extensions: OazapftsExtensions = {
  extensionType1: [
    // your methods for this extension
  ],
  // ...
};

export default extensions;
```

Every method, mentioned above, receives two parameters:

- first one is specific to a particular extension type
- second one is a `helpers` object, that contains some useful methods, that may be used in your extension code

### Schema Parser Extension

This is the most low-level extension type, allowing you to override, how any schema found in your OpenAPI spec is parsed.

```ts
type SchemaParserExtension = (
  s: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined,
  helpers: SchemaParserExtensionHelpers & typeof defaultHelpers
) => ts.TypeNode | undefined;
```

During code generation every schema will be processed by every method that you provide to this extension, until some method returns a non-nullish value. Once this happens, code generation will proceed with the next schema.

If no method returns a non-nullish value, a schema will be processed by a default schema type parser. Btw, this default method is also available to you as `helpers.defaultSchemaTypeParser`.

```ts
// oazapfts.config.ts
import {
  OazapftsExtensions,
  SchemaParserExtension,
} from "@tzkt/oazapfts/lib/codegen/extensions";
import { factory } from "typescript";

const myCustomSchemaParserExtension: SchemaParserExtension = (s, helpers) => {
  if (!s || helpers.isReference(s)) return;

  const isSchemaExtended = !!s["x-my-custom-schema"];
  if (!isSchemaExtended) return;

  const stringNode = helpers.createPropertySignature({
    name: "stringField",
    questionToken: false,
    type: helpers.keywordType.string,
  });

  return factory.createTypeLiteralNode([stringNode]);
};

const extensions: OazapftsExtensions = {
  schemaParserExtensions: [myCustomSchemaParserExtension],
};

export default extensions;
```

### Parameter Parser Extension

This is a more high-level extension allowing to override the default parsing logic for an API method parameter before it even reaches the schema type parser.

```ts
type ParameterParserExtension = (
  p: OpenAPIV3.ParameterObject,
  helpers: ParameterParserExtensionHelpers & typeof defaultHelpers
) => ts.TypeNode | undefined;
```

This extension type is essentially similar to [Schema Parser Extension](#schema-parser-extension). And the default parser method is available via `helpers.defaultParameterTypeParser`.

Important thing to note here is if the parameter was processed by one of the methods, provided by this extension, it will not be passed on down to Schema Type Parser. Regardless of whether there schemaTypeParsers were extended with [Schema Parser Extension](#schema-parser-extension).

```ts
// oazapfts.config.ts
import {
  OazapftsExtensions,
  ParameterParserExtension,
} from "@tzkt/oazapfts/lib/codegen/extensions";
import { factory } from "typescript";

const myParameterParserExtension: ParameterParserExtension = (p, helpers) => {
  const isParameterExtended = !!s["x-my-custom-parameter"];
  if (!isParameterExtended) return;

  const stringNode = helpers.createPropertySignature({
    name: "stringField",
    questionToken: false,
    type: helpers.keywordType.string,
  });

  return factory.createTypeLiteralNode([stringNode]);
};

const extensions: OazapftsExtensions = {
  parameterParserExtensions: [myParameterParserExtension],
};

export default extensions;
```

### Query String Parser Extension

This is a different approach to extending code generation. Rather than changing how certain [OpenAPI schemas](#schema-parser-extension) or [API method parameters](#parameter-parser-extension) are parsed, this extension type changes how parameters passed to API calls in runtime are transformed into query strings.

Methods provided within this extension return the names of custom query string transformers.

```ts
type QueryStringParserExtension = (
  p: OpenAPIV3.ParameterObject,
  helpers: QueryStringParserExtensionHelpers & typeof defaultHelpers
) => string | undefined;
```

Transformers themselves are imported and used during the runtime. The way you provide these transformers is by creating a `queryParamParsers.ts` file and placing it next to your generated API SDK library.

This file is your collection of custom transformers that are, just like with [`oazapfts.config.ts`](#create-config-file), `export default`ed to be used during runtime

```ts
// queryParamParsers.ts
import { QueryParamParser } from "@tzkt/oazapfts/lib/codegen/extensions";

const myCustomParser1: QueryParamParser = (paramName, p?) => {
  // your custom parser logic
};

const myCustomParser2: QueryParamParser = (paramName, p?) => {
  // your custom parser logic
};

const parsers: Record<string, QueryParamParser> = {
  myCustomParser1,
  myCustomParser2,
  // ...
};

export default parsers;
```

Why and when would this be useful? One example is when parameter types for your API methods are generated correctly, but the way these parameters are parsed into query string in runtime is non-standard or can not be easily described by an OpenAPI spec.

```ts
// oazapfts.config.ts
import {
  OazapftsExtensions,
  QueryStringParserExtension,
} from "@tzkt/oazapfts/lib/codegen/extensions";
import * as _ from "lodash";

const myQueryStringParserExtension: QueryStringParserExtension = (p) => {
  const parameterName = p["x-my-customly-parsed-parameter-name"];
  if (!parameterName) return;

  return _.camelCase(parameterName);
};

const extensions: OazapftsExtensions = {
  queryStringParserExtensions: [myQueryStringParserExtension],
};

export default extensions;
```

What does the code above do? It will be applied to every parameter of every API method found in OpenAPI spec. If a parameter has a field `x-my-customly-parsed-parameter-name`, the generated code will return a camel-cased value of this field.

This means that in runtime this parameter will be first transformed using a custom method from `queryParamParsers.ts` before being passed down to the default query string parser. The name of this transformer method is the camel-cased string from above.

Now onto `queryParamParsers.ts`.

```ts
type QueryParamParser = (
  parameterName: string,
  parameter?: Record<string, any> | null
) => Record<string, any>;
```

Every query param parser will be called with two arguments

- `parameterName` is the original parameter name specified in your OpenAPI spec
- `parameter` is whatever is the value that this parameter was passed in with in runtime

Now back to our example.

```ts
// queryParamParsers.ts
import { QueryParamParser } from "@tzkt/oazapfts/lib/codegen/extensions";

const myCustomParser: QueryParamParser = (paramName, p?) => {
  if (!p) return {};

  const paramsObj: Record<string, unknown> = {};

  Object.entries(p).forEach(([k, v]) => {
    const key = `${paramName}.${k}`;
    paramsObj[key] = v;
  });

  return paramsObj;
};

const parsers: Record<string, QueryParamParser> = {
  myCustomParser,
};

export default parsers;
```

So if the value of `x-my-customly-parsed-parameter-name` in parameter above was `my-custom-parser` then this parameter will be transformed in runtime using (camelCased) `myCustomParser` method from `queryParamParsers.ts`. Only then it will be parsed into a query string using default query string parser.

Note that any `QueryParamParser` returns a `Record<string, any>`. Keys of this object are essentially parameter names to be used in query string in server request. What this means is that you can use one parameter to generate several queries in query string at once. Just like in the example above.
