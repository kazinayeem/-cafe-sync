import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // recharts has a missing react-is peer — silence by providing a stub
      external: [],
      onwarn(warning, warn) {
        if (warning.code === "UNRESOLVED_IMPORT" && warning.id?.includes("react-is")) return;
        warn(warning);
      },
    },
  },
});

