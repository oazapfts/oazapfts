import { isReference, resolve } from "@oazapfts/resolve";
import { OazapftsContext, OnlyModes } from "../context";
import { ReferenceObject, SchemaObject } from "./openApi3-x";

/**
 * Checks if readOnly/writeOnly properties are present in the given schema.
 * Returns a tuple of booleans; the first one is about readOnly, the second
 * one is about writeOnly.
 */
export function checkSchemaOnlyMode(
  schema: SchemaObject | ReferenceObject,
  ctx: OazapftsContext,
  resolveRefs = true,
): OnlyModes {
  if (ctx.opts.mergeReadWriteOnly) {
    return { readOnly: false, writeOnly: false };
  }

  const check = (
    schema: SchemaObject | ReferenceObject,
    history: Set<string>,
  ): OnlyModes => {
    if (isReference(schema)) {
      if (!resolveRefs) return { readOnly: false, writeOnly: false };

      // history is used to prevent infinite recursion
      if (history.has(schema.$ref))
        return { readOnly: false, writeOnly: false };

      // check if the result is cached in `this.refsOnlyMode`
      const cached = ctx.refsOnlyMode.get(schema.$ref);
      if (cached) return cached;

      history.add(schema.$ref);
      const ret = check(resolve(schema, ctx), history);
      history.delete(schema.$ref);

      // cache the result
      ctx.refsOnlyMode.set(schema.$ref, ret);

      return ret;
    }

    if (typeof schema === "boolean") {
      return { readOnly: false, writeOnly: false };
    }

    let readOnly = schema.readOnly ?? false;
    let writeOnly = schema.writeOnly ?? false;

    const subSchemas: (ReferenceObject | SchemaObject)[] = [];
    if ("items" in schema && schema.items) {
      subSchemas.push(schema.items);
    } else {
      subSchemas.push(...Object.values(schema.properties ?? {}));
      subSchemas.push(...(schema.allOf ?? []));
      subSchemas.push(...(schema.anyOf ?? []));
      subSchemas.push(...(schema.oneOf ?? []));
    }

    for (const schema of subSchemas) {
      // `readOnly` and `writeOnly` do not change once they become true,
      // so you can exit early if both are true.
      if (readOnly && writeOnly) break;

      const result = check(schema, history);
      readOnly = readOnly || result.readOnly;
      writeOnly = writeOnly || result.writeOnly;
    }

    return { readOnly, writeOnly };
  };

  return check(schema, new Set<string>());
}
