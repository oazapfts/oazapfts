import type {
  InterfaceDeclaration,
  Statement,
  TypeAliasDeclaration,
  TypeReferenceNode,
} from "typescript";
import type { Opts } from ".";
import { OpenAPIDocument } from "./openApi3-x";
import _ from "lodash";

export type OnlyMode = "readOnly" | "writeOnly";
export type OnlyModes = Record<OnlyMode, boolean>;

export type OazapftsContext = {
  readonly inputSpec: OpenAPIDocument;
  readonly opts: Opts;
  readonly isConverted: boolean;

  spec: OpenAPIDocument;

  // see `preprocessComponents` for the definition of a discriminating schema
  discriminatingSchemas: Set<string>;

  aliases: (TypeAliasDeclaration | InterfaceDeclaration)[];

  enumAliases: Statement[];
  enumRefs: Record<string, { values: string; type: TypeReferenceNode }>;

  // Collect the types of all referenced schemas so we can export them later
  // Referenced schemas can be pointing at the following versions:
  // - "base": The regular type/interface e.g. ExampleSchema
  // - "readOnly": The readOnly version e.g. ExampleSchemaRead
  // - "writeOnly": The writeOnly version e.g. ExampleSchemaWrite
  refs: Record<
    string,
    {
      base: TypeReferenceNode;
      readOnly?: TypeReferenceNode;
      writeOnly?: TypeReferenceNode;
    }
  >;

  // Maps a referenced schema to its readOnly/writeOnly status
  // This field should be used exclusively within the `checkSchemaOnlyMode` method
  refsOnlyMode: Map<string, OnlyModes>;

  // Keep track of already used type aliases
  typeAliases: Record<string, number>;
};

export function createContext(
  spec: OazapftsContext["spec"],
  opts: OazapftsContext["opts"],
  isConverted: OazapftsContext["isConverted"] = false,
): OazapftsContext {
  return resetContext({ inputSpec: spec, opts, isConverted });
}

type ReadonlyContextAttrs = "inputSpec" | "opts" | "isConverted";
type ResettableContext = Pick<OazapftsContext, ReadonlyContextAttrs> &
  Partial<Omit<OazapftsContext, ReadonlyContextAttrs>>;

export function resetContext(ctx: ResettableContext): OazapftsContext {
  return {
    ...ctx,
    discriminatingSchemas: new Set(),
    aliases: [],
    enumAliases: [],
    enumRefs: {},
    refs: {},
    refsOnlyMode: new Map(),
    typeAliases: {},
    spec: _.cloneDeep(ctx.inputSpec),
  };
}