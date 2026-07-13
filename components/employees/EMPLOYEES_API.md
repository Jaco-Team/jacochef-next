# Employees API contract

Frontend module: `/employees`

Laravel module: `employees`

All requests use the existing `api_laravel(module, method, data)` wrapper and must return JSON. Mutation responses should return `{ "st": true, "text": "..." }` or `{ "st": false, "text": "..." }`.

## Methods

### `get_all`

Returns dictionaries, permissions, and optional initial stats.

Expected fields:

- `module_info.name`
- `cities[]`: `{ id, name }`
- `points[]`: `{ id, name, city_id }`
- `apps[]`: `{ id, name, auth_code_required }`
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

Сервер дополнительно ограничивает сотрудников и все агрегаты кафе, доступными текущему пользователю. Параметры фильтра не могут расширить этот набор.

Employee row fields are the existing fields from `site_user_manager` and `experience`: `id`, `fam`, `name`, `otc`, `login`, `app_name`, `point`, `date_registration`, `exp`, `acc_to_kas`, `status`, `type`, `img_name`, `img_update`, `photo`, `is_active`.

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
