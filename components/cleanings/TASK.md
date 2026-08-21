# Chef-only follow-up: Cleanings + бактерицидные лампы

## Scope

Объединить действующий журнал `journal_of_work_of_bactericidal_lamps` с новым экраном `/cleanings` в Chef FE. Старый standalone route сохранить.

## UI work

- [ ] Добавить отдельный раздел `Бактерицидные лампы` в Cleanings navigation.
- [ ] Переиспользовать текущие фильтры точки/месяца, таблицу, редактирование лампы, внесение активности и XLS export.
- [ ] Сохранить access gating журнала, включая `export_excel`.
- [ ] Добавить подсказки к верхним разделам и Control subtabs.
- [ ] Проверить empty/loading/error состояния и responsive layout.

## Control verification

- [ ] Проверить `Обновить` для уборок и заготовок.
- [ ] Проверить manual add/approve/return/detach/delete для уборок.
- [ ] Проверить edit/approve/delete для заготовок.
- [ ] Проверять только локальный API и локальные point schemas.

## Safety

`src/api_new.js` остается локальным пользовательским override и не редактируется. Не переключать API на production и не менять Site FE.
