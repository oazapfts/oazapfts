import type { OpenAPIV3_1, OpenAPIV3 } from "openapi-types";

export type ReferenceObject =
  | OpenAPIV3.ReferenceObject
  | OpenAPIV3_1.ReferenceObject;

export function isReference(obj: unknown): obj is ReferenceObject {
  return typeof obj === "object" && obj !== null && "$ref" in obj;
}
