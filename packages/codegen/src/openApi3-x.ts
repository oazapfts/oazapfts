import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

// Use union of OAS 3.0 and 3.1 types throughout
export type OpenAPISchemaObject = {
  const?: unknown;
  "x-enumNames"?: string[];
  "x-enum-varnames"?: string[];
  "x-component-ref-path"?: string;
  prefixItems?: (OpenAPIReferenceObject | OpenAPISchemaObject)[];
} & (OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject);

export type OpenAPIReferenceObject =
  | OpenAPIV3.ReferenceObject
  | OpenAPIV3_1.ReferenceObject;

export type OpenAPIParameterObject =
  | OpenAPIV3.ParameterObject
  | OpenAPIV3_1.ParameterObject;

export type OpenAPIDocument = OpenAPIV3.Document | OpenAPIV3_1.Document;

export type OpenAPIDiscriminatorObject =
  | OpenAPIV3.DiscriminatorObject
  | OpenAPIV3_1.DiscriminatorObject;

export type OpenAPIResponseObject =
  | OpenAPIV3.ResponseObject
  | OpenAPIV3_1.ResponseObject;

export type OpenAPIResponsesObject =
  | OpenAPIV3.ResponsesObject
  | OpenAPIV3_1.ResponsesObject;

export type OpenAPIRequestBodyObject =
  | OpenAPIV3.RequestBodyObject
  | OpenAPIV3_1.RequestBodyObject;

export type OpenAPIMediaTypeObject =
  | OpenAPIV3.MediaTypeObject
  | OpenAPIV3_1.MediaTypeObject;

export type OpenAPIOperationObject =
  | OpenAPIV3.OperationObject
  | OpenAPIV3_1.OperationObject;
