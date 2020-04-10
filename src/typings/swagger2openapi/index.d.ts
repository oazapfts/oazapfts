declare module "swagger2openapi" {
  import { OpenAPI, OpenAPIV3 } from "openapi-types";

  interface Result {
    openapi: OpenAPIV3.Document;
  }
  interface Options {
    anchors?: boolean;
  }
  export function convertObj(
    object: OpenAPI.Document,
    options: Options
  ): Result;
}
