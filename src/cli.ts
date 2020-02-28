#!/usr/bin/env node

import fs from "fs";
import { generateSource } from "./";

async function generate(spec: string, dest: string) {
  const code = await generateSource(spec);
  if (dest) fs.writeFileSync(dest, code);
  else console.log(code);
}

const [, , spec, dest] = process.argv;

if (!spec) {
  console.error("Usage: oazapfts <spec> [filename]");
  process.exit(1);
}

generate(spec, dest);
