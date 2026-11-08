# Валидация и выпуск

## Подтверждено локально

- Chrome на `localhost:3000` с API `127.0.0.1:8000`: журнал, регистрация, drawer, статистика, настройки, desktop и mobile.
- Server filters: источник, ID, статус жалобы, этап заказа, период, тип и сумма.
- Несколько ошибок позиции, ошибка заказа, промокод, аудит и settings capability.
- Backend: 24 tests / 73 assertions; frontend unit rules passed.
- Последний mobile pass: регистрация, незавершённое закрытие и focus restore без console warnings.

## Перед production

1. Пройти КК → кафе → решение реальными ролями и несколькими кафе.
2. Применить единственную migration задачи и access sync в целевой среде.
3. Smoke-test сайт, кафе, доставка, допы, приборы, повторные и order-level ошибки, промокод.
4. Добавить isolated HTTP feature tests полного create/transition/audit пути.

Production не использовался для записей или проверок.
