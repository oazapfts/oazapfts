import ts from "typescript";
import _ from "lodash";
import { OazapftsContext } from "../context";
import * as OpenApi from "../helpers/openApi3-x";
import * as cg from "./tscodegen";
import * as h from "../helpers";
import { getTypeFromParameter } from "./getTypeFromParameter";
import { getSchemaFromContent } from "./getSchemaFromContent";
import { getTypeFromSchema } from "./getTypeForSchema";
import { getResponseType } from "./getResponseType";
import { getTypeFromResponses } from "./getTypeFromResponses";
import * as OpenAPI from "../helpers/openApi3-x";
import type { UNSTABLE_OazapftsPluginHooks } from "../plugin";

export const argumentStyleOptions = ["positional", "object"] as const;
export type ArgumentStyle = (typeof argumentStyleOptions)[number];

export function generateClientMethod(
  method: h.HttpMethod,
  path: string,
  operation: OpenAPI.OperationObject,
  pathItem: OpenAPI.PathItemObject,
  ctx: OazapftsContext,
  hooks: UNSTABLE_OazapftsPluginHooks,
): ts.FunctionDeclaration[] {
  const { operationId, requestBody, responses, summary, description, tags } =
    operation;

  if (h.skip(ctx, tags)) {
    return [];
  }

  const { primaryName, deprecatedLegacyName } = h.getOperationNames(
    method,
    path,
    operationId,
  );

  // merge item and op parameters
  const parameters = h.resolveArray(ctx, pathItem.parameters);
  for (const p of h.resolveArray(ctx, operation.parameters)) {
    const existing = parameters.find((r) => r.name === p.name && r.in === p.in);
    if (!existing) {
      parameters.push(p);
    }
  }

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
      Object.entries(paramsByFormatter).map(([formatter, parameters]) => {
        const args = hooks.querySerializerArgs.call(
          [
            cg.createObjectLiteral(
              parameters.map((p) => [p.name, getArgName(p)]),
            ),
          ],
          {
            method,
            path,
            operation,
            pathItem,
            formatter,
            parameters,
            query,
          },
          ctx,
        );
        return h.callQsFunction(formatter, args);
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
      cg.createPropertyAssignment("body", ts.factory.createIdentifier(bodyVar)),
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

  const methodBody = cg.block(
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
  );

  const result: ts.FunctionDeclaration[] = [
    cg.addComment(
      cg.createFunctionDeclaration(
        primaryName,
        {
          modifiers: [cg.modifier.export],
        },
        methodParams,
        methodBody,
      ),
      summary || description,
    ),
  ];

  // Generate deprecated legacy alias if needed for backward compatibility
  if (deprecatedLegacyName && !ctx.opts.futureStripLegacyMethods) {
    const deprecatedComment = [
      `@deprecated Use {@link ${primaryName}} instead.`,
      summary || description,
    ]
      .filter(Boolean)
      .join("\n");

    result.push(
      cg.addComment(
        cg.createFunctionDeclaration(
          deprecatedLegacyName,
          {
            modifiers: [cg.modifier.export],
          },
          methodParams,
          methodBody,
        ),
        deprecatedComment,
      ),
    );
  }

  return result;
}
