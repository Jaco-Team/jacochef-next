# API

Статус: целевой API contract нового модуля `sklad`.

Важно:

- это canonical contract нового модуля
- старые route-prefix остаются только migration reference
- новый модуль работает на существующей БД, но не зависит runtime-ом от старых module classes
- migration map указан в [PLAN.md](/home/ted/JACO/git/test-app-site/app/Chef/Sklad/docs/PLAN.md)

Базовый prefix:

- `/api/sklad`

Общий формат ответа:

- success: `{'st': true, ...}`
- error: `{'st': false, 'text': '...'}`

Transport:

- по проектному стандарту входной payload передается через `data`

---

## 1. API principles

### 1.1. Canonical vs compatibility

В новом модуле есть:

- canonical routes
- canonical payloads
- при необходимости временные compatibility aliases

Важное правило:

- compatibility слой не должен определять архитектуру нового модуля

### 1.2. Lightweight shell

`get_all` не должен быть giant payload на все сущности.

Его задача:

- открыть модуль
- вернуть доступы
- вернуть counters / summary
- вернуть high-level shell

Полные списки сущностей должны грузиться отдельными list endpoint-ами.

---

## 2. Open module

## `POST|ANY /api/sklad/get_all`

Назначение:

- открыть модуль
- вернуть access map
- вернуть summary counters
- вернуть список доступных разделов

Request:

```json
{
  "data": {
    "archive_mode": "active"
  }
}
```

Response:

```json
{
  "st": true,
  "module_info": {},
  "access": {
    "units_view": 1,
    "categories_view": 1,
    "warehouse_items_view": 1,
    "recipes_view": 1,
    "semi_finished_view": 1,
    "site_items_view": 1,
    "history_view": 1,
    "archive_view": 1,
    "delete_execute": 0
  },
  "legacy_access": {},
  "summary": {
    "warehouse_items_active": 0,
    "recipes_active": 0,
    "semi_finished_active": 0,
    "site_items_active": 0,
    "archive_total": 0
  },
  "sections": [
    "units",
    "categories",
    "warehouse-items",
    "recipes",
    "semi-finished",
    "site-items",
    "history",
    "archive"
  ]
}
```

---

## 3. Bootstrap

## `POST|ANY /api/sklad/bootstrap`

Назначение:

- вернуть общие справочники и feature data для форм

Response:

```json
{
  "st": true,
  "units": [],
  "categories": [],
  "allergens": [],
  "storages": [],
  "apps": [],
  "tags": [],
  "accounting_systems": [],
  "ui_meta": {
    "supports_tooltips_for_long_labels": true,
    "supports_date_end": true,
    "supports_archive": true
  }
}
```

---

## 4. Units

## `POST|ANY /api/sklad/units/list`

Response:

```json
{
  "st": true,
  "list": [
    {
      "id": 1,
      "name": "кг",
      "con_id": 0,
      "main_count": 1,
      "con_count": 1
    }
  ]
}
```

## `POST|ANY /api/sklad/units/get_one`

Request:

```json
{
  "data": {
    "id": 1
  }
}
```

## `POST|ANY /api/sklad/units/options`

Назначение:

- compact list для селектов

## `POST|ANY /api/sklad/units/save_new`

## `POST|ANY /api/sklad/units/save_edit`

## `POST|ANY /api/sklad/units/delete`

Удаление:

- только через server-side usage check

---

## 5. Categories

## `POST|ANY /api/sklad/categories/list`

Request:

```json
{
  "data": {
    "search": "",
    "archive_mode": "active"
  }
}
```

Response:

```json
{
  "st": true,
  "list": [
    {
      "id": 12,
      "name": "Соусы",
      "source_type": "unified",
      "warehouse_items_count": 10,
      "recipes_count": 4,
      "semi_finished_count": 2,
      "total_usage_count": 16,
      "is_archived": 0,
      "can_delete": false
    }
  ]
}
```

## `POST|ANY /api/sklad/categories/get_one`

## `POST|ANY /api/sklad/categories/save_new`

## `POST|ANY /api/sklad/categories/save_edit`

## `POST|ANY /api/sklad/categories/archive`

## `POST|ANY /api/sklad/categories/delete`

Blocked delete response:

```json
{
  "st": false,
  "text": "Категория используется и не может быть удалена",
  "usage": {
    "active_relations": [],
    "history_relations": []
  }
}
```

---

## 6. Warehouse items

## `POST|ANY /api/sklad/warehouse-items/list`

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
  "list": [
    {
      "id": 1,
      "name": "Сыр",
      "category_id": 10,
      "category_name": "Молочка",
      "ed_izmer_id": 1,
      "ed_izmer_name": "кг",
      "date_start": "2026-07-10",
      "date_end": null,
      "is_active": 1,
      "is_archived": 0,
      "can_delete": false
    }
  ]
}
```

## `POST|ANY /api/sklad/warehouse-items/bootstrap`

Response:

```json
{
  "st": true,
  "item": {
    "id": null,
    "name": "",
    "name_for_vendor": "",
    "mark_name": "",
    "category_id": null,
    "ed_izmer_id": null,
    "app_id": null,
    "pq": "",
    "percent": "",
    "vend_percent": "",
    "art": "",
    "time_min": "00:00",
    "time_min_other": "00:00",
    "time_dop_min": "00:00",
    "min_count": "",
    "max_count_in_m": "",
    "show_in_order": 0,
    "show_in_rev": 0,
    "is_show": 0,
    "is_archived": 0,
    "date_start": "",
    "date_end": "",
    "allergens": [],
    "allergens_possible": [],
    "accounting_systems": [],
    "storages": []
  },
  "categories": [],
  "units": [],
  "allergens": [],
  "accounting_systems": [],
  "storages": [],
  "apps": []
}
```

## `POST|ANY /api/sklad/warehouse-items/get_one`

## `POST|ANY /api/sklad/warehouse-items/check_art`

## `POST|ANY /api/sklad/warehouse-items/save_new`

## `POST|ANY /api/sklad/warehouse-items/save_edit`

## `POST|ANY /api/sklad/warehouse-items/save_flag`

Назначение:

- изменение одного флага / одного поля простой операции

## `POST|ANY /api/sklad/warehouse-items/archive`

## `POST|ANY /api/sklad/warehouse-items/delete`

## `POST|ANY /api/sklad/history/warehouse-item`

---

## 7. Recipes

## `POST|ANY /api/sklad/recipes/list`

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

## `POST|ANY /api/sklad/recipes/get_one`

Response:

```json
{
  "st": true,
  "entity": {
    "id": 1,
    "type": "recipe",
    "name": "",
    "shelf_life": "",
    "date_start": "",
    "date_end": "",
    "ed_izmer_id": null,
    "allergens": [],
    "allergens_possible": [],
    "categories": [],
    "structure": "",
    "storages": [],
    "apps": [],
    "items": [],
    "is_active": 1,
    "is_archived": 0,
    "can_delete": false
  },
  "allergens": [],
  "categories": [],
  "units": [],
  "all_storages": [],
  "all_items_list": [],
  "apps": []
}
```

## `POST|ANY /api/sklad/recipes/save_new`

## `POST|ANY /api/sklad/recipes/save_edit`

Важные поля:

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

## `POST|ANY /api/sklad/recipes/save_flag`

## `POST|ANY /api/sklad/recipes/archive`

## `POST|ANY /api/sklad/recipes/delete`

## `POST|ANY /api/sklad/history/recipe`

---

## 8. Semi-finished

## `POST|ANY /api/sklad/semi-finished/list`

## `POST|ANY /api/sklad/semi-finished/get_one`

## `POST|ANY /api/sklad/semi-finished/save_new`

## `POST|ANY /api/sklad/semi-finished/save_edit`

## `POST|ANY /api/sklad/semi-finished/save_flag`

## `POST|ANY /api/sklad/semi-finished/archive`

## `POST|ANY /api/sklad/semi-finished/delete`

## `POST|ANY /api/sklad/history/semi-finished`

Контракт:

- аналогичен `recipes`
- `type = semi_finished`

---

## 9. Convert recipe <-> semi-finished

## `POST|ANY /api/sklad/entities/convert_type`

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
  "new_id": 55,
  "new_type": "semi_finished"
}
```

---

## 10. Site items

## `POST|ANY /api/sklad/site-items/list`

Response:

```json
{
  "st": true,
  "categories": [],
  "tags": [],
  "list": []
}
```

## `POST|ANY /api/sklad/site-items/bootstrap`

Response:

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
    "date_end": "",
    "is_archived": 0,
    "tags": [],
    "image": null,
    "marking": {},
    "stages": {
      "stage_1": [],
      "stage_2": [],
      "stage_3": []
    },
    "item_items": {
      "this_items": []
    }
  },
  "cat_list": [],
  "tags_all": [],
  "all_pf": [],
  "all_rec": [],
  "all_items": []
}
```

## `POST|ANY /api/sklad/site-items/get_one`

## `POST|ANY /api/sklad/site-items/get_marking`

## `POST|ANY /api/sklad/site-items/save_new`

## `POST|ANY /api/sklad/site-items/save_edit`

Важные правила:

- `kkal_preview` возвращается как derived-значение от текущих `protein`, `fat`, `carbohydrates`
- `kkal` сохраняется как persisted field по текущей бизнес-логике

## `POST|ANY /api/sklad/site-items/save_flag`

## `POST|ANY /api/sklad/site-items/archive`

## `POST|ANY /api/sklad/site-items/delete`

## `POST|ANY /api/sklad/site-items/upload_image`

Request:

```json
{
  "file": "(binary)",
  "type": "site_items",
  "name": "Филадельфия"
}
```

Response:

```json
{
  "st": true,
  "images": {
    "jpg": [],
    "webp": []
  },
  "history_capability": {
    "is_persisted": false,
    "reason": "requires existing suitable persistence or follow-up schema task"
  }
}
```

## `POST|ANY /api/sklad/site-items/tags/save_new`

## `POST|ANY /api/sklad/site-items/tags/save_edit`

## `POST|ANY /api/sklad/site-items/sync_vk`

## `POST|ANY /api/sklad/history/site-item-tech`

## `POST|ANY /api/sklad/history/site-item-marking`

## `POST|ANY /api/sklad/history/site-item-images`

---

## 11. Archive

## `POST|ANY /api/sklad/entities/archive`

Request:

```json
{
  "data": {
    "entity_type": "warehouse_item",
    "id": 1,
    "is_archived": 1
  }
}
```

## `POST|ANY /api/sklad/entities/archive_list`

Назначение:

- единый список архивных позиций по целевым сущностям

---

## 12. Delete

## `POST|ANY /api/sklad/entities/delete`

Унифицированный endpoint для сущностей:

- `warehouse_item`
- `recipe`
- `semi_finished`
- `site_item`
- `unit`
- `category`

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "id": 15
  }
}
```

Response success:

```json
{
  "st": true,
  "text": "Успешное удаление"
}
```

Response blocked:

```json
{
  "st": false,
  "text": "Позиция используется или использовалась ранее, удаление запрещено",
  "usage": {
    "active_relations": [],
    "history_relations": []
  }
}
```

---

## 13. History

Общий принцип:

- history read должен быть unified
- history storage пока опирается на существующие history tables
- новый модуль сам строит canonical history response

## `POST|ANY /api/sklad/history/get_one`

Request:

```json
{
  "data": {
    "entity_type": "site_item",
    "id": 10,
    "history_id": 100
  }
}
```

Response:

```json
{
  "st": true,
  "entity": {
    "id": 10,
    "history_id": 100,
    "state": {}
  }
}
```

---

## 14. Access contract

Новый модуль должен возвращать:

- canonical access map
- optional legacy compatibility map

Пример:

```json
{
  "access": {
    "units_view": 1,
    "units_edit": 1,
    "categories_view": 1,
    "categories_edit": 0,
    "warehouse_items_view": 1,
    "warehouse_items_edit": 1,
    "recipes_view": 1,
    "recipes_edit": 1,
    "semi_finished_view": 1,
    "semi_finished_edit": 1,
    "site_items_view": 1,
    "site_items_edit": 1,
    "history_view": 1,
    "delete_view": 1,
    "delete_execute": 0,
    "archive_view": 1,
    "archive_edit": 1
  },
  "legacy_access": {
    "name_edit": 1,
    "items_edit": 1,
    "ed_izmer_edit": 1
  }
}
```

Важное правило:

- backend authorization в новом модуле должна опираться на canonical access
- `legacy_access` возвращается только для переходного FE

---

## 15. Validation rules

Обязательные правила:

- `date_start` обязательно для целевых сущностей, где применимо
- `date_end`, если задано, должно быть `>= date_start`
- delete разрешен только при отсутствии current и historical usage
- archive не должен ломать history и связанные сущности
- `kkal_preview` должен считаться backend-ом по той же формуле, что и persisted `kkal`
- image history capability должна быть либо реально поддержана существующей persistence, либо явно помечена как follow-up gap

---

## 16. Temporary compatibility policy

На переходный период допустимо:

- сохранить часть legacy aliases в payload
- сохранить часть legacy access aliases
- дать wrapper-ответы для старых UI ожиданий

Но canonical API этого модуля — это именно этот документ. New FE should target these routes first.
