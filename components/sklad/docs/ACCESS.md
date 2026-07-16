# ACCESS

Статус: карта access-контура нового модуля `Sklad` и команда синхронизации в `sklad_items`.

## 1. Главное правило

Для нового backend-модуля `Sklad` access-шаблоны подготавливаются в отдельном модуле реестра `sklad_items`.

Это означает:

- API routes нового модуля остаются под `/api/sklad_items/*`
- команда синхронизации работает с target `jaco_main_rolls.sklad_modules.key_query = 'sklad_items'`
- этот документ описывает access provisioning и карту флагов, а не runtime middleware binding

Важно:

- source-модули не переписываются
- команда синхронизации пишет только target-модуль `sklad_items` и его template rows
- legacy-модули `ed_izmer`, `recept_module_new_2`, `sklad_items_module_new`, `site_items_new` остаются источником данных для merge

## 2. Source modules

Access merge собирается из:

- `ed_izmer`
- `recept_module_new_2`
- `sklad_items_module_new`
- `site_items_new`

## 3. Что FE должно читать

Есть два слоя прав.

### 3.1. Canonical access map

Это верхнеуровневые флаги, которые backend возвращает в `get_all.access`.

- `units_view` — можно открывать и использовать раздел единиц измерения
- `categories_view` — можно открывать и использовать раздел категорий склада
- `recipes_view` — можно открывать раздел рецептов
- `semi_finished_view` — можно открывать раздел полуфабрикатов
- `site_items_view` — можно открывать раздел товаров сайта
- `history_view` — можно открывать history routes нового модуля
- `archive_view` — можно открывать архивный контур нового модуля
- `delete_execute` — можно выполнять destructive delete actions в новом модуле

Правило для FE:

- для показа/скрытия крупных разделов и действий ориентироваться сначала на canonical map из `get_all.access`
- не пытаться самостоятельно пересобирать canonical права из legacy флагов

### 3.2. Merged legacy runtime flags

Это merged field-level и action-level флаги, которые приходят в `request->upd_access` и используются текущим backend write-side.

Они сохраняются в `sklad_items` как target access contour для нового модуля и текущих backend write-gates.

#### Warehouse items / shared refs

- `form` — доступ к форме warehouse item legacy-модуля
- `name`
- `cats`
- `ed_izmer`
- `max_count_in_m`
- `name_for_vendor`
- `pq`
- `percent`
- `vend_percent`
- `art`
- `min_count`
- `pf_list`
- `allergens`
- `my_allergens_other`
- `this_storages`
- `apps`
- `time_min_other`
- `mark_name`
- `is_show`
- `show_in_order`
- `show_in_rev`
- `honest_sign`
- `delete_item`
- `create_new`

#### Recipes / semi-finished

- `name`
- `shelf_life`
- `two_user`
- `show_in_rev`
- `date_start`
- `date_end`
- `time`
- `dop_time`
- `rec_apps`
- `storages`
- `create_rec`
- `create_pol`
- `rev_table`
- `change_rec_pf`
- `delete`
- `items`
- `allergens`
- `allergens_diff`
- `structure`
- `cats`

#### Site items

- `date_start`
- `tmp_desc`
- `marc_desc`
- `marc_desc_full`
- `show_program`
- `is_new`
- `show_site`
- `is_hit`
- `dropzone`
- `name`
- `art`
- `category_id`
- `count_part`
- `stol`
- `weight`
- `is_price`
- `is_show`
- `protein`
- `fat`
- `carbohydrates`
- `time_stage_1`
- `time_stage_2`
- `time_stage_3`
- `mark_name`
- `change_tag`
- `reload_vk`
- `new_item`
- `site_kc`
- `kassa`
- `short_name`
- `marc`
- `items`
- `stage`
- `is_updated`

### 3.3. Как это превращается в runtime keys

Middleware строит `upd_access` так:

- `param` -> `value`
- `param_edit` -> `edit`
- `param_view` -> `view`
- `param_access` -> `access`

Пример:

- если в `appointment_group.param = 'name'`
- то runtime получит `name`, `name_edit`, `name_view`, `name_access`

Именно эти ключи сейчас используют:

- `SkladProductionWriteService`
- `SkladSiteItemWriteService`
- `SkladAccessService`

## 4. Почему команда безопасна для остальных модулей

Команда синхронизации:

- не меняет `appointment_group` source-модулей
- не меняет `appointment_template` source-модулей
- не меняет `appointment_template_group` source-модулей
- не трогает `left_menu`
- не трогает чужие `sklad_modules.key_query`

Она делает только это:

- создает target-модуль `sklad_items`, если его еще нет
- upsert-ит `appointment_group` только для target-модуля
- rebuild-ит `appointment_template` только для target-модуля
- rebuild-ит `appointment_template_group` только для target-групп target-модуля

## 5. Команда

```bash
php artisan sklad:sync-access
```

Опции:

```bash
php artisan sklad:sync-access --dry-run
php artisan sklad:sync-access --target-key=sklad_items
php artisan sklad:sync-access --target-name="Склад"
```

Рекомендуемый production/apply запуск:

```bash
php artisan sklad:sync-access --target-key=sklad_items --target-name="Склад"
```

## 6. Что команда делает

1. Находит source-модули по `key_query`
2. Создает или находит target-модуль `sklad_items`
3. Собирает union legacy access groups из source-модулей
4. Добавляет canonical `Sklad` flags
5. Пересобирает target `appointment_group`
6. Пересобирает target `appointment_template` как OR по source module activation
7. Пересобирает target `appointment_template_group` как merged runtime access contour
8. Чистит cache `getInfoModule_*` для target module key

## 7. Практическое правило для FE

- новый FE должен открывать `Sklad` через canonical backend contract нового модуля
- section-level gating брать из `get_all.access`
- legacy field-level flags считать transitional runtime layer, а не product-contract
- FE должен ориентироваться на canonical `get_all.access` и на access rollout из этого документа
- route-space `/api/sklad_items/*` и target module key `sklad_items` — это разные слои: API и module registry provisioning
