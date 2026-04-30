// ESLint flat-config (v9+). Run with `bun run lint` at the root or `bun run lint`
// inside `apps/web`. Rules are deliberately conservative — we let TypeScript 6.0
// with `strict: true` + `noUncheckedIndexedAccess: true` catch the heavy stuff,
// and ESLint covers the things the compiler can't see (hook rules, Next.js
// image/linking warnings, floating promises, etc.).
//
// Dependencies (added to root package.json, install via `bun install`):
//   - eslint
//   - typescript-eslint
//   - eslint-plugin-react-hooks
//   - @next/eslint-plugin-next
//   - globals

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.vercel/**",
      "supabase/.branches/**",
      "supabase/.temp/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
    },
    rules: {
      // React Hooks — catches stale closures, missing deps, etc.
      ...reactHooks.configs.recommended.rules,

      // Next.js — catches <img> where next/image is expected, bad <Link> usage.
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // TypeScript — we already have strict + noUncheckedIndexedAccess doing heavy lifting.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
  // Scripts / config files can use console freely.
  {
    files: ["**/*.config.{js,mjs,cjs,ts}", "scripts/**/*.{js,mjs,cjs,ts}"],
    rules: {
      "no-console": "off",
    },
  },
  // Tests — allow more latitude.
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
);
