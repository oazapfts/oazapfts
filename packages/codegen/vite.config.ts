import { UserConfig } from "vite";
import pkg from "./package.json";

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  "fs",
];

export default {
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
