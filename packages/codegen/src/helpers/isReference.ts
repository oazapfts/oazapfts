import { ReferenceObject } from "../openApi3-x";

export function isReference(obj: unknown): obj is ReferenceObject {
  return typeof obj === "object" && obj !== null && "$ref" in obj;
}
