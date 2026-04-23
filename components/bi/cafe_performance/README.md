## UI draft

USE FOR REFERENCE https://aroma-stats.lovable.app/
then create similar ui using project existing tools.
use TabPanel and ui/Forms components, use MUI7, zustand, amcharts, custom project hooks (if needed).
Do not useEffect dep on api_laravel.

## API Shapes

All successful endpoints are wrapped by the controller into a top-level object with `st: true`.

Error shape:

```json
{
  "st": false,
  "text": "point_list is required"
}
```

# CafePerformance FE API Instruction

Use the backend period payload as the source of truth for the date shown near the `day / week / month` switch.

## Bootstrap

Read `defaults` from `POST /api/cafe_performance/get_all`.

Important fields:

- `defaults.period_type`
- `defaults.date`
- `defaults.date_start`
- `defaults.date_end`
- `defaults.period_label`
- `period_presets[]`

`period_presets[]` is ready for the switch UI:

```json
[
  {
    "period_type": "day",
    "date": "2026-04-10",
    "date_start": "2026-04-10",
    "date_end": "2026-04-10",
    "period_label": "10.04.2026",
    "is_single_day": true
  },
  {
    "period_type": "week",
    "date": "2026-04-10",
    "date_start": "2026-04-06",
    "date_end": "2026-04-12",
    "period_label": "06.04.2026 - 12.04.2026",
    "is_single_day": false
  }
]
```

## Screen Requests

Send explicit dates in every screen request.

Preferred request shape:

```json
{
  "data": {
    "period_type": "week",
    "date_start": "2026-04-06",
    "date_end": "2026-04-12",
    "point_list": [{ "id": 1 }],
    "category_ids": [],
    "stage_type": "PACK"
  }
}
```

Do not rely on `period_type` alone for display. The UI should render the date from the API response.

## Screen Responses

Read the visible period from `meta.period`:

- `meta.period.label`
- `meta.period.date_start`
- `meta.period.date_end`
- `meta.period.is_single_day`

Example:

```json
{
  "meta": {
    "period": {
      "type": "week",
      "date_start": "2026-04-06",
      "date_end": "2026-04-12",
      "label": "06.04.2026 - 12.04.2026",
      "is_single_day": false
    }
  }
}
```

## FE Change Required

For the Lovable screen:

1. Keep the `day / week / month` switch.
2. Next to it, render `meta.period.label`.
3. When the user changes the switch, pick the matching object from `period_presets[]`.
4. Send its `date_start` and `date_end` in the next API request.
5. After response, trust `meta.period.label` instead of recomputing the text on the client.

```

FE notes:

- Treat all numeric metrics as nullable numbers.
- `remakes_per_100_items` is currently always `null`.
- `reasons_breakdown` may contain `UNKNOWN` when a negative feedback row has no selected checkbox reason.
- `complaints_by_category` only includes categories that have at least one complaint-linked item in the selected slice.
```
