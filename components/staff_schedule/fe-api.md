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
- `data.user_temp` и `data.type_healf` сохраняются только для текущего дня и только если у дня есть часы; для других случаев backend возвращает ошибку

Ограничения редактирования:

- backend не принимает редактирование прошлых дат для обычных ролей
- исключение: `MEGA` и `mega_dir` могут редактировать прошлые даты
- для остальных ролей backend разрешает редактирование:
  - текущего дня
  - будущих дат
  - дат не раньше открытого payroll-периода точки, если передан `data.point_id`
- если дата не проходит это правило, backend возвращает `st = false`, `text = "Ты не можешь редактировать предыдущие дни"`
- `data.hours`, `data.new_app`, `data.mentor_id` подчиняются этому правилу периода
- `data.user_temp`, `data.type_healf` имеют более жесткое правило:
  - только текущий день
  - только если у дня есть часы

Рекомендация для FE:

- не пытаться access-gate это только по общему module access
- отдельно дизейблить редактирование полей дня по дате и роли
- для прошлых дат:
  - блокировать изменение `hours`, `new_app`, `mentor_id`, если пользователь не `MEGA|mega_dir` и дата вне разрешенного периода
  - всегда блокировать изменение `user_temp`, `type_healf`, если дата не равна текущей
- backend validation остается источником правды, FE нужен только чтобы не слать заведомо запрещенные save-запросы

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

Ограничения редактирования:

- для обычных ролей backend не принимает месячное редактирование прошлых месяцев
- исключение: `MEGA` может редактировать прошлые месяцы
- если месяц запрещен, backend возвращает `st = false`, `text = "Ты не можешь редактировать предыдущие дни"`

Рекомендация для FE:

- дизейблить month-edit для прошедших месяцев, если пользователь не `MEGA`

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

### `POST|ANY /api/staff_schedule/save_fastTime_arr_mounth`

Назначение:

- массово проставить шаблон часов на весь месяц для выбранных сотрудников

Вход:

- `data.date` месяц `YYYY-MM`
- `data.type` старт шаблона, `1..4`
- `data.users[]`:
  - `user_id`
  - `smena_id`
  - `app_id`
  - `new_app` опционально

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/save_fastTime_arr_two_week`

Назначение:

- массово проставить шаблон часов на половину месяца для выбранных сотрудников

Вход:

- `data.date` месяц `YYYY-MM`
- `data.type` старт шаблона:
  - `1..4` для первой половины
  - `16..19` для второй половины
- `data.users[]`:
  - `user_id`
  - `smena_id`
  - `app_id`
  - `new_app` опционально

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

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

### `POST|ANY /api/staff_schedule/save_userPriceH`

Назначение:

- сохранить часовую ставку за половину месяца

Вход:

- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.date` месяц `YYYY-MM`
- `data.part` `0 | 1`
- `data.price`

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/save_dir_lv`

Назначение:

- сохранить добавочный уровень директора для точки и месяца

Вход:

- `data.point_id`
- `data.date` месяц `YYYY-MM`
- `data.dir_lv`

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/save_dop_bonus`

Назначение:

- включить или отменить командный бонус за половину месяца

Вход:

- `data.point_id`
- `data.date` месяц `YYYY-MM`
- `data.part` `0 | 1`
- `data.type`:
  - `1` включить
  - `2` отменить

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/del_dop_bonus_user`

Назначение:

- снять командный бонус у конкретного сотрудника за период

Вход:

- `data.point_id`
- `data.user_id`
- `data.data` месяц `YYYY-MM`
- `data.part` `0 | 1`

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/save_user_give_price`

Назначение:

- сохранить выдачу наличными

Вход:

- `data.date` дата строки `YYYY-MM-DD`
- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.give_price`

Выход:

- при успехе:
  - `text`
- при ошибке лимита:
  - `text`
  - `my_price`
  - `this_date`
  - `price_data`
  - `post_data`
  - `test`
  - `test__`
  - `check`

### `POST|ANY /api/staff_schedule/save_user_give_cart_price`

Назначение:

- сохранить выдачу на карту

Вход:

- `data.date` дата строки `YYYY-MM-DD`
- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.give_price`

Выход:

- при успехе:
  - `text`
- при ошибке лимита:
  - `text`
  - `my_price`
  - `this_date`
  - `price_data`
  - `post_data`
  - `test`
  - `test__`
  - `check`

### `POST|ANY /api/staff_schedule/save_user_withheld`

Назначение:

- сохранить удержание

Вход:

- `data.date` дата строки `YYYY-MM-DD`
- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.withheld`

Выход:

- при успехе:
  - `text`
- при ошибке лимита:
  - `text`
  - `my_price`
  - `this_date`
  - `price_data`
  - `post_data`
  - `test`
  - `test__`
  - `check`

### `POST|ANY /api/staff_schedule/save_dirBonus`

Назначение:

- сохранить директорский бонус на вторую половину месяца

Вход:

- `data.user_id`
- `data.date` месяц `YYYY-MM`
- `data.bonus`

Выход:

- `text`

### `POST|ANY /api/staff_schedule/get_my_err_order`

Назначение:

- получить карточку обжалования ошибки заказа

Вход:

- `data.id` id ошибки
- `data.row_id` id строки ошибки

Выход:

- legacy-совместимая карточка ошибки заказа:
  - поля строки `err_order_price_users`
  - `full_user_name`
  - `order_id`
  - `new_order_id`
  - `date_time_order`
  - `new_status`
  - `new_text_1`
  - `new_text_2`
  - `date_time_close`
  - `order_desc`
  - `need_row`
  - `order_items`
  - `imgs`
  - `is_edit`
  - отладочные legacy-поля `is_edit_test`, `is_edit_test_check`, `is_edit_test_check_2`

### `POST|ANY /api/staff_schedule/get_my_err_cam`

Назначение:

- получить карточку обжалования ошибки камеры

Вход:

- `data.id` id ошибки

Выход:

- legacy-совместимая карточка ошибки камеры:
  - `id`
  - `point_id`
  - `status`
  - `comment`
  - `fine_name`
  - `price`
  - `date_time_fine`
  - `text_one`
  - `text_two`
  - `date_time_close`
  - `is_delete`
  - `imgs`
  - `is_edit`

### `POST|ANY /api/staff_schedule/save_fake_orders`

Назначение:

- отправить обжалование по ошибке заказа

Вход:

- `data.err_id`
- `data.row_id`
- `data.text`

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/save_fake_cam`

Назначение:

- отправить обжалование по ошибке камеры

Вход:

- `data.id`
- `data.text`

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

- backend проверяет доступ к модулю `staff_schedule`

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

- backend проверяет доступ к модулю `staff_schedule`

Выход:

- `$arrayOfDates`
- `url`

Примечание:

- FE-flow: после выбора диапазона вызвать метод и открыть `response.data.url` / `response.url`

## Замечания для FE

- Для `get_graph` использовать `data.month`.
- Поле `hours_days` использовать в новом API.

## Статус для FE

Готово и можно подключать:

- payroll/admin write endpoints:
  - `save_userPriceH`
  - `save_dir_lv`
  - `save_dop_bonus`
  - `del_dop_bonus_user`
  - `save_user_give_price`
  - `save_user_give_cart_price`
  - `save_user_withheld`
  - `save_dirBonus`
- single-user schedule write endpoints:
  - `save_user_day`
  - `save_user_month`
  - `save_fastSmena`
  - `save_fastPoint`
  - `save_fastTime`
  - `save_fastTimeWeekOne`
- bulk schedule endpoints:
  - `save_fastTime_arr_mounth`
  - `save_fastTime_arr_two_week`
- err appeal flow:
  - `get_my_err_order`
  - `get_my_err_cam`
  - `save_fake_orders`
  - `save_fake_cam`

Вне backend `staff_schedule` и все еще требует FE-подключения/отдельной проверки:

- переход меню/роута со старого экрана на `/staff_schedule`
- фактический UX print/download в интерфейсе

### Legacy-поля по endpoints

#### `get_all`

Пока не нормализуются:

- `module_info` приходит в старой форме Chef-модулей
- `point_list` сохраняет legacy-поля точки
- `months` сохраняет текущий формат списка месяцев
- `access` сохраняет текущую карту доступов

#### `get_graph`

Пока не нормализуются:

- верхнеуровневые legacy-поля `show_zp_one`, `show_zp_two`, `show_zp`, `kind`, `lv_cafe`, `lv_dir`, `lv_dir_new`, `add_lv`, `err`, `checj`, `asd`
- `access` сохраняет текущие ключи доступов без переименования
- `date.one` / `date.two` сохраняют старую структуру половин месяца
- `date.*.users.smens` и `date.*.users.smens_full` сохраняют текущий формат смен
- строки сотрудников внутри `date.*.users.users` сохраняют все старые поля расчётов, ЗП, бонусов, удержаний, ошибок, доступа к кассе, роли, смены и списков для быстрых действий
- `dates[]` у сотрудника сохраняет старую форму ячеек календаря: `date`, `info`, `info.full_hours`, цвета `color` / `colorT` и прочие поля дня
- `bonus`, `order_stat`, `other_summ`, `bonus_other` внутри половин месяца сохраняют legacy-формат

Новые поля добавлены поверх старого контракта:

- `current_schedule`
- `current_schedule_text`

#### `get_user_day`

Пока не нормализуются:

- `h_info` сохраняет legacy-поля дня, включая часы, бонусы, температуру/здоровье, наставника, должность на день и служебные id
- `post` возвращается как отладочно-совместимое legacy-поле
- `other_app` сохраняет текущий список доступных должностей для смены роли на день
- `show_bonus` сохраняет старую логику видимости бонусов
- `my` сохраняет текущий профиль пользователя с legacy-полями прав и роли

#### `get_user_month`

Пока не нормализуются:

- `h_info` сохраняет legacy-поля месячной карточки сотрудника
- `my` сохраняет текущий профиль пользователя с legacy-полями прав и роли
- `hours_days` сохраняет текущую структуру списка дат и диапазонов часов

#### `get_all_for_new_smena`

Пока не нормализуются:

- `free_users` сохраняет текущие поля сотрудника, должности, точки и признака выбора

#### `get_one_smena`

Пока не нормализуются:

- `smena` сохраняет текущие поля смены
- `free_users` сохраняет текущие поля сотрудников и признак включения в смену

#### `save_fastSmena`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_user_day`

Пока не нормализуются:

- `hours` возвращает сохранённые часы в текущем legacy-формате
- `data` возвращает входной payload/служебные поля как в старом flow

#### `save_user_month`

Пока не нормализуются:

- `test`, `test1`, `test2` остаются legacy-полями ответа и не должны использоваться как новый продуктовый контракт

#### `saveNewSmena`

Пока не нормализуется:

- `text` остаётся в ответе для совместимости

#### `saveEditSmena`

Пока не нормализуется:

- `text` остаётся в ответе для совместимости

#### `deleteSmena`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_fastPoint`

Пока не нормализуются:

- `text` остаётся в ответе для совместимости
- `test` остаётся в ответе для совместимости

#### `save_fastTimeWeekOne`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_fastTime_arr_mounth`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_fastTime_arr_two_week`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_fastTime`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_userPriceH`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_dir_lv`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_dop_bonus`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `del_dop_bonus_user`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_user_give_price`

Пока не нормализуются:

- `text`
- лимитный error-ответ с полями `my_price`, `this_date`, `price_data`, `post_data`, `test`, `test__`, `check`

#### `save_user_give_cart_price`

Пока не нормализуются:

- `text`
- лимитный error-ответ с полями `my_price`, `this_date`, `price_data`, `post_data`, `test`, `test__`, `check`

#### `save_user_withheld`

Пока не нормализуются:

- `text`
- лимитный error-ответ с полями `my_price`, `this_date`, `price_data`, `post_data`, `test`, `test__`, `check`

#### `save_dirBonus`

Пока не нормализуется:

- `text` остаётся в ответе для совместимости

#### `get_my_err_order`

Пока не нормализуются:

- карточка возвращается в legacy-формате с полями `order_items`, `imgs`, `is_edit`
- отладочные legacy-поля `is_edit_test`, `is_edit_test_check`, `is_edit_test_check_2` сохранены

#### `get_my_err_cam`

Пока не нормализуются:

- карточка возвращается в legacy-формате с полями `imgs`, `is_edit`

#### `save_fake_orders`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_fake_cam`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `downloadWS`

Пока не нормализуются:

- `$arrayOfDates` сохраняет legacy-имя и формат
- `url` сохраняет текущий формат ссылки на файл

#### `downloadHJ`

Пока не нормализуются:

- `$arrayOfDates` сохраняет legacy-имя и формат
- `url` сохраняет текущий формат ссылки на файл
