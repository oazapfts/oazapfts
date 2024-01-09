#!/usr/bin/env node

import fs from "fs";
import minimist from "minimist";

import { generateSource, Opts, optsArgumentStyles } from "./";

const argv = minimist(process.argv.slice(2), {
  alias: {
    i: "include",
    e: "exclude",
  },
  boolean: ["optimistic", "useEnumType", "mergeReadWriteOnly"],
  string: ["argumentStyle"],
});

async function generate(spec: string, dest: string, opts: Opts) {
  const code = await generateSource(spec, opts);
  if (dest) fs.writeFileSync(dest, code);
  else console.log(code);
}

const {
  include,
  exclude,
  optimistic,
  useEnumType,
  mergeReadWriteOnly,
  argumentStyle,
} = argv;
const [spec, dest] = argv._;
if (!spec) {
  console.error(`
    Usage:
    oazapfts <spec> [filename]

    Options:
    --exclude, -e <tag to exclude>
    --include, -i <tag to include>
    --optimistic
    --useEnumType
    --mergeReadWriteOnly
    --argumentStyle=<${optsArgumentStyles.join(" | ")}> (default: positional)
`);
  process.exit(1);
}

if (
  argumentStyle !== undefined &&
  !optsArgumentStyles.includes(argumentStyle)
) {
  console.error(
    `--argumentStyle should be one of <${optsArgumentStyles.join(
      " | ",
    )}>, but got "${argumentStyle}"`,
  );
  process.exit(1);
}

generate(spec, dest, {
  include,
  exclude,
  optimistic,
  useEnumType,
  mergeReadWriteOnly,
  argumentStyle,
});
