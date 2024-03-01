import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: true,
    emptyOutDir: false,
    outDir: "dist",
    target: mode === "esm" ? "esnext" : "es2015",
    lib: {
      entry: ["src/index.ts", "src/query.ts", "src/util.ts", "src/headers.ts"],
      formats: [mode === "esm" ? "es" : "cjs"],
    },
    rollupOptions: {
      output: {
        exports: "auto",
        interop: "esModule",
      },
    },
  },
  plugins: mode === "esm" ? [dts({ rollupTypes: true })] : [],
}));
