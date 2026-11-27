import { vi } from "vitest";

export const employee = {
  id: 7,
  app_id: 2,
  smena_id: 1,
  user_name: "Анна Тестовая",
  app_name: "Кассир",
  can_edit_bonus: true,
  check_period: 1,
  my_bonus: "500",
  dop_bonus: "300",
  dates: [{ date: "27", info: { hours: "08:00" } }],
};

export function tableProps(overrides = {}) {
  return {
    pointId: 3,
    monthId: "2026-11",
    selectedPart: 1,
    period: {
      id: "current",
      meta: { days: [{ day: "Пт", date: "27" }], other_summ: { sum_bonus_price: "500" } },
    },
    rows: [
      { row: "header", data: "1 смена", __shiftId: "shift-1", __smenaId: 1, __employeeCount: 1 },
      { data: employee },
    ],
    shownShiftCount: 1,
    summaryColumns: [],
    access: {},
    graphKind: "latest",
    periodBonusState: 1,
    selectedRowIds: [],
    collapsedShiftIds: [],
    isCalendarHidden: false,
    colorMode: "plain",
    onOpenDay: vi.fn(),
    onOpenMonth: vi.fn(),
    onOpenFastActions: vi.fn(),
    onOpenSummaryAction: vi.fn(),
    onChangeTeamBonusForUser: vi.fn(),
    onOpenBulkFastActions: vi.fn(),
    onOpenSelectedFastActions: vi.fn(),
    onOpenCreateSmena: vi.fn(),
    onOpenEditSmena: vi.fn(),
    onToggleRowSelection: vi.fn(),
    onClearRowSelection: vi.fn(),
    onToggleShiftCollapse: vi.fn(),
    onCalendarVisibilityChange: vi.fn(),
    onColorModeChange: vi.fn(),
    ...overrides,
  };
}

export function dayModal(overrides = {}) {
  return {
    open: true,
    loading: false,
    request: { date: "2026-11-27", user_id: 7, app_id: 2, smena_id: 1, point_id: 3 },
    data: {
      date: "2026-11-27",
      personName: "Анна Тестовая",
      positionName: "Кассир",
      canEditHours: true,
      canEditAssignment: true,
      canEditHealth: true,
      newApp: 2,
      mentorId: 9,
      userTemp: "36,6",
      typeHealf: 2,
      otherApps: [
        { id: 2, name: "Кассир" },
        { id: 3, name: "Повар" },
      ],
      mentorList: [{ id: 9, name: "Наставник" }],
      healthOptions: [{ id: 2, name: "Здоров" }],
      hours: [{ id: "morning", time_start: "10:00", time_end: "14:00", appName: "Кассир" }],
      history: [],
      ...overrides,
    },
  };
}
