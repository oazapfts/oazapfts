import fs from "fs";
import path from "path";
import ts from "typescript";
import type ApiGenerator from "./generate";
import type { defaultHelpers } from "./generate";
import { OpenAPIV3 } from "openapi-types";

/**
 * Removes custom config local leftovers after the last API generation.
 * Replaces transpiled custom config with the default one.
 */
const cleanupConfig = (configFilename: string): void => {
  console.info("Cleaning up after previous build...");
  const defaultConfigFilename = "oazapfts.config.default.js";
  const defaultConfig = path.resolve(__dirname, defaultConfigFilename);
  const localCustomConfig = path.resolve(__dirname, configFilename);

  fs.copyFileSync(defaultConfig, localCustomConfig);
};

/**
 * Transpiles a TS config to a JS string.
 * @param configPath path to TS config
 * @returns transpiled string of JS code
 */
const transpileCustomConfig = (configPath: string): string => {
  const transpiled = ts.transpileModule(
    fs.readFileSync(configPath, "utf8"),
    {}
  );
  return transpiled.outputText;
};

/**
 * Checks if a config file exists at process root folder.
 * @param configFilename filename to look for.
 */
const checkCustomConfigFileExists = (configFilename: string): boolean => {
  console.info("Looking for config file...");

  const configPath = path.resolve(process.cwd(), configFilename);
  console.info("Checking path:", configPath);

  return fs.existsSync(configPath);
};

/**
 * Saves a custom config locally to use in code generation down the line.
 * @param transpiledString JS string to save as a file
 * @param targetFilename filename to save the config as
 */
const saveTranspiledCustomConfig = (
  transpiledString: string,
  targetFilename: string
): void => {
  const dest = path.resolve(__dirname, targetFilename);
  fs.writeFileSync(dest, transpiledString);
};

/**
 * Looks for, reads, transpiles and saves locally a custom config.
 */
export const processConfigFileIfExists = (): void => {
  const target = "oazapfts.config.js";
  cleanupConfig(target);

  const src = "oazapfts.config.ts";
  const exists = checkCustomConfigFileExists(src);
  if (!exists) {
    console.warn(`No config found. Using defaults.`);
    return;
  }

  console.info(`Found ${src}. Processing...`);
  const transpiled = transpileCustomConfig(src);
  saveTranspiledCustomConfig(transpiled, target);
  console.info("Processed config.");
};

type SchemaParserExtensionHelpers = {
  defaultSchemaTypeParser: ApiGenerator["getTypeFromSchema"];
};

/**
 * Override default way to parse any schema.
 * Receives a schema and returns ts.TypeNode.
 * If a received schema should not be extended (overriden) - return nothing.
 * In such case the parameter will be processed by a default schema parser.
 */
export type SchemaParserExtension = (
  s: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined,
  helpers: SchemaParserExtensionHelpers & typeof defaultHelpers
) => ts.TypeNode | undefined;

type ParameterParserExtensionHelpers = {
  defaultParameterTypeParser: ApiGenerator["getNonExtendedMethodParameter"];
};

/**
 * Override default way to parse an API method parameter from schema.
 * Receives a parameter schema and returns ts.TypeNode.
 * If a received parameter should not be extended (overriden) - return nothing.
 * In such case the parameter will be processed by a default parameter parser.
 */
export type ParameterParserExtension = (
  p: OpenAPIV3.ParameterObject,
  helpers: ParameterParserExtensionHelpers & typeof defaultHelpers
) => ts.TypeNode | undefined;

type QueryStringParserExtensionHelpers = {
  defaultSchemaResolver: ApiGenerator["resolve"];
};

/**
 * Returns the parser function name if the passed in parameter meets custom logic.
 * If a parameter should be processed with a default parser - return nothing.
 * For a parser function name signature see QueryParamParser.
 */
export type QueryStringParserExtension = (
  p: OpenAPIV3.ParameterObject,
  helpers: QueryStringParserExtensionHelpers & typeof defaultHelpers
) => string | undefined;

/**
 * Code generator extensions.
 * For a description of every extension see respective expension type.
 */
export type OazapftsExtensions = {
  queryStringParserExtensions?: QueryStringParserExtension[];
  parameterParserExtensions?: ParameterParserExtension[];
  schemaParserExtensions?: SchemaParserExtension[];
};

/**
 * Takes a parameterName that triggered the parser and the parameter value
 * that it was triggered with.
 * Should always return an Object, that will be converted to a query string
 * at runtime by a default parser.
 */
export type QueryParamParser = (
  parameterName: string,
  parameter?: Record<string, any> | null
) => Record<string, any>;
