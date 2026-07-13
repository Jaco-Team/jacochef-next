# Staff Schedule Figma Notes

## Fast Actions Modal

### Source

- Screenshot note: `Путь редактирования данных выбранного сотрудника`
- Screenshot: main fast-actions modal hub state
- Saved assets:
  - `figma_assets/fast-actions-flow-note.png`
  - `figma_assets/fast-actions-main-screen.png`
  - `figma_assets/fast-actions-change-point.png`

### Current implementation notes

- The hub screen has three editable rows: `Часы`, `Смена`, `Кафе`.
- `Часы` can contain a detailed 2/2 summary like `С 16 числа 2/2 с 10:00 до 22:00`.
- If the employee does not have a clean repeating 2/2 pattern and the schedule is mixed across the visible period, the hub value should not pretend to be a single repeating schedule.

### Implemented rule

- Repeating 2/2 schedule: show the detailed text.
- Mixed / non-pattern schedule: show `Персональные`.

### Follow-up candidates

- Confirm whether `Персональные` should stay as the final product wording or become `Персональные часы` / `Индивидуальный график`.
- Add more screenshot notes here as new Figma references arrive.

## Change Point Subscreen

### Source

- Screenshot: point-change submodal state

### Implemented notes

- City switch uses the shared segmented toggle style.
- The same segmented toggle style is reused for the schedule scope switch (`На месяц` / `На 2 недели`).
- Point selection stays in a separate white card under the city switch.
