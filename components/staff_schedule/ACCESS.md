# staff_schedule Access And Gating

This file is for FE behavior review and local E2E planning.

`access` comes from bootstrap `get_all`. If a refreshed graph explicitly contains an access map, FE adopts it; a graph response without one preserves current rights.

## Access Model

- `*_view` controls visibility of read data.
- `*_edit` controls inline/value editing where the UI uses edit-level policy.
- `*_access` controls entry to actions and higher-level flows.
- Read permissions inherit `view || edit || access`; edit permissions inherit `edit || access`. An action requiring `access` does not inherit `view`/`edit`.
- Removed FE groups `salary_block`, `payroll_actions`, `schedule_actions`, `smena_actions`, `footer_stats` are ignored for every suffix/value. They are absent from the registry, presets and tester; old raw flags may remain inert in compatibility responses. Visibility is derived from detailed rights only.
- Missing access keys are treated as `false` in FE policy checks.

## Current FE Gates

| Area                              | FE gate                                                                             | What it unlocks                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Schedule table                    | `full_month_access`                                                                 | open month employee modal                                             |
| Day cell modal                    | `full_day_access`, `day_edit_access`/`day_edit_edit`, or legacy `full_month_access` | open day employee modal                                               |
| Fast actions panel                | any of `fast_hours_access`, `fast_smena_access`, `fast_point_access`                | checkboxes, desktop row actions and mobile bulk bar                   |
| Bulk or single fast action: hours | `fast_hours_access`                                                                 | both month and half-month schedule templates                          |
| Bulk or single fast action: shift | `fast_smena_access`                                                                 | shift reassignment                                                    |
| Bulk or single fast action: point | `fast_point_access`                                                                 | cafe reassignment                                                     |
| Shift management                  | `create_edit_smena_access`                                                          | create, edit, delete shift                                            |
| Payroll summary block             | any detailed finance read right (`view`, `edit` or `access`)                        | only individually readable salary columns                             |
| Payroll edit actions              | any edit/access of `given`, `given_cart`, `withheld`                                | only individually authorized payout actions                           |
| Footer statistics                 | any read right of `bonus_of_day`, `sums_all`, `rolls`, `pizza`, `over_40_min`       | only individually readable lower summary rows                         |
| Work-schedule export              | `export_excel_access`                                                               | WS export entry                                                       |
| Health-journal export             | `export_excel_access`                                                               | HJ export entry, same right as WS                                     |
| Hourly rate                       | `1h_edit` or `1h_access`                                                            | edit and save rate                                                    |
| Cash payout                       | `given_edit` or `given_access`                                                      | edit and save for any employee type                                   |
| Card payout                       | `given_cart_edit` or `given_cart_access`                                            | edit and save for any employee type                                   |
| Team bonus                        | `com_bonus_edit` or `com_bonus_access`                                              | period decision and individual grant/refusal                          |
| Director level                    | `director_level_edit` or `director_level_access`                                    | callable level editor/save guard; current hidden control stays hidden |

The **Быстрые действия** category contains exactly three independent action permissions: **Часы**, **Смена**, **Кафе**. Only `*_access = 1` grants an action; `view`/`edit`, legacy hours keys and `full_month` do not. No role-based quick-action gate is used. With no action permission, all entry points and checkboxes are hidden, an open modal is closed, and selection/drafts are discarded on revocation. Each requested block is checked again before saving, including after a confirmation dialog.

Hour templates replace only today and future dates, preserving historical days and the selected 2/2 template anchor. An entirely past month or half-month cannot be saved. These rules apply to every role.

Finance viewing/editing, payouts, team bonuses, director level, monthly saving and exports never infer authority from `kind`, account type or a director role. Summary actions check the exact detailed right both on open and save; removed group flags cannot grant or deny an action. Payment editing is not blocked for driver employees. Existing payroll arithmetic and team-decision prerequisites remain business rules, not caller authorization.

Бонус: `bonus_edit` или `bonus_access` разрешает редактирование бонуса любого сотрудника-менеджера и только собственного бонуса сотрудника-директора. В первой половине месяца редактирование недоступно. Таблица на компьютере и телефоне требует серверное `row.data.can_edit_bonus === true` (или `1`) и текущее право; отсутствие capability запрещает действие. Открытие и сохранение повторно сверяют `user_id`, `app_id`, `smena_id` с текущей второй половиной графика и месяцем `YYYY-MM`. Отзыв capability, права или смена периода закрывает редактор. Изменяется сохранённый `dir_bonus`; вычисляемый `my_bonus`, включающий командный бонус, не подставляется в редактор.

Revoking any effective detailed financial read permission closes cached day/month/financial-summary modals and invalidates their pending reads, even if editing-day/month rights remain. Changing an inert group flag does not revoke detailed reads. The independent director-level editor is not closed by salary-read revocation.

The optional full-payout shortcut is shown only when the total and required deductions are genuinely readable and numeric. With payment-edit rights alone manual payout remains available, but a hidden operand must not be guessed as zero. Authoritative `total_sum`, `to_pay_sum`, `premium_sheet` are calculated server-side before masking and used including explicit zero/empty values; compatibility calculation applies only when these fields are absent.

## Date And Role Gates

Day fields require the day-card access gate and the role/date gate below. `full_month_access` grants the same day authorization for any role; role/date rules remain separate.

### Day Modal

Source: `staffScheduleModalViewModel.js`

- `canEditHours`
  - `true` for `MEGA`, `mega_dir`, `dir`, and `dir_other` on any day with day access
  - `true` for `manager` only on the current day with day access
  - for other eligible roles, current/future days or past days with `check_period === 1`
- `canEditAssignment`
  - same gate as `canEditHours`
- `canEditHealth`
  - same gate as `canEditHours`, regardless of whether hour ranges exist

### Month Modal

Source: `staffScheduleModalViewModel.js`

- `canEditMonth` requires `full_month_access` and a current/future month for every role.
- Past months are read-only; past days in the current month are preserved at save. No `MEGA` exemption exists.

## Useful Local E2E Role Scenarios

These are the role/gate scenarios worth testing against the local DB and `StaffScheduleAccessTester`.

### Scenario A: Read-only viewer

- access:
  - core read keys on
  - action keys off
- expect:
  - table renders
  - month/day edit entry hidden
  - fast actions hidden
  - shift management hidden
  - finance summary visible only for enabled view keys

### Scenario B: Schedule editor, non-mega

- role kind: `manager` or `other`
- access:
  - `full_month_access`
  - `full_day_access` or `day_edit_access`
  - `fast_hours_access`, `fast_smena_access`, `fast_point_access`
  - `create_edit_smena_access`
- expect:
  - can open day/month modals
  - `manager` can edit all day fields only today, even when no hours exist
  - cannot edit past month
  - past and future day fields are read-only for `manager`, regardless of `check_period`

### Scenario C: `mega_dir`

- role kind: `mega_dir`
- access same as schedule editor
- expect:
  - can edit past and future day assignment/hours/health without an hours prerequisite
  - still cannot edit past month in current FE logic
  - useful regression case because this differs from day gating

### Scenario D: `MEGA`

- role kind: `MEGA`
- access same as schedule editor
- expect:
  - can edit past/future days
  - cannot edit past months
  - should be the permissive baseline for mutation E2E

### Scenario E: Payroll operator

- access:
  - finance view keys on
  - `given_edit`, `given_cart_edit`, `withheld_edit`, `bonus_edit`, `1h_edit`, `com_bonus_edit` as needed
- expect:
  - salary block and summary actions visible
  - unrelated schedule actions may stay hidden

## Concrete E2E Matrix

Use these as the first local scenarios:

1. `manager` + schedule access + current month
   - open day modal
   - open month modal
   - save allowed day change
   - verify past month edit disabled

2. `manager` + schedule access + past date row where `check_period !== 1`
   - verify all day fields are disabled

3. `manager` + schedule access + today row
   - verify all day fields enabled even without hours

4. `mega_dir` + schedule access + past month
   - verify day edit allowed
   - verify month edit still blocked in current FE logic

5. `MEGA` + schedule access + past month
   - verify month hour-filling flow is read-only, like every role

6. bulk fast actions with `fast_hours_access`
   - open bulk sheet
   - remove one user from pending list
   - save changed employee subset
   - both month and half-month scopes available under the same hours permission
   - past dates unchanged; an entirely past scope is disabled

7. quick-action permission matrix
   - all eight combinations of hours/shift/cafe access show only permitted blocks
   - no permissions hides checkboxes, row actions and the bulk bar
   - `view`/`edit`, `full_month` and legacy/group flags never grant a quick action
   - revoked permissions discard selection and the open draft before permissions are restored

8. shift management with `create_edit_smena_access`
   - create shift
   - rename shift
   - dirty-close warning
   - delete confirm

## Notes For Test Preparation

- `StaffScheduleAccessTester` is the fastest way to simulate missing keys and role kinds in `development`.
- For date gating, the decisive inputs are:
  - `roleKind`
  - `monthId`
  - day `date`
  - `check_period`
  - whether day payload has `hours`
- If a test fails, check whether it is an access-key problem or a date/role-gate problem first. They are separate systems in the FE.
- Current FE fallback policy:
  - month modal opens by `full_month_access`
  - day modal opens by dedicated day keys or legacy `full_month_access` for any role, then applies date rules
  - fast-action keys alone do not open the day modal
