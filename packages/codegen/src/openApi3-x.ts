import type { OpenAPIV3_1, OpenAPIV3 } from "openapi-types";

export type XSchemaExtensions = {
  const?: unknown;
  "x-enumNames"?: string[];
  "x-enum-varnames"?: string[];
  "x-component-ref-path"?: string;
  prefixItems?: (ReferenceObject | SchemaObject)[];
};

// Use union of OAS 3.0 and 3.1 types throughout
export type SchemaObject =
  | ((OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject) & XSchemaExtensions)
  | boolean;

export type DiscriminatingSchemaObject = Exclude<SchemaObject, boolean> & {
  discriminator: NonNullable<Exclude<SchemaObject, boolean>["discriminator"]>;
};

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

export type PathsObject = OpenAPIV3.PathsObject | OpenAPIV3_1.PathsObject;

export type PathItemObject =
  | OpenAPIV3.PathItemObject
  | OpenAPIV3_1.PathItemObject;

export type ServerObject = OpenAPIV3.ServerObject | OpenAPIV3_1.ServerObject;
