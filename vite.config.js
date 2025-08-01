import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  publicDir: "public", // includes manifest.json
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"), // 👈 use full path to HTML
        content: resolve(__dirname, "src/content/index.js"),
        background: resolve(__dirname, "src/popup/background.js"), // ✅ ADD THIS
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "content") return "content/index.js";
          if (chunk.name === "background") return "background.js"; // ✅ PLACE IN ROOT
          return "popup/assets/[name].js"; // use popup folder for JS
        },
        assetFileNames: "popup/assets/[name].[ext]",
      },
    },
  },
});
