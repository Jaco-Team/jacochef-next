# Staff Schedule Mobile Figma Notes

Source Figma file: `https://www.figma.com/design/ZGhXlFTHULxRiOXfKOzUEW/Chief-screens--Copy-?viewport=0%2C0%2C1&t=N0Y8u1hgqMCaa29J-0`

Target section:

- Page: `График работы`
- Mobile section: `Финальные макеты мобильной версии`
- Section node: `385:345750`

## Extraction Status

This document was recovered from the saved Figma metadata for the exact file and section above.

What is captured here:

- exact section and subgroup names
- built-in Figma text notes about intended behavior
- visible labels that are present in the mobile mockups metadata
- main mobile states and modal flows

What is still missing from this run:

- inline PNG screenshots from the target mobile frames

Reason:

- Figma MCP hit its plan rate limit during extraction
- direct browser screenshot/export of the target mobile node timed out repeatedly

Use the node ids in this document to export screenshots later when Figma access is available again.

## Expected Mobile Scope

The target section contains these major mobile groups:

1. `Основной экран`
2. `Виды таблиц`
3. `Данные сотрудника. Заполнение часов`
4. `Редактирование смены`

## Main Screen

Group:

- `Основной экран`
- Group node: `398:227904`

Embedded Figma notes:

- `Таблица на белом фоне с аккордеоном.`
- `Смены разделены между собой отступами.`
- `Функция сворачивания календаря находится в шапке таблицы (Скрыть календарь).`
- `На первых двух макетах показано 2 состояния - календарь открыт и календарь свёрнут.`
- `На третьем макете показано скрытое состояние смены 1.`
- `При нажатии на кнопку “Цветовые обозначения” в модальном окне прописаны данные по цветам.`
- `При прокрутке таблицы средняя часть с фильтрами “уезжает” под заголовок.`
- `При нажатии на кнопку “Стрелочки” в шапке смены выделяются все сотрудники смены. Кнопка в активном состоянии становится темно-серого цвета.`
- `Внизу экрана поле с кнопками действия.`

### Screen State 1

Frame:

- `Mobile`
- Node: `398:237820`

Interpretation:

- main screen with calendar open

Visible structure:

- top title row with `Модуль работы`
- two stacked inputs
- two side-by-side text buttons
- segment/select controls
- one more input
- checkbox row with `Скрыть календарь`
- schedule block header with `ГРАФИК СМЕН`
- right-aligned button `Цветовые обозначения`
- bottom action area exists

Visible text recovered from metadata:

- `Модуль работы`
- `Скрыть календарь`
- `ГРАФИК СМЕН`
- `Показано`
- `5 смен`
- `Цветовые обозначения`
- `Управляющий, менеджер, кассир`
- `1 смена`
- `2 смена`
- `Курьеры`

Behavior notes:

- this is one of the two primary calendar-visibility states
- shift groups use accordion rows with arrow buttons
- white table surface stays the main visual container
- schedule sections are separated by vertical spacing, not only borders

### Screen State 2

Frame:

- `Mobile`
- Node: `398:248891`

Interpretation:

- main screen with calendar collapsed or hidden

Visible structure:

- same header and filter shell as state 1
- same `Скрыть календарь` control
- same schedule header and `Цветовые обозначения` action
- same grouped schedule tables

Visible text recovered from metadata:

- `Модуль работы`
- `Скрыть календарь`
- `ГРАФИК СМЕН`
- `Показано`
- `5 смен`
- `Цветовые обозначения`
- `Управляющий, менеджер, кассир`
- `1 смена`
- `2 смена`
- `Курьеры`

Behavior notes:

- this is the second state paired with state 1
- intended difference is calendar visibility, not a full layout redesign
- table cell sizes must remain aligned with the other table variants

### Screen State 3

Frame:

- `Mobile`
- Node: `398:246707`

Interpretation:

- main screen with hidden state for shift 1

Visible structure:

- same top shell as the first two screens
- same mobile header, filters, and schedule header
- one shift is shown in collapsed accordion state

Visible text recovered from metadata:

- `Модуль работы`
- `Скрыть календарь`
- `ГРАФИК СМЕН`
- `Показано`
- `5 смен`
- `Цветовые обозначения`
- `Управляющий, менеджер, кассир`
- `1 смена`
- `2 смена`
- `Курьеры`

Behavior notes:

- the hidden state is demonstrated specifically on shift 1
- the accordion action belongs in the shift header
- collapsed and expanded states must keep the same header row shell and action affordances

## Table Types

Group:

- `Виды таблиц`
- Group node: `398:227916`

Embedded Figma notes:

- `Представлены два вида таблицы: для смены и для сводных данных.`
- `Два состояния для каждого вида таблицы: открытый и свернутый календарь.`
- `Размеры ячеек едины для всех видов таблиц.`
- `Шапка таблицы со сводными данными темно-серого цвета с белым текстом и иконкой.`
- `Состояние строки select person - галочка в чекбоксе. Остальной вид строки не меняется. - Редактирование данных сотрудника.`

Implementation intent:

- there are two table families: shift tables and summary-data tables
- each family exists in both calendar-open and calendar-collapsed states
- cell dimensions must stay identical across these variants
- summary table header is dark gray with white text and an icon
- selected-person row state is shown through the checkbox state, without redesigning the rest of the row

## Employee Data And Hour Filling

Group:

- `Данные сотрудника. Заполнение часов`
- Group node: `398:305176`

Embedded Figma notes:

- `При нажатии на строку с данными сотрудника открывается модальное окно с Данными сотрудника.`
- `Модальное окно содержит информацию о сотруднике: рабочий график, финансовые данные, заполнение часов.`
- `Заполнение часов при нажатии на кнопку “Заполнить часы”.`
- `В “Заполнении часов” выбирается часовой промежуток и в календаре отмечается нужный день/дни.`
- `Можно добавить новый временной промежуток. Нажать на кнопку “+Часы”. В открытом модальном окне выбрать цвет, время и подтвердить выбор, нажав кнопку “Добавить”. Либо отменить кнопкой “Сброс”.`
- `Новое время можно удалить.`
- `Добавить можно только два новых временных промежутка. При этом кнопка “+Часы” становится неактивной и меняет вид на “+”.`

Primary mobile frame:

- `Mobile`
- Node: `398:299973`

Visible text recovered from metadata:

- `Модуль работы`
- `Скрыть календарь`
- `ГРАФИК СМЕН`
- `Показано`
- `5 смен`
- `Цветовые обозначения`
- `Управляющий, менеджер, кассир`
- `1 смена`
- `2 смена`
- `Курьеры`

Behavior notes:

- tapping an employee row opens the employee-data modal
- the employee modal includes schedule, finance, and hour-filling information
- `Заполнить часы` opens the hour-filling flow
- the user marks one or more calendar days for the chosen time range
- the user may add up to two extra time ranges
- after the limit is reached, `+Часы` becomes inactive and visually reduces to `+`
- newly added time ranges can be removed

## Shift Editing

Group:

- `Редактирование смены`
- Group node: `398:332975`

Embedded Figma notes:

- `Функция изменения названия смены.`
- `Функция “Удалить смену”.`
- `Окно-предупреждение при удалении смены.`

Primary mobile frame:

- `Mobile`
- Node: `398:330684`

Visible text recovered from metadata:

- `Модуль работы`
- `Скрыть календарь`
- `ГРАФИК СМЕН`
- `Показано`
- `5 смен`
- `Цветовые обозначения`
- `Управляющий, менеджер, кассир`
- `1 смена`
- `2 смена`
- `Курьеры`

Behavior notes:

- shift rename is a supported action
- deleting a shift must go through a warning or confirmation state
- delete is intentionally explicit, not silent

## Recovered UI Vocabulary

These labels were directly visible in the saved mobile metadata and should be preserved unless the product copy changes:

- `Модуль работы`
- `Скрыть календарь`
- `ГРАФИК СМЕН`
- `Показано`
- `5 смен`
- `Цветовые обозначения`
- `Управляющий, менеджер, кассир`
- `1 смена`
- `2 смена`
- `Курьеры`

## Visual And Interaction Summary

- Mobile width is based on `414px` frames.
- The top title area stays compact with a right-side icon button.
- Filters are stacked vertically above the schedule section.
- The middle controls area scrolls away under the header while the user moves down the table.
- The calendar visibility toggle lives in the table header area, not as a detached filter.
- Shift groups use accordion-style expand and collapse behavior.
- The `Цветовые обозначения` action opens a modal with color meanings.
- There is a bottom action area for bulk or contextual actions.
- Summary tables use a distinct dark header treatment.

## Screenshot Export Backlog

The following frames should be exported as PNG and inserted inline into this file once Figma access is available again:

- `398:237820` — main screen, state 1
- `398:248891` — main screen, state 2
- `398:246707` — main screen, state 3
- `398:299973` — employee data / fill hours flow
- `398:330684` — shift editing flow

Suggested placement after export:

- one inline image under each screen subsection above

## Open Data Gap

Still needed from Figma:

- actual inline screenshots for the five mobile frames above
- if required later: exact text labels inside the generic `Input` and `Text button` instances, because the saved metadata preserved their component names but not every inner label
