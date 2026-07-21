# ACCESS

Статус: подтвержденные правила доступа для FE-модуля `components/sklad/**`.

## 1. Что считать подтвержденным contract

Для этого frontend-модуля подтвержден только runtime access payload из `get_all.access` и текущие routes под `/api/sklad_items/*`.

Этот документ намеренно не фиксирует:

- полный backend provisioning flow
- предполагаемый состав `appointment_group`
- неиспользуемые field-level ключи как canonical contract

Если ключ не используется в текущем FE или не описан рядом в `API.md`, он не должен считаться canonical только из-за legacy-именования.

## 2. Section-level gating

Для открытия tab-а FE использует broad section contour:

- `*_view`
- `*_edit`
- `*_access`
- совместимые legacy alias-ключи только там, где это уже зашито в module-local helper

Подтвержденные section keys для shell:

- `units`
- `categories`
- `recipes`
- `semi_finished`
- `site_items`
- `history`
- `archive`

Практическое правило:

- plain view-only доступ открывает раздел, но не включает write actions
- отсутствие отдельного `*_view = 1` не должно скрывать tab, если backend уже прислал `*_edit = 1` или `*_access = 1`

## 3. Write gating

Текущий FE различает navigation и write scope.

Подтвержденные write-сценарии:

- `recipes`, `semi_finished` и `site_items` получают write scope по явным `*_edit` / `*_access`
- transitional action keys могут расширять write controls только в явно используемых module-local сценариях
- plain `*_view` без подтвержденного full-write contour остается read-only и не включает create/edit/archive/flag-toggle controls

Совместимые legacy action keys остаются transitional:

- `create_rec`
- `create_pol`
- `change_rec_pf`
- `create_new`
- `change_tag`
- `reload_vk`

Они допустимы как compatibility signals для текущего FE, но не описываются здесь как canonical backend API contract.

## 4. Destructive actions

Подтвержденные правила для destructive действий:

- delete не включается по одному только view или broad section open
- production/site-item delete требует отдельный delete contour в module-local helper
- archive restore в архивной вкладке зависит от write scope соответствующей entity family, а не только от общего archive section
- backend остается authoritative на confirm step для delete/archive endpoints

Отдельно подтвержденный delete signal:

- `delete_execute`

Совместимый legacy delete contour:

- `delete_item`

Если backend позже введет более узкие action keys, этот документ нужно обновить только после подтверждения их runtime payload и фактического использования в FE.

## 5. FE-facing takeaway

Для текущего `components/sklad/**` модуля:

- canonical shell decisions читать из `get_all.access`
- module-local compatibility alias-ы держать только для уже используемых переходных случаев
- не выдавать undocumented field names за canonical contract
