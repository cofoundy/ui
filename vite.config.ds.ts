import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

/**
 * ds-bundle: @cofoundy/ui listo para el navegador, sin npm (`npm run build:ds`).
 *
 * Sale a `ds-bundle/` (ignorado por git) y el deploy lo publica en
 * https://ui.cofoundy.dev/ds-bundle/. Contrato con las páginas que lo consumen:
 *
 *   <link rel="stylesheet" href="<base>/styles.css">
 *   <script src="<base>/_vendor/react.js"></script>      → window.React
 *   <script src="<base>/_vendor/react-dom.js"></script>  → window.ReactDOM
 *   <script src="<base>/_ds_bundle.js"></script>         → window.CofoundyUI (todo src/index.ts)
 *
 * IIFE no admite varias entradas por build, así que son tres pasadas con `--mode`:
 *   (default)  → _ds_bundle.js + styles.css, React externo (los globals de arriba)
 *   react      → _vendor/react.js     (React 19 no trae UMD: lo empaquetamos nosotros)
 *   react-dom  → _vendor/react-dom.js (react-dom + react-dom/client, React externo)
 * El orden importa: la pasada default vacía `ds-bundle/`, las de vendor no.
 */

const OUT = resolve(__dirname, "ds-bundle");

// Paquetes que viven en los globals de _vendor/ y NO se empaquetan dentro de _ds_bundle.js.
const REACT_GLOBALS: Record<string, string> = {
  react: "React",
  "react/jsx-runtime": "ReactJSXRuntime",
  "react/jsx-dev-runtime": "ReactJSXRuntime",
  "react-dom": "ReactDOM",
  "react-dom/client": "ReactDOM",
};

const shared: UserConfig = {
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
};

function vendor(entry: string, file: string, external: Record<string, string>): UserConfig {
  return {
    ...shared,
    build: {
      outDir: resolve(OUT, "_vendor"),
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, entry),
        name: "__cofoundyVendor",
        fileName: () => file,
        formats: ["iife"],
      },
      rollupOptions: {
        external: Object.keys(external),
        output: { globals: external },
      },
      minify: "terser",
      target: "es2018",
      sourcemap: false,
    },
  };
}

export default defineConfig(({ mode }) => {
  if (mode === "react") {
    return vendor("src/ds-bundle/vendor-react.ts", "react.js", {});
  }
  if (mode === "react-dom") {
    return vendor("src/ds-bundle/vendor-react-dom.ts", "react-dom.js", { react: "React" });
  }

  return {
    ...shared,
    plugins: [react(), tailwindcss()],
    build: {
      outDir: OUT,
      emptyOutDir: true,
      cssCodeSplit: false,
      lib: {
        entry: resolve(__dirname, "src/ds-bundle/index.ts"),
        name: "CofoundyUI",
        fileName: () => "_ds_bundle.js",
        formats: ["iife"],
      },
      rollupOptions: {
        external: Object.keys(REACT_GLOBALS),
        output: {
          globals: REACT_GLOBALS,
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] ?? assetInfo.name ?? "";
            return name.endsWith(".css") ? "styles.css" : name || "asset";
          },
          banner: `/* @cofoundy/ui ds-bundle v${process.env.npm_package_version || "0.0.0"} */`,
        },
      },
      minify: "terser",
      target: "es2018",
      sourcemap: true,
    },
  };
});
