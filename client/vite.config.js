import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The /api and /uploads proxies forward frontend requests to the Express
// server in dev, so we don't hit CORS issues while developing and uploaded
// photos (served by Express at /uploads) display correctly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});
