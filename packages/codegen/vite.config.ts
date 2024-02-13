import { UserConfig } from "vite";
import pkg from "./package.json";
import fs from "node:fs";

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  "fs",
];

export default {
  define: {
    __API_STUB_PLACEHOLDER__: JSON.stringify(
      fs.readFileSync("./misc/ApiStub.ts").toString(),
    ),
  },
  build: {
    sourcemap: true,
    emptyOutDir: false,
    outDir: "dist",
    lib: {
      entry: ["src/index.ts", "src/cli.ts"],
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      output: {
        exports: "auto",
        interop: "esModule",
      },
      external(source) {
        return external.some(
          (dep) => source === dep || source.startsWith(`${dep}/`),
        );
      },
    },
  },
} satisfies UserConfig;
