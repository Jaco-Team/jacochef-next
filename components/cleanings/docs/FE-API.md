# Cleanings — контракт FE ↔ BE

Документ описывает маршруты, которые реально вызывает модуль `/cleanings` (`components/cleanings/useCleaningsApi.js`), и форму их запросов/ответов. Backend-описание модуля — `app/Chef/Cleanings/README.md` в репозитории Chef BE.

## Навигация

Одна страница `pages/cleanings/[[...section]].js` (`CleaningsPage`, без SSR). Заголовок `h1` и `document.title` — всегда название модуля `module_info.name` из `get_all`, фолбэк «Уборки и заготовки». Подмодули — вкладки под заголовком, описание подмодуля — под вкладками. Переключение вкладок — shallow-роутинг: страница не перемонтируется, `get_all` повторно не запрашивается.

| Вкладка | URL | Право (`access`) |
| --- | --- | --- |
| Виды уборок | `/cleanings/categories` | `categories` |
| Время уборок | `/cleanings/times` | `cleanings` |
| Уборки Кафе | `/cleanings/cafes` | `cafes` |
| Проверка заготовок и уборок | `/cleanings/control/cleanings`, `/cleanings/control/preparations` | `control_cleanings` / `control_pf` |

- Вкладка видна при праве на просмотр (`_view`, `_edit` или `_access`). Внутри проверки вкладки «Уборки» / «Заготовки» — по `control_cleanings` / `control_pf`.
- `/cleanings` без раздела, неизвестный или недоступный раздел заменяются (`router.replace`) на первую доступную вкладку; `/cleanings/control` — на первую доступную вкладку проверки.
- Шаблоны уборок («Время уборок») раньше открывались по `/cleanings`, теперь — `/cleanings/times`.
- Кнопки добавления — в тулбаре своей вкладки: «Новая уборка» (право `create_cleaning`), «Новый вид уборки» (`categories` edit), «Добавить уборку» и «Сохранить изменения» доп. времени (`cafes` edit), «Добавить уборку» в проверке (`control_cleanings` edit).
- Несохранённые изменения (карточка вида уборки, доп. время кафе, форма уборки) подтверждаются при смене вкладки модуля, вида уборки, кафе и закрытии формы; перезагрузка и закрытие вкладки браузера — через `beforeunload`. Известное ограничение: переход из модуля по меню/ссылкам и «назад/вперёд» браузера между вкладками модуля не спрашивают.

## Транспорт и конверт ответа

- Все вызовы идут через `useApi("cleanings").api_laravel(method, payload)`: `POST /cleanings/<method>`, payload уходит JSON-строкой в поле `data`.
- На BE все маршруты объявлены как `Route::any(...)` под `Route::prefix('cleanings')`.
- Полезная нагрузка ответа лежит top-level рядом с `st`, а не внутри `data`:

```json
{ "st": true, "text": "", "templates": [] }
```

- Ошибка: `{ "st": false, "text": "Сообщение" }`. FE показывает `text` как ошибку (`runMutation` в `useCleaningsPage.js`).
- Нормализаторы (`cleaningsNormalizers.js`) читают и top-level, и вложенный `data` — на случай будущего перехода BE на `data`.

## Сущности

### Template (`templates`, `assignedTemplates`, `availableTemplates`)

`id`, `name`, `categoryId`, `role`, `roleId`, `duration`, `confirmation` (пока всегда `false`), `scheduleType` (`weekly|other|every_day|every_day_shift_end|manual|after_cleaning`), `days`, `times`, `deleteTimes`, `is_not_del`, `is_need`, `activationCount`, `additionType` (`other|single_active|unlimited`), `triggerCleaningId`, `locationIds`, `status` (`active|archive`).

В срезе кафе у шаблона дополнительно есть `dop_time` / `extraTime` — доп. время на этой точке.

### Category

`id`, `name`, `instruction`, `templatesCount`, `deletable`.

### Location

`id`, `name`, `city`, `cityId`, `base`.

- `cityId` — id города точки; группировка «Все кафе города X» в карточке уборки. Старый BE без `cityId`: FE берёт `legacy.city_id` или `city_id` из сырого `points` в `get_all`.

### Option (`scheduleTypeOptions`, `additionTypeOptions`)

`id`, `name`, `description`, `selectable`.

- `description` — пояснение режима, FE показывает его подсказкой в карточке уборки.
- `selectable: false` — вариант не предлагается для новых шаблонов; у шаблона, где он уже стоит, показывается (`other` / «Другое»). Старый BE без этих полей: описаний нет, выбирать можно всё, кроме `other`.
- `additionType`: `single_active` «Только 1 активная», `unlimited` «Добавление без ограничений», `other` «Другое».
- `scheduleType`: `weekly` «По дням недели» (FE разворачивает в список дней), `every_day`, `every_day_shift_end`, `manual`, `after_cleaning`, `other` «Другое» — служебный тип (часть таких уборок создаётся отдельными системными задачами); у шаблона, где он стоит, режим можно сменить на обычный, после смены «Другое» из списка пропадает.

### Control item (`items`)

`id`, `name`, `cleaningId`, `locationId`, `date`, `employee`, `startedAt`, `finishedAt`, `confirmedAt`, `confirmer`, `status` (`active|in_progress|pending|approved|deleted`).

### Preparation item (`preparations`)

`id`, `name`, `locationId`, `preparedAt`, `volume`, `waste`, `unit`, `employee`, `helper`, `confirmedAt`, `confirmer`, `status` (`pending|approved|deleted`).

### Manual template (`manualTemplates`)

Шаблон с расписанием «Ручное добавление», привязанный к точке:

```json
{
  "id": 12,
  "name": "Генеральная уборка зала",
  "roleId": 5,
  "role": "Кассир",
  "categoryId": 3,
  "category": "Зал",
  "duration": 30,
  "maxCount": 2,
  "todayCount": 1
}
```

- `maxCount` — сколько раз в день можно добавить. BE отклоняет добавление при `todayCount >= maxCount`, поэтому `0` — добавить нельзя;
- `todayCount` — сколько уже добавлено сегодня.

### History row (`history`)

Строки `change_events`: `id`, `created_at`, `actor_name`, `event_type`, `before_json`, `after_json`, `diff_json`, `comment`. FE кэширует сырые строки и переводит их в русские подписи при показе (`cleaningsHistoryPresenter.mjs`):

- вид уборки — по `diff_json`: `name`, `text`, `templates.<id>` (`null ↔ 1`); `event_type`: `create | update | delete | templates`;
- уборка — по снимкам `before_json` / `after_json` в двух форматах: старый `{template, times: [строки app_work_time], points: [строки app_work_point]}` и новый `{template, times: {start: {"10:00": 1}, delete: {...}}, points: {"<point_id>": {dop_time}}}` (пустые словари приходят как `[]`, `points` с ключами `0..n-1` — как массив); `event_type`: `create | update | status | delete`;
- кафе — по снимкам `before_json` / `after_json` вида `{templates: {"<templateId>": {dop_time}}}` (пустой словарь приходит как `[]`, словарь с ключами `0..n-1` — как массив, где индекс = id уборки; id `0` игнорируется). `event_type`: `assign` «Добавлена уборка», `remove` «Убрана уборка», `dop_time` «Доп. время», `replace` «Замена списка уборок». Строки: «Уборки: + Объект · Должность (доп. время N мин), − Объект · Должность» и «Доп. время «Объект · Должность»: A мин → B мин»; уборка, которой нет в списке, — «уборка #id». `comment` (источник изменения: «Карточка уборки «X»», «Уборка «X» удалена», «Старый экран привязок») показывается строкой «Источник». Если снимков нет — «Подробности: Недоступны»; отсутствующая сторона считается кафе без уборок;
- технические поля (`id`, id строк, `time_sec`, `sort`, `work_id` в строках времени и кафе) не показываются; событие, где поменялись только они, скрывается.

## Маршруты

В скобках — метод `useCleaningsApi`.

### Общий контекст

#### `get_all` (`getBootstrap`)

- Request: без параметров.
- Response: `module_info`, `locations`, `cities` (`[{ id, name }]`), `roles`, `scheduleTypeOptions`, `additionTypeOptions`, `access`. `module_info.name` — заголовок страницы и вкладки браузера.
- Без `cities` (старый BE) FE собирает список городов из `locations`.
- Грузится один раз за сессию модуля и переиспользуется между подстраницами.

### Шаблоны уборок

#### `templates` (`getTemplates`)

- Response: `templates: Template[]`.

#### `templates/save_new` (`createTemplate`), `templates/save_edit` (`updateTemplate`)

- Request: поля шаблона из `normalizeTemplatePayload` (`name`, `categoryId`, `roleId`, `duration`, `confirmation`, `scheduleType`, `days`, `times`, `deleteTimes`, `is_not_del`, `is_need`, `activationCount`, `additionType`, `triggerCleaningId`, `locationIds`); для `save_edit` дополнительно `id`.
- Response: `st`, `text`, `id`.
- BE отклоняет (`st: false`, `text` показывается как ошибка): время запуска не `ЧЧ:ММ` или не кратно 5 минутам; время удаления не `ЧЧ:ММ`; `after_cleaning` без `triggerCleaningId` или со ссылкой на сам шаблон; новый шаблон с `scheduleType` или `additionType` = `other`. FE ловит эти случаи до запроса.
- `deleteTimes` — BE хранит одно время (первое). При `is_not_del: true` FE не очищает сохранённое время: оно остаётся в данных, но не действует.
- `is_need` в форме не показывается; FE отправляет значение из загруженного шаблона без изменений.
- `triggerCleaningId` отправляется всегда — значение из загруженного шаблона, в том числе не для `after_cleaning` (без поля BE обнуляет `work_id`). У нового шаблона без триггера — `0`.
- `times` / `deleteTimes` — строго `ЧЧ:ММ`: FE приводит legacy-значения `Ч:ММ` и `ЧЧ:ММ:СС` к `ЧЧ:ММ` при загрузке и сохранении.

#### `templates/save_status` (`updateTemplateStatus`)

- Request: `{ id, type: "is_active", value: 1 | 0 }`. `1` — активная, `0` — архив.
- Response: `st`, `text`.

#### `templates/delete` (`deleteTemplate`)

- Request: `{ id }`.
- Response: `st`, `text`. Полное удаление; в UI кнопка есть только у шаблонов в архиве.

### Виды уборок (категории)

#### `categories` (`getCategories`)

- Response: `categories: Category[]`.

#### `categories/save_new` (`createCategory`), `categories/save_edit` (`updateCategory`)

- Request: `{ name, instruction }`; для `save_edit` дополнительно `id`.
- Response: `st`, `text`, `id`. После создания FE выбирает вид уборки по `id`.

#### `categories/templates/save` (`saveCategoryTemplates`)

- Request: `{ id, templateIds: number[] }` — полный список уборок, к которым применяется вид уборки; убранные из списка остаются «Без вида уборки».
- Response: `st`, `text`, `id`, `templatesCount`. Ошибки: `«Некорректный список уборок»`, `«Уборка не найдена»`.
- FE вызывает после `save_new`/`save_edit` и только если набор уборок изменился; `save_edit` — только если изменились название или инструкция (HTML, который редактор лишь пересобрал при загрузке, изменением не считается и уходит в сохранённом виде). Одно сообщение об успехе на всё сохранение карточки.

#### `categories/delete` (`deleteCategory`)

- Request: `{ id }`.
- Response: `st`, `text`. Если вид уборки применяется к шаблонам — `st: false`, `text: "Вид уборки применяется к уборкам, удалить нельзя"`.

### Уборки кафе

#### `cafes` (`getCafes`)

- Request: `{ locationId }`.
- Response: `selectedLocationId`, `assignedTemplates`, `availableTemplates`.

#### `cafes/assign` (`assignTemplateToCafe`)

- Request: `{ locationId, templateId, dop_time }`. FE передаёт `dop_time: 0`.
- Response: `st`, `text`, `templateId`, `locationId`. Если уборка уже назначена — `st: true`, `text: "Уборка уже назначена"`.

#### `cafes/remove` (`removeTemplateFromCafe`)

- Request: `{ locationId, templateId }`.
- Response: `st`, `text`.

#### `cafes/save_dop_time` (`saveCafeDopTimes`)

- Request: `{ locationId, items: [{ templateId, dop_time }] }` — только изменённые строки.
- Response: `st`, `text`, `skippedTemplateIds`. Для пропущенных шаблонов FE показывает ошибку с их названиями.

#### `history/cafe` (`getCafeHistory`)

- Request: `{ locationId }` (BE принимает и `limit`, по умолчанию 50, максимум 200; FE не передаёт).
- Response: `history` — строки `History row` по кафе, `entity_label` — название кафе.
- UI: кнопка «История изменений» в тулбаре «Уборки Кафе» (видна и без права редактирования) открывает диалог «История изменений» с названием выбранного кафе в подзаголовке. История грузится при открытии и кэшируется по кафе на сессию модуля.

### Проверка уборок и заготовок

#### `control` (`getControl`)

- Request: `{ locationId, dateFrom, dateTo }` (даты `YYYY-MM-DD`).
- Response:
  - `items` — нормализованные уборки;
  - `preparations` — нормализованные заготовки;
  - `manualTemplates` — шаблоны для ручного добавления (см. выше);
  - `work`, `pf_list`, `all_work`, `availableManualCleanings` — сырые legacy-срезы. `all_work` / `availableManualCleanings` — невзятые строки `<base>.work`, а не шаблоны; FE подмешивает их в список уборок, но не использует для ручного добавления.
- Если `manualTemplates` нет в ответе (старый BE), диалог ручного добавления показывает пустое состояние с пояснением.

Все действия ниже требуют точку (`locationId`). Response: `st`, `text`, опционально `status`. При `st: false` FE показывает `text` как ошибку.

| Маршрут | Метод FE | Request |
| --- | --- | --- |
| `control/manual_add` | `addManualCleaning` | `{ locationId, templateId }` |
| `control/approve` | `approveControlCleaning` | `{ locationId, id }` |
| `control/return` | `returnControlCleaning` | `{ locationId, id }` |
| `control/detach` | `detachControlCleaning` | `{ locationId, id }` |
| `control/delete` | `deleteControlCleaning` | `{ locationId, id, text }` |
| `control/approve_preparation` | `approvePreparation` | `{ locationId, id }` |
| `control/delete_preparation` | `deletePreparation` | `{ locationId, id, text }` |

- `id` — id строки уборки (`<base>.work.id`) или заготовки (`<base>.pf_work.id`).
- `text` — причина удаления. В диалоге удаления поле «Причина удаления» обязательно, не короче 3 символов (как в старом `check_works`).
- `manual_add` добавляет уборку на сегодня. Кнопка «Добавить» неактивна, если `todayCount >= maxCount` (в том числе при `maxCount = 0`); в карточке всегда показывается «Сегодня: X из Y».

#### `control/get_edit_work` (`getPreparationEditContext`)

- Request: `{ point_id: { id, base, name }, id }`.
- Response: `item` — заготовка с историей правок `hist`.

#### `control/save_edit` (`savePreparationEdit`)

- Request: `{ point_id: { id, base, name }, id, count_pf, count_trash }`.
- Response: `st`, `text`.

### История

#### `history/template` (`getTemplateHistory`), `history/category` (`getCategoryHistory`)

- Request: `{ id }`.
- Response: `history`.

## Перезагрузка после изменений

- Шаблоны: `templates`, затем `categories`; на вкладке кафе — ещё `cafes`.
- Виды уборок: `categories`; после `categories/templates/save` — ещё `templates`, кэш `control` и кафе сбрасывается.
- История уборок, видов уборок и кафе кэшируется на сессию модуля и сбрасывается целиком после любого изменения шаблона (`save_new`, `save_edit`, `save_status`, `delete`), вида уборки и после `cafes/assign`, `cafes/remove`, `cafes/save_dop_time`: повторно открытый диалог запрашивает историю заново.
- Кафе (`assign`, `remove`): `cafes` по выбранной точке, затем `templates`; `save_dop_time` — `cafes`.
- Проверка (все действия): `control` по текущим точке и датам.
- Ответы `control` кэшируются на сессию модуля по точке и датам. После изменений шаблонов (`save_new`, `save_edit`, `save_status`, `delete`) и кафе (`assign`, `remove`, `save_dop_time`) кэш сбрасывается, и при возврате в «Проверку заготовок и уборок» `control` запрашивается заново.
- `get_all` не используется как универсальная перезагрузка.

## Не используется FE

- `assignments/save` — старая полная перезапись привязок по `roleId + locationId`. Без `roleId` BE отвечает `st: false`, `text: "Не выбрана должность"`; доступ к точке проверяется. FE маршрут не вызывает: доп. время и привязки сохраняются через `cafes/*`.
