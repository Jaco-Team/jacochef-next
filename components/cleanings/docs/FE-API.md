# Cleanings Frontend API Contract

## Purpose

This document describes the API contract required by the new `/cleanings` frontend module.

It is intentionally written from the frontend integration side. Backend can adjust the migration plan and internal implementation as needed, but the external contract below is what the new frontend should consume.

This is not a request to expose old modules 1:1 to the new page. Legacy compatibility is still needed during migration, but the new frontend should be wired to a normalized `cleanings` contract instead of stitching together five legacy contracts in the browser.

## Scope

The new `/cleanings` module combines:

- cleaning templates
- cleaning categories
- cleaning assignment to cafes
- cleaning control
- preparation control

Legacy modules being migrated:

- `app_work`
- `cat_work`
- `app_work_show`
- `app_work_point`
- `check_works`

## Integration rule

Backend should support two layers during migration:

1. `Legacy compatibility layer`
   - keeps old contracts available for safe migration and regression checks
   - can live under old routes and/or mirrored `cleanings` compatibility routes

2. `New frontend layer`
   - the contract described in this file
   - this is the contract the new `/cleanings` page should use

The new frontend should not depend directly on raw legacy response shapes such as:

- `items` + `items_min`
- `all_work` + `this_work`
- `work` + `pf_list`
- mixed `point_id` object/id payloads

Backend should adapt legacy data into normalized objects for the new module.

## Why the old plan is not enough

The migration plan already maps routes and legacy request/response contracts. That is useful, but insufficient for the new frontend because the new UI state is organized around:

- `templates`
- `categories`
- `locations`
- `controlItems`
- `preparationItems`

The new frontend also expects fields and behaviors that do not match old module boundaries exactly:

- `locationIds` live on template objects in the new UI, while old assignment data comes from `app_work_point`
- template create/edit combines template settings, schedule settings, and point assignment concerns
- category delete is present in the new UI flow, but no old delete endpoint exists
- template history and category history are present in the new UI surface
- control and preparation views are shown under one module and should be loadable with one normalized response

Because of that, backend should expose a frontend-facing facade instead of forcing FE to call five old-style APIs and merge them manually.

## Required endpoint groups

Recommended external grouping:

- `/cleanings/bootstrap/*`
- `/cleanings/templates/*`
- `/cleanings/categories/*`
- `/cleanings/cafes/*`
- `/cleanings/control/*`
- `/cleanings/history/*`

This grouping matches the new UI better than:

- `/cleanings/times/*`
- `/cleanings/view/*`
- `/cleanings/points/*`
- `/cleanings/checks/*`

Backend may keep those migration groups internally or as compatibility routes, but they should not be the primary contract for the new frontend.

## Primary load strategy

The new UI should not call several legacy-style `get_all` endpoints on first render.

Frontend bootstrap should be split into:

1. one shared initial load for module-wide state
2. one filtered load for control operational data
3. on-demand history loads

That means the new module should expose a primary initial endpoint:

- `GET /cleanings/get_all`

This endpoint should consolidate only the data the current UI actually needs across:

- templates
- categories
- cafes
- shared dictionaries and permissions

It should not preload operational datasets that are date-bound or potentially large:

- cleaning control rows
- preparation control rows
- history rows

## What the initial `get_all` replaces

The shared initial contract should cover only the parts of old modules that the new UI consumes:

- from `app_work`:
  - template list
  - template edit fields
  - roles
  - categories for selection
  - schedule/timing fields
- from `cat_work`:
  - category list
  - category instruction field
- from `app_work_point`:
  - location list
  - template assignment to locations, normalized as `locationIds`
- from `check_works/get_all`:
  - access flags only if they still affect the UI

The new initial contract does not need to mirror these old screen payloads:

- `app_work_show/*`
- `app_work_point/get_works`
- `check_works/get_data`
- `check_works/get_add_work`

## Common response envelope

Preferred response envelope for the new frontend:

```json
{
  "st": true,
  "text": "",
  "data": {}
}
```

Notes:

- `st` and `text` are kept because they align with the existing project style.
- For list/context endpoints, useful payload should be inside `data`.
- For mutation endpoints, return the updated entity or updated screen slice where practical.
- Legacy compatibility endpoints can keep their original top-level shape if needed.

## Normalized entities

### Template

```json
{
  "id": 1,
  "name": "Уборка горячего цеха",
  "categoryId": 1,
  "role": "Повар",
  "duration": 45,
  "confirmation": true,
  "scheduleType": "every_day",
  "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  "times": ["22:00"],
  "deleteTimes": ["23:00"],
  "activationCount": 1,
  "additionType": "single_active",
  "triggerCleaningId": null,
  "locationIds": [1, 2, 4],
  "status": "active"
}
```

Required notes:

- `categoryId` must be a scalar id.
- `role` should already be the display value expected by FE.
- `roleId` is not required by FE and should not replace `role` in the external contract.
- If backend needs `app_id` internally, it should resolve it server-side from the submitted `role`.
- `scheduleType` must be explicit in the new contract. FE should not derive it from old `dow` alone.
- `deleteTimes` must be present even if empty.
- `locationIds` must be present on every template object.
- `status` must be explicit as `active` or `archive`.

### Category

```json
{
  "id": 1,
  "name": "Кухня",
  "instruction": "<p>...</p>",
  "templatesCount": 4,
  "deletable": false
}
```

Required notes:

- `instruction` is the field FE edits and renders.
- `deletable` is strongly preferred so FE does not guess whether delete is allowed.

### Location

```json
{
  "id": 1,
  "name": "Центральный",
  "city": "Москва"
}
```

### Control item

```json
{
  "id": 101,
  "cleaningId": 1,
  "locationId": 1,
  "date": "2026-06-15",
  "employee": "А. Иванова",
  "startedAt": "12:00",
  "finishedAt": "12:14",
  "confirmedAt": "12:20",
  "confirmer": "Беседина Г. М.",
  "status": "pending"
}
```

Allowed `status` values expected by FE:

- `active`
- `in_progress`
- `pending`
- `approved`

### Preparation item

```json
{
  "id": 201,
  "name": "Лосось, стейки",
  "locationId": 1,
  "preparedAt": "2026-06-15 13:17:39",
  "volume": "21.283",
  "waste": "2.342",
  "unit": "кг.",
  "employee": "Рыцарев И. Ю.",
  "helper": "",
  "confirmedAt": "2026-06-15 14:16:30",
  "confirmer": "Беседина Г. М.",
  "status": "approved"
}
```

### History item

```json
{
  "id": "tmpl-1-1",
  "created_at": "2026-06-12T14:20:00",
  "actor_name": "Винокуров М. Ю.",
  "event_type": "update",
  "diff_json": "{\"Название\":{\"from\":\"\",\"to\":\"...\"}}"
}
```

This shape should match what `HistoryLog` already consumes.

## Endpoint contract

## 1. Initial module load

### `GET /cleanings/get_all`

Purpose:

- initial shared state for the whole cleanings module
- single bootstrap request for the existing templates/categories/cafes UI scope
- shared context request for control routes before filter-based control loading

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "module_info": {
      "name": "Уборки"
    },
    "locations": [],
    "roles": [],
    "scheduleTypeOptions": [],
    "additionTypeOptions": [],
    "templates": [],
    "categories": [],
    "access": {
      "canEditTemplates": true,
      "canEditCategories": true,
      "canAssignCafes": true,
      "canCheckCleanings": true,
      "canCheckPreparations": true
    }
  }
}
```

Notes:

- `roles`, `scheduleTypeOptions`, `additionTypeOptions` may be static on backend, but FE should receive them from API.
- This endpoint should remove the need for FE hardcoded `locations` and enums.
- `templates` must already include `locationIds`, so FE does not need a second request to build cafe assignment state.
- `categories` must already include `instruction`, `templatesCount`, and preferably `deletable`.
- This endpoint should not include control rows, preparation rows, or history.

### Optional split form

Backend may still keep separate internal endpoints such as:

- `GET /cleanings/bootstrap`
- `GET /cleanings/templates`
- `GET /cleanings/categories`

But for the current frontend, `GET /cleanings/get_all` should exist and return the combined initial payload above.

## 2. Templates

### `GET /cleanings/templates`

Purpose:

- load template list for the main tab
- provide enough data for cafes tab and manual add flow without extra per-row calls

Query params:

- `status`: `active | archive | all` optional
- `search`: optional

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "templates": []
  }
}
```

### `GET /cleanings/templates/{id}`

Purpose:

- load one template for edit dialog

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "template": {}
  }
}
```

### `POST /cleanings/templates`

Purpose:

- create template

Request:

```json
{
  "name": "Уборка горячего цеха",
  "categoryId": 1,
  "role": "Повар",
  "duration": 45,
  "confirmation": true,
  "scheduleType": "every_day",
  "days": ["mon", "tue"],
  "times": ["22:00"],
  "deleteTimes": ["23:00"],
  "activationCount": 1,
  "additionType": "single_active",
  "triggerCleaningId": null,
  "locationIds": [1, 2]
}
```

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "data": {
    "template": {}
  }
}
```

### `PUT /cleanings/templates/{id}`

Purpose:

- update template

Request shape:

- same as create

### `POST /cleanings/templates/{id}/status`

Purpose:

- archive/unarchive template

Request:

```json
{
  "status": "archive"
}
```

Response:

- return updated template

### `GET /cleanings/templates/manual-available`

Purpose:

- list templates available for manual addition in control flow

Query params:

- `locationId`
- optional `search`

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "templates": []
  }
}
```

Notes for backend:

- New FE should not be forced to call old `app_work/get_all`, old `app_work/get_one`, and old `app_work_point/get_works` just to build a usable template object.
- Backend should compose `locationIds` into template payloads.
- If old storage model does not have `archive`, define the mapping explicitly and keep it stable.

## 3. Categories

### `GET /cleanings/categories`

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "categories": []
  }
}
```

### `POST /cleanings/categories`

Request:

```json
{
  "name": "Кухня",
  "instruction": "<p>...</p>"
}
```

### `PUT /cleanings/categories/{id}`

Request:

- same as create

### `DELETE /cleanings/categories/{id}`

Purpose:

- delete category only if no linked templates exist

Response on blocked delete:

```json
{
  "st": false,
  "text": "Категория используется в уборках"
}
```

Important:

- If backend does not want to support delete in phase 1, that must be stated explicitly and FE delete action should be disabled.
- Silent omission is not acceptable because the new UI already exposes delete flow.

## 4. Cafes / assignments

### `GET /cleanings/cafes/{locationId}/templates`

Purpose:

- load templates assigned to a cafe

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "templates": []
  }
}
```

### `GET /cleanings/cafes/{locationId}/templates/available`

Purpose:

- load templates that can be added to this cafe

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "templates": []
  }
}
```

### `POST /cleanings/cafes/{locationId}/templates/{templateId}`

Purpose:

- assign template to cafe

### `DELETE /cleanings/cafes/{locationId}/templates/{templateId}`

Purpose:

- remove template from cafe

Notes for backend:

- This is a better FE contract than exposing old full replacement `app_work_point/save`.
- Backend can still implement this through old sync logic internally.

## 5. Control screen

### `GET /cleanings/control`

Purpose:

- load both cleaning control and preparation control data for selected filters
- this is intentionally separate from `get_all`

Query params:

- `locationId`
- `dateFrom`
- `dateTo`

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "cleanings": [],
    "preparations": [],
    "manualTemplates": [],
    "permissions": {
      "canApproveCleanings": true,
      "canApprovePreparations": true,
      "canEditPreparations": true
    }
  }
}
```

Notes:

- FE currently renders cleanings and preparations in parallel under one module.
- Returning both slices together is preferred over two unrelated legacy fetch chains.
- Existing UI still needs the shared dictionaries/templates/categories from `GET /cleanings/get_all`.

### `POST /cleanings/control/manual-cleanings`

Purpose:

- manually add a cleaning to control list

Request:

```json
{
  "templateId": 1,
  "locationId": 1,
  "date": "2026-06-15"
}
```

Response:

- return created control item

### `POST /cleanings/control/cleanings/{id}/approve`

### `POST /cleanings/control/cleanings/{id}/return`

### `POST /cleanings/control/cleanings/{id}/detach`

### `POST /cleanings/control/cleanings/{id}/delete`

Request for delete:

```json
{
  "reason": "string"
}
```

Notes:

- `return` is required by the new UI.
- Old `check_works` contracts do not clearly expose a dedicated return action, so backend needs to define the mapping.
- `detach` should reset employee/start/finish/confirm data and move item to `active`, matching current FE behavior.

### `PUT /cleanings/control/preparations/{id}`

Purpose:

- edit preparation counts

Request:

```json
{
  "volume": "21.283",
  "waste": "2.342"
}
```

### `POST /cleanings/control/preparations/{id}/approve`

### `POST /cleanings/control/preparations/{id}/delete`

Request for delete:

```json
{
  "reason": "string"
}
```

## 6. History

### `GET /cleanings/history/templates/{id}`

### `GET /cleanings/history/categories/{id}`

Response:

```json
{
  "st": true,
  "text": "",
  "data": {
    "history": []
  }
}
```

Notes:

- FE already has history surfaces for templates and categories.
- If real history is unavailable in phase 1, backend should explicitly return empty arrays, not omit the endpoint.

## Legacy compatibility requirements

Backend migration still needs contract-safe copies of old modules for regression comparison.

Recommended compatibility routes:

- `/cleanings/legacy/app_work/*`
- `/cleanings/legacy/cat_work/*`
- `/cleanings/legacy/app_work_show/*`
- `/cleanings/legacy/app_work_point/*`
- `/cleanings/legacy/check_works/*`

Reason:

- avoids naming confusion between new FE contract and mirrored old APIs
- keeps `/cleanings/*` available for the normalized frontend-facing API

If backend prefers not to add mirrored compatibility routes, old original routes must stay alive until the new frontend is fully switched and verified.

## Known migration mismatches to resolve explicitly

These points are settled for the frontend contract and should be implemented as follows:

### 1. `status` mapping

New FE expects:

- `active`
- `archive`

Old logic exposes booleans such as `is_active`.

Required mapping:

- `is_active = 1` -> `status = active`
- `is_active = 0` -> `status = archive`

For write operations:

- `status = active` -> persist `is_active = 1`
- `status = archive` -> persist `is_active = 0`

### 2. `scheduleType` mapping

New FE expects explicit semantic values:

- `mon`
- `tue`
- `wed`
- `thu`
- `fri`
- `sat`
- `sun`
- `other`
- `every_day`
- `every_day_shift_end`
- `manual`
- `after_cleaning`

Old logic stores `dow`, `type_time`, linked work ids, open times, and close times across multiple fields.

Required mapping:

- `dow = 1..7` -> `scheduleType = mon..sun`
- `dow = 10` -> `scheduleType = other`
- `dow = 11` -> `scheduleType = every_day`
- `dow = 12` -> `scheduleType = every_day_shift_end`
- `dow = 13` -> `scheduleType = manual`
- `dow = 14` -> `scheduleType = after_cleaning`

Additional rules:

- `triggerCleaningId` is required when `scheduleType = after_cleaning` and maps from legacy `work_id`.
- `days` is only used when FE sends a custom multi-day schedule in the future. In phase 1 backend may return an empty array for every schedule except the literal weekday represented by `dow = 1..7`.
- `times` maps from legacy `times_add[*].time_action`.
- `deleteTimes` maps from legacy `times_close`. Return `[]` when empty, otherwise `[times_close]`.

`additionType` mapping is also fixed:

- `type_time = 0` -> `additionType = other`
- `type_time = 1` -> `additionType = single_active`
- `type_time = 2` -> `additionType = unlimited`

### 3. `locationIds` composition

New FE expects template assignment inline on template objects.

Backend must compose this from point-assignment storage.

### 4. role field

External FE contract should use:

- `role` as display text

Do not require FE to submit `roleId` in phase 1.

Reason:

- the current cleanings UI stores and filters by role label
- old legacy APIs already expose role names such as `app_name`
- adding `roleId` as a required FE field creates unnecessary migration coupling

Backend may additionally return `roleId` for internal/debug use, but FE wiring should not depend on it.

### 5. confirmation mapping

Legacy booleans in this area have different meanings:

- `is_not_del` = "do not delete at shift end"
- `is_need` = "required on special day"

Neither of those is the new FE `confirmation` flag.

Required FE contract:

- `confirmation` must be a dedicated boolean returned explicitly by backend.
- Do not derive `confirmation` from `is_need`.
- Do not derive `confirmation` from `is_not_del`.

If no legacy field exists for this semantics, backend should:

- use a new persisted field if available

or

- return `false` consistently in phase 1 and treat it as unsupported until persistence is added

What backend should not do:

- silently map `is_need` -> `confirmation`
- silently map `is_not_del` -> `confirmation`

### 6. category delete

New FE has delete flow with linked-template blocking.

Required phase 1 behavior:

- implement `DELETE /cleanings/categories/{id}` as a guarded delete
- if category has linked templates, reject with `st = false` and a clear message
- if category is unlinkable and safe to remove, delete it

Do not soft-delete categories unless there is an existing domain requirement for restoring them. FE does not currently model category archive state.

Also return `deletable` in category list/detail payloads so FE can disable the action proactively.

### 7. control return action

New FE expects a distinct return action from pending back to in-progress.

Required phase 1 behavior:

- `POST /cleanings/control/cleanings/{id}/return` should map to legacy `clear_work`

Reason:

- legacy `clear_work` is the only existing operation that resets a cleaning unless it is already manager-confirmed or deleted
- FE uses return exactly as a reset from reviewed/pending state back into active execution flow

Normalized FE status expectation after success:

- return the updated item with `status = in_progress` if the cleaning had already started
- otherwise return `status = active`

If legacy `clear_work` cannot reliably distinguish those states after reset, backend should still expose the endpoint and return the normalized status it chooses explicitly.

### 8. history endpoints

New FE should not build fake history once backend integration starts.

Required phase 1 behavior:

- expose both history endpoints
- if real history exists, return it in `HistoryLog` shape
- if real history does not exist yet, return `history: []`

Do not omit the endpoint and do not return ad hoc placeholder rows.

## What backend can keep from the migration plan

These parts of the current plan are good and should stay:

- service split by bounded legacy area
- thin controller, logic in services
- keeping legacy routes alive during migration
- preserving old payloads for compatibility checks
- comparing old and new outputs on the same inputs

## What should change in the migration plan

Recommended adjustments:

1. Add a separate section called `Frontend-facing cleanings contract`.
2. Treat current `/cleanings/times|view|points|checks` grouping as compatibility or internal migration structure, not as the final FE contract.
3. Add explicit normalized entity definitions.
4. Add explicit decision points for `archive`, `scheduleType`, `locationIds`, category delete, control return, and history.
5. Prefer facade endpoints for the new page over raw legacy-shaped endpoints.

## Acceptance criteria for backend handoff

Frontend can rewire off mocks when all items below are true:

1. `/cleanings/bootstrap` returns dictionaries and locations needed by the new page.
2. `/cleanings/templates` returns normalized template objects including `locationIds`.
3. `/cleanings/categories` returns normalized categories including `instruction`.
4. cafe assignment endpoints exist and do not require FE to send full legacy replacement payloads.
5. `/cleanings/control` returns both cleaning and preparation slices in one normalized response.
6. template and category history endpoints return arrays compatible with `HistoryLog`.
7. backend documents exact mappings for legacy fields that do not have direct equivalents.
8. old endpoints remain available until the new page is verified against real data.
