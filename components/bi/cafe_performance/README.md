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

### Bootstrap

Endpoint:

- `bi_cafe_performance/get_all`

Request body:

```json
{
  "data": {}
}
```

Response shape:

```json
{
  "st": true,
  "module_info": {},
  "points": [
    {
      "id": 1,
      "name": "Point name",
      "city_id": 1,
      "base": "jaco_rolls_1"
    }
  ],
  "access": [],
  "period_types": [
    { "id": "day", "name": "Day" },
    { "id": "week", "name": "Week" },
    { "id": "month", "name": "Month" }
  ],
  "stage_types": [
    { "id": "ROLL", "name": "Крутка" },
    { "id": "OVEN", "name": "Печь" },
    { "id": "PACK", "name": "Упаковка" }
  ],
  "order_types": [
    { "id": "DELIVERY", "name": "Доставка", "source_ids": [1] },
    { "id": "TAKEAWAY", "name": "Самовывоз", "source_ids": [2] },
    { "id": "HALL", "name": "Зал", "source_ids": [3, 4] }
  ],
  "categories": [{ "id": 9, "name": "Category", "type_cat": 0 }],
  "defaults": {
    "period_type": "day",
    "date": "2026-04-08",
    "stage_type": "PACK",
    "point_list": [
      {
        "id": 1,
        "name": "Point name",
        "city_id": 1,
        "base": "jaco_rolls_1"
      }
    ]
  }
}
```

### Screen Request

Endpoints:

- `bi_cafe_performance/get_dashboard`
- `bi_cafe_performance/get_kitchen`
- `bi_cafe_performance/get_leaders`
- `bi_cafe_performance/get_quality`
- `bi_cafe_performance/get_delivery`

Shared request body:

```json
{
  "data": {
    "period_type": "day",
    "date": "2026-04-08",
    "point_list": [{ "id": 1 }],
    "category_ids": [9, 10, 14],
    "stage_type": "PACK"
  }
}
```

Request notes:

- `date` is required.
- `point_list` is required and must contain at least one allowed point id.
- `period_type` supports `day`, `week`, `month`.
- `category_ids` is optional. Empty means all categories.
- `stage_type` is only used by kitchen, but the backend accepts it in the shared payload.

Shared `meta` block in screen responses:

```json
{
  "meta": {
    "period": {
      "type": "day",
      "date": "2026-04-08",
      "start_date": "2026-04-08",
      "end_date": "2026-04-08"
    },
    "previous_period": {
      "start_date": "2026-04-07",
      "end_date": "2026-04-07"
    },
    "points": [{ "id": 1, "name": "Point name" }],
    "generated_at": "2026-04-08T12:00:00+03:00",
    "warnings": [
      "SLA thresholds are provisional hardcoded defaults for the first backend version.",
      "Remake metrics are not backed by a confirmed production source yet and return null.",
      "Stage mapping currently assumes stage_1=ROLL, stage_2=OVEN, stage_3=PACK."
    ]
  }
}
```

### Dashboard Response

```json
{
  "st": true,
  "summary": {
    "sla_position": 92.15,
    "sla_order": 88.4,
    "p50_position": 742.0,
    "complaints_per_100_orders": 1.73
  },
  "category_cards": [
    {
      "category_id": 9,
      "category_name": "Роллы",
      "p50": 680.0,
      "p90": 1180.0,
      "sla": 93.22,
      "sample_size": 421
    }
  ],
  "sla_by_category": [
    {
      "category_id": 9,
      "category_name": "Роллы",
      "sla": 93.22,
      "sample_size": 421
    }
  ],
  "channel_summary": [
    {
      "order_type": "DELIVERY",
      "p50": 2140.0,
      "p90": 3620.0,
      "sla": 86.91,
      "count": 188
    }
  ],
  "meta": {}
}
```

### Kitchen Response

```json
{
  "st": true,
  "stage_summary": {
    "stage_type": "PACK",
    "p50": 97.0,
    "p90": 201.0,
    "sla": 90.18,
    "share_long_stage_percent": 3.74,
    "count": 512
  },
  "best_employee_cards": [
    {
      "id": "fastest_employee",
      "employee_id": 17,
      "employee_name": "Иван",
      "stage_type": "PACK",
      "metric": "p50",
      "value": 84.0,
      "sample_size": 96
    }
  ],
  "employee_table": [
    {
      "employee_id": 17,
      "employee_name": "Иван",
      "stage_type": "PACK",
      "p50": 84.0,
      "p90": 166.0,
      "sla": 94.79,
      "stability": 97.92,
      "share_long_stage_percent": 2.08,
      "sample_size": 96,
      "is_valid_for_rating": true
    }
  ],
  "meta": {}
}
```

### Leaders Response

```json
{
  "st": true,
  "top_employee_cards": [
    {
      "employee_id": 17,
      "employee_name": "Иван",
      "stage_type": "PACK",
      "p50": 84.0,
      "p90": 166.0,
      "sla": 94.79,
      "stability": 97.92,
      "share_long_stage_percent": 2.08,
      "sample_size": 96,
      "is_valid_for_rating": true
    }
  ],
  "cafe_ranking": [
    {
      "point_id": 1,
      "point_name": "Point name",
      "p50": 742.0,
      "p90": 1298.0,
      "sla": 91.4,
      "sample_size": 512,
      "is_valid_for_rating": true,
      "score": 79.03
    }
  ],
  "meta": {}
}
```

### Quality Response

```json
{
  "st": true,
  "summary": {
    "complaints_per_100_orders": 1.73,
    "complaints_per_100_items": 0.98,
    "remakes_per_100_items": null,
    "anomaly_share_percent": 4.11
  },
  "reasons_breakdown": [
    {
      "reason_code": "ice_item",
      "count": 7,
      "share_percent": 26.92
    }
  ],
  "complaints_by_category": [
    {
      "category_id": 9,
      "category_name": "Роллы",
      "complaints_per_100_items": 1.21,
      "complaints_count": 5,
      "item_count": 412
    }
  ],
  "anomalies_by_stage_category": [
    {
      "stage_type": "PACK",
      "category_id": 9,
      "category_name": "Роллы",
      "count": 210,
      "long_count": 8,
      "share_long_stage_percent": 3.81
    }
  ],
  "meta": {}
}
```

### Delivery Response

```json
{
  "st": true,
  "overall": {
    "p50": 1180.0,
    "p90": 2440.0,
    "sla": 87.22,
    "count": 188
  },
  "channel_cards": [
    {
      "order_type": "DELIVERY",
      "p50": 1180.0,
      "p90": 2440.0,
      "sla": 87.22,
      "count": 188
    }
  ],
  "trend": [
    {
      "date": "2026-04-08",
      "order_type": "DELIVERY",
      "p50": 1180.0,
      "count": 188
    }
  ],
  "meta": {}
}
```

FE notes:

- Treat all numeric metrics as nullable numbers.
- `remakes_per_100_items` is currently always `null`.
- `reasons_breakdown` may contain `UNKNOWN` when a negative feedback row has no selected checkbox reason.
- `complaints_by_category` only includes categories that have at least one complaint-linked item in the selected slice.
