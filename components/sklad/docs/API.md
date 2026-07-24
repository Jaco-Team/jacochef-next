# API

Целевой runtime contract модуля `sklad_items`.

Базовый prefix:

- `/api/sklad_items`

Общий transport:

- входной payload передается через `data`
- success: `{"st": true, ...}`
- error: `{"st": false, "text": "..."}`

Общие правила:

- документ описывает только текущее live-состояние
- legacy route names и migration notes сюда не входят
- `access` возвращается как raw `upd_access`
- для `recipe`, `semi_finished`, `site_item` archive реализован через toggle `is_show` + history snapshot
- для `warehouse_item`, `unit`, `category` archive не поддержан
- `history/*` работает по canonical snapshot, а не по raw legacy row

## 1. Module Open

### `POST|ANY /api/sklad_items/get_all`

Назначение:

- открыть модуль
- вернуть access map
- вернуть summary/capabilities
- вернуть shared refs для shell

Request:

```json
{
  "data": {
    "archive_mode": "active"
  }
}
```

Response shape:

```json
{
  "st": true,
  "module_info": {},
  "access": {},
  "summary": {
    "recipes_active": 0,
    "semi_finished_active": 0,
    "site_items_active": 0,
    "archive_total": 0
  },
  "units": [],
  "categories": [],
  "allergens": [],
  "storages": [],
  "apps": [],
  "tags": [],
  "accounting_systems": [],
  "sections": [],
  "capabilities": {
    "archive": {
      "supported_entity_types": ["recipe", "semi_finished", "site_item"],
      "entities": {}
    }
  },
  "business_meta": {
    "composition_chain": ["item", "semi_finished", "recipe", "site_item"],
    "site_item_allergens_mode": "derived_from_composition",
    "site_item_kkal_mode": "derived_from_bju"
  }
}
```

Примечания:

- `sections` содержит только реально опубликованные разделы
- `capabilities.archive.entities` нужен для FE pre-check supported/unsupported archive actions

## 2. Units

### `POST|ANY /api/sklad_items/units/list`

Response:

```json
{
  "st": true,
  "list": []
}
```

Row fields:

- `id`
- `name`
- `can_delete`
- `delete_usage`

### `POST|ANY /api/sklad_items/units/get_one`

Request:

```json
{
  "data": {
    "id": 1
  }
}
```

Response:

```json
{
  "st": true,
  "entity": {
    "id": 1,
    "name": ""
  }
}
```

### `POST|ANY /api/sklad_items/units/options`

Response:

```json
{
  "st": true,
  "list": []
}
```

### `POST|ANY /api/sklad_items/units/save_new`

### `POST|ANY /api/sklad_items/units/save_edit`

Request fields:

- `name`
- `id` for `save_edit`

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 1
}
```

### `POST|ANY /api/sklad_items/units/delete`

Success:

```json
{
  "st": true,
  "text": "Успешное удаление",
  "usage": {
    "can_delete": true,
    "active_relations": [],
    "history_relations": []
  }
}
```

Blocked:

```json
{
  "st": false,
  "text": "Позиция используется или использовалась ранее, удаление запрещено",
  "usage": {
    "can_delete": false,
    "active_relations": [],
    "history_relations": []
  }
}
```

## 3. Categories

### `POST|ANY /api/sklad_items/categories/list`

Request:

```json
{
  "data": {
    "source_type": "warehouse_item"
  }
}
```

Supported `source_type`:

- `warehouse_item`
- `semi_finished`

Response:

```json
{
  "st": true,
  "list": []
}
```

Row fields:

- `id`
- `name`
- `parent_id`
- `source_type`
- `usage_counts`
- `can_delete`
- `delete_usage`

### `POST|ANY /api/sklad_items/categories/get_one`

Request fields:

- `id`
- `source_type`

### `POST|ANY /api/sklad_items/categories/save_new`

### `POST|ANY /api/sklad_items/categories/save_edit`

Request fields:

- `name`
- `parent_id`
- `source_type`
- `id` for `save_edit`

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 1
}
```

### `POST|ANY /api/sklad_items/categories/archive`

Всегда unsupported.

Response:

```json
{
  "st": false,
  "text": "",
  "feature": "sklad.categories.archive",
  "status": "unsupported",
  "entity_type": "category",
  "source_type": "semi_finished",
  "supported": false,
  "reason": ""
}
```

### `POST|ANY /api/sklad_items/categories/delete`

Формат success/blocked такой же, как у `units/delete`.

## 4. Warehouse Items

Scope:

- в `sklad_items` опубликован только read/open contour
- write/delete/archive для warehouse items в этом модуле не опубликованы

### `POST|ANY /api/sklad_items/items/list`

Response:

```json
{
  "st": true,
  "categories": [],
  "apps": [],
  "accounting_systems": [],
  "list": []
}
```

### `POST|ANY /api/sklad_items/items/get_all_for_new`

Response:

```json
{
  "st": true,
  "item": {},
  "categories": [],
  "apps": [],
  "accounting_systems": [],
  "units": []
}
```

### `POST|ANY /api/sklad_items/items/get_one`

Response:

```json
{
  "st": true,
  "item": {},
  "categories": [],
  "apps": [],
  "accounting_systems": [],
  "units": []
}
```

## 5. Recipes

### `POST|ANY /api/sklad_items/recipes/list`

Request:

```json
{
  "data": {
    "search": "",
    "category_id": null,
    "archive_mode": "active"
  }
}
```

Response:

```json
{
  "st": true,
  "list": []
}
```

List row fields:

- `id`
- `type = recipe`
- `name`
- `categories`
- `ed_izmer_id`
- `ed_izmer_name`
- `date_start`
- `date_end`
- `is_active`
- `is_archived`
- `show_in_rev`
- `delete_state`
- `delete_usage`

### `POST|ANY /api/sklad_items/recipes/get_one`

Response shape:

```json
{
  "st": true,
  "entity": {
    "id": 1,
    "type": "recipe",
    "name": "",
    "shelf_life": "",
    "date_start": "",
    "date_end": null,
    "ed_izmer_id": null,
    "unit_name": null,
    "all_w": 0,
    "all_w_brutto": 0,
    "all_w_netto": 0,
    "time_min": "",
    "time_min_dop": "",
    "show_in_rev": 0,
    "two_user": 0,
    "allergens": [],
    "allergens_possible": [],
    "allergens_derived": [],
    "allergens_possible_derived": [],
    "categories": [],
    "structure": "",
    "contents": "",
    "text_contents": "",
    "storages": [],
    "apps": [],
    "items": [],
    "composition": [],
    "is_active": 1,
    "is_archived": 0,
    "can_delete": false,
    "delete_usage": {
      "can_delete": false,
      "active_relations": [],
      "history_relations": []
    }
  },
  "allergens": [],
  "categories": [],
  "units": [],
  "all_storages": [],
  "all_items_list": [],
  "apps": [],
  "composition": []
}
```

Composition row fields:

- `id`
- `name`
- `item_id` as primitive numeric id
- `item_ref`
- `type_rec`
- `type`
- `id_name`
- `un_id`
- `brutto`
- `pr_1`
- `netto`
- `pr_2`
- `res`
- `ei_name`
- `unit_name`

Recipe detail rules:

- `entity.items` and root `composition` publish the same composition rows
- `contents` and `text_contents` are aliases of `structure`
- typed keys are preserved as `{id}-item`, `{id}-pf`, `{id}-rec`
- visibility filtering matches legacy `recept_module_new_2`
- `pf` rows are shown only for active `polufabricat_new.is_show = 1`
- `item` rows are shown only for active `items_new.is_show = 1`
- `rec` rows stay visible without extra `is_show` filter

### `POST|ANY /api/sklad_items/recipes/save_new`

### `POST|ANY /api/sklad_items/recipes/save_edit`

Request fields:

- `id` for `save_edit`
- `name`
- `shelf_life`
- `date_start`
- `date_end`
- `ed_izmer_id`
- `all_w`
- `all_w_brutto`
- `all_w_netto`
- `time_min`
- `time_min_dop`
- `show_in_rev`
- `two_user`
- `allergens`
- `allergens_possible`
- `categories`
- `structure`
- `storages`
- `apps`
- `items`

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "history_id": 100
}
```

Write rules:

- `save_new` and `save_edit` accept canonical payload only
- `save_edit` writes current row immediately only when `date_start <= today`
- future-dated edit writes a new history revision without immediate current-row replacement

### `POST|ANY /api/sklad_items/recipes/save_flag`

Request:

```json
{
  "data": {
    "id": 10,
    "type": "show_in_rev",
    "value": 1
  }
}
```

Supported flags:

- `show_in_rev`
- `is_show`
- `two_user`

### `POST|ANY /api/sklad_items/recipes/archive`

Thin alias over `entities/archive` with `entity_type = recipe`.

### `POST|ANY /api/sklad_items/recipes/delete`

Delete is blocked if recipe participates in:

- `items_rec_new`
- `items_rec_stages_new`
- `items_rec_stages_hist_new`

Success/blocked format follows the common delete contract.

## 6. Semi-finished

### `POST|ANY /api/sklad_items/semi-finished/list`

Request shape is the same as `recipes/list`.

List row fields are the same as `recipes/list`, with `type = semi_finished`.

### `POST|ANY /api/sklad_items/semi-finished/get_one`

Response:

```json
{
  "st": true,
  "entity": {
    "id": 1,
    "type": "semi_finished",
    "name": "",
    "shelf_life": "",
    "date_start": "",
    "date_end": null,
    "ed_izmer_id": null,
    "unit_name": null,
    "all_w": 0,
    "all_w_brutto": 0,
    "all_w_netto": 0,
    "time_min": "",
    "time_min_dop": "",
    "show_in_rev": 0,
    "two_user": 0,
    "allergens": [],
    "allergens_possible": [],
    "allergens_derived": [],
    "allergens_possible_derived": [],
    "categories": [],
    "structure": "",
    "contents": "",
    "text_contents": "",
    "storages": [],
    "apps": [],
    "items": [],
    "composition": [],
    "is_active": 1,
    "is_archived": 0,
    "can_delete": false,
    "delete_usage": {
      "can_delete": false,
      "active_relations": [],
      "history_relations": []
    }
  },
  "allergens": [],
  "categories": [],
  "units": [],
  "all_storages": [],
  "all_items_list": [],
  "apps": [],
  "composition": [],
  "contents": "",
  "text_contents": ""
}
```

Semi-finished detail rules:

- `entity.items` and root `composition` publish the same composition rows
- `contents` and `text_contents` are explicit aliases of `structure`
- composition rows use primitive `item_id`
- typed keys are preserved as `{id}-item`
- only active `items_new.is_show = 1` rows are returned
- orphaned/inactive warehouse-item links are suppressed

### `POST|ANY /api/sklad_items/semi-finished/save_new`

### `POST|ANY /api/sklad_items/semi-finished/save_edit`

Request and response format mirror `recipes/save_*`.

### `POST|ANY /api/sklad_items/semi-finished/save_flag`

Supported flags:

- `show_in_rev`
- `is_show`
- `two_user`

### `POST|ANY /api/sklad_items/semi-finished/archive`

Thin alias over `entities/archive` with `entity_type = semi_finished`.

### `POST|ANY /api/sklad_items/semi-finished/delete`

Delete is blocked if semi-finished participates in:

- `items_pf_new`
- `items_pf_stages_new`
- `items_all_pf_new`
- `recipe_items_new`
- `order_post_rec`
- related history-tail usage

## 7. Convert Recipe <-> Semi-finished

### `POST|ANY /api/sklad_items/entities/convert_type`

Request:

```json
{
  "data": {
    "id": 10,
    "from_type": "recipe",
    "to_type": "semi_finished"
  }
}
```

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "history_id": 100
}
```

Rules:

- supported only for `recipe <-> semi_finished`
- blocked when current usage makes conversion unsafe

## 8. Site Items

### `POST|ANY /api/sklad_items/site-items/list`

Response:

```json
{
  "st": true,
  "categories": [],
  "tags": [],
  "list": []
}
```

Site item list rules:

- list is lightweight
- `archive_mode` filter uses `items_new.is_show`
- row includes backward-compatible flags:
  - `is_show`
  - `show_site`
  - `show_program`
  - `is_hit`
  - `is_new`
  - `is_price`
  - `is_active`
  - `is_archived`
- row does not include `delete_state` or `delete_usage`
- nutrition can come from persisted item fields or linked child-item fallback
- `nutrition_source = persisted|linked_items`
- row `tags` use `tags_items`, then fallback to legacy CSV `items_new.tags`

### `POST|ANY /api/sklad_items/site-items/get_all_for_new`

Response shape:

```json
{
  "st": true,
  "item": {
    "id": null,
    "name": "",
    "short_name": "",
    "category_id": null,
    "weight": "",
    "protein": "",
    "fat": "",
    "carbohydrates": "",
    "kkal": 0,
    "kkal_preview": 0,
    "date_start": "",
    "date_end": null,
    "is_archived": 0,
    "tags": [],
    "image": null,
    "marking": {}
  },
  "item_items": {
    "this_items": [],
    "all_items": []
  },
  "items_stage": {
    "stage_1": [],
    "stage_2": [],
    "stage_3": [],
    "all": []
  },
  "composition_source": {
    "pf": [],
    "recipes": []
  },
  "composition_derived": {
    "pf_total": []
  },
  "cat_list": [],
  "tags_all": [],
  "all_pf": [],
  "all_rec": [],
  "all_items": []
}
```

### `POST|ANY /api/sklad_items/site-items/get_one`

Main rules:

- `composition_source.pf` = direct `site_item -> pf` links
- `composition_source.recipes` = direct `site_item -> recipe` links
- `composition_derived.pf_total` = aggregated derived PF composition
- `allergens_derived` and `possible_allergens_derived` are calculated from final composition chain
- `marking` is part of `get_one`
- legacy flat image fields remain:
  - `img_new`
  - `img_new_update`
  - `img_app`
- structured `image` is also returned
- preview delete data is returned here, not in list
- if preview delete-check cannot be built:
  - `can_delete = null`
  - `delete_usage.status = unavailable`
  - `delete_usage.is_available = false`
- linked inactive refs already attached to the item can be included so FE does not lose persisted relations
- `item.tags` come from `tags_items`, then fallback to legacy CSV
- `date_end = null` means open-ended interval
- `items_stage` and `item_items.this_items` preserve legacy row-level fields used by old `site_items_new`

### `POST|ANY /api/sklad_items/site-items/get_marking`

Returns marking/tag slice only.

### `POST|ANY /api/sklad_items/site-items/save_new`

### `POST|ANY /api/sklad_items/site-items/save_edit`

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "history_id": 345
}
```

Write rules:

- write flow lives in `SkladSiteItemWriteService`
- uses raw `upd_access` compatibility contract
- normalizes BJU and stage-time fields
- calculates `kkal`
- rebuilds source composition links
- rebuilds derived PF links for списания
- writes unified history snapshot
- `save_edit` requires `data.id`
- `kkal_preview` is derived from current `protein`, `fat`, `carbohydrates`

### `POST|ANY /api/sklad_items/site-items/save_flag`

Supported flags:

- `is_show`
- `show_site`
- `show_program`
- `is_new`
- `is_updated`
- `is_price`
- `is_mark`
- `is_hit`
- `is_akchis`

### `POST|ANY /api/sklad_items/site-items/archive`

Thin alias over `entities/archive` with `entity_type = site_item`.

### `POST|ANY /api/sklad_items/site-items/delete`

Delete checks:

- current links in `jaco_site_rolls`
- historical links in `jaco_site_rolls`
- sales usage in `jaco_rolls_*` databases where `order_items` exists
- historical sales usage where `order_items_full_log` exists

Response format follows the common delete contract.

### `POST|ANY /api/sklad_items/site-items/upload_image`

Request:

```json
{
  "data": {
    "id": 10,
    "slot": "main"
  },
  "file": "(binary)"
}
```

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "item_id": 10,
  "history_id": 348,
  "image": {
    "slot": "main",
    "asset_key": "",
    "history_id": 348,
    "paths": [],
    "variants": {},
    "uploaded": {},
    "alias_paths": {},
    "immutable_paths": {}
  }
}
```

Image rules:

- item-bound mutation only
- accepts only `jpg/jpeg/png`
- publishes resized assets into existing storage
- updates current image fields in `jaco_site_rolls.items_new`
- writes history revision in `jaco_site_rolls.items_hist_new`
- current read and history use the same structured `image` contract

### `POST|ANY /api/sklad_items/site-items/tags/save_new`

### `POST|ANY /api/sklad_items/site-items/tags/save_edit`

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 15,
  "tags_all": []
}
```

### `POST|ANY /api/sklad_items/site-items/sync_vk`

Rule:

- sets `jaco_main_rolls.settings.type = vk_update_goods`
- does not mutate `site_item` row directly

## 9. Archive

### `POST|ANY /api/sklad_items/entities/archive`

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "id": 10,
    "value": 0
  }
}
```

Supported `entity_type`:

- `recipe`
- `semi_finished`
- `site_item`

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "history_id": 100
}
```

Unsupported entity types return honest error/unsupported response.

### `POST|ANY /api/sklad_items/entities/archive_list`

Returns archive list by `entity_type`.

## 10. Delete

### `POST|ANY /api/sklad_items/entities/delete`

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "id": 10
  }
}
```

Success:

```json
{
  "st": true,
  "text": "Успешное удаление",
  "usage": {
    "can_delete": true,
    "active_relations": [],
    "history_relations": []
  }
}
```

Blocked:

```json
{
  "st": false,
  "text": "Позиция используется или использовалась ранее, удаление запрещено",
  "usage": {
    "can_delete": false,
    "active_relations": [],
    "history_relations": []
  }
}
```

## 11. History

### `POST|ANY /api/sklad_items/history/list`

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "entity_id": 10
  }
}
```

Returns revision list for supported entity type.

### `POST|ANY /api/sklad_items/history/get_one`

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "entity_id": 10,
    "revision_key": "100"
  }
}
```

Response shape:

```json
{
  "st": true,
  "entity_type": "recipe",
  "entity_id": 10,
  "revision": {
    "entity_type": "recipe",
    "entity_id": 10,
    "history_id": 100,
    "revision_key": "100",
    "source": "",
    "compare_capability": {
      "supported": true,
      "reason": null
    },
    "snapshot": {}
  },
  "capabilities": {
    "list": true,
    "get_one": true,
    "compare": {
      "supported": true,
      "reason": null
    }
  },
  "history_meta": {
    "entity_type": "recipe",
    "source": "",
    "revision_key_policy": "history_id",
    "reconstruction": {
      "mode": "legacy_history_head_with_child_links",
      "uses_nearest_revision_by_date_for_linked_entities": true
    },
    "dictionary_name_policy": {
      "mode": "mixed",
      "historical_where_available": true,
      "current_dictionary_fallback_for_names": true,
      "fallback_entities": ["unit", "tag", "category", "allergen"]
    }
  }
}
```

History rules:

- `history/list` returns version list
- `history/get_one` returns canonical snapshot
- `history/compare` compares canonical snapshots
- `site_item` snapshot includes composition, tags, marking, images, timing, nutrition and text fields
- some dictionary labels may resolve from current tables when historical dictionary snapshots do not exist

### `POST|ANY /api/sklad_items/history/compare`

Request:

```json
{
  "data": {
    "entity_type": "site_item",
    "entity_id": 10,
    "left_revision_key": "100",
    "right_revision_key": "101"
  }
}
```

Response:

```json
{
  "st": true,
  "entity_type": "site_item",
  "entity_id": 10,
  "left_revision": {},
  "right_revision": {},
  "compare": {
    "has_changes": true,
    "changes_count": 3,
    "changes": []
  },
  "capabilities": {
    "list": true,
    "get_one": true,
    "compare": {
      "supported": true,
      "reason": null
    }
  },
  "history_meta": {}
}
```

## 12. Access Contract

`get_all.access` returns raw middleware keys.

Example:

```json
{
  "access": {
    "ed_izmer_view": 1,
    "ed_izmer_edit": 1,
    "cats_view": 1,
    "cats_edit": 1,
    "name_edit": 1,
    "items_edit": 1,
    "delete_edit": 0
  }
}
```

Rules:

- FE should use `*_view`, `*_edit`, `*_access`
- backend authorization on mutation paths also uses raw `upd_access`

## 13. Validation Rules

- `date_start` is required where applicable
- if `date_end` is set, it must be `>= date_start`
- empty `date_end` or `null` means open-ended interval
- delete is allowed only with no current or historical usage
- archive must keep history valid
- `kkal_preview` is calculated on backend
- image history uses existing site-item history persistence

## 14. Compatibility Policy

- runtime aliases are not part of this contract
- FE should use only canonical routes and canonical payloads from this file
