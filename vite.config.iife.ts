import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

/**
 * Vite configuration for building the IIFE bundle
 *
 * This creates a standalone widget that can be embedded on any website.
 * The bundle includes:
 * - React and React DOM
 * - Tailwind CSS (with chat widget styles)
 * - Socket.IO client (dynamically loaded)
 * - All chat widget components
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    lib: {
      entry: resolve(__dirname, "src/iife/index.tsx"),
      name: "CofoundyChat",
      fileName: () => "chat-widget.iife.js",
      formats: ["iife"],
    },
    rollupOptions: {
      // Don't externalize anything - bundle everything
      external: [],
      output: {
        // Ensure all CSS is inlined
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "chat-widget.css";
          }
          return assetInfo.name ?? "asset";
        },
        // Add banner with version info
        banner: `/* Cofoundy Chat Widget v${process.env.npm_package_version || "1.0.0"} */`,
      },
    },
    // Minification settings
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: /^!/,
      },
    },
    // Target modern browsers
    target: "es2018",
    // Generate sourcemap for debugging
    sourcemap: true,
  },
});
