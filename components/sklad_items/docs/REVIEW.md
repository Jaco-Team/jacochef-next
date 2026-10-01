# Review: legacy parity and business-process audit

Date: 2026-09-22

Status: audit completed. The production-calculation remediation marked `done` below is implemented; no migrations or local source data were changed.

## Scope and evidence

Reviewed against the local composite module and its legacy sources:

- `recept_module_new_2` — recipes and semi-finished products;
- `site_items_new` — site items;
- `ed_izmer` — units;
- the canonical `sklad_items` FE and backend write/read contracts;
- local MariaDB through the `mysql-env.sh local` connector profile.

Warehouse CRUD is explicitly excluded: `sklad_items_module_new` remains a standalone module and its composite tab is suspended.

The local database resolves to the explicitly local connector target (`127.0.0.1:3307`; database reported by the connection: `laravel`).

The baseline access and focused backend checks already recorded for this scope remain valid:

- `sklad:sync-access --dry-run`: 77 desired target groups, 77 existing, no stale groups, pruning disabled;
- focused Sklad test suite: 86 tests, 282 assertions passed.

## Business process: recipes and semi-finished products

### Legacy contract

For both recipes and semi-finished products, the legacy editor uses a component matrix:

`Номенклатура -> Единица -> Брутто -> % потери при ХО -> Нетто -> % потери при ГО -> Выход`.

Business rules implemented by the legacy editor:

1. editing `Брутто` or `% потери при ХО` recalculates `Нетто`;
2. editing `% потери при ГО` recalculates `Выход`;
3. `Нетто` and `Выход` are read-only calculated values;
4. header totals (`Итого брутто`, `Итого нетто`, `Итого выход`) are read-only sums of component rows;
5. all calculated values are rounded to three decimals.

The expected formulas are:

- `netto = round(brutto * (100 - pr_1) / 100, 3)`;
- `output = round(netto * (100 - pr_2) / 100, 3)`;
- each header total is the three-decimal sum of its corresponding component column.

### E2E local example

The item from the reported screen, `Ананасы, без сиропа П/Ф` (local `polufabricat_new.id = 149`), is internally consistent:

- component: `Ананасы`, `1 кг` gross, `40%` primary loss, `0.600 кг` net, `0%` thermal loss, `0.600 кг` output;
- parent totals: gross `1`, net `0.6`, output `0.6`.

This is a valid business result, not a data error.

Local coverage demonstrates that the flow is material rather than an edge case:

- 59 recipe component rows; 93 semi-finished component rows;
- 1 recipe and 61 semi-finished products without components;
- 1 recipe component and 28 semi-finished components have non-zero `% потери при ХО`.

The no-component semi-finished products may legitimately use a textual structure. They do not justify dropping the structured flow for the 87 semi-finished products that use it.

## Confirmed parity gaps

| Priority | Area                        | Confirmed gap                                                                                                                                                                                      | Consequence                                                                                                                                                                            |
| -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Semi-finished editor        | The composite editor renders a CSV/free-text `Состав` field instead of the legacy component matrix.                                                                                                | Existing component rows, losses, calculated net/output, and component totals cannot be reviewed or safely edited. Saving risks replacing a structured PF workflow with text-only data. |
| P0       | Recipe editor calculations  | The composite grid allows direct editing of `Нетто` and `Выход`; legacy makes both derived and disabled.                                                                                           | Users can create a component row that violates the loss calculation.                                                                                                                   |
| P0       | Aggregate production totals | The composite top-level `Выход`, `Брутто`, and `Нетто` fields are directly editable; legacy derives and disables them.                                                                             | Parent totals can diverge from composition; revisions/history then preserve contradictory values.                                                                                      |
| P0       | Backend invariant           | The production write service normalizes incoming component and aggregate numeric fields but does not derive totals or reject mismatches.                                                           | Direct API calls and the current FE can persist inconsistent production data.                                                                                                          |
| P1       | Primary-loss rendering      | The composite helper reads alternative loss aliases but omits canonical `pr_1`. Current legacy rows use `pr_1`.                                                                                    | `% потери при ХО` can render blank even when the value exists; it is already relevant to 29 local component rows.                                                                      |
| P1       | Derived-field behavior      | Changing gross/loss in the composite editor only changes that field in local state; no row recalculation is applied.                                                                               | The user must manually repair fields which legacy calculated automatically.                                                                                                            |
| P1       | Read-only production view   | The view’s loss helper likewise omits canonical `pr_1`; the compact composition view also shows only one generic `Потери` column, not separate ХО and ГО losses.                                   | Audit/review loses the loss stage and may conceal populated data.                                                                                                                      |
| P2       | Production list semantics   | Legacy screens separate recipe and PF sections and display creation/update dates. The composite merges rows without an explicit type column and replaces those dates with effective-period fields. | A mixed list is less auditable: the entity type and last update are not directly visible. This is a UX/information loss, not a data loss.                                              |
| P2       | Revision toggle workflow    | Legacy list exposes a direct `show_in_rev` checkbox when that field permission is granted. The canonical API retains a field-specific flag endpoint, but the composite list does not use it.       | The same change requires opening the editor; a field-only access role needs explicit UI coverage before parity can be claimed.                                                         |

## Local data-quality findings

These are source-data exceptions, not candidates for an automatic rewrite.

| Severity | Record                                       | Finding                                                                                                                 | Safe response                                                                                             |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| P2       | Semi-finished `id = 1`, `7Up 0.6 л`          | Parent totals are zero while its one component totals gross/net/output `1`.                                             | Include in a dry-run reconciliation report. Do not silently overwrite history or archives.                |
| P3       | Site item `id = 143`, `Соус чесночный Heinz` | Stored `kkal = 330`; current backend nutrition formula yields `329` from the saved BJU.                                 | Treat as a one-kcal historical rounding/source discrepancy; require an owner decision before changing it. |
| P3       | Site-item portion weights                    | 28 records have non-positive weight, 13 active; sampled rows include bundles, packaging, and non-food/service products. | Do not impose a blanket positive-weight validation. Define validation by product type/category first.     |

## Site items and units: parity assessment

### Site items

The visible composite site-item flow intentionally mounts `SkladSiteItemsLegacyEditorDialog`, preserving the existing modal instead of substituting the new unfinished alternative editor. The preserved modal retains:

- marketing, category, marking, description, tag, image and stage fields;
- the staged composition matrix, per-stage timings and derived totals;
- BJU calculations using the existing factors (`3.9875`, `8.9459`, `3.9945`);
- field-level visibility/editability and image/history flows.

The catalog adds canonical archive/history handling and the VK queue trigger. The VK action is correctly an external-worker enqueue acknowledgement, not a claimed completed synchronization.

No confirmed site-item modal feature loss was found in the currently mounted compatibility modal. `SkladSiteItemEditorDialog` is a separate newer implementation but is not the active route; it must not replace the compatibility modal until it receives a separate parity review.

### Units

The canonical unit dialog retains the legacy data contract: name, source amount, related/base unit and related amount. It adds search, guarded deletion and usage visibility. Local data has positive conversion quantities for all 11 current unit rows.

No business-rule loss was confirmed for units. The wording/order of fields differs from legacy but remains semantically equivalent.

## Intentional differences — retain

- Warehouse items remain outside this composite module until the separately documented scope changes.
- Cross-entity archive remains unexposed: recipes/PF/site items have incompatible archive semantics and detail contracts. Entity-local archive filters are the correct current behavior.
- The site-item compatibility modal remains in place by task requirement.
- Current history/revision contracts remain canonical; no legacy runtime endpoint should be reintroduced.

## Remediation plan — no implementation performed

### Phase 1 — freeze the production calculation contract

- [done] Reproduce the legacy gross/loss/net/output formulas and three-decimal totals in the composite FE and canonical production write flow. No new validation policy was introduced.
- [done] Make `pr_1` canonical in the editor helper while retaining legacy read aliases.
- [done] Add focused backend regression coverage for row recalculation, aggregate totals and aggregate-only payloads.
- [done] Confirm zero-component PF behavior from the legacy modal: it initializes and submits an empty component list while keeping `structure` as independent metadata. The canonical editor preserves that mode and never substitutes text structure for a populated component matrix.

### Phase 2 — restore production modal parity

- [done] Render the full component matrix for both recipes and semi-finished products whenever composition exists or is being created.
- [done] Allow input only for item, gross, `pr_1`, and `pr_2`; display net/output and all totals as disabled derived values.
- [done] Remove direct editing of top-level gross/net/output; render an explicit aggregate summary from component rows.
- [done] In read mode, show both loss stages and derived values rather than one ambiguous loss value.
- [done] Keep text `structure` as supplementary PF metadata only; component rows remain the source of derived weights whenever present.

### Phase 3 — make the backend authoritative

- [done] Recalculate row outputs and parent totals in the production write service from component input.
- [done] Ignore aggregate-only client payloads; derived values are persisted only when the existing component payload is supplied with `production_items_edit`.
- [done] Preserve historical snapshots exactly: no migration, bulk repair, archive rewrite or history rewrite is part of this change.
- [done] Add service coverage for contradictory payloads and the future-revision snapshot merge; existing effective-revision coverage continues to exercise revision scheduling.

### Phase 4 — list and access closure

- [done] Add an explicit recipe/PF type marker to the merged list while retaining category filtering.
- [done] Restore the legacy update-date projection in the canonical list.
- [done] Restore the field-specific revision quick-toggle through the existing canonical flag endpoint and existing `production_show_in_rev_edit` permission.
- [done] Re-run the access matrix in unit coverage: view-only exposes history without edit; field-only revision access remains scoped; full edit remains distinct from activity/archive access; standalone history remains fail-closed; delete/convert remain action-only.

### Phase 5 — local E2E and data reconciliation

- [ ] On local DB only, create disposable recipe and PF examples covering 40% ХО loss, non-zero ГО loss, multiple rows, a future-dated revision, archive/restore and history inspection; clean up only those identified disposable records after verification. A rollback-only service probe was attempted, but Artisan's interactive `mariadb` PDO connection failed before its first query while the connector's local SQL client remained healthy. No record was created; do not treat this as E2E completion until the application CLI connection is restored or the flow is exercised through the authenticated local UI.
- [done] Compare the legacy and canonical screens side by side in Chrome using local `Ананасы, без сиропа П/Ф`: both show the component matrix, both loss stages, and derived gross/net/output values.
- [done] Run the local dry-run reconciliation: exactly one mismatch remains, `polufabricat_new.id=1` (`7Up 0.6 л`), whose stored headers are all `0` while its only component is `1/1/1`. No source row was modified because legacy behavior does not establish the intended business value.
- [done] Re-run focused Sklad tests and the local access sync dry-run: the sync reports 77 desired/77 existing target groups, no stale groups, and 55 appointments in scope.

## Acceptance criteria

Production parity is complete only when a user can open the local `Ананасы, без сиропа П/Ф` example in the composite module and see the same component row, loss stages and read-only derived totals as in the legacy modal; changing gross or either loss recalculates deterministically, and an API payload cannot persist contradictory totals.
