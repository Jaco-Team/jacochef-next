# FE MIGRATION MAP

Статус: переходный документ для FE-разработки нового модуля `sklad_items`.

Назначение:

- `API.md` описывает целевой canonical contract нового модуля
- этот файл описывает эволюцию от legacy modules/contracts к новому `sklad_items`
- FE должен строиться по `API.md`, а этот файл использовать как карту перехода и расшифровку старых payload-ов

Главное правило:

- legacy route/payload shape не является целевой моделью нового модуля
- legacy route/payload shape сохраняется здесь только как reference при переходе со старых модулей на canonical API `sklad_items`
- новый `sklad_items` не поддерживает runtime compatibility aliases; этот файл нужен только как карта соответствий

---

## 1. Документная модель

Использовать документы так:

- `API.md` — единственный источник правды для новых запросов/ответов FE
- `FE-MIGRATION-MAP.md` — только карта соответствий старого FE/legacy route names к новому модулю
- если старое имя есть только в `FE-MIGRATION-MAP.md`, это не означает, что его можно отправлять в новый backend runtime-ом
- для history всегда использовать canonical entity names: `item`, `recipe`, `semi_finished`, `site_item`
- для warehouse items в новом history API использовать `item`, не `warehouse_item`
- [API.md](/home/ted/JACO/git/test-app-site/app/Chef/Sklad/docs/API.md) — целевой контракт для новой FE
- [PLAN.md](/home/ted/JACO/git/test-app-site/app/Chef/Sklad/docs/PLAN.md) — roadmap и migration coverage
- этот файл — map `legacy -> new`

---

## 2. Route migration map

### 2.1. `ed_izmer`

- `ed_izmer/get_all` -> `sklad_items/units/list`
- `ed_izmer/get_one` -> `sklad_items/units/get_one`
- `ed_izmer/save_new` -> `sklad_items/units/save_new`
- `ed_izmer/save_edit` -> `sklad_items/units/save_edit`
- `ed_izmer/delete_item` -> `sklad_items/units/delete`

### 2.2. `sklad_items_module_new`

Важное ограничение текущего scope:

- `sklad_items_module_new` пока не объединяется в новый CRUD-контур `sklad_items`
- warehouse `Item` остается shared source entity для нового модуля
- новый модуль уже использует его как reference/business source и публикует read/open routes `/api/sklad_items/items/*` для интеграции внутри `sklad_items`

Следствие для FE:

- отдельный full CRUD warehouse items пока остается в `sklad_items_module_new`, но read/open contracts уже публикуются и поддерживаются в `sklad_items/items/*`, а history read еще и в `sklad_items/history/item*`
- но связанные reference/business данные уже должны восприниматься как часть единого домена `sklad_items`

### 2.3. `recept_module_new_2`

- `recept_module_new_2/get_all` -> `sklad_items/recipes/list` и `sklad_items/semi-finished/list`
- `recept_module_new_2/get_one_rec` -> `sklad_items/recipes/get_one`
- `recept_module_new_2/get_one_pf` -> `sklad_items/semi-finished/get_one`
- `recept_module_new_2/get_one_hist_rec` -> `sklad_items/history/recipe` (или canonical `sklad_items/history/list` + `entity_type=recipe`)
- `recept_module_new_2/get_one_hist_pf` -> `sklad_items/history/semi-finished` (или canonical `sklad_items/history/list` + `entity_type=semi_finished`)
- `recept_module_new_2/save_check_rec` -> `sklad_items/recipes/save_flag`
- `recept_module_new_2/save_check_pf` -> `sklad_items/semi-finished/save_flag`
- `recept_module_new_2/save_new_rec` -> `sklad_items/recipes/save_new`
- `recept_module_new_2/save_edit_rec` -> `sklad_items/recipes/save_edit`
- `recept_module_new_2/save_new_pf` -> `sklad_items/semi-finished/save_new`
- `recept_module_new_2/save_edit_pf` -> `sklad_items/semi-finished/save_edit`
- `recept_module_new_2/change_rec_and_pf` -> `sklad_items/entities/convert_type`
- `recept_module_new_2/delete_item` -> `sklad_items/entities/delete`
- `recept_module_new_2/save_cats` -> `sklad_items/categories/save_new`
- `recept_module_new_2/save_edit_cats` -> `sklad_items/categories/save_edit`
- `recept_module_new_2/delete_cats` -> `sklad_items/categories/delete`

### 2.4. `site_items_new`

- `site_items_new/get_all` -> `sklad_items/site-items/list`
- `site_items_new/get_one_tech` -> `sklad_items/site-items/get_one`
- `site_items_new/get_all_for_new_tech` -> `sklad_items/site-items/get_all_for_new`
- `site_items_new/get_one_hist_tech` -> `sklad_items/history/site-item` + `sklad_items/history/site-item/get_one`
- `site_items_new/get_one_mark` -> `sklad_items/site-items/get_marking`
- `site_items_new/get_one_hist_mark` -> `sklad_items/history/site-item` + `sklad_items/history/site-item/get_one`
- `site_items_new/get_one_hist_img` -> `sklad_items/history/site-item` + `sklad_items/history/site-item/get_one`
- `site_items_new/save_new` -> `sklad_items/site-items/save_new`
- `site_items_new/save_edit` -> `sklad_items/site-items/save_edit`
- `site_items_new/save_check` -> `sklad_items/site-items/save_flag`
- `site_items_new/edit_tag` -> `sklad_items/site-items/tags/save_edit`
- `site_items_new/saveNewTag` -> `sklad_items/site-items/tags/save_new`
- `site_items_new/upload_img` -> `sklad_items/site-items/upload_image`
- `site_items_new/updateVK` -> `sklad_items/site-items/sync_vk`

Правило для новой FE по history `site_item`:

- список версий строить через `sklad_items/history/site-item`
- detail revision брать через `sklad_items/history/site-item/get_one`
- compare строить через `sklad_items/history/site-item/compare`
- отдельных history aliases больше нет; список, detail и compare для `site_item` строятся только через canonical history routes

---

## 3. Payload evolution policy

Политика для FE:

- новый FE должен ориентироваться на canonical payload из `API.md`
- legacy-shaped request examples здесь нужны только как reference при чтении старого кода; backend нового `sklad_items` их больше не принимает
- новые UI-flow не должны проектироваться вокруг legacy field names, если canonical field уже определен

Практическое правило:

- canonical shape документируется в `API.md`
- legacy route/field names документируются только в этом файле как reference map

---

## 4. Legacy-to-canonical field map

Эти соответствия нужны только как справка при чтении старого FE и legacy модулей.

- `itemId` в старом `change_rec_and_pf` соответствует canonical `id` в `sklad_items/entities/convert_type`
- `type = rec|pf` в старом `change_rec_and_pf` соответствует canonical `from_type = recipe|semi_finished`
- `data.rec` в старых `save_new/save_edit` recipes и semi-finished соответствует прямому canonical entity payload в `data`
- `cat_id` в старом categories save соответствует canonical `parent_id`
- `chooseTag.id` в старом site-item tag edit соответствует canonical `tag_id`
- `item_id` в старом/переходном `site-items/upload_image` соответствует canonical `id`
- `site_item_id` и `item_id` из старых read/history-open вызовов больше не принимаются; в canonical `sklad_items` используется только `id`
- `history_id`, `left_history_id`, `right_history_id` в старых/переходных history-open и compare вызовах больше не принимаются; в canonical `sklad_items` используются только `revision_key`, `left_revision_key`, `right_revision_key`

## 5. Vision to pin

Целевое правило проекта для нового `sklad_items`:

- backend владеет новым route-space и новым canonical contract
- FE строится по `API.md`
- legacy contracts сохраняются только как migration knowledge
- migration knowledge хранится отдельно и удаляется/сжимается позже, когда переход завершен
