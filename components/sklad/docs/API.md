# API

Статус: целевой API contract нового модуля `sklad_items`.

Статус текущей итерации:

- implemented now: `get_all`, `units/list`, `units/get_one`, `units/options`, `units/save_new`, `units/save_edit`, `units/delete`, `categories/list`, `categories/get_one`, `categories/save_new`, `categories/save_edit`, `categories/delete`, `items/list`, `items/get_all_for_new`, `items/get_one`, `recipes/list`, `recipes/get_one`, `recipes/save_new`, `recipes/save_edit`, `recipes/save_flag`, `recipes/archive`, `recipes/delete`, `semi-finished/list`, `semi-finished/get_one`, `semi-finished/save_new`, `semi-finished/save_edit`, `semi-finished/save_flag`, `semi-finished/archive`, `semi-finished/delete`, `site-items/list`, `site-items/get_all_for_new`, `site-items/get_one`, `site-items/get_marking`, `site-items/save_new`, `site-items/save_edit`, `site-items/save_flag`, `site-items/tags/save_new`, `site-items/tags/save_edit`, `site-items/sync_vk`, `site-items/upload_image`, `site-items/archive`, `site-items/delete`, `history/list`, `history/get_one`, `history/compare`, `entities/convert_type`, `entities/archive`, `entities/archive_list`
- published unsupported route: `categories/archive`
- planned only: deeper image-history persistence extensions for `site_item`, if current schema later proves insufficient
- `Item` остается shared source entity; в текущем scope новый модуль уже публикует для него read/open routes `/api/sklad_items/items/*`, но не публикует write/delete/archive
- `get_all` теперь возвращает `capabilities.archive.entities`, чтобы FE заранее видел supported/unsupported archive actions

Правило чтения этого документа:

- разделы с live read routes описывают то, что уже опубликовано в `routes/api.php`
- planned write/archive sections ниже не являются текущим FE contract для этой итерации

Важно:

- это canonical contract нового модуля
- FE должен строить новые вызовы только по этому документу
- route-space нового backend-модуля остается `/api/sklad_items/*`
- access provisioning для нового модуля документируется отдельно в `ACCESS.md`; этот документ не задает `sklad_modules.key_query`
- `FE-MIGRATION-MAP.md` нужен как расшифровка старых модулей, а не как источник runtime aliases
- старые route-prefix остаются только migration reference
- новый модуль работает на существующей БД, но не зависит runtime-ом от старых module classes
- canonical business entities для этого API должны быть shared models, а не module-local wrappers
- migration map указан в [PLAN.md](/home/ted/JACO/git/test-app-site/app/Chef/Sklad/docs/PLAN.md)
- legacy route/payload evolution для FE вынесена в [FE-MIGRATION-MAP.md](/home/ted/JACO/git/test-app-site/app/Chef/Sklad/docs/FE-MIGRATION-MAP.md)

Базовый prefix:

- `/api/sklad_items`

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

Важное правило:

- canonical contract для новой FE фиксируется здесь, в `API.md`
- legacy route/payload reference и migration semantics должны документироваться отдельно в `FE-MIGRATION-MAP.md`, а не смешиваться с целевым API

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
- вернуть общие справочники, которые нужны большинству экранов модуля

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

## `POST|ANY /api/sklad_items/get_all`

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
  "ui_meta": {
    "supports_tooltips_for_long_labels": true,
    "supports_date_end": true,
    "supports_archive": true
  },
  "capabilities": {
    "archive": {
      "supported_entity_types": ["recipe", "semi_finished", "site_item"],
      "entities": {
        "warehouse_item": {
          "supported": false,
          "mode": "unavailable",
          "reason": "Archive persistence is not defined for this entity type in the current DB schema"
        },
        "unit": {
          "supported": false,
          "mode": "unavailable",
          "reason": "Archive persistence is not defined for this entity type in the current DB schema"
        },
        "category": {
          "supported": false,
          "mode": "unavailable",
          "reason": "Category archive is unavailable because category tables do not have archive or visibility persistence fields"
        },
        "recipe": {
          "supported": true,
          "mode": "is_show_toggle_with_history",
          "reason": null
        },
        "semi_finished": {
          "supported": true,
          "mode": "is_show_toggle_with_history",
          "reason": null
        },
        "site_item": {
          "supported": true,
          "mode": "is_show_toggle_with_history",
          "reason": null
        }
      }
    }
  },
  "sections": [
    "units",
    "categories",
    "recipes",
    "semi-finished",
    "site-items",
    "history",
    "archive"
  ],
  "planned_sections": [],
  "business_meta": {
    "composition_chain": ["item", "semi_finished", "recipe", "site_item"],
    "site_item_allergens_mode": "derived_from_composition",
    "site_item_kkal_mode": "derived_from_bju"
  }
}
```

Уточнение текущей итерации:

- `sections` описывает реально опубликованные разделы
- `planned_sections` сейчас пуст, потому что archive contour уже опубликован и должен считаться live section модуля
- `access` и `summary` могут содержать данные и по unsupported entity actions, но это не означает, что любой archive/delete flow разрешен для каждого entity type
- `capabilities.archive.entities` заранее показывает FE, какие entity types поддерживают реальный archive flow, а какие остаются unsupported
- `get_all` в этом модуле intentionally совмещает shell + shared refs по repo-pattern, вместо отдельного `/bootstrap`
- `site-items/get_all_for_new` и аналогичный внутренний pattern для warehouse item считаются compatibility naming на уровне формы открытия, а не архитектурной опорой нового модуля
- access bootstrap для FE надо читать как `get_all.access`; migration/sync details для module registry вынесены в `ACCESS.md`

---

## 3. Units

## `POST|ANY /api/sklad_items/units/list`

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
      "con_count": 1,
      "delete_state": "blocked",
      "delete_usage": {
        "can_delete": false,
        "active_relations": [],
        "history_relations": []
      }
    }
  ]
}
```

## `POST|ANY /api/sklad_items/units/get_one`

Request:

```json
{
  "data": {
    "id": 1
  }
}
```

## `POST|ANY /api/sklad_items/units/options`

Назначение:

- compact list для селектов

## `POST|ANY /api/sklad_items/units/save_new`

Request:

```json
{
  "data": {
    "name": "упак",
    "con_id": 1,
    "main_count": 1,
    "con_count": 20
  }
}
```

## `POST|ANY /api/sklad_items/units/save_edit`

Request:

```json
{
  "data": {
    "id": 5,
    "name": "упак",
    "con_id": 1,
    "main_count": 1,
    "con_count": 25
  }
}
```

## `POST|ANY /api/sklad_items/units/delete`

Удаление:

- только через server-side usage check

---

## 4. Categories

## `POST|ANY /api/sklad_items/categories/list`

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
      "warehouse_items_count": 0,
      "recipes_count": 4,
      "semi_finished_count": 2,
      "total_usage_count": 6,
      "is_archived": 0,
      "delete_state": "blocked",
      "delete_usage": {
        "can_delete": false,
        "active_relations": [],
        "history_relations": []
      },
      "parent_id": null,
      "parent_name": null
    }
  ]
}
```

## `POST|ANY /api/sklad_items/categories/get_one`

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

## `POST|ANY /api/sklad_items/categories/save_new`

Request:

```json
{
  "data": {
    "source_type": "semi_finished",
    "name": "Соусы"
  }
}
```

Для `warehouse_item` дополнительно:

- передается только canonical `parent_id`
- без родительской категории create/edit не разрешается
- `parent_id` должен указывать на корневую складскую категорию

## `POST|ANY /api/sklad_items/categories/save_edit`

Request:

```json
{
  "data": {
    "id": 12,
    "source_type": "semi_finished",
    "name": "Соусы обновленные"
  }
}
```

## `POST|ANY /api/sklad_items/categories/archive`

Статус:

- published as explicit unsupported route

Назначение:

- route опубликован не для real archive flow
- route нужен, чтобы FE получал честный machine-readable ответ о том, что archive для category пока невозможен на текущей persistence-модели

Причина:

- `items_cat` и `rec_pf_cats` не имеют archive/visibility полей
- поэтому backend не эмулирует archive и не маскирует отсутствие persistence под success-response

Response:

```json
{
  "st": false,
  "text": "Архив для категорий полуфабрикатов не поддержан: в таблице rec_pf_cats нет archive/visibility persistence",
  "feature": "sklad.categories.archive",
  "status": "unsupported",
  "entity_type": "category",
  "source_type": "semi_finished",
  "supported": false,
  "reason": "Архив для категорий полуфабрикатов не поддержан: в таблице rec_pf_cats нет archive/visibility persistence"
}
```

Уточнение контракта:

- `source_type` опционален и нужен, если FE уже знает family категории
- если `source_type` не передан, backend все равно возвращает `entity_type = category` и общую причину недоступности archive

## `POST|ANY /api/sklad_items/categories/delete`

Blocked delete response:

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

## 6. Items

Текущее уточнение scope:

- dedicated CRUD/list screen для `Item` остается в `sklad_items_module_new`
- текущий `sklad_items` публикует для `Item` только read/open routes; write/delete/archive остаются вне этого scope
- при этом `Item` остается shared upstream-сущностью для `SemiFinished -> Recipe -> SiteItem`
- новый `sklad_items` вправе использовать `Item` как reference/source layer внутри рецептов, полуфабрикатов, категорий и истории

История:

- generic `history/list` и `history/get_one` уже поддерживают `entity_type = item`
- это не означает, что в текущем FE scope есть отдельный экран управления `Item` внутри `sklad_items`

---

## 7. Recipes

Статус:

- implemented now
- published routes: `recipes/list`, `recipes/get_one`, `recipes/save_new`, `recipes/save_edit`, `recipes/save_flag`, `recipes/delete`

### Live Read Routes

## `POST|ANY /api/sklad_items/recipes/list`

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

## `POST|ANY /api/sklad_items/recipes/get_one`

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
  "apps": []
}
```

Контракт:

- `allergens` и `allergens_possible` — source/manual layer, если бизнес сохраняет ручной ввод
- `allergens_derived` и `allergens_possible_derived` — расчетный слой от доступной composition chain текущего scope
- `can_delete` и `delete_usage` уже рассчитываются server-side от реальных usage relations, чтобы FE мог честно блокировать удаление
- `units` в detail response сейчас возвращается полным справочником `ed_izmer`, чтобы FE всегда видел текущую привязанную единицу
- текущая read-semantics не вводит отдельный archive filter для `recipe`

## `POST|ANY /api/sklad_items/recipes/save_new`

Статус:

- implemented now

## `POST|ANY /api/sklad_items/recipes/save_edit`

Статус:

- implemented now

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

Поведение:

- `save_new` и `save_edit` принимают только canonical payload в `data`
- `save_edit` для `recipe` сохраняет current row только если `date_start <= today`; при future date пишет новую history revision без немедленного изменения current row
- linked `storages`, `apps`, `items` пересобираются в новом сервисе, а history snapshot пишется отдельно
- в ответе backend возвращает `id` и `history_id`
- runtime-calls в legacy controllers/modules нет; write flow живет в `SkladProductionWriteService`

## `POST|ANY /api/sklad_items/recipes/save_flag`

Статус:

- implemented now

Текущий scope:

- поддерживаются `show_in_rev`, `is_show`, `two_user`
- после изменения флага backend сразу пишет history revision текущего состояния

## `POST|ANY /api/sklad_items/recipes/archive`

Статус:

- implemented now

Контракт:

- route уже опубликован
- route является thin alias над `entities/archive` с `entity_type = recipe`
- archive state сейчас честно маппится на existing `recipes_new.is_show`
- при archive toggle backend пишет новую history revision через `SkladProductionWriteService`

## `POST|ANY /api/sklad_items/recipes/delete`

Статус:

- implemented now

Удаление:

- только через server-side usage check
- сейчас блокируется, если рецепт участвует в `items_rec_new`, `items_rec_stages_new` или их history-tail `items_rec_stages_hist_new`
- `recipes/list` уже возвращает `delete_state` и `delete_usage`, чтобы FE мог блокировать delete action еще на списке

## `history/list` и `history/get_one` для `recipe`

Статус:

- implemented now
- используется через generic history routes с `entity_type = recipe`

---

## 8. Semi-finished

Статус:

- implemented now
- published routes: `semi-finished/list`, `semi-finished/get_one`, `semi-finished/save_new`, `semi-finished/save_edit`, `semi-finished/save_flag`, `semi-finished/delete`

### Live Read Routes

## `POST|ANY /api/sklad_items/semi-finished/list`

## `POST|ANY /api/sklad_items/semi-finished/get_one`

Контракт сущности:

- `composition` строится из `Item`
- `allergens_derived` и `allergens_possible_derived` считаются по ingredient chain
- если legacy-ручной ввод аллергенов сохраняется, он должен быть отделен от derived layer
- `can_delete` и `delete_usage` уже рассчитываются server-side от реальных usage relations
- `semi-finished/list` уже возвращает `delete_state` и `delete_usage`, чтобы FE мог блокировать delete action еще на списке
- `units` в detail response сейчас возвращается полным справочником `ed_izmer`
- `archive_mode = active|archive|all` уже поддержан на list route и честно опирается на `is_show`

## `POST|ANY /api/sklad_items/semi-finished/save_new`

Статус:

- implemented now

## `POST|ANY /api/sklad_items/semi-finished/save_edit`

Статус:

- implemented now

## `POST|ANY /api/sklad_items/semi-finished/save_flag`

Статус:

- implemented now

Текущий scope:

- поддерживаются `show_in_rev`, `is_show`, `two_user`
- после изменения флага backend сразу пишет history revision текущего состояния

Поведение write-side:

- `save_new` и `save_edit` принимают только canonical payload в `data`
- `semi_finished/save_edit` обновляет current row сразу, затем пишет history snapshot
- linked `storages`, `apps`, `items` пересобираются в новом сервисе
- в ответе backend возвращает `id` и `history_id`
- runtime-calls в legacy controllers/modules нет; write flow живет в `SkladProductionWriteService`

## `POST|ANY /api/sklad_items/semi-finished/archive`

Статус:

- implemented now

Контракт:

- route уже опубликован
- route является thin alias над `entities/archive` с `entity_type = semi_finished`
- archive state сейчас честно маппится на existing `polufabricat_new.is_show`
- при archive toggle backend пишет новую history revision через `SkladProductionWriteService`

## `POST|ANY /api/sklad_items/semi-finished/delete`

Статус:

- implemented now

Удаление:

- только через server-side usage check
- сейчас блокируется, если полуфабрикат участвует в `items_pf_new`, `items_pf_stages_new`, `items_all_pf_new`, `recipe_items_new`, `order_post_rec` или их history-tail

## `history/list` и `history/get_one` для `semi_finished`

Статус:

- implemented now
- используется через generic history routes с `entity_type = semi_finished`

Контракт:

- аналогичен `recipes`
- `type = semi_finished`

---

## 9. Convert recipe <-> semi-finished

Статус:

- implemented now
- route опубликован

## `POST|ANY /api/sklad_items/entities/convert_type`

Статус:

- implemented now

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

Canonical request:

- `id`
- `from_type`
- `to_type`

Бизнес-правила:

- конвертация всегда создает новую сущность целевого типа и удаляет исходную
- конвертация разрешена только если исходная сущность сейчас не используется и не участвовала в связанных контурах, иначе вернется ошибка
- `semi_finished -> recipe` переносит состав как `item`-компоненты рецепта
- `recipe -> semi_finished` разрешена только для item-based рецептов, потому что текущая схема `polufabricat_items_new` умеет хранить только товары склада и не может без потери смысла принять `pf/rec`-компоненты

Переходная legacy-compatible форма запроса вынесена в:

- [FE-MIGRATION-MAP.md](/home/ted/JACO/git/test-app-site/app/Chef/Sklad/docs/FE-MIGRATION-MAP.md)

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "new_id": 55,
  "new_type": "semi_finished",
  "old_id": 10,
  "old_type": "recipe",
  "history_id": 120
}
```

---

## 10. Site items

Статус:

- implemented now
- published routes: `site-items/list`, `site-items/get_all_for_new`, `site-items/get_one`, `site-items/get_marking`, `site-items/save_new`, `site-items/save_edit`, `site-items/save_flag`, `site-items/tags/save_new`, `site-items/tags/save_edit`, `site-items/sync_vk`, `site-items/upload_image`

### Live Read Routes

## `POST|ANY /api/sklad_items/items/list`

Опубликованный read-only slice для `warehouse_item` внутри нового модуля `sklad_items`.

Замысел текущего этапа:

- `sklad_items` уже умеет открывать и читать warehouse item
- отдельный legacy CRUD-экран `sklad_items_module_new` пока остается основным write-модулем
- новый API не проксирует старый модуль runtime-ом, а читает ту же БД собственным service-layer

Request:

```json
{
  "search": "мука",
  "category_id": 12
}
```

Response:

```json
{
  "list": [
    {
      "id": 1,
      "name": "Мука",
      "category_id": 12,
      "category_name": "Бакалея",
      "ed_izmer_id": 3,
      "ed_izmer_name": "кг",
      "date_start": "2026-07-01",
      "date_end": null,
      "is_active": 1,
      "is_archived": 0,
      "delete_state": "blocked",
      "delete_usage": {
        "can_delete": false,
        "active_relations": [],
        "history_relations": []
      }
    }
  ]
}
```

Примечания:

- route опубликован как read-only opening/list contract
- write/delete/archive для warehouse items в `sklad_items` пока не публикуются
- `date_start/date_end` читаются из latest persisted revision в `items_hist_new`
- `items/list` уже возвращает `delete_state` и `delete_usage` по реальным production/history relations, даже несмотря на то что отдельный delete route для `Item` в новом модуле пока не опубликован

## `POST|ANY /api/sklad_items/items/get_all_for_new`

Request body не обязателен.

Response:

```json
{
  "item": {
    "id": null,
    "name": "",
    "category_id": null,
    "ed_izmer_id": null,
    "app_id": null,
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

Примечания:

- это новый form-open contract для warehouse item внутри `sklad_items`
- naming `get_all_for_new` сохранен как repo-compatible opening pattern

## `POST|ANY /api/sklad_items/items/get_one`

Request:

```json
{
  "id": 1
}
```

Response:

```json
{
  "item": {
    "id": 1,
    "name": "Мука",
    "category_id": 12,
    "ed_izmer_id": 3,
    "app_id": 5,
    "date_start": "2026-07-01",
    "date_end": null,
    "can_delete": false,
    "delete_usage": {
      "can_delete": false,
      "active_relations": [],
      "history_relations": []
    },
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

Примечания:

- detail payload собирается новым `SkladItemsService`, без runtime-зависимости от `sklad_items_module_new`
- отдельные legacy-shaped fields сохранены там, где они уже существуют в текущей БД и форме
- usage check для `Item` учитывает не только current production chain (`polufabricat_items_new`, `recipe_items_new`, `order_post_rec`), но и historical/operational tails вроде history tables, billing и write-off journals по schema-per-point базам

## `POST|ANY /api/sklad_items/site-items/list`

Response:

```json
{
  "st": true,
  "categories": [],
  "tags": [],
  "list": []
}
```

Текущее уточнение:

- `site-items/list` intentionally остается lightweight read endpoint
- list row не содержит `delete_state` и `delete_usage`
- authoritative delete guard выполняется на `site-items/delete`
- если FE нужен blocked reason до клика по delete, его надо брать из `site-items/get_one`

## `POST|ANY /api/sklad_items/site-items/get_all_for_new`

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
    "marking": {}
  },
  "cat_list": [],
  "tags_all": [],
  "all_pf": [],
  "all_rec": [],
  "all_items": []
}
```

Текущее уточнение:

- `get_all_for_new` сейчас возвращает только базовую форму и reference datasets
- composition blocks, derived allergens и linked relations появляются в `site-items/get_one`

## `POST|ANY /api/sklad_items/site-items/get_one`

Контракт:

- `composition_source.pf` = прямые связи `site_item -> pf`
- `composition_source.recipes` = прямые связи `site_item -> recipe`
- `composition_derived.pf_total` = развёрнутый состав по всем заготовкам с учетом рецептов
- `allergens_derived` и `possible_allergens_derived` считаются по итоговой composition chain

Текущее уточнение:

- в этом slice опубликован technical read contour
- `marking` возвращается как часть `get_one`
- image state возвращается только через structured `image`
- `image.variants.jpg|webp` содержат path/url пары для текущих published asset variants
- `site-items/list` intentionally не рассчитывает `delete_state` и `delete_usage`, чтобы list не платил тяжелый runtime cost на каждом чтении
- reference datasets по умолчанию показывают active rows, но для `get_one` backend дополнительно включает уже привязанные inactive rows, чтобы FE не терял текущие связи в payload
- `get_one` возвращает preview `can_delete` и `delete_usage`, но detail payload не должен падать, если preview delete-check временно недоступен
- `site-items/delete` делает authoritative blocked check на момент попытки удаления и возвращает usage reason при запрете

## `POST|ANY /api/sklad_items/site-items/get_marking`

Response shape:

```json
{
  "st": true,
  "item": {
    "id": 10,
    "name": "Филадельфия",
    "short_name": "Фила",
    "tags": [],
    "marking": {
      "is_mark": 1,
      "mark_code": "ABC123",
      "series": "ABC123",
      "is_akchis": 0
    }
  },
  "tags_all": []
}
```

Текущее уточнение:

- dedicated marking read route уже опубликован
- route возвращает только marking/tag slice и не дублирует technical composition payload из `get_one`

## `POST|ANY /api/sklad_items/site-items/save_new`

Response shape:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "history_id": 345
}
```

Текущее уточнение:

- route уже опубликован
- write flow использует новый `SkladSiteItemWriteService`, а не legacy controller
- используется текущий compatibility-contract по `upd_access`, чтобы не ломать существующий FE edit gating
- при сохранении backend:
  - нормализует БЖУ и stage-time поля
  - считает `kkal`
  - пересобирает source composition links
  - пересобирает derived PF links для списаний
  - пишет unified history snapshot
- payload id в `save_new` не обязателен; canonical id возвращается в ответе

Request notes:

- ожидается тот же form payload, что и у `get_one/get_all_for_new`
- для staged composition backend читает:
  - `pf_stage_1/2/3`
  - `rec_stage_1/2/3`
  - `item_items.this_items`

## `POST|ANY /api/sklad_items/site-items/save_edit`

Response shape:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "history_id": 346
}
```

Текущее уточнение:

- route уже опубликован
- требуется `data.id`
- update current row зависит от текущего compatibility-contract по `upd_access`
- если `items_edit` включен, backend пересобирает PF/recipe source chain
- если `stage_edit` включен, backend пересобирает linked-item graph и пересчитывает `full_sec` для связанных type=2 items

Важные правила:

- `kkal_preview` возвращается как derived-значение от текущих `protein`, `fat`, `carbohydrates`
- `kkal` сохраняется как persisted field по текущей бизнес-логике
- формула `kkal_preview` и persisted `kkal` в новом модуле теперь централизована в одном `Sklad` service, чтобы read/write/history не разъезжались
- staged composition является source layer
- после сохранения обязателен пересчет flat composition links
- после сохранения обязателен пересчет агрегата для списаний
- после сохранения обязателен пересчет derived allergens / possible allergens

## `POST|ANY /api/sklad_items/site-items/save_flag`

Response shape:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 10,
  "history_id": 347
}
```

Контракт:

- route уже опубликован
- поддерживаются только canonical flag fields:
  - `is_show`
  - `show_site`
  - `show_program`
  - `is_new`
  - `is_updated`
  - `is_price`
  - `is_mark`
  - `is_hit`
  - `is_akchis`
- после toggle backend пишет history snapshot текущего состояния item

Request:

```json
{
  "data": {
    "id": 10,
    "type": "is_show",
    "value": 1
  }
}
```

## `POST|ANY /api/sklad_items/site-items/archive`

Статус:

- implemented now

Контракт:

- route уже опубликован
- route является thin alias над `entities/archive` с `entity_type = site_item`
- archive state сейчас честно маппится на existing `items_new.is_show`
- при archive toggle backend пишет новую history revision через `SkladSiteItemWriteService`

## `POST|ANY /api/sklad_items/site-items/delete`

Контракт:

- route уже опубликован
- backend делает server-side usage check перед удалением
- проверяются:
  - текущие связи в `jaco_site_rolls`
  - исторические связи в `jaco_site_rolls`
  - продажи/использование по всем базам `jaco_rolls_*`, где существует `order_items`
  - исторические продажи по всем базам `jaco_rolls_*`, где существует `order_items_full_log`
- удаление разрешено только если позиция нигде не участвует сейчас и не участвовала ранее
- при успешном удалении backend удаляет только item-owned rows нового `site_item` контура
- delete guard не является архивом и не подменяет archive flow

Response success:

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

Response blocked:

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

## `POST|ANY /api/sklad_items/site-items/upload_image`

Контракт:

- route уже опубликован
- route является item-bound mutation, а не free asset upload
- controller не содержит image-processing логики и делегирует mutation в `SkladSiteItemWriteService` / `SkladSiteItemImageService`
- backend принимает только `jpg/jpeg/png`
- backend публикует resized assets в существующие image buckets
- backend обновляет current image fields в `jaco_site_rolls.items_new`
- backend пишет новую revision в `jaco_site_rolls.items_hist_new`
- image history после upload доступна через canonical `history/list` и `history/get_one`
- current read payload (`site-items/list`, `site-items/get_one`) берет `date_start/date_end` из последней persisted revision, а не из просто максимальной даты дня

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
    "asset_key": "site_item_10_20260713_154512",
    "history_id": 348,
    "paths": ["site_item_10_2000x2000.jpg", "site_item_10_2000x2000.webp"],
    "variants": {
      "jpg": {
        "path": "site_item_10_2000x2000.jpg",
        "url": "https://.../site_item_10_2000x2000.jpg"
      },
      "webp": {
        "path": "site_item_10_2000x2000.webp",
        "url": "https://.../site_item_10_2000x2000.webp"
      }
    },
    "uploaded": {
      "jpg": [],
      "webp": []
    },
    "alias_paths": {
      "jpg": [],
      "webp": []
    },
    "immutable_paths": {
      "jpg": [],
      "webp": []
    }
  }
}
```

Уточнение текущей итерации:

- upload response возвращает structured `image` с variant metadata, ready-to-render URL pointers и asset-path groups
- current read/history payloads для `site_item` используют тот же structured `image`, без параллельных legacy image fields

## `POST|ANY /api/sklad_items/site-items/tags/save_new`

Response shape:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "id": 15,
  "tags_all": []
}
```

Контракт:

- route уже опубликован
- создает запись в `jaco_site_rolls.tags_all`
- возвращает новый `id` и полный обновленный `tags_all`

## `POST|ANY /api/sklad_items/site-items/tags/save_edit`

Response shape:

```json
{
  "st": true,
  "text": "Успешно изменено!",
  "tags_all": []
}
```

Контракт:

- route уже опубликован
- принимает только canonical `tag_id`
- возвращает полный обновленный `tags_all`

## `POST|ANY /api/sklad_items/site-items/sync_vk`

Контракт:

- route уже опубликован
- поднимает флаг `jaco_main_rolls.settings.type = vk_update_goods`
- не меняет данные `site_item` напрямую

---

## 11. Archive

Статус:

- implemented now для `recipe`, `semi_finished`, `site_item`
- unsupported entity types возвращают honest validation error

## `POST|ANY /api/sklad_items/entities/archive`

Статус:

- implemented now

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "id": 1,
    "is_archived": 1
  }
}
```

Поддержано сейчас:

- `recipe`
- `semi_finished`
- `site_item`

Не поддержано в этой итерации:

- `warehouse_item`
- `unit`
- `category`

Response:

```json
{
  "st": true,
  "text": "Успешно сохранено",
  "entity_type": "recipe",
  "id": 1,
  "history_id": 100,
  "is_archived": true
}
```

## `POST|ANY /api/sklad_items/entities/archive_list`

Статус:

- implemented now

Назначение:

- единый список архивных позиций по целевым сущностям

Текущее покрытие:

- возвращает архивные rows для `recipe`, `semi_finished`, `site_item`
- использует те же read services и `archive_mode = archive`
- если запросить unsupported `entity_type`, backend возвращает validation error, а не пустой fake-result

---

## 12. Delete

Статус:

- implemented now
- единый delete orchestration flow dispatch-ит в существующие entity-specific delete services

## `POST|ANY /api/sklad_items/entities/delete`

Статус:

- implemented now

Унифицированный endpoint для сущностей:

- `unit`
- `category`
- `recipe`
- `semi_finished`
- `site_item`

Не поддержано в этой итерации:

- `warehouse_item`

Request:

```json
{
  "data": {
    "entity_type": "recipe",
    "id": 15
  }
}
```

Для `entity_type = category` дополнительно:

- обязателен `source_type = warehouse_item|semi_finished`
- либо передается `category_key`, из которого backend восстановит `source_type`

Response success:

```json
{
  "st": true,
  "text": "Успешное удаление",
  "entity_type": "recipe"
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
- `history/compare` возвращает compare-ready payload между двумя revision
- event-log из `change_events` может дополнять revision, но не заменяет его

## `POST|ANY /api/sklad_items/history/get_one`

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
  }
}
```

Текущее уточнение:

- unified history read для `entity_type = site_item` уже реализован через `history/list` и `history/get_one`
- snapshot покрывает запрошенную revision: linked items, staged PF/recipe composition, tags, marking, image paths, timing, nutrition, весовые поля и текстовые описания из соответствующей history row
- snapshot теперь также публикует business-layer поля `composition_source`, `composition_derived`, `allergens_derived`, `possible_allergens_derived`, чтобы history compare шел по тому же доменному слою, что и current read
- canonical `snapshot.type` для `site_item` остается `site_item`, а persisted legacy subtype из `items_hist_new.type` публикуется отдельно как `snapshot.item_type`
- image timeline для `site_item` теперь читается через existing `items_hist_new` revisions
- linked `site_item` / `semi_finished` / `recipe` labels inside `site_item` history now resolved against the nearest historical revision at or before the `site_item` revision date, instead of leaking only current names into old revisions
- derived PF composition inside `site_item` history now expands recipe links through the nearest historical recipe revision for the same date, so old revisions compare against period-correct composition labels and quantities
- поля, которых физически нет в existing `items_hist_new` (`is_updated`, `is_price`), не эмулируются в canonical history snapshot и остаются известным ограничением текущей persistence
- история `site_item` публикуется только через canonical `history/site-item*` routes
- canonical compare flow уже опубликован через `history/compare`
- отдельная image-history persistence вне existing `items_hist_new` в текущем scope не добавляется

## `POST|ANY /api/sklad_items/history/compare`

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

Response shape:

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
  }
}
```

Контракт:

- route уже опубликован
- работает для всех entity types, у которых published `history/get_one` уже умеет собирать canonical snapshot
- compare строится по canonical snapshot, а не по raw legacy rows
- для части справочников legacy БД не хранит собственные historical snapshots; поэтому названия `unit`, `tag`, `category`, `allergen` в history payload могут резолвиться по текущим dictionary tables, тогда как entity state и composition already читаются по historical rows там, где они существуют
- `changes[].path` использует dot-path внутри `snapshot`
- для `site_item` compare теперь опирается на более полный canonical snapshot: timing, marking text, size/count, nutrition и image state сравниваются тем же unified diff flow
- `capabilities.compare.supported = true` в этой итерации означает именно поддержку snapshot-diff на canonical payload, а не отдельный domain-specific compare UI или image-diff

---

## 14. Access contract

Новый модуль должен возвращать:

- canonical access map

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
  }
}
```

Важное правило:

- backend authorization в новом модуле опирается только на canonical access
- `get_all` не публикует runtime compatibility access map

---

## 15. Validation rules

Обязательные правила:

- `date_start` обязательно для целевых сущностей, где применимо
- `date_end`, если задано, должно быть валидной датой и `>= date_start`
- для `site_item`, если `date_start` не передан, effective start date берется как `today`, и `date_end` валидируется уже относительно этой даты
- delete разрешен только при отсутствии current и historical usage
- archive не должен ломать history и связанные сущности
- `kkal_preview` должен считаться backend-ом по той же формуле, что и persisted `kkal`
- image history capability должна быть либо реально поддержана существующей persistence, либо явно помечена как follow-up gap

---

## 16. Compatibility policy

Runtime compatibility aliases в новом `sklad_items` больше не поддерживаются.

Важно:

- backend публикует только canonical request/response contract
- любые legacy route names и migration notes сохраняются только в документации как reference
- новая FE должна строиться строго по canonical API из этого документа
