# План модуля

ТЗ — главный критерий.

## Реализовано

- [x] v2 aggregate жалобы, ошибки позиции/заказа, аудит и workflow.
- [x] Каталог и настройки: фиксированные корни, активность, порядок, история.
- [x] Состав сайта, ингредиенты, допы, приборы и доставка.
- [x] Журнал, детали, server filters, sorting and pagination.
- [x] Statistics, promo attribution and isolated historical read-model.
- [x] Point access, settings capability, backend validation.
- [x] DS UI, responsive registration and order details.

## До production acceptance

- [ ] Проверить реальными ролями КК/кафе и несколькими кафе.
- [ ] Применить migration и access sync в целевой среде.
- [ ] Добавить isolated HTTP feature tests полного workflow.
- [ ] Подтвердить приборы на реальном заказе в финальном smoke-test.

Не добавлять вторую миграцию, отдельную RBAC-схему или write-адаптер legacy без отдельного требования.
