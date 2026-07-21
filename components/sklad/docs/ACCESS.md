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

Главное runtime-правило проекта:

- `get_all.access` должен оставаться raw middleware payload `upd_access`, как в старых модулях `Vendors`, `Ads`
- старый `Site_clients` исторически возвращает тот же payload под typo-key `acces`
- новый `sklad_items` возвращает ровно этот payload без backend remap/normalization слоя

Практическое правило для FE:

- для любых кнопок, вкладок и enabled/disabled состояния читать `access`
- backend mutations проверяют те же raw `upd_access` keys

### 3.1. Миграция FE после ошибочного remap

Ошибочный промежуточный контракт, который больше не является runtime contract:

- использование `get_all.access` как сокращенной synthetic-карты было ошибочным промежуточным контрактом
- любые FE-выводы вида "если нет `units_edit`, значит нельзя редактировать единицы"

Нормальный контракт после исправления:

- `get_all.access` — это raw `upd_access` из middleware
- FE должен читать конкретные ключи из `get_all.access`
- для единиц измерения использовать `ed_izmer`, `ed_izmer_view`, `ed_izmer_edit`, `ed_izmer_access`
- для категорий использовать `cats`, `cats_view`, `cats_edit`, `cats_access`
- для удаления recipes/semi-finished использовать `delete`, `delete_view`, `delete_edit`, `delete_access`
- для удаления site items использовать `delete_item`, `delete_item_view`, `delete_item_edit`, `delete_item_access`
- для полей карточек использовать соответствующие field-level keys из таблицы ниже

Правило совместимости:

- backend не публикует synthetic keys `units_edit`, `categories_edit`, `delete_execute`
- если FE уже успел завязаться на них, их надо заменить на raw keys из `access`
- серверные endpoints все равно проверяют raw keys, поэтому FE должен показывать то же, что реально примет backend

### 3.2. Full target rule map

Это фактический набор `appointment_group` для target-модуля `sklad_items`.

Колонки:

- `param` — базовый ключ правила
- `runtime keys` — ключи, которые middleware может собрать в `upd_access`
- `type` — тип из `appointment_group.type`
- `purpose` — назначение по коду, имени правила или legacy label
- `source / derivation` — откуда правило берется или как вычисляется

Если точное назначение из кода и legacy label определить нельзя, указано `N/A`.

| param                | runtime keys                                                                                            | type | purpose                                 | source / derivation |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------- | ------------------- |
| `name`               | `name`, `name_view`, `name_edit`, `name_access`                                                         | 2    | Наименование                            | legacy merged       |
| `shelf_life`         | `shelf_life`, `shelf_life_view`, `shelf_life_edit`, `shelf_life_access`                                 | 2    | Срок годности                           | legacy merged       |
| `two_user`           | `two_user`, `two_user_view`, `two_user_edit`, `two_user_access`                                         | 2    | Количество сотрудников                  | legacy merged       |
| `show_in_rev`        | `show_in_rev`, `show_in_rev_view`, `show_in_rev_edit`, `show_in_rev_access`                             | 2    | Ревизия                                 | legacy merged       |
| `date_start`         | `date_start`, `date_start_view`, `date_start_edit`, `date_start_access`                                 | 2    | Действует с                             | legacy merged       |
| `date_end`           | `date_end`, `date_end_view`, `date_end_edit`, `date_end_access`                                         | 2    | Дата окончания                          | legacy merged       |
| `time`               | `time`, `time_view`, `time_edit`, `time_access`                                                         | 2    | Время приготовления 1 кг                | legacy merged       |
| `dop_time`           | `dop_time`, `dop_time_view`, `dop_time_edit`, `dop_time_access`                                         | 2    | Дополнительное время                    | legacy merged       |
| `rec_apps`           | `rec_apps`, `rec_apps_view`, `rec_apps_edit`, `rec_apps_access`                                         | 2    | Должность в кафе для приготовления      | legacy merged       |
| `storages`           | `storages`, `storages_view`, `storages_edit`, `storages_access`                                         | 2    | Места хранения                          | legacy merged       |
| `create_rec`         | `create_rec`, `create_rec_view`, `create_rec_edit`, `create_rec_access`                                 | 2    | Создание рецепта                        | legacy merged       |
| `create_pol`         | `create_pol`, `create_pol_view`, `create_pol_edit`, `create_pol_access`                                 | 2    | Создание полуфабриката                  | legacy merged       |
| `rev_table`          | `rev_table`, `rev_table_view`, `rev_table_edit`, `rev_table_access`                                     | 2    | Ревизия в таблице                       | legacy merged       |
| `change_rec_pf`      | `change_rec_pf`, `change_rec_pf_view`, `change_rec_pf_edit`, `change_rec_pf_access`                     | 2    | Смена рецепта на полуфабрикат и обратно | legacy merged       |
| `delete`             | `delete`, `delete_view`, `delete_edit`, `delete_access`                                                 | 2    | Удаление рецепта или полуфабриката      | legacy merged       |
| `items`              | `items`, `items_view`, `items_edit`, `items_access`                                                     | 2    | Номенклатура / состав                   | legacy merged       |
| `allergens`          | `allergens`, `allergens_view`, `allergens_edit`, `allergens_access`                                     | 2    | Аллергены                               | legacy merged       |
| `allergens_diff`     | `allergens_diff`, `allergens_diff_view`, `allergens_diff_edit`, `allergens_diff_access`                 | 2    | Возможные аллергены                     | legacy merged       |
| `structure`          | `structure`, `structure_view`, `structure_edit`, `structure_access`                                     | 2    | Состав                                  | legacy merged       |
| `cats`               | `cats`, `cats_view`, `cats_edit`, `cats_access`                                                         | 2    | Категории                               | legacy merged       |
| `ed_izmer`           | `ed_izmer`, `ed_izmer_view`, `ed_izmer_edit`, `ed_izmer_access`                                         | 2    | Единица измерения                       | legacy merged       |
| `max_count_in_m`     | `max_count_in_m`, `max_count_in_m_view`, `max_count_in_m_edit`, `max_count_in_m_access`                 | 2    | Максимальное количество заказов в месяц | legacy merged       |
| `name_for_vendor`    | `name_for_vendor`, `name_for_vendor_view`, `name_for_vendor_edit`, `name_for_vendor_access`             | 2    | Название товара для поставщика          | legacy merged       |
| `pq`                 | `pq`, `pq_view`, `pq_edit`, `pq_access`                                                                 | 2    | Количество в упаковке                   | legacy merged       |
| `percent`            | `percent`, `percent_view`, `percent_edit`, `percent_access`                                             | 2    | Процент заявки                          | legacy merged       |
| `vend_percent`       | `vend_percent`, `vend_percent_view`, `vend_percent_edit`, `vend_percent_access`                         | 2    | Разрешенный процент повышения ценника   | legacy merged       |
| `art`                | `art`, `art_view`, `art_edit`, `art_access`                                                             | 2    | Код для 1C / артикул                    | legacy merged       |
| `min_count`          | `min_count`, `min_count_view`, `min_count_edit`, `min_count_access`                                     | 2    | Минимальный остаток                     | legacy merged       |
| `pf_list`            | `pf_list`, `pf_list_view`, `pf_list_edit`, `pf_list_access`                                             | 2    | Состав товара                           | legacy merged       |
| `my_allergens_other` | `my_allergens_other`, `my_allergens_other_view`, `my_allergens_other_edit`, `my_allergens_other_access` | 2    | Возможные аллергены товара              | legacy merged       |
| `this_storages`      | `this_storages`, `this_storages_view`, `this_storages_edit`, `this_storages_access`                     | 2    | Места хранения товара                   | legacy merged       |
| `apps`               | `apps`, `apps_view`, `apps_edit`, `apps_access`                                                         | 2    | Должность в кафе                        | legacy merged       |
| `time_min_other`     | `time_min_other`, `time_min_other_view`, `time_min_other_edit`, `time_min_other_access`                 | 2    | Время                                   | legacy merged       |
| `mark_name`          | `mark_name`, `mark_name_view`, `mark_name_edit`, `mark_name_access`                                     | 2    | Маркетинговое название                  | legacy merged       |
| `active`             | `active`, `active_view`, `active_edit`, `active_access`                                                 | 2    | Активность в таблице                    | legacy merged       |
| `ord`                | `ord`, `ord_view`, `ord_edit`, `ord_access`                                                             | 2    | Заявка в таблице                        | legacy merged       |
| `rev`                | `rev`, `rev_view`, `rev_edit`, `rev_access`                                                             | 2    | Ревизия в таблице                       | legacy merged       |
| `create_new`         | `create_new`, `create_new_view`, `create_new_edit`, `create_new_access`                                 | 2    | Создание товара                         | legacy merged       |
| `is_show`            | `is_show`, `is_show_view`, `is_show_edit`, `is_show_access`                                             | 2    | Активность                              | legacy merged       |
| `show_in_order`      | `show_in_order`, `show_in_order_view`, `show_in_order_edit`, `show_in_order_access`                     | 2    | Заявка                                  | legacy merged       |
| `honest_sign`        | `honest_sign`, `honest_sign_view`, `honest_sign_edit`, `honest_sign_access`                             | 2    | Системы учета                           | legacy merged       |
| `delete_item`        | `delete_item`, `delete_item_view`, `delete_item_edit`, `delete_item_access`                             | 2    | Удаление товара                         | legacy merged       |
| `tmp_desc`           | `tmp_desc`, `tmp_desc_view`, `tmp_desc_edit`, `tmp_desc_access`                                         | 2    | Состав товара сайта                     | legacy merged       |
| `marc_desc`          | `marc_desc`, `marc_desc_view`, `marc_desc_edit`, `marc_desc_access`                                     | 2    | Короткое описание в карточке            | legacy merged       |
| `marc_desc_full`     | `marc_desc_full`, `marc_desc_full_view`, `marc_desc_full_edit`, `marc_desc_full_access`                 | 2    | Полное описание в карточке              | legacy merged       |
| `show_program`       | `show_program`, `show_program_view`, `show_program_edit`, `show_program_access`                         | 2    | На кассе                                | legacy merged       |
| `is_new`             | `is_new`, `is_new_view`, `is_new_edit`, `is_new_access`                                                 | 2    | Новинка                                 | legacy merged       |
| `show_site`          | `show_site`, `show_site_view`, `show_site_edit`, `show_site_access`                                     | 2    | На сайте и КЦ                           | legacy merged       |
| `is_hit`             | `is_hit`, `is_hit_view`, `is_hit_edit`, `is_hit_access`                                                 | 2    | Хит                                     | legacy merged       |
| `dropzone`           | `dropzone`, `dropzone_view`, `dropzone_edit`, `dropzone_access`                                         | 2    | Картинка                                | legacy merged       |
| `category_id`        | `category_id`, `category_id_view`, `category_id_edit`, `category_id_access`                             | 2    | Категория                               | legacy merged       |
| `count_part`         | `count_part`, `count_part_view`, `count_part_edit`, `count_part_access`                                 | 2    | Кусочков или размер                     | legacy merged       |
| `stol`               | `stol`, `stol_view`, `stol_edit`, `stol_access`                                                         | 2    | Стол                                    | legacy merged       |
| `weight`             | `weight`, `weight_view`, `weight_edit`, `weight_access`                                                 | 2    | Вес                                     | legacy merged       |
| `is_price`           | `is_price`, `is_price_view`, `is_price_edit`, `is_price_access`                                         | 2    | Установить цену                         | legacy merged       |
| `protein`            | `protein`, `protein_view`, `protein_edit`, `protein_access`                                             | 2    | Белки                                   | legacy merged       |
| `fat`                | `fat`, `fat_view`, `fat_edit`, `fat_access`                                                             | 2    | Жиры                                    | legacy merged       |
| `carbohydrates`      | `carbohydrates`, `carbohydrates_view`, `carbohydrates_edit`, `carbohydrates_access`                     | 2    | Углеводы                                | legacy merged       |
| `time_stage_1`       | `time_stage_1`, `time_stage_1_view`, `time_stage_1_edit`, `time_stage_1_access`                         | 2    | Время на 1 этап                         | legacy merged       |
| `time_stage_2`       | `time_stage_2`, `time_stage_2_view`, `time_stage_2_edit`, `time_stage_2_access`                         | 2    | Время на 2 этап                         | legacy merged       |
| `time_stage_3`       | `time_stage_3`, `time_stage_3_view`, `time_stage_3_edit`, `time_stage_3_access`                         | 2    | Время на 3 этап                         | legacy merged       |
| `change_tag`         | `change_tag`, `change_tag_view`, `change_tag_edit`, `change_tag_access`                                 | 2    | Редактирование тегов                    | legacy merged       |
| `reload_vk`          | `reload_vk`, `reload_vk_view`, `reload_vk_edit`, `reload_vk_access`                                     | 2    | Обновить товары VK                      | legacy merged       |
| `new_item`           | `new_item`, `new_item_view`, `new_item_edit`, `new_item_access`                                         | 2    | Новый товар                             | legacy merged       |
| `site_kc`            | `site_kc`, `site_kc_view`, `site_kc_edit`, `site_kc_access`                                             | 2    | Активность / сайт и КЦ в таблице        | legacy merged       |
| `kassa`              | `kassa`, `kassa_view`, `kassa_edit`, `kassa_access`                                                     | 2    | Касса в таблице                         | legacy merged       |
| `short_name`         | `short_name`, `short_name_view`, `short_name_edit`, `short_name_access`                                 | 2    | Короткое название                       | legacy merged       |
| `marc`               | `marc`, `marc_view`, `marc_edit`, `marc_access`                                                         | 2    | Маркировка                              | legacy merged       |
| `stage`              | `stage`, `stage_view`, `stage_edit`, `stage_access`                                                     | 2    | Заготовки                               | legacy merged       |
| `is_updated`         | `is_updated`, `is_updated_view`, `is_updated_edit`, `is_updated_access`                                 | 2    | Обновлено                               | legacy merged       |

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
4. Пересобирает target `appointment_group`
5. Пересобирает target `appointment_template` как OR по source module activation
6. Пересобирает target `appointment_template_group` как merged runtime access contour
7. Чистит cache `getInfoModule_*` для target module key

## 7. Практическое правило для FE

- новый FE должен открывать `Sklad` через canonical backend contract нового модуля
- section-level gating брать из raw `get_all.access`
- field-level кнопки, формы и write/read controls брать из raw `get_all.access`
- raw field-level flags не transitional layer; это project pattern для middleware access payload
- FE должен ориентироваться на raw `get_all.access`; отдельной сокращенной access-карты backend не публикует
- route-space `/api/sklad_items/*` и target module key `sklad_items` — это разные слои: API и module registry provisioning
