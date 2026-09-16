# staff_schedule Access And Gating

This file is for FE behavior review and local E2E planning.

`access` comes from bootstrap `get_all` once. FE must not treat `get_graph` as another source of access state.

## Access Model

- `*_view` controls visibility of read data.
- `*_edit` controls inline/value editing where the UI uses edit-level policy.
- `*_access` controls entry to actions and higher-level flows.
- FE group flags such as `salary_block`, `payroll_actions`, `schedule_actions`, `smena_actions`, `footer_stats` are display gates derived from or parallel to lower-level keys.
- Missing access keys are treated as `false` in FE policy checks.

## Current FE Gates

| Area                              | FE gate                                                                                                                 | What it unlocks                                     |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Schedule table                    | `full_month_access`                                                                                                     | open month employee modal                           |
| Day cell modal                    | `full_day_access` or `day_edit_access`; current FE fallback is `full_month_access` when dedicated day keys are absent   | open day employee modal                             |
| Fast actions panel                | `schedule_actions_access` or any of `fast_month_access`, `fast_2_week_access`, `fast_smena_access`, `fast_point_access` | action column on desktop, bottom bulk bar on mobile |
| Bulk or single fast action: hours | `fast_month_access` and/or `fast_2_week_access`                                                                         | schedule template change                            |
| Bulk or single fast action: shift | `fast_smena_access`                                                                                                     | shift reassignment                                  |
| Bulk or single fast action: point | `fast_point_access`                                                                                                     | cafe reassignment                                   |
| Shift management                  | `create_edit_smena_access` or `smena_actions_access`                                                                    | create, edit, delete shift                          |
| Payroll summary block             | `salary_block_view` or any finance read key                                                                             | salary table visibility                             |
| Payroll edit actions              | `payroll_actions_access` or any of `given_edit`, `given_cart_edit`, `withheld_edit`                                     | payout-related summary actions                      |
| Footer statistics                 | `footer_stats_view` or any of `bonus_of_day_view`, `sums_all_view`, `rolls_view`, `pizza_view`, `over_40_min_view`      | lower summary rows                                  |
| Work-schedule export              | `export_excel_access`                                                                                                   | WS export entry                                     |
| Health-journal export             | no dedicated key in FE                                                                                                  | HJ export stays available from current export flow  |

## Date And Role Gates

These gates are not driven by `access`. They come from FE view-model logic and should be covered in local E2E.

### Day Modal

Source: `staffScheduleModalViewModel.js`

- `canEditHours`
  - `true` for `MEGA` and `mega_dir` on any day
  - `true` for non-mega roles on today or future days
  - `true` for non-mega roles on past days only when `check_period === 1`
  - `false` otherwise
- `canEditAssignment`
  - same gate as `canEditHours`
- `canEditHealth`
  - `true` only on today
  - requires at least one hour range in payload
  - role does not bypass the today-only rule in current FE logic

### Month Modal

Source: `staffScheduleModalViewModel.js`

- `canEditMonth`
  - `true` for `MEGA`
  - `false` for past months for every other role, including `mega_dir`
  - `true` for current and future months for non-`MEGA`

This means the FE currently distinguishes `MEGA` from `mega_dir` for month editing, but not for day period editing.

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
  - `fast_month_access`, `fast_2_week_access`, `fast_smena_access`, `fast_point_access`
  - `create_edit_smena_access`
- expect:
  - can open day/month modals
  - can edit today/future day assignment and hours
  - cannot edit past month
  - past day edit depends on `check_period`
  - health edits only on today and only when hours exist

### Scenario C: `mega_dir`

- role kind: `mega_dir`
- access same as schedule editor
- expect:
  - can edit past and future day assignment/hours
  - still cannot edit past month in current FE logic
  - useful regression case because this differs from day gating

### Scenario D: `MEGA`

- role kind: `MEGA`
- access same as schedule editor
- expect:
  - can edit past/future days
  - can edit past months
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
   - verify day hours and assignment controls are disabled

3. `manager` + schedule access + today row
   - verify health controls enabled only when hours are present

4. `mega_dir` + schedule access + past month
   - verify day edit allowed
   - verify month edit still blocked in current FE logic

5. `MEGA` + schedule access + past month
   - verify month hour-filling flow is enabled and savable

6. bulk fast actions with `fast_month_access`
   - open bulk sheet
   - remove one user from pending list
   - save changed employee subset

7. shift management with `create_edit_smena_access`
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
  - day modal opens by dedicated day keys when present, otherwise by the same `full_month_access`
  - fast-action keys alone do not open the day modal
