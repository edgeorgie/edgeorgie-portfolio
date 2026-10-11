import { defineConfig } from "vitest/config";
import path from "node:path";

// No @vitejs/plugin-react: its only job is Fast Refresh/HMR, which tests
// don't use, and it pins a different major of vite than vitest resolves.
// Vite's built-in esbuild transform compiles .tsx using the `jsx:
// "react-jsx"` setting already in tsconfig.json.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
