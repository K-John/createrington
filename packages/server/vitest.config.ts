import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    env: {
      VALIDATION_MODE: "generation",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/types.ts",
      ],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
