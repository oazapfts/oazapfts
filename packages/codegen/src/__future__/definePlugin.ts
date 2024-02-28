import {OpenAPIV3} from "openapi-types";
import {PathOrFileDescriptor} from "node:fs";
import {type SchemaObject} from "../generate";
import ts from "typescript";
import {Opts} from "../index";
import minimist from "minimist";
import {AsyncSeriesWaterfallHook, AsyncSeriesHook} from "tapable";

namespace OazapftsPlugin {

    export class CliContext {
        /**
         * Parsed cli Arguments. Starts off undefined until arguments are parsed.
         */
        public options?: minimist.ParsedArgs;
        /**
         * Definition of cli Arguments
         */
        public args: minimist.Opts = {
            string: [],
            boolean: [],
            alias: {},
            default: {},
            unknown: () => true,
            "--": true,
            stopEarly: false,
        };
        /**
         * Used to display information about the cli.
         * Append your cli argument descriptions here.
         */
        public description: string[] = []
    }

    export class Hooks {
        /**
         * Called before anything is run.
         * Allows you to add argument parsing options to the cli.
         */
        public cliArgs = new AsyncSeriesHook<[CliContext]>(['context'], 'cliArgs');
        /**
         * Optionally validate any CLI arguments your plugin is looking for
         */
        public cliValidateArgs = new AsyncSeriesHook<[CliContext]>(['context'], 'cliValidateArgs');
        /**
         * Modify the context before we fetch an OpenAPIV3.Document
         */
        public oasPrefetch = new AsyncSeriesHook<[CliContext]>(['context'], 'oasPrefetch');
        /**
         * actually fetching the OpenAPIV3.Document
         */
        public oasFetch = new AsyncSeriesWaterfallHook<[
            /** @description the full OAS Document*/
                OpenAPIV3.Document | null,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext
        ]>(['document', 'context'])
        /**
         * Modify the `defaults` value definition in the head of the new TS document
         */
        public tsModifyDefaults = new AsyncSeriesHook<[
            /** @description the AST of the `defaults` definition */
            ts.VariableDeclaration,
            /** @description the full AST tree of the document */
            ts.SourceFile,
            /** @description the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext
        ]>(
            ['defaults', 'fullTree', 'document', 'context'],
            'tsModifyDefaults'
        );
        /**
         * Modify the `servers` value definition in the head of the new TS document
         */
        public tsModifyServers = new AsyncSeriesHook<[
            /** @description the AST of the `servers` definition */
            ts.VariableDeclaration,
            /** @description  the full AST tree of the document */
            ts.SourceFile,
            /** @description  the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext
        ]>(
            ['servers', 'fullTree', 'document', 'context'],
            'tsModifyServers',
        );

        /**
         * Run before an OAS endpoint is converted to an AST node
         */
        public convertEndpointBefore = new AsyncSeriesHook<[
            /** @description The current endpoint Object from the OAS document */
            OpenAPIV3.OperationObject,
            /** @description the full AST tree */
            ts.SourceFile,
            /** @description the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext,
        ]>(
            ['schema', 'fullTree', 'document', 'context'],
            'convertEndpointBefore'
        );

        /**
         * converts an endpoint to an AST node
         */
        public convertEndpoint = new AsyncSeriesWaterfallHook<[
            /** @description the AST node for the function definition */
                ts.FunctionDeclaration | null,
            /** @description the current endpoint Object from the OAS document */
            OpenAPIV3.OperationObject,
            /** @description the full AST tree*/
            ts.SourceFile,
            /** @description the full OAS document*/
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext,
        ]>(
            ['functionTree', 'schema', 'fullTree', 'document', 'context'],
            'convertEndpoint'
        );

        /**
         * Run before an OAS schema is converted to an AST node
         */
        public convertSchemaBefore = new AsyncSeriesHook<[
            /** @description the current OAS Schema about to be converted */
                SchemaObject | OpenAPIV3.ReferenceObject,
            /** @description the full AST tree */
            ts.SourceFile,
            /** @description the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext,
        ]>(
            ['schema', 'fullTree', 'document', 'context'],
            'convertSchemaBefore'
        );

        /**
         * converts an OAS schema to an AST node
         */
        public convertSchema = new AsyncSeriesWaterfallHook<[
            /** @description the AST Type Definition */
            ts.TypeNode,
            /** the current OAS Schema that was converted */
                SchemaObject | OpenAPIV3.ReferenceObject,
            /** @description the full AST tree */
            ts.SourceFile,
            /** @description the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext,
        ]>(
            ['typeTree', 'schema', 'fullTree', 'document', 'context'],
            'convertSchema'
        );

        /**
         * Runs after the full AST tree has been created, but before the ts file contents have been generated
         */
        public astGenerated = new AsyncSeriesHook<[
            /** @description the full AST tree */
            ts.SourceFile,
            /** @description the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext,
        ]>(
            ['fullTree', 'document', 'context'],
            'astGenerated'
        );

        /**
         * Runs after the TS file contents have been generated, but before writing to file.
         */
        public writeFileBefore = new AsyncSeriesHook<[
            /** @description path to the file to write to */
            PathOrFileDescriptor,
            /** @description The TS file contents as a string. */
            string,
            /** @description the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext,
        ]>(
            ['fileName', 'fileContents', 'document', 'context'],
            'writeFileBefore'
        );

        /**
         * Runs after the TS file has been written to. Allows for... cleanup?
         * @param fileName - path of the file that was written to
         * @param fileContents - The TS file contents as a string.
         * @param document - the full OAS document.
         */
        public writeFile = new AsyncSeriesHook<[
            /** @description path to the file to write to */
            PathOrFileDescriptor,
            /** @description The TS file contents as a string. */
            string,
            /** @description the full OAS document */
            OpenAPIV3.Document,
            /** @description The current cli context options */
            OazapftsPlugin.CliContext,
        ]>(
            ['fileName', 'fileContents', 'document', 'context'],
            'writeFileBefore'
        );
    }

    export type Callback = (hooks: OazapftsPlugin.Hooks) => void;

}




export const __globalHooks = new OazapftsPlugin.Hooks();

export function defineOazapftsPlugin(
    plugin: OazapftsPlugin.Callback,
): void {
    // Do some checks to ensure that we have a valid plugin (if there are required params)
    if (typeof plugin !== "function" || plugin.length < 1) {
        throw new Error("Plugin must be a function and accept 1 argument");
    }
    plugin(__globalHooks);
}
