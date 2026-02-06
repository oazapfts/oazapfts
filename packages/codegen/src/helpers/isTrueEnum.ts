import { SchemaObject } from "./openApi3-x";

/**
 * Check if a schema is suitable for generating a named enum declaration
 * (has enum values, has a name, and is not a boolean type).
 */
export function isNamedEnumSchema(
  schema: SchemaObject,
  name?: string,
): name is string {
  return Boolean(
    typeof schema !== "boolean" &&
    schema.enum &&
    name &&
    schema.type !== "boolean",
  );
}
