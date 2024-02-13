import { UserConfig } from "vite";

export default {
  build: {
    sourcemap: true,
    emptyOutDir: false,
    outDir: "dist",
    lib: {
      entry: ["src/index.ts", "src/query.ts", "src/util.ts", "src/headers.ts"],
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      output: {
        exports: "auto",
        interop: "esModule",
      },
    },
  },
} satisfies UserConfig;
