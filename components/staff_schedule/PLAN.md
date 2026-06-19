# План модуля Staff Schedule

## Кратко

Цель первого запуска: собрать полный UI нового `staff_schedule` по Figma для desktop и mobile, но без зависимости от нового backend-контракта.

На первом проходе модуль должен:

- выглядеть как новый экран из Figma
- иметь полный набор экранов, блоков, состояний и таблиц
- работать на mock/stub данных
- при необходимости уметь читать legacy `work_schedule`, но только через изолированный adapter/fallback слой, который потом можно удалить без переписывания UI

Backend в этом плане учитывается только как reference для следующего этапа подключения API.

## Что считать source of truth

Приоритет источников:

1. Figma desktop
2. Figma mobile
3. Legacy `pages/work_schedule.js` только как reference по смыслу данных и составу сценариев
4. Новые модули уровня `cleanings` и `vendors` как reference по frontend-структуре, разбиению на page/view-model/api

Это значит:

- layout, плотность, визуальная иерархия и mobile-поведение берем из Figma
- состав сущностей, period split, смысл day cells и summary-колонок можно временно брать из `work_schedule`
- архитектуру нового фронта делаем не как в legacy-монолите, а как в новых модулях: page + hooks/store + adapter + presentational blocks

## Scope первого релиза

Первый релиз должен дать полный UI-макет модуля с рабочей навигацией по экрану и всеми основными состояниями, даже если часть данных пока заглушена.

В scope входят:

- новый route для модуля
- desktop и mobile версия
- page shell
- header / title area
- filters block
- табы периодов `1-15` и `16-end`
- основная schedule table
- блоки смен
- строки сотрудников
- day cells
- summary / totals зоны
- loading / empty / error / no-access состояния
- mock data set для всех визуальных сценариев
- isolated legacy fallback adapter

В scope не входят:

- финальный backend-контракт
- create/edit/delete бизнес-операции
- сохранение часов
- массовые fast-actions
- переносы между сменами и точками
- бонусные диалоги и payroll-edit flow из legacy

Если в Figma есть кнопки или controls для будущих действий, в первом проходе они могут быть rendered как disabled/stubbed, пока нет API.

## Общая стратегия реализации

Новый модуль нужно делать как независимый frontend-контур, а не как переработку `pages/work_schedule.js`.

Рекомендуемая схема:

- route-level page
- page container
- UI sections/components
- view-model normalizer
- data source switcher
- mock dataset
- optional legacy adapter

Это даст три режима работы:

1. `mock`
   - основной режим первой разработки и отладки UI
2. `legacy`
   - временный fallback через adapter поверх `work_schedule`-источника
3. `api`
   - будущий режим для нового backend

Переключение между режимами должно происходить в одном месте, а не быть размазано по компонентам.

## Предлагаемая frontend-архитектура

По структуре ориентир на `cleanings` и `vendors`: page-компонент, отдельный hook/view-model, отдельные helpers/normalizers, отдельные display components.

Рекомендуемое разбиение:

- `pages/staff_schedule/index.js` или другой новый route
- `components/staff_schedule/StaffSchedulePage.jsx`
- `components/staff_schedule/useStaffSchedulePage.js`
- `components/staff_schedule/staffScheduleMock.js`
- `components/staff_schedule/staffScheduleAdapters.js`
- `components/staff_schedule/staffScheduleViewModel.js`
- `components/staff_schedule/staffScheduleConstants.js`
- `components/staff_schedule/sections/*`
- `components/staff_schedule/blocks/*`

Минимальные UI-блоки:

- page header
- filters panel
- period tabs
- schedule grid
- shift section header
- employee row
- day cell
- totals row
- empty state
- loading state
- error state

## Базовая view-model форма

UI не должен знать ни про legacy shape, ни про будущий backend shape.

Нужен единый view-model примерно такого уровня:

- `pageTitle`
- `filters`
- `periods`
- `periods[].id`
- `periods[].label`
- `periods[].days`
- `periods[].shifts`
- `periods[].shifts[].shift`
- `periods[].shifts[].rows`
- `periods[].shifts[].totals`
- `periods[].summary`
- `uiState`
- `capabilities`

Для day cell уровень должен быть отдельным объектом, а не строкой:

- `date`
- `weekday`
- `status`
- `hoursText`
- `hoursIntervals`
- `load`
- `flags`

Это важно, чтобы:

- сначала спокойно рисовать mock/Figma
- затем подложить legacy adapter
- затем заменить источник на новый API без переписывания таблицы

## Data source strategy

### 1. Mock-first

Основной путь первого этапа: сначала собрать все экраны на mock data.

Нужны как минимум такие mock scenarios:

- обычный заполненный период
- пустой период
- несколько смен
- одна смена с большим количеством сотрудников
- пользователь без часов в отдельные дни
- mixed day states
- длинные summary values
- loading state
- error state
- no-access state

Mock dataset должен быть достаточно полным, чтобы на нем можно было:

- проверить desktop
- проверить mobile
- проверить sticky behavior
- проверить скроллы
- проверить длинные имена и плотные таблицы

### 2. Legacy fallback

Если нужно быстрее сверять смысл данных с живым модулем, можно подключить fallback на старый источник.

Но только через отдельный adapter слой:

- `loadLegacyStaffScheduleContext()`
- `loadLegacyStaffScheduleGraph()`
- `mapLegacyWorkScheduleToViewModel()`

UI-компоненты не должны знать, что пришел legacy payload.

Этот слой должен быть:

- изолированным
- маленьким
- легко удаляемым
- без протаскивания legacy field names в JSX

### 3. Future API

После готовности нового backend добавляется третий источник:

- `loadStaffScheduleBootstrap()`
- `loadStaffScheduleGraph()`
- `mapApiStaffScheduleToViewModel()`

UI в этот момент не должен меняться существенно.

## Route strategy

Так как первый запуск идет на mock/stub данных, safest path:

- поднимать новый route отдельно от legacy `work_schedule`
- не смешивать новый экран с текущим модулем
- не заменять текущую страницу, пока не пройдет UI и data verification

Подходящий вариант:

- отдельный route под новый модуль
- с явным internal source mode: `mock`, `legacy`, `api`

Даже если потом route переедет или заменит старый, на этапе UI-разработки отдельная страница безопаснее.

## Детальный план по этапам

### Этап 0. Зафиксировать UI contract

Цель:

- определить, что именно строим до backend

Задачи:

- зафиксировать desktop и mobile Figma frames как source of truth
- зафиксировать, что первый запуск идет на mocks
- зафиксировать, что controls без API можно делать disabled/stubbed
- зафиксировать, что legacy `work_schedule` используется только как reference/fallback
- определить временный route нового модуля

Результат этапа:

- понятный UI-first scope без ожидания нового API

### Этап 1. Page shell и module skeleton

Цель:

- поднять новый модуль по структуре новых экранов проекта

Задачи:

- создать route новой страницы
- создать page container
- вынести page state в отдельный hook
- подготовить constants для tabs, view mode, column groups
- подготовить source switcher: `mock | legacy | api`
- выставить title/subtitle/page-level layout

Результат этапа:

- страница открывается и держит базовый layout без реальных таблиц

### Этап 2. Mock dataset и UI state matrix

Цель:

- получить надежную среду для разработки UI без backend

Задачи:

- собрать полноценный `staffScheduleMock`
- описать несколько presets/scenarios
- предусмотреть bootstrap-like данные: точки, месяцы, access, selected defaults
- предусмотреть graph-like данные: периоды, смены, сотрудники, day cells, totals
- добавить искусственные edge cases для mobile и overflow

Результат этапа:

- разработка и QA UI больше не зависят от API

### Этап 3. Filters block

Цель:

- собрать верхнюю часть экрана по Figma

Задачи:

- реализовать title area
- реализовать filters row
- реализовать point selector
- реализовать month selector
- при наличии в Figma добавить secondary controls
- для controls без API сделать stub interaction без бизнес-сохранения

Важно:

- визуальный порядок, размеры, spacing и mobile stacking должны совпадать с Figma
- логика фильтров на первом этапе может работать поверх mock state

Результат этапа:

- верхний блок экрана готов для desktop и mobile

### Этап 4. Period tabs и state switching

Цель:

- реализовать переключение `1-15` и `16-end`

Задачи:

- добавить tabs по Figma
- переключать visible period без перезагрузки всей страницы
- обеспечить desktop/mobile parity
- предусмотреть empty period behavior

Результат этапа:

- основной navigation flow внутри экрана работает

### Этап 5. Main schedule grid

Цель:

- собрать главную таблицу/сетку нового модуля

Задачи:

- реализовать fixed identity area слева
- реализовать day columns выбранного периода
- реализовать правые summary columns
- реализовать shift group rows
- реализовать employee rows
- реализовать day cells по Figma
- предусмотреть visual states для пустой ячейки, часов, status, special flag

Отдельно проверить:

- sticky header
- sticky first columns
- horizontal scroll
- dense table behavior
- длинные имена сотрудников и смен

Результат этапа:

- основной каркас графика визуально работает

### Этап 6. Totals и summary zones

Цель:

- довести нижние и боковые агрегаты до состояния, пригодного для сверки с дизайном

Задачи:

- реализовать row-level totals
- реализовать shift-level totals, если они есть в макете
- реализовать period totals/footer rows
- реализовать summary blocks справа или снизу, если они есть в Figma
- сделать форматирование значений консистентным

Результат этапа:

- экран собран не только как сетка дней, но и как итоговый operational dashboard

### Этап 7. Stubbed actions и future affordances

Цель:

- показать весь UI первого релиза, даже если backend еще не готов

Задачи:

- отрендерить кнопки и controls из Figma
- разделить их на:
  - working on mock state
  - disabled
  - placeholder with no-op
- не тащить legacy mutation logic
- не строить временные save-хендлеры, которые потом придется выпиливать из JSX

Подход:

- если control влияет только на локальный визуальный state, его можно оживить на mocks
- если control зависит от backend mutation, он должен остаться isolated stub

Результат этапа:

- UI выглядит полным, но не обрастает временной бизнес-логикой

### Этап 8. Mobile adaptation

Цель:

- собрать отдельное внятное mobile поведение, а не просто уменьшить desktop

Задачи:

- проверить Figma mobile frame отдельно
- определить, остается ли table-scroll pattern или есть card/stack variation
- реализовать mobile header
- реализовать mobile filters layout
- реализовать mobile tab behavior
- реализовать mobile data area так, чтобы day cells и totals были читаемыми

Отдельно проверить:

- горизонтальный скролл
- sticky behavior на узких экранах
- переполнение summary columns
- touch targets

Результат этапа:

- mobile версия соответствует Figma и пригодна для реальной проверки

### Этап 9. Legacy fallback adapter

Цель:

- получить временный мост к старому модулю без заражения нового UI legacy-полями

Задачи:

- определить минимально достаточные legacy requests
- вытащить только нужные read-only данные
- преобразовать их в новый view-model
- изолировать mapping в отдельном adapter-файле
- не переносить в новый код fast-actions, mutation endpoints, confirm flows и edit dialogs

Результат этапа:

- новый экран можно наполнить живыми reference-данными, если это нужно для сверки

### Этап 10. QA по Figma и legacy meaning

Цель:

- закрыть визуальные и смысловые расхождения до подключения нового API

Задачи:

- сравнить desktop экран с Figma
- сравнить mobile экран с Figma
- проверить состав period tabs
- проверить структуру shift groups
- проверить employee rows
- проверить day cell semantics на reference-данных
- проверить totals и summary placement
- проверить loading, empty, error, no-access states

Результат этапа:

- UI готов к подключению upgraded API

### Этап 11. Подключение upgraded API

Цель:

- заменить mock/legacy источник на новый backend без переделки визуального слоя

Задачи:

- подключить bootstrap endpoint
- подключить graph endpoint
- заменить source mode на `api`
- при необходимости оставить `mock` для разработки и regression checks
- удалить или отключить legacy adapter

Результат этапа:

- модуль переходит на новый backend с минимальным риском для UI

## Предлагаемый порядок разработки

Практический порядок такой:

1. Новый route и skeleton модуля
2. Mock dataset
3. Header и filters
4. Tabs
5. Main grid
6. Totals
7. Stubbed controls
8. Mobile layout
9. Legacy fallback adapter
10. Figma/legacy QA
11. API wiring

Это лучший путь, если цель сейчас именно UI creation, а не ранняя привязка к API.

## Что брать из legacy `work_schedule`

Использовать только как reference:

- period split `1-15` и `16-end`
- смысл смен и группировки сотрудников
- типы day data
- набор summary-метрик, если они есть в новом дизайне
- edge cases по длинным таблицам и плотным колонкам

Не переносить:

- giant component structure
- inline business logic
- mutation methods
- confirm flows
- edit dialogs
- fast actions
- payroll save logic
- transport shape напрямую в JSX

## Что брать как reference из `cleanings` и `vendors`

Полезные ориентиры:

- page-level decomposition
- отдельный hook для page state
- вынос adapter/normalizer логики из JSX
- разделение screen shell и feature blocks
- возможность жить на разных data sources без переписывания UI

Это особенно важно, чтобы `staff_schedule` не стал еще одним монолитом уровня старого `work_schedule`.

## Note по backend-контракту на будущее

Это не основной предмет текущего этапа, но важно не сломать будущую интеграцию.

### Что должен уметь будущий API

Минимально нужны два слоя:

- bootstrap/context
- graph data

Bootstrap должен отдавать:

- `module_info`
- `points`
- `months`
- `access`
- `default_point_id`
- `default_month`

Graph должен отдавать:

- periods
- days
- shifts
- users
- day-level data
- summary/totals

### Почему legacy shape не стоит тянуть в новый UI

`work_schedule` сейчас перегружен:

- смешивает header data и graph data
- смешивает read data и mutation concerns
- опирается на row-driven render shape
- тащит access и financial flags глубоко в таблицу

Если новый UI сразу привязать к этому shape, потом upgrade API станет дорогим.

### Что, вероятно, придется скорректировать относительно legacy

Если сравнивать legacy `work_schedule` и новый Figma-first экран, backend-контракту, скорее всего, понадобятся такие корректировки:

- отделить bootstrap-данные от графика
- вернуть periods в явной форме вместо legacy row-array структуры
- вернуть shift groups как отдельные сущности
- вернуть employee rows в нормализованном виде
- вынести day cell payload в отдельную структуру
- отдавать только те summary columns, которые реально показаны в новом UI
- стабилизировать id для shift, user-row, day-row и hour intervals

### Таблицы `cafe_smena*` как future source

Новая схема с `cafe_smena`, `cafe_smena_users`, `cafe_smena_days`, `cafe_smena_hours`, `cafe_smena_info`, `cafe_smena_auth` остается правильным направлением для upgraded API.

Для фронта важно одно:

- UI не должен зависеть от точной формы этих таблиц
- UI должен зависеть только от нормализованного view-model

## Риски

### 1. Попытка сразу привязать UI к backend

Это замедлит разработку и начнет тянуть в новый экран старые ограничения.

### 2. Попытка использовать legacy payload напрямую

Это быстро даст видимый результат, но сильно усложнит удаление fallback-слоя и подключение нового API.

### 3. Недооценка mobile

Если mobile не собирать как отдельный этап, desktop table almost guaranteed сломает узкие экраны.

### 4. Случайный перенос legacy edit-логики

Новый модуль начнет копировать старый монолит и потеряет смысл как clean frontend rewrite.

## Практический результат, к которому ведет этот план

После выполнения этого плана должен существовать:

- новый route нового модуля
- полный desktop UI по Figma
- полный mobile UI по Figma
- mocks для разработки и отладки
- изолированный legacy fallback adapter
- готовая точка входа для будущего upgraded API

Именно так можно быстро собирать и дебажить UI сейчас, а затем безболезненно переключить его на новый backend.
