# AGENTS.md

## Project Scope

- This repository uses `Next.js` with the `pages` router, `MUI`, and local Laravel API wrappers.
- Prefer existing project patterns over introducing new abstractions.
- When a page already has an established visual language, preserve it instead of redesigning it.

## Workflow

- Read the target page/component before editing.
- Use `apply_patch` for manual code edits.
- Prefer focused changes in existing files over broad refactors.
- Do not remove existing behavior unless explicitly requested.
- If replacing a user flow, preserve the old capability elsewhere unless the user asked to remove it.

## Formatting And Checks

- Run `npx prettier --check <file>` after edits.
- Keep code style consistent with the surrounding file.
- Avoid adding new dependencies unless required.

## UI And Design

- If the user provides a Figma URL, match Figma closely.
- Use existing MUI patterns already present in the repo.
- Keep desktop and mobile behavior aligned when both versions exist.
- For mobile modal/sheet patterns, prefer `SwipeableDrawer` when the screen is designed as a bottom sheet.
- For desktop modal patterns, prefer styled `Dialog`.

## Destructive Actions

- Do not use browser `confirm`.
- All destructive actions must go through a styled confirmation modal consistent with the page.
- Keep destructive actions explicit and visually separated from save actions.

## Forms

Do not commit secrets, private DSNs, or deployment credentials. Review changes to `pages/_document.js`, `pages/_app.js`, and `ecosystem.config.js` carefully because they affect global scripts, monitoring, and runtime configuration across the entire app.

## MUI Grid (v7) Note

When using Material UI v7, the `Grid` item sizing props changed. Use the `size` prop on `Grid` children instead of the old `xs`, `sm`, `md` props. Examples:

- Single size: `<Grid size={12}>` (full width)
- Responsive sizes: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`

Update existing `Grid` usages when upgrading to v7 to avoid layout regressions.

## Engineering Standards

Always produce senior-level code: avoid inventing field names or making assumptions about API shapes - ask. When consuming external data:

- Validate for null/undefined before access.
- Use only documented/known fields; do not add speculative fallbacks without verifying upstream.
- Prefer clear, minimal, and well-tested transformations over ad-hoc, speculative code.

Follow these rules on all PRs to keep the codebase maintainable.
