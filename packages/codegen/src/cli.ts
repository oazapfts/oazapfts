#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import minimist, { type ParsedArgs } from "minimist";
import { join } from "path";

import { generateSource } from "./";
import { argumentStyleOptions } from "./generate/generateClientMethod";

async function run(argv: ParsedArgs) {
  const {
    include,
    exclude,
    optimistic,
    useEnumType,
    mergeReadWriteOnly,
    useUnknown,
    argumentStyle,
    allSchemas,
    futureStripLegacyMethods,
    help,
    version,
  } = argv;
  const [spec, dest] = argv._;

  if (help) {
    printUsage();
    process.exit(0);
  }

  if (version) {
    const pkg = JSON.parse(
      await readFile(join(__dirname, "..", "package.json"), "utf8"),
    );
    console.log(pkg.version);
    process.exit(0);
  }

  if (!spec) {
    printUsage();
    process.exit(1);
  }

  if (
    argumentStyle !== undefined &&
    !argumentStyleOptions.includes(argumentStyle)
  ) {
    console.error(
      `--argumentStyle should be one of <${argumentStyleOptions.join(
        " | ",
      )}>, but got "${argumentStyle}"`,
    );
    process.exit(1);
  }

  const code = await generateSource(spec, {
    include,
    exclude,
    optimistic,
    useEnumType,
    useUnknown,
    mergeReadWriteOnly,
    argumentStyle,
    allSchemas,
    futureStripLegacyMethods,
  });

  if (dest) await writeFile(dest, code);
  else console.log(code);
}

function printUsage() {
  console.error(`
    Usage:
    oazapfts <spec> [filename]

    Options:
    --exclude, -e <tag to exclude>
    --include, -i <tag to include>
    --help,    -h
    --version, -v
    --optimistic
    --useEnumType
    --useUnknown
    --mergeReadWriteOnly
    --argumentStyle=<${argumentStyleOptions.join(" | ")}> (default: positional)
    --allSchemas
    --futureStripLegacyMethods
`);
}

run(
  minimist(process.argv.slice(2), {
    alias: {
      h: "help",
      v: "version",
      i: "include",
      e: "exclude",
    },
    boolean: [
      "help",
      "version",
      "optimistic",
      "useEnumType",
      "mergeReadWriteOnly",
      "useUnknown",
      "allSchemas",
      "futureStripLegacyMethods",
    ],
    string: ["argumentStyle"],
  }),
).catch((error) => {
  console.error(error);
  process.exit(1);
});
