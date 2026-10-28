# Staff Schedule Test Plan

## Purpose

This module currently has no dedicated automated test runner or module-level test harness in the repository.

For now, the practical test baseline is a local manual smoke pass against the local Laravel API on `127.0.0.1` / `localhost`, followed by targeted follow-up automation only after the current UI and payload flows are stable.

## Latest Smoke Run

Date: `2026-07-02`

Validated in browser against the local FE app on `localhost:3000` and local API on `localhost:8000`.

- [x] Auth API returns a valid token for the local test account.
- [x] `/staff_schedule` loads after auth.
- [x] `staff_schedule/get_all` returns `200`.
- [x] `staff_schedule/get_graph` returns `200` on initial load.
- [x] `Обновить` triggers another `staff_schedule/get_graph` request and returns `200`.
- [x] Point switch via the FE selector triggers `staff_schedule/get_graph` and returns `200`.
- [x] Month switch via the FE selector triggers `staff_schedule/get_graph` and returns `200`.
- [x] Day modal opens from the table and `staff_schedule/get_user_day` returns `200`.
- [x] Month modal opens from the employee row and `staff_schedule/get_user_month` returns `200`.
- [x] `Новая смена` opens the create dialog and `staff_schedule/get_all_for_new_smena` returns `200`.
- [x] Single-user fast actions dialog opens from the action column.
- [x] Bulk selection opens the bulk fast-actions dialog.
- [x] Health journal export opens, `downloadHJ` returns `200`, and the file downloads in browser.
- [x] Unchanged day save triggers `staff_schedule/save_user_day` and returns `200`.
- [x] Unchanged month save triggers `staff_schedule/save_user_month` and returns `200`.
- [x] Director level save with the current value triggers `staff_schedule/save_dir_lv` and returns `200`.
- [x] Hourly rate save with the current value triggers `staff_schedule/save_userPriceH` and returns `200`.
- [x] Cash-given save path triggers `staff_schedule/save_user_give_price`; current local data returns app-level validation error `Не задана ставка`.

Still not validated in this pass:

- [ ] WS export from the desktop-only header action
- [ ] fast-action mutation save endpoints
- [ ] summary action endpoints other than `save_dir_lv`, `save_userPriceH`, and the validation path of `save_user_give_price`
- [ ] error/appeal flows

Blocked by current local data:

- [ ] No real `err.one|two.orders|cam` records were found across tested point/month combinations, so order/camera error modals and appeal submit flows could not be exercised on live rows in this run.

## Environment

- app route: `/staff_schedule`
- local API base:
  - `NEXT_PUBLIC_API_URL` when set
  - otherwise `http://127.0.0.1:8000/api/`
- authenticated local session required

## Basic Smoke Set

### Bootstrap

- [ ] Open `/staff_schedule`.
- [ ] Verify the page stays mounted and does not redirect unexpectedly.
- [ ] Verify points list loads.
- [ ] Verify months list loads.
- [ ] Verify default point and month are selected.
- [ ] Verify an API error shows as an in-page error state, not a broken shell.

### Graph Loading

- [ ] Switch point and confirm graph reload.
- [ ] Switch month and confirm graph reload.
- [ ] Switch between first and second half of month.
- [ ] Confirm selected rows and collapsed shifts reset correctly after period/filter changes.

### Table Rendering

- [ ] Verify shift groups render.
- [ ] Verify employee rows render under the correct shift.
- [ ] Verify day columns align with summary columns.
- [ ] Verify sticky left columns stay aligned during horizontal scroll.
- [ ] Verify sticky header stays aligned during vertical scroll.
- [ ] Verify long employee names do not break row height or overlap sticky boundaries.
- [ ] Verify summary headers remain readable on narrow widths.

### Selection / Bulk

- [ ] Select a single row.
- [ ] Select multiple rows from the same shift.
- [ ] Select multiple rows across shifts.
- [ ] Verify bulk fast-action entry only appears when selection is valid.
- [ ] Verify selection state clears on point/month/part changes.

## Mutation Smoke Set

### Day Modal

- [ ] Open an editable day cell.
- [ ] Verify the modal loads real data.
- [ ] Save a valid change.
- [ ] Verify reload and cell refresh after save.
- [ ] Try a forbidden past-date edit with a non-privileged user and confirm FE or BE blocks it correctly.

### Month Modal

- [ ] Open the month modal from an editable row.
- [ ] Save a valid monthly change.
- [ ] Verify month save reloads the table.
- [ ] Try a forbidden past-month edit for a non-`MEGA` user and confirm the UI does not silently allow it.

### Shift Modal

- [ ] Create a new shift.
- [ ] Edit an existing shift.
- [ ] Delete an empty shift.
- [ ] Try deleting a non-empty shift and verify the backend error is surfaced clearly.

### Fast Actions

- [ ] Single-user schedule template change.
- [ ] Single-user shift move.
- [ ] Single-user point move.
- [ ] Bulk schedule template change.
- [ ] Verify each successful save reloads the graph.
- [ ] Verify each failed save leaves the dialog in a recoverable state with visible error text.

### Summary Actions

- [ ] Save hourly price.
- [ ] Save cash given.
- [ ] Save card given.
- [ ] Save withheld amount.
- [ ] Save director bonus.
- [ ] Save director level.
- [ ] Toggle team bonus.
- [ ] Remove team bonus from a user.

## Error / Appeal Set

- [ ] Open an order error row.
- [ ] Open a camera error row.
- [ ] Verify detail payloads populate the dialog correctly.
- [ ] Submit an appeal for each type.
- [ ] Verify success closes the dialog and reloads the page state.
- [ ] Verify backend failure leaves the dialog open with visible error text.

## Export Set

- [ ] Open export dialog.
- [ ] Change export dates.
- [ ] Download WS export.
- [ ] Download HJ export.
- [ ] Verify blob response handling works on local API.

## Role / Date Gating Focus

These checks deserve special attention because the backend rules are documented and easy to regress in FE:

- [ ] non-privileged user cannot edit forbidden past days
- [ ] current-day-only fields are blocked on non-current dates
- [ ] month edit is blocked for past months when role is not `MEGA`
- [ ] payroll-period exception behavior matches backend contract

## Follow-Up Automation Candidates

If the current smoke pass stabilizes, the first automation worth adding is:

1. a view-model unit pass for graph normalization
2. a payload-shape unit pass for action request builders
3. a small API-wrapper smoke harness for local success/error normalization

This should happen only after the current table and mutation flows stop changing daily.
