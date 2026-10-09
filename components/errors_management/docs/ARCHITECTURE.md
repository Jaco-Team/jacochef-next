# Архитектура

`v2/*` ведёт жалобу, ошибки, каталог, аудит, журнал и статистику. Legacy `get_orders` и historical adapter read-only. Frontend uses `useApi("errors_management")`; `api_new` не используется.

- Controller — HTTP/auth boundary.
- ComplaintService — create, transition, validation and detail read-model.
- Catalog/Ingredient/Position services — classifier and order composition.
- Repository — v2 persistence, journal and statistics queries.

`ErrorsManagementPage` composes shell; `useErrorsManagementPage` owns route-local state and API orchestration; sections own local visual state. Zustand не нужен: нет cross-route state.
