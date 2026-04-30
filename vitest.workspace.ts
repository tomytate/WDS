import { defineWorkspace } from "vitest/config"

export default defineWorkspace([
  {
    test: {
      name: "web",
      root: "./apps/web",
      environment: "jsdom",
      globals: true,
      setupFiles: ["./setup-tests.ts"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    },
  },
  {
    test: {
      name: "ui",
      root: "./packages/ui",
      environment: "jsdom",
      globals: true,
      setupFiles: ["./setup-tests.ts"],
    },
  },
  {
    test: {
      name: "db",
      root: "./packages/db",
      environment: "node",
      globals: true,
    },
  },
])
