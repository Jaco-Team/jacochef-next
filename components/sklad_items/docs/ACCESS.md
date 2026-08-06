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
- `site_items_view`
- `site_items_edit`
- `site_items_create`
- `site_items_delete`
- `units_view`
- `units_edit`
- `units_create`
- `units_delete`
- `archive_view`
- `archive_edit`
- `history_view`

## Правила FE

- Вкладка видна, если есть соответствующий `*_view` или `*_edit`.
- `*_edit` включает весь экран/форму редактирования сущности.
- `*_create` управляет созданием новой сущности.
- `*_delete` управляет контролами удаления.
- `archive_edit` управляет восстановлением из архива.
- `history_view` покрывает встроенные history-блоки и history-вкладки, где они используются в новом UI.
- Отдельного field-level gating в новом FE нет.

## Что не должен делать FE

- Не использовать legacy/raw backend keys как FE-контракт.
- Не предлагать FE старые `upd_access` aliases, field-level keys или compatibility names.
- Не строить собственные remap-таблицы поверх этого компактного контракта.

Legacy/raw backend keys остаются только внутренним backend compatibility mapping и не должны предлагаться фронтенду как рабочий контракт.
