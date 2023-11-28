import _ from "lodash";
import ts, { factory } from "typescript";
import path from "path";
import { OpenAPIV3 } from "openapi-types";
import * as cg from "./tscodegen";
import generateServers, { defaultBaseUrl } from "./generateServers";
import { Opts } from ".";
import merge from "deepmerge";

export const verbs = [
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "PATCH",
  "TRACE",
];

type ContentType = "json" | "form" | "multipart";
type OnlyMode = "readOnly" | "writeOnly";

const contentTypes: Record<string, ContentType> = {
  "*/*": "json",
  "application/json": "json",
  "application/x-www-form-urlencoded": "form",
  "multipart/form-data": "multipart",
};

export function isMimeType(s: unknown) {
  return typeof s === "string" && /^[^/]+\/[^/]+$/.test(s);
}

export function isJsonMimeType(mime: string) {
  return contentTypes[mime] === "json" || /\bjson\b/i.test(mime);
}

export function getBodyFormatter(body?: OpenAPIV3.RequestBodyObject) {
  if (body?.content) {
    for (const contentType of Object.keys(body.content)) {
      const formatter = contentTypes[contentType];
      if (formatter) return formatter;
      if (isJsonMimeType(contentType)) return "json";
    }
  }
}

// Augment SchemaObject type to allow slowly adopting new OAS3.1+ features
// and support custom vendor extensions.
type SchemaObject = OpenAPIV3.SchemaObject & {
  const?: unknown;
  "x-enumNames"?: string[];
  "x-enum-varnames"?: string[];
  "x-component-ref-path"?: string;
  prefixItems?: (OpenAPIV3.ReferenceObject | SchemaObject)[];
};

/**
 * Get the name of a formatter function for a given parameter.
 */
export function getFormatter({
  style = "form",
  explode = true,
  content,
}: OpenAPIV3.ParameterObject) {
  if (content) {
    const medias = Object.keys(content);
    if (medias.length !== 1) {
      throw new Error(
        "Parameters with content property must specify one media type",
      );
    }
    if (!isJsonMimeType(medias[0])) {
      throw new Error(
        "Parameters with content property must specify a JSON compatible media type",
      );
    }
    return "json";
  }
  if (explode && style === "deepObject") return "deep";
  if (explode) return "explode";
  if (style === "spaceDelimited") return "space";
  if (style === "pipeDelimited") return "pipe";
  return "form";
}

export function getOperationIdentifier(id?: string) {
  if (!id) return;
  if (id.match(/[^\w\s]/)) return;
  id = _.camelCase(id);
  if (cg.isValidIdentifier(id)) return id;
}

/**
 * Create a method name for a given operation, either from its operationId or
 * the HTTP verb and path.
 */
export function getOperationName(
  verb: string,
  path: string,
  operationId?: string,
) {
  const id = getOperationIdentifier(operationId);
  if (id) return id;
  path = path.replace(/\{(.+?)\}/, "by $1").replace(/\{(.+?)\}/, "and $1");
  return toIdentifier(`${verb} ${path}`);
}

export function isNullable(schema?: SchemaObject | OpenAPIV3.ReferenceObject) {
  return schema && !isReference(schema) && schema.nullable;
}

export function isReference(obj: unknown): obj is OpenAPIV3.ReferenceObject {
  return typeof obj === "object" && obj !== null && "$ref" in obj;
}

/**
 * Converts a local reference path into an array of property names.
 */
export function refPathToPropertyPath(ref: string) {
  if (!ref.startsWith("#/")) {
    throw new Error(
      `External refs are not supported (${ref}). Make sure to call SwaggerParser.bundle() first.`,
    );
  }
  return ref
    .slice(2)
    .split("/")
    .map((s) => decodeURI(s.replace(/~1/g, "/").replace(/~0/g, "~")));
}

/**
 * Get the last path component of the given ref.
 */
function getRefBasename(ref: string) {
  return ref.replace(/.+\//, "");
}

/**
 * Returns a name for the given ref that can be used as basis for a type
 * alias. This usually is the baseName, unless the ref starts with a number,
 * in which case the whole ref is returned, with slashes turned into
 * underscores.
 */
function getRefName(ref: string) {
  const base = getRefBasename(ref);
  if (/^\d+/.test(base)) {
    return refPathToPropertyPath(ref).join("_");
  }
  return base;
}

/**
 * If the given object is a ReferenceObject, return the last part of its path.
 */
export function getReferenceName(obj: unknown) {
  if (isReference(obj)) {
    return getRefBasename(obj.$ref);
  }
}

const onlyModeSuffixes: Record<OnlyMode, string> = {
  readOnly: "Read",
  writeOnly: "Write",
};

function getOnlyModeSuffix(onlyMode?: OnlyMode) {
  if (!onlyMode) return "";
  return onlyModeSuffixes[onlyMode];
}

export function toIdentifier(
  s: string,
  upperFirst = false,
  onlyMode?: OnlyMode,
) {
  let cc = _.camelCase(s) + getOnlyModeSuffix(onlyMode);
  if (upperFirst) cc = _.upperFirst(cc);
  if (cg.isValidIdentifier(cc)) return cc;
  return "$" + cc;
}

/**
 * Create a template string literal from the given OpenAPI urlTemplate.
 * Curly braces in the path are turned into identifier expressions,
 * which are read from the local scope during runtime.
 */
export function createUrlExpression(path: string, qs?: ts.Expression) {
  const spans: Array<{ expression: ts.Expression; literal: string }> = [];
  // Use a replacer function to collect spans as a side effect:
  const head = path.replace(
    /(.*?)\{(.+?)\}(.*?)(?=\{|$)/g,
    (_substr, head, name, literal) => {
      const expression = toIdentifier(name);
      spans.push({
        expression: cg.createCall(
          factory.createIdentifier("encodeURIComponent"),
          { args: [factory.createIdentifier(expression)] },
        ),
        literal,
      });
      return head;
    },
  );

  if (qs) {
    // add the query string as last span
    spans.push({ expression: qs, literal: "" });
  }
  return cg.createTemplateString(head, spans);
}

/**
 * Create a call expression for one of the QS runtime functions.
 */
export function callQsFunction(name: string, args: ts.Expression[]) {
  return cg.createCall(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("QS"),
      name,
    ),
    { args },
  );
}

/**
 * Create a call expression for one of the oazapfts runtime functions.
 */
export function callOazapftsFunction(
  name: string,
  args: ts.Expression[],
  typeArgs?: ts.TypeNode[],
) {
  return cg.createCall(
    factory.createPropertyAccessExpression(
      factory.createIdentifier("oazapfts"),
      name,
    ),
    { args, typeArgs },
  );
}

/**
 * Despite its name, OpenApi's `deepObject` serialization does not support
 * deeply nested objects. As a workaround we detect parameters that contain
 * square brackets and merge them into a single object.
 */
export function supportDeepObjects(params: OpenAPIV3.ParameterObject[]) {
  const res: OpenAPIV3.ParameterObject[] = [];
  const merged: any = {};
  params.forEach((p) => {
    const m = /^(.+?)\[(.*?)\]/.exec(p.name);
    if (!m) {
      res.push(p);
      return;
    }
    const [, name, prop] = m;
    let obj = merged[name];
    if (!obj) {
      obj = merged[name] = {
        name,
        in: p.in,
        style: "deepObject",
        schema: {
          type: "object",
          properties: {},
        },
      };
      res.push(obj);
    }
    obj.schema.properties[prop] = p.schema;
  });
  return res;
}

/**
 * Main entry point that generates TypeScript code from a given API spec.
 */
export default class ApiGenerator {
  constructor(
    public readonly spec: OpenAPIV3.Document,
    public readonly opts: Opts = {},
    /** Indicates if the document was converted from an older version of the OpenAPI specification. */
    public readonly isConverted = false,
  ) {
    if (this.spec.components?.schemas) {
      this.preprocessComponents(this.spec.components.schemas);
    }
  }

  // see `preprocessComponents` for the definition of a discriminating schema
  discriminatingSchemas: Set<string> = new Set();

  aliases: (ts.TypeAliasDeclaration | ts.InterfaceDeclaration)[] = [];

  enumAliases: ts.Statement[] = [];
  enumRefs: Record<string, { values: string; type: ts.TypeReferenceNode }> = {};

  // Collect the types of all referenced schemas so we can export them later
  // Referenced schemas can be pointing at the following versions:
  // - "base": The regular type/interface e.g. ExampleSchema
  // - "readOnly": The readOnly version e.g. ExampleSchemaRead
  // - "writeOnly": The writeOnly version e.g. ExampleSchemaWrite
  refs: Record<
    string,
    {
      base: ts.TypeReferenceNode;
      readOnly?: ts.TypeReferenceNode;
      writeOnly?: ts.TypeReferenceNode;
    }
  > = {};

  // Maps a referenced schema to its readOnly/writeOnly status
  // This field should be used exclusively within the `checkSchemaOnlyMode` method
  refsOnlyMode: Map<string, [boolean, boolean]> = new Map();

  // Keep track of already used type aliases
  typeAliases: Record<string, number> = {};

  reset() {
    this.aliases = [];
    this.enumAliases = [];
    this.refs = {};
    this.typeAliases = {};
  }

  resolve<T>(obj: T | OpenAPIV3.ReferenceObject) {
    if (!isReference(obj)) return obj;
    const ref = obj.$ref;
    const path = refPathToPropertyPath(ref);
    const resolved = _.get(this.spec, path);
    if (typeof resolved === "undefined") {
      throw new Error(`Can't find ${path}`);
    }
    return resolved as T;
  }

  resolveArray<T>(array?: Array<T | OpenAPIV3.ReferenceObject>) {
    return array ? array.map((el) => this.resolve(el)) : [];
  }

  skip(tags?: string[]) {
    const excluded = tags && tags.some((t) => this.opts?.exclude?.includes(t));
    if (excluded) {
      return true;
    }
    if (this.opts?.include) {
      const included = tags && tags.some((t) => this.opts.include?.includes(t));
      return !included;
    }
    return false;
  }

  findAvailableRef(ref: string) {
    const available = (ref: string) => {
      try {
        this.resolve({ $ref: ref });
        return false;
      } catch (error) {
        return true;
      }
    };

    if (available(ref)) return ref;

    let i = 2;
    while (true) {
      const key = ref + String(i);
      if (available(key)) return key;
      i += 1;
    }
  }

  getUniqueAlias(name: string) {
    let used = this.typeAliases[name] || 0;
    if (used) {
      this.typeAliases[name] = ++used;
      name += used;
    }
    this.typeAliases[name] = 1;
    return name;
  }

  getEnumUniqueAlias(name: string, values: string) {
    // If enum name already exists and have the same values
    if (this.enumRefs[name] && this.enumRefs[name].values == values) {
      return name;
    }

    return this.getUniqueAlias(name);
  }

  /**
   * Create a type alias for the schema referenced by the given ReferenceObject
   */
  getRefAlias(
    obj: OpenAPIV3.ReferenceObject,
    onlyMode?: OnlyMode,
    // If true, the discriminator property of the schema referenced by `obj` will be ignored.
    // This is meant to be used when getting the type of a discriminating schema in an `allOf`
    // construct.
    ignoreDiscriminator?: boolean,
  ) {
    const $ref = ignoreDiscriminator
      ? this.findAvailableRef(obj.$ref + "Base")
      : obj.$ref;

    if (!this.refs[$ref]) {
      let schema = this.resolve<SchemaObject>(obj);
      if (ignoreDiscriminator) {
        schema = _.cloneDeep(schema);
        delete schema.discriminator;
      }
      const name = schema.title || getRefName($ref);
      const identifier = toIdentifier(name, true);

      // When this is a true enum we can reference it directly,
      // no need to create a type alias
      if (this.isTrueEnum(schema, name)) {
        return this.getTypeFromSchema(schema, name);
      }

      const alias = this.getUniqueAlias(identifier);

      this.refs[$ref] = {
        base: factory.createTypeReferenceNode(alias, undefined),
        readOnly: undefined,
        writeOnly: undefined,
      };

      const type = this.getTypeFromSchema(schema, undefined);
      this.aliases.push(
        cg.createTypeAliasDeclaration({
          modifiers: [cg.modifier.export],
          name: alias,
          type,
        }),
      );

      const [isReadOnly, isWriteOnly] = this.checkSchemaOnlyMode(schema);

      if (isReadOnly) {
        const readOnlyAlias = this.getUniqueAlias(
          toIdentifier(name, true, "readOnly"),
        );
        this.refs[$ref]["readOnly"] = factory.createTypeReferenceNode(
          readOnlyAlias,
          undefined,
        );

        const readOnlyType = this.getTypeFromSchema(schema, name, "readOnly");
        this.aliases.push(
          cg.createTypeAliasDeclaration({
            modifiers: [cg.modifier.export],
            name: readOnlyAlias,
            type: readOnlyType,
          }),
        );
      }

      if (isWriteOnly) {
        const writeOnlyAlias = this.getUniqueAlias(
          toIdentifier(name, true, "writeOnly"),
        );
        this.refs[$ref]["writeOnly"] = factory.createTypeReferenceNode(
          writeOnlyAlias,
          undefined,
        );
        const writeOnlyType = this.getTypeFromSchema(schema, name, "writeOnly");
        this.aliases.push(
          cg.createTypeAliasDeclaration({
            modifiers: [cg.modifier.export],
            name: writeOnlyAlias,
            type: writeOnlyType,
          }),
        );
      }
    }

    // If not ref fallback to the regular reference
    return this.refs[$ref][onlyMode || "base"] ?? this.refs[$ref].base;
  }

  getUnionType(
    variants: (OpenAPIV3.ReferenceObject | SchemaObject)[],
    discriminator?: OpenAPIV3.DiscriminatorObject,
    onlyMode?: OnlyMode,
  ) {
    if (discriminator) {
      // oneOf + discriminator -> tagged union (polymorphism)
      if (discriminator.propertyName === undefined) {
        throw new Error("Discriminators require a propertyName");
      }

      // By default, the last component of the ref name (i.e., after the last trailing slash) is
      // used as the discriminator value for each variant. This can be overridden using the
      // discriminator.mapping property.
      const mappedValues = new Set(
        Object.values(discriminator.mapping || {}).map(getRefBasename),
      );

      return factory.createUnionTypeNode(
        (
          [
            ...Object.entries(discriminator.mapping || {}).map(
              ([discriminatorValue, variantRef]) => [
                discriminatorValue,
                { $ref: variantRef },
              ],
            ),
            ...variants
              .filter((variant) => {
                if (!isReference(variant)) {
                  // From the Swagger spec: "When using the discriminator, inline schemas will not be
                  // considered."
                  throw new Error(
                    "Discriminators require references, not inline schemas",
                  );
                }
                return !mappedValues.has(getRefBasename(variant.$ref));
              })
              .map((schema) => [
                getRefBasename((schema as OpenAPIV3.ReferenceObject).$ref),
                schema,
              ]),
          ] as [string, OpenAPIV3.ReferenceObject][]
        ).map(([discriminatorValue, variant]) =>
          // Yields: { [discriminator.propertyName]: discriminatorValue } & variant
          factory.createIntersectionTypeNode([
            factory.createTypeLiteralNode([
              cg.createPropertySignature({
                name: discriminator.propertyName,
                type: factory.createLiteralTypeNode(
                  factory.createStringLiteral(discriminatorValue),
                ),
              }),
            ]),
            this.getTypeFromSchema(variant, undefined, onlyMode),
          ]),
        ),
      );
    } else {
      // oneOf -> untagged union
      return factory.createUnionTypeNode(
        variants.map((schema) =>
          this.getTypeFromSchema(schema, undefined, onlyMode),
        ),
      );
    }
  }

  /**
   * Creates a type node from a given schema.
   * Delegates to getBaseTypeFromSchema internally and
   * optionally adds a union with null.
   */
  getTypeFromSchema(
    schema?: SchemaObject | OpenAPIV3.ReferenceObject,
    name?: string,
    onlyMode?: OnlyMode,
  ) {
    const type = this.getBaseTypeFromSchema(schema, name, onlyMode);
    return isNullable(schema)
      ? factory.createUnionTypeNode([type, cg.keywordType.null])
      : type;
  }

  /**
   * This is the very core of the OpenAPI to TS conversion - it takes a
   * schema and returns the appropriate type.
   */
  getBaseTypeFromSchema(
    schema?: SchemaObject | OpenAPIV3.ReferenceObject,
    name?: string,
    onlyMode?: OnlyMode,
  ): ts.TypeNode {
    if (!schema) return cg.keywordType.any;
    if (isReference(schema)) {
      return this.getRefAlias(schema, onlyMode) as ts.TypeReferenceNode;
    }

    if (schema.oneOf) {
      const clone = { ...schema };
      delete clone.oneOf;
      // oneOf -> union
      return this.getUnionType(
        schema.oneOf.map((variant) => merge(variant as any, clone as any)),
        schema.discriminator,
        onlyMode,
      );
    }
    if (schema.anyOf) {
      // anyOf -> union
      return this.getUnionType(schema.anyOf, undefined, onlyMode);
    }
    if (schema.discriminator) {
      // discriminating schema -> union
      const mapping = schema.discriminator.mapping || {};
      return this.getUnionType(
        Object.values(mapping).map((ref) => ({ $ref: ref })),
        undefined,
        onlyMode,
      );
    }
    if (schema.allOf) {
      // allOf -> intersection
      const types = [];
      for (const childSchema of schema.allOf) {
        if (
          isReference(childSchema) &&
          this.discriminatingSchemas.has(childSchema.$ref)
        ) {
          const discriminatingSchema = this.resolve<SchemaObject>(childSchema);
          const discriminator = discriminatingSchema.discriminator!;
          const matched = Object.entries(discriminator.mapping || {}).find(
            ([, ref]) => ref === schema["x-component-ref-path"],
          );
          if (matched) {
            const [discriminatorValue] = matched;
            types.push(
              factory.createTypeLiteralNode([
                cg.createPropertySignature({
                  name: discriminator.propertyName,
                  type: factory.createLiteralTypeNode(
                    factory.createStringLiteral(discriminatorValue),
                  ),
                }),
              ]),
            );
          }
          types.push(
            this.getRefAlias(
              childSchema,
              onlyMode,
              /* ignoreDiscriminator */ true,
            ),
          );
        } else {
          types.push(this.getTypeFromSchema(childSchema, undefined, onlyMode));
        }
      }

      if (schema.properties || schema.additionalProperties) {
        // properties -> literal type
        types.push(
          this.getTypeFromProperties(
            schema.properties || {},
            schema.required,
            schema.additionalProperties,
            onlyMode,
          ),
        );
      }
      return factory.createIntersectionTypeNode(types);
    }
    if ("items" in schema) {
      // items -> array
      return factory.createArrayTypeNode(
        this.getTypeFromSchema(schema.items, undefined, onlyMode),
      );
    }
    if ("prefixItems" in schema && schema.prefixItems) {
      // prefixItems -> typed tuple
      return factory.createTupleTypeNode(
        schema.prefixItems.map((schema) => this.getTypeFromSchema(schema)),
      );
    }
    if (schema.properties || schema.additionalProperties) {
      // properties -> literal type
      return this.getTypeFromProperties(
        schema.properties || {},
        schema.required,
        schema.additionalProperties,
        onlyMode,
      );
    }
    if (schema.enum) {
      // enum -> enum or union
      return this.isTrueEnum(schema, name)
        ? this.getTrueEnum(schema, name)
        : cg.createEnumTypeNode(schema.enum);
    }
    if (schema.format == "binary") {
      return factory.createTypeReferenceNode("Blob", []);
    }
    if (schema.const) {
      return this.getTypeFromEnum([schema.const]);
    }
    if (schema.type) {
      // string, boolean, null, number
      if (schema.type === "integer") return cg.keywordType.number;
      if (schema.type in cg.keywordType) return cg.keywordType[schema.type];
    }

    return cg.keywordType.any;
  }

  isTrueEnum(schema: SchemaObject, name?: string): name is string {
    return Boolean(
      schema.enum && this.opts.useEnumType && name && schema.type !== "boolean",
    );
  }

  /**
   * Creates literal type (or union) from an array of values
   */
  getTypeFromEnum(values: unknown[]) {
    const types = values.map((s) => {
      if (s === null) return cg.keywordType.null;
      if (typeof s === "boolean")
        return s
          ? factory.createLiteralTypeNode(
              ts.factory.createToken(ts.SyntaxKind.TrueKeyword),
            )
          : factory.createLiteralTypeNode(
              ts.factory.createToken(ts.SyntaxKind.FalseKeyword),
            );
      if (typeof s === "number")
        return factory.createLiteralTypeNode(factory.createNumericLiteral(s));
      if (typeof s === "string")
        return factory.createLiteralTypeNode(factory.createStringLiteral(s));
      throw new Error(`Unexpected ${String(s)} of type ${typeof s} in enum`);
    });
    return types.length > 1 ? factory.createUnionTypeNode(types) : types[0];
  }

  getEnumValuesString(values: string[]) {
    return values.join("_");
  }

  /*
    Creates a enum "ref" if not used, reuse existing if values and name matches or creates a new one
    with a new name adding a number
  */
  getTrueEnum(schema: SchemaObject, propName: string) {
    const proposedName = schema.title || _.upperFirst(propName);
    const stringEnumValue = this.getEnumValuesString(
      schema.enum ? schema.enum : [],
    );

    const name = this.getEnumUniqueAlias(proposedName, stringEnumValue);

    if (this.enumRefs[proposedName] && proposedName === name) {
      return this.enumRefs[proposedName].type;
    }

    const values = schema.enum ? schema.enum : [];

    const names = schema["x-enumNames"] ?? schema["x-enum-varnames"];
    if (names) {
      if (!Array.isArray(names)) {
        throw new Error("enum names must be an array");
      }
      if (names.length !== values.length) {
        throw new Error("enum names must have the same length as enum values");
      }
    }

    const members = values.map((s, index) => {
      if (schema.type === "number" || schema.type === "integer") {
        const name = names ? names[index] : String(s);
        return factory.createEnumMember(
          factory.createIdentifier(toIdentifier(name, true)),
          factory.createNumericLiteral(s),
        );
      }
      return factory.createEnumMember(
        factory.createIdentifier(toIdentifier(s, true)),
        factory.createStringLiteral(s),
      );
    });
    this.enumAliases.push(
      factory.createEnumDeclaration([cg.modifier.export], name, members),
    );

    const type = factory.createTypeReferenceNode(name, undefined);

    this.enumRefs[proposedName] = {
      values: stringEnumValue,
      type: factory.createTypeReferenceNode(name, undefined),
    };

    return type;
  }

  /**
   * Checks if readOnly/writeOnly properties are present in the given schema.
   * Returns a tuple of booleans; the first one is about readOnly, the second
   * one is about writeOnly.
   */
  checkSchemaOnlyMode(
    schema: SchemaObject | OpenAPIV3.ReferenceObject,
    resolveRefs = true,
  ): [boolean, boolean] {
    if (this.opts.mergeReadWriteOnly) {
      return [false, false];
    }

    const check = (
      schema: SchemaObject | OpenAPIV3.ReferenceObject,
      history: Set<string>,
    ): [boolean, boolean] => {
      if (isReference(schema)) {
        if (!resolveRefs) return [false, false];

        // history is used to prevent infinite recursion
        if (history.has(schema.$ref)) return [false, false];

        // check if the result is cached in `this.refsOnlyMode`
        const cached = this.refsOnlyMode.get(schema.$ref);
        if (cached) return cached;

        history.add(schema.$ref);
        const ret = check(this.resolve(schema), history);
        history.delete(schema.$ref);

        // cache the result
        this.refsOnlyMode.set(schema.$ref, ret);

        return ret;
      }

      let readOnly = schema.readOnly ?? false;
      let writeOnly = schema.writeOnly ?? false;

      const subSchemas: (OpenAPIV3.ReferenceObject | SchemaObject)[] = [];
      if ("items" in schema) {
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
        readOnly = readOnly || result[0];
        writeOnly = writeOnly || result[1];
      }

      return [readOnly, writeOnly];
    };

    return check(schema, new Set<string>());
  }

  /**
   * Recursively creates a type literal with the given props.
   */
  getTypeFromProperties(
    props: {
      [prop: string]: SchemaObject | OpenAPIV3.ReferenceObject;
    },
    required?: string[],
    additionalProperties?:
      | boolean
      | OpenAPIV3.SchemaObject
      | OpenAPIV3.ReferenceObject,
    onlyMode?: OnlyMode,
  ): ts.TypeLiteralNode {
    // Check if any of the props are readOnly or writeOnly schemas
    const propertyNames = Object.keys(props);
    const filteredPropertyNames = propertyNames.filter((name) => {
      const schema = props[name];
      const [isReadOnly, isWriteOnly] = this.checkSchemaOnlyMode(schema, false);

      switch (onlyMode) {
        case "readOnly":
          return isReadOnly || !isWriteOnly;
        case "writeOnly":
          return isWriteOnly || !isReadOnly;
        default:
          return !isReadOnly && !isWriteOnly;
      }
    });

    const members: ts.TypeElement[] = filteredPropertyNames.map((name) => {
      const schema = props[name];
      const isRequired = required && required.includes(name);
      let type = this.getTypeFromSchema(schema, name, onlyMode);
      if (!isRequired && this.opts.unionUndefined) {
        type = factory.createUnionTypeNode([type, cg.keywordType.undefined]);
      }
      return cg.createPropertySignature({
        questionToken: !isRequired,
        name,
        type,
      });
    });
    if (additionalProperties) {
      const type =
        additionalProperties === true
          ? cg.keywordType.any
          : this.getTypeFromSchema(additionalProperties, undefined, onlyMode);

      members.push(cg.createIndexSignature(type));
    }
    return factory.createTypeLiteralNode(members);
  }

  getTypeFromResponses(
    responses: OpenAPIV3.ResponsesObject,
    onlyMode?: OnlyMode,
  ) {
    return factory.createUnionTypeNode(
      Object.entries(responses).map(([code, res]) => {
        const statusType =
          code === "default"
            ? cg.keywordType.number
            : factory.createLiteralTypeNode(factory.createNumericLiteral(code));

        const props = [
          cg.createPropertySignature({
            name: "status",
            type: statusType,
          }),
        ];

        const dataType = this.getTypeFromResponse(res, onlyMode);
        if (dataType !== cg.keywordType.void) {
          props.push(
            cg.createPropertySignature({
              name: "data",
              type: dataType,
            }),
          );
        }
        return factory.createTypeLiteralNode(props);
      }),
    );
  }

  getTypeFromResponse(
    resOrRef: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject,
    onlyMode?: OnlyMode,
  ) {
    const res = this.resolve(resOrRef);
    if (!res || !res.content) return cg.keywordType.void;
    return this.getTypeFromSchema(
      this.getSchemaFromContent(res.content),
      undefined,
      onlyMode,
    );
  }

  getResponseType(
    responses?: OpenAPIV3.ResponsesObject,
  ): "json" | "text" | "blob" {
    // backwards-compatibility
    if (!responses) return "text";

    const resolvedResponses = Object.values(responses).map((response) =>
      this.resolve(response),
    );

    // if no content is specified, assume `text` (backwards-compatibility)
    if (
      !resolvedResponses.some(
        (res) => Object.keys(res.content ?? {}).length > 0,
      )
    ) {
      return "text";
    }

    const isJson = resolvedResponses.some((response) => {
      const responseMimeTypes = Object.keys(response.content ?? {});
      return responseMimeTypes.some(isJsonMimeType);
    });

    // if there’s `application/json` or `*/*`, assume `json`
    if (isJson) {
      return "json";
    }

    // if there’s `text/*`, assume `text`
    if (
      resolvedResponses.some((res) =>
        Object.keys(res.content ?? []).some((type) => type.startsWith("text/")),
      )
    ) {
      return "text";
    }

    // for the rest, assume `blob`
    return "blob";
  }

  getSchemaFromContent(
    content: Record<string, OpenAPIV3.MediaTypeObject>,
  ): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject {
    const contentType = Object.keys(content).find(isMimeType);
    if (contentType) {
      const { schema } = content[contentType];
      if (schema) {
        return schema;
      }
    }

    // if no content is specified -> string
    // `text/*` -> string
    if (
      Object.keys(content).length === 0 ||
      Object.keys(content).some((type) => type.startsWith("text/"))
    ) {
      return { type: "string" };
    }

    // rest (e.g. `application/octet-stream`, `application/gzip`, …) -> binary
    return { type: "string", format: "binary" };
  }

  getTypeFromParameter(p: OpenAPIV3.ParameterObject) {
    if (p.content) {
      const schema = this.getSchemaFromContent(p.content);
      return this.getTypeFromSchema(schema);
    }
    return this.getTypeFromSchema(isReference(p) ? p : p.schema);
  }

  wrapResult(ex: ts.Expression) {
    return this.opts?.optimistic ? callOazapftsFunction("ok", [ex]) : ex;
  }

  /**
   * Does three things:
   * 1. Add a `x-component-ref-path` property.
   * 2. Record discriminating schemas in `this.discriminatingSchemas`. A discriminating schema
   *    refers to a schema that has a `discriminator` property which is neither used in conjunction
   *    with `oneOf` nor `anyOf`.
   * 3. Make all mappings of discriminating schemas explicit to generate types immediately.
   */
  preprocessComponents(schemas: {
    [key: string]: OpenAPIV3.ReferenceObject | SchemaObject;
  }) {
    const prefix = "#/components/schemas/";

    // First scan: Add `x-component-ref-path` property and record discriminating schemas
    for (const name of Object.keys(schemas)) {
      const schema = schemas[name];
      if (isReference(schema)) continue;

      schema["x-component-ref-path"] = prefix + name;

      if (schema.discriminator && !schema.oneOf && !schema.anyOf) {
        this.discriminatingSchemas.add(prefix + name);
      }
    }

    const isExplicit = (
      discriminator: OpenAPIV3.DiscriminatorObject,
      ref: string,
    ) => {
      const refs = Object.values(discriminator.mapping || {});
      return refs.includes(ref);
    };

    // Second scan: Make all mappings of discriminating schemas explicit
    for (const name of Object.keys(schemas)) {
      const schema = schemas[name];

      if (isReference(schema) || !schema.allOf) continue;

      for (const childSchema of schema.allOf) {
        if (
          !isReference(childSchema) ||
          !this.discriminatingSchemas.has(childSchema.$ref)
        ) {
          continue;
        }

        const discriminatingSchema = schemas[
          getRefBasename(childSchema.$ref)
        ] as SchemaObject;
        const discriminator = discriminatingSchema.discriminator!;

        if (isExplicit(discriminator, prefix + name)) continue;
        if (!discriminator.mapping) {
          discriminator.mapping = {};
        }
        discriminator.mapping[name] = prefix + name;
      }
    }
  }

  generateApi() {
    this.reset();

    // Parse ApiStub.ts so that we don't have to generate everything manually
    const stub = cg.parseFile(
      path.resolve(__dirname, "../../src/codegen/ApiStub.ts"),
    );

    // ApiStub contains `const servers = {}`, find it ...
    const servers = cg.findFirstVariableDeclaration(stub.statements, "servers");
    // servers.initializer is readonly, this might break in a future TS version, but works fine for now.
    Object.assign(servers, {
      initializer: generateServers(this.spec.servers || []),
    });

    const { initializer } = cg.findFirstVariableDeclaration(
      stub.statements,
      "defaults",
    );
    if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
      throw new Error("No object literal: defaults");
    }

    cg.changePropertyValue(
      initializer,
      "baseUrl",
      defaultBaseUrl(this.spec.servers || []),
    );

    // Collect class functions to be added...
    const functions: ts.FunctionDeclaration[] = [];

    // Keep track of names to detect duplicates
    const names: Record<string, number> = {};

    Object.keys(this.spec.paths).forEach((path) => {
      const item = this.spec.paths[path];

      if (!item) {
        return;
      }

      Object.keys(this.resolve(item)).forEach((verb) => {
        const method = verb.toUpperCase();
        // skip summary/description/parameters etc...
        if (!verbs.includes(method)) return;

        const op: OpenAPIV3.OperationObject = (item as any)[verb];
        const {
          operationId,
          requestBody,
          responses,
          summary,
          description,
          tags,
        } = op;

        if (this.skip(tags)) {
          return;
        }

        let name = getOperationName(verb, path, operationId);
        const count = (names[name] = (names[name] || 0) + 1);
        if (count > 1) {
          // The name is already taken, which means that the spec is probably
          // invalid as operationIds must be unique. Since this is quite common
          // nevertheless we append a counter:
          name += count;
        }

        // merge item and op parameters
        const resolvedParameters = this.resolveArray(item.parameters);
        for (const p of this.resolveArray(op.parameters)) {
          const existing = resolvedParameters.find(
            (r) => r.name === p.name && r.in === p.in,
          );
          if (!existing) {
            resolvedParameters.push(p);
          }
        }

        // expand older OpenAPI parameters into deepObject style where needed
        const parameters = this.isConverted
          ? supportDeepObjects(resolvedParameters)
          : resolvedParameters;

        // split into required/optional
        const [required, optional] = _.partition(parameters, "required");

        // convert parameter names to argument names ...
        const argNames = new Map<OpenAPIV3.ParameterObject, string>();
        _.sortBy(parameters, "name.length").forEach((p) => {
          const identifier = toIdentifier(p.name);
          const existing = [...argNames.values()];
          const suffix = existing.includes(identifier)
            ? _.upperFirst(p.in)
            : "";
          argNames.set(p, identifier + suffix);
        });

        const getArgName = (param: OpenAPIV3.ParameterObject) => {
          const name = argNames.get(param);
          if (!name) throw new Error(`Can't find parameter: ${param.name}`);
          return name;
        };

        // build the method signature - first all the required parameters
        const methodParams = required.map((p) =>
          cg.createParameter(getArgName(this.resolve(p)), {
            type: this.getTypeFromParameter(p),
          }),
        );

        let body: OpenAPIV3.RequestBodyObject | undefined;
        let bodyVar;

        // add body if present
        if (requestBody) {
          body = this.resolve(requestBody);
          const schema = this.getSchemaFromContent(body.content);
          const type = this.getTypeFromSchema(schema, undefined, "writeOnly");
          bodyVar = toIdentifier(
            (type as any).name || getReferenceName(schema) || "body",
          );
          methodParams.push(
            cg.createParameter(bodyVar, {
              type,
              questionToken: !body.required,
            }),
          );
        }

        // add an object with all optional parameters
        if (optional.length) {
          methodParams.push(
            cg.createParameter(
              cg.createObjectBinding(
                optional
                  .map((param) => this.resolve(param))
                  .map((param) => ({ name: getArgName(param) })),
              ),
              {
                initializer: factory.createObjectLiteralExpression(),
                type: factory.createTypeLiteralNode(
                  optional.map((p) =>
                    cg.createPropertySignature({
                      name: getArgName(this.resolve(p)),
                      questionToken: true,
                      type: this.getTypeFromParameter(p),
                    }),
                  ),
                ),
              },
            ),
          );
        }

        methodParams.push(
          cg.createParameter("opts", {
            type: factory.createTypeReferenceNode(
              "Oazapfts.RequestOpts",
              undefined,
            ),
            questionToken: true,
          }),
        );

        // Next, build the method body...

        const returnType = this.getResponseType(responses);
        const query = parameters.filter((p) => p.in === "query");
        const header = parameters.filter((p) => p.in === "header");

        let qs;
        if (query.length) {
          const paramsByFormatter = _.groupBy(query, getFormatter);
          qs = callQsFunction(
            "query",
            Object.entries(paramsByFormatter).map(([format, params]) => {
              //const [allowReserved, encodeReserved] = _.partition(params, "allowReserved");
              return callQsFunction(format, [
                cg.createObjectLiteral(
                  params.map((p) => [p.name, getArgName(p)]),
                ),
              ]);
            }),
          );
        }

        const url = createUrlExpression(path, qs);
        const init: ts.ObjectLiteralElementLike[] = [
          factory.createSpreadAssignment(factory.createIdentifier("opts")),
        ];

        if (method !== "GET") {
          init.push(
            factory.createPropertyAssignment(
              "method",
              factory.createStringLiteral(method),
            ),
          );
        }

        if (bodyVar) {
          init.push(
            cg.createPropertyAssignment(
              "body",
              factory.createIdentifier(bodyVar),
            ),
          );
        }

        if (header.length) {
          init.push(
            factory.createPropertyAssignment(
              "headers",
              factory.createObjectLiteralExpression(
                [
                  factory.createSpreadAssignment(
                    factory.createLogicalAnd(
                      factory.createIdentifier("opts"),
                      factory.createPropertyAccessExpression(
                        factory.createIdentifier("opts"),
                        "headers",
                      ),
                    ),
                  ),
                  ...header.map((param) =>
                    cg.createPropertyAssignment(
                      param.name,
                      factory.createIdentifier(getArgName(param)),
                    ),
                  ),
                ],
                true,
              ),
            ),
          );
        }

        const args: ts.Expression[] = [url];

        if (init.length) {
          const formatter = getBodyFormatter(body); // json, form, multipart
          const initObj = factory.createObjectLiteralExpression(init, true);
          args.push(
            formatter ? callOazapftsFunction(formatter, [initObj]) : initObj,
          );
        }

        functions.push(
          cg.addComment(
            cg.createFunctionDeclaration(
              name,
              {
                modifiers: [cg.modifier.export],
              },
              methodParams,
              cg.block(
                factory.createReturnStatement(
                  this.wrapResult(
                    callOazapftsFunction(
                      {
                        json: "fetchJson",
                        text: "fetchText",
                        blob: "fetchBlob",
                      }[returnType],
                      args,
                      returnType === "json" || returnType === "blob"
                        ? [
                            this.getTypeFromResponses(responses!, "readOnly") ||
                              ts.SyntaxKind.AnyKeyword,
                          ]
                        : undefined,
                    ),
                  ),
                ),
              ),
            ),
            summary || description,
          ),
        );
      });
    });

    Object.assign(stub, {
      statements: cg.appendNodes(
        stub.statements,
        ...[...this.aliases, ...functions],
        ...this.enumAliases,
      ),
    });

    return stub;
  }
}
