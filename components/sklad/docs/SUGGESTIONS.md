# SUGGESTIONS

Правило:

- при каждом крупном backend-этапе отдельно проверять, появились ли opportunities для вынесения shared abstraction или global service
- такие opportunities не реализовывать автоматически вне `app/Chef/Sklad`
- сначала фиксировать их здесь, потом уже отдельно решать, выносить ли их в shared layer

Текущие opportunities:

- локальный reference-cache pattern `Sklad` может позже стать shared helper для read-heavy Chef modules
- capability-map contract из `Sklad` может позже стать общим bootstrap pattern для модулей с phased rollout
- summary/reference invalidation пока локальная; если в проекте появится единый policy для Chef reference caches, `Sklad` можно будет перевести на него
