import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../../context";
import * as OpenApi from "../../openApi3-x";
import * as cg from "../../tscodegen";
import * as h from "../helpers";
import { getTypeFromParameter } from "./getTypeFromParameter";
import { getSchemaFromContent } from "./getSchemaFromContent";
import { getTypeFromSchema } from "./getTypeForSchema";
import { getResponseType } from "./getResponseType";
import { getTypeFromResponses } from "./getTypeFromResponses";

const verbs = [
  "GET",
  "PUT",
  "POST",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "PATCH",
  "TRACE",
];

export function generateMethods(ctx: OazapftsContext) {
  // Collect class functions to be added...
  const methods: ts.FunctionDeclaration[] = [];
  // Keep track of names to detect duplicates
  const names: Record<string, number> = {};

  Object.keys(ctx.spec.paths || []).forEach((path) => {
    if (!ctx.spec.paths) return;

    const item = ctx.spec.paths[path];

    if (!item) {
      return;
    }

    Object.keys(h.resolve(item, ctx)).forEach((verb) => {
      const method = verb.toUpperCase();
      // skip summary/description/parameters etc...
      if (!verbs.includes(method)) return;

      const op: OpenApi.OperationObject = (item as any)[verb];
      const {
        operationId,
        requestBody,
        responses,
        summary,
        description,
        tags,
      } = op;

      if (h.skip(ctx, tags)) {
        return;
      }

      let name = h.getOperationName(verb, path, operationId);
      const count = (names[name] = (names[name] || 0) + 1);
      if (count > 1) {
        // The name is already taken, which means that the spec is probably
        // invalid as operationIds must be unique. Since this is quite common
        // nevertheless we append a counter:
        name += count;
      }

      // merge item and op parameters
      const resolvedParameters = h.resolveArray(ctx, item.parameters);
      for (const p of h.resolveArray(ctx, op.parameters)) {
        const existing = resolvedParameters.find(
          (r) => r.name === p.name && r.in === p.in,
        );
        if (!existing) {
          resolvedParameters.push(p);
        }
      }

      // expand older OpenAPI parameters into deepObject style where needed
      const parameters = ctx.isConverted
        ? h.supportDeepObjects(resolvedParameters)
        : resolvedParameters;

      // convert parameter names to argument names ...
      const argNames = new Map<OpenApi.ParameterObject, string>();
      _.sortBy(parameters, "name.length").forEach((p) => {
        const identifier = h.toIdentifier(p.name);
        const existing = [...argNames.values()];
        const suffix = existing.includes(identifier) ? _.upperFirst(p.in) : "";
        argNames.set(p, identifier + suffix);
      });

      const getArgName = (param: OpenApi.ParameterObject) => {
        const name = argNames.get(param);
        if (!name) throw new Error(`Can't find parameter: ${param.name}`);
        return name;
      };

      const methodParams: ts.ParameterDeclaration[] = [];
      let body: OpenApi.RequestBodyObject | undefined = undefined;
      let bodyVar: string | undefined = undefined;
      switch (ctx.opts.argumentStyle ?? "positional") {
        case "positional":
          // split into required/optional
          const [required, optional] = _.partition(parameters, "required");

          // build the method signature - first all the required parameters
          const requiredParams = required.map((p) =>
            cg.createParameter(getArgName(h.resolve(p, ctx)), {
              type: getTypeFromParameter(p, ctx),
            }),
          );
          methodParams.push(...requiredParams);

          // add body if present
          if (requestBody) {
            body = h.resolve(requestBody, ctx);
            const schema = getSchemaFromContent(body.content);
            const type = getTypeFromSchema(ctx, schema, undefined, "writeOnly");
            bodyVar = h.toIdentifier(
              (type as any).name || h.getReferenceName(schema) || "body",
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
                    .map((param) => h.resolve(param, ctx))
                    .map((param) => ({ name: getArgName(param) })),
                ),
                {
                  initializer: ts.factory.createObjectLiteralExpression(),
                  type: ts.factory.createTypeLiteralNode(
                    optional.map((p) =>
                      cg.createPropertySignature({
                        name: getArgName(h.resolve(p, ctx)),
                        questionToken: true,
                        type: getTypeFromParameter(p, ctx),
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
              name: getArgName(h.resolve(p, ctx)),
              questionToken: !p.required,
              type: getTypeFromParameter(p, ctx),
            }),
          );

          // add body if present
          if (requestBody) {
            body = h.resolve(requestBody, ctx);
            const schema = getSchemaFromContent(body.content);
            const type = getTypeFromSchema(ctx, schema, undefined, "writeOnly");
            bodyVar = h.toIdentifier(
              (type as any).name || h.getReferenceName(schema) || "body",
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
                  .map((param) => h.resolve(param, ctx))
                  .map((param) => ({ name: getArgName(param) })),
                ...(bodyVar ? [{ name: bodyVar }] : []),
              ]),
              {
                type: ts.factory.createTypeLiteralNode(paramMembers),
              },
            ),
          );
          break;
      }

      // add oazapfts options
      methodParams.push(
        cg.createParameter("opts", {
          type: ts.factory.createTypeReferenceNode(
            "Oazapfts.RequestOpts",
            undefined,
          ),
          questionToken: true,
        }),
      );

      // Next, build the method body...

      const returnType = getResponseType(ctx, responses);
      const query = parameters.filter((p) => p.in === "query");
      const header = parameters.filter((p) => p.in === "header");

      let qs;
      if (query.length) {
        const paramsByFormatter = _.groupBy(query, h.getFormatter);
        qs = h.callQsFunction(
          "query",
          Object.entries(paramsByFormatter).map(([format, params]) => {
            //const [allowReserved, encodeReserved] = _.partition(params, "allowReserved");
            return h.callQsFunction(format, [
              cg.createObjectLiteral(
                params.map((p) => [p.name, getArgName(p)]),
              ),
            ]);
          }),
        );
      }

      const url = h.createUrlExpression(path, qs);
      const init: ts.ObjectLiteralElementLike[] = [
        ts.factory.createSpreadAssignment(ts.factory.createIdentifier("opts")),
      ];

      if (method !== "GET") {
        init.push(
          ts.factory.createPropertyAssignment(
            "method",
            ts.factory.createStringLiteral(method),
          ),
        );
      }

      if (bodyVar) {
        init.push(
          cg.createPropertyAssignment(
            "body",
            ts.factory.createIdentifier(bodyVar),
          ),
        );
      }

      if (header.length) {
        init.push(
          ts.factory.createPropertyAssignment(
            "headers",
            h.callOazapftsFunction("mergeHeaders", [
              ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier("opts"),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                "headers",
              ),
              ts.factory.createObjectLiteralExpression(
                [
                  ...header.map((param) =>
                    cg.createPropertyAssignment(
                      param.name,
                      ts.factory.createIdentifier(getArgName(param)),
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
        const formatter = h.getBodyFormatter(body); // json, form, multipart
        const initObj = ts.factory.createObjectLiteralExpression(init, true);
        args.push(
          formatter ? h.callOazapftsFunction(formatter, [initObj]) : initObj,
        );
      }

      methods.push(
        cg.addComment(
          cg.createFunctionDeclaration(
            name,
            {
              modifiers: [cg.modifier.export],
            },
            methodParams,
            cg.block(
              ts.factory.createReturnStatement(
                h.wrapResult(
                  h.callOazapftsFunction(
                    {
                      json: "fetchJson",
                      text: "fetchText",
                      blob: "fetchBlob",
                    }[returnType],
                    args,
                    returnType === "json" || returnType === "blob"
                      ? [
                          getTypeFromResponses(responses!, ctx, "readOnly") ||
                            ts.SyntaxKind.AnyKeyword,
                        ]
                      : undefined,
                  ),
                  ctx,
                ),
              ),
            ),
          ),
          summary || description,
        ),
      );
    });
  });

  return methods;
}
