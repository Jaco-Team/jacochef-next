# Staff Schedule Mobile

## Breakpoint Contract

- `md` and up: desktop layout remains the default implementation.
- below `md`: use the dedicated mobile composition described here.
- Mobile is not a compressed desktop table. It is a separate page and modal layout built from the same data and actions.

## Source Of Truth

- `doc/layout/mobile/staff_schedule.md`
- mobile screenshots provided during the current task
- legacy mobile sheet pattern already used in older modules

## Main Mobile Screen

### Header / Filters

Order on mobile:

1. page title row with the existing module name
2. point select
3. month select
4. secondary actions row:
   - `Журнал здоровья`
   - `Обновить`
5. period segmented control
6. shift select

Rules:

- all primary fields are full width
- action row is two columns
- no desktop export icon cluster in the mobile header shell
- spacing is compact and vertical

### Schedule Section

Rules recovered from Figma and screenshots:

- white schedule surface on a neutral page background
- shift groups are accordion blocks
- shift groups are separated by spacing, not only borders
- calendar visibility toggle belongs to the table header area
- `Цветовые обозначения` is a button action in the header area
- one of the mobile states shows a collapsed shift while keeping the same header shell
- summary data is a separate table family, not a squeezed desktop footer

### Selection Actions

- when one or more employees are selected, show a persistent bottom action bar
- content:
  - selected counter
  - `Снять`
  - primary `Редактирование`
- this bar is mobile-only

## Mobile Modal / Sheet Rules

- desktop modals stay dialogs
- mobile editing flows become bottom sheets
- sheet shell requirements:
  - `SwipeableDrawer`
  - top radius about `24px - 25px`
  - drag handle
  - centered title
  - close button on the right
  - safe-area bottom padding
- header is white
- body/background follows the flow design

## Mobile Flows

### Fast Actions

- main `Редактирование` screen becomes a sheet
- substeps also render as mobile sheets
- unsaved changes warning stays explicit
- success returns to the table with the saved-state feedback

### Hour Filling

- employee data screen stays separate from hour-filling
- `Заполнение часов` becomes a mobile sheet
- predefined time variants stay stacked
- custom ranges:
  - use colors distinct from predefined variants
  - support add and remove
  - max two extra ranges
- `+ Часы` opens a dedicated add-range sheet with:
  - color selection
  - working time pickers
  - preview chip
  - `Сброс`
  - `Добавить`

### Shift Editing

- rename flow stays available
- delete stays explicit and goes through warning confirmation

### Color Legend

- opens as a compact mobile modal/sheet

## Delivery Order

- [x] make the page shell breakpoint-driven
- [x] split schedule rendering into desktop and mobile branches
- [x] add the mobile bottom action bar
- [x] introduce the stricter staff-schedule mobile sheet shell
- [x] migrate fast actions to the mobile sheet flow
- [x] migrate hour-filling to the mobile sheet flow
- [x] migrate shift editing and related warnings
