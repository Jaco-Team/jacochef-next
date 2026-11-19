# Архитектура

`v2/*` ведёт жалобу, ошибки, фото, аудит, журнал и статистику. Каталог для регистрации — дерево категорий /option_to_win (`jaco_site_rolls.err_desc_cats`), решения — `err_desc_win`, этапы — общий список из 12 этапов. Legacy `get_orders` / `get_order_new` и исторический адаптер статистики только читают данные. Frontend использует `useApi("errors_management")`; фото загружаются через `api_upload` того же hook.

- `ErrorsManagementPage` — оболочка: вкладки по правам, пустое состояние, уведомления.
- `useErrorsManagementPage` — состояние страницы: фильтры журнала, поиска заказов и статистики, данные дерева из `get_all`, загрузки с защитой от устаревших ответов.
- `useErrorsManagementApi` — вызовы API; `{st: false}` превращается в `ErrorsManagementRequestError` с `text` и картой полей.
- Чистые помощники с unit-тестами:
  - `complaintTree.mjs` — листья и пути дерева, подбор по категории сайта позиции, этапы по типу товара, решения листа, проверка и payload ошибки, проверка фото, `client_request_id`;
  - `optionTreeModel.mjs` — дерево для вкладки настроек и payload `add_cat`/`update_cat`;
  - `errorsManagementPermissions.mjs`, `complaintStatusModel.mjs`, `orderSearchModel.mjs`, `requestErrors.mjs`.
- `sections/*` — визуальные блоки на `design-system/shared/ui`: редактор ошибки, `PhotoPicker`, `ComplaintTreeSettings` с `tree/CategoryEditor`, `complaint/PhotoThumbnails` (миниатюры и просмотр).

Компоненты `components/option_to_win` не меняются: вкладка модуля использует собственные DS-компоненты с той же моделью данных.
