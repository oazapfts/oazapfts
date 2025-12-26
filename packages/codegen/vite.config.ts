import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  "fs",
  "path",
];

export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: true,
    emptyOutDir: false,
    outDir: "dist",
    target: mode === "esm" ? "esnext" : "es2015",
    lib: {
      entry: ["src/index.ts", "src/cli.ts"],
      formats: [mode === "esm" ? "es" : "cjs"],
    },
    rollupOptions: {
      external(source) {
        return external.some(
          (dep) => source === dep || source.startsWith(`${dep}/`),
        );
      },
    },
  },
  plugins: mode === "esm" ? [dts({ rollupTypes: true })] : [],
}));
