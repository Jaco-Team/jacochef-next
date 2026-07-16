# Sklad

Статус: business definition нового объединенного модуля `sklad_items`.

Связанные документы:

- canonical API contract: `API.md`
- исходный сырой scope: `TASK.md`
- план реализации: `PLAN.md`
- migration map старых модулей: `FE-MIGRATION-MAP.md`

Рабочий набор документов для реализации должен оставаться минимальным:

- `README.md` — business definition и boundaries
- `API.md` — единственный source of truth для runtime contract
- `PLAN.md` — реализационная дорожная карта
- `TASK.md` — исходные follow-up требования из чата
- `FE-MIGRATION-MAP.md` — справка для чтения legacy-кода и переноса flow

Дополнительные research/reference docs допустимы, но не должны спорить с этими файлами:

- `API.md` остается единственным runtime contract source of truth
- `PLAN.md` остается единственным implementation roadmap
- research docs используются как поясняющий backend/business context

## Schema-grounded notes

Документ дополнительно сверялся с локальной БД на `127.0.0.1:3307`.

Что важно:

- warehouse/recipe/semi-finished master-data сейчас живет в `jaco_main_rolls`
- site item catalog живет отдельно в `jaco_site_rolls`
- `sklad_items_module_new` как текущий FE-модуль пока остается самостоятельным и не входит в текущий merge scope
- новый модуль `sklad_items` поэтому по факту объединяет как минимум два существующих data domain-а

Это значит:

- unified FE shell реален
- unified backend contract тоже реален
- но storage layer у модуля изначально будет не единым физически, а federated над двумя схемами

Уточнение по текущему состоянию API:

- read contour уже частично опубликован
- `get_all` в текущей итерации совмещает shell payload и shared references
- write/archive/delete/convert контур остается следующей фазой

## 1. Зачем нужен модуль

`Sklad` нужен не как еще один экран редактирования справочников, а как единая мастер-система производственного каталога.

Сейчас бизнес-сущности разнесены по разным legacy-модулям:

- рецепты
- полуфабрикаты
- товары сайта
- единицы измерения
- связанные upstream-справочники и source entities

Из-за этого один и тот же жизненный цикл позиции размазан по разным экранам, правам, history-подходам и правилам активности.

Целевой смысл нового модуля:

- держать производственные сущности в одной предметной зоне
- унифицировать жизненный цикл позиции
- унифицировать доступы и управляемость
- дать прозрачную историю изменений
- убрать зависимость нового FE от старых module classes и старых route-prefix

Текущее состояние внедрения:

- Units и Categories уже доступны на read layer
- Recipes, Semi-finished и Site items уже имеют live read routes
- это еще не означает завершенный lifecycle управления, потому что write/archive/delete flows остаются planned

## 2.1. FE product shape

Новый `sklad_items` должен быть не “одной огромной формой”, а unified shell с tab navigation.

Базовый UX-принцип:

- верхний shell один на весь модуль
- внутри tab per legacy business area
- внутри tab используется новый canonical API, а не legacy route-space
- глобальные поля и shared dictionaries должны выглядеть одинаково во всех editor flows

Целевые tab-ы первой версии:

- `Единицы`
- `Категории`
- `Рецепты и полуфабрикаты`
- `Товары сайта`
- `История`
- `Архив`

Важное ограничение:

- tab-а отдельного CRUD для warehouse items сейчас нет
- `Item` используется только как upstream source/reference inside editors and history

UI pattern for tabs:

- по структуре брать современные module-shell patterns из `vendors`, `ads`, `site_clients`
- по содержанию полей и бизнес-flow смотреть legacy `recept_module_new_2` и `site_items_new`
- старые layout-ы использовать только как reference данных и сценариев, а не как visual target
- старые модули можно изучать для понимания flow, field semantics и migration mapping, но новый FE не должен ходить в их API, route-space или runtime helpers
- все runtime bindings нового FE должны идти только в canonical `/api/sklad_items/*`

## 2. Core business need

Имплицитная бизнес-потребность за scope-ом такая:

1. Компания ведет единый каталог производственных сущностей, которые используются в разных контурах:

- закупка и склад
- техкарты и заготовки
- операционное производство
- сайт и клиентские каналы
- учет и маркировка

2. Для каждой сущности нужен управляемый lifecycle:

- создание
- изменение
- активация с даты
- деактивация по дату
- архивирование
- удаление только при доказанном отсутствии использования
- просмотр полной истории состояния

3. Каталог должен быть безопасным для эксплуатации:

- нельзя удалять то, что использовалось сейчас или исторически
- нельзя терять состав, аллергены, связи с хранением, картинками и учетными системами
- нельзя смешивать view/edit/delete права неявно

4. Бизнесу нужен не просто CRUD, а governance layer:

- кто может видеть раздел
- кто может менять сущность
- кто может архивировать
- кто может выполнять destructive actions
- какие derived-данные считаются автоматически

## 3. What Sklad owns

`sklad_items` должен владеть не всеми складскими процессами, а именно master-data слоем.

Владение модуля:

- единицы измерения
- категории
- рецепты
- полуфабрикаты
- товары сайта
- история изменений этих сущностей
- архивный слой
- access map для нового FE

Использует как upstream source/reference:

- `Item` / товары склада
- storage-related dictionaries
- shared production dictionaries

Не входит в прямую ответственность модуля:

- закупочные документы
- фактические остатки и движения склада
- ревизионные документы
- производственные операции как отдельный operational workflow

То есть `Sklad` это не WMS и не закупка. Это каталог и правила жизненного цикла сущностей, на которые потом опираются другие процессы.

Практически это каталог поверх двух исходных источников:

- `jaco_main_rolls` для recipes / semi-finished / units / storages / shared production dictionaries / upstream `Item`
- `jaco_site_rolls` для site items / site categories / tags / images / stage composition / public product attributes

## 4. Target business model

### 4.1. Единая модель сущности

Несмотря на разные формы, все сущности в модуле живут по одному шаблону:

- identity
- classification
- measure/unit
- business attributes
- availability period
- visibility/activity flags
- relations
- history
- delete restrictions

Это главный architectural invariant модуля.

### 4.2. Classification model

Категория в новом модуле должна быть unified-сущностью уровня каталога, а не локальным справочником конкретного старого экрана.

Бизнес-смысл категории:

- группировать сущности по понятной операционной логике
- быть reusable across recipes / semi-finished
- показывать usage density по связанным сущностям
- быть архивируемой, но не удаляемой при наличии usage

Для сайта допустимо отдельное представление category mapping, если бизнес-модель реально отличается, но primary category governance должен жить в `sklad_items`.

Schema implication:

- warehouse categories и site categories сейчас физически разные
- в local DB это не одна таблица с разными типами, а разные category models

Следовательно в первой production-ready версии правильнее проектировать:

- unified UX vocabulary
- но separate backend category sources

И только потом принимать решение, нужна ли реальная physical convergence.

### 4.3. Lifecycle model

Каждая релевантная сущность должна поддерживать:

- `date_start`
- `date_end`
- `is_active`
- `is_archived`

Правило:

- активность и архив не одно и то же
- архив это управленческое скрытие из основного рабочего контура
- `date_end` это бизнес-граница действия сущности

### 4.4. Delete model

Удаление должно быть exception-flow, а не обычным способом “убрать позицию”.

Бизнес-правило:

- если сущность участвует сейчас или участвовала исторически, удаление запрещено
- если нужно убрать сущность из работы, используют `date_end` и/или archive

Следствие для UI:

- archive это массово используемый lifecycle action
- delete это редкий controlled action с понятной причиной блокировки

### 4.5. History model

History должен отвечать на бизнес-вопрос:
"Как выглядела сущность в конкретный момент времени и что именно изменили?"

Недостаточно хранить только факт редактирования.

История должна позволять:

- открыть целиком состояние записи
- увидеть редактора и время
- увидеть старые связи, а не только текстовые поля
- по site-items отдельно не терять историю картинок

## 5. Business slices by entity

### 5.1. Units

Единицы измерения это shared dictionary, а не subsidiary screen.

Бизнес-роль:

- единый стандарт измерения для каталога
- базовый reference для warehouse items, recipes, semi-finished, site items
- server-side usage checks before delete

### 5.2. Categories

Категории это governance-слой над каталогом.

Бизнес-роль:

- упорядочить каталог
- уменьшить хаос в naming
- дать бизнесу контролируемую классификацию
- показать usage by entity types

### 5.3. Recipes and semi-finished

Рецепт и полуфабрикат это два production-type одной предметной зоны с почти одинаковым lifecycle.

Их стоит мыслить как sibling entity family:

- общая карточка
- общая category model
- общая unit model
- общая history model
- общий editor shell

Отдельное business rule:

- допустима controlled conversion `recipe <-> semi_finished`

Schema confirmation:

- recipes и semi-finished уже разделены физически (`recipes_new` и `polufabricat_new`)
- но их field families очень близки
- поэтому объединение на уровне canonical contract оправдано

### 5.4. Site items

Товар сайта это channel-facing catalog item.

Бизнес-роль:

- публикационная карточка
- маркетинговые и клиентские атрибуты
- БЖУ и derived calorie preview
- stage composition
- image and tagging management

Ключевое правило:

- `kkal_preview` это derived operational helper
- persisted field и preview должны считать одну и ту же бизнес-формулу

Schema confirmation:

- site items сейчас живут в `jaco_site_rolls.items`
- `kkal` уже persisted field
- stage composition хранится отдельно через `items_rec_stages` и `items_pf_stages`
- изображения и теги тоже имеют отдельные relation tables

Следствие:

- site item editor нельзя мыслить как простой flat form
- это aggregate root с несколькими relation blocks

## 6. UX definition

## 6.1. Product shape

Новый модуль должен быть shell-first:

- модуль открывается быстро
- показывает доступные разделы и summary
- heavy datasets грузятся on demand

Это соответствует и новому API contract, и более новым страницам проекта.

## 6.2. Navigation model

Оптимальная верхнеуровневая структура:

- Units
- Categories
- Recipes
- Semi-finished
- Site items
- History
- Archive

Если нужна более компактная первая версия, можно объединить:

- `Recipes` + `Semi-finished`
- `History` как drawer/modal flow
- `Archive` как cross-entity tab

## 6.3. Screen philosophy

На базе старых модулей и новых страниц проекта целевой UX должен быть:

- table/list first for desktop
- focused editor dialog/sheet for create/edit
- mobile-safe patterns instead of desktop carry-over
- consistent confirm flows for delete/archive/destructive save cases

Не надо переносить legacy layout 1:1.

Надо переносить:

- бизнес-поля
- business constraints
- operator mental model

Не надо переносить:

- случайные старые endpoint boundaries
- giant bootstrap payloads
- локальные naming inconsistencies

## 7. Access definition

Новый модуль должен жить на canonical access map.

Практический business contract:

- section-level visibility
- section-level edit
- archive visibility/edit
- delete visibility/execute
- optional temporary legacy aliases только как migration bridge

Право `delete_execute` должно быть отдельным и редким.

`legacy_access` допустим только как временный compatibility слой. Он не должен определять ни backend authorization, ни структуру нового UI.

## 8. Operational rules that matter to implementation

При проектировании и реализации нельзя потерять такие правила:

- формы не должны зависеть от старых payload shape на уровне FE state
- селекты и справочники должны грузиться из context-specific read endpoints или из явно задокументированного shared payload `get_all`, а не из giant ad hoc response
- все destructive operations проходят через explicit confirm flow
- archive и delete это разные сценарии
- usage checks обязательны на backend
- derived values должны считаться в одном месте по одной формуле
- history read должен быть unified, даже если storage пока legacy

Дополнение из live schema:

- history по разным family уже хранится в разных исторических таблицах
- значит unified history response должен быть built-on-read façade, а не ожидание единой history table с первого дня

## 9. Recommended frontend direction

С точки зрения текущего codebase, для нового FE разумнее опираться на паттерн newer modules, а не на class-heavy legacy pages.

Предпочтительный FE direction:

- module shell page
- section-focused hooks/store
- normalized entity adapters
- shared edit dialogs/sheets per entity family
- reuse existing project UI primitives and confirm patterns

Это даст:

- проще тестировать
- проще мигрировать по section-ам
- меньше runtime coupling к legacy response quirks

## 10. Definition of done for business layer

Бизнес-задача модуля считается решенной, когда:

- все целевые сущности живут в едином `sklad_items` domain
- FE работает от canonical contract
- lifecycle управляется единообразно
- archive/delete/history работают предсказуемо
- access model выражена явно
- бизнес не зависит от старых экранов, чтобы управлять каталогом

## 11. UI drafting note

Если хотите, чтобы я не только писал требования, но и собирал реальный UI draft, лучший следующий коннектор для этого стека — Figma MCP.

Почему именно он:

- я смогу собрать screen flow и component structure прямо в Figma
- можно быстро согласовать IA, модалки, таблицы и mobile sheets до кодинга
- это лучше, чем генерировать одноразовые картинки без editable structure

Для быстрого UI exploration как запасной вариант подойдет image generation, но для рабочего согласования именно editable draft лучше Figma.
