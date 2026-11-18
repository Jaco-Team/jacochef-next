# Регистрация ошибок

Модуль ведёт жалобу по заказу от регистрации до решения. Одна жалоба объединяет независимые ошибки позиции и ошибки всего заказа. v2 пишет только в свои таблицы `errors_management_*`; legacy используется только для чтения заказов и исторической статистики.

## Документы

- [Требования и покрытие](./docs/TASK.md)
- [План](./docs/PLAN.md)
- [Бизнес-процесс](./docs/BUSINESS_PROCESS.md)
- [Архитектура](./docs/ARCHITECTURE.md)
- [Доступ](./docs/ACCESS.md)
- [Валидация](./docs/VALIDATION.md)
- [Итоговый обзор](./docs/FINAL.md)
- [История изменений](./docs/CHANGELOG.md)

## Контракт API (frontend)

Все запросы идут через `useApi("errors_management")`, payload — в `data`.

| Endpoint | Назначение | Что использует frontend |
| --- | --- | --- |
| `get_all` | города, кафе, `site_cats`, `permissions`, `acces` | вкладки и права только из `permissions` |
| `get_orders` | legacy-поиск заказов | фильтры кафе/«все точки в городе» (`point_id: 0`), период, время `time_from`/`time_to`, тип, канал, этап, сумма, телефон; период не передаётся только для номера заказа из цифр |
| `get_order_new` | состав заказа | модалка заказа; телефон скрывается без права `tel` |
| `v2/journal` | журнал | `filters.city_id`, `point_id` (нет — все доступные точки), `order_id` (только цифры, иначе подсказка и фильтр не отправляется), период, `order_source`, `registration_source`, `statuses`; строки с `has_removed_errors` |
| `v2/context` | позиции, каталог, этапы, решения | регистрация |
| `v2/create` | регистрация | `client_request_id`, `errors[].quantity` |
| `v2/detail`, `v2/transition`, `v2/errors/remove` | деталь жалобы | всегда берётся возвращённая деталь с `available_commands` |
| `v2/statistics` | статистика | `filters.city_id` без `point_id` для «Все точки в городе» |
| `v2/settings`, `v2/settings/save`, `v2/settings/history` | каталог | область «Все кафе (общие)» = `point_id: null` |

Доменные ошибки v2 приходят как HTTP 200 `{st: false, text, errors?}`. Frontend показывает `text`, а поля из `errors` — рядом с формой (ошибки регистрации по `errors.N.*`, решения по `resolution_errors.N.*`, поля `comment`, `error_amount`, `changed_amount`, `common_comment`, `resolution_promo_code`; настройки по `name`, `description`, `sort_order`, `parent_id`, `rules.*`; снятие по `comment`). Сетевые сбои показываются общим сообщением. Для локальной разработки API — `http://127.0.0.1:8000/api`; перед любой записью адрес нужно подтвердить.
