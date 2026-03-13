# FE Task: Vendors Declarations Upgrade

Implement the FE upgrade for declarations in the `vendors` module.

## API changes to support

1. `get_vendor_items` is richer.

- `all_items[*]` now includes `cat_id`, `cat_name`, `declarations`
- `vendor_items[*]` now includes `cat_id`, `cat_name`, `declarations`

2. New write endpoints exist.

- `/api/chef/vendors/upload_declaration`
- `/api/chef/vendors/bind_declaration_to_item`
- `/api/chef/vendors/unbind_declaration_from_item`
- `/api/chef/vendors/delete_declaration`

3. Existing endpoints are unchanged otherwise.

- keep request wrapper under `data`
- keep response handling via `{ st, text? }`
- do not remove old vendor fields from FE models

## Declaration entity contract

Declaration object:

```json
{
  "id": 1,
  "filename": "declarations/2026/03/hash_decl.pdf",
  "url": "https://storage.yandexcloud.net/site-other-data/declarations/2026/03/hash_decl.pdf",
  "created_at": "2026-03-13 10:00:00"
}
```

Notes:

- declarations are item-level
- the same declaration may be bound to multiple items
- `url` should be used for open/download actions

## FE implementation task

1. Extend FE types for vendor items and full item catalog.

- add `cat_id: number | null`
- add `cat_name: string | null`
- add `declarations: Declaration[]`

2. Add category filtering for the full item list.

- filter against `all_items`
- use `cat_id` / `cat_name`
- keep existing item selection flow unchanged

3. Render declarations per item.

- show declaration list for selected/current item
- support open/download by `url`
- show empty state when `declarations` is empty

4. Add declaration upload.

- call `upload_declaration` as `multipart/form-data`
- send `file`
- send `data` as JSON string with `item_id`
- after success, replace declarations for the returned `item_id`

5. Add bind existing declaration to item.

- call `bind_declaration_to_item`
- payload: `{ data: { item_id, decl_id } }`
- after success, replace declarations for the returned `item_id`

6. Add unbind declaration from item.

- call `unbind_declaration_from_item`
- payload: `{ data: { item_id, decl_id } }`
- after success, replace declarations for the returned `item_id`

7. Add delete declaration entirely.

- call `delete_declaration`
- payload: `{ data: { decl_id } }`
- after success, update declarations for every entry from `item_declarations`

8. Preserve old vendor item behavior.

- keep `sort`
- keep `nds`
- do not drop old fields while adapting types

## Suggested FE acceptance criteria

- vendor screen still loads and edits vendors as before
- item selector can filter by category
- item rows/cards show declaration list
- user can upload a PDF declaration to an item
- user can unbind a declaration from an item
- user can delete a declaration entirely
- FE state updates from write responses without requiring a full page reload
