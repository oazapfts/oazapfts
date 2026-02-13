# @oazapfts/resolve

JSON Schema reference resolver from [Oazapfts](https://github.com/oazapfts/oazapfts).

## Installation

```
npm install @oazapfts/resolve
```

## Usage

```typescript
import { createResolver } from "@oazapfts/resolve";

const spec = {
  openapi: "3.0.0",
  info: { title: "Test API", version: "1.0.0" },
  paths: {},
  components: {
    schemas: {
      Test: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
    },
  },
};

const resolve = createResolver(spec);
console.log(resolve({ $ref: "#/components/schemas/Test" }));
```

# License

MIT
