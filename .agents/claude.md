# Claude Code — Wong Digital Shop

Read `.agents/agent.md` for the full project context first.

## Claude-Specific Instructions

### Memory
- Use `/memory` to persist important decisions across sessions
- Review SKILL.md files in `.agents/skills/` for up-to-date package docs

### Extended Thinking
- Use extended thinking for complex refactors spanning multiple files
- Break down large changes into atomic commits

### Tool Use
- Use `Bash` tool to run `bun run build`, `bun run test`, `bun run typecheck` after changes
- Always verify with a build before marking work complete
- Use `Read` tool to check file contents before editing

### Code Style
- TypeScript 6 strict mode — explicit return types on exported functions
- Prefer `satisfies` for type-safe object validation
- Use `as const` assertions for literal union types
- No semicolons (project convention)

### Handling Tailwind
- This project uses **Tailwind CSS 4.2.2** with `@theme` CSS-first config
- Do NOT generate `tailwind.config.js` — it doesn't exist and isn't needed
- Design tokens are in `apps/web/app/globals.css`
- The `@theme` warning in IDE is a false positive
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
- Read `.agents/skills/shadcn-ui/SKILL.md` for full monorepo setup details

### Commit Messages
- Format: `type: short description`
- Types: `feat`, `fix`, `refactor`, `test`, `ci`, `docs`, `style`, `perf`
- Body: bullet points for multi-file changes

### Verification Checklist
1. `bun run build` — 0 errors
2. `bun run test` — all pass
3. `bun run typecheck` — clean
4. Imports in chronological order
5. Accessibility attributes present
