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
- [ ] review documented historical-dictionary fallback behavior for history and compare screens.

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
