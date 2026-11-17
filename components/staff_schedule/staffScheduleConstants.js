import { uiRadii } from "@/design-system/shared/tokens";

export const CONTROL_RADIUS = uiRadii.md;
export const PAGE_BOTTOM_PADDING = 4;

export const EMPTY_PERIOD = {
  days: [],
  bonus: [],
  other_summ: {},
  order_stat: [],
  bonus_other: 0,
  bonus_other_status: 0,
};

export const EMPLOYEE_COLUMN_WIDTH = 170;
export const POSITION_COLUMN_WIDTH = 190;
export const DAY_COLUMN_WIDTH = 56;
export const SUMMARY_COLUMN_WIDTH = 84;
// «999 ч 59 мин» в одну строку при фактическом шрифте ячейки 14px.
export const WORKED_HOURS_COLUMN_WIDTH = 100;

export function getSummaryColumnWidth(column) {
  return column?.key === "worked_hours" ? WORKED_HOURS_COLUMN_WIDTH : SUMMARY_COLUMN_WIDTH;
}

export function getSummaryColumnsWidth(columns = []) {
  return columns.reduce((sum, column) => sum + getSummaryColumnWidth(column), 0);
}
export const SELECTION_COLUMN_WIDTH = 44;
export const ACTION_COLUMN_WIDTH = 44;
