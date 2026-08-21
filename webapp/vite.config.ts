import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["mermaid"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["goliath"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:10745",
        changeOrigin: true,
      },
    },
  },
});
