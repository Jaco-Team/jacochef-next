# API

Статус: целевой API contract нового модуля `sklad`.

Статус текущей итерации:

- implemented now: `get_all`, `bootstrap`, `units/list`, `units/get_one`, `units/options`, `categories/list`, `categories/get_one`, `history/list`, `history/get_one`
- planned only: `recipes/*`, `semi-finished/*`, `site-items/*`, archive/delete/convert flows
- `Item` остается shared source entity, но dedicated `/api/sklad/items/*` routes в текущем scope не публикуются

Важно:

- это canonical contract нового модуля
- старые route-prefix остаются только migration reference
- новый модуль работает на существующей БД, но не зависит runtime-ом от старых module classes
- canonical business entities для этого API должны быть shared models, а не module-local wrappers
- migration map указан в [PLAN.md](/home/ted/JACO/git/jacochef-next/components/sklad/docs/PLAN.md)

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

### 1.2. Shared entity rule

Если сущность уже используется в нескольких бизнес-процессах проекта, новый API должен опираться на нее как на shared business entity.

Для текущего scope это в первую очередь:

- `SiteItem`
- `Item`
- `Recipe`
- `SemiFinished`
- `Unit`
- `SkladCategory`

### 1.3. Lightweight shell

`get_all` не должен быть giant payload на все сущности.

Его задача:

- открыть модуль
- вернуть доступы
- вернуть counters / summary
- вернуть high-level shell

Полные списки сущностей должны грузиться отдельными list endpoint-ами.

### 1.4. Source vs derived contract

Новый модуль должен явно разделять:

- source fields
- derived fields
- manual override fields, если они будут оставлены бизнесом

Особенно это касается:

- состава
- итоговых аллергенов
- возможных аллергенов
- `kkal`

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
    "recipes_view": 1,
    "semi_finished_view": 1,
    "site_items_view": 1,
    "history_view": 1,
    "archive_view": 1,
    "delete_execute": 0
  },
  "legacy_access": {},
  "summary": {
    "recipes_active": 0,
    "semi_finished_active": 0,
    "site_items_active": 0,
    "archive_total": 0
  },
  "sections": ["units", "categories", "history"],
  "planned_sections": ["recipes", "semi-finished", "site-items", "archive"],
  "business_meta": {
    "composition_chain": ["item", "semi_finished", "recipe", "site_item"],
    "site_item_allergens_mode": "derived_from_composition",
    "site_item_kkal_mode": "derived_from_bju"
  }
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
      "category_key": "semi_finished:12",
      "name": "Соусы",
      "source_type": "semi_finished",
      "source_model": "legacy_rec_pf_cats_unified_read",
      "warehouse_items_count": 0,
      "recipes_count": 4,
      "semi_finished_count": 2,
      "total_usage_count": 6,
      "is_archived": 0,
      "delete_state": "unknown",
      "parent_id": null,
      "parent_name": "Полуфабрикаты"
    }
  ]
}
```

## `POST|ANY /api/sklad/categories/get_one`

Request:

```json
{
  "data": {
    "category_key": "semi_finished:4"
  }
}
```

Важно:

- `source_type = semi_finished` сейчас означает category space полуфабрикатов
- usage этой категории включает:
  - сами полуфабрикаты
  - рецепты, которые в новом модуле отображаются внутри категорий полуфабрикатов
- у `recipe` в новом модуле нет собственной category entity
- это read model поверх legacy `rec_pf_cats` + usage из `recipes_new` / `polufabricat_new`

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

## 6. Items

Текущее уточнение scope:

- dedicated CRUD/list screen для `Item` остается в `sklad_items_module_new`
- текущий `sklad` не должен публиковать отдельные `/api/sklad/items/*` routes в этом scope
- при этом `Item` остается shared upstream-сущностью для `SemiFinished -> Recipe -> SiteItem`
- новый `sklad` вправе использовать `Item` как reference/source layer внутри рецептов, полуфабрикатов, категорий и истории

История:

- generic `history/list` и `history/get_one` уже поддерживают `entity_type = item`
- это не означает, что в текущем FE scope есть отдельный экран управления `Item` внутри `sklad`

---

## 7. Recipes

Статус:

- planned
- routes еще не опубликованы в `routes/api.php`

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
    "allergens_derived": [],
    "allergens_possible_derived": [],
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

Контракт:

- `allergens` и `allergens_possible` — source/manual layer, если бизнес сохраняет ручной ввод
- `allergens_derived` и `allergens_possible_derived` — расчетный слой от текущего состава

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

## `history/list` и `history/get_one` для `recipe`

Статус:

- implemented now
- используется через generic history routes с `entity_type = recipe`

---

## 8. Semi-finished

Статус:

- planned
- routes еще не опубликованы в `routes/api.php`

## `POST|ANY /api/sklad/semi-finished/list`

## `POST|ANY /api/sklad/semi-finished/get_one`

Контракт сущности:

- `composition` строится из `Item`
- `allergens_derived` и `allergens_possible_derived` считаются по ingredient chain
- если legacy-ручной ввод аллергенов сохраняется, он должен быть отделен от derived layer

## `POST|ANY /api/sklad/semi-finished/save_new`

## `POST|ANY /api/sklad/semi-finished/save_edit`

## `POST|ANY /api/sklad/semi-finished/save_flag`

## `POST|ANY /api/sklad/semi-finished/archive`

## `POST|ANY /api/sklad/semi-finished/delete`

## `history/list` и `history/get_one` для `semi_finished`

Статус:

- implemented now
- используется через generic history routes с `entity_type = semi_finished`

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

Статус:

- planned
- routes еще не опубликованы в `routes/api.php`

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
    "composition_source": {
      "pf": [],
      "recipes": []
    },
    "composition_derived": {
      "pf_total": []
    },
    "allergens_derived": [],
    "possible_allergens_derived": [],
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

Контракт:

- `composition_source.pf` = прямые связи `site_item -> pf`
- `composition_source.recipes` = прямые связи `site_item -> recipe`
- `composition_derived.pf_total` = развёрнутый состав по всем заготовкам с учетом рецептов
- `allergens_derived` и `possible_allergens_derived` считаются по итоговой composition chain

## `POST|ANY /api/sklad/site-items/get_marking`

## `POST|ANY /api/sklad/site-items/save_new`

## `POST|ANY /api/sklad/site-items/save_edit`

Важные правила:

- `kkal_preview` возвращается как derived-значение от текущих `protein`, `fat`, `carbohydrates`
- `kkal` сохраняется как persisted field по текущей бизнес-логике
- staged composition является source layer
- после сохранения обязателен пересчет flat composition links
- после сохранения обязателен пересчет агрегата для списаний
- после сохранения обязателен пересчет derived allergens / possible allergens

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

Временный compatibility alias:

- используется только на переходный период, если FE нужно поэтапное переключение
- canonical history contract для нового модуля должен идти через unified history endpoints

## `POST|ANY /api/sklad/history/site-item-marking`

Временный compatibility alias:

- не должен считаться целевой архитектурой

## `POST|ANY /api/sklad/history/site-item-images`

Временный compatibility alias:

- допускается только как compatibility shell
- при отсутствии полноценной persistence обязан явно возвращать gap/capability status

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
- `App\\Services\\History\\HistoryService` используется как общий audit-event layer, но не как единственный источник revision state для складских сущностей

Требование FE:

- history должна позволять не только список событий
- но и список версий сущности
- и открытие полного состояния revision для compare flow

Архитектурное правило:

- `history/list` возвращает version list
- `history/get_one` возвращает canonical revision snapshot
- event-log из `change_events` может дополнять revision, но не заменяет его

## `POST|ANY /api/sklad/history/get_one`

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "entity_id": 10,
    "history_id": 100
  }
}
```

Response:

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
    "source": "jaco_main_rolls.recipes_hist_new",
    "compare_capability": {
      "supported": false,
      "reason": "not implemented yet"
    },
    "snapshot": {}
  },
  "capabilities": {
    "list": true,
    "get_one": true
  }
}
```

Текущее уточнение:

- `site_item` history в текущем scope еще не реализован
- если FE запросит `entity_type = site_item`, backend должен вернуть явную ошибку, а не пустой success

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
    "categories_view": 1,
    "recipes_view": 1,
    "semi_finished_view": 1,
    "site_items_view": 1,
    "history_view": 1,
    "delete_execute": 0,
    "archive_view": 1
  },
  "legacy_access": {
    "rec_list_view": 1,
    "pf_list_view": 1,
    "tech_view": 1
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
