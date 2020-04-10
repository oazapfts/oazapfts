declare module "@openapi-contrib/openapi-schema-to-json-schema" {
  import { OpenAPIV3 } from "openapi-types";
  type Options = {
    cloneSchema?: boolean;
  };
  export default function toJsonSchema(
    object: OpenAPIV3.SchemaObject,
    options: Options = {}
  ): object;
  export { toJsonSchema };
}
