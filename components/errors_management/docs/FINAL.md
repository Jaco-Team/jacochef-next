# Итоговый обзор

v2 жалоба — единственный write source нового процесса. Legacy остаётся read-only для заказов и historical statistics. Frontend разделён на page, page hook, sections and domain helpers; backend — controller/service/repository.

Сервер валидирует каталог, ингредиент, этап, позицию, кафе и transition. Order source и промокод решения хранятся снимком; historical adapter изолирован и не пишет legacy.

Нет известного дефекта, блокирующего PR. До production acceptance остаются реальные роли/кафе и isolated HTTP coverage из [валидации](./VALIDATION.md).
