api updated. Original task was (raw):

```
Точка - меняем компонент на тот где выбор по городам есть, и сразу все, должен называться Кафе (use CityCafeAutocomplete2, no group by company)

Промокод - сделать его автокомплитом, множественный выбор, в дату подтягивать все промики, которые были активны в указанный на форме промежуток времени

Где используется - автокомплит с множественным выбором ( Самовывоз / Доставка / Зал / Все (-1) )

таблица ( можно новым табом, она будет основной )

Название промокода

- Всего активаций (Заказы)
- Кол-во 2х и более активаций (повторные заказы)
- Сумма без скидки
- Сумма со скидкой
- Сумма и % скидки (Разница Сумма без скидки - Сумма со скидкой). Указать в формате 100р | 1%
- Средний чек (без скидки | со скидкой), можно в одной ячейке, чтобы не дробить на 2 столбца
- Активации действующими клиентами (повторные заказы)
- Доля от всех действующих клиентов
- Активации новыми клиентами (первый заказ)
- Доля новых клиентов от всех новых клиентов
- Всего клиентов, кто активировал промокод
- Доля всех клиентов, кто активировал промокод, от всех клиентов, кто совершил 1 и более заказов (то есть от активных)
- Где применяется (Кафе, Сайт+КЦ, Кафе+Сайт+КЦ)
```

use MyAutocomplite

Модуль теперь разделен на 4 независимых backend-handle:

- `get_all`
  - инициализация страницы
- `get_promos_period`
  - autocomplete промокодов по периоду
- `get_legacy_stats`
  - старая вкладка со старыми `stats`
- `get_promo_stats`
  - новая вкладка с расширенной таблицей `promo_table`

### 1. Открытие страницы

FE вызывает:

- `promo_items_stat/get_all`

Backend возвращает только базовые данные формы:

- `module_info`
- `points`
- `items`
- `type_orders`

Без расчета статистики и без попытки читать:

- `date_start`
- `date_end`
- `promo`
- `promoName`
- `chooseItem`
- `type_order`

### 2. Выбор периода

Если на форме заполнены:

- `date_start`
- `date_end`

FE может вызвать:

- `promo_items_stat/get_promos_period`

и получить список промокодов, которые были активны в выбранный период.

### 3. Кнопка `Показать`

Если открыта старая вкладка:

- FE вызывает `promo_items_stat/get_legacy_stats`

Если открыта новая вкладка:

- FE вызывает `promo_items_stat/get_promo_stats`

## Endpoint: `promo_items_stat/get_all`

### Назначение

Инициализация модуля без статистики.

### Request

`data` не обязателен.

### Response

```json
{
  "st": true,
  "module_info": {},
  "points": [
    { "id": -1, "name": "Все" },
    { "id": 2, "name": "Ворошилова 12а" }
  ],
  "items": [{ "id": 123, "name": "Филадельфия" }],
  "type_orders": [
    { "id": -1, "name": "Все", "type_order_ids": [] },
    { "id": 2, "name": "Самовывоз", "type_order_ids": [2] },
    { "id": 1, "name": "Доставка", "type_order_ids": [1] },
    { "id": 3, "name": "Зал", "type_order_ids": [3] },
    { "id": 4, "name": "Зал с собой", "type_order_ids": [4] }
  ],
  "stats": [],
  "promo_table": []
}
```

## Endpoint: `promo_items_stat/get_promos_period`

### Назначение

Autocomplete промокодов, активных в выбранный диапазон дат.

Список дедуплицируется по имени промокода.

### Request `data`

```json
{
  "date_start": "2026-04-01",
  "date_end": "2026-04-24",
  "choosePoint": [{ "id": 2, "name": "Ворошилова 12а" }],
  "search": "ЛЕГ"
}
```

### Поддерживаемые поля

- `date_start`
- `date_end`
- `choosePoint`
  - массив объектов `[{id, name}]`
  - если есть `id = -1`, backend использует все доступные точки
  - если точки не переданы, backend тоже использует все доступные точки
- `search`
  - строка для фильтрации по имени промокода

### Response

```json
{
  "st": true,
  "module_info": {},
  "promos": [
    {
      "id": "ЛЕГКО",
      "name": "ЛЕГКО",
      "promo_ids": [1116093, 1258251],
      "date_start": "2026-04-01",
      "date_end": "2026-04-30",
      "city_id": 1,
      "city_ids": [0, 1],
      "point_ids": [0, 2],
      "type_order": 1,
      "type_order_ids": [1],
      "usage_place_label": "Сайт+КЦ"
    }
  ]
}
```

## Endpoint: `promo_items_stat/get_legacy_stats`

### Назначение

Возвращает старую статистику вкладки в поле:

- `stats`

### Request `data`

```json
{
  "date_start": "2026-04-23",
  "date_end": "2026-04-23",
  "choosePoint": [{ "id": 2, "name": "Ворошилова 12а" }],
  "promo": { "id": "ЛЕГКО", "name": "ЛЕГКО" },
  "chooseItem": [{ "id": 123, "name": "Филадельфия" }]
}
```

### Поддерживаемые поля

- `date_start`
- `date_end`
- `choosePoint`
- `promo`
  - строка
  - объект `{id, name}`
- `promoName`
  - legacy-поле старой вкладки
- `promo_name`
  - строка
- `choosePromo`
  - строка или объект
- `chooseItem`
  - объект `{id, name}`
  - либо массив таких объектов
- `chooseItems`
  - массив объектов `{id, name}`

### Response

```json
{
  "st": true,
  "module_info": {},
  "stats": [
    {
      "name": "Всего заказов по промокоду за выбранный период",
      "count": 10,
      "summ": 12000
    }
  ]
}
```

## Endpoint: `promo_items_stat/get_promo_stats`

### Назначение

Возвращает новую расширенную таблицу статистики по промокодам в поле:

- `promo_table`

### Request `data`

```json
{
  "date_start": "2026-04-23",
  "date_end": "2026-04-23",
  "choosePoint": [{ "id": -1, "name": "Все" }],
  "promo": { "id": "ЛЕГКО", "name": "ЛЕГКО" },
  "chooseItem": [{ "id": 123, "name": "Филадельфия" }],
  "type_order": 1
}
```

### Поддерживаемые поля

- `date_start`
- `date_end`
- `choosePoint`
  - если есть `id = -1`, backend использует все доступные точки
- `promo`
  - single autocomplete
  - строка
  - объект `{id, name}`
- `promo_name`
  - строка
- `promoName`
  - legacy-поле, тоже поддерживается
- `choosePromo`
  - строка или объект
- `type_order`
  - scalar id
- `order_types`
  - массив id, если FE когда-либо начнет слать его напрямую
- `chooseTypeOrder`
  - legacy-совместимость
- `chooseItem`
  - сейчас принимается для контрактной совместимости
  - в новой таблице пока не участвует в расчетах

## Семантика Фильтров Новой Вкладки

### `choosePoint`

- фильтрует выборку по точкам
- `-1` означает все доступные пользователю точки

### `promo`

- single autocomplete
- если не передан, backend возвращает статистику по всем промокодам, попавшим в диапазон и остальные фильтры
- если передан, backend ограничивает таблицу выбранным именем промокода

### `type_order`

- маппинг в `type_order`:
  - `1` => `Доставка`
  - `2` => `Самовывоз`
  - `3` => `Зал`
  - `4` => `Зал с собой`
  - `-1` => без фильтра

### `chooseItem`

- поле сохранено в контракте
- в текущей реализации новой вкладки не влияет на `promo_table`
- если понадобится срез промокодов по товарам, это надо реализовывать как отдельное условие на source orders/order_items

## Response `promo_table`

```json
{
  "st": true,
  "module_info": {},
  "promo_table": [
    {
      "promo_id": "ЛЕГКО",
      "promo_name": "ЛЕГКО",
      "total_activations": 15,
      "repeat_activations": 6,
      "sum_before_discount": 25000,
      "sum_after_discount": 22100,
      "discount_value": 2900,
      "discount_percent": 11.6,
      "discount_label": "2900р | 11.6%",
      "avg_check_before_discount": 1666.67,
      "avg_check_after_discount": 1473.33,
      "avg_check_label": "1666.67р | 1473.33р",
      "active_client_activations": 9,
      "active_client_share": 18.37,
      "new_client_activations": 6,
      "new_client_share": 24.0,
      "unique_clients_count": 12,
      "unique_clients_share": 8.63,
      "usage_place_label": "Кафе+Сайт+КЦ",
      "usage_place_codes": [0, 1, 2]
    }
  ]
}
```

## Описание Метрик `promo_table`

### `promo_id`

- текущий backend использует имя промокода как стабильный ключ строки
- это сделано потому, что один и тот же промокод в таблице `promo` может существовать в нескольких строках с разными `id`

### `promo_name`

- имя промокода

### `total_activations`

- количество заказов с этим промокодом после применения всех фильтров

### `repeat_activations`

- количество заказов этого промокода от клиентов, которые использовали этот же промокод `2+` раз в выбранном диапазоне
- это не количество клиентов
- это именно количество заказов

### `sum_before_discount`

- сумма заказов до скидки
- источник: point-таблицы `baseN.orders`
- формула:
  - для `type_order = 1`
    - `summ + (free_drive = 1 ? 0 : summ_div)`
  - для остальных типов
    - `summ`

### `sum_after_discount`

- сумма заказов после скидки
- формула:
  - для `type_order = 1`
    - если `free_drive = 1`, то `IF(summ_promo = 0, 1, summ_promo)`
    - иначе `summ_promo + summ_div`
  - для остальных типов
    - `summ_promo`

### `discount_value`

- абсолютная величина скидки
- формула:
  - `sum_before_discount - sum_after_discount`
- если разница получилась отрицательной, backend отдает `0`

### `discount_percent`

- процент скидки
- формула:
  - `discount_value / sum_before_discount * 100`
- если `sum_before_discount = 0`, backend отдает `0`

### `discount_label`

- FE-ready строка:
  - `{discount_value}р | {discount_percent}%`

### `avg_check_before_discount`

- средний чек до скидки
- формула:
  - `sum_before_discount / total_activations`

### `avg_check_after_discount`

- средний чек после скидки
- формула:
  - `sum_after_discount / total_activations`

### `avg_check_label`

- FE-ready строка:
  - `{avg_check_before_discount}р | {avg_check_after_discount}р`

### `active_client_activations`

- количество активаций промокода действующими клиентами
- действующий клиент:
  - `site_users.first_order_id != текущий order_id`

### `active_client_share`

- доля `active_client_activations` от всех действующих клиентов, сделавших хотя бы 1 заказ в выбранном диапазоне и выбранных фильтрах

### `new_client_activations`

- количество активаций промокода новыми клиентами
- новый клиент:
  - `site_users.first_order_id = текущий order_id`

### `new_client_share`

- доля `new_client_activations` от всех новых клиентов, сделавших первый заказ в выбранном диапазоне и выбранных фильтрах

### `unique_clients_count`

- количество уникальных клиентов, активировавших промокод

### `unique_clients_share`

- доля уникальных клиентов, активировавших промокод, от всех активных клиентов
- активный клиент здесь:
  - клиент, совершивший 1 и более заказов в выбранном диапазоне и выбранных фильтрах

### `usage_place_label`

- место применения промокода по данным `site_orders_new.is_client`
- значения:
  - только `0` => `Кафе`
  - только `1` и/или `2` => `Сайт+КЦ`
  - смесь `0` с `1` или `2` => `Кафе+Сайт+КЦ`

### `usage_place_codes`

- сырые коды `is_client`, из которых собран `usage_place_label`

## Legacy `stats`

Старая вкладка сохранена без пересборки структуры ответа.

Особенности:

- если передан промокод, backend добавляет блоки статистики по промокоду
- если передан один или несколько товаров, backend добавляет блоки статистики по каждому товару
- если передано несколько товаров, блоки по товарам возвращаются последовательно в одном массиве `stats`

## Ограничения Текущей Реализации

- новая вкладка сейчас считает `promo_table` без фильтрации по `chooseItem`
- для клиентских и channel-метрик используется `jaco_site_rolls.site_orders_new`
- для денежных полей используется `baseN.orders`
- поэтому новая таблица зависит одновременно от source point orders и от нормализованной site-таблицы
