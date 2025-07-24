import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// ❌ Commented out this line to prevent Railway build error
// import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [
    react(),

    // ✅ Only use express plugin in development
    ...(mode === "development" ? [expressPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during dev
    configureServer(server) {
      // ✅ Require server only in dev mode
      const { createServer } = require("./server");
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
