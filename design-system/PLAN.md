# План Storybook и единой дизайн-системы Chef

## Исходная задача

Нужно накатить Storybook в `jacochef-next`, выстроить единую дизайн-систему для Chef-интерфейса, настроить системный промпт так, чтобы новые UI-задачи ориентировались на Storybook, обновить MUI до актуальной версии и провести миграцию по проекту.

Целевой дизайн:

- Figma: `https://www.figma.com/design/bzb8ksK03R5FeMzRBKsEo9/Chief-screens?node-id=380-206795&t=wWGzyWi8mJvb7HgR-0`

## Проверенное текущее состояние

- Рабочая ветка: `feat/storybook-42983`.
- Рабочее дерево перед стартом чистое.
- Проект использует Next.js pages router, React 19, MUI и локальные Laravel API wrappers.
- Storybook-конфиг в репозитории пока не найден: нет `.storybook`, `@storybook/*` в `package.json` и story-файлов.
- Текущие MUI-пакеты:
  - `@mui/material` `^7.3.11`
  - `@mui/icons-material` `^7.3.11`
  - `@mui/lab` `^7.0.1-beta.24`
  - `@mui/x-date-pickers` `^8.29.0`
  - `@mui/x-charts` `^9.4.0`
- По npm на 28.08.2026 подтверждены и установлены:
  - `@mui/material` `^9.4.0`
  - `@mui/icons-material` `^9.4.0`
  - `@mui/lab` `^9.0.0-beta.9`
  - `@mui/x-date-pickers` `^9.12.0`
  - `@mui/x-charts` `^9.12.0`
- В проекте уже есть частичная миграция под MUI v7 `Grid size={...}`, но массовый поиск показывает большое количество старых `Grid`-паттернов с `xs`, `sm`, `md`, `lg`, `xl` и `item`.

## Текущий статус интеграционной ветки

- Ветка пересобрана от `origin/main`: Storybook, дизайн-система, документация и MUI migration составляют отдельный PR без кода `staff_schedule` и без удаления legacy `ui/*`.
- Установлены актуальные MUI core/Lab/X-пакеты и Storybook `10.5.10`; выполнены official aggregate codemod passes для Material UI v7/v9 и MUI X v9.
- Автоматические codemods затронули глобальный source tree. До merge требуется завершить manual audit оставшихся legacy `TextField` и picker prop shapes, которые codemods не могут безопасно раскрыть через wrappers и spread props.
- Первый production pilot дизайн-системы: `components/close_buy`. Он переводится на `Jaco*` controls, включая автономный `JacoCityCafe`, при сохранении legacy компонентов для остальных модулей.
- Визуальный baseline для пилота должен быть Close Buy, а не `staff_schedule`: последний остается в своей PR-ветке и позднее будет ребейзиться на этот foundation layer.

## Найденный контекст по Figma и staff_schedule

- `components/staff_schedule/README.md` уже ссылается на тот же Figma-файл как на источник истины для нового экрана.
- `components/staff_schedule/FIGMA.md` содержит заметки по Figma для fast actions modal и change point subscreen.
- `components/staff_schedule/MOBILE.md` содержит правила мобильной композиции, восстановленные из Figma и скриншотов.
- `doc/layout/mobile/staff_schedule.md` хранит подробные Figma mobile notes и список кадров, которые нужно экспортировать при доступе к Figma.
- Ветка `feat/staff_schedule-41639` содержит тот же `design-system/shared/ui` набор, что и текущая ветка; фактического перезаписывания `design-system/shared/ui` не требуется.
- `design-system/shared/ui` принят как канонический слой переиспользуемых UI-компонентов дизайн-системы. Публичный API продуктовых UI-компонентов использует префикс `Jaco*`, чтобы не конфликтовать с MUI-компонентами и legacy `My*` wrappers; нейтральные primitives остаются без префикса (`SmallFont`), а shared custom icons живут в `design-system/shared/icons`.
- `design-system/shared/tokens` принят как канонический слой дизайн-токенов.
- Storybook stories размещаются рядом с соответствующим FSD-слайсом в `__stories__`, а не в общей папке `design-system/stories`.
- `design-system/widgets` зарезервирован для будущих сложных составных компонентов после storyfication reusable UI.
- Новая структура не использует `v2` в именах: это был временный маркер отличия от старого набора компонентов. Для нового публичного API используется `Jaco*`.
- Автотесты для staff_schedule уже разведены:
  - unit: `tests/unit/staff-schedule`
  - e2e: `tests/e2e/staff-schedule`
  - запуск через `npm test -- --type=unit` и `npm test -- --type=e2e --scope=staff-schedule`

## Цели дизайн-системы

- Сделать Storybook рабочим источником UI-правил проекта, а не декоративным каталогом.
- Зафиксировать базовые Chef-токены: цвета, радиусы, типографику, плотность, отступы, состояния, таблицы, модальные окна, drawer/sheet для мобильных сценариев.
- Вытащить повторяемые UI-паттерны из существующих модулей в документированные stories.
- Синхронизировать системный промпт/локальные инструкции Codex с правилом: при UI-задачах сначала смотреть Storybook и существующие stories, затем код модуля, затем Figma.
- Использовать Figma staff_schedule как начальный эталон для Chef-компонентов, но не ломать текущие рабочие модули ради визуальной унификации одним коммитом.

## Детальный план buildout дизайн-системы

### 1. Стабилизировать токены

- Развести базовые токены по назначению, а не по месту использования: `uiColors`, `uiStateColors`, `uiTableColors`, `uiRadii`, `uiSpacing`, `uiTypography`, `uiShadows`, `uiControl`.
- Переносить повторяемые значения из компонентов в токены только когда они становятся общим контрактом: высота контролов, disabled surface, popover shadow, sheet radius, selected/hover colors.
- Не делать большой theme rewrite сразу: сначала закрепить токены в `design-system/shared/tokens` и визуально показать их в colocated stories.
- При следующей миграции модулей заменять локальные magic values на токены только в task-affected файлах.

### 2. Storyfy reusable UI first

- Держать reusable stories рядом с FSD-слайсом `design-system/shared/ui/__stories__`.
- Разделить stories по пользовательской роли компонента: controls, forms, surfaces/feedback, modals.
- Для каждого нового reusable паттерна сначала добавить story, затем использовать компонент в feature-коде.
- Формы покрывать отдельно: text/number/multiline, select, autocomplete, date picker, time picker, disabled/error states.
- Complex widgets и page-level stories переносить позже в `design-system/widgets`, когда reusable слой перестанет быть сырым.

### 3. Добавить variants и states как контракт

- Для action controls обязательно показывать primary, success, secondary, outlinePrimary, danger, compact, loading, disabled.
- Для form controls обязательно показывать normal, disabled, error/helperText, multiline, search/autocomplete, numeric limits.
- Для feedback обязательно показывать success, warning, error, info, loading, empty state и overlay.
- Для selectable/list паттернов фиксировать selected и destructive selected, чтобы destructive actions не смешивались с обычными save actions.
- Если новый модуль требует состояние, которого нет в Storybook, сначала расширить story и только потом размножать паттерн в коде.

## Границы первой реализации

Первая реализация не должна сразу переписывать весь интерфейс. Безопасный порядок:

1. Обновить MUI и совместимые MUI X-пакеты.
2. Устранить обязательные breaking changes и синтаксические ошибки.
3. Поднять базовый Storybook для Next.js + MUI + Emotion.
4. Добавить дизайн-системный слой stories для уже существующих компонентных паттернов.
5. Зафиксировать инструкции для будущих UI-задач.
6. После этого идти по модулям и мигрировать UI постепенно.

## Этап 1. MUI upgrade и миграции

### 1.1 Версии и установка

- Перед установкой проверить актуальные версии через npm:
  - `@mui/material`
  - `@mui/icons-material`
  - `@mui/lab`
  - `@mui/x-date-pickers`
  - `@mui/x-charts`
  - `@emotion/react`
  - `@emotion/styled`
- Обновлять `package.json` и `package-lock.json` одной npm-операцией, чтобы не разъехались peer dependencies.
- Не добавлять новые зависимости, кроме Storybook и обязательных peer/adapter-пакетов.

### 1.2 Обязательные миграции MUI

- Проверить upgrade guide текущей major-версии MUI перед массовыми правками.
- Провести миграцию `Grid`:
  - старые breakpoint props `xs`, `sm`, `md`, `lg`, `xl` заменить на `size`;
  - удалить устаревший `item`, если новая версия больше его не поддерживает;
  - не менять layout-семантику там, где `Grid` используется как container.
- Проверить импорты MUI:
  - deprecated paths;
  - lab-компоненты;
  - date pickers adapters;
  - theme overrides и component slots.
- Проверить custom `sx` и theme overrides на deprecated class names/slot names.
- После каждой пачки JS/JSX-изменений запускать только точечный syntax check:
  - `npm run check:syntax -- <touched files>`

### 1.3 Рискованные зоны

- Глобальные файлы: `_app`, `_document`, `ecosystem.config.js`.
- Общие формы и селекты: их нельзя менять без необходимости, потому что они используются во многих модулях.
- Табличные модули с плотной версткой: старые `Grid` props могут влиять на ширину фильтров и модалок.
- staff_schedule: использовать как эталон Figma-подхода, но не смешивать Storybook rollout с функциональными доработками расписания.

## Этап 2. Storybook

### 2.1 Базовая настройка

- Установить Storybook для Next.js.
- Добавить `.storybook/main.*` и `.storybook/preview.*`.
- Подключить MUI ThemeProvider, Emotion cache и глобальные стили так же, как приложение.
- Добавить npm scripts:
  - `storybook`
  - `build-storybook`
- Сохранить артефакты проверок в `.codex-artifacts/`, если появятся скриншоты или browser snapshots.

### 2.2 Первый каталог stories

Начать не с абстрактных Button/Input, а с реальных повторяемых паттернов Chef:

- кнопки действий: primary, secondary, icon-only, destructive;
- segmented controls / toggle groups;
- фильтры и dense controls;
- Dialog desktop;
- SwipeableDrawer mobile sheet;
- таблицы и sticky headers;
- пустые состояния;
- alert/error states;
- staff_schedule fast actions modal states как Figma-backed пример для будущего слоя `design-system/widgets`.

## Этап 3. Дизайн-токены и тема

- Найти текущую тему приложения и все локальные theme overrides.
- Зафиксировать tokens в одном месте:
  - palette;
  - typography;
  - spacing;
  - radius;
  - shadow/elevation;
  - control heights;
  - table density;
  - modal/sheet shell.
- Stories должны показывать токены визуально и жить рядом с `design-system/shared/tokens`.
- Компоненты должны ссылаться на theme/tokens, а не копировать ad-hoc значения.

## Этап 4. Системный промпт и правила работы

После появления первых stories обновить локальные инструкции проекта:

- при UI-задаче сначала открыть Storybook/story исходного паттерна;
- если story есть, новая реализация должна совпадать с ним по токенам и состояниям;
- если story нет, сначала добавить или расширить colocated story для нового паттерна;
- Figma использовать как внешний эталон, Storybook как внутренний контракт реализации;
- использовать актуальные API MUI в task-affected файлах и исправлять deprecated MUI-паттерны по ходу задачи;
- сначала искать reusable UI в `design-system/shared/ui`; если есть только legacy `ui/My*`, пересоздавать автономный `Jaco*` компонент в дизайн-системе и storyfication его перед использованием;
- не изобретать новые цвета, радиусы и плотность без обновления дизайн-системы.

## Figma MCP и визуальная нормализация

- Текущий Linux-клиент на машине найден как Snap `figma-linux`; это неофициальная Electron/browser-wrapper сборка, а не официальный Desktop MCP путь Figma.
- Локальный Desktop MCP endpoint `http://127.0.0.1:3845/mcp` сейчас не отвечает, поэтому selection-based workflow через текущий Snap не считается рабочим.
- Практический путь для этой задачи: remote Figma MCP через Codex + маленькие node-level `get_design_context` calls. Большие секции использовать только для ориентации, затем дробить на input/button/segmented/header/table primitives.
- Из Figma подтверждены базовые визуальные опоры: red brand `#DD1A32`, grey xlight `#F3F3F3`, grey light `#E5E5E5`, disabled/icon grey `#A6A6A6`, text body/nearly black `#5E5E5E`, 44px controls, 12px control radius, 8px selected segment radius, Roboto 16/20 regular и medium.
- Решение по дизайн-системе: сделать палитру спокойнее и ближе к Figma, не тащить старый более яркий красный и темный `#111827` как дефолт для рабочих Chef controls.

## Этап 5. Проверки

Минимальная проверка для dependency/storybook шага:

- `npm run check:syntax -- <touched js/jsx files>`
- `npm run build-storybook`
- точечный запуск Storybook локально при необходимости

Для staff_schedule regression после MUI upgrade:

- `npm test -- --type=unit --scope=staff-schedule`
- `npm test -- --type=e2e --scope=staff-schedule` только когда локальный FE/API уже подняты и явно доступны.

### 5.1 Визуальное покрытие миграции по модулям

- Полное screenshot-regression покрытие всего приложения сейчас слишком тяжелое: в проекте много страниц, динамических таблиц, текущих дат, авторизации, API-зависимых данных и модулей без готового E2E harness.
- Базовый контракт миграции UI: Storybook покрывает reusable `Jaco*` компоненты, их variants/states и дизайн-токены; page-level screenshots используются тонко и только на мигрируемых модулях.
- Для каждого модуля после перевода на дизайн-систему добавлять минимум один стабильный desktop visual smoke/baseline через Playwright.
- Mobile screenshot добавлять только там, где есть отдельная мобильная композиция, drawer/sheet или бизнес-критичный responsive сценарий.
- Visual tests не входят в обычный `all`, чтобы не сделать локальный цикл тяжелым и flaky; запускать их явно:
  - `npm test -- --type=visual --scope=staff-schedule`
  - обновление baseline делать явно через Playwright passthrough `--update-snapshots`.
- Первый эталонный модуль для этого подхода - `staff_schedule`, потому что у него уже есть локальный E2E harness и Figma-контекст.

## Открытые вопросы

- Нужно ли целиться в абсолютный npm `latest` MUI, если это major выше текущей v7, или ограничиться последней стабильной v7-линейкой на первом шаге?
- Где хранить внутренний системный промпт: только в `AGENTS.md` или отдельным документом рядом с дизайн-системой?
- Нужно ли экспортировать актуальные Figma-кадры сейчас, или достаточно использовать уже сохраненные staff_schedule заметки до появления доступа к Figma MCP?
- Должен ли Storybook стать обязательной проверкой CI или пока только локальным инструментом?

## Ближайший план работ

- [x] Создать рабочую ветку/проверить текущую ветку.
- [x] Создать папку дизайн-системной задачи.
- [x] Завести этот `PLAN.md`.
- [x] Найти текущий MUI/Storybook/staff_schedule/Figma/test контекст.
- [x] Проверить точные npm latest-версии для MUI-пакетов.
- [x] Обновить MUI-пакеты и lockfile.
- [x] Провести первую пачку обязательных MUI-миграций.
- [x] Настроить базовый Storybook.
- [x] Добавить первые stories для Chef UI-паттернов.
- [x] Обновить проектные инструкции под Storybook-first UI workflow.
- [x] Собрать Storybook и устранить найденные ошибки сборки.
- [x] Провести следующую пачку MUI v9 deprecation/manual migration: перевести task-affected usage `PaperProps`/`InputProps` на `slotProps` и убрать дублирование `storybook-static` в `.gitignore`.
- [x] Собрать Next.js приложение после MUI upgrade.
- [x] Запустить staff_schedule unit tests после MUI upgrade.
- [x] Проверить Storybook в браузере: Tokens story открывается без console errors.
- [x] Сверить `design-system/shared/ui` с веткой `feat/staff_schedule-41639`.
- [x] Перестроить Storybook-архитектуру вокруг FSD-слоев `design-system/shared/tokens`, `design-system/shared/ui` и `design-system/widgets`.
- [x] Перенести компонентный слой из `ui/v2` в `design-system/shared/ui` без `v2` в публичных именах новой структуры.
- [x] Переименовать публичные компоненты дизайн-системы в `Jaco*`, чтобы избежать коллизий с MUI и legacy `My*` компонентами.
- [x] Убрать legacy `My*` зависимости из Jaco wrappers: формы, date/time controls и modal shell реализованы автономно на MUI с сохранением совместимых prop-интерфейсов.
- [x] Повторно проверить syntax, Storybook build, Next build и staff_schedule unit tests после `Jaco*` rename.
- [x] Обновить core project agent config: Storybook-first, latest MUI APIs, scoped deprecation fixes, `Jaco*` components first, legacy `My*` recreated into design-system when needed.
- [x] Перевести staff_schedule и Storybook stories на импорт из `@/design-system/shared/ui`.
- [x] Разместить stories рядом с FSD-слайсами: `shared/tokens/__stories__` и `shared/ui/__stories__`.
- [x] Добавить `design-system/widgets` как будущий слой сложных компонентов.
- [x] Детализировать первые 3 пункта buildout дизайн-системы: токены, reusable UI stories, variants/states.
- [x] Реализовать первый buildout chunk: расширить tokens, добавить Forms stories, расширить state coverage для Controls и Feedback stories.
- [x] Проверить Figma MCP путь на Ubuntu/Snap: текущий `figma-linux` не дает Desktop MCP, рабочий путь - remote Figma MCP и маленькие node-level reads.
- [x] Применить Figma-derived visual normalization к DS tokens и базовым `Jaco*` primitives.
- [x] Добавить opt-in visual coverage для `staff_schedule` как первый per-module screenshot pattern.
