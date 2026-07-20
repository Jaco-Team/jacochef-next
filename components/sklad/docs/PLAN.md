# Sklad Implementation Plan

Статус: детальный phased plan для нового модуля `sklad_items`.

Pinned execution rule:

- completed steps in this plan must stay in the document as execution history
- when a step is finished, mark it explicitly as completed or partially completed
- do not remove completed steps from the plan
- UI info stubs, temporary explanatory alerts and "next slice" helper blocks are acceptable during in-progress wireframing, but they must be removed by the final pass; final UI should use operational surfaces, real state summaries or actionable empty states instead
- after each completed implementation chunk, run a senior software engineer review pass on that chunk
- that post-chunk review pass is mandatory through the dedicated reviewer subagent (`sklad_senior_reviewer`) whenever that agent role is available
- that review pass must actively look for design flaws, stale or dead code, duplication, over-complication and weak structure
- if issues are found, refactor them in the same chunk before moving on, following DRY, KISS and SOLID within current module scope

Основания:

- business definition: `README.md`
- canonical API: `API.md`
- raw scope: `TASK.md`
- существующие FE reference points: `recept_module_new_2`, `site_items_new`, newer modules pattern
- local schema check on `127.0.0.1:3307`
- 1C reference screenshot: [1c-history-reference.png](/home/ted/JACO/git/jacochef-next/components/sklad/docs/assets/1c-history-reference.png)

## 1. Delivery goal

Построить новый модуль `sklad_items`, который:

- работает через canonical `/api/sklad_items/*`
- покрывает все целевые master-data сущности
- не зависит runtime-архитектурно от старых module classes
- позволяет переводить FE по section-ам, а не big-bang миграцией
- не требует включать текущий экран `sklad_items_module_new` в этот FE merge на текущем этапе
- не строит отдельный `Warehouse items` tab/screen в текущей итерации
- использует tabbed UI shell по современному project pattern
- переиспользует project form controls и modal patterns без копирования legacy page architecture

## 2. Delivery strategy

Рекомендуемая стратегия: domain-first, section-by-section migration.

Не делать:

- полный big-bang rewrite фронта и бэка сразу
- копирование всех legacy экранов без нормализации
- giant initial payload

Делать:

- сначала выровнять canonical domain model
- затем поднять shell + shared refs через `get_all`
- затем переводить tab-ы по приоритету
- параллельно оставить compatibility bridge только там, где он нужен для migration safety

Важное уточнение после schema pass:

- это orchestration-layer не над одной legacy schema, а как минимум над `jaco_main_rolls` и `jaco_site_rolls`
- поэтому не надо пытаться в первой фазе физически унифицировать storage
- физическая раздельность допустима, пока canonical API и business rules едины

FE strategy after current backend update:

- новый модуль строим как единый page shell с tabs
- каждый tab соответствует legacy business area, а не backend table
- shared/global fields и dictionaries живут в module-level adapters and scoped lib
- MUI v7 используем как базовый UI-kit
- existing shared form controls reused as-is; если нужна адаптация, она делается только в `components/sklad_items/lib/*`
- legacy modules используются только как analytical reference for flows and field meaning
- new FE runtime integration binds only to canonical `/api/sklad_items/*`, never directly to legacy module APIs

## 3. Prioritized release slices

### Slice A. Foundation

Цель:

- открыть новый модуль
- показать разделы, доступы и summary
- получить общие dictionaries

В scope:

- `get_all`
- canonical access map
- sections list
- summary counters
- shared refs, которые уже возвращаются в `get_all`

Выход:

- пустой, но рабочий module shell
- role-safe navigation
- готовая база для переключения на реальные section pages

Текущий статус:

- completed
- отдельный `/bootstrap` больше не является target requirement этой итерации
- shell и shared refs уже приходят через `get_all`

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

Текущий статус:

- completed for current FE scope
- `Units` и `Categories` tabs уже работают на canonical API
- delete-state and source-aware category handling уже выведены в UI

### Slice C. Recipes + semi-finished

Цель:

- перевести production card family в один consistent domain

В scope:

- shared tab with split list/filtering and one editor family
- live read routes
- planned save/archive/delete/history write lifecycle
- convert type flow
- composition/items rows
- allergens and possible allergens
- one shared category model for recipes and semi-finished
- global lifecycle fields `date_start` + `date_end`
- compact auto-expanding multiline field behavior for long composition/structure inputs

Почему вместе:

- это одна family по lifecycle и UI architecture
- их раздельный перенос создаст лишнюю дубликацию
- customer follow-up explicitly removes the idea of a separate recipe category entity

Contract note:

- category read model for this family is keyed via `category_key`
- `source_type = semi_finished` currently represents the shared production category space
- recipe usage is included inside that same category space by contract

Текущий статус:

- partially implemented
- `recipes/list`, `recipes/get_one`, `semi-finished/list`, `semi-finished/get_one` уже live
- общий list/filter shell уже собран в новом FE
- detail/editor/history/convert actions уже доведены до working modal flow уровня wireframe
- create/save mutations для production family остаются следующим backend-alignment pass
- authoritative delete confirmation + server-side delete call для production family уже подключены
- authoritative archive/unarchive confirmation + server-side archive call для production family уже подключены

### Slice D. Site items

Цель:

- перевести channel-facing item model

В scope:

- live read routes
- next-step form bootstrap/read support via `site-items/get_all_for_new` + `site-items/get_one`
- create/edit
- tags
- image upload
- marking
- stage composition
- FE/BE-consistent calorie calculation rule
- history read, включая images follow-up gap
- перенос итогового состава/аллергенов/possible allergens into site-item-facing UI as explicit source/derived model

Почему slice вынесен отдельно:

- site items уже сейчас являются aggregate с base item, tags, images и stage relations
- это structurally более сложная family, чем recipes/semi-finished family

Текущий статус:

- partially implemented
- `site-items/list`, `site-items/get_all_for_new`, `site-items/get_one` уже live
- list/filter shell уже собран
- detail tabs и editor dialog уже собраны и работают на canonical read flow
- create bootstrap и canonical `save_new` / `save_edit` уже подключены
- detail delete-preview semantics и image current-fields readout подровнены под актуальный `API.md` contract без расширения scope
- image upload, VK sync trigger and direct history/editor handoff уже подключены в detail flow
- tag create/rename actions уже подключены через canonical `site-items/tags/save_new` и `site-items/tags/save_edit`
- authoritative delete confirmation + server-side delete call для site items уже подключены
- authoritative archive/unarchive confirmation + server-side archive call для site items уже подключены

### Slice E. Unified archive + history

Цель:

- дать единый управленческий контур просмотра и аудита

В scope:

- archive list
- unified history get_one
- cross-entity archive filters
- history presentation consistency
- version comparison flow inspired by 1C business behavior

Текущий статус:

- partially implemented
- unified `История` tab уже читает canonical version list, `get_one` snapshot и базовый compare
- production row action now hands off into the real History tab with prefilled `entity_type` + `entity_id`
- site-items row action now hands off into the real History tab with prefilled `entity_type = site_item` + `entity_id`
- `Архив` tab уже читает canonical archive list for supported entity types
- archive restore/view flows и domain-specific history presentation consistency остаются следующим pass

## 3.1. Documentation roles

Во время реализации роли документов такие:

- `README.md` — business definition и module boundaries
- `API.md` — единственный runtime contract
- `PLAN.md` — реализационная дорожная карта
- `TASK.md` — исходные и follow-up требования
- `FE-MIGRATION-MAP.md` — legacy-to-canonical reference
- `BUSINESS-PROCESSES.md` и `SITE-ITEM-IMAGE-VERSIONING.md` — backend/business research context
- `SUGGESTIONS.md` — future-looking notes, не обязательные для первой FE-реализации

## 4. Recommended backend architecture

## 4.1. Service split

Минимально разумная server split:

- `SkladController`
- `SkladBootstrapService`
- `UnitsService`
- `CategoriesService`
- `RecipesService`
- `SemiFinishedService`
- `SiteItemsService`
- `ArchiveService`
- `HistoryService`
- `AccessService`

Допустимо объединить `RecipesService` и `SemiFinishedService` в общий family-service, если код реально общий.

Для category ownership это особенно важно:

- recipes и semi-finished не должны расходиться по разным category services/models
- у production family должен быть один category source and one canonical category contract
- category API must be built around `category_key`, not around unsafe assumptions that every category has one global numeric id

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
- history API должен гарантировать full snapshot semantics, а не только event-log semantics

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

Создать новый page-level shell для `sklad_items`:

- module title
- tab navigation
- summary counters
- archive mode switch if needed
- shared error/loading/confirm handling
- one top toolbar for global actions/filters allowed by access

Reference pattern:

- shell, loading and access composition брать ближе к `vendors` / `ads`
- dense business tab content and modal-heavy flows нормализовать из legacy modules

## 5.2. FE composition

Рекомендуемый split:

- `SkladPage`
- `useSkladAccess`
- `useSkladBootstrap`
- `useSkladTabs`
- `sklad_items/lib/*` for scoped adapters/helpers only when existing shared helpers are not enough
- section modules:
  - `sklad_items/units/*`
  - `sklad_items/categories/*`
  - `sklad_items/production/*`
  - `sklad_items/site-items/*`
  - `sklad_items/history/*`
  - `sklad_items/archive/*`

Подход:

- section-local state
- normalized adapters from API to FE view models
- shared destructive confirm pattern
- no direct FE dependence on old response quirks
- no copy-paste of giant class-page state machines

Implementation note:

- `useSkladBootstrap` naming можно сохранить как FE abstraction, но фактически он должен ходить в `get_all`, а не ждать отдельный `/bootstrap`

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
- не копировать old visual composition 1:1
- переносить successful UX semantics, but render them in current project modal/tab language

## 6. Section-by-section implementation detail

### Phase 1. Documentation and contract lock

Сделать:

- зафиксировать business definition
- зафиксировать canonical API
- выделить unresolved gaps
- закрепить entity naming

Результат:

- backend and frontend work from one target model
- no parallel research notes left in active docs folder

Open questions to settle here:

- действительно ли site item categories остаются отдельными physical source-ами при unified UX/API
- где физически хранится/будет храниться image history
- какие exact legacy access aliases еще нужны на migration period

Close-out for this phase:

- выжимка backend-research внесена в `README.md` и `PLAN.md`
- роли документов и приоритет source-of-truth явно зафиксированы

### Phase 2. Backend foundation

Сделать:

- route prefix `/api/sklad_items`
- `get_all`
- canonical access response
- summary counters
- sections response
- shared refs inside `get_all`

Acceptance:

- модуль открывается без загрузки heavy lists
- FE не зависит от старых route-prefix для initial open
- FE не знает, из какой физической схемы приехал каждый section

FE implementation output:

- базовая страница `sklad_items`
- tab shell
- access-aware tab visibility
- shared loading, alert, confirm and empty states

### Phase 3. Shared dictionaries

Сделать:

- `units/list|get_one|options|save_new|save_edit|delete`
- `categories/list|get_one|save_new|save_edit|archive|delete`
- server-side usage checks

Acceptance:

- единицы и категории живут как самостоятельные управляемые sections
- delete errors возвращают usage payload, пригодный для UI explanation

UI target:

- две компактные dictionary tabs
- list + edit/create side-by-side on desktop where it helps density
- modal/drawer fallback on mobile in project-consistent style

Implementation note:

- не форсировать premature merge между `items_cat`, recipe/pf category shape и site `category`
- сначала выстроить canonical semantics и API façade
- categories API already moved toward explicit source-aware read model:
  - `category_key`
  - `source_type`
  - `source_model`
  - `delete_state`
- FE should treat this as a typed category reference, not as one flat legacy integer id space

### Phase 4. Production family tab

Сделать:

- один tab `Рецепты и полуфабрикаты`
- shared card/view model
- category/unit/allergen composition
- items table editing
- convert type flow
- archive/delete/history
- one shared category source for both entity types
- global form fields, одинаковые для recipe и semi-finished:
  - `name`
  - `unit`
  - `date_start`
  - `date_end`
  - flags/statuses supported by API
- compact multiline inputs for long text fields with auto-expand on focus

Acceptance:

- user can manage both families without leaving `sklad_items`
- conversion works as controlled business action
- recipe does not have its own separate category model apart from semi-finished

UI target:

- внутри tab сначала family filters / category / search
- затем grouped list of entities
- editor opens in project-consistent modal
- editor uses shared field sections, not separate legacy page clones

Contract note:

- category selection and filtering for this family should operate through the shared semi-finished category space defined in `categories/*`

Implementation note:

- old screen with `Добавить рецепт или полуфабрикат` is only business-context reference
- target for new module is not “two visual sections with separate category semantics”
- target is one production-family category taxonomy reused by both entity types

### Phase 5. Site items

Сделать:

- dedicated `Товары сайта` tab
- site item editor
- BJU + calorie preview
- stages
- tags
- images
- marking
- archive/delete/history
- явное разделение source/derived fields:
  - BJU source
  - calorie derived preview
  - composition/allergens source and derived blocks according to API

Acceptance:

- site-facing item lifecycle полностью управляется в новом модуле
- image/mapping gaps явно закрыты или оформлены как follow-up

UI target:

- table/list in tab
- create/edit modal in current project style
- no legacy accordion sprawl copied 1:1
- long “Состав” field behaves as compact textarea that expands on focus

Implementation note:

- site item aggregate нужно собирать из `items` + relation tables
- это надо учитывать и в service split, и в integration tests

### Phase 6. Unified archive and history

Сделать:

- archive list endpoint
- cross-entity archive UI
- unified history read UI
- consistent “open historical state” pattern
- history modal/details flow in project style:
  - модалка со списком версий
  - detail area выбранной версии
  - полная раскладка для составных сущностей
  - визуальная подсветка отличий относительно предыдущей версии

Acceptance:

- бизнес может найти архивную сущность и понять ее состояние/изменения
- бизнес видит не только факт изменения, но и полный состав/раскладку выбранной версии

UI target:

- one history tab with entity-type filter
- list row opens details modal
- for compound entities detail modal shows full composition table and changed cells

Implementation note:

- history UX надо строить не как “лента только измененных полей”, а как version browser в рамках project-consistent modal pattern
- минимальный target pattern берется с 1C reference screenshot
- для recipe / semi-finished / site item нижняя зона должна показывать составные строки целиком, а не только field diff summary

### Phase 6.1. History screen definition by 1C pattern

Целевой interaction pattern:

- в history modal есть верхняя зона списка версий:
  - дата создания версии
  - дата начала действия
  - дата конца действия
  - тип операции, если есть
  - идентификатор документа/версии, если есть
- detail zone выбранной версии показывает:
  - полный список строк раскладки
  - все доступные расчетные поля
  - changed rows and changed cells highlighted against previous version

Что это означает для нового canonical contract:

- history list должен возвращать ordered versions
- каждая версия должна быть открываема как full snapshot
- full snapshot должен включать row collections, если сущность составная
- API должен позволять сравнить snapshot с предыдущей версией детерминированно

### Phase 6.2. API sufficiency check for 1C-style history

Текущее состояние по данным FE и local schema:

- `recipe`
  - по данным в целом достаточно
  - legacy FE already compares full snapshots including `pf_list`
  - для нового API надо явно гарантировать полную раскладку выбранной версии

- `semi_finished`
  - по данным в целом достаточно по той же модели, что recipe
  - нужны те же contract guarantees

- `site_item`
  - частично достаточно
  - tech history path уже умеет сравнивать full snapshots со `stage_1/2/3` и `items`
  - но сейчас history split-ится на `get_one_hist_tech` и `get_one_hist_mark`
  - для truly unified 1C-style history этого недостаточно как canonical contract

Главные contract gaps:

- image history отдельно помечена как capability gap, значит full revision completeness for every site-item asset is not yet guaranteed

Вывод:

- updated `API.md` уже описывает нужный direction для version list + canonical revision snapshot
- для `recipe` и `semi_finished` данные legacy API выглядят достаточными, если их канонизировать без потери snapshot depth
- для `site_item` contract now is close to sufficient, but image-state completeness still remains an explicit gap
- следовательно эта фаза теперь в первую очередь UI/adapter task plus explicit handling of remaining image-history gap

### Phase 7. Access and destructive-flow hardening

Сделать:

- final access map adapter for FE
- gate tabs, actions and destructive flows separately
- wire delete/archive/save confirms only through project styled confirm flow

Acceptance:

- user never sees unsupported action as enabled
- access differences between tabs and actions remain explicit
- destructive flows are consistent across all entity families

### Phase 8. Migration hardening

Сделать:

- compare canonical responses against old module behavior where relevant
- remove unnecessary compatibility shims
- validate access matrix
- capture smoke/e2e scenarios

Acceptance:

- old modules are no longer required for core business operations

Deliverables:

- smoke checklist per tab
- field mapping checklist from `FE-MIGRATION-MAP.md`
- explicit leftover list of non-migrated legacy capabilities

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

## 8. Step-by-step FE implementation order

1. Create page shell, bootstrap hook, access hook and tab model. Status: completed.
2. Build `Units` tab on canonical API and finalize dictionary CRUD pattern. Status: completed.
3. Build `Categories` tab on canonical API and finalize source-aware category handling. Status: completed.
4. Build `Рецепты и полуфабрикаты` tab list/filter shell. Status: completed.
5. Build shared production editor modal with scoped form helpers and multiline auto-expand fields. Status: completed for canonical basic field editing and create/save flow; composition/category editing remains read-only in current FE scope.
6. Wire production history, convert-type flow, archive and destructive delete path. Status: completed for history, convert shell, archive/unarchive, delete and canonical list flag toggles; create/save remains pending.
7. Build `Товары сайта` tab list/filter shell. Status: completed.
8. Build site-item editor modal, derived calorie preview, tags, images, marking, archive and destructive delete flow. Status: completed for working editor/view tabs, archive/unarchive, delete, canonical list flag toggles, canonical save flow, image upload and VK sync trigger; inline tag dictionary mutations are connected, broader tag UX polish remains.
9. Build unified `История` tab and 1C-inspired detail modal with comparison highlighting. Status: in progress.
10. Build `Архив` tab and archive restore/view flows if contract supports them. Status: completed for archive list, view, history handoff and restore-to-active flow; further UX polish and smoke coverage remain pending.
11. Run access hardening, migration checklist pass and targeted smoke coverage. Status: pending.

## 8.1. Delivery flow for implementation

- work incremental slices, each slice ends in runnable code on canonical `/api/sklad_items/*`
- first slice is shell/bootstrap/access/tab foundation
- each next slice should land as one business-capable scope, not as scattered partial files
- follow latest module architecture style:
- zustand global shell store for shared module state only
- separate per-tab scoped stores/controllers for tab-local state and flows
- no API calls inside stores
- prefer mass state setters over many tiny setters where it keeps store surface smaller
- one global `isLoading` flag and one global backdrop at page-shell level
- chat reporting format for this workstream:
- short commit-message style scope summary
- explicit next step draft
- no visual parity pass as a planning item

### Current pinned sequence

1. Shell foundation: page route, bootstrap load, access adapter, tab registry, section placeholders. Status: completed.
2. Units slice: working list + modal CRUD + delete-state rendering on canonical `units/*`, with its own tab-scoped state/controller on top of the global shell store. Status: completed.
3. Categories slice: source-aware list/tree + modal CRUD on canonical `categories/*`. Status: completed.
4. Production list slice: shared list/filter shell for recipes and semi-finished. Status: completed.
5. Production editor slice: shared modal, composition rows, multiline auto-expand fields. Status: completed for basic canonical save flow; composition/category editing remains read-only.
6. Site items slice: list/filter shell, editor modal, derived fields, tags/images/marking/delete. Status: completed for current FE scope; canonical create/edit, tag mutation, image upload, VK sync, history handoff, archive/delete flows and strict current API binding are in place, while deeper composition editing remains backend follow-up.
7. History/archive slice: unified readers live, operational summaries replacing info stubs, archive view/history/restore row actions connected, production/detail modals aligned to module modal pattern. Status: completed.
8. Hardening slice: access matrix, smoke tests, migration leftovers. Status: pending.

## 9. Explicit non-goals for current iteration

- no dedicated warehouse-items CRUD tab inside `sklad_items`
- no runtime support for legacy route names or payload aliases
- no broad refactor of shared project controls
- no storage-layer unification between `jaco_main_rolls` and `jaco_site_rolls`
- no visual copy of legacy pages where current project patterns already solve the shell better
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

### 8.1. Long text field behavior

Отдельное UX-уточнение по create/edit forms:

- проблема длинных полей теперь трактуется не только как проблема label
- для поля `Состав` и аналогичных long-text business fields нужен compact-by-default control
- при этом оператор должен иметь возможность быстро увидеть и отредактировать полный текст без отдельного экрана

Рекомендуемое решение:

- использовать textarea / autosize text field
- в обычном состоянии держать небольшую высоту
- на focus автоматически расширять поле
- ограничивать рост через разумный `maxRows`, чтобы модалка не ломалась

Почему это лучше project-wise:

- сохраняет плотность формы
- не требует отдельного custom expander control
- остается в рамках привычного modal edit flow проекта

Reference:

- [long-structure-field-reference.png](/home/ted/JACO/git/jacochef-next/components/sklad/docs/assets/long-structure-field-reference.png)

Clarification:

- reference screenshot is a legacy anti-example from the old module, not a target layout to reproduce
- for the new UI, the requirement is the follow-up behavior itself:
  - compact field by default
  - automatic expansion on focus
  - modal-safe autosize behavior consistent with the current project UI

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

- section shared-read loads
- create/edit payload mapping
- archive/delete flows
- history rendering adapters
- long-text field state handling where UI depends on compact vs expanded behavior

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

Дополнение для production family:

- не допускать отдельную recipe-category ветку рядом с semi-finished categories
- recipes and semi-finished must share one production category model
- category read contracts should stay source-aware so FE does not collapse unlike category spaces into one broken id namespace

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
2. Build backend shell and finalize `get_all` shell/shared-refs contract.
3. Build Units and Categories first.
4. Finish Recipes/Semi-finished write lifecycle on top of live read routes.
5. Finish Site items write lifecycle on top of live read routes.
6. Build unified Archive/History.
7. Run migration cleanup and test hardening.

Это дает раннюю бизнес-ценность и не тащит самый сложный `site-items` slice в начало.

## 12. Suggested design tool

Если хотите, чтобы я дальше сделал не только текстовый план, а и editable UI draft, лучший инструмент для подключения — Figma MCP.

Практическая польза:

- быстро собрать IA и screen map
- нарисовать desktop/mobile flows по section-ам
- согласовать таблицы, модалки, archive/history flows до реализации
- оставить editable design asset, а не одноразовую картинку
