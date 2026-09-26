import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Output to build/ so the existing Firebase hosting config keeps working.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "build" },
});
