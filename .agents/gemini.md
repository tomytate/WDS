# Gemini — Wong Digital Shop

Read `.agents/agent.md` for the full project context first.

## Gemini-Specific Instructions

### Skills
- Read `.agents/skills/*/SKILL.md` files for latest package documentation
- These contain up-to-date patterns for Next.js 16, React 19, TypeScript 6, Tailwind 4, Zod 4, Drizzle, Supabase, and Vitest

### Task Management
- Use task boundaries to communicate progress
- Update `task.md` artifact as you complete checklist items
- Create `implementation_plan.md` for multi-file changes

### Code Changes
- Always verify changes with `bun run build` and `bun run test`
- Use exact file paths with `@/` alias for Next.js imports
- Follow import ordering: types → framework → packages → local → relative
- Keep client boundaries narrow — only `"use client"` when hooks are needed

### Tailwind CSS 4 
- **Critical**: Do NOT create `tailwind.config.js` — this project uses CSS-first `@theme` in `globals.css`
- The IDE warning "Unknown at rule @theme" is a false positive — ignore it
- Use CSS custom properties: `--accent`, `--bg-surface`, `--border`, etc.
- Use `color-mix(in srgb, var(--accent) 12%, transparent)` for transparent variants
- Color palette: **Blue** (`#3B82F6` accent, cool slate backgrounds)
- Fonts: **Space Grotesk** (display), **Inter** (body), **JetBrains Mono** (mono)
- Use `@theme inline` block to bridge shadcn CSS variables to Tailwind utilities

### Handling shadcn/ui
- This project uses shadcn/ui in a **monorepo** (apps/web + packages/ui)
- Both `components.json` files must match `style`, `iconLibrary`, `baseColor`
- Import components: `from "@wongdigital/ui/components/button"`
- Import utility: `from "@wongdigital/ui/lib/utils"` (the `cn()` function)
- Add components via CLI: `bunx shadcn@latest add [component]` from `apps/web`
- Always use `cn()` instead of bare `clsx()` for Tailwind class merging

### TypeScript 6
- `strict: true` is the default — don't add it explicitly in new configs
- `noUncheckedSideEffectImports: true` — catches typos in side-effect imports
- `moduleResolution: "Bundler"` — do NOT use `esModuleInterop`

### Database
- PostgreSQL 17 via Supabase
- Drizzle ORM for schema and queries
- Use `uuid().defaultRandom()` for PKs, `numeric(10, 2)` for prices
- Always use `timestamp({ withTimezone: true })`

### Testing
- Vitest 4.1.4 with 3 workspaces (web, ui, db)
- Co-located tests (`*.test.ts` next to source)
- Factory functions for mock data
- Strong assertions — exact values, not `toContain`/`toBeDefined`
