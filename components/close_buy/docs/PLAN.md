# План frontend-части Close Buy

## Reference и evidence

- [Новый production/reference экран](https://jacosoft-dop.ru/close_buy)
- [Старый экран истории](https://jacochef.ru/#close_buy_history)
- [Figma redesign, node 3:7](https://www.figma.com/design/IBZGPYXeOgyPA33eBqvOUn/Close-Buy-%E2%80%94-redesign?node-id=3-7&p=f&t=N6LLjt3dxDKohE2x-0)
- [Снимок нового экрана](./assets/live-close-buy-new.png)
- [Снимок Figma redesign](./assets/figma-close-buy-redesign.png)

Reference UI не изменять: эти сайты используются только для наблюдения.

## Цель

Переписать `pages/close_buy.js` на декомпозированный экран по Figma redesign, подключённый напрямую к новому Close Buy API.

## Проверенные факты

- Текущая страница хранит всё состояние в одном class-компоненте.
- Каждый checkbox немедленно вызывает `save_active`, после чего выполняется повторный `get_items`.
- Текущий payload группирует товары внутри категорий.
- В проекте уже есть MUI 7 и Zustand; актуальный Grid API — `size={{ xs: ..., md: ... }}`.
- В Figma есть management и history, responsive варианты 360/390/430, category detail, mixed category actions, close confirmation, loading/error/empty/success states.

## Целевой UX-контракт

### Management

- Заголовок `Управление товарами`, выбор точки, tabs `Управление` / `История`.
- Поиск по товарам и категориям, фильтры `Все` / `Открытые` / `Закрытые`.
- Сводка открытых, закрытых и смешанных категорий.
- Category Card со статусом, количеством и действием всей категории.
- Отдельный экран категории с поиском и Item Row.
- Для mixed state — bottom sheet с явным выбором итогового состояния.
- Для закрытия категории — confirmation bottom sheet; backend обязан перепроверить состав.

### History

- Фильтры точки, периода, категории и дополнительных параметров.
- Группировка событий по датам.
- History Event с пользователем, точкой, временем, типом действия и раскрытием товаров.
- Пагинация/ленивая загрузка, без загрузки всей истории целиком.

### System states

Отдельно реализовать loading skeleton, retryable error, empty result и success feedback. Не показывать raw backend diagnostics, `undefined` или `[object Object]`.

## Предлагаемая структура

- `components/close_buy/CloseBuyPage.jsx` — композиция страницы и режимы.
- `CloseBuyManagement.jsx`, `CloseBuyCategory.jsx`, `CloseBuyHistory.jsx`.
- `CategoryCard.jsx`, `ItemRow.jsx`, `HistoryEvent.jsx`.
- `CategoryActionsSheet.jsx`, `CloseConfirmationSheet.jsx`.
- `useCloseBuyStore.js` — Zustand state/actions.
- `closeBuyApi.js` — API calls и response normalization.
- `closeBuyUtils.js` — pure status/count/filter helpers.
- `pages/close_buy.js` — тонкий entrypoint.

## State и новый API

Разделить server state и UI state: points, selected point, categories/items, history/pagination, filters, tabs, selected category, sheets, pending action, request loading/error и last successful payload.

FE должен использовать обычный для проекта Chef API: module prefix `close_buy`, `data` payload, `GlobalResource` envelope со `st/text` и простыми ответами. Не добавлять отдельный REST/GraphQL client, JSON:API normalizer или сложную domain-модель поверх небольшого модуля.

Не мутировать объекты ответа напрямую. На первом срезе не считать клик успешным до ответа сервера: после mutation принимать server result/refetch. При смене точки отменять или игнорировать устаревшие запросы и очищать несоответствующий state.

1. Зафиксировать новый `API.md` в стиле проекта и типизированный FE normalizer до написания экранов.
2. Подключить `bootstrap`, `management` и `category` endpoints к management flow.
3. Подключить `item-state` и `category-state` с server-confirmed result/refetch.
4. Подключить `history` с фильтрами и pagination.
5. Добавить retry, stale-request protection и server-confirmed success.

## Responsive и accessibility

- Проверить 360, 390, 430 и desktop.
- Использовать MUI 7 Grid `size`, max-width контейнеры и проектные breakpoints; не копировать Figma координаты как absolute layout.
- Bottom sheets должны поддерживать Escape/backdrop/back и не терять pending action.
- Проверить длинные названия, пустые категории, большие списки, keyboard navigation и zoom.

## Порядок работ и проверка

1. Снять authenticated Chrome baseline и network contract.
2. Уточнить backend `API.md`, затем закрепить FE normalizer.
3. Вынести store/API helpers без изменения поведения.
4. Собрать management overview и category detail.
5. Добавить mixed-state/category actions.
6. Подключить history после backend endpoint.
7. Проверить loading/error/empty/success, смену точки и retry.
8. В Chrome проверить desktop/360/390/430, реальные network calls, console и отсутствие повторного bootstrap loop.

## Критерии готовности

- Нет monolithic page state и прямой мутации API objects.
- Нет неоговорённого сохранения каждой галочки.
- Изменения отражают только подтверждённое сервером состояние.
- История идёт из backend, а не из mock/static cards.
- Фильтры, поиск, tabs и actions работают после смены точки.
- Ошибка сохраняет retry и не маскируется успехом.

## Риски и запреты

- Не менять production/reference UI.
- Не строить новый FE как оболочку над старой страницей или старым API.
- Не угадывать history fields, permissions, counts или save semantics до schema/runtime verification.
- Figma browser tab на момент исследования показывал login; дизайн подтверждён MCP metadata и screenshot, приложенным выше.
