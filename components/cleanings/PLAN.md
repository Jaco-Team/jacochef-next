# План модуля Cleanings

## Текущее состояние

`app/Chef/Cleanings` до этого плана не существовал.

Новый модуль `Cleanings` должен объединить старые Chef API-модули:

- `App_work`: настройка времени и правил уборок.
- `Cat_work`: категории уборок.
- `App_work_show`: просмотр уборок по точке.
- `App_work_point`: привязка уборок к точкам.
- `Check_works`: проверка/подтверждение уборок и заготовок.

Старые модули возвращают `GlobalResource`, чаще всего читают payload из `request->data` и отдают legacy-поля для фронта. При переносе нужно сохранять форму ответов, пока фронт явно не будет переведен на новый контракт.

## Карта старых API

Все маршруты сейчас находятся внутри авторизованной API-группы в `routes/api.php`.

### Время уборок: `app_work`

Старый модуль: `App\Chef\App_work\App_work_Controller`

| Старый маршрут                  | Метод контроллера | Назначение                                                                   |
| ------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `ANY /app_work/get_all`         | `get_all`         | Загрузка `module_info`, полного списка уборок и минимального списка уборок   |
| `ANY /app_work/get_one`         | `get_one`         | Загрузка одной уборки с должностями, категориями, временем открытия/закрытия |
| `ANY /app_work/get_all_for_new` | `get_all_for_new` | Загрузка дефолтов и справочников для создания уборки                         |
| `ANY /app_work/save_check`      | `save_check`      | Переключение/сохранение отдельного поля уборки                               |
| `ANY /app_work/save_new`        | `save_new`        | Создание уборки и ее времени                                                 |
| `ANY /app_work/save_edit`       | `save_edit`       | Обновление уборки и полная замена ее времени                                 |

### Категории уборок: `cat_work`

Старый модуль: `App\Chef\Cat_work\Cat_work_Controller`

| Старый маршрут            | Метод контроллера | Назначение           |
| ------------------------- | ----------------- | -------------------- |
| `ANY /cat_work/get_all`   | `get_all`         | Загрузка категорий   |
| `ANY /cat_work/save_new`  | `save_new`        | Создание категории   |
| `ANY /cat_work/save_edit` | `save_edit`       | Обновление категории |

### Просмотр уборок: `app_work_show`

Старый модуль: `App\Chef\App_work_show\App_work_show_Controller`

| Старый маршрут                 | Метод контроллера | Назначение                                 |
| ------------------------------ | ----------------- | ------------------------------------------ |
| `ANY /app_work_show/get_all`   | `get_all`         | Загрузка точек для экрана просмотра уборок |
| `ANY /app_work_show/get_works` | `get_works`       | Загрузка уборок для выбранной точки        |
| `ANY /app_work_show/get_one`   | `get_one`         | Загрузка одной уборки для выбранной точки  |

### Уборки на точке: `app_work_point`

Старый модуль: `App\Chef\App_work_point\App_work_point_Controller`

| Старый маршрут                  | Метод контроллера | Назначение                                                 |
| ------------------------------- | ----------------- | ---------------------------------------------------------- |
| `ANY /app_work_point/get_all`   | `get_all`         | Загрузка точек и должностей для экрана привязки            |
| `ANY /app_work_point/get_works` | `get_works`       | Загрузка всех уборок по должности и уборок выбранной точки |
| `ANY /app_work_point/save`      | `save`            | Полная замена привязок уборок к выбранной точке            |

### Проверка уборок и заготовок: `check_works`

Старый модуль: `App\Chef\Check_works\Check_works_Controller`

| Старый маршрут                   | Метод контроллера | Назначение                                                          |
| -------------------------------- | ----------------- | ------------------------------------------------------------------- |
| `ANY /check_works/get_all`       | `get_all`         | Загрузка точек, доступа и режима пользователя                       |
| `ANY /check_works/get_data`      | `get_data`        | Загрузка списка заготовок, уборок и доступных уборок по точке/датам |
| `ANY /check_works/get_add_work`  | `get_add_work`    | Загрузка уборок, доступных для ручного добавления                   |
| `ANY /check_works/get_edit_work` | `get_edit_work`   | Загрузка одной заготовки с историей редактирования                  |
| `ANY /check_works/add_new_work`  | `add_new_work`    | Ручное добавление уборки на сегодня                                 |
| `ANY /check_works/clear_work`    | `clear_work`      | Очистка/сброс уборки                                                |
| `ANY /check_works/check_work`    | `check_work`      | Подтверждение уборки                                                |
| `ANY /check_works/close_work`    | `close_work`      | Удаление/закрытие уборки с комментарием                             |
| `ANY /check_works/save_edit`     | `save_edit`       | Редактирование количества заготовок и запись истории                |
| `ANY /check_works/check_pf_work` | `check_pf_work`   | Подтверждение заготовки                                             |
| `ANY /check_works/close_pf_work` | `close_pf_work`   | Удаление/закрытие заготовки с комментарием                          |

## Целевая карта API

Единый префикс модуля: `cleanings`.

На первом этапе миграции маршруты лучше оставить как `Route::any(...)`, чтобы не ломать legacy-вызовы. Более строгие HTTP-методы можно вводить отдельной чисткой после перевода фронта.

### `cleanings/times`

Целевой сервис: `CleaningTimesService`

| Новый маршрут                          | Старый источник                 |
| -------------------------------------- | ------------------------------- |
| `ANY /cleanings/times/get_all`         | `ANY /app_work/get_all`         |
| `ANY /cleanings/times/get_one`         | `ANY /app_work/get_one`         |
| `ANY /cleanings/times/get_all_for_new` | `ANY /app_work/get_all_for_new` |
| `ANY /cleanings/times/save_check`      | `ANY /app_work/save_check`      |
| `ANY /cleanings/times/save_new`        | `ANY /app_work/save_new`        |
| `ANY /cleanings/times/save_edit`       | `ANY /app_work/save_edit`       |

Возможные понятные алиасы после перевода фронта:

- `get_all` -> `list`
- `get_one` -> `get`
- `get_all_for_new` -> `create_context`
- `save_check` -> `toggle`
- `save_new` -> `create`
- `save_edit` -> `update`

### `cleanings/categories`

Целевой сервис: `CleaningCategoriesService`

| Новый маршрут                         | Старый источник           |
| ------------------------------------- | ------------------------- |
| `ANY /cleanings/categories/get_all`   | `ANY /cat_work/get_all`   |
| `ANY /cleanings/categories/save_new`  | `ANY /cat_work/save_new`  |
| `ANY /cleanings/categories/save_edit` | `ANY /cat_work/save_edit` |

Возможные понятные алиасы после перевода фронта:

- `get_all` -> `list`
- `save_new` -> `create`
- `save_edit` -> `update`

### `cleanings/view`

Целевой сервис: `CleaningViewService`

| Новый маршрут                   | Старый источник                |
| ------------------------------- | ------------------------------ |
| `ANY /cleanings/view/get_all`   | `ANY /app_work_show/get_all`   |
| `ANY /cleanings/view/get_works` | `ANY /app_work_show/get_works` |
| `ANY /cleanings/view/get_one`   | `ANY /app_work_show/get_one`   |

Возможные понятные алиасы после перевода фронта:

- `get_all` -> `context`
- `get_works` -> `list_by_point`
- `get_one` -> `get_by_point`

### `cleanings/points`

Целевой сервис: `CleaningPointAssignmentsService`

| Новый маршрут                     | Старый источник                 |
| --------------------------------- | ------------------------------- |
| `ANY /cleanings/points/get_all`   | `ANY /app_work_point/get_all`   |
| `ANY /cleanings/points/get_works` | `ANY /app_work_point/get_works` |
| `ANY /cleanings/points/save`      | `ANY /app_work_point/save`      |

Возможные понятные алиасы после перевода фронта:

- `get_all` -> `context`
- `get_works` -> `assignments`
- `save` -> `save_assignments`

### `cleanings/checks`

Целевой сервис: `CleaningChecksService`

| Новый маршрут                         | Старый источник                  |
| ------------------------------------- | -------------------------------- |
| `ANY /cleanings/checks/get_all`       | `ANY /check_works/get_all`       |
| `ANY /cleanings/checks/get_data`      | `ANY /check_works/get_data`      |
| `ANY /cleanings/checks/get_add_work`  | `ANY /check_works/get_add_work`  |
| `ANY /cleanings/checks/get_edit_work` | `ANY /check_works/get_edit_work` |
| `ANY /cleanings/checks/add_new_work`  | `ANY /check_works/add_new_work`  |
| `ANY /cleanings/checks/clear_work`    | `ANY /check_works/clear_work`    |
| `ANY /cleanings/checks/check_work`    | `ANY /check_works/check_work`    |
| `ANY /cleanings/checks/close_work`    | `ANY /check_works/close_work`    |
| `ANY /cleanings/checks/save_edit`     | `ANY /check_works/save_edit`     |
| `ANY /cleanings/checks/check_pf_work` | `ANY /check_works/check_pf_work` |
| `ANY /cleanings/checks/close_pf_work` | `ANY /check_works/close_pf_work` |

Возможные понятные алиасы после перевода фронта:

- `get_all` -> `context`
- `get_data` -> `data`
- `get_add_work` -> `add_context`
- `get_edit_work` -> `pf_edit_context`
- `add_new_work` -> `add_manual_work`
- `clear_work` -> `clear_cleaning`
- `check_work` -> `confirm_cleaning`
- `close_work` -> `close_cleaning`
- `save_edit` -> `update_pf_counts`
- `check_pf_work` -> `confirm_pf`
- `close_pf_work` -> `close_pf`

## Конфликты имен и решение

В старых модулях повторяются одинаковые имена методов:

- `get_all`: используется во всех пяти исходных модулях.
- `get_works`: используется в `app_work_show` и `app_work_point`.
- `get_one`: используется в `app_work` и `app_work_show`.
- `save_edit`: используется в `app_work`, `cat_work` и `check_works`.

Не нужно выносить эти методы напрямую под `/cleanings`, потому что названия станут неоднозначными и неудобными для фронтовой маршрутизации.

На этапе миграции используем группировку:

- `/cleanings/times/...`
- `/cleanings/categories/...`
- `/cleanings/view/...`
- `/cleanings/points/...`
- `/cleanings/checks/...`

После переключения фронта с тестовых данных на backend можно добавить более понятные алиасы, если они реально понадобятся. Ссылки на старые endpoints нужно оставить в этом плане до удаления старых модулей.

## Предлагаемый дизайн модуля

Начальная структура:

- `app/Chef/Cleanings/Cleanings_Controller.php`
- `app/Chef/Cleanings/CleaningTimesService.php`
- `app/Chef/Cleanings/CleaningCategoriesService.php`
- `app/Chef/Cleanings/CleaningViewService.php`
- `app/Chef/Cleanings/CleaningPointAssignmentsService.php`
- `app/Chef/Cleanings/CleaningChecksService.php`
- Позже при необходимости: `app/Chef/Cleanings/models/*` или общие модели в `app/Models/Chef/*`, если будем заменять legacy SQL.

Зона ответственности контроллера:

- Парсить payload из `data`, включая JSON-строку, если такой формат встретится.
- Читать `module_info`, `login` и `upd_access` из request так же, как старые контроллеры.
- Возвращать `GlobalResource`.
- Держать endpoint-методы тонкими и передавать бизнес-логику в сервисы.

Зона ответственности сервисов:

- Держать перенесенную legacy-логику по отдельным зонам ответственности.
- Сохранять текущие таблицы и поля ответов на первом этапе миграции.
- Постепенно заменять статические legacy-вызовы на приватные методы, Eloquent-модели или query builder только после проверки поведения.
- Не удалять и не переименовывать поля, которые уже читает фронт, при первом подключении backend.

По стилю это ближе к направлению `Vendors`: контроллер как API-адаптер, сервис как владелец бизнес-логики. `Ads` можно смотреть как пример компактного контроллера, когда основная логика уже вынесена наружу.

## Этапы миграции

1. Создать `Cleanings_Controller` и группы маршрутов под `Route::prefix('cleanings')`.
2. Добавить сервисы по каждому старому модулю.
3. Скопировать старую логику в соответствующие сервисы с минимальными поведенческими изменениями.
4. Оставить старые legacy-маршруты активными параллельно с новыми маршрутами `cleanings`.
5. Перевести фронтовый модуль `https://jacosoft-dop.ru/cleanings` с тестовых данных на backend endpoints `/cleanings/*`.
6. Сравнить payload старых и новых endpoints на одинаковых входных данных.
7. После стабильного перевода фронта пометить старые маршруты/модули как deprecated.
8. Удалять старые модули только после подтверждения, что больше нет фронтовых или внешних вызовов:
   - `/app_work/*`
   - `/cat_work/*`
   - `/app_work_show/*`
   - `/app_work_point/*`
   - `/check_works/*`

## Заметки для фронта

Фронт нужно переключить с тестовых данных на новые сгруппированные backend endpoints:

- Время уборок -> `/cleanings/times/*`
- Категории уборок -> `/cleanings/categories/*`
- Просмотр уборок -> `/cleanings/view/*`
- Уборки на точке -> `/cleanings/points/*`
- Проверка уборок и заготовок -> `/cleanings/checks/*`

На первом этапе backend-интеграции ожидаем, что legacy-поля ответов останутся без изменений. Новые фронтовые названия можно разрулить во фронтовых адаптерах или добавить отдельным alias-слоем на backend после удаления старых модулей.

## Legacy request-response контракты

Ниже зафиксированы текущие контракты старых модулей. При переносе в `Cleanings` эти формы нужно сохранить на первом этапе, включая старые имена полей и сообщения ошибок.

### `app_work`

#### `ANY /app_work/get_all`

Request:

- `data` не используется.

Response:

- `module_info`: из request.
- `items`: массив уборок.
  - Поля элемента: `id`, `app_name`, `work_name`, `name`, `time_min`, `type`, `text`, `is_active`, `dow`, `is_not_del`, `is_need`, `times_open`, `times_close`.
- `items_min`: массив коротких уборок.
  - Поля элемента: `id`, `name`.

#### `ANY /app_work/get_one`

Request:

- `data.id`: id уборки.

Response:

- `item`: строка `app_work`, выбирается через `SELECT *`.
- `apps`: массив должностей.
  - Поля элемента: `id`, `name`.
- `times_add`: массив строк `app_work_time` с `type_action = 1`, выбирается через `SELECT *`.
- `times_close`: строка времени закрытия или пустая строка.
- `cats`: массив категорий.
  - Поля элемента: `id`, `name`.

#### `ANY /app_work/get_all_for_new`

Request:

- `data` не используется.

Response:

- `cats`: массив категорий.
  - Поля элемента: `id`, `name`.
- `apps`: массив должностей.
  - Поля элемента: `id`, `name`.
- `item`: дефолтная уборка.
  - Поля: `name`, `app_id`, `dow`, `max_count`, `is_active`, `time_min`, `type_time`, `type_new`, `description`, `work_id`.
- `times_add`: пустой массив.
- `times_close`: пустая строка.

#### `ANY /app_work/save_check`

Request:

- `data.type`: имя обновляемого поля в `app_work`.
- `data.id`: id уборки.
- `data.value`: новое значение.

Response:

- `st`: boolean.
- `text`: `Успешно сохранено` или `Ошибка сохранения`.

#### `ANY /app_work/save_new`

Request:

- `data.work.app_id`
- `data.work.name`
- `data.work.dow`
- `data.work.type_new`
- `data.work.time_min`
- `data.work.description`
- `data.work.type_time`
- `data.work.max_count`
- `data.work.work_id`
- `data.times_add`: массив объектов с `time_action`.
- `data.times_close`: строка времени закрытия или пустая строка.

Response:

- При ошибке валидации: `st = false`, `text`.
  - `Не выбран тип добавления`
  - `Необходимо выбрать день недели`
  - `Уборка с таким названием и должностью уже есть`
- При сохранении: `st = true`, `text = Успешно сохранено`.
- При ошибке записи: `st = false`, `text = Ошибка сохранения`.

#### `ANY /app_work/save_edit`

Request:

- `data.work.id`
- `data.work.app_id`
- `data.work.name`
- `data.work.dow`
- `data.work.type_new`
- `data.work.time_min`
- `data.work.description`
- `data.work.type_time`
- `data.work.max_count`
- `data.work.work_id`
- `data.times_add`: массив объектов с `time_action`.
- `data.times_close`: строка времени закрытия или пустая строка.

Response:

- При ошибке валидации: `st = false`, `text`.
  - `Не выбран тип добавления`
  - `Необходимо выбрать день недели`
- При сохранении: `st = true`, `text = Успешно сохранено`.
- При ошибке обновления: `st = false`, `text = Ошибка обновления данных`.

### `cat_work`

#### `ANY /cat_work/get_all`

Request:

- `data` не используется.

Response:

- `module_info`: из request.
- `cats`: массив строк `cat_work`, выбирается через `SELECT *`.

#### `ANY /cat_work/save_new`

Request:

- `data.name`: название категории.
- `data.text`: описание/текст категории.

Response:

- Если категория уже есть: `st = false`, `text = Категория уборки с таким названием уже есть`.
- При сохранении: `st = true`, `text = Успешно сохранено`.
- При ошибке записи: `st = false`, `text = Ошибка записи данных`.

#### `ANY /cat_work/save_edit`

Request:

- `data.cat_id`: id категории.
- `data.name`: название категории.
- `data.text`: описание/текст категории.

Response:

- `st = true`
- `text = Успешно обновлено`

### `app_work_show`

#### `ANY /app_work_show/get_all`

Request:

- `data` не используется.
- Использует `login.full.city_id` и `login.full.point_id`.

Response:

- `module_info`: из request.
- `points`: результат `Helper::getMyPointList(city_id, point_id)`.

#### `ANY /app_work_show/get_works`

Request:

- `data.point_id`: id точки.

Response:

- `items`: массив активных уборок точки.
  - Поля элемента из SQL: `id`, `app_name`, `app_id`, `work_name`, `name`, `time_min`, `type`, `text`, `is_active`, `dow`, `is_not_del`, `is_need`, `work_id`, `need_work_name`, `times_open`, `times_close`.
  - Дополнительная логика:
    - если `is_not_del = 1`, `times_close = Обязательна к выполнению`;
    - если `is_not_del = 0` и `times_close` пустой, `times_close = Без ограничений`;
    - если `dow = 14`, добавляется `need_work_name` со строкой в кавычках.
- `items_min`: массив коротких уборок.
  - Поля элемента: `id`, `name`.

#### `ANY /app_work_show/get_one`

Request:

- `data.point_id`: id точки.
- `data.id`: id уборки.
- Использует `login.full.kind`.

Response:

- `item`: объект уборки.
  - Поля из SQL: все поля `aw.*`, `app_name`, `app_id`, `text_work`, `cat_name`, `new_time`.
  - Дополнительное поле: `show_time`, boolean, `true` если `login.full.kind < 3`.

### `app_work_point`

#### `ANY /app_work_point/get_all`

Request:

- `data` не используется.
- Использует `login.full.city_id` и `login.full.point_id`.

Response:

- `module_info`: из request.
- `points`: результат `Helper::getMyPointList(city_id, point_id)`.
- `apps`: массив должностей из уборок.
  - Поля элемента: `id`, `name`.

#### `ANY /app_work_point/get_works`

Request:

- `data.app_id`: id должности.
- `data.point_id`: id точки.

Response:

- `all_work`: массив всех уборок по должности.
  - Поля элемента: `id`, `name`, `time_min`.
- `this_work`: массив уборок, привязанных к точке по должности.
  - Поля элемента: `id`, `name`, `dop_time`, `time_min`.

#### `ANY /app_work_point/save`

Request:

- `data.app_id`: id должности.
- `data.point_id`: id точки.
- `data.items`: массив выбранных уборок.
  - Поля элемента: `id`, `dop_time`.

Response:

- При успешной записи хотя бы одной строки: `st = true`, `text = Успешно сохранено`.
- Если после удаления не создано ни одной строки: `st = false`, `text = Ошибка записи данных`.

Важно: старый код сначала удаляет все привязки по `app_id + point_id`, потом вставляет переданный список.

### `check_works`

#### `ANY /check_works/get_all`

Request:

- `data` не используется.
- Использует `login.full.city_id`, `login.full.point_id`, `login.full.app_type`.
- Использует `upd_access`.

Response:

- `module_info`: из request.
- `points`: результат `Helper::getMyPointList(city_id, point_id)`.
- `check_cook`: boolean, `true` для `app_type` в `cook`, `kassir`, `other`.
- `acces`: значение `request->upd_access`.

Legacy-особенность: поле называется `acces`, не `access`.

#### `ANY /check_works/get_data`

Request:

- `data.point_id`: объект точки.
  - `data.point_id.base`: имя базы точки.
  - `data.point_id.id`: id точки.
- `data.date_start`: дата начала.
- `data.date_end`: дата окончания.
- Использует `login.full.app_type`.

Response:

- Если `point_id` не передан: `st = false`, `text = Необходимо выбрать точку`.
- Если даты не переданы: `st = false`, `text = Необходимо указать все даты`.
- При успехе:
  - `pf_list`: массив заготовок.
  - `work`: массив уборок.
  - `all_work`: массив незавершенных уборок, дополненный полем `need_del`.
  - `check_cook`: boolean, `true` для `app_type` в `cook`, `kassir`, `other`.

Поля `pf_list`:

- `id`, `point_id`, `name_work`, `manager_name`, `user_name`, `user_name2`, `date_time`, `manager_time`, `count_pf`, `count_item`, `count_trash`, `ei_name`, `is_delete`, `text_del`.

Поля `work`:

- `id`, `user_id`, `point_id`, `name_work`, `date_start_work`, `manager_name`, `user_name`, `date_time_end`, `date_time_start`, `manager_time`, `date_unix_start`, `date_unix_end`, `is_delete`, `text_del`, `app_name`.

Поля `all_work`:

- `id`, `point_id`, `date`, `name_work`, `date_unix_start`, `user_id`, `max_count`, `short_name`, `app_name`, `check_dow`, `is_not_del`, `need_del`.

`need_del = 1`, если `check_dow = 1` или `is_not_del = 1`, иначе `0`.

#### `ANY /check_works/get_edit_work`

Request:

- `data.point_id.base`: имя базы точки.
- `data.id`: id записи `pf_work`.

Response:

- `item`: строка `pf_work`, дополненная полем `hist`.
- `item.hist`: история изменений.
  - Поля элемента: `old_count_pf`, `old_count_trash`, `new_count_pf`, `new_count_trash`, `date_time`, `user_name`.

#### `ANY /check_works/get_add_work`

Request:

- `data.point_id`: id точки.

Response:

- `works`: массив уборок, доступных для ручного добавления.
  - Поля элемента: `id`, `name`, `max_count`.

#### `ANY /check_works/add_new_work`

Request:

- `data.point_id.base`: имя базы точки.
- `data.point_id.id`: id точки.
- `data.work_id`: id уборки из `app_work`.

Response:

- Если превышен дневной лимит: `st = false`, `text = Разрешено добавлять не более <N> уборок в день`.
- При сохранении: `st = true`, `text = Успешно сохранено`.
- При ошибке сохранения: `st = false`, `text = Ошибка при сохранении`.

#### `ANY /check_works/clear_work`

Request:

- `data.point_id.base`: имя базы точки.
- `data.work_id`: id записи `work` в базе точки.

Response:

- Если `manager_id > 0`: `st = false`, `text = Уже нельзя сделать`.
- Если `is_delete = 1`: `st = false`, `text = Уборка уже удалена`.
- При успехе: `st = true`, `text = Успешно выполнено`.
- При ошибке сохранения: `st = false`, `text = Ошибка сохранения`.

#### `ANY /check_works/check_work`

Request:

- `data.point_id.base`: имя базы точки.
- `data.work_id`: id записи `work` в базе точки.
- Использует `login.full.id`.

Response:

- Если уборка еще не закончена: `st = false`, `text = Уборка еще не закончена`.
- Если уже подтверждено: `st = false`, `text = Уже подтверждено`.
- Если удалена: `st = false`, `text = Уборка уже удалена`.
- При успехе: `st = true`, `text = Успешно подтверждено`.
- При ошибке сохранения: `st = false`, `text = Ошибка сохранения`.

#### `ANY /check_works/close_work`

Request:

- `data.point_id.base`: имя базы точки.
- `data.work_id`: id записи `work` в базе точки.
- `data.text`: комментарий удаления.
- Использует `login.full.id`.

Response:

- Если `manager_id > 0`: `st = false`, `text = Уже удалено`.
- Если `is_delete = 1`: `st = false`, `text = Уборка уже удалена`.
- При успехе: `st = true`, `text = Успешно удалено`.
- При ошибке сохранения: `st = false`, `text = Ошибка сохранения`.

#### `ANY /check_works/save_edit`

Request:

- `data.point_id.base`: имя базы точки.
- `data.id`: id записи `pf_work`.
- `data.count_pf`: новое количество заготовок.
- `data.count_trash`: новое количество списания.
- Использует `login.full.id` и `login.full.app_type`.

Response:

- Если пользователь не имеет права редактировать: `st = false`, `text = Редактировать может тот, кто подтвердил`.
- Если запись не в актуальном периоде: `st = false`, `text = Редактировать можно только за актуальный период`.
- При успехе: `st = true`, `text = Успешно сохранено`.
- При ошибке сохранения: `st = false`, `text = Ошибка сохранения`.

Побочный эффект: пишет историю в `<base>.pf_work_hist`.

#### `ANY /check_works/check_pf_work`

Request:

- `data.point_id.base`: имя базы точки.
- `data.work_id`: id записи `pf_work`.
- Использует `login.full.id`.

Response:

- Если уже подтверждено: `st = false`, `text = Уже подтверждено`.
- При успехе: `st = true`, `text = Успешно подтверждено`.
- При ошибке сохранения: `st = false`, `text = Ошибка сохранения`.

#### `ANY /check_works/close_pf_work`

Request:

- `data.point_id.base`: имя базы точки.
- `data.work_id`: id записи `pf_work`.
- `data.text`: комментарий удаления.
- Использует `login.full.id`.

Response:

- Если `manager_id > 0`: `st = false`, `text = Уже удалено`.
- При успехе: `st = true`, `text = Успешно удалено`.
- При ошибке сохранения: `st = false`, `text = Ошибка сохранения`.
