import { build } from "esbuild";

/** @type {import('esbuild').BuildOptions} */
const commonBuild = {
  entryPoints: [
    "./src/index.ts",
    "./src/query.ts",
    "./src/util.ts",
    "./src/headers.ts",
  ],
  minify: true,
  sourcemap: true,
  outdir: "./dist",
};

/** @type {import('esbuild').BuildOptions} */
const esmBuild = {
  format: "esm",
  target: "es2020",
  outExtension: { ".js": ".mjs" },
};

/** @type {import('esbuild').BuildOptions} */
const cjsBuild = {
  format: "cjs",
  target: "es2016",
  outExtension: { ".js": ".cjs" },
};

build({
  ...esmBuild,
  ...commonBuild,
  bundle: true,
  splitting: true,
});

build({
  ...cjsBuild,
  ...commonBuild,
});
