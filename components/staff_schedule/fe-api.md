# Staff_schedule API

## Базовый префикс

- `/api/staff_schedule/*`

## Общие правила

- Все методы вызываются под `CheckToken`.
- Формат успеха: `st = true`.
- Формат ошибки: `st = false`, `text`.
- Тело запроса, как и в старых Chef-модулях, передаётся в `data`.
- На текущем milestone ответы повторяют legacy `work_schedule`.

## ACCESS map

`access` возвращается один раз в bootstrap `get_all`.
`get_graph` access map не возвращает и не должен использоваться как источник прав для FE.

Источник point scope для списков точек и городов:

- если у пользователя есть записи в `jaco_main_rolls.user_point_access`, backend использует их как основной набор доступных точек
- если записей там нет, backend откатывается к legacy `user_privileges.point_id/city_id`
- это вычисляется server-side в middleware/helper; FE не должен присылать point access map в payload
- для `staff_schedule` это влияет на `point_list` в `get_all` и на ожидаемый выбор `data.point_id` в последующих запросах

Старые детальные ключи остаются без переименования:

- быстрые действия: категория **Быстрые действия**, `fast_hours_access` (**Часы**, оба периода), `fast_smena_access` (**Смена**), `fast_point_access` (**Кафе**). Требуется точный `access = 1`; `view`/`edit` не разрешают действия. Старые `fast_month_access`/`fast_2_week_access` мигрируются в `fast_hours_access` на сервере и больше не используются frontend.
- таблица: `full_month_access`, `create_edit_smena_access`
- финансы: `1h_view`, `1h_edit`, `1h_plus_view`, `com_bonus_view`, `com_bonus_edit`, `full_h_view`, `errors_view`, `bonus_view`, `bonus_edit`, `all_price_view`, `given_view`, `given_edit`, `withheld_view`, `withheld_edit`, `given_cart_view`, `given_cart_edit`, `test_all_price_view`, `premia_view`
- низ таблицы: `bonus_of_day_view`, `rolls_view`, `pizza_view`, `over_40_min_view`, `sums_all_view`

Дублирующие FE-группы `salary_block`, `payroll_actions`, `schedule_actions`, `smena_actions`, `footer_stats` удалены из реестра, пресетов и тестера. Все их `view`/`edit`/`access` значения frontend игнорирует; старые raw flags могут оставаться в совместимых ответах, но не выдают и не отзывают детальные права.

Видимость и действия рассчитываются непосредственно по существующим детальным ключам:

- зарплата показывается при любом детальном финансовом праве чтения (`view || edit || access`); каждая колонка отдельно требует своё право
- действия с выплатами требуют `edit || access` конкретного поля `given`, `given_cart`, `withheld`
- быстрые действия, их чекбоксы и запросы зависят только от `fast_hours_access`, `fast_smena_access`, `fast_point_access`; `full_month` не разрешает быстрые действия
- управление сменами требует только `create_edit_smena_access`
- нижняя статистика выводится по детальным правам `bonus_of_day`, `rolls`, `pizza`, `over_40_min`, `sums_all`; каждый показатель отдельно требует своё право чтения
- оба экспорта `downloadWS` и `downloadHJ` требуют `export_excel_access`; нет обхода по роли или общему доступу к модулю

Быстрая смена часов доступна на месяц и половину месяца по одному `fast_hours_access`. Сохраняются только сегодняшний и будущие дни; прошедший диапазон отклоняется. Исторические дни не удаляются и не перезаписываются, привязка шаблона 2/2 сохраняется.

Просмотр зарплатных полей использует `view || edit || access` по каждому полю, без дополнительных групповых разрешений или запретов. Изменение ставок/выплат/бонусов использует детальный `edit || access`, не тип или роль вызывающего пользователя. Новый независимый `director_level_edit`/`director_level_access` отвечает за уровень директора. Месячное сохранение требует `full_month_access` независимо от роли и не обновляет прошлые дни. Карточка дня отдельно сохраняет правила дат: менеджер сегодня, директор любые даты.

Поля `total_sum`, `to_pay_sum`, `premium_sheet` вычисляются сервером до маскирования зарплатных составляющих и выдаются по правам `all_price`, `test_all_price`, `premia`. FE использует их даже при значениях `0`/`""`, не пересчитывая из скрытых полей. Подстановка полной суммы выплаты недоступна без читаемых суммы и нужных удержаний; ручная выплата по своему edit/access праву остаётся доступной.

Один человек в нескольких строках: в строках `get_graph` (`one` и `two`) есть поля `same_person_group` (`0` — нет совпадений, иначе номер группы в пределах половины) и `same_person_with` (список «Фамилия · Должность» остальных строк группы). Строки связываются, если у них одна учётная запись (`user_id`) или один телефон: логин пользователя нормализуется к `7XXXXXXXXXX` из форматов `+7` и `8`, логины не телефонного вида телефоном не считаются. Номер телефона в ответ не попадает, поля не маскируются и видны всем. FE закрашивает поле сотрудника едва заметным оттенком группы (статус медкнижки, жёлтый и красный, при этом важнее), показывает подсказку с остальными строками и объясняет оттенок в «Цветовых обозначениях».

Отработанные часы: в строках сотрудников `get_graph` (`one` и `two`) поле `worked_min` — минуты за половину по той же базе, что «За часы»: `SUM(min)` дней без отметки отсутствия (`my_min >= 0`). Поле не финансовое и не маскируется. FE показывает колонку «Всего часов» первой в блоке итогов, всем пользователям, в часах и минутах, как в ячейках дней (`1080` → `18`, `7400` → `123:20`), без размытия финансов.

Остаток и разница по половинам месяца. В строках сотрудников `get_graph` (`one` и `two`; обзор месяца на FE берёт их из строки графика) появились поля `opening_balance` (остаток на начало половины) и `salary_difference` (разница). Разница = `opening_balance + to_pay_sum − given_cash`, может быть отрицательной. Разница половины становится остатком на начало следующей: 1–15 → 16-е, 16–конец → 1-е следующего месяца. Отсчёт идёт с `StaffScheduleSalaryBalanceService::START_PERIOD` (сейчас `2026-10-01`, на эту дату остаток 0). Значения хранятся в `staff_schedule_salary_balances` (миграция `2026_10_25_000002_create_staff_schedule_salary_balances.php`) и пересчитываются при каждой загрузке графика. Если разница прошлой половины ещё не посчитана, она досчитывается один раз. У водителей (`to_pay_sum = ""`) оба поля пустые. Маскируются вместе с `to_pay_sum` по праву `test_all_price`. FE показывает «Остаток на начало» перед «К выплате» и «Разницу» последней колонкой, отрицательные значения выделены красным.

Лимит выплат `save_user_give_price` и `save_user_give_cart_price`: заработанное за период + 20% от начисленного (константа `PAYOUT_OVERDRAFT_PERCENT`) + `opening_balance` периода. Ошибка — `Нельзя выдать больше, чем заработано + 20% и остаток на начало периода`, в `my_price` возвращается этот лимит (при праве `all_price` / `test_all_price`). Удержание `save_user_withheld` по-прежнему не больше заработанного. «Вся сумма» в окне выдачи на FE = к выплате + остаток на начало.

Право `premia` («Премия по ведомости») выведено: оно входит в `StaffSchedulePermissionLabels::RETIRED_GROUPS`, скрыто в настройках должностей и само не открывает блок зарплаты. Поля `premium_sheet`, `test_all_price` в ответе сохранены для совместимости, FE их не показывает. Карточка «Премия» в обзоре месяца заменена на «Остаток на начало» и «Разницу».

«Блоки интерфейса» (`salary_block`, `payroll_actions`, `schedule_actions`, `smena_actions`, `footer_stats`) и устаревшие `fast_month`, `fast_2_week` удалены из `staff_schedule` миграцией `2026_10_25_000006_delete_staff_schedule_removed_rights.php` вместе с назначениями. Перед удалением миграция сохраняет их в `storage/app/private/staff_schedule/removed_rights_*.json`, `down()` восстанавливает из последней выгрузки. Параметры остаются в `RETIRED_GROUPS`, поэтому `staff-schedule:ensure-access` и `sync-access` не создают их заново из `work_schedule`. На доступ это не влияет: решают детальные права.

Уровень директора выведен из модуля. Право `director_level` входит в `StaffSchedulePermissionLabels::RETIRED_GROUPS`, скрыто в настройках должностей и ничего не открывает. Поля `lv_dir`, `lv_dir_new`, `add_lv` в ответе `get_graph` сохранены для совместимости и всегда равны `0`. Колонки в БД (`lavel_cafe.add_lv` и др.) не трогаются. `save_dir_lv` всегда отвечает `st = false`, `Уровень директора больше не используется`, и ничего не пишет. Расчёт `dir_price` для директоров по уровню кафе не менялся.

Подписи и порядок прав `staff_schedule` в настройках должностей совпадают с формой графика. Единый источник — `StaffSchedulePermissionLabels::CANONICAL`. API настроек нормализует подписи сразу, миграция `2026_10_25_000003_sync_staff_schedule_permission_labels.php` сохраняет подписи и `sort` в БД. Порядок категорий: Таблица → Быстрые действия → Финансы (по колонкам) → Нижняя часть таблицы (по строкам) → Ставки и коэффициенты. Выведенные и скрытые права получают `sort` от 900. Назначения, категории и права других модулей не меняются. Подписи: `full_month` — «Расстановка часов на месяц», `fast_point` — «Сменить кафе» `bonus` — «Бонус (директор — только себе; менеджер — по праву редактирования)» и `bonus_of_day` — «Дневной бонус» оставлены прежними (миграция `2026_10_25_000004_restore_staff_schedule_kept_permission_labels.php`). `create_edit_smena` — «Новая смена / Редактирование смены», `fast_hours` / `fast_smena` — «Часы» / «Смена», остальные финансы — как колонки («За 1ч» … «На карты»; `test_all_price` — «Остаток на начало / К выплате / Разница»), `sums_all` — «Сумма за период (итоги зарплат)», `rolls`, `pizza`, `over_40_min` — «Роллы», «Пицца», «Заказы готовились более 40 минут». Тот же список проверяют тесты на бэке и на фронте.

Доступные месяцы (`months` в `get_all`, от новых к старым; выбран по умолчанию `is_active` — текущий): по умолчанию позапрошлый, прошлый, текущий и следующий месяц. Право `history_year` (`view`, `edit` или `access`; категория графика, миграция `2026_10_25_000001_add_staff_schedule_history_year_access.php`, назначения создаются выключенными) открывает последние 12 месяцев и следующий. Старые ручные исключения по отдельным сотрудникам сохраняются. `get_graph`, `get_user_day`, `get_user_month` за месяц вне этого списка отвечают `st = false`, `Этот месяц недоступен`.

Месяцы старше прошлого — только просмотр: методы записи с датой (`save_user_day`, `save_user_month`, быстрые часы и смена, `save_userPriceH`, `save_dir_lv`, `save_dop_bonus`, `save_dop_bonus_user`, `del_dop_bonus_user`, выплаты, удержание, `save_dirBonus`) отвечают `st = false`, `Прошлые периоды доступны только для просмотра`. FE в таком месяце показывает плашку «Архивный месяц — только просмотр», убирает все права редактирования и действий, кроме открытия месячной карточки (`full_month`) и выгрузки (`export_excel`), и не открывает карточку дня.

`rates` — самостоятельная категория «Ставки и коэффициенты» (`category = rates`). Чтение страницы ставок: `rates_view`, `rates_edit` или `rates_access`; сохранение и удаление запланированных изменений: `rates_edit` или `rates_access`. Миграция `2026_10_24_000002_add_staff_schedule_rates_access.php` создаёт группу и выключенные назначения для всех должностей. Перенос прав с модуля `app_per_h` выполняется отдельно командой `staff-schedule:transfer-rates-access` (сначала dry-run, затем `--apply`): должностям с доступом к `app_per_h` включаются `rates_view` и `rates_edit`, а при отсутствии — и сам модуль `staff_schedule`. Остальные права графика при этом не выдаются.

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
- `acces`

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
- `asd`

В строках пользователей внутри `date.one.users.users` и `date.two.users.users` дополнительно есть:

- `current_schedule` объект с текущим распознанным шаблоном графика
- `current_schedule_text` строка для хаба редактирования, например `С 15 числа 2/2`
- `test_all_price` служебное расчетное поле; ключ возвращается в обеих половинах месяца, для `date.two.users.users` содержит формулу `первая половина all_price + вторая половина all_price - oklad`, для `date.one.users.users` приходит как `0`

Важно для FE:

- `Премия по ведомости` в новом FE считается как производное значение на клиенте
- backend не является источником отдельного row-level premium поля для этого столбца

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
- `recent_custom_hours`: уникальные пары `time_start` / `time_end` (`HH:mm`) по сотруднику и должности за последние два месяца до сегодняшнего дня включительно, отсортированы от новых к старым; стандартные диапазоны исключаются интерфейсом

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
- `data.part` — `0` для первой половины месяца, `1` для второй
- вместо одиночных `user_id`, `app_id`, `smena_id` можно передать `data.users` — массив `{ user_id, app_id, smena_id }`; цель и период общие, операция атомарна для массива

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
- `data.user_temp` и `data.type_healf` передаются вместе для редактируемого дня; наличие часов для их сохранения не требуется
- если на текущий день переданы часы, backend требует оба поля здоровья
- диапазоны `data.hours[]` не должны пересекаться; форма подсвечивает конфликт и блокирует сохранение, backend отклоняет весь запрос и не выбирает интервал автоматически
- в каждом диапазоне время окончания должно быть строго позже времени начала; форма не разрешает переход через полночь и значения после `23:59`

Ограничения редактирования:

- `manager` может редактировать только текущий день
- `dir`, `dir_other`, `MEGA` и `mega_dir` могут редактировать любые даты
- для остальных допустимых ролей backend разрешает редактирование:
  - текущего дня
  - будущих дат
  - дат не раньше открытого payroll-периода точки, если передан `data.point_id`
- если дата не проходит это правило, backend возвращает `st = false`, `text = "Ты не можешь редактировать предыдущие дни"`
- `data.hours`, `data.new_app`, `data.mentor_id`, `data.user_temp` и `data.type_healf` подчиняются одному правилу роли/даты; здоровье не зависит от количества часов

Рекомендация для FE:

- не пытаться access-gate это только по общему module access
- отдельно дизейблить редактирование полей дня по дате и роли
- для `manager` блокировать все поля дня вне текущей даты
- для `dir|dir_other|MEGA|mega_dir` разрешать все поля дня на любой дате при наличии права на редактирование дня
- `full_month_access` является правом на день для любой роли; после проверки права действуют отдельные ограничения дат
- backend validation остается источником правды, FE нужен только чтобы не слать заведомо запрещенные save-запросы

Правило авторизации:

- backend берет access только из server-side middleware `request->upd_access`
- payload `data` не участвует в авторизации и не должен содержать access map

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

- backend не принимает месячное редактирование прошлых месяцев ни для одной роли, включая `MEGA`
- в текущем месяце можно менять только сегодняшний и будущие дни; прошедшие дни, включая вчера, остаются без изменений
- если старый клиент передал прошедшие дни в `data.dates[]`, backend игнорирует эти строки и не обновляет их часы
- если месяц запрещен, backend возвращает `st = false`, `text = "Ты не можешь редактировать предыдущие дни"`

Рекомендация для FE:

- дизейблить month-edit для прошедших месяцев независимо от роли
- показывать прошедшие дни в календаре только для просмотра и не включать их в `data.dates[]` при сохранении

Правило авторизации:

- backend берет access только из server-side middleware `request->upd_access`
- payload `data` не участвует в авторизации и не должен содержать access map

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
- `data.smena_id` — текущая смена сотрудника
- `data.new_point_id`
- `data.new_smena_id`

Выход:

- `text`
- `test`

Для массового переноса вместо одиночных `user_id`, `app_id`, `smena_id` передаётся `data.users` — массив `{ user_id, app_id, smena_id }`. Смена и кафе назначения общие, перенос атомарен внутри этого запроса. При последовательном изменении часов, смены и кафе frontend отправляет запросы в этом порядке; после смены источником для переноса кафе становится новая смена. Успешные этапы не повторяются после ошибки следующего этапа, таблица перечитывается.

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

Выведен: всегда `st = false`, `text = "Уровень директора больше не используется"`, ничего не пишет. Маршрут оставлен для совместимости.

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

### `POST|ANY /api/staff_schedule/save_dop_bonus_user`

Назначение:

- изменить командный бонус у конкретного сотрудника за период

Вход:

- `data.point_id`
- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.data` месяц `YYYY-MM`
- `data.part` `0 | 1`
- `data.type`: `1` — выдать, `2` — лишить

Выход:

- только стандартный success/error:
  - `st = true`
  - либо `st = false`, `text`

### `POST|ANY /api/staff_schedule/del_dop_bonus_user`

Назначение:

- legacy-алиас снятия командного бонуса у конкретного сотрудника за период

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

### `POST|ANY /api/staff_schedule/get_payout_history`

Назначение:
- история выплат сотрудника за половину месяца для окна заполнения «Выдано», «На карты», «Удержано по исп. листу»

Вход:
- `data.date` — начало периода `YYYY-MM-01` или `YYYY-MM-16`
- `data.user_id`, `data.app_id` (`data.smena_id` допускается и не используется: история хранится без смены)

Права:
- возвращаются только типы, которые пользователь может читать: `1` — `given`, `2` — `given_cart`, `3` — `withheld` (`view`, `edit` или `access`); без права ни на один тип — `st = false`, `Нет доступа`

Выход:
- `history[]` от новых к старым: `type`, `type_label`, `price` (новое значение), `old_price` (предыдущее значение того же типа за период или `null`), `user_name` (кто изменил), `date_update`

Источник — `cafe_smena_given_history`, только чтение. В неё пишут и `save_user_give_price` / `save_user_give_cart_price` / `save_user_withheld`, и legacy `work_schedule`, поэтому в истории видны выплаты из обоих модулей.

### `POST|ANY /api/staff_schedule/save_dirBonus`

Назначение:

- сохранить бонус менеджера или собственный бонус директора на вторую половину месяца; требуется `bonus_edit` или `bonus_access`. Тип вызывающего пользователя не предоставляет права.

Вход:

- `data.user_id`
- `data.app_id`
- `data.smena_id`
- `data.date` месяц `YYYY-MM`
- `data.bonus`

Строки графика содержат серверный `data.can_edit_bonus`: `true` только для допустимой должности/сотрудника во второй половине месяца при наличии права. `false` или отсутствие поля блокирует редактор. Frontend повторно проверяет текущую строку по составному идентификатору перед открытием и сохранением. Начальное значение редактора — `dir_bonus`, а не вычисленный `my_bonus`.

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

- backend проверяет доступ к модулю `staff_schedule` и `export_excel_access = 1`

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

- backend проверяет доступ к модулю `staff_schedule` и `export_excel_access = 1`

Выход:

- `$arrayOfDates`
- `url`

Примечание:

- FE-flow: после выбора диапазона вызвать метод и открыть `response.data.url` / `response.url`

### Ставки и коэффициенты

Отдельная страница FE `/staff_schedule/rates`. Копия логики модуля `app_per_h` с одной ставкой вместо трёх; исходный `app_per_h` не меняется. Текущая ставка хранится в новой `staff_schedule_position_rates` (`point_id`, `app_id`, `price`, `updated_at`, `updated_by`); миграция `2026_10_24_000004_create_staff_schedule_position_rates.php` один раз копирует стартовую ставку из `app_per_h_new` (`avg_price`, иначе большая из заполненных). `app_per_h_new` дальше только читается — для подсказки о трёх старых ставках и для `staff-schedule:seed-rates`. Текущие коэффициенты — в новой `staff_schedule_point_coefficients` (`point_id`, `k_rolls`, `k_pizza`, `updated_at`, `updated_by`); миграция `2026_10_24_000003_create_staff_schedule_point_coefficients.php` один раз копирует в неё значения из `point_settings`, дальше `point_settings` не читается и не меняется. Для кафе без строки в новой таблице коэффициенты приходят `null`. История — в новых `staff_schedule_rate_history` и `staff_schedule_coef_history`: старое и новое значение, дата начала, автор и время, время применения, удаление с автором. В историю пишутся только реально изменённые значения.

Применение ставки с даты начала периода: в `staff_schedule_smena_info` кафе (смены `staff_schedule_smena` активной точки) для этой должности с `date >= date_start` выставляются `min_price`, `avg_price`, `max_price`, `my_price` = ставка и пересчитывается `price_per_bonus`; строки с выданными деньгами (`given + given_cart > 0`) не меняются. Коэффициенты применяются к `staff_schedule_point_coefficients` и `staff_schedule_smena_info` кафе с `date >= date_start`. Будущие периоды применяет ежедневная команда `staff-schedule:apply-rate-history` (00:03); при нескольких запланированных записях по одной паре побеждает самая поздняя по дате начала.

#### `POST|ANY /api/staff_schedule/get_rates`

Права: чтение `rates`.

Выход:
- `module_info`
- `points[]`: `id`, `city_id`, `base`, `name` — все кафе, как в `app_per_h`
- `periods[]`: `value` (`YYYY-MM-DD`, начало периода), `end_date` — три ближайших периода 1–15 / 16–конец
- `can_edit`

#### `POST|ANY /api/staff_schedule/get_rates_point`

Вход: `data.point_id`. Права: чтение `rates`.

Выход:
- `positions[]` (по отделам: `appointment_units.sort`, должности без отдела в конце; внутри — `kind`, `sort`): `app_id`, `app_name`, `is_graph`, `unit_id` (`0` — без отдела), `unit_name`, `price` (текущая ставка из `staff_schedule_position_rates`, `0` — нет), `legacy_prices` (`min`, `avg`, `max` из `app_per_h_new`, только чтение), `has_legacy_spread` (три старые ставки различаются)
- `coefficients`: `k_rolls`, `k_pizza` (может быть `null`)
- `rate_history[]`: `id`, `app_id`, `app_name`, `price`, `old_price`, `date_start`, `source` (`manual` / `seed`), `created_at`, `creator`, `applied_at`, `deleted_at`, `deleter`, `status` (`applied` / `planned` / `deleted`), `can_delete`
- `coef_history[]`: те же служебные поля и `k_rolls`, `k_pizza`, `old_k_rolls`, `old_k_pizza`
- `periods`, `can_edit`

#### `POST|ANY /api/staff_schedule/save_rates`

Права: редактирование `rates`.

Вход:
- `data.date_start` — одно из значений `periods[].value`
- `data.points[]` — id кафе (или объекты с `id`)
- `data.positions[]`: `app_id`, `price` — пустое значение или `0` ставку не меняет; допускается запятая
- `data.k_rolls`, `data.k_pizza` — если хотя бы одно пустое, коэффициенты не меняются

Выход: `text`, `summary` (`rates` — число изменённых ставок, `coefficients` — число кафе с изменёнными коэффициентами, `applied` — применено сразу или запланировано). Ошибки валидации: `st = false`, `text`.

#### `POST|ANY /api/staff_schedule/delete_rates_history`

Права: редактирование `rates`.

Вход: `data.type` (`rate` / `coef`), `data.id`. Удаляется только запланированная (не применённая) запись с датой начала позже сегодняшней; запись остаётся в истории со статусом `deleted`. Исправлена ошибка исходного `app_per_h`, где удаление истории удаляло строку текущих ставок с тем же `id`.

## Замечания для FE

- Для `get_graph` использовать `data.month`.
- Поле `hours_days` использовать в новом API.

## Статус для FE

Готово и можно подключать:

- payroll/admin write endpoints:
  - `save_userPriceH`
  - `save_dir_lv`
  - `save_dop_bonus`
  - `save_dop_bonus_user`
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
- `acces` остается legacy-алиасом того же access map

#### `get_graph`

Пока не нормализуются:

- верхнеуровневые legacy-поля `show_zp_one`, `show_zp_two`, `show_zp`, `kind`, `lv_cafe`, `lv_dir`, `lv_dir_new`, `add_lv`, `err`, `checj`, `asd`
- `date.one` / `date.two` сохраняют старую структуру половин месяца
- `date.*.users.smens` и `date.*.users.smens_full` сохраняют текущий формат смен
- строки сотрудников внутри `date.*.users.users` сохраняют все старые поля расчётов, ЗП, бонусов, удержаний, ошибок, доступа к кассе, роли, смены и списков для быстрых действий
- `dates[]` у сотрудника сохраняет старую форму ячеек календаря: `date`, `info`, `info.full_hours`, цвета `color` / `colorT` и прочие поля дня
- `bonus`, `order_stat`, `other_summ`, `bonus_other` внутри половин месяца сохраняют legacy-формат

Новые поля добавлены поверх старого контракта:

- `current_schedule`
- `current_schedule_text`
- `bonus_other_status` внутри `date.one` и `date.two`: `0` — решение не принято, `1` — бонус выдан, `2` — в бонусе отказано. Legacy-поле `bonus_other` остается без изменений: `1` — выдан, `0` — отказ или отсутствие решения.

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

Повторный вызов для той же точки и половины месяца обновляет существующее решение и заново пересчитывает командный бонус сотрудников в обе стороны: как при выдаче, так и при отказе.

#### `del_dop_bonus_user`

Пока не нормализуется:

- success-ответ остаётся пустым legacy success: только `st = true`

#### `save_dop_bonus_user`

Операция симметрична: `type = 1` пересчитывает и выдаёт бонус сотруднику, `type = 2` обнуляет его. Решение по командному бонусу за период должно быть предварительно выбрано.

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
