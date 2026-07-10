# Sklad Implementation Plan

Статус: детальный phased plan для нового модуля `sklad`.

Основания:

- business definition: `README.md`
- canonical API: `API.md`
- raw scope: `TASK.md`
- существующие FE reference points: `sklad_items_module_new`, `recept_module_new_2`, `site_items_new`, newer modules pattern
- local schema check on `127.0.0.1:3307`

## 1. Delivery goal

Построить новый модуль `sklad`, который:

- работает через canonical `/api/sklad/*`
- покрывает все целевые master-data сущности
- не зависит runtime-архитектурно от старых module classes
- позволяет переводить FE по section-ам, а не big-bang миграцией

## 2. Delivery strategy

Рекомендуемая стратегия: domain-first, section-by-section migration.

Не делать:

- полный big-bang rewrite фронта и бэка сразу
- копирование всех legacy экранов без нормализации
- giant initial payload

Делать:

- сначала выровнять canonical domain model
- затем поднять shell + bootstrap
- затем переводить section-ы по приоритету
- параллельно оставить compatibility bridge только там, где он нужен для migration safety

Важное уточнение после schema pass:

- это orchestration-layer не над одной legacy schema, а как минимум над `jaco_main_rolls` и `jaco_site_rolls`
- поэтому не надо пытаться в первой фазе физически унифицировать storage
- физическая раздельность допустима, пока canonical API и business rules едины

## 3. Prioritized release slices

### Slice A. Foundation

Цель:

- открыть новый модуль
- показать разделы, доступы и summary
- получить общие dictionaries

В scope:

- `get_all`
- `bootstrap`
- canonical access map
- sections list
- summary counters

Выход:

- пустой, но рабочий module shell
- role-safe navigation
- готовая база для переключения на реальные section pages

### Slice B. Shared governance

Цель:

- закрыть shared dictionaries и общую классификацию

В scope:

- Units
- Categories
- unified archive behavior for shared dictionaries
- delete usage checks

Почему так рано:

- это foundation для всех остальных сущностей
- без этого будут плодиться локальные справочники и переходные хаки

### Slice C. Warehouse items

Цель:

- перевести supply-side item master в canonical module

В scope:

- list
- get_one/bootstrap
- create/edit
- simple flag save
- archive
- delete
- history read

Зависимости:

- units
- categories
- storages
- accounting systems

### Slice D. Recipes + semi-finished

Цель:

- перевести production card family в один consistent domain

В scope:

- shared editor model
- list/get/save/archive/delete/history
- convert type flow
- composition/items rows
- allergens and possible allergens

Почему вместе:

- это одна family по lifecycle и UI architecture
- их раздельный перенос создаст лишнюю дубликацию

### Slice E. Site items

Цель:

- перевести channel-facing item model

В scope:

- list/get/bootstrap
- create/edit
- tags
- image upload
- marking
- stage composition
- FE/BE-consistent calorie calculation rule
- history read, включая images follow-up gap

Почему slice вынесен отдельно:

- site items уже сейчас являются aggregate с base item, tags, images и stage relations
- это structurally более сложная family, чем warehouse items

### Slice F. Unified archive + history

Цель:

- дать единый управленческий контур просмотра и аудита

В scope:

- archive list
- unified history get_one
- cross-entity archive filters
- history presentation consistency

## 4. Recommended backend architecture

## 4.1. Service split

Минимально разумная server split:

- `SkladController`
- `SkladBootstrapService`
- `UnitsService`
- `CategoriesService`
- `WarehouseItemsService`
- `RecipesService`
- `SemiFinishedService`
- `SiteItemsService`
- `ArchiveService`
- `HistoryService`
- `AccessService`

Допустимо объединить `RecipesService` и `SemiFinishedService` в общий family-service, если код реально общий.

Также нужен explicit repository/adapter split по источникам данных:

- main-rolls side
- site-rolls side

Naming может быть любым, но этот boundary должен быть явным.

## 4.2. Core backend rules

Backend должен:

- принимать payload через проектный `data`
- возвращать project-style envelope
- авторизовать через canonical access
- не доверять FE по delete/archive restrictions
- считать derived fields по одной формуле
- адаптировать legacy storage в canonical response shape
- скрывать от FE physical split между разными БД/табличными family

## 4.3. What must stay out of controller

Не надо держать в контроллере:

- usage checks
- history shaping
- calorie formula rules
- entity conversion logic
- access composition logic

Контроллер должен быть thin transport adapter.

## 5. Recommended frontend architecture

## 5.1. Shell

Создать новый page-level shell для `sklad`:

- module title
- section navigation
- summary counters
- archive mode switch if needed
- shared error/loading/confirm handling

## 5.2. FE composition

Рекомендуемый split:

- `SkladPage`
- `useSkladAccess`
- `useSkladBootstrap`
- section modules:
  - `sklad/units/*`
  - `sklad/categories/*`
  - `sklad/warehouse-items/*`
  - `sklad/recipes/*`
  - `sklad/semi-finished/*`
  - `sklad/site-items/*`
  - `sklad/history/*`
  - `sklad/archive/*`

Подход:

- section-local state
- normalized adapters from API to FE view models
- shared destructive confirm pattern
- no direct FE dependence on old response quirks

## 5.3. Reuse policy

Что переиспользуем:

- existing project form primitives
- existing confirm/alert patterns
- удачные pieces newer modules

Что не переиспользуем как архитектуру:

- giant class pages целиком
- legacy endpoint naming as FE information architecture
- ad hoc state mixing across unrelated entities

Правильный перенос:

- копировать domain-specific field logic
- не копировать uncontrolled page complexity

## 6. Section-by-section implementation detail

### Phase 1. Documentation and contract lock

Сделать:

- зафиксировать business definition
- зафиксировать canonical API
- выделить unresolved gaps
- закрепить entity naming

Результат:

- backend and frontend work from one target model

Open questions to settle here:

- действительно ли site item categories остаются отдельными physical source-ами при unified UX/API
- где физически хранится/будет храниться image history
- какие exact legacy access aliases еще нужны на migration period

### Phase 2. Backend foundation

Сделать:

- route prefix `/api/sklad`
- `get_all`
- `bootstrap`
- canonical access response
- summary counters
- sections response

Acceptance:

- модуль открывается без загрузки heavy lists
- FE не зависит от старых route-prefix для initial open
- FE не знает, из какой физической схемы приехал каждый section

### Phase 3. Shared dictionaries

Сделать:

- `units/list|get_one|options|save_new|save_edit|delete`
- `categories/list|get_one|save_new|save_edit|archive|delete`
- server-side usage checks

Acceptance:

- единицы и категории живут как самостоятельные управляемые sections
- delete errors возвращают usage payload, пригодный для UI explanation

Implementation note:

- не форсировать premature merge между `items_cat`, recipe/pf category shape и site `category`
- сначала выстроить canonical semantics и API façade

### Phase 4. Warehouse items

Сделать:

- canonical list and form bootstrap
- save_new/save_edit
- save_flag for simple toggles
- archive/delete/history
- long-label UX policy

Acceptance:

- warehouse item можно полностью создать и отредактировать в новом модуле
- доступы и delete restrictions соблюдаются

### Phase 5. Recipes and semi-finished family

Сделать:

- shared card/view model
- category/unit/allergen composition
- items table editing
- convert type flow
- archive/delete/history

Acceptance:

- user can manage both families without leaving `sklad`
- conversion works as controlled business action

### Phase 6. Site items

Сделать:

- site item editor
- BJU + calorie preview
- stages
- tags
- images
- marking
- archive/delete/history

Acceptance:

- site-facing item lifecycle полностью управляется в новом модуле
- image/mapping gaps явно закрыты или оформлены как follow-up

Implementation note:

- site item aggregate нужно собирать из `items` + relation tables
- это надо учитывать и в service split, и в integration tests

### Phase 7. Unified archive and history

Сделать:

- archive list endpoint
- cross-entity archive UI
- unified history read UI
- consistent “open historical state” pattern

Acceptance:

- бизнес может найти архивную сущность и понять ее состояние/изменения

### Phase 8. Migration hardening

Сделать:

- compare canonical responses against old module behavior where relevant
- remove unnecessary compatibility shims
- validate access matrix
- capture smoke/e2e scenarios

Acceptance:

- old modules are no longer required for core business operations

## 7. Cross-cutting rules

Эти правила должны применяться во всех phase-ах.

### 7.1. Access

- section visibility и edit separated
- archive and delete separated
- backend checks canonical access only
- `legacy_access` only as temporary FE bridge

### 7.2. Validation

- `date_start` required where applicable
- `date_end >= date_start`
- required dictionaries must be present before save
- formulas and derived fields must be deterministic

### 7.3. Delete and archive

- archive preferred over delete for business retirement
- delete only when no active and no historical usage
- blocked delete must explain why

### 7.4. History

- history shape should be canonical even if storage is still legacy
- image history gap must be explicit, not silently ignored

### 7.5. Performance

- no giant `get_all`
- lists are loaded per section
- form bootstraps are context-specific
- history loads on demand

## 8. UI implementation direction

Ориентироваться на newer module style:

- shell + section view
- mobile-safe dialogs/sheets
- shared action hierarchy
- cleaner state ownership

Desktop:

- list/table first
- filters in header area
- edit in dialog/drawer depending on entity density

Mobile:

- list cards or dense rows where needed
- bottom-sheet or full-screen edit flows for complex forms
- avoid desktop carry-over layouts inside narrow dialogs

## 9. Testing plan

## 9.1. Unit level

Покрыть pure logic:

- entity adapters
- category flattening/mapping
- lifecycle helpers
- access helpers
- derived nutrition/calorie formulas
- delete/archive capability rules

## 9.2. Integration level

Покрыть:

- section bootstrap loads
- create/edit payload mapping
- archive/delete flows
- history rendering adapters

## 9.3. E2E level

Минимальный smoke per entity family:

- open shell
- open section list
- open create form
- save valid draft
- edit saved entity
- archive entity
- verify blocked delete on used entity
- open history

## 10. Business risks and mitigations

### Risk 1. Legacy shape leakage

Риск:

- новый FE начнет зависеть от старых response quirks

Mitigation:

- adapters and canonical section APIs

### Risk 2. Categories remain fragmented

Риск:

- unified governance не случится, а появится еще один слой дублирования

Mitigation:

- explicitly define category ownership before full FE build
- accept separate physical sources if one canonical UX/API is enough

### Risk 3. Delete semantics become unsafe

Риск:

- пользователи начнут использовать delete как archive

Mitigation:

- strict backend checks
- clear UI distinction

### Risk 4. History remains partial

Риск:

- формально history есть, но state reconstruction невозможен

Mitigation:

- define history as state snapshot contract, not just event log

### Risk 5. Site-item complexity overruns schedule

Риск:

- images, marking, stages, tags делают последний slice самым тяжелым

Mitigation:

- выделить Site items как отдельную позднюю phase, не блокируя foundation

### Risk 6. Cross-database coupling leaks into FE

Риск:

- фронт начнет знать о split между `jaco_main_rolls` и `jaco_site_rolls`

Mitigation:

- держать этот split только внутри backend/service adapters
- FE contract должен оставаться section-based and canonical

## 11. Suggested order of real execution

Практически я бы делал так:

1. Lock docs and naming.
2. Build backend shell and bootstrap.
3. Build Units and Categories first.
4. Build Warehouse items.
5. Build Recipes/Semi-finished together.
6. Build Site items.
7. Build unified Archive/History.
8. Run migration cleanup and test hardening.

Это дает раннюю бизнес-ценность и не тащит самый сложный `site-items` slice в начало.

## 12. Suggested design tool

Если хотите, чтобы я дальше сделал не только текстовый план, а и editable UI draft, лучший инструмент для подключения — Figma MCP.

Практическая польза:

- быстро собрать IA и screen map
- нарисовать desktop/mobile flows по section-ам
- согласовать таблицы, модалки, archive/history flows до реализации
- оставить editable design asset, а не одноразовую картинку
