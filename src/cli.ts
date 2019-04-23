#!/usr/bin/env node

import fs from "fs";
import got from "got";
import { generateApi } from ".";
const [, , spec, dest] = process.argv;

async function generate(spec: string, dest: string) {
  let source;
  if (spec.includes("://")) {
    source = (await got(spec)).body;
  } else {
    source = fs.readFileSync(spec, "utf8");
  }
  const code = generateApi(JSON.parse(source));
  if (dest) fs.writeFileSync(dest, code);
  else console.log(code);
}

generate(spec, dest);
