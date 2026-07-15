# Employees API contract

Frontend module: `/employees`

Laravel module: `employees`

All requests use the existing `api_laravel(module, method, data)` wrapper and must return JSON. Mutation responses should return `{ "st": true, "text": "..." }` or `{ "st": false, "text": "..." }`.

## Methods

### Управление должностями и отделами в иерархии

Методы доступны через модуль `employees` и требуют права `position_hierarchy`: просмотр для
получения данных, редактирование для изменений.

- `get_position`: `{ position_id }` → `{ position, units, full_menu, history }`
- `get_position_for_new` → шаблон `{ position, units, full_menu, history: [] }`
- `save_position`: `{ position, full_menu }` → создаёт или обновляет должность
- `copy_position`: `{ position_id, name }`
- `get_position_delete_info`: `{ position_id }` → `users[]`, которым назначена должность
- `delete_position`: `{ position_id }`, только когда `users[]` пуст
- `get_position_unit`: `{ unit_id }` → `{ unit, apps }`
- `save_position_unit`: `{ unit: { id?, name, sort, apps[] } }`

`position` использует поля `name`, `short_name`, `bonus`, `unit_id`, `is_graph`, `is_office`.
При сохранении `full_menu` содержит только технические поля: у модуля `modul_id`, `key_query`,
`is_active`, у права — `id`, `is_active`, `access`, `view`, `edit`. Названия и метаданные меню
обратно на сервер не отправляются.
Поле `kind` не используется и не принимается: порядок подчинённости задаёт иерархия найма.
`is_office` — свойство должности и не зависит от списка доступных кафе.
`history[]` содержит журнал создания, редактирования, копирования и удаления должности в формате
`HistoryLog`: `id`, `created_at`, `actor_name`, `event_type`, `diff_json`, `meta_json`.
Журнал учитывает основные поля, отдел, порядок, включённые модули и внутренние права доступа.

### `get_all`

Returns dictionaries, permissions, and optional initial stats.

Expected fields:

- `module_info.name`
- `cities[]`: `{ id, name }`
- `points[]`: `{ id, name, city_id }`
- `apps[]`: `{ id, name, auth_code_required, unit_id, unit_name, unit_sort, sort, is_office }`; варианты должностей упорядочены по отделу и иерархии.
- `cloth[]`: `{ id, name }`
- `access` or `my`: `can_edit`, `can_create`, `can_manage_cloth`, `show_access`
- optional `stat` / `experience`
- optional `stat_of` / `employment`

### `get_employees`

Request:

- `city_id`
- `point_id`
- `point_ids`
- `app`
- `app_id`
- `search`
- `page`
- `rows`
- `sort_by`: `fio | position | cafe | employment_date`, по умолчанию `position`
- `sort_direction`: `asc | desc`, по умолчанию `asc`

Returns:

- `employees[]` or `users[]`
- `total_rows` or `total`
- `stat` / `experience`
- `stat_of` / `employment`
- `analytics` — агрегаты по полной выборке до пагинации:
  - `headcount`, `hired_30`, `dismissed_30`
  - `health`: `valid`, `expiring`, `blocked`
  - `absences`: `today`, `upcoming_7`
  - `clothing`: `missing`
  - `cafes[]`: `name`, `headcount`, `official`, `hired_30`, `health_risk`, `health_blocked`, `absent_today`, `absence_upcoming_7`, `positions[]` с теми же полями
  - для офиса `cafes[].units[]`: `id`, `name`, `positions[]` и те же агрегаты; отделы и должности сортируются по настройкам справочника и численности

Агрегаты возвращаются только при праве `main_stats` уровня `access`. Сервер дополнительно ограничивает сотрудников и все агрегаты кафе, доступными текущему пользователю. Параметры фильтра не могут расширить этот набор.

Employee row fields are the existing fields from `site_user_manager` and `experience`: `id`, `fam`, `name`, `otc`, `login`, `app_name`, `point`, `date_registration`, `exp`, `acc_to_kas`, `status`, `type`, `img_name`, `img_update`, `photo`, `is_active`, `is_office`, `unit_name`, `unit_sort`, `app_sort`.

`is_office` относится к должности, а не к `point_id` или доступам в кафе. Значение `NULL` остаётся неклассифицированным до ручной настройки должности; доступы из `user_point_access` не изменяются.

## Права

Доступ к карточке задаётся на уровне вкладок через `access`: `basic_tab`, `work_tab`, `absences_tab`, `health_book_tab`, `clothing_tab`. Поля внутри вкладок не имеют отдельных прав. Отдельно остаются `add_employee`, `position_hierarchy` и `main_stats`.

Вкладка «Основное» содержит фото, ФИО, телефон, дату рождения, ИНН и код авторизации. Вкладка «Работа» содержит должность, дату трудоустройства, официальный статус, организацию, стаж и доступные кафе. При назначении должности «Уволен» сервер сбрасывает `acc_to_kas`.

### `get_employee`

Request:

- `user_id`

Returns a full employee card:

- `user`
- `appointment[]`
- `point_list[]`
- `health_book`
- optional `health_items[]`
- `cloth.active[]`
- `cloth.non_active[]`
- `history[]`
- `absence_history[]`

### Mutations

- `create_employee`: multipart when a photo is selected, otherwise JSON. Payload: `{ user, employee, health_items, cloth_items, absences }`; optional multipart `file` contains the employee photo
- `save_basic`: `{ user_id, user, employee }`
- `apply_work_change`: `{ user_id, app_id, point_id, point_access, point_access_ids, is_active, textDel, date_start_day, user }`
- `save_date_registration`: `{ user_id, date_registration }`
- `add_absence`: `{ user_id, typeVacation, type, vacationStart, vacationEnd, date_start, date_end, commentVacation, comment }`
- `save_health_book`: `{ user_id, items, type_2_start, type_2_end, ... }`
- `issue_cloth`: `{ user_id, cloth_id, item, date_start }`
- `return_cloth`: `{ user_id, cloth_id, item_id, date_end }`
- `get_cloth_list`: no required payload
- `save_cloth_list`: `{ items }`
- `delete_cloth_item`: `{ id, item }`

After successful mutations, the frontend refreshes `get_employees` and, when a card is open, `get_employee`.
