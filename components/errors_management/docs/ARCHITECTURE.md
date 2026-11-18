# Архитектура

`v2/*` ведёт жалобу, ошибки, каталог, аудит, журнал и статистику. Legacy `get_orders` / `get_order_new` и исторический адаптер статистики только читают данные. Frontend использует `useApi("errors_management")`; `api_new` не используется.

- `ErrorsManagementPage` — оболочка: вкладки по правам, пустое состояние, уведомления.
- `useErrorsManagementPage` — состояние страницы: отдельные фильтры журнала (по умолчанию 7 дней), поиска заказов (по умолчанию сегодня) и статистики, область настроек, загрузки с защитой от устаревших ответов.
- `useErrorsManagementApi` — вызовы API; `{st: false}` превращается в `ErrorsManagementRequestError` с `text` и картой полей.
- Чистые помощники с unit-тестами: `errorsManagementPermissions.mjs` (права, команды, телефон), `complaintStatusModel.mjs` (цвета статусов и легенда), `complaintClassifier.mjs` (классификатор, количество, `client_request_id`), `requestErrors.mjs`, `orderSearchModel.mjs` (точный поиск по номеру заказа), `sections/settings/catalogModel.mjs` (общие и кафе-варианты, допустимые родители и этапы, правила узлов).
- `sections/*` — визуальные блоки; новый UI собран на `design-system/shared/ui`.

Zustand не нужен: нет состояния между маршрутами.
