import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  let baseConfig = {
    base: "/",
    plugins: [react(), tailwindcss()],
  };

  if (command === "build") {
    baseConfig = {
      ...baseConfig,
      base: "/v-sol-explorer/",
    };
  }
  return baseConfig;
});
