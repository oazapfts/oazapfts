import * as _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import ts, { factory, UnionTypeNode } from "typescript";
import {
  ParameterParserExtension,
  QueryStringParserExtension,
  SchemaParserExtension,
  OazapftsExtensions,
} from "@tzkt/oazapfts/lib/codegen/extensions";

const tzKtExtensionKey = "x-tzkt-extension";

type TzKtExtended<T> = T & {
  [tzKtExtensionKey]: string;
};

const hasOwnProp = <O extends {}, K extends PropertyKey>(
  p: O,
  k: K
): p is O & Record<K, unknown> => {
  return Object.prototype.hasOwnProperty.call(p, k);
};

const isTzKtExtended = <P extends Object>(p: P): p is P & TzKtExtended<P> => {
  if (!hasOwnProp(p, tzKtExtensionKey)) return false;

  return typeof p[tzKtExtensionKey] === "string";
};

const anyofParameterExtension: ParameterParserExtension = (p, helpers) => {
  if (!isTzKtExtended(p)) return;

  const extension = p[tzKtExtensionKey];
  if (extension !== "anyof-parameter") return;

  if (!hasOwnProp(p, "x-tzkt-anyof-parameter")) return;

  const rawAnyof = p["x-tzkt-anyof-parameter"];
  if (typeof rawAnyof !== "string") return;

  const types = rawAnyof.split(",");

  const valNode = helpers.createPropertySignature({
    name: "value",
    questionToken: false,
    type: helpers.defaultParameterTypeParser(p),
  });

  const pathNode = helpers.createPropertySignature({
    name: "fields",
    questionToken: false,
    type: factory.createArrayTypeNode(
      factory.createUnionTypeNode(
        types.map((t) =>
          factory.createLiteralTypeNode(factory.createStringLiteral(t))
        )
      )
    ),
  });

  console.log(pathNode, "pathNode");

  return factory.createTypeLiteralNode([valNode, pathNode]);
};

const jsonParameterExtension: SchemaParserExtension = (s, helpers) => {
  if (!s || helpers.isReference(s) || !isTzKtExtended(s)) return;

  const extension = s["x-tzkt-extension"];
  if (extension !== "json-parameter") return;

  /**
   * This is a bodge to filter out method parameters that have 'json-parameter'
   * in 'x-tzkt-extension' field. Such method parameters should not be
   * extended, but rather their properties should be (and are) processed by
   * this extension.
   * TODO!: remove 'json-parameter' from top-level parameter description
   */
  if (hasOwnProp(s, "properties")) return;

  const valNode = helpers.createPropertySignature({
    name: "jsonValue",
    questionToken: false,
    type: helpers.defaultSchemaTypeParser(s),
  });

  const pathNode = helpers.createPropertySignature({
    name: "jsonPath",
    questionToken: true,
    type: helpers.keywordType.string,
  });

  return factory.createTypeLiteralNode([valNode, pathNode]);
};

const queryParameterExtension: SchemaParserExtension = (s, helpers) => {
  if (!s || helpers.isReference(s) || !isTzKtExtended(s)) return;

  const extension = s["x-tzkt-extension"];
  if (extension !== "query-parameter") return;

  const props = s.properties;
  if (!props) {
    console.error("Unexpected schema structure", s);
    throw new Error(`Expected properties list in query-parameter schema.`);
  }

  type SpecifiedQueryParameter = TzKtExtended<OpenAPIV3.SchemaObject> & {
    "x-tzkt-query-parameter": string;
  };

  const isSpecified = (
    s: TzKtExtended<OpenAPIV3.SchemaObject>
  ): s is SpecifiedQueryParameter => {
    return typeof (s as any)["x-tzkt-query-parameter"] === "string";
  };

  let specifiedType: UnionTypeNode | undefined = undefined;

  if (isSpecified(s)) {
    const types = s["x-tzkt-query-parameter"].split(",");
    specifiedType = factory.createUnionTypeNode(
      types.map((t) =>
        factory.createLiteralTypeNode(factory.createStringLiteral(t))
      )
    );
  }

  const getPropType = (
    p: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
    specifiedType?: UnionTypeNode
  ) => {
    if (helpers.isReference(p)) {
      const m = "Unexpected reference in schema property";
      console.error(m, p);
      throw new Error(m);
    }

    if ("items" in p) {
      if (specifiedType) return factory.createArrayTypeNode(specifiedType);

      const parsedType = helpers.defaultSchemaTypeParser(p.items);
      return factory.createArrayTypeNode(parsedType);
    }

    return specifiedType ?? helpers.defaultSchemaTypeParser(p);
  };

  const { required } = s;
  const members: ts.TypeElement[] = Object.entries(props).map(
    ([name, prop]) => {
      const isRequired = required?.includes(name);
      return helpers.createPropertySignature({
        questionToken: !isRequired,
        name,
        type: getPropType(prop, specifiedType),
      });
    }
  );

  return factory.createTypeLiteralNode(members);
};

const tzKtQueryStringExtension: QueryStringParserExtension = (p) => {
  if (isTzKtExtended(p)) return _.camelCase(p[tzKtExtensionKey]);
};

const tzKtQueryStringQueryParameterExtension: QueryStringParserExtension = (
  p,
  helpers
) => {
  const schema = p.schema;
  if (helpers.isReference(schema)) return;

  const oneOfs = schema?.oneOf;
  if (!oneOfs) return;

  if (
    oneOfs.some((oneOf) => {
      if (!helpers.isReference(oneOf)) return false;

      const schema = helpers.defaultSchemaResolver(oneOf);
      if (!isTzKtExtended(schema)) return false;

      if (schema[tzKtExtensionKey] !== "query-parameter") return false;

      return true;
    })
  )
    return "queryParameter";
};

const extensions: OazapftsExtensions = {
  schemaParserExtensions: [jsonParameterExtension, queryParameterExtension],
  parameterParserExtensions: [anyofParameterExtension],
  queryStringParserExtensions: [
    tzKtQueryStringExtension,
    tzKtQueryStringQueryParameterExtension,
  ],
};

export default extensions;
