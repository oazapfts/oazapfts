import _ from "lodash";
import ts from "typescript";
import path from "path";
import { OpenAPIV3 } from "openapi-types";
import * as cg from "./tscodegen";
import generateServers, { defaultBaseUrl } from "./generateServers";

const verbs = [
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "PATCH",
  "TRACE"
];

const jsonContentTypes = {
  "*/*": "json",
  "application/json": "json"
};

const contentTypes = {
  ...jsonContentTypes,
  "application/x-www-form-urlencoded": "form",
  "multipart/form-data": "multipart"
};

/**
 * Get the name of a formatter function for a given parameter.
 */
function getFormatter({ style, explode }: OpenAPIV3.ParameterObject): string {
  if (style === "spaceDelimited") return "space";
  if (style === "pipeDelimited") return "pipe";
  if (style === "deepObject") return "deep";
  return explode ? "explode" : "form";
}

function getOperationIdentifier(id?: string): string | undefined {
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
  operationId?: string
): string {
  const id = getOperationIdentifier(operationId);
  if (id) return id;
  path = path.replace(/\{(.+?)\}/, "by $1").replace(/\{(.+?)\}/, "and $1");
  return _.camelCase(`${verb} ${path}`);
}

function isNullable(
  schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): boolean {
  return (
    schema !== undefined && !isReference(schema) && (schema.nullable || false)
  );
}

function isReference(obj: any): obj is OpenAPIV3.ReferenceObject {
  return obj && "$ref" in obj;
}

/**
 * If the given object is a ReferenceObject, return the last part of its path
 */
function getReferenceName(
  obj: OpenAPIV3.ReferenceObject | unknown
): string | undefined {
  if (isReference(obj)) {
    return _.camelCase(obj.$ref.split("/").slice(-1)[0]);
  }
}

/**
 * If the spec contains a URL use that value as default baseUrl in the
 * constructor of the Api class.
 */
function setBaseUrl(apiClass: ts.ClassDeclaration, spec: OpenAPIV3.Document) {
  const baseUrl = _.get(spec, "servers[0].url");
  if (baseUrl) {
    const ctor = cg.findNode<ts.ConstructorDeclaration>(
      apiClass.members,
      ts.SyntaxKind.Constructor
    );
    _.set(
      ctor,
      "parameters[0].name.elements[0].initializer",
      ts.createLiteral(baseUrl)
    );
  }
}

/**
 * Create a template string literal from the given OpenAPI urlTemplate.
 * Curly braces in the path are turned into identifier expressions,
 * which are read from the local scope during runtime.
 */
function createUrlExpression(path: string, qs?: ts.Expression) {
  const spans: Array<{ expression: ts.Expression; literal: string }> = [];
  // Use a replacer function to collect spans as a side effect:
  const head = path.replace(
    /(.*?)\{(.+?)\}(.*?)(?=\{|$)/g,
    (_substr, head, name, literal) => {
      const expression = _.camelCase(name);
      spans.push({ expression: ts.createIdentifier(expression), literal });
      return head;
    }
  );
  if (qs) {
    // add the query string as last span
    spans.push({ expression: qs, literal: "" });
  }
  return cg.createTemplateString(head, spans);
}

/**
 * Create a call expression for one of the QS functions defined in ApiStub.
 */
function callQsFunction(name: string, args: ts.Expression[]) {
  return cg.createCall(
    ts.createPropertyAccess(ts.createIdentifier("QS"), name),
    { args }
  );
}

/**
 * Create a call expression for one of the _unerscore functions defined in ApiStub.
 */
function callUnderscoreFunction(name: string, args: ts.Expression[]) {
  return cg.createCall(
    ts.createPropertyAccess(ts.createIdentifier("_"), name),
    { args }
  );
}

/**
 * Despite its name, OpenApi's `deepObject` serialization does not support
 * deeply nested objects. As a workaround we detect parameters that contain
 * square brackets and merge them into a single object.
 */
function supportDeepObjects(params: OpenAPIV3.ParameterObject[]) {
  const res: OpenAPIV3.ParameterObject[] = [];
  const merged: any = {};
  params.forEach(p => {
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
          properties: {}
        }
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
export default function generateApi(spec: OpenAPIV3.Document) {
  const aliases: ts.TypeAliasDeclaration[] = [];

  function resolve<T>(obj: T | OpenAPIV3.ReferenceObject) {
    if (!isReference(obj)) return obj;
    const ref = obj.$ref;
    if (!ref.startsWith("#/")) {
      throw new Error(`External refs are not supported: ${ref}`);
    }
    const path = ref.slice(2).split("/");
    return _.get(spec, path) as T;
  }

  function resolveArray<T>(array?: Array<T | OpenAPIV3.ReferenceObject>) {
    return array ? array.map(resolve) : [];
  }

  // Collect the types of all referenced schemas so we can export them later
  const refs: { [ref: string]: ts.TypeReferenceNode } = {};

  /**
   * Create a type alias for the schema referenced by the given ReferenceObject
   */
  function getRefAlias(obj: OpenAPIV3.ReferenceObject) {
    const { $ref } = obj;
    let ref = refs[$ref];
    if (!ref) {
      const schema = resolve<OpenAPIV3.SchemaObject>(obj);

      const name = schema.title || $ref.replace(/.+\//, "");
      ref = refs[$ref] = ts.createTypeReferenceNode(name, undefined);

      const type = getTypeFromSchema(schema);
      aliases.push(
        cg.createTypeAliasDeclaration({
          modifiers: [cg.modifier.export],
          name,
          type
        })
      );
    }
    return ref;
  }

  /**
   * Creates a type node from a given schema.
   * Delegates to getBaseTypeFromSchema internally and
   * optionally adds a union with null.
   */
  function getTypeFromSchema(
    schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
  ): ts.TypeNode {
    const type = getBaseTypeFromSchema(schema);
    return isNullable(schema)
      ? ts.createUnionTypeNode([type, cg.keywordType.null])
      : type;
  }

  /**
   * This is the very core of the OpenAPI to TS conversion - it takes a
   * schema and returns the appropriate type.
   */
  function getBaseTypeFromSchema(
    schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
  ): ts.TypeNode {
    if (!schema) return cg.keywordType.any;
    if (isReference(schema)) {
      return getRefAlias(schema);
    }

    if (schema.oneOf) {
      // oneOf -> union
      return ts.createUnionTypeNode(schema.oneOf.map(getTypeFromSchema));
    }
    if (schema.allOf) {
      // allOf -> intersection
      return ts.createIntersectionTypeNode(schema.allOf.map(getTypeFromSchema));
    }
    if ("items" in schema) {
      // items -> array
      return ts.createArrayTypeNode(getTypeFromSchema(schema.items));
    }

    if (schema.properties || schema.additionalProperties) {
      // properties -> literal type
      return getTypeFromProperties(
        schema.properties || {},
        schema.required,
        schema.additionalProperties
      );
    }

    if (schema.enum) {
      // enum -> union of literal types
      return ts.createUnionTypeNode(
        schema.enum.map(s =>
          ts.createLiteralTypeNode(ts.createStringLiteral(s))
        )
      );
    }
    if (schema.format == "binary") {
      return ts.createTypeReferenceNode("Blob", []);
    }
    if (schema.type) {
      // string, boolean, null, number
      if (schema.type in cg.keywordType) return cg.keywordType[schema.type];
      if (schema.type === "integer") return cg.keywordType.number;
    }

    return cg.keywordType.any;
  }

  /**
   * Recursively creates a type literal with the given props.
   */
  function getTypeFromProperties(
    props: {
      [prop: string]: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    },
    required?: string[],
    additionalProperties?:
      | boolean
      | OpenAPIV3.SchemaObject
      | OpenAPIV3.ReferenceObject
  ) {
    const members: ts.TypeElement[] = Object.keys(props).map(name => {
      const schema = props[name];
      const isRequired = required && required.includes(name);
      return cg.createPropertySignature({
        questionToken: !isRequired,
        name,
        type: getTypeFromSchema(schema)
      });
    });
    if (additionalProperties) {
      const type =
        additionalProperties === true
          ? cg.keywordType.any
          : getTypeFromSchema(additionalProperties);

      members.push(cg.createIndexSignature(type));
    }
    return ts.createTypeLiteralNode(members);
  }

  function getTypeFromResponses(res: OpenAPIV3.ResponsesObject): ts.TypeNode {
    const responsesTypes = Object.values(res).map(response => {
      return getTypeFromResponse(response);
    });

    return ts.createUnionTypeNode(responsesTypes);
  }

  function getTypeFromResponse(
    res: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject
  ): ts.TypeNode {
    if (isReference(res)) return getRefAlias(res);
    if (!res.content) return cg.keywordType.void;
    return getTypeFromSchema(getSchemaFromContent(res.content));
  }

  function getSchemaFromContent(content: {
    [media: string]: OpenAPIV3.MediaTypeObject;
  }): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject {
    const contentType = Object.keys(contentTypes).find(t => t in content);
    let schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    if (contentType) {
      schema = _.get(content, [contentType, "schema"]);
    }
    return (
      schema || {
        type: "string"
      }
    );
  }

  function hasJsonContent(
    responses: OpenAPIV3.ResponsesObject | undefined
  ): boolean {
    return (
      responses !== undefined &&
      Object.values(responses).some(response => {
        const resolvedResponse = isReference(response)
          ? resolve<OpenAPIV3.ResponseObject>(response)
          : response;

        return Object.keys(jsonContentTypes).some(
          contentType => !!_.get(resolvedResponse.content, [contentType])
        );
      })
    );
  }

  // Parse ApiStub.ts so that we don't have to generate everything manually
  const stub = cg.parseFile(path.resolve(__dirname, "../src/ApiStub.ts"));

  // ApiStub contains a class declaration, find it ...
  const servers = cg.findFirstVariableDeclaration(stub.statements, "servers");
  servers.initializer = generateServers(spec.servers || []);

  const { initializer } = cg.findFirstVariableDeclaration(
    stub.statements,
    "defaults"
  );
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error("No object literal: defaults");
  }

  cg.changePropertyValue(
    initializer,
    "baseUrl",
    defaultBaseUrl(spec.servers || [])
  );

  // Collect class functions to be added...
  const functions: ts.FunctionDeclaration[] = [];

  // Keep track of names to detect duplicates
  const names: Record<string, number> = {};

  Object.keys(spec.paths).forEach(path => {
    const item: OpenAPIV3.PathItemObject = spec.paths[path];
    Object.keys(resolve(item)).forEach(verb => {
      const method = verb.toUpperCase();
      // skip summary/description/parameters etc...
      if (!verbs.includes(method)) return;

      const op: OpenAPIV3.OperationObject = (item as any)[verb];
      const { operationId, requestBody, responses, summary, description } = op;

      let name = getOperationName(verb, path, operationId);
      const count = (names[name] = (names[name] || 0) + 1);
      if (count > 1) {
        // The name is already taken, which means that the spec is probably
        // invalid as operationIds must be unique. Since this is quite common
        // nevertheless we append a counter:
        name += count;
      }

      // merge item and op parameters
      const parameters = supportDeepObjects([
        ...resolveArray(item.parameters),
        ...resolveArray(op.parameters)
      ]);

      // split into required/optional
      const [required, optional] = _.partition(parameters, "required");

      // convert parameter names to argument names ...
      const argNames: any = {};
      parameters
        .map(p => p.name)
        .sort((a, b) => a.length - b.length)
        .forEach(name => {
          // strip leading namespaces, eg. foo.name -> name
          const stripped = _.camelCase(name.replace(/.+\./, ""));
          // keep the prefix if the stripped-down name is already taken
          argNames[name] = stripped in argNames ? _.camelCase(name) : stripped;
        });

      // build the method signature - first all the required parameters
      const methodParams = required.map(p =>
        cg.createParameter(argNames[resolve(p).name], {
          type: getTypeFromSchema(isReference(p) ? p : p.schema)
        })
      );

      let body: any;
      let bodyVar;

      // add body if present
      if (requestBody) {
        body = resolve(requestBody);
        const schema = getSchemaFromContent(body.content);
        const type = getTypeFromSchema(schema);
        bodyVar = _.camelCase(
          (type as any).name || getReferenceName(schema) || "body"
        );
        methodParams.push(
          cg.createParameter(bodyVar, {
            type
          })
        );
      }

      // add an object with all optional parameters
      if (optional.length) {
        methodParams.push(
          cg.createParameter(
            cg.createObjectBinding(
              optional
                .map(resolve)
                .map(({ name }) => ({ name: argNames[name] }))
            ),
            {
              initializer: ts.createObjectLiteral(),
              type: ts.createTypeLiteralNode(
                optional.map(p =>
                  cg.createPropertySignature({
                    name: argNames[resolve(p).name],
                    questionToken: true,
                    type: getTypeFromSchema(isReference(p) ? p : p.schema)
                  })
                )
              )
            }
          )
        );
      }

      methodParams.push(
        cg.createParameter("opts", {
          type: ts.createTypeReferenceNode("RequestOpts", undefined),
          questionToken: true
        })
      );

      // Next, build the method body...

      const returnsJson = hasJsonContent(responses);
      const query = parameters.filter(p => p.in === "query");
      const header = parameters.filter(p => p.in === "header").map(p => p.name);
      let qs;
      if (query.length) {
        const paramsByFormatter = _.groupBy(query, getFormatter);
        qs = callQsFunction(
          "query",
          Object.entries(paramsByFormatter).map(([format, params]) => {
            //const [allowReserved, encodeReserved] = _.partition(params, "allowReserved");
            return callQsFunction(format, [
              cg.createObjectLiteral(
                params.map(p => [p.name, argNames[p.name]])
              )
            ]);
          })
        );
      }

      const url = createUrlExpression(path, qs);
      const init: ts.ObjectLiteralElementLike[] = [
        ts.createSpreadAssignment(ts.createIdentifier("opts"))
      ];

      if (method !== "GET") {
        init.push(
          ts.createPropertyAssignment("method", ts.createStringLiteral(method))
        );
      }

      if (bodyVar) {
        init.push(
          cg.createPropertyAssignment("body", ts.createIdentifier(bodyVar))
        );
      }

      if (header.length) {
        init.push(
          ts.createPropertyAssignment(
            "headers",
            ts.createObjectLiteral(
              [
                ts.createSpreadAssignment(
                  ts.createLogicalAnd(
                    ts.createIdentifier("opts"),
                    ts.createPropertyAccess(
                      ts.createIdentifier("opts"),
                      "headers"
                    )
                  )
                ),
                ...header.map(name =>
                  cg.createPropertyAssignment(
                    name,
                    ts.createIdentifier(argNames[name])
                  )
                )
              ],
              true
            )
          )
        );
      }

      const args: ts.Expression[] = [url];

      if (responses !== undefined) {
        const responseCodes = Object.keys(responses).map(code =>
          ts.createStringLiteral(code)
        );
        args.push(
          ts.createObjectLiteral([
            ts.createPropertyAssignment(
              "responseCodes",
              ts.createArrayLiteral(responseCodes)
            )
          ])
        );
      }

      if (init.length) {
        const m = Object.entries(contentTypes).find(([type]) => {
          return !!_.get(body, ["content", type]);
        });
        const initObj = ts.createObjectLiteral(init, true);
        args.push(m ? callUnderscoreFunction(m[1], [initObj]) : initObj);
      }

      functions.push(
        cg.addComment(
          cg.createFunctionDeclaration(
            name,
            {
              modifiers: [cg.modifier.export, cg.modifier.async]
            },
            methodParams,
            cg.block(
              ts.createReturn(
                ts.createAsExpression(
                  ts.createAwait(
                    callUnderscoreFunction(
                      returnsJson ? "fetchJson" : "fetch",
                      args
                    )
                  ),
                  getTypeFromResponses(responses!)
                )
              )
            )
          ),
          summary || description
        )
      );
    });
  });

  stub.statements = cg.appendNodes(
    stub.statements,
    ...[...aliases, ...functions]
  );

  return stub;
}
