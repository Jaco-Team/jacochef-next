# ACCESS

Статус: краткий FE access handoff для `sklad_items`.

Source of truth:

- runtime contract: `API.md`
- этот документ описывает только FE-ключи, которые допустимо использовать в новом UI

## FE exact keys

- `production_view`
- `production_edit`
- `production_create`
- `production_delete`
- `production_past_date`
- `production_convert`
- `site_items_view`
- `site_items_edit`
- `site_items_create`
- `site_items_delete`
- `site_items_past_date`
- `site_items_sync_vk`
- `units_view`
- `units_edit`
- `units_create`
- `units_delete`
- `archive_view` — compatibility, вычисляется backend из прав разделов
- `archive_edit` — compatibility, вычисляется backend из прав разделов
- `history_view` — compatibility, вычисляется backend из прав разделов

Для рецептов и полуфабрикатов каждое поле использует `production_<field>_view/edit`: `name`, `shelf_life`, `unit`, `date_start`, `date_end`, `time`, `dop_time`, `items`, `allergens`, `allergens_diff`, `structure`, `categories`, `storages`, `apps`, `show_in_rev`, `two_user`, `activity`.

Для вкладки «Товары сайта» дополнительно возвращаются независимые scoped-права:

- таблица: `site_items_site_kc_view/edit`, `site_items_kassa_view/edit`, `site_items_sort_view/edit`;
- основные: `site_items_name`, `site_items_date_start`, `site_items_date_end`, `site_items_short_name`, `site_items_art`, `site_items_category_id`, `site_items_stol`, `site_items_marc`, `site_items_dropzone` с суффиксами `_view/_edit`;
- секции: `site_items_portion`, `site_items_bju`, `site_items_description`, `site_items_tags`, `site_items_activity`, `site_items_composition` с суффиксами `_view/_edit`;
- управление справочником тегов: `change_tag_access`.

Backend пока также возвращает старые unscoped aliases для совместимости legacy-компонентов. Новый код производства должен использовать только `production_*`; одинаковые unscoped `name`, `date_start`, `date_end`, `items` относятся к compatibility-слою товаров сайта.

## Правила FE

- Вкладка видна, если есть соответствующий `*_view` или `*_edit`.
- `production_edit` разрешает mutation endpoint, но каждое поле формы проверяется по `production_<field>_edit`.
- `units_edit` включает форму единицы целиком.
- `site_items_edit` разрешает mutation-контур вкладки, но видимость и редактирование полей карточки определяются детальными правами.
- `*_create` управляет созданием новой сущности.
- `*_delete` управляет контролами удаления.
- `production_past_date` разрешает прошлую дату «Действует с» для рецептов и полуфабрикатов.
- `site_items_past_date` разрешает прошлую дату «Действует с» для товаров сайта.
- Архивирование и восстановление доступны по праву редактирования активности конкретного раздела: `production_activity_edit` либо `site_items_activity_edit`.
- История доступна по view-права конкретного раздела: `production_view`, `site_items_view` либо `units_view`.
- Отдельных групп прав «Архив» и «История» в `sklad_items` нет.
- Значение access-флага трактуется как boolean: `1` разрешает действие, `0` запрещает.
- Payload содержит compact-права разделов и field-level права товаров сайта, включая значения `0`.

## Runtime naming boundary

Ключи выше — публичные FE-ключи. Они не являются `appointment_group.param` в БД.

- section DB param `production` дает runtime `production_view` и `production_edit`;
- action DB param `production_create` дает middleware runtime `production_create_access`, а backend публикует FE-ключ `production_create`;
- аналогично работают `site_items`, `units`, `archive` и остальные action-группы.

FE использует возвращённые backend ключи и не добавляет `_access` самостоятельно.

## Что не должен делать FE

- Не давать доступ ко всей модалке только по `site_items_edit` при наличии детальной матрицы.
- Не показывать VK-действия и не проверять `reload_vk_access`.
- Не подменять отдельные права таблицы общим правом редактирования.

Названия field-level ключей сохранены совместимыми с `site_items_new`, но принадлежат runtime-контракту `sklad_items`.
