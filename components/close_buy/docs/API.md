# Close Buy API

Контракт относится только к модулю `Close_buy`. Production/reference UI не изменяется.

## Общие правила

- Маршруты находятся внутри авторизованной группы `CheckToken` и используют `Route::any(...)`.
- Данные модуля передаются в `data`. Поле принимает массив или JSON-строку с объектом.
- Успешный ответ использует `GlobalResource` и содержит `st: true`.
- Ошибка содержит `st: false` и текст в `text`.
- Все идентификаторы передаются как integer, кроме `history[].id`: это строковый стабильный ключ вида `event:<id>` или `legacy:<id>`.
- В историю попадают только фактические изменения, где `is_active_old` отличается от `is_active_new`.

Пример ошибки:

```json
{
  "st": false,
  "text": "Нет доступа к выбранной точке"
}
```

## `close_buy/get_all`

Инициализация модуля и список доступных пользователю точек.

### Request

`data` не требуется.

### Response

```json
{
  "st": true,
  "module_info": {
    "name": "Управление продажами"
  },
  "points": [
    {
      "id": 1,
      "name": "Тольятти, Ленинградская 47",
      "base": "jaco_rolls_1",
      "city_id": 1
    }
  ],
  "access": {}
}
```

| Поле               | Тип          | Описание                                                |
| ------------------ | ------------ | ------------------------------------------------------- |
| `module_info`      | object       | Контекст модуля из middleware.                          |
| `points`           | array        | Только точки, доступные текущему пользователю.          |
| `points[].id`      | integer      | ID точки.                                               |
| `points[].name`    | string       | Отображаемое название точки.                            |
| `points[].base`    | string/null  | Связанная база точки, если доступна.                    |
| `points[].city_id` | integer      | ID города.                                              |
| `access`           | object/array | Access payload проекта без дополнительной нормализации. |

## `close_buy/get_items`

Возвращает актуальные категории и товары выбранной точки.

### Request `data`

```json
{
  "point_id": 1,
  "category_id": 10,
  "search": "филадельфия",
  "status": "all"
}
```

| Поле          | Тип     | Обязательность | Правило                                               |
| ------------- | ------- | -------------- | ----------------------------------------------------- |
| `point_id`    | integer | required       | `min:1`, точка должна быть доступна пользователю.     |
| `category_id` | integer | optional       | `min:1`.                                              |
| `search`      | string  | optional       | Максимум 255 символов.                                |
| `status`      | string  | optional       | `all`, `open`, `closed`, `mixed`; по умолчанию `all`. |

### Response

```json
{
  "st": true,
  "point_id": 1,
  "categories": [
    {
      "id": 10,
      "name": "Суши и роллы",
      "parent_id": 0,
      "count": 2,
      "open_count": 1,
      "closed_count": 1,
      "status": "mixed",
      "items": [
        {
          "item_id": 353,
          "name": "Филадельфия классик",
          "category_id": 10,
          "is_active": 1
        }
      ]
    }
  ],
  "summary": {
    "open": 0,
    "closed": 0,
    "mixed": 1,
    "items": 2
  }
}
```

`is_active`: `1` — товар открыт, `0` — закрыт.

## `close_buy/save_item`

Изменяет состояние одного товара.

### Request `data`

```json
{
  "point_id": 1,
  "item_id": 353,
  "is_active": 0
}
```

| Поле        | Тип     | Обязательность | Правило                      |
| ----------- | ------- | -------------- | ---------------------------- |
| `point_id`  | integer | required       | Доступная точка.             |
| `item_id`   | integer | required       | Отображаемый товар каталога. |
| `is_active` | integer | required       | Только `0` или `1`.          |

### Response

```json
{
  "st": true,
  "point_id": 1,
  "category_id": 10,
  "changed_items": [
    {
      "item_id": 353,
      "is_active_old": 1,
      "is_active_new": 0
    }
  ],
  "history_id": 6910,
  "history_event_id": 42,
  "categories": []
}
```

Если состояние уже совпадает с целевым, `changed_items` пустой, история не создаётся, а `history_id` и `history_event_id` равны `null`.

Запись текущего состояния, существующих history-таблиц и новых Close Buy history-таблиц выполняется одной транзакцией.

## `close_buy/save_category`

Изменяет состояние всех доступных отображаемых товаров категории.

### Request `data`

```json
{
  "point_id": 1,
  "category_id": 10,
  "is_active": 0
}
```

| Поле          | Тип     | Обязательность | Правило             |
| ------------- | ------- | -------------- | ------------------- |
| `point_id`    | integer | required       | Доступная точка.    |
| `category_id` | integer | required       | `min:1`.            |
| `is_active`   | integer | required       | Только `0` или `1`. |

Состав товаров повторно определяется сервером. Список, который мог быть показан на FE, не является источником истины.

Ответ имеет ту же структуру, что и `save_item`; `category_id` содержит изменённую категорию.

## `close_buy/get_history`

Возвращает историю с серверной пагинацией. Сначала отображаются новые события, а старые записи из существующих history-таблиц адаптируются в события с `card_variant: "legacy"`.

### Request `data`

```json
{
  "point_id": 1,
  "category_id": 10,
  "date_from": "2026-06-01",
  "date_to": "2026-06-30",
  "search": "суши",
  "action": "close",
  "author": "Мария",
  "page": 1,
  "per_page": 20
}
```

| Поле          | Тип     | Обязательность | Правило                                              |
| ------------- | ------- | -------------- | ---------------------------------------------------- |
| `point_id`    | integer | required       | Доступная точка.                                     |
| `category_id` | integer | optional       | Фильтр по категории события или его товарам.         |
| `date_from`   | date    | optional       | Формат `Y-m-d`, включительно.                        |
| `date_to`     | date    | optional       | Формат `Y-m-d`, включительно; не раньше `date_from`. |
| `search`      | string  | optional       | Поиск по заголовку, описанию и автору; максимум 255. |
| `action`      | string  | optional       | `close`, `open`, `change`.                           |
| `author`      | string  | optional       | Поиск по snapshot имени автора; максимум 255.        |
| `page`        | integer | optional       | От `1`, по умолчанию `1`.                            |
| `per_page`    | integer | optional       | От `1` до `100`, по умолчанию `20`.                  |

### Response

```json
{
  "st": true,
  "point_id": 1,
  "history": [
    {
      "id": "event:42",
      "date": "2026-07-29",
      "time": "14:32:00",
      "user_id": 1656,
      "user_name": "Мария Иванова",
      "point_id": 1,
      "point_name": "Точка Центр",
      "category_id": 10,
      "category_name": "Суши и роллы",
      "event_type": "close",
      "title": "Закрыта категория",
      "description": "Мария Иванова закрыл категорию «Суши и роллы». Фактически состояние изменилось у 5 товаров.",
      "comment": null,
      "request_id": null,
      "operation_id": "7c1c4dc5-7f28-4ef1-9c5c-2a71c88f1c0d",
      "transaction_id": "7c1c4dc5-7f28-4ef1-9c5c-2a71c88f1c0d",
      "item_count": 5,
      "changed_item_count": 5,
      "card_variant": "standard",
      "details_available": true,
      "restore_available": false,
      "transaction_status": "committed",
      "legacy_reason": null,
      "timezone": "Europe/Moscow",
      "snapshot_version": 1,
      "meta": { "source": "close_buy" },
      "items": [
        {
          "item_id": 353,
          "item_name": "Филадельфия классик",
          "category_id": 10,
          "category_name": "Суши и роллы",
          "is_active_old": 1,
          "old_status_label": "Открыт",
          "is_active_new": 0,
          "new_status_label": "Закрыт",
          "sort": 10
        }
      ]
    },
    {
      "id": "legacy:6905",
      "date": "2026-08-03",
      "time": "14:08:04",
      "user_id": 1656,
      "user_name": "Никитина Елена Юрьевна",
      "point_id": 8,
      "point_name": "Точка Парк",
      "category_id": null,
      "category_name": null,
      "event_type": "close",
      "title": "Изменение",
      "description": "Контекст старой записи неполный",
      "item_count": 223,
      "changed_item_count": 179,
      "card_variant": "legacy",
      "details_available": true,
      "restore_available": false,
      "transaction_status": "unknown",
      "legacy_reason": "Контекст старой записи неполный",
      "timezone": null,
      "snapshot_version": 0,
      "meta": {},
      "items": []
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 2,
    "last_page": 1
  }
}
```

### History event fields

| Поле                                           | Тип                       | Описание                                                                               |
| ---------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| `id`                                           | string                    | `event:<new-table-id>` или `legacy:<old-head-id>`.                                     |
| `date`, `time`                                 | string                    | Время события в локальном формате проекта.                                             |
| `user_id`, `user_name`                         | integer/null, string/null | Snapshot автора. Старые записи могут быть без автора.                                  |
| `point_id`, `point_name`                       | integer, string/null      | Snapshot точки события.                                                                |
| `category_id`, `category_name`                 | integer/string/null       | Snapshot категории, если событие было массовым.                                        |
| `event_type`                                   | string                    | `close`, `open` или `change`.                                                          |
| `title`                                        | string                    | Готовый заголовок карточки.                                                            |
| `description`                                  | string/null               | Готовое описание события.                                                              |
| `comment`                                      | string/null               | Комментарий операции, если был сохранён.                                               |
| `request_id`, `operation_id`, `transaction_id` | string/null               | Идентификаторы запроса, операции и транзакции.                                         |
| `item_count`                                   | integer                   | Все строки исходного события. Для старых записей может включать неизменившиеся строки. |
| `changed_item_count`                           | integer                   | Только фактически изменившиеся товары.                                                 |
| `card_variant`                                 | string                    | `standard` для новых событий, `legacy` для старых.                                     |
| `details_available`                            | boolean                   | Есть ли детализация, которую можно показать.                                           |
| `restore_available`                            | boolean                   | Возможность восстановления. Для старых записей `false`.                                |
| `transaction_status`                           | string                    | `committed` для новых операций, `unknown` для старых записей.                          |
| `legacy_reason`                                | string/null               | Причина ограниченного отображения старой записи.                                       |
| `timezone`                                     | string/null               | Timezone формирования snapshot.                                                        |
| `snapshot_version`                             | integer                   | Версия структуры snapshot.                                                             |
| `meta`                                         | object                    | Дополнительные данные модуля; не используется как основной фильтр.                     |
| `items`                                        | array                     | Только товары с различающимися old/new состояниями.                                    |

Поля `items[]`: `item_id`, `item_name`, `category_id`, `category_name`, `is_active_old`, `old_status_label`, `is_active_new`, `new_status_label`, `sort`.

### Legacy display rules

Для `card_variant: "legacy"` FE должен использовать старый визуальный вариант карточки:

- показывать `title`, дату, автора и точку, если они есть;
- показывать предупреждение о неполном контексте;
- не показывать кнопку восстановления;
- не выдавать старые `item_count` за количество фактических изменений;
- если `details_available=true`, детали можно раскрыть отдельным старым-fashioned блоком, используя `items` после загрузки/адаптации;
- если `details_available=false`, показывать только карточку события без таблицы товаров.

## Data and persistence

Current state remains in `jaco_site_rolls.close_buy`. Existing rows in `close_buy_history_head` and `close_buy_history` are not rewritten by the new migration. New writes additionally create immutable snapshots in:

- `jaco_site_rolls.close_buy_history_events` — event header and render metadata;
- `jaco_site_rolls.close_buy_history_items` — changed item snapshots.

The module-owned `CloseBuyHistoryService` reads both sources, excludes old heads already represented by a new event, and returns one FE shape. `HistoryService` and global `change_events` are not used by this module.

## Permission and validation failures

- Missing authenticated user: `Пользователь не определён`.
- Point outside the user access list: `Нет доступа к выбранной точке`.
- Invalid item/category/state/date/filter: the first validation message is returned in `text`.
- Invalid category with no eligible displayed products: `Категория не содержит доступных товаров`.
- Invalid item or category membership: `Один или несколько товаров недоступны`.
