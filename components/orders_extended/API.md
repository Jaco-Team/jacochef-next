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

Ответ первого переноса содержит:

- `st` — успешность ответа;
- `module_info` — registry-информация модуля;
- `acces` — raw access payload middleware;
- `points` — доступные пользователю точки;
- `all_items` — позиции для фильтра старого отчёта;
- `items` — дополнительный legacy список позиций.

Права:

- `orders_extended` — доступ к модулю;
- `export_items` — кнопка экспорта;
- `send_feedback` — окно оценки заказа.

FE не переименовывает поля raw access и использует существующий `handleUserAccess`.

## `get_orders_more`

Метод временно сохраняет payload старого `site_clients/get_orders_more`.

```json
{
  "date_start_true": "YYYY-MM-DD",
  "date_end_true": "YYYY-MM-DD",
  "date_start_false": "YYYY-MM-DD|null",
  "date_end_false": "YYYY-MM-DD|null",
  "is_show_claim": false,
  "is_show_claim_last": false,
  "is_show_marketing": false,
  "count_orders_min": 0,
  "count_orders_max": 0,
  "min_summ": 0,
  "max_summ": 0,
  "promo": "",
  "no_promo": false,
  "param": { "id": "all", "name": "Найти всех" },
  "point": [{ "id": 1, "name": "..." }],
  "item": [{ "id": 1, "name": "..." }],
  "number": null,
  "page": 1,
  "perPage": 10
}
```

Допустимые текущие значения `param.id`: `all`, `new`, `current`.

Успешный ответ:

- `orders` — строки legacy отчёта;
- `total` — общее число строк;
- `url` — URL export-файла либо пустая строка.

Ошибка: `st=false`, `text` содержит причину (`Выберите даты`, `Выберите точку`, `Не найдено заказов`).

## `get_orders_more_files`

Принимает тот же фильтр без pagination-ограничения. Возвращает `url`. Вызывать только при `export_items`.

## `get_order_orders`

Запрос:

```json
{ "point_id": 1, "order_id": 123 }
```

Ответ сохраняет legacy поля заказа, позиций и ошибки заказа. Метод используется строковым modal flow.

## `save_feedbacks`

Метод сохраняет legacy request/response shape `site_clients/save_feedbacks`. Вызывать только при `send_feedback`.

## Отложенный контракт

Следующий backend/FE этап должен отдельно согласовать нормализованные поля задачи: `avg_check`, `category_ids`, `source_ids`, `order_type_ids`, `payment_type_ids`, `with_promo`, а также точную семантику клиента `Ушедшие`. До этого FE не должен отправлять эти поля как новый контракт и не должен делать предположений о колонках таблицы.
