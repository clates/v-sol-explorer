import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(() => {
  const basePath = process.env.VITE_BASE_URL || "/";  // Default to "/" if env var is not set

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
  };
});
