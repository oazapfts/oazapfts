import ts, {
  InterfaceDeclaration,
  Statement,
  TypeAliasDeclaration,
  TypeReferenceNode,
} from "typescript";
import type { Opts } from "./";
import type { Document, ServerObject } from "./openApi3-x";
import { defaultBaseUrl } from "./generateServers";
import _ from "lodash";
import { CustomHeaders } from "@oazapfts/runtime";

// ─── Data types for template parts ──────────────────────────────────────────

export type ImportSpecifier = {
  name: string;
  as?: string;
};
export type DefaultImport = [string, { from: string }];
export type NamespaceImport = [{ namespace: string }, { from: string }];
export type ImportsWithoutDefault = [
  (ImportSpecifier | string)[],
  { from: string },
];
export type ImportWithDefault = [
  string,
  (ImportSpecifier | string)[],
  { from: string },
];

export type Import =
  | string
  | ImportsWithoutDefault
  | DefaultImport
  | ImportWithDefault
  | NamespaceImport;

export type OnlyMode = "readOnly" | "writeOnly";
export type OnlyModes = Record<OnlyMode, boolean>;

export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: ReadonlyDeep<T[P]>;
};

export type Defaults = {
  baseUrl?: string;
  headers?: CustomHeaders;
  FormData?: ts.ClassExpression | ts.Identifier;
  fetch?: ts.FunctionExpression | ts.ArrowFunction | ts.Identifier;
};

export type OazapftsContext = {
  readonly inputSpec: ReadonlyDeep<Document>;
  readonly opts: ReadonlyDeep<Opts>;
  readonly spec: Document;

  /** Banner comment at the top of the file (the text content, not including comment markers) */
  banner: string;
  /** Import declarations (AST nodes) */
  imports: Import[];
  /** Runtime defaults (baseUrl, etc.) - will be generated as `export const defaults = { ... }` */
  defaults: Defaults;
  /** Server definitions - will be generated as `export const servers = { ... }` */
  servers: ServerObject[];
  /** Initialization statements (e.g., `const oazapfts = Oazapfts.runtime(defaults)`) */
  init: Statement[];

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
  spec: Document,
  opts: OazapftsContext["opts"],
): OazapftsContext {
  const ourSpec = _.cloneDeep(spec);

  return {
    inputSpec: spec,
    opts,
    spec: ourSpec,

    // Template parts
    banner: `DO NOT MODIFY - This file has been generated using oazapfts.
See https://www.npmjs.com/package/oazapfts`,
    imports: [
      [{ namespace: "Oazapfts" }, { from: "@oazapfts/runtime" }],
      [{ namespace: "QS" }, { from: "@oazapfts/runtime/query" }],
    ],
    defaults: { baseUrl: defaultBaseUrl(ourSpec.servers), headers: {} },
    servers: ourSpec.servers || [],
    init: createInit(),

    // Internal state
    discriminatingSchemas: new Set(),
    aliases: [],
    enumAliases: [],
    enumRefs: {},
    refs: {},
    refsOnlyMode: new Map(),
    typeAliases: {},
  };
}

// ─── Template part factories ─────────────────────────────────────────────────

/** Creates: const oazapfts = Oazapfts.runtime(defaults); */
function createInit(): Statement[] {
  return [
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            "oazapfts",
            undefined,
            undefined,
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("Oazapfts"),
                "runtime",
              ),
              undefined,
              [ts.factory.createIdentifier("defaults")],
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    ),
  ];
}
