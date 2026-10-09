# Sklad Items follow-up implementation plan

Scope: `feat/sklad_items-43371`.

This plan records the VK parity work and the other confirmed gaps found while comparing `sklad_items` with `site_items_new`, `recept_module_new_2`, `sklad_items_module_new`, and `ed_izmer`.

## 1. VK tooling in the new module

Status: completed. VK remains an external-worker trigger: the unified API and UI report queue acceptance, never a fabricated completed-sync state.

- [done] expose the canonical `site-items/sync_vk` request from the new `useSkladApi` boundary;
- [done] expose `site_items_sync_vk` through the new access adapter;
- [done] add a design-system action to the new site-items catalog;
- [done] confirm the action before sending the trigger;
- [done] show loading, success, and failure states without calling legacy pages/controllers;
- [done] verify the request uses the canonical endpoint and the backend permission check;
- [done] run focused syntax checks and Chrome smoke coverage, including the permitted positive trigger path.

## 2. Confirmed follow-up parity gaps

Status: suspended in this module. The warehouse implementation remains intact but its top-level tab declaration is commented out: the task chat clarifies that `sklad_items_module_new` remains a separate module and is not part of this consolidation.

The warehouse flags and their permissions remain effective in `sklad_items_module_new`; do not migrate their behavior into the consolidated shell while this suspension stands.

- [deferred] restore warehouse-editor controls for `w_pf`, `w_trash`, `w_item`, and `two_user`; do this in `sklad_items_module_new`, not this consolidated shell;
- [deferred] restore warehouse-editor controls for `honest_sign` and `mercury`; do this in `sklad_items_module_new`, not this consolidated shell;
- [deferred] reconcile warehouse-editor permission groups; retain this work in `sklad_items_module_new`;
- [done] resolve the VK wording in the current module plan: this action enqueues external work and does not report worker completion;
- [done] document queue acknowledgement (`queued` / `already_queued`) instead of claiming completed VK synchronization;
- [done] review historical-dictionary fallback behavior: legacy history also resolves units, tags and category labels from current dictionaries when no historical dictionary snapshot exists; the canonical fallback preserves that limitation and documents it instead of fabricating past names.

## 2.1. Audit: legacy-to-composite closure

Status: completed on local runtime.

- [done] rechecked `recept_module_new_2`, `site_items_new` and `ed_izmer` against composite routes, editor flows, archive/delete/history actions and field-level access;
- [done] confirmed `sklad_items_module_new` stays standalone; its tab remains commented out and its warehouse flags/permissions stay effective there;
- [done] ran `sklad:sync-access --dry-run`: 77 desired target groups, 77 existing target groups, no stale groups, pruning disabled;
- [done] ran focused Sklad backend coverage: 86 tests, 282 assertions;
- [done] reconciled FE API, migration map, access handoff, README and test report with the live VK queue action and hidden cross-entity archive decision.

## 3. Retained but intentionally unexposed: cross-entity archive

Status: retained in code for reference; do not add it to the top-level tab set without a separately accepted audit/search requirement.

`archive/SkladArchiveTab` and its controller currently remain in the module, but are deliberately absent from `SKLAD_TAB_DEFINITIONS`.

Reasons:

- archive semantics are not uniform: recipes, semi-finished products and site items can be archived through their activity state; warehouse items, units and categories do not support archive persistence;
- rows would mix incompatible fields, detail dialogs, restore flows and field-level access rules;
- entity-local archive/status filters preserve the user's current context and give the correct action contract;
- detailed history is already available from the relevant entity dialogs, where revision data can be rendered safely.

Reconsider a global view only if a confirmed business workflow needs cross-entity audit/search. Such a screen must require an entity-type selection first and define a common minimal row contract, filtering, permissions and restore behavior before it is exposed.

## 4. Constraints

- new FE code must use `useSkladApi`, `useSkladAccess`, and design-system primitives;
- no calls to legacy controllers, legacy page methods, or legacy route wrappers;
- `sklad_items_module_new` is a standalone module for now: keep its implementation intact, but leave the "Товары склада" tab declaration commented out in the consolidated `sklad_items` shell until that decision changes;
- site-item editor modal remains the existing compatibility-preserving modal;
- completed items remain in this file and are marked `done`; no plan item is deleted.

## 5. Completion log

- [done] plan created before implementation.

## 6. Design-system control migration

Status: in progress. Preserve the existing API payloads, field-level access and modal flows; this is a control-layer replacement, not a business-flow redesign.

- [in progress] establish DS control parity and stories for any missing reusable behavior before feature rewiring;
- [in progress] replace controls in the simple production/unit dialogs: buttons, text inputs, selects and dialog shell/actions;
- [todo] migrate the production editor and view dialogs, including date, duration, checkbox, relation-autocomplete and inner tabs;
- [todo] migrate the active site-item compatibility modal without changing its data contract, sections, staged composition behavior or permissions;
- [todo] migrate history, category/tag and archive dialog controls, then the retained warehouse editor code;
- [todo] replace remaining direct legacy `ui/*` imports in `components/sklad_items` and record any deliberately retained non-control compatibility boundary;
- [todo] add/extend DS stories for each new primitive and verify desktop UI parity in local Chrome.
