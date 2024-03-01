import { OpenAPIReferenceObject } from "../../openApi3-x";

export function isReference(obj: unknown): obj is OpenAPIReferenceObject {
  return typeof obj === "object" && obj !== null && "$ref" in obj;
}
