@AGENTS.md

## Code organization conventions

- Keep page/component files focused on composition and rendering. Business logic — state, effects, event handlers, derived values — belongs in a custom hook (`use*`), not inlined in the component body.
- A hook used by only one component lives next to it or in that route's folder; a hook used by 2+ places lives in `src/hooks/`.
- Any logic or markup duplicated across 2+ files must be extracted into a shared hook (`src/hooks/`), utility (`src/lib/`), or component (`src/components/common/`) rather than copy-pasted. Reuse the existing extraction if one already covers the case.
- When an import is used only as a type (interfaces, type aliases, type-only usages of a class), import it with `import type` instead of importing the module itself.
- A type used by 2+ files belongs in a shared `types.ts` (root of `src/`, or a `types/` folder if it grows) rather than being defined in one file and imported into others. A type used by only one file can stay local to it.
- A route/component-local file of constants (columns, options, etc.) used by only that route or component should just be named `const.ts` next to it — don't overcomplicate the name (e.g. no need for `ingredients-columns.ts`).
