import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import  { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig({
  plugins: [react(),
    viteStaticCopy({
       targets: [{ src: "node_modules/pyodide/*", dest: "pyodide", rename: { stripBase: true} }],
    })
  ],

  optimizeDeps: {
    exclude: ["pyodide"],
  },

  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts"
  }
});
