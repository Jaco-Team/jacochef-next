# AGENTS.md

## Project Scope

- This repository uses `Next.js` with the `pages` router, `MUI`, and local Laravel API wrappers.
- Prefer existing project patterns over introducing new abstractions.
- When a page already has an established visual language, preserve it instead of redesigning it.
- Prefer focused changes inside the current module over broad refactors.

## Workflow

- Read the target page/component before editing.
- Use `apply_patch` for manual code edits.
- Read the surrounding module flow before changing behavior that crosses tabs, modals, or shared hooks/stores.
- Prefer focused changes in existing files over broad refactors.
- Do not remove existing behavior unless explicitly requested.
- If replacing a user flow, preserve the old capability elsewhere unless the user asked to remove it.
- Before using data fields from API responses, confirm they exist in known project docs, stores, or current payload usage.

## Formatting And Checks

- Do not run `prettier`, `eslint`, or other lint/format commands manually. Formatting is handled automatically.
- Do not manually reformat code unless the user explicitly asks for formatting changes.
- Keep code style consistent with the surrounding file.
- Avoid adding new dependencies unless required.
- Prefer fast, local verification such as syntax-aware review or targeted checks.
- Do not do broad cleanup unrelated to the task.

## Output

- Keep output tokens minimal.
- The project UI/content may be in Russian, but all assistant/user-facing chat replies must be in English unless the user explicitly asks for another language.
- Give a brief plan, do the work, then give a minimal close-out.
- Do not print or summarize diffs/changelogs in responses when the user can inspect files directly.
- Do not include edit summaries, file change counts, or tool-generated `(+/-)` change stats in responses.
- Do not list changed lines, touched files, or patch-style inventories in responses unless the user explicitly asks.
- Do not include file paths, file references, or line numbers in normal responses unless the user explicitly asks for them.
- Default to outcome-only close-outs: what was changed, whether it was verified, and any blocker or risk that still matters.
- Preferred final-response formula:
  - One short sentence for outcome.
  - One short sentence for verification or blocker if relevant.
  - Nothing else unless the user asks.

## UI And Design

- If the user provides a Figma URL, match Figma closely.
- Use existing MUI patterns already present in the repo.
- Keep desktop and mobile behavior aligned when both versions exist.
- For mobile modal/sheet patterns, prefer `SwipeableDrawer` when the screen is designed as a bottom sheet.
- For desktop modal patterns, prefer styled `Dialog`.
- Keep spacing, border radius, typography, and action hierarchy aligned with the surrounding page instead of introducing a new visual system.
- For tables and dense data UIs, prefer clear hover states, sticky headers when useful, and compact actions.

## Destructive Actions

- Do not use browser `confirm`.
- All destructive actions must go through a styled confirmation modal consistent with the page.
- Keep destructive actions explicit and visually separated from save actions.
- Do not hide destructive actions behind ambiguous labels.

## Forms

Do not commit secrets, private DSNs, or deployment credentials. Review changes to `pages/_document.js`, `pages/_app.js`, and `ecosystem.config.js` carefully because they affect global scripts, monitoring, and runtime configuration across the entire app.

- Preserve existing submit/cancel patterns unless the user asks to redesign the flow.
- Do not invent validation rules or payload fields.
- When binding forms to backend data, use only known field names and handle null/undefined safely.

## MUI Grid (v7) Note

When using Material UI v7, the `Grid` item sizing props changed. Use the `size` prop on `Grid` children instead of the old `xs`, `sm`, `md` props. Examples:

- Single size: `<Grid size={12}>` (full width)
- Responsive sizes: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`

Update existing `Grid` usages when upgrading to v7 to avoid layout regressions.

## Engineering Standards

Always produce senior-level code: avoid inventing field names or making assumptions about API shapes - ask. When consuming external data:

- Validate for null/undefined before access.
- Never silently use guessed, renamed, or invented fields. If a required field is not confirmed in the project or provided by the user, ask before implementing behavior that depends on it.
- Use only documented/known fields; do not add speculative fallbacks without verifying upstream.
- Prefer clear, minimal, and well-tested transformations over ad-hoc, speculative code.
- Prefer senior-level solutions: strong structure, clean abstractions, and maintainable logic without overengineering or spaghetti.
- Keep names aligned with existing domain terminology.
- Fast syntax checks, no extra formatting.
- Do not silently change behavior outside the stated task.
- If an assumption would materially affect behavior, stop and ask instead of guessing.

Follow these rules on all PRs to keep the codebase maintainable.
