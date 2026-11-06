# Competitor Parsers FE Prompt

Build a simple internal admin UI for Competitor Parsers.

Use backend routes under `/api/competitor_parsers`.

Main goal:

- show available competitor parser sources
- show latest run status per source
- show found item count for latest run
- let the user open a modal for one competitor and inspect last run items

Important:

- do not build a matrix
- do not preload all parsed items for all competitors
- main page must stay lightweight
- load item rows only when user opens a modal

## Main Page

Show one compact table or list of sources.

Per source show:

- `name`
- `competitor`
- `city`
- `parser`
- `is_enabled`
- `last_run.status`
- `last_run.item_count`
- `last_run.error_count`
- `last_run.snapshot_date`
- `base_url`
- optional `notes`

Per source actions:

- `View items`
- `Run`
- `Export`

## Modal

When user clicks `View items`, open a modal and request the last stored run items for that source.

Modal header should show:

- source name
- competitor
- city
- parser
- run status
- snapshot date
- item count
- error count

Modal table should show:

- `dish_name`
- `category`
- `final_price`
- `price`
- `list_price`
- `discount`
- `weight`
- `composition`
- `product_url`

Keep it simple.

## Routes

### 1. Load main page

Route:

- `ANY /api/competitor_parsers/get_all`

Recommended request:

```json
{
  "data": {
    "enabled_only": true
  }
}
```

Optional request fields:

- `enabled_only`
- `city`
- `source_codes`

Response fields:

- `st`
- `sources`

Each `sources[]` item contains:

- `id`
- `code`
- `name`
- `competitor`
- `city`
- `base_url`
- `parser`
- `is_enabled`
- `notes`
- `settings`
- `last_run`

`last_run` can be `null`.

If `last_run` is not null, it contains:

- `source_id`
- `source_code`
- `snapshot_date`
- `status`
- `item_count`
- `error_count`
- `fetched_at`

Example response:

```json
{
  "st": true,
  "sources": [
    {
      "id": 1,
      "code": "fuji_samara",
      "name": "Fuji Samara",
      "competitor": "Fuji",
      "city": "Samara",
      "base_url": "https://fuji.ru/samara/",
      "parser": "fuji_api",
      "is_enabled": true,
      "notes": null,
      "settings": null,
      "last_run": {
        "source_id": 1,
        "source_code": "fuji_samara",
        "snapshot_date": "2026-04-06",
        "status": "completed",
        "item_count": 123,
        "error_count": 0,
        "fetched_at": "2026-04-06T12:00:00"
      }
    }
  ]
}
```

Behavior:

- use this endpoint only for the main list
- do not expect item rows here

### 2. Load last run items for modal

Route:

- `ANY /api/competitor_parsers/get_last_run_items`

Minimal request:

```json
{
  "data": {
    "source_code": "fuji_samara"
  }
}
```

Optional request with explicit snapshot and limit:

```json
{
  "data": {
    "source_code": "fuji_samara",
    "snapshot_date": "2026-04-06",
    "limit": 500
  }
}
```

Request fields:

- `source_code` required
- `snapshot_date` optional
- `limit` optional

Response fields:

- `st`
- `source`
- `run`
- `items`

`source` contains:

- `id`
- `code`
- `name`
- `competitor`
- `city`
- `base_url`
- `parser`
- `is_enabled`
- `notes`

`run` is either `null` or contains:

- `source_id`
- `source_code`
- `snapshot_date`
- `status`
- `item_count`
- `error_count`
- `fetched_at`

Each `items[]` row contains:

- `id`
- `source_item_id`
- `dish_name`
- `category`
- `price`
- `final_price`
- `list_price`
- `discount`
- `currency`
- `weight`
- `composition`
- `product_url`
- `fetched_at`

Example response:

```json
{
  "st": true,
  "source": {
    "id": 1,
    "code": "fuji_samara",
    "name": "Fuji Samara",
    "competitor": "Fuji",
    "city": "Samara",
    "base_url": "https://fuji.ru/samara/",
    "parser": "fuji_api",
    "is_enabled": true,
    "notes": null
  },
  "run": {
    "source_id": 1,
    "source_code": "fuji_samara",
    "snapshot_date": "2026-04-06",
    "status": "completed",
    "item_count": 123,
    "error_count": 0,
    "fetched_at": "2026-04-06T12:00:00"
  },
  "items": [
    {
      "id": 10,
      "source_item_id": "abc",
      "dish_name": "Philadelphia",
      "category": "Rolls",
      "price": "399",
      "final_price": "349",
      "list_price": "399",
      "discount": "50",
      "currency": "RUB",
      "weight": "250 g",
      "composition": "fish, rice, cheese",
      "product_url": "https://example.com/item",
      "fetched_at": "2026-04-06T12:00:00"
    }
  ]
}
```

If source has never been parsed:

- `run` is `null`
- `items` is empty array

Show empty state like `No stored run yet`.

### 3. Run parser

Route:

- `ANY /api/competitor_parsers/run`

Run one source:

```json
{
  "data": {
    "source_code": "fuji_samara",
    "debug": false
  }
}
```

Run all:

```json
{
  "data": {
    "debug": false
  }
}
```

Response fields:

- `st`
- `runs`

Each `runs[]` item contains:

- `source_id`
- `source_code`
- `snapshot_date`
- `status`
- `item_count`
- `error_count`
- optional `meta`

After run:

- refresh `get_all`
- if modal for that source is open, refresh `get_last_run_items`

### 4. Export stored snapshot

Route:

- `ANY /api/competitor_parsers/export`

Request:

```json
{
  "data": {
    "source_code": "fuji_samara",
    "snapshot_date": "2026-04-06",
    "disk": "public"
  }
}
```

Request fields:

- `source_code` required
- `snapshot_date` optional
- `disk` optional

Response fields:

- `st`
- `export`
- `download_url`

`export` contains:

- `source_code`
- `snapshot_date`
- `disk`
- `path`
- `file_name`
- `status`

After export:

- show or open `download_url`

### 5. Optional run history

Route:

- `ANY /api/competitor_parsers/get_runs`

Request fields:

- `limit`
- `source_code`

This is optional for later history view.

## FE Flow

1. page load calls `get_all`
2. render source list
3. click `View items` calls `get_last_run_items`
4. show returned items in modal
5. click `Run` calls `run`, then refresh `get_all`
6. click `Export` calls `export`, then open or show `download_url`

## Rendering Rules

- status colors:
  - `completed` green
  - `completed_with_errors` yellow or orange
  - `failed` red
- if `last_run` is null, show `Never run`
- show `snapshot_date` as main date
- `fetched_at` is secondary info only

## Minimal Deliverable

Build exactly this if time is limited:

- one page with refresh button
- one simple source list
- one modal with last run items
- one `View items` button per source
- one `Run` button per source
- one `Export` button per source
- no matrix
- no charts
- no fuzzy matching
