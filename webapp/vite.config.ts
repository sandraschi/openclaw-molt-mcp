import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["mermaid"],
  },
  server: {    allowedHosts: ['goliath'],proxy: {
      "/api": {
        target: "http://127.0.0.1:5181",
        changeOrigin: true,
      },
    },
  },
});
