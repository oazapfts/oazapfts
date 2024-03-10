import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

// Use union of OAS 3.0 and 3.1 types throughout
export type SchemaObject = {
  const?: unknown;
  "x-enumNames"?: string[];
  "x-enum-varnames"?: string[];
  "x-component-ref-path"?: string;
  prefixItems?: (ReferenceObject | SchemaObject)[];
} & (OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject);

export type ReferenceObject =
  | OpenAPIV3.ReferenceObject
  | OpenAPIV3_1.ReferenceObject;

export type ParameterObject =
  | OpenAPIV3.ParameterObject
  | OpenAPIV3_1.ParameterObject;

export type Document = OpenAPIV3.Document | OpenAPIV3_1.Document;

export type DiscriminatorObject =
  | OpenAPIV3.DiscriminatorObject
  | OpenAPIV3_1.DiscriminatorObject;

export type ResponseObject =
  | OpenAPIV3.ResponseObject
  | OpenAPIV3_1.ResponseObject;

export type ResponsesObject =
  | OpenAPIV3.ResponsesObject
  | OpenAPIV3_1.ResponsesObject;

export type RequestBodyObject =
  | OpenAPIV3.RequestBodyObject
  | OpenAPIV3_1.RequestBodyObject;

export type MediaTypeObject =
  | OpenAPIV3.MediaTypeObject
  | OpenAPIV3_1.MediaTypeObject;

export type OperationObject =
  | OpenAPIV3.OperationObject
  | OpenAPIV3_1.OperationObject;
