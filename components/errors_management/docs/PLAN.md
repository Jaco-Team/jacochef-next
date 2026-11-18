# План модуля

ТЗ — главный критерий.

## Реализовано

- [x] v2 aggregate жалобы, ошибки позиции/заказа, аудит и workflow.
- [x] Каталог и настройки: фиксированные корни, активность, порядок, история, общие и кафе-варианты.
- [x] Состав сайта, ингредиенты, допы, приборы, доставка, количество позиции.
- [x] Журнал, детали, server filters, sorting and pagination (таблица и карточки).
- [x] Statistics, promo attribution и isolated historical read-model.
- [x] Права по `permissions`, снятие ошибки, `client_request_id`.
- [x] DS UI, responsive registration and order details.

## До production acceptance

- [ ] Проверить frontend на backend этого раунда (миграция с правами, `permissions`, `v2/errors/remove`, `quantity`, `client_request_id`, `item_ids`).
- [ ] Проверить реальными ролями КК/кафе/регионального директора и несколькими кафе.
- [ ] Применить migration и access sync в целевой среде.
- [ ] Добавить isolated HTTP feature tests полного workflow.

Не добавлять вторую миграцию, отдельную RBAC-схему или write-адаптер legacy без отдельного требования.
