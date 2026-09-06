import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

/**
 * Library build — compiles the full public surface of src/index.ts into dist/.
 *
 * Consumed by the design-sync converter (bundled into _ds_bundle.js) and by any
 * non-bundler consumer. React is externalized; everything else is bundled so the
 * output stands alone.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CofoundyUI",
      fileName: () => "index.mjs",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name === "style.css" ? "index.css" : (assetInfo.name ?? "asset"),
      },
    },
    minify: false,
    target: "es2020",
    sourcemap: false,
  },
});
