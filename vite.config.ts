import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5000,
  },
  resolve: {
    alias: {
      styles: path.resolve(__dirname, "./src/styles"),
      constants: path.resolve(__dirname, "./src/constants"),
      components: path.resolve(__dirname, "src/components"),
      models: path.resolve(__dirname, "src/models"),
      pages: path.resolve(__dirname, "src/pages"),
      routes: path.resolve(__dirname, "src/routes"),
      utils: path.resolve(__dirname, "src/utils"),
      hooks: path.resolve(__dirname, "src/hooks"),
    },
  },
});
