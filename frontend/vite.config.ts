import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Ensures correct asset resolution
  build: {
    outDir: "dist", // Vercel expects this as output
  },
});
