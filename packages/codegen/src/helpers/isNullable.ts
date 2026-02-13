import { isReference } from "@oazapfts/resolve";
import { ReferenceObject, SchemaObject } from "./openApi3-x";

export function isNullable(schema?: SchemaObject | ReferenceObject) {
  if (typeof schema === "boolean") return schema;

  if (schema && "nullable" in schema)
    return !isReference(schema) && schema.nullable;

  return false;
}
