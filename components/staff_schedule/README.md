# Staff Schedule

## Task

Source task was previously stored in `TASK.md` and removed on June 25, 2026 in commit `113df3a`.

Module intent:

- build a new `staff_schedule` module on a separate route
- use the new Figma screen as the UI source of truth
- keep working against the local Laravel API while the backend contract is still settling
- preserve the legacy `work_schedule` meaning without dragging the old monolith into the new UI

Original task references:

- Figma: `https://www.figma.com/design/bzb8ksK03R5FeMzRBKsEo9/Chief-screens?node-id=380-206795&t=wWGzyWi8mJvb7HgR-0`
- Legacy module reference: `https://jacosoft-dop.ru/work_schedule`

Backend/domain notes from the original task:

- new schedule data is expected to move toward `cafe_smena*` tables
- shift duplication should be solved by proper keys, not by defensive FE-only checks
- the first milestone was initially read-only rendering, later expanded into live editing flows

## Current Module Shape

- route: `/staff_schedule`
- page shell: `StaffSchedulePage`
- main state hook: `useStaffSchedulePage`
- API wrapper: `useStaffScheduleApi`
- major UI blocks:
  - header/filter section
  - schedule table
  - day/month/smena/edit dialogs
  - export dialog
  - fast actions dialog
  - summary action dialog
  - order/camera error section and appeal dialog

Supporting docs:

- API contract: `fe-api.md`
- local QA checklist: `TEST-PLAN.md`
- automated test entrypoint: `tests/README.md`

## API / Local DB Status

Current module API calls are routed through `useStaffScheduleApi -> useApi("staff_schedule")`.

Local transport confirmed in code:

- `src/hooks/useApi.js`
  - `baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/"`
  - fallback note also points to local `127.0.0.1`
- `src/api_new.js`
  - legacy fallback `api_laravel(...)` posts to `http://127.0.0.1:8000/api/${module}/${method}`
  - `api_laravel_local(...)` also posts to `http://127.0.0.1:8000/api/${module}/${method}`

Conclusion:

- all module API traffic is local-first
- primary mode is `NEXT_PUBLIC_API_URL` if set
- fallback mode is still `127.0.0.1`
- there is no staff-schedule-specific remote production API hardcoded in the module

## Reconstructed Delivery Log

This status is reconstructed from removed docs plus module commits from June 19, 2026 through July 1, 2026.

### Done

- [x] Created separate `staff_schedule` route and page shell.
- [x] Split the module into page/hook/helpers/view-model/sections/modals instead of a legacy-style monolith.
- [x] Wired bootstrap and graph loading through the local Laravel API wrapper.
- [x] Added point and month selection.
- [x] Added period switching for `1-15` and `16-end`.
- [x] Rendered grouped shift table with employee rows and summary columns.
- [x] Added sticky table behavior and ongoing table layout refinement.
- [x] Added day modal flow.
- [x] Added month modal flow.
- [x] Added create/edit/delete shift flow (`smena` modal).
- [x] Added export dialog and download actions.
- [x] Added fast actions dialog for single-user edits.
- [x] Added bulk fast actions flow.
- [x] Added salary/bonus/summary action dialog wiring.
- [x] Added order error and camera error blocks.
- [x] Added appeal dialog for error review actions.
- [x] Replaced browser-style confirm flow with styled confirm modal usage.
- [x] Moved active API assumptions into `fe-api.md`.

### Done But Still Needs Regression QA

- [x] Local API transport through `127.0.0.1` / `NEXT_PUBLIC_API_URL`.
- [x] Summary save actions for:
  - hourly price
  - cash given
  - card given
  - withheld amount
  - director bonus
  - director level
  - team bonus toggle
- [x] Team bonus removal per user.
- [x] Shift reassignment and point reassignment through fast actions.
- [x] Bulk schedule-template actions.
- [x] Export actions for WS / HJ.
- [x] Added a generic automated test entrypoint with scoped `staff_schedule` unit and e2e coverage examples.

## TODO

### Priority 1

- [ ] Finish current table polish in `StaffScheduleTableSection` and regression-check sticky boundaries, clipping, nowrap, and horizontal scroll.
- [ ] Verify the active unstaged table changes before treating the UI as stable.
- [ ] Run a full local smoke pass against real data for both period halves.

### Priority 2

- [ ] Audit date-based edit gating against `fe-api.md` rules for:
  - past day edits
  - current-day-only health/temperature fields
  - payroll-period exceptions
  - past month edits
- [ ] Confirm the UI disables forbidden edits before submit instead of only surfacing backend errors.

### Priority 3

- [ ] Regression-test all fast-action flows:
  - single user schedule template
  - single user shift move
  - single user point move
  - bulk schedule template
  - mixed selection edge cases
- [ ] Confirm reload behavior after each mutation and confirm dialogs.

### Priority 4

- [ ] Regression-test all summary action saves against live local payloads and response edge cases.
- [ ] Verify amount limits and error messaging for `given`, `given_cart`, and `withheld`.
- [ ] Verify that `selectedPart`, `monthId`, and date payloads match backend expectations on every summary endpoint.

### Priority 5

- [ ] QA error flows:
  - order error details
  - camera error details
  - appeal submission success/error states
- [ ] Confirm red states, info icons, and row click behavior match real payload combinations.

### Priority 6

- [ ] Add explicit empty-state and no-data checks for unusual but valid backend responses.
- [ ] Review whether any remaining backend payload shapes are still inferred rather than documented in `fe-api.md`.
- [ ] Decide whether this module should get lightweight automated coverage or stay on a manual smoke plan for now.

## Suggested Next Scope

If work continues immediately, the best next concrete scope is:

1. finish the current table UI changes
2. run the smoke cases from `TEST-PLAN.md`
3. fix any date-gating regressions found during that pass

That is the shortest path to stabilizing the module without expanding feature scope again.
