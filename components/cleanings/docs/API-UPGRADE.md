# Cleanings API Upgrade

## Summary

Split the current combined `GET /cleanings/get_all` into:

- one lightweight module bootstrap request loaded once per cleanings module session
- dedicated per-subroute requests for tab-owned data

The goal is not broad API optimization now. The goal is to stop unnecessary reloads of `module_info`, `access`, dictionaries, and other stable data when navigating inside `/cleanings/*`, while keeping the existing normalized API direction intact.

## Key Changes

### 1. Fix `GET /cleanings/get_all`

Return only:

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

Rules:

- no templates
- no categories
- no control rows
- no preparations
- no history
- only stable shared context needed by multiple cleanings routes

Frontend intent:

- load this once when entering the cleanings module
- reuse it while navigating within `/cleanings`, `/cleanings/categories`, `/cleanings/cafes`, `/cleanings/control`, and control subroutes
- do not refetch it on ordinary internal tab switches unless explicitly invalidated

### 2. Move tab-owned data to dedicated routes

Keep data ownership aligned to the screen that actually uses it.

Routes to provide:

- `GET /cleanings/templates`
  - returns `{ data: { templates: [] } }`
  - normalized template objects including `locationIds`

- `GET /cleanings/categories`
  - returns `{ data: { categories: [] } }`
  - normalized category objects including `instruction`, `templatesCount`, `deletable`

- `GET /cleanings/control`
  - query: `locationId`, `dateFrom`, `dateTo`
  - returns `{ data: { cleanings: [], preparations: [], manualTemplates: [], permissions: {} } }`

- `GET /cleanings/history/templates/{id}`
- `GET /cleanings/history/categories/{id}`
  - always return `200` with `history: []` when empty

Assignment and mutation routes stay feature-specific and should continue to exist under:

- `/cleanings/templates/*`
- `/cleanings/categories/*`
- `/cleanings/cafes/*`
- `/cleanings/control/*`

### 3. Data loading contract by route

Use this ownership model:

- `/cleanings`
  - bootstrap
  - templates list

- `/cleanings/categories`
  - bootstrap
  - categories list
  - category history lazily for selected category

- `/cleanings/cafes`
  - bootstrap
  - templates list
  - categories list only if the screen still needs category labels from template data

- `/cleanings/control`
  - bootstrap
  - control payload only

- `/cleanings/control/preparations`
  - bootstrap
  - control payload only

This is not a request to micro-split everything now. It is only a request to stop bundling stable module context together with route-owned datasets.

### 4. Mutation reload rules

Use narrow reloads after mutations:

- bootstrap mutations are rare; do not reload bootstrap after ordinary tab actions
- template mutations reload templates data
- category mutations reload categories data
- cafe assignment mutations reload templates data or cafe-assignment slice
- control mutations reload control data only
- history stays lazy and on-demand only

Do not use bootstrap as the universal post-mutation refresh source.

## Contracts

### Bootstrap entity group

```json
{
  "module_info": {},
  "locations": [],
  "roles": [],
  "scheduleTypeOptions": [],
  "additionTypeOptions": [],
  "access": {}
}
```

### Templates list

```json
{
  "data": {
    "templates": [
      {
        "id": 1,
        "name": "Уборка горячего цеха",
        "categoryId": 1,
        "role": "Повар",
        "duration": 45,
        "confirmation": true,
        "scheduleType": "every_day",
        "days": ["mon"],
        "times": ["22:00"],
        "deleteTimes": ["23:00"],
        "activationCount": 1,
        "additionType": "single_active",
        "triggerCleaningId": null,
        "locationIds": [1, 2],
        "status": "active"
      }
    ]
  }
}
```

### Categories list

```json
{
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Кухня",
        "instruction": "<p>...</p>",
        "templatesCount": 4,
        "deletable": false
      }
    ]
  }
}
```

### Control payload

```json
{
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

## Test Plan

- entering any cleanings route performs one bootstrap load and the route-specific data load only
- switching between cleanings subroutes does not repeatedly fetch stable bootstrap data during the same module session
- templates route works with bootstrap + templates only
- categories route works with bootstrap + categories + lazy history only
- cafes route works without requiring a giant combined response
- control routes work without loading templates/categories unless actually needed
- control mutations do not trigger bootstrap reload
- empty history returns `200` with `history: []`
- all arrays are present even when empty

## Assumptions

- there is no legacy compatibility requirement in this upgrade
- existing normalized `/cleanings/*` API direction remains correct
- no further performance optimization or deeper endpoint redesign is part of this step
- the only structural change now is splitting stable module bootstrap from route-owned data and making bootstrap reusable within the cleanings module
