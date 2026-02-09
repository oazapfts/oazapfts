#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import minimist, { type ParsedArgs } from "minimist";
import { join } from "path";

import { generateSource } from "./";
import { argumentStyleOptions } from "./generate/generateClientMethod";
import { enumStyleOptions } from "./helpers/getEnumStyle";

async function run(argv: ParsedArgs) {
  const {
    include,
    exclude,
    optimistic,
    useEnumType,
    enumStyle,
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

  if (enumStyle !== undefined && !enumStyleOptions.includes(enumStyle)) {
    console.error(
      `--enumStyle should be one of <${enumStyleOptions.join(
        " | ",
      )}>, but got "${enumStyle}"`,
    );
    process.exit(1);
  }

  const code = await generateSource(spec, {
    include,
    exclude,
    optimistic,
    useEnumType,
    enumStyle,
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
    --useEnumType (deprecated, use --enumStyle=enum)
    --enumStyle=<${enumStyleOptions.join(" | ")}> (default: union)
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
    string: ["argumentStyle", "enumStyle"],
  }),
).catch((error) => {
  console.error(error);
  process.exit(1);
});
