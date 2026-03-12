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

- Reuse existing form components when possible:
  - `MyTextInput`
  - `MyAutocomplite`
  - `TextEditor`
- Preserve the `journal` form style where it is already used.
- Keep placeholders gray and entered values readable.

## API Conventions

- For page modules that already use module-based API calls, prefer:
  - `api_laravel_local(this.state.module, method, data)`
- Follow existing page API naming rather than inventing a new client abstraction.
- After successful create, update, or delete actions, refresh page data from the server.
- Prefer server-derived truth over local optimistic state when the page already reloads via `get_all`.

## Page Data Pattern

- If a page already has a `get_all` endpoint, treat it as the source of truth for:
  - main lists
  - permissions/access
  - histories
  - derived page state
- After mutations, prefer `refreshPageData()` rather than hand-editing multiple local arrays.

## History And Audit

- If the backend returns history arrays such as `desc_hist` or `news_hist`, normalize them on the frontend into the format expected by `HistoryLog`.
- Reuse `@/ui/history/HistoryLog` instead of building a second history UI.
- Reuse `SmartDiff`-compatible `diff_json` structures when possible.
- Show history near the block it belongs to:
  - instruction history under instructions
  - news history under news

## News And Rich Text

- Reuse the existing `TextEditor` integration.
- If a design requires a custom editor layout, prefer extending `TextEditor` variants instead of creating one-off editor wrappers in page files.
- Keep TinyMCE configuration explicit and avoid passing undefined nested config blocks that can break desktop/mobile initialization.

## Access And Permissions

- Respect page access flags returned by the API.
- Hide edit/delete controls when access does not allow them.
- Do not rely only on UI checks; keep server calls aligned with backend permissions.

## Page-Level Guidance For This Repo

- On admin/content pages, actions commonly live inside the section they affect.
- Lists on desktop can sit in columns; on mobile they should stack naturally into the page flow.
- Avoid nested internal scroll areas unless the design clearly requires them.
- Prefer page scroll over small embedded scroll containers on mobile.

## Good Defaults For Codex

- When unsure, extend the current page instead of extracting a new subsystem.
- When a request sounds like “make it like the existing modal/block,” reuse the current implementation pattern first.
- If history, confirmation, or edit flows already exist on the page, mirror those patterns for related entities.
