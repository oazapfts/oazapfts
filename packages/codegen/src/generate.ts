import _ from "lodash";
import ts from "typescript";
import * as cg from "./tscodegen";
import generateServers, { defaultBaseUrl } from "./generateServers";
import { OazapftsContext, OnlyMode, OnlyModes, resetContext } from "./context";
import {
  OpenAPIDiscriminatorObject,
  OpenAPIMediaTypeObject,
  OpenAPIOperationObject,
  OpenAPIParameterObject,
  OpenAPIReferenceObject,
  OpenAPIRequestBodyObject,
  OpenAPIResponseObject,
  OpenAPIResponsesObject,
  OpenAPISchemaObject,
} from "./openApi3-x";
import { isReference } from "./__future__/helpers/isReference";
import { getRefBasename } from "./__future__/helpers/getRefBasename";
import { preprocessComponents } from "./__future__/generate/preprocessComponents";

export * from "./tscodegen";
export * from "./generateServers";

const factory = ts.factory;

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

export function getBodyFormatter(body?: OpenAPIRequestBodyObject) {
  if (body?.content) {
    for (const contentType of Object.keys(body.content)) {
      const formatter = contentTypes[contentType];
      if (formatter) return formatter;
      if (isJsonMimeType(contentType)) return "json";
    }
  }
}

/**
 * Get the name of a formatter function for a given parameter.
 */
export function getFormatter({
  style = "form",
  explode = true,
  content,
}: OpenAPIParameterObject) {
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

export function isNullable(
  schema?: OpenAPISchemaObject | OpenAPIReferenceObject,
) {
  if (schema && "nullable" in schema)
    return !isReference(schema) && schema.nullable;

  return false;
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
export function supportDeepObjects(params: OpenAPIParameterObject[]) {
  const res: OpenAPIParameterObject[] = [];
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

function isKeyOfKeywordType(key: string): key is keyof typeof cg.keywordType {
  return key in cg.keywordType;
}

/**
 * Main entry point that generates TypeScript code from a given API spec.
 */
export default class ApiGenerator {
  constructor(public readonly ctx: OazapftsContext) {}

  reset() {
    resetContext(this.ctx);
  }

  resolve<T>(obj: T | OpenAPIReferenceObject) {
    if (!isReference(obj)) return obj;
    const ref = obj.$ref;
    const path = refPathToPropertyPath(ref);
    const resolved = _.get(this.ctx.spec, path);
    if (typeof resolved === "undefined") {
      throw new Error(`Can't find ${path}`);
    }
    return resolved as T;
  }

  resolveArray<T>(array?: Array<T | OpenAPIReferenceObject>) {
    return array ? array.map((el) => this.resolve(el)) : [];
  }

  skip(tags?: string[]) {
    const excluded =
      tags && tags.some((t) => this.ctx.opts?.exclude?.includes(t));
    if (excluded) {
      return true;
    }
    if (this.ctx.opts?.include) {
      const included =
        tags && tags.some((t) => this.ctx.opts.include?.includes(t));
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
    let used = this.ctx.typeAliases[name] || 0;
    if (used) {
      this.ctx.typeAliases[name] = ++used;
      name += used;
    }
    this.ctx.typeAliases[name] = 1;
    return name;
  }

  getEnumUniqueAlias(name: string, values: string) {
    // If enum name already exists and have the same values
    if (this.ctx.enumRefs[name] && this.ctx.enumRefs[name].values == values) {
      return name;
    }

    return this.getUniqueAlias(name);
  }

  /**
   * Create a type alias for the schema referenced by the given ReferenceObject
   */
  getRefAlias(
    obj: OpenAPIReferenceObject,
    onlyMode?: OnlyMode,
    // If true, the discriminator property of the schema referenced by `obj` will be ignored.
    // This is meant to be used when getting the type of a discriminating schema in an `allOf`
    // construct.
    ignoreDiscriminator?: boolean,
  ) {
    const $ref = ignoreDiscriminator
      ? this.findAvailableRef(obj.$ref + "Base")
      : obj.$ref;

    if (!this.ctx.refs[$ref]) {
      let schema = this.resolve<OpenAPISchemaObject>(obj);
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

      this.ctx.refs[$ref] = {
        base: factory.createTypeReferenceNode(alias, undefined),
        readOnly: undefined,
        writeOnly: undefined,
      };

      const type = this.getTypeFromSchema(schema, undefined);
      this.ctx.aliases.push(
        cg.createTypeAliasDeclaration({
          modifiers: [cg.modifier.export],
          name: alias,
          type,
        }),
      );

      const { readOnly, writeOnly } = this.checkSchemaOnlyMode(schema);

      if (readOnly) {
        const readOnlyAlias = this.getUniqueAlias(
          toIdentifier(name, true, "readOnly"),
        );
        this.ctx.refs[$ref]["readOnly"] = factory.createTypeReferenceNode(
          readOnlyAlias,
          undefined,
        );

        const readOnlyType = this.getTypeFromSchema(schema, name, "readOnly");
        this.ctx.aliases.push(
          cg.createTypeAliasDeclaration({
            modifiers: [cg.modifier.export],
            name: readOnlyAlias,
            type: readOnlyType,
          }),
        );
      }

      if (writeOnly) {
        const writeOnlyAlias = this.getUniqueAlias(
          toIdentifier(name, true, "writeOnly"),
        );
        this.ctx.refs[$ref]["writeOnly"] = factory.createTypeReferenceNode(
          writeOnlyAlias,
          undefined,
        );
        const writeOnlyType = this.getTypeFromSchema(schema, name, "writeOnly");
        this.ctx.aliases.push(
          cg.createTypeAliasDeclaration({
            modifiers: [cg.modifier.export],
            name: writeOnlyAlias,
            type: writeOnlyType,
          }),
        );
      }
    }

    // If not ref fallback to the regular reference
    return this.ctx.refs[$ref][onlyMode || "base"] ?? this.ctx.refs[$ref].base;
  }

  getUnionType(
    variants: (OpenAPIReferenceObject | OpenAPISchemaObject)[],
    discriminator?: OpenAPIDiscriminatorObject,
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
                getRefBasename((schema as OpenAPIReferenceObject).$ref),
                schema,
              ]),
          ] as [string, OpenAPIReferenceObject][]
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
    schema?: OpenAPISchemaObject | OpenAPIReferenceObject,
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
    schema?: OpenAPISchemaObject | OpenAPIReferenceObject,
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
        schema.oneOf.map((variant) =>
          // ensure that base properties from the schema are included in the oneOf variants
          _.mergeWith({}, clone, variant, (objValue, srcValue) => {
            if (_.isArray(objValue)) {
              return objValue.concat(srcValue);
            }
          }),
        ),
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
          this.ctx.discriminatingSchemas.has(childSchema.$ref)
        ) {
          const discriminatingSchema =
            this.resolve<OpenAPISchemaObject>(childSchema);
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
      // string, boolean, null, number, array
      if (Array.isArray(schema.type)) {
        return factory.createUnionTypeNode(
          schema.type.map((type) => {
            if (type === "null") return cg.keywordType.null;
            if (type === "integer") return cg.keywordType.number;
            if (isKeyOfKeywordType(type)) return cg.keywordType[type];

            return cg.keywordType.any;
          }),
        );
      }
      if (schema.type === "integer") return cg.keywordType.number;
      if (isKeyOfKeywordType(schema.type)) return cg.keywordType[schema.type];
      return cg.keywordType.any;
    }

    return cg.keywordType.any;
  }

  isTrueEnum(schema: OpenAPISchemaObject, name?: string): name is string {
    return Boolean(
      schema.enum &&
        this.ctx.opts.useEnumType &&
        name &&
        schema.type !== "boolean",
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
  getTrueEnum(schema: OpenAPISchemaObject, propName: string) {
    const baseName = schema.title || _.upperFirst(propName);
    // TODO: use _.camelCase in future major version
    // (currently we allow _ and $ for backwards compatibility)
    const proposedName = baseName
      .split(/[^A-Za-z0-9$_]/g)
      .map((n) => _.upperFirst(n))
      .join("");
    const stringEnumValue = this.getEnumValuesString(
      schema.enum ? schema.enum : [],
    );

    const name = this.getEnumUniqueAlias(proposedName, stringEnumValue);

    if (this.ctx.enumRefs[proposedName] && proposedName === name) {
      return this.ctx.enumRefs[proposedName].type;
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
    this.ctx.enumAliases.push(
      factory.createEnumDeclaration([cg.modifier.export], name, members),
    );

    const type = factory.createTypeReferenceNode(name, undefined);

    this.ctx.enumRefs[proposedName] = {
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
    schema: OpenAPISchemaObject | OpenAPIReferenceObject,
    resolveRefs = true,
  ): OnlyModes {
    if (this.ctx.opts.mergeReadWriteOnly) {
      return { readOnly: false, writeOnly: false };
    }

    const check = (
      schema: OpenAPISchemaObject | OpenAPIReferenceObject,
      history: Set<string>,
    ): OnlyModes => {
      if (isReference(schema)) {
        if (!resolveRefs) return { readOnly: false, writeOnly: false };

        // history is used to prevent infinite recursion
        if (history.has(schema.$ref))
          return { readOnly: false, writeOnly: false };

        // check if the result is cached in `this.refsOnlyMode`
        const cached = this.ctx.refsOnlyMode.get(schema.$ref);
        if (cached) return cached;

        history.add(schema.$ref);
        const ret = check(this.resolve(schema), history);
        history.delete(schema.$ref);

        // cache the result
        this.ctx.refsOnlyMode.set(schema.$ref, ret);

        return ret;
      }

      let readOnly = schema.readOnly ?? false;
      let writeOnly = schema.writeOnly ?? false;

      const subSchemas: (OpenAPIReferenceObject | OpenAPISchemaObject)[] = [];
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

  /**
   * Recursively creates a type literal with the given props.
   */
  getTypeFromProperties(
    props: {
      [prop: string]: OpenAPISchemaObject | OpenAPIReferenceObject;
    },
    required?: string[],
    additionalProperties?:
      | boolean
      | OpenAPISchemaObject
      | OpenAPIReferenceObject,
    onlyMode?: OnlyMode,
  ): ts.TypeLiteralNode {
    // Check if any of the props are readOnly or writeOnly schemas
    const propertyNames = Object.keys(props);
    const filteredPropertyNames = propertyNames.filter((name) => {
      const schema = props[name];
      const { readOnly, writeOnly } = this.checkSchemaOnlyMode(schema, false);

      switch (onlyMode) {
        case "readOnly":
          return readOnly || !writeOnly;
        case "writeOnly":
          return writeOnly || !readOnly;
        default:
          return !readOnly && !writeOnly;
      }
    });

    const members: ts.TypeElement[] = filteredPropertyNames.map((name) => {
      const schema = props[name];
      const isRequired = required && required.includes(name);
      let type = this.getTypeFromSchema(schema, name, onlyMode);
      if (!isRequired && this.ctx.opts.unionUndefined) {
        type = factory.createUnionTypeNode([type, cg.keywordType.undefined]);
      }

      const signature = cg.createPropertySignature({
        questionToken: !isRequired,
        name,
        type,
      });

      if ("description" in schema && schema.description) {
        // Escape any JSDoc comment closing tags in description
        const description = schema.description.replace("*/", "*\\/");

        ts.addSyntheticLeadingComment(
          signature,
          ts.SyntaxKind.MultiLineCommentTrivia,
          // Ensures it is formatted like a JSDoc comment: /** description here */
          `* ${description} `,
          true,
        );
      }

      return signature;
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

  getTypeFromResponses(responses: OpenAPIResponsesObject, onlyMode?: OnlyMode) {
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
    resOrRef: OpenAPIResponseObject | OpenAPIReferenceObject,
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
    responses?: OpenAPIResponsesObject,
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
    content: Record<string, OpenAPIMediaTypeObject>,
  ): OpenAPISchemaObject | OpenAPIReferenceObject {
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

  getTypeFromParameter(p: OpenAPIParameterObject) {
    if (p.content) {
      const schema = this.getSchemaFromContent(p.content);
      return this.getTypeFromSchema(schema);
    }
    return this.getTypeFromSchema(isReference(p) ? p : p.schema);
  }

  wrapResult(ex: ts.Expression) {
    return this.ctx.opts?.optimistic ? callOazapftsFunction("ok", [ex]) : ex;
  }

  generateApi() {
    this.reset();

    preprocessComponents(this.ctx);

    // Parse ApiStub.ts so that we don't have to generate everything manually
    const stub = ts.createSourceFile(
      "ApiStub.ts",
      __API_STUB_PLACEHOLDER__, // replaced with ApiStub.ts during build
      ts.ScriptTarget.Latest,
      /*setParentNodes*/ false,
      ts.ScriptKind.TS,
    );

    // ApiStub contains `const servers = {}`, find it ...
    const servers = cg.findFirstVariableDeclaration(stub.statements, "servers");
    // servers.initializer is readonly, this might break in a future TS version, but works fine for now.
    Object.assign(servers, {
      initializer: generateServers(this.ctx.spec.servers || []),
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
      defaultBaseUrl(this.ctx.spec.servers || []),
    );

    // Collect class functions to be added...
    const functions: ts.FunctionDeclaration[] = [];

    // Keep track of names to detect duplicates
    const names: Record<string, number> = {};

    if (this.ctx.spec.paths) {
      Object.keys(this.ctx.spec.paths).forEach((path) => {
        if (!this.ctx.spec.paths) return;

        const item = this.ctx.spec.paths[path];

        if (!item) {
          return;
        }

        Object.keys(this.resolve(item)).forEach((verb) => {
          const method = verb.toUpperCase();
          // skip summary/description/parameters etc...
          if (!verbs.includes(method)) return;

          const op: OpenAPIOperationObject = (item as any)[verb];
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
          const parameters = this.ctx.isConverted
            ? supportDeepObjects(resolvedParameters)
            : resolvedParameters;

          // convert parameter names to argument names ...
          const argNames = new Map<OpenAPIParameterObject, string>();
          _.sortBy(parameters, "name.length").forEach((p) => {
            const identifier = toIdentifier(p.name);
            const existing = [...argNames.values()];
            const suffix = existing.includes(identifier)
              ? _.upperFirst(p.in)
              : "";
            argNames.set(p, identifier + suffix);
          });

          const getArgName = (param: OpenAPIParameterObject) => {
            const name = argNames.get(param);
            if (!name) throw new Error(`Can't find parameter: ${param.name}`);
            return name;
          };

          const methodParams: ts.ParameterDeclaration[] = [];
          let body: OpenAPIRequestBodyObject | undefined = undefined;
          let bodyVar: string | undefined = undefined;
          switch (this.ctx.opts.argumentStyle ?? "positional") {
            case "positional":
              // split into required/optional
              const [required, optional] = _.partition(parameters, "required");

              // build the method signature - first all the required parameters
              const requiredParams = required.map((p) =>
                cg.createParameter(getArgName(this.resolve(p)), {
                  type: this.getTypeFromParameter(p),
                }),
              );
              methodParams.push(...requiredParams);

              // add body if present
              if (requestBody) {
                body = this.resolve(requestBody);
                const schema = this.getSchemaFromContent(body.content);
                const type = this.getTypeFromSchema(
                  schema,
                  undefined,
                  "writeOnly",
                );
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
              break;

            case "object":
              // build the method signature - first all the required/optional parameters
              const paramMembers = parameters.map((p) =>
                cg.createPropertySignature({
                  name: getArgName(this.resolve(p)),
                  questionToken: !p.required,
                  type: this.getTypeFromParameter(p),
                }),
              );

              // add body if present
              if (requestBody) {
                body = this.resolve(requestBody);
                const schema = this.getSchemaFromContent(body.content);
                const type = this.getTypeFromSchema(
                  schema,
                  undefined,
                  "writeOnly",
                );
                bodyVar = toIdentifier(
                  (type as any).name || getReferenceName(schema) || "body",
                );
                paramMembers.push(
                  cg.createPropertySignature({
                    name: bodyVar,
                    questionToken: !body.required,
                    type,
                  }),
                );
              }

              // if there's no params, leave methodParams as is and prevent empty object argument generation
              if (paramMembers.length === 0) {
                break;
              }

              methodParams.push(
                cg.createParameter(
                  cg.createObjectBinding([
                    ...parameters
                      .map((param) => this.resolve(param))
                      .map((param) => ({ name: getArgName(param) })),
                    ...(bodyVar ? [{ name: bodyVar }] : []),
                  ]),
                  {
                    type: factory.createTypeLiteralNode(paramMembers),
                  },
                ),
              );
              break;
          }

          // add oazapfts options
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
                callOazapftsFunction("mergeHeaders", [
                  factory.createPropertyAccessChain(
                    factory.createIdentifier("opts"),
                    factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    "headers",
                  ),
                  factory.createObjectLiteralExpression(
                    [
                      ...header.map((param) =>
                        cg.createPropertyAssignment(
                          param.name,
                          factory.createIdentifier(getArgName(param)),
                        ),
                      ),
                    ],
                    true,
                  ),
                ]),
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
                              this.getTypeFromResponses(
                                responses!,
                                "readOnly",
                              ) || ts.SyntaxKind.AnyKeyword,
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
    }

    Object.assign(stub, {
      statements: cg.appendNodes(
        stub.statements,
        ...[...this.ctx.aliases, ...functions],
        ...this.ctx.enumAliases,
      ),
    });

    return stub;
  }
}
