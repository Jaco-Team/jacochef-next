# Vendors FE Task

Use this file as the source of truth when upgrading the FE for the `vendors` module.

Scope:

- Payloads are sent inside `data`.
- Responses use the common legacy wrapper:
  - success: `{ st: true, ...payload }`
  - error: `{ st: false, text: string }`

Base routes:

- `POST/ANY /api/chef/vendors/get_all`
- `POST/ANY /api/chef/vendors/get_vendor_items`
- `POST/ANY /api/chef/vendors/save_vendor_items`
- `POST/ANY /api/chef/vendors/upload_declaration`
- `POST/ANY /api/chef/vendors/bind_declaration_to_item`
- `POST/ANY /api/chef/vendors/unbind_declaration_from_item`
- `POST/ANY /api/chef/vendors/delete_declaration`
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
    { "id": 1, "name": "City name" }
  ],
  "all_points": [
    { "id": -1, "addr": "Все точки", "city_id": -1 },
    { "id": 5, "addr": "Point address", "city_id": 1 }
  ],
  "all_declarations": [
    {
      "id": 1,
      "filename": "declarations/2026/03/hash_decl.pdf",
      "url": "https://storage.yandexcloud.net/site-other-data/declarations/2026/03/hash_decl.pdf",
      "created_at": "2026-03-13 10:00:00"
    }
  ]
}
```

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
      "phone": "+79990000000",
      "email": "test@example.com",
      "items_count": 25,
      "cities": [{ "id": 1 }, { "id": 2 }]
    }
  ]
}
```

## 3. `get_vendor_items`

Purpose:

- Load all available buy-items plus current vendor-item links.

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
      "is_show": 1,
      "cat_id": 7,
      "cat_name": "Milk products",
      "declarations": [
        {
          "id": 1,
          "filename": "declarations/2026/03/hash_decl.pdf",
          "url": "https://storage.yandexcloud.net/site-other-data/declarations/2026/03/hash_decl.pdf",
          "created_at": "2026-03-13 10:00:00"
        }
      ]
    }
  ],
  "vendor_items": [
    {
      "id": 1234,
      "item_id": 100,
      "vendor_id": 10,
      "nds": -1,
      "sort": 0,
      "cat_id": 7,
      "cat_name": "Milk products",
      "item_name": "Item",
      "declarations": [
        {
          "id": 1,
          "filename": "declarations/2026/03/hash_decl.pdf",
          "url": "https://storage.yandexcloud.net/site-other-data/declarations/2026/03/hash_decl.pdf",
          "created_at": "2026-03-13 10:00:00"
        }
      ]
    }
  ]
}
```

Notes:

- `all_items` is the catalog from `jaco_main_rolls.items`.
- `vendor_items` is from `jaco_main_rolls.vendor_items`.
- `all_items[*]` currently contains the full item row from `jaco_main_rolls.items` plus `cat_name` and `declarations`.
- `vendor_items[*]` is a plain row payload with `id`, `item_id`, `vendor_id`, `nds`, `sort`, `item_name`, `cat_id`, `cat_name`, `declarations`.
- `sort` is returned and should be preserved by FE if FE edits vendor items.
- `cat_id` and `cat_name` are for filtering.
- `declarations` are item-level, not vendor-row-level.
- `nds_text` is no longer returned. FE should render it from `nds` if needed.
- The old debug `post` field is gone and should not be expected.

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

## 5. `upload_declaration`

Purpose:

- Upload a PDF declaration and immediately bind it to one buy-item.

Request:

- `multipart/form-data`
- `file`: uploaded PDF
- `data`: JSON string

Example `data`:

```json
{
  "item_id": 100,
  "name": "Декларация молоко 3.2%"
}
```

Naming:

- FE may send optional `name`.
- Backend uses `name` for the stored filename base.
- If `name` is empty or missing, backend uses the item name.
- In both cases backend transliterates via project helper and still keeps the random hash/prefix in the final storage path.

Response:

```json
{
  "st": true,
  "item_id": 100,
  "declaration": {
    "id": 1,
    "filename": "declarations/2026/03/hash_decl.pdf",
    "url": "https://storage.yandexcloud.net/site-other-data/declarations/2026/03/hash_decl.pdf",
    "created_at": "2026-03-13 10:00:00"
  },
  "declarations": [
    {
      "id": 1,
      "filename": "declarations/2026/03/hash_decl.pdf",
      "url": "https://storage.yandexcloud.net/site-other-data/declarations/2026/03/hash_decl.pdf",
      "created_at": "2026-03-13 10:00:00"
    }
  ]
}
```

## 6. `bind_declaration_to_item`

Purpose:

- Bind an existing declaration to one buy-item.

Request:

```json
{
  "data": {
    "item_id": 100,
    "decl_id": 1
  }
}
```

Response:

```json
{
  "st": true,
  "item_id": 100,
  "decl_id": 1,
  "declarations": [
    {
      "id": 1,
      "filename": "declarations/2026/03/hash_decl.pdf",
      "url": "https://storage.yandexcloud.net/site-other-data/declarations/2026/03/hash_decl.pdf",
      "created_at": "2026-03-13 10:00:00"
    }
  ]
}
```

## 7. `unbind_declaration_from_item`

Purpose:

- Remove one declaration binding from one buy-item.

Request:

```json
{
  "data": {
    "item_id": 100,
    "decl_id": 1
  }
}
```

Response:

```json
{
  "st": true,
  "item_id": 100,
  "decl_id": 1,
  "declarations": []
}
```

## 8. `delete_declaration`

Purpose:

- Delete the declaration row and file entirely.

Request:

```json
{
  "data": {
    "decl_id": 1
  }
}
```

Response:

```json
{
  "st": true,
  "decl_id": 1,
  "item_ids": [100, 101],
  "item_declarations": [
    {
      "item_id": 100,
      "declarations": []
    },
    {
      "item_id": 101,
      "declarations": []
    }
  ]
}
```

## 9. `get_vendor_info`

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
  "all_cities": [{ "id": 1, "name": "City" }],
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
    "phone": "+79990000000",
    "email": "test@example.com",
    "bik": "123",
    "rc": "456",
    "is_show": 1,
    "is_priority": 0
  },
  "mails": [
    {
      "id": 1,
      "point_id": -1,
      "mail": "test@example.com",
      "comment": "note"
    }
  ]
}
```

Important:

- `vendor` is now the raw vendor row payload instead of a hand-mapped subset.
- `mails[*].point_id` is now a scalar id.
- `all_points` and `all_declarations` are loaded from `get_all`, not from `get_vendor_info`.
- FE should not rely on backend integer casting for every numeric field; consume scalar values as returned.
- Backend still tolerates legacy mail payloads with `point_id: { id: ... }`, but FE should switch to plain scalar `point_id`.

## 10. `new_vendor`

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
      "phone": "+79990000000",
      "bik": "123",
      "rc": "456"
    },
    "vendor_cities": [{ "id": 1 }, { "id": 2 }],
    "mails": [
      {
        "point_id": -1,
        "mail": "test@example.com",
        "comment": "note"
      }
    ]
  }
}
```

## 11. `update_vendor`

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
      "phone": "+79990000000",
      "bik": "123",
      "rc": "456",
      "is_show": 1,
      "is_priority": 0
    },
    "vendor_cities": [{ "id": 1 }],
    "mails": [
      {
        "point_id": 5,
        "mail": "test@example.com",
        "comment": "note"
      }
    ]
  }
}
```

## 12. Validation And Error Shape

Validation and business errors always come as:

```json
{
  "st": false,
  "text": "Human-readable message"
}
```
