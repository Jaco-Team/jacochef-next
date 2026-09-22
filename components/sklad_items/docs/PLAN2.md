# Sklad Items follow-up implementation plan

Scope: `feat/sklad_items-43371`.

This plan records the VK parity work and the other confirmed gaps found while comparing `sklad_items` with `site_items_new`, `recept_module_new_2`, `sklad_items_module_new`, and `ed_izmer`.

## 1. VK tooling in the new module

Status: completed for the new FE integration; positive click coverage awaits a local appointment with the canonical permission enabled.

- [done] expose the canonical `site-items/sync_vk` request from the new `useSkladApi` boundary;
- [done] expose `site_items_sync_vk` through the new access adapter;
- [done] add a design-system action to the new site-items catalog;
- [done] confirm the action before sending the trigger;
- [done] show loading, success, and failure states without calling legacy pages/controllers;
- [done] verify the request uses the canonical endpoint and the backend permission check;
- [done] run focused syntax checks and Chrome smoke coverage; the current local appointment correctly hides the action because `site_items_sync_vk=0`, so a positive click/request still needs access-sync data.

## 2. Confirmed follow-up parity gaps

Status: recorded for a later implementation pass

- [ ] restore warehouse-editor controls for `w_pf`, `w_trash`, `w_item`, and `two_user`;
- [ ] restore warehouse-editor controls for `honest_sign` and `mercury`;
- [ ] reconcile warehouse permission groups between legacy source appointments, target sync, backend access output, and FE visibility;
- [ ] resolve the contradictory VK statements in the historical PLAN documents after the new action is live;
- [ ] decide and document whether VK triggering should remain a manual flag or gain result/status feedback from the external integration;
- [ ] review documented historical-dictionary fallback behavior for history and compare screens.

## 3. Constraints

- new FE code must use `useSkladApi`, `useSkladAccess`, and design-system primitives;
- no calls to legacy controllers, legacy page methods, or legacy route wrappers;
- site-item editor modal remains the existing compatibility-preserving modal;
- completed items remain in this file and are marked `done`; no plan item is deleted.

## 4. Completion log

- [done] plan created before implementation.
