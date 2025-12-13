import { ReferenceObject, SchemaObject } from "../openApi3-x";
import { isReference } from "./isReference";

export function isNullable(schema?: SchemaObject | ReferenceObject) {
  if (schema && "nullable" in schema)
    return !isReference(schema) && schema.nullable;

  return false;
}
