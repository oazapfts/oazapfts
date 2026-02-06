import { SchemaObject } from "./openApi3-x";

export function getCustomNames(
  schema: Exclude<SchemaObject, boolean>,
  values: unknown[],
) {
  const names =
    "x-enumNames" in schema
      ? schema["x-enumNames"]
      : "x-enum-varnames" in schema
        ? schema["x-enum-varnames"]
        : undefined;

  if (names) {
    if (!Array.isArray(names)) {
      throw new Error("enum names must be an array");
    }
    if (names.length !== values.length) {
      throw new Error("enum names must have the same length as enum values");
    }
    if (names.some((name) => typeof name !== "string")) {
      throw new Error("enum names must be an array of strings");
    }
    return names as string[];
  }

  return undefined;
}
