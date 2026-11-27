import { vi } from "vitest";

export const monthId = "2026-11";
export const row = {
  id: 7,
  app_id: 5,
  smena_id: 10,
  date: "2026-11-16",
  user_name: "Сотрудник",
  app_name: "Повар",
  can_edit_bonus: 1,
  dir_bonus: 120,
  finance_hidden: 0,
  check_period: 1,
  price_p_h: 200,
  price_arr: [200, 250],
  given: 50,
  given_cart: 30,
  withheld: 10,
  other_smens: [{ id: 20, name: "Вторая смена" }],
  other_points: [{ point_id: 8, smena_id: 9, name: "Другое кафе" }],
};
export const access = {
  full_day_access: 1,
  full_month_access: 1,
  bonus_edit: 1,
  "1h_edit": 1,
  given_edit: 1,
  given_cart_edit: 1,
  withheld_edit: 1,
  all_price_view: 1,
  fast_hours_access: 1,
  fast_smena_access: 1,
  fast_point_access: 1,
  export_excel_access: 1,
};
export const period = { days: [], bonus: [], other_summ: {}, order_stat: [], bonus_other: 0 };
export function graphResponse(overrides = {}) {
  return {
    st: true,
    date: { one: { ...period }, two: { ...period } },
    one: [{ row: "data", data: { ...row } }],
    two: [{ row: "data", data: { ...row } }],
    part: 2,
    kind: "dir",
    access: { ...access },
    ...overrides,
  };
}
export const dayResponse = { h_info: { date: "2026-11-27", user: row, hours: [] } };
export const monthResponse = { h_info: { date: monthId, user: row }, hours_days: [] };
export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}
export function createApi() {
  const writes = [
    "saveDirBonus",
    "saveDopBonus",
    "saveDopBonusUser",
    "saveUserPriceH",
    "saveUserGivePrice",
    "saveUserGiveCartPrice",
    "saveUserWithheld",
    "saveUserDay",
    "saveUserMonth",
    "saveFastTime",
    "saveFastTimeWeekOne",
    "saveFastSmena",
    "saveFastPoint",
    "saveFastTimeArrMounth",
    "saveFastTimeArrTwoWeek",
  ];
  return {
    getAll: vi.fn().mockResolvedValue({
      st: true,
      point_list: [{ id: 3, name: "Кафе" }],
      months: [{ id: monthId, is_active: 1 }, { id: "2026-12" }],
      access: { ...access },
    }),
    getGraph: vi.fn().mockImplementation(async () => graphResponse()),
    getUserDay: vi.fn().mockResolvedValue(dayResponse),
    getUserMonth: vi.fn().mockResolvedValue(monthResponse),
    downloadWS: vi.fn().mockResolvedValue({ url: "http://chef.test/schedule.xlsx" }),
    downloadHJ: vi.fn().mockResolvedValue({ url: "http://chef.test/health.xlsx" }),
    ...Object.fromEntries(
      writes.map((method) => [method, vi.fn().mockResolvedValue({ st: true })]),
    ),
  };
}
