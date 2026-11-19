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
| `get_all` | города, кафе, `permissions`, `acces`, дерево `err_cats`, `site_cats`, `all_stages`, `solutions` | вкладки и права только из `permissions`; дерево — для вкладки «Варианты решения жалоб» |
| `get_orders` | legacy-поиск заказов | фильтры кафе/«все точки в городе» (`point_id: 0`), период, время `time_from`/`time_to`, тип, канал, этап, сумма, телефон; период не передаётся только для номера заказа из цифр |
| `get_order_new` | состав заказа | модалка заказа; телефон скрывается без права `tel` |
| `v2/journal` | журнал | `filters.city_id`, `point_id` (нет — все доступные точки), `order_id` (только цифры, иначе подсказка и фильтр не отправляется), период, `order_source`, `registration_source`, `statuses`; строки с `has_removed_errors` |
| `v2/context` | `tree`, `stages` (с описаниями), `solutions`, `positions[]` с `site_category_id` и `product_kind` | каскад «Категория проблемы → … → Проблема» по позиции, этапы по типу товара |
| `v2/photos/upload` | multipart `file` + `point_id` | фото ошибки до сохранения, ответ `{photo: {id, url}}` |
| `v2/create` | регистрация | `errors[]`: `error_id` (лист дерева), `stage_id`, `solution_id`, `photo_ids`, `quantity`, `ingredient_id`; `client_request_id` |
| `v2/detail`, `v2/transition`, `v2/errors/remove` | деталь жалобы | всегда берётся возвращённая деталь с `available_commands`; у ошибок `category_name`, `problem_name`, `photos[]`, `solution_ids` (решения при завершении — только из списка ошибки) |
| `v2/statistics` | статистика | `filters.city_id` без `point_id` для «Все точки в городе» |
| `add_cat`, `update_cat`, `set_active_cat`, `delete_cat` | дерево категорий /option_to_win | `data.cat` в CSV-колонках `err_desc_cats`; только с `settings_edit` |

Доменные ошибки v2 приходят как HTTP 200 `{st: false, text, errors?}`. Frontend показывает `text`, а поля из `errors` — рядом с формой (ошибки регистрации по `errors.N.*`, решения по `resolution_errors.N.*`, поля `comment`, `error_amount`, `changed_amount`, `common_comment`, `resolution_promo_code`; фото по `errors.N.photo_ids` и `file`; снятие по `comment`). Сетевые сбои показываются общим сообщением. Для локальной разработки API — `http://127.0.0.1:8000/api`; перед любой записью адрес нужно подтвердить.
