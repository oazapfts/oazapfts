#!/usr/bin/env node

import fs from 'fs';
import minimist from 'minimist';

import { generateSource, Opts } from './';

const argv = minimist(process.argv.slice(2), {
  alias: {
    i: 'include',
    e: 'exclude',
  },
  boolean: ['optimistic'],
});

async function generate(spec: string, dest: string, opts: Opts) {
  const code = await generateSource(spec, opts);
  if (dest) fs.writeFileSync(dest, code);
  else console.log(code);
}

const { include, exclude, optimistic } = argv;
const [spec, dest] = argv._;
if (!spec) {
  console.error(`
    Usage:
    oazapfts <spec> [filename]

    Options:
    --exclude, -e <tag to exclude>
    --include, -i <tag to include>
    --optimistic
`);
  process.exit(1);
}

generate(spec, dest, {
  include,
  exclude,
  optimistic,
});
