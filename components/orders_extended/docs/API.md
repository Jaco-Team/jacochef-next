# orders_extended — FE API map

## Общий вызов

Используется существующий helper `useApi("orders_extended")`. Поэтому FE вызывает только методы нового prefix:

`POST /api/orders_extended/{method}`

Form-поля формируются общим helper: `method`, `module=orders_extended`, `version=2`, `login`, `data`.

`data` передаётся JSON-строкой. Ответ — текущий `GlobalResource` payload.

## `get_all`

Запрос:

```json
{}
```

Ответ содержит:

- `st` — успешность ответа;
- `module_info` — registry-информация модуля;
- `acces` — raw access payload middleware;
- `points` — доступные пользователю точки;
- `all_items` — позиции для фильтра отчёта;
- `items` — дополнительный список позиций контракта.
- `categories` — видимые категории;
- `sources` — `2: Сайт`, `0: Кафе`, `1: КЦ`;
- `order_types` — `1: Доставка`, `2: Самовывоз`, `3: Зал`, `4: Зал - с собой`;
- `payment_types` — `2: Безнал`, `1: Нал`.

Права:

- `orders_extended` — доступ к модулю;
- `export_items` — кнопка экспорта.

FE не переименовывает поля raw access и использует существующий `handleUserAccess`.

## `get_orders_more`

Метод принимает расширенные поля модуля.

```json
{
  "date_start_true": "YYYY-MM-DD",
  "date_end_true": "YYYY-MM-DD",
  "error_status": "all",
  "delivery_status": "all",
  "count_orders_min": 0,
  "count_orders_max": 0,
  "avg_check_min": 0,
  "avg_check_max": 0,
  "min_summ": 0,
  "max_summ": 0,
  "promo": "",
  "no_promo": false,
  "param": { "id": "all", "name": "Все" },
  "point": [{ "id": 1, "name": "..." }],
  "item": [{ "id": 1, "name": "..." }],
  "category_ids": [1, 2],
  "source_ids": [0, 2],
  "order_type_ids": [1, 2],
  "payment_type_ids": [2],
  "with_promo": false,
  "page": 1,
  "perPage": 10,
  "sort_by": "id",
  "sort_dir": "desc"
}
```

`point` заполняется через `CityCafeAutocomplete2` и содержит выбранные пользователем точки.

Допустимые значения `param.id`: `all`, `new`, `current`, `lost`.

Успешный ответ:

- `orders` — строки отчёта;
- `total` — общее число строк;
- `totals` — totals for the complete filtered result set, independent of pagination:
  - `count` — number of filtered order rows;
  - `order_price_sum` — sum of `order_price`;
  - `avg_check_avg` — arithmetic average of `avg_check`;
- `url` — URL export-файла либо пустая строка.
- Row fields additionally include `avg_check`, `promo_name`, `client_status`, `has_error`, and `delivery_status`.
- `client_status`: `new`, `current`, or `null` when the client cannot be determined.
- `has_error`: boolean based on exact `point_id + order_id` matching.
- `delivery_status`: `on_time`, `late`, or `null` for non-delivery/undetermined SLA.

Ошибка: `st=false`, `text` содержит причину (`Выберите даты`, `Выберите точку`, `Не найдено заказов`).

## `get_orders_more_files`

Принимает тот же расширенный фильтр без pagination-ограничения. Возвращает `url` на `.xlsx` с заголовком модуля, значениями фильтров, оформленными заголовками, результатами и строкой итогов. Вызывать только при `export_items`.

## `get_order_orders`

Запрос:

```json
{ "point_id": 1, "order_id": 123 }
```

Ответ содержит поля заказа, позиций и ошибки заказа. Метод используется строковым modal flow.

Форма сбора отзывов в модалке заказа этого модуля не используется. Модалка показывает только детали заказа.

## Семантика расширенных фильтров

- `avg_check_min/max`: `SUM(site_orders_new.summ) / COUNT(*)` по номеру клиента, выбранным точкам и периоду `date_start_true..date_end_true`; `0` и `null` отключают соответствующую границу.
- `error_status`: `with_error` выбирает заказы с ошибкой, совпавшей по `point_id + order_id`; `without_error` — без такой ошибки; `all` отключает фильтр. Если новое поле отсутствует, прежний `is_show_claim=true` трактуется как `with_error`.
- `delivery_status`: `on_time` выбирает доставки с `type_all_overtime IN (1,2)`, `late` — доставки с `type_all_overtime=3`; `all` отключает фильтр. Другие типы заказов и неопределённый срок не входят в выбранные статусы.
- `category_ids` и `item`: внутри каждого списка совпадает любое значение; если заданы оба списка, одна позиция заказа должна соответствовать и категории, и item.
- `source_ids`: точные `site_orders_new.is_client` IDs `0/1/2`.
- `order_type_ids`: точные `orders.type_order` IDs `1..4`.
- `payment_type_ids`: `1` — `orders.type_pay=1` (`Нал`), `2` — `orders.type_pay!=1` (`Безнал`).
- Sorting is server-side before pagination. Allowed `sort_by`: `id`, `source`, `type_user`, `client_status`, `address`, `type_order`, `status`, `has_error`, `delivery_status`, `order_price`, `avg_check`, `promo_name`, `type_pay`, `driver`; `sort_dir`: `asc` or `desc`.
- `promo`: точное имя промокода; `no_promo`: `promo_id=0`; `with_promo`: `promo_id>0`. Включённые фильтры объединяются через `AND`; `no_promo` с `promo`/`with_promo` не даёт строк.
- `param.id=lost`: предыдущий qualifying order в 90 дней до периода, qualifying order в выбранном периоде и отсутствие qualifying delivery/self-pickup order в 90 дней после периода. Qualifying order: `type_order IN (1,2)`, `client_id != 0`.
- Заказы без определяемого клиента не входят в `param.id=new/current`, получают `client_status=null`, а недоступный средний чек возвращается как `null`.

DOCX table fields: `source`, `type_user`, address, `type_order`, `status`, `order_price`, `avg_check`, `promo_name`, `type_pay`, `driver`. Fields excluded by the DOCX remain in JSON for compatibility.
