import { build } from "esbuild";
import { readFileSync } from "node:fs";

const stub = readFileSync("template/ApiStub.ts", "utf-8");
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

/** @type {import('esbuild').BuildOptions} */
const commonBuild = {
  bundle: true,
  sourcemap: true,
  outdir: "./dist",
  platform: "node",
  define: {
    "process.env.__API_STUB_PLACEHOLDER__": JSON.stringify(stub),
  },
  external: Object.keys(pkg.dependencies),
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
  entryPoints: ["./src/cli.ts", "./src/index.ts"],
  splitting: true,
});

build({
  ...cjsBuild,
  ...commonBuild,
  entryPoints: ["./src/index.ts"],
});
