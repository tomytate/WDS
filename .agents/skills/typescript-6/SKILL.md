---
description: TypeScript 6.0 new defaults, features, and migration notes
---

# TypeScript 6.0.2 — Reference Guide

## Strategic Context
- TypeScript 6.0 is the **final JavaScript-based release** before TypeScript 7.0 (Go-native)
- Serves as a "bridge" release to prepare codebases for the parallel TS 7.0 compiler

## New Defaults (Breaking Changes from 5.x)

| Setting | Old Default | New Default (TS 6) |
|---|---|---|
| `strict` | `false` | **`true`** |
| `types` | auto-discovers all `@types/*` | **`[]`** (empty — must be explicit) |
| `target` | `es5` | **`es2025`** |
| `module` | varies | **`esnext`** |
| `rootDir` | varies | **tsconfig.json directory** |
| `noUncheckedSideEffectImports` | `false` | **`true`** |

## Project Configuration

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedSideEffectImports": true,
    "allowJs": false,
    "checkJs": false,
    "declaration": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["node"]
  }
}
```

**Why these settings:**
- `moduleResolution: "Bundler"` — optimized for bundlers (Next.js/Vite), no need for `esModuleInterop`
- `noUncheckedSideEffectImports: true` — catches typos in `import "./mistyped.css"`
- `isolatedModules: true` — required for Turbopack/esbuild compatibility

## Deprecations (Removed in TS 7.0)

| Deprecated | Replacement |
|---|---|
| `target: "es5"` | `"es2015"` minimum |
| `moduleResolution: "node"` | `"node16"`, `"nodenext"`, or `"bundler"` |
| `moduleResolution: "classic"` | `"bundler"` |
| `--baseUrl` | Use `paths` instead |
| `--outFile` | Use bundler |
| `--downlevelIteration` | No longer needed with ES2015+ target |
| `amd`, `umd`, `systemjs` modules | Use `esnext` |

## New Language Features

### ES2025 Support
- Full `es2025` as `target` and `lib`
- `Temporal` API types (replacement for `Date`)
- `Map.getOrInsert` / `Map.getOrInsertComputed` (upsert)
- `RegExp.escape` (Stage 4)

### DOM Library Updates
- `dom.iterable` and `dom.asynciterable` included by default in `lib: ["DOM"]`
- No need to separately add `DOM.Iterable`

### Subpath Imports
- Support for `#/` prefix for subpath imports
- Aligns with modern Node.js standards

### Migration Flag
- `--stableTypeOrdering` — identifies subtle ordering dependencies that may break in TS 7.0's parallel processing

## Best Practices for This Project
1. **Never use `esModuleInterop`** — redundant with `moduleResolution: "Bundler"`
2. **Always use `noUncheckedSideEffectImports`** — prevents typos in CSS imports
3. **Use `satisfies`** for type-safe object validation without widening
4. **Prefer `const` assertions** (`as const`) for literal types
5. **Use `Promise<T>` params** in Next.js page components (async API requirement)
