# Документация Chef frontend

Общие инструкции находятся здесь, документация модулей — рядом с их кодом. Планы описывают отдельные задачи и могут содержать исторический контекст; актуальное состояние уточняется в самих документах.

## Общие документы

- [Локальный запуск и Docker](docker.md)
- [Правила дизайна административного интерфейса](admin-design-rules.md)
- [Спецификация переработки закупок](close-buy-redesign-spec.md)
- [Спецификация отчёта по себестоимости](otchety-sebestoimost-spec-i-lovable-prompt_v1_2026-07-21.md)
- [Дизайн-система](../design-system/README.md) · [план](../design-system/PLAN.md)
- [Тесты](../tests/README.md)

## Модули и планы

- Товары склада (`sklad_items`): [документация](../components/sklad_items/docs/README.md) · [исходная задача](../components/sklad_items/docs/TASK.md) · [план](../components/sklad_items/docs/PLAN.md) · [дополнительный план](../components/sklad_items/docs/PLAN2.md) · [обратная связь: задача](../components/sklad_items/docs/feedback-43371/TASK.md) · [план](../components/sklad_items/docs/feedback-43371/PLAN.md)
- Закупки (`close_buy`): [план](../components/close_buy/docs/PLAN.md) · [API](../components/close_buy/docs/API.md)
- Уборки (`cleanings`): [план](../components/cleanings/docs/PLAN.md) · [FE API](../components/cleanings/docs/FE-API.md) · [обновление API](../components/cleanings/docs/API-UPGRADE.md)
- Расширенные заказы (`orders_extended`): [план](../components/orders_extended/docs/PLAN.md) · [API](../components/orders_extended/docs/API.md)
- Статистика товаров по акциям (`promo_items_stat`): [план](../components/promo_items_stat/docs/PLAN.md)
- Эффективность кафе (`cafe_performance`): [документация](../components/bi/cafe_performance/docs/README.md) · [план](../components/bi/cafe_performance/docs/plan.md)
- График персонала (`staff_schedule`): [документация](../components/staff_schedule/docs/README.md) · [план тестирования](../components/staff_schedule/docs/TEST-PLAN.md)
- Редактирование кафе (`cafe_edit`): [задачи](../components/cafe_edit/docs/TODO.md)
- Персонал (`employees`): [API](../components/employees/docs/EMPLOYEES_API.md)
- `check_check`: [документация](../components/check_check/docs/README.md)
- `stat_buy`: [документация](../components/stat_buy/docs/README.md)
- `competitor_parsers`: [backend](../components/competitor_parsers/docs/BE.md)
- `bi/dds`: [документация](../components/bi/dds/docs/README.md)
- Авторизация: [документация](../pages/auth.md)
