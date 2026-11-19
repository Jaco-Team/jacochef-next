# Cleanings — контракт FE ↔ BE

Документ описывает маршруты, которые реально вызывает модуль `/cleanings` (`components/cleanings/useCleaningsApi.js`), и форму их запросов/ответов. Backend-описание модуля — `app/Chef/Cleanings/README.md` в репозитории Chef BE.

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

`id`, `name`, `city`, `base`.

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

Строки `change_events`: `id`, `created_at`, `actor_name`, `event_type`, `diff_json` (для шаблонов — `before_json` / `after_json`, FE строит diff сам).

## Маршруты

В скобках — метод `useCleaningsApi`.

### Общий контекст

#### `get_all` (`getBootstrap`)

- Request: без параметров.
- Response: `module_info`, `locations`, `roles`, `scheduleTypeOptions`, `additionTypeOptions`, `access`.
- Грузится один раз за сессию модуля и переиспользуется между подстраницами.

### Шаблоны уборок

#### `templates` (`getTemplates`)

- Response: `templates: Template[]`.

#### `templates/save_new` (`createTemplate`), `templates/save_edit` (`updateTemplate`)

- Request: поля шаблона из `normalizeTemplatePayload` (`name`, `categoryId`, `roleId`, `duration`, `confirmation`, `scheduleType`, `days`, `times`, `deleteTimes`, `is_not_del`, `is_need`, `activationCount`, `additionType`, `triggerCleaningId`, `locationIds`); для `save_edit` дополнительно `id`.
- Response: `st`, `text`, `id`.

#### `templates/save_status` (`updateTemplateStatus`)

- Request: `{ id, type: "is_active", value: 1 | 0 }`. `1` — активная, `0` — архив.
- Response: `st`, `text`.

#### `templates/delete` (`deleteTemplate`)

- Request: `{ id }`.
- Response: `st`, `text`. Полное удаление; в UI кнопка есть только у шаблонов в архиве.

### Категории

#### `categories` (`getCategories`)

- Response: `categories: Category[]`.

#### `categories/save_new` (`createCategory`), `categories/save_edit` (`updateCategory`)

- Request: `{ name, instruction }`; для `save_edit` дополнительно `id`.
- Response: `st`, `text`, `id`. После создания FE выбирает категорию по `id`.

#### `categories/delete` (`deleteCategory`)

- Request: `{ id }`.
- Response: `st`, `text`. Если категория используется в шаблонах — `st: false`, `text: "Категория используется в уборках"`.

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

- Request: `{ locationId }`.
- Response: `history`. Обёртка есть, UI истории кафе — в следующих этапах.

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
- Категории: `categories`.
- Кафе (`assign`, `remove`): `cafes` по выбранной точке, затем `templates`; `save_dop_time` — `cafes`.
- Проверка (все действия): `control` по текущим точке и датам.
- Ответы `control` кэшируются на сессию модуля по точке и датам. После изменений шаблонов (`save_new`, `save_edit`, `save_status`, `delete`) и кафе (`assign`, `remove`, `save_dop_time`) кэш сбрасывается, и при возврате в «Контроль» `control` запрашивается заново.
- `get_all` не используется как универсальная перезагрузка.

## Не используется FE

- `assignments/save` — старая полная перезапись привязок по `roleId + locationId`. Без `roleId` BE отвечает `st: false`, `text: "Не выбрана должность"`; доступ к точке проверяется. FE маршрут не вызывает: доп. время и привязки сохраняются через `cafes/*`.
