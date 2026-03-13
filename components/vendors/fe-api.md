# Vendors FE Task

Use this file as the source of truth when upgrading the FE for the `vendors` module.

Scope:

- Backend routes stay unchanged.
- Payloads are sent inside `data`.
- Responses use the common legacy wrapper:
  - success: `{ st: true, ...payload }`
  - error: `{ st: false, text: string }`

Base routes:

- `POST/ANY /api/chef/vendors/get_all`
- `POST/ANY /api/chef/vendors/get_vendor_items`
- `POST/ANY /api/chef/vendors/save_vendor_items`
- `POST/ANY /api/chef/vendors/new_vendor`
- `POST/ANY /api/chef/vendors/update_vendor`
- `POST/ANY /api/chef/vendors/get_vendors`
- `POST/ANY /api/chef/vendors/get_vendor_info`

## 1. `get_all`

Purpose:

- Load module bootstrap data for the vendors screen.

Request:

```json
{
  "data": {}
}
```

Response:

```json
{
  "st": true,
  "module_info": {},
  "access": {},
  "cities": [
    { "id": -1, "name": "Все поставщики" },
    { "id": -2, "name": "Поставщики без города" },
    { "id": 1, "name": "City name", "addr": "..." }
  ],
  "vendors": [
    {
      "id": 10,
      "name": "Vendor",
      "is_show": 1,
      "is_priority": 0,
      "addr": "Address",
      "items_count": 25,
      "city_ids": [1, 2]
    }
  ]
}
```

Notes:

- `cities` is for the FE filter selector.
- `vendors` is the default list for `city = -1`.

## 2. `get_vendors`

Purpose:

- Reload vendor list for a selected city filter.

Request:

```json
{
  "data": {
    "city": -1
  }
}
```

`city` semantics:

- `-1`: all vendors
- `0`: all vendors
- `-2`: vendors without city
- `> 0`: vendors assigned to that city

Response:

```json
{
  "st": true,
  "vendors": [
    {
      "id": 10,
      "name": "Vendor",
      "is_show": 1,
      "is_priority": 0,
      "addr": "Address",
      "items_count": 25,
      "city_ids": [1, 2]
    }
  ]
}
```

Validation errors:

```json
{
  "st": false,
  "text": "The city field must be an integer."
}
```

## 3. `get_vendor_items`

Purpose:

- Load all available items plus current vendor-item links.

Request:

```json
{
  "data": {
    "vendor_id": 10
  }
}
```

Response:

```json
{
  "st": true,
  "all_items": [
    {
      "id": 100,
      "name": "Item",
      "is_show": 1
    }
  ],
  "vendor_items": [
    {
      "id": 1234,
      "item_id": 100,
      "vendor_id": 10,
      "nds": -1,
      "sort": 0,
      "item_name": "Item",
      "nds_text": "Без НДС"
    }
  ]
}
```

Notes:

- `all_items` is the catalog from `jaco_main_rolls.items`.
- `vendor_items` is from `jaco_main_rolls.vendor_items`.
- `sort` is returned and should be preserved by FE if FE edits vendor items.
- The old debug `post` field is gone and should not be expected.

Validation errors:

```json
{
  "st": false,
  "text": "The vendor id field is required."
}
```

## 4. `save_vendor_items`

Purpose:

- Replace the vendor's item set.

Request:

```json
{
  "data": {
    "vendor_id": 10,
    "items": [
      {
        "item_id": 100,
        "nds": -1,
        "sort": 0
      },
      {
        "item_id": 101,
        "nds": 20,
        "sort": 10
      }
    ]
  }
}
```

Response:

```json
{
  "st": true
}
```

Write semantics:

- Backend treats submitted `items` as the full replacement list for the vendor.
- Rows missing from the submitted list are deleted.
- Existing rows for the same `vendor_id + item_id` keep their DB `id` where possible.
- If FE does not send `sort`, backend keeps the existing `sort` for already existing rows and uses `0` for new rows.

Validation errors:

```json
{
  "st": false,
  "text": "The items.0.item id field is required."
}
```

FE requirement:

- Always send `sort` if FE allows reordering. Do not rely on backend fallback unless necessary.

## 5. `get_vendor_info`

Purpose:

- Load edit form data for one vendor.

Request:

```json
{
  "data": {
    "vendor_id": 10
  }
}
```

Response:

```json
{
  "st": true,
  "all_cities": [{ "id": 1, "name": "City", "addr": "..." }],
  "vendor_cities": [{ "id": 1, "name": "City" }],
  "vendor": {
    "id": 10,
    "name": "Vendor",
    "min_price": "1000.00",
    "inn": "123",
    "ogrn": "456",
    "addr": "Address",
    "text": "Comment",
    "bill_ex": 1,
    "need_img_bill_ex": 0,
    "bik": "123",
    "rc": "456",
    "is_show": 1,
    "is_priority": 0
  },
  "mails": [
    {
      "id": 1,
      "point_id": {
        "id": -1,
        "name": "Все точки",
        "city_id": -1
      },
      "mail": "test@example.com",
      "comment": "note"
    }
  ],
  "all_points": [
    {
      "id": -1,
      "name": "Все точки",
      "city_id": -1
    },
    {
      "id": 5,
      "name": "Point address",
      "city_id": 1
    }
  ]
}
```

Important:

- `mails[*].point_id` is an object, not a scalar id.
- `all_points[*].name` is the point address.

## 6. `new_vendor`

Purpose:

- Create a new vendor with cities and point mails.

Request:

```json
{
  "data": {
    "vendor": {
      "name": "Vendor",
      "min_price": "1000,50",
      "inn": "123",
      "ogrn": "456",
      "addr": "Address",
      "text": "Comment",
      "bill_ex": 1,
      "need_img_bill_ex": 0,
      "bik": "123",
      "rc": "456"
    },
    "vendor_cities": [{ "id": 1 }, { "id": 2 }],
    "mails": [
      {
        "point_id": { "id": -1 },
        "mail": "test@example.com",
        "comment": "note"
      }
    ]
  }
}
```

Response:

```json
{
  "st": true,
  "vendors": [
    {
      "id": 10,
      "name": "Vendor",
      "is_show": 1,
      "is_priority": 0,
      "addr": "Address",
      "items_count": 0,
      "city_ids": [1, 2]
    }
  ]
}
```

Validation / business errors:

```json
{
  "st": false,
  "text": "The vendor.name field is required."
}
```

```json
{
  "st": false,
  "text": "Поставщик с таким наименованием уже существует"
}
```

Notes:

- `min_price` may be sent as string with comma, backend normalizes it.
- Empty strings are normalized to `null` for optional text fields.

## 7. `update_vendor`

Purpose:

- Update vendor main fields, cities, and point mails.

Request:

```json
{
  "data": {
    "vendor": {
      "id": 10,
      "name": "Vendor",
      "min_price": "1000.50",
      "inn": "123",
      "ogrn": "456",
      "addr": "Address",
      "text": "Comment",
      "bill_ex": 1,
      "need_img_bill_ex": 0,
      "bik": "123",
      "rc": "456",
      "is_show": 1,
      "is_priority": 0
    },
    "vendor_cities": [{ "id": 1 }],
    "mails": [
      {
        "point_id": { "id": 5 },
        "mail": "test@example.com",
        "comment": "note"
      }
    ]
  }
}
```

Response:

```json
{
  "st": true,
  "vendors": [
    {
      "id": 10,
      "name": "Vendor",
      "is_show": 1,
      "is_priority": 0,
      "addr": "Address",
      "items_count": 25,
      "city_ids": [1]
    }
  ]
}
```

Validation errors:

```json
{
  "st": false,
  "text": "The vendor.id field is required."
}
```

Notes:

- Cities are fully replaced by the submitted list.
- Mails are fully replaced by the submitted list.

## FE upgrade checklist

1. Stop expecting `post` in `get_vendor_items`.
2. Preserve and submit `sort` in vendor item editing.
3. Keep using nested shape for `mails[*].point_id` as an object with `id`.
4. Treat `get_all.cities` as filter options, not just real DB cities.
5. Treat all backend validation/business failures as `{ st: false, text }`.
6. Do not change route names or wrapper shape in FE migration.
