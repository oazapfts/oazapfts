import fs from "fs";
import path from "path";
import ts from "typescript";

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
