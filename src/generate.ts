import _ from "lodash";
import ts from "typescript";
import path from "path";
import * as oapi from "@loopback/openapi-v3-types";
import * as cg from "./tscodegen";

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

const contentTypes = {
  "*/*": "_json",
  "application/json": "_json",
  "application/x-www-form-urlencoded": "_form",
  "multipart/form-data": "_multipart"
};

/**
 * Get the name of a formatter function for a given parameter.
 */
function getFormatter({ style, explode }: oapi.ParameterObject) {
  if (style === "spaceDelimited") return "space";
  if (style === "pipeDelimited") return "pipe";
  if (style === "deepObject") return "deep";
  return explode ? "explode" : "form";
}

/**
 * Create a method name for a given operation, either from its operationId or
 * the HTTP verb and path.
 */
export function getOperationName(verb: string, path: string, id?: string) {
  path = path.replace(/\{(.+?)\}/, "by $1").replace(/\{(.+?)\}/, "and $1");
  return _.camelCase(id || `${verb} ${path}`);
}

function isNullable(schema: any) {
  return !!(schema && schema.nullable);
}

function isReference(obj: any): obj is oapi.ReferenceObject {
  return obj && "$ref" in obj;
}

/**
 * If the given object is a ReferenceObject, return the last part of its path
 */
function getReferenceName(obj: any) {
  if (isReference(obj)) {
    return _.camelCase(obj.$ref.split("/").slice(-1)[0]);
  }
}

function hasJsonContent(obj: any) {
  return (
    !!_.get(obj, ["content", "application/json"]) ||
    !!_.get(obj, ["content", "*/*"])
  );
}

/**
 * If the spec contains a URL use that value as default baseUrl in the
 * constructor of the Api class.
 */
function setBaseUrl(apiClass: ts.ClassDeclaration, spec: oapi.OpenApiSpec) {
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
    (_, head, expression, literal) => {
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
 * Despite its name, OpenApi's `deepObject` serialization does not support
 * deeply nested objects. As a workaround we detect parameters that contain
 * sqaure backets and merge them into a single object.
 */
function supportDeepObjects(params: oapi.ParameterObject[]) {
  const res: oapi.ParameterObject[] = [];
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
export default function generateApi(spec: oapi.OpenApiSpec) {
  const aliases: ts.TypeAliasDeclaration[] = [];

  function resolve<T>(obj: T | oapi.ReferenceObject) {
    if (!isReference(obj)) return obj;
    const ref = obj.$ref;
    if (!ref.startsWith("#/")) {
      throw new Error(`External refs are not supported: ${ref}`);
    }
    const path = ref.slice(2).split("/");
    return _.get(spec, path) as T;
  }

  function resolveArray<T>(array?: Array<T | oapi.ReferenceObject>) {
    return array ? array.map(resolve) : [];
  }

  // Collect the types of all referenced schemas so we can export them later
  const refs: { [ref: string]: ts.TypeReferenceNode } = {};

  /**
   * Create a type alias for the schema referenced by the given ReferenceObject
   */
  function getRefAlias(obj: oapi.ReferenceObject) {
    const { $ref } = obj;
    let ref = refs[$ref];
    if (!ref) {
      const schema = resolve<oapi.SchemaObject>(obj);
      const type = getTypeFromSchema(schema);
      const name = schema.title || $ref.replace(/.+\//, "");
      aliases.push(
        cg.createTypeAliasDeclaration({
          modifiers: [cg.modifier.export],
          name,
          type
        })
      );
      ref = refs[$ref] = ts.createTypeReferenceNode(name, undefined);
    }
    return ref;
  }

  /**
   * Creates a type node from a given schema.
   * Delegates to getBaseTypeFromSchema internally and
   * optionally adds an intersection with null.
   */
  function getTypeFromSchema(
    schema?: oapi.SchemaObject | oapi.ReferenceObject
  ): ts.TypeNode {
    const type = getBaseTypeFromSchema(schema);
    return isNullable(schema)
      ? ts.createIntersectionTypeNode([type, cg.keywordType.null])
      : type;
  }

  /**
   * This is the very core of the OpenAPI to TS conversion - it takes a
   * schema and returns the appropriate type.
   */
  function getBaseTypeFromSchema(
    schema?: oapi.SchemaObject | oapi.ReferenceObject
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
    if (schema.items) {
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
      [prop: string]: oapi.SchemaObject | oapi.ReferenceObject;
    },
    required?: string[],
    additionalProperties?: boolean | oapi.SchemaObject | oapi.ReferenceObject
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

  function getOkResponse(res: oapi.ResponsesObject) {
    const codes = Object.keys(res);
    const okCodes = codes.filter(
      code => codes.length === 1 || parseInt(code, 10) < 400
    );

    // as a side effect also export types for other response codes
    codes.forEach(code => getTypeFromResponse(res[code]));
    return res[okCodes[0]];
  }

  function getTypeFromResponses(res: oapi.ResponsesObject) {
    return getTypeFromResponse(getOkResponse(res));
  }

  function getTypeFromResponse(
    res: oapi.ResponseObject | oapi.ReferenceObject
  ) {
    if (isReference(res)) return getRefAlias(res);
    if (!res || !res.content) return cg.keywordType.void;
    return getTypeFromSchema(getSchemaFromContent(res.content));
  }

  function getSchemaFromContent(content: oapi.ContentObject) {
    const contentType = Object.keys(contentTypes).find(t => t in content);
    let schema;
    if (contentType) {
      schema = _.get(content, [contentType, "schema"]);
    }
    return (
      schema || {
        type: "string"
      }
    );
  }

  // Parse ApiStub.ts so that we don't have to generate everything manually
  const stub = cg.parseFile(path.resolve(__dirname, "../src/ApiStub.ts"));

  // ApiStub contains a class declaration, find it ...
  const apiClass = cg.findNode<ts.ClassDeclaration>(
    stub.statements,
    ts.SyntaxKind.ClassDeclaration
  );

  // Modify its constructor to use be baseUrl from the spec
  setBaseUrl(apiClass, spec);

  // Collect class members to be added...
  const members: ts.ClassElement[] = [];

  Object.keys(spec.paths).forEach(path => {
    const item: oapi.PathItemObject = spec.paths[path];
    Object.keys(resolve(item)).forEach(verb => {
      const method = verb.toUpperCase();
      // skip summary/description/parameters etc...
      if (!verbs.includes(method)) return;

      const op: oapi.OperationObject = item[verb];
      const { operationId, requestBody, responses, summary, description } = op;

      const name = getOperationName(verb, path, operationId);

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

      // and finally an object with all optional parameters
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

      // Next, build the method body...

      const returnsJson = hasJsonContent(getOkResponse(responses));
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
      const init = [];

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
            cg.createObjectLiteral(header.map(name => [name, argNames[name]]))
          )
        );
      }

      const args: ts.Expression[] = [url];

      if (init.length) {
        const m = Object.entries(contentTypes).find(([type]) => {
          return !!_.get(body, ["content", type]);
        });
        const initObj = ts.createObjectLiteral(init, true);
        args.push(m ? cg.createMethodCall(m[1], { args: [initObj] }) : initObj);
      }

      members.push(
        cg.addComment(
          cg.createMethod(
            name,
            {
              modifiers: [cg.modifier.async]
            },
            methodParams,
            cg.block(
              ts.createReturn(
                ts.createAsExpression(
                  ts.createAwait(
                    cg.createMethodCall(returnsJson ? "_fetchJson" : "_fetch", {
                      args
                    })
                  ),
                  getTypeFromResponses(responses)
                )
              )
            )
          ),
          summary || description
        )
      );
    });
  });

  stub.statements = cg.appendNodes(stub.statements, ...aliases);
  apiClass.members = cg.appendNodes(apiClass.members, ...members);

  return stub;
}
