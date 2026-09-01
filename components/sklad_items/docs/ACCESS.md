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
- `site_items_view`
- `site_items_edit`
- `site_items_create`
- `site_items_delete`
- `site_items_past_date`
- `units_view`
- `units_edit`
- `units_create`
- `units_delete`
- `archive_view`
- `archive_edit`
- `history_view`

Для вкладки «Товары сайта» дополнительно возвращаются независимые права:

- таблица: `site_kc_view/edit`, `kassa_view/edit`, `sort_view/edit`;
- основные: `name`, `date_start`, `date_end`, `short_name`, `art`, `category_id`, `stol`, `marc`, `dropzone` с суффиксами `_view/_edit`;
- секции: `portion`, `bju`, `description`, `tags`, `activity`, `composition` с суффиксами `_view/_edit`;
- управление справочником тегов: `change_tag_access`.

## Правила FE

- Вкладка видна, если есть соответствующий `*_view` или `*_edit`.
- `production_edit` и `units_edit` включают соответствующие формы целиком.
- `site_items_edit` разрешает mutation-контур вкладки, но видимость и редактирование полей карточки определяются детальными правами.
- `*_create` управляет созданием новой сущности.
- `*_delete` управляет контролами удаления.
- `production_past_date` разрешает прошлую дату «Действует с» для рецептов и полуфабрикатов.
- `site_items_past_date` разрешает прошлую дату «Действует с» для товаров сайта.
- `archive_edit` управляет восстановлением из архива.
- `history_view` покрывает встроенные history-блоки и history-вкладки, где они используются в новом UI.
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
