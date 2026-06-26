# Staff_schedule API

## Базовый префикс

- `/api/staff_schedule/*`

## Общие правила

- Все методы вызываются под `CheckToken`.
- Формат успеха: `st = true`.
- Формат ошибки: `st = false`, `text`.
- Тело запроса, как и в старых Chef-модулях, передаётся в `data`.
- На текущем milestone ответы повторяют legacy `work_schedule`.

## Методы

### `POST|ANY /api/staff_schedule/get_all`

Назначение:

- первичная загрузка модуля

Вход:

- `data` не обязателен

Выход:

- `module_info`
- `point_list`
- `months`
- `access`

### `POST|ANY /api/staff_schedule/get_graph`

Назначение:

- получить график по точке и месяцу

Вход:

- `data.point_id` `int`
- `data.month` `string` в формате `YYYY-MM`

Выход:

- `date`
- `one`
- `two`
- `part`
- `show_zp_one`
- `show_zp_two`
- `my`
- `show_zp`
- `kind`
- `lv_cafe`
- `lv_dir`
- `lv_dir_new`
- `add_lv`
- `err`
- `checj`
- `access`
- `asd`

В строках пользователей внутри `date.one.users.users` и `date.two.users.users` дополнительно есть:

- `current_schedule` объект с текущим распознанным шаблоном графика
- `current_schedule_text` строка для хаба редактирования, например `С 15 числа 2/2`

### `POST|ANY /api/staff_schedule/get_user_day`

Назначение:

- карточка сотрудника за день

Вход:

- `data.date`
- `data.date_start`
- `data.user_id`
- `data.app_id`
- `data.smena_id`

Выход:

- `h_info`
- `post`
- `other_app`
- `show_bonus`
- `my`

### `POST|ANY /api/staff_schedule/get_user_month`

Назначение:

- месячные часы сотрудника

Вход:

- `data.date` префикс месяца `YYYY-MM`
- `data.date_start`
- `data.user_id`
- `data.app_id`
- `data.smena_id`

Выход:

- `h_info`
- `my`
- `hours_days`

### `POST|ANY /api/staff_schedule/get_all_for_new_smena`

Назначение:

- список свободных сотрудников для новой смены

Вход:

- `data.point_id`

Выход:

- `free_users`

### `POST|ANY /api/staff_schedule/get_one_smena`

Назначение:

- получить смену и список сотрудников для редактирования

Вход:

- `data.id`
- `data.point_id`

Выход:

- `smena`
- `free_users`

### `POST|ANY /api/staff_schedule/save_fastSmena`

Назначение:

- быстрый перенос сотрудника в другую смену

Вход:

- `data.new_smena_id`
- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.date` месяц в формате `YYYY-MM`
- `data.part`

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/save_user_day`

Назначение:

- сохранить день сотрудника

Вход:

- `data.date`
- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.hours[]`:
  - `time_start`
  - `time_end`
- `data.point_id` при проверке редактирования периода
- `data.new_app` опционально
- `data.mentor_id` опционально
- `data.user_temp` и `data.type_healf` обязательны для сегодняшнего дня, если есть часы

Выход:

- `hours`
- `data`

### `POST|ANY /api/staff_schedule/save_user_month`

Назначение:

- сохранить месячный набор часов сотрудника

Вход:

- `data.date` префикс месяца `YYYY-MM`
- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.dates[]`:
  - `date`
  - `time_start`
  - `time_end`
- `data.new_app` опционально
- `data.mentor_id` опционально

Выход:

- `test`
- `test1`
- `test2`

### `POST|ANY /api/staff_schedule/saveNewSmena`

Назначение:

- создать новую смену

Вход:

- `data.point_id`
- `data.name`
- `data.users[]`:
  - `id`
  - `is_my`

Выход:

- `text`

### `POST|ANY /api/staff_schedule/saveEditSmena`

Назначение:

- сохранить состав и название смены

Вход:

- `data.id`
- `data.name`
- `data.users[]`:
  - `id`
  - `app_id`
  - `is_my`

Выход:

- `text`

### `POST|ANY /api/staff_schedule/deleteSmena`

Назначение:

- удалить пустую смену

Вход:

- `data.id`
- `data.users[]`

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/save_fastPoint`

Назначение:

- быстро перевести сотрудника на другую точку

Вход:

- `data.user_id`
- `data.app_id`
- `data.new_point_id`
- `data.new_smena_id`

Выход:

- `text`
- `test`

### `POST|ANY /api/staff_schedule/save_fastTimeWeekOne`

Назначение:

- быстро проставить сотруднику шаблон часов на период

Вход:

- `data.user_id`
- `data.smena_id`
- `data.app_id`
- `data.date` месяц `YYYY-MM`
- `data.type`

Выход:

- только стандартный success/error:
  - `st = true`

### `POST|ANY /api/staff_schedule/save_fastTime`

Назначение:

- быстро проставить сотруднику шаблон часов на весь месяц

Вход:

- `data.user_id`
- `data.smena_id`
- `data.app_id`
- `data.date` месяц `YYYY-MM`
- `data.type` старт шаблона, `1..4`
- `data.new_app` опционально

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/downloadWS`

Назначение:

- выгрузить график работы в `.xls`

Вход:

- `data.point_id`
- `data.date_start` дата начала диапазона `YYYY-MM-DD`
- `data.date_end` дата конца диапазона `YYYY-MM-DD`

Права:

- backend дополнительно проверяет доступ `export_excel`

Выход:

- `$arrayOfDates`
- `url`

Примечание:

- FE-flow: после выбора диапазона вызвать метод и открыть `response.data.url` / `response.url`

### `POST|ANY /api/staff_schedule/downloadHJ`

Назначение:

- выгрузить журнал здоровья в `.xls`

Вход:

- `data.point_id`
- `data.date_start` дата начала диапазона `YYYY-MM-DD`
- `data.date_end` дата конца диапазона `YYYY-MM-DD`

Права:

- backend дополнительно проверяет доступ `export_excel`

Выход:

- `$arrayOfDates`
- `url`

Примечание:

- FE-flow: после выбора диапазона вызвать метод и открыть `response.data.url` / `response.url`

## Цвета графика

Рабочие ячейки таблицы берут цвет из `data.dates[].info.color`, а цвет текста из
`data.dates[].info.colorT`. Эти цвета приходят из backend и не вычисляются на FE.

| Цвет      | Текст                                                           | Значение / источник                                                                                               |
| --------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `#45161c` | `#fff`                                                          | Сегодня есть рабочий день, но `user_temp` пустой, начиная с `2023-05-01`. Предупреждение по здоровью/температуре. |
| `#d5265b` | `#fff`                                                          | `my_color_day = red` или `pink`. Пользовательская backend-отметка дня.                                            |
| `#ffba00` | `#fff` для пользовательской отметки, `#000` для дефолтной смены | `my_color_day = yellow` или `light_pink`, либо дефолтное время `16:00-22:00` в новом сервисе.                     |
| `#000`    | `#fff`                                                          | `my_color_day = black`. Пользовательская backend-отметка дня.                                                     |
| `#95d26b` | `#000`                                                          | Дефолтная полная смена нового `staff_schedule`: `10:00:00-22:00:00`.                                              |
| `#62b0ff` | `#000`                                                          | Дефолтная первая половина нового `staff_schedule`: `10:00:00-16:00:00`.                                           |
| `#926eae` | `#000`                                                          | Fallback: один нестандартный интервал или больше одного интервала в день.                                         |

## Замечания для FE

- Для `get_graph` использовать `data.month`.
- Поле `hours_days` использовать в новом API.
- Цвета, блокировки ЗП, доступы и прочие странные legacy-поля пока не нормализуются.
