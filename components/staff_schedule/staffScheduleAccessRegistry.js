export const STAFF_SCHEDULE_ACCESS_RULES = [
  { key: "1h", label: "За 1ч", area: "Финансы", status: "useful" },
  { key: "1h_plus", label: "За 1ч + доп.", area: "Финансы", status: "useful" },
  { key: "com_bonus", label: "Командный бонус", area: "Финансы", status: "useful" },
  { key: "full_h", label: "За часы", area: "Финансы", status: "useful" },
  { key: "errors", label: "Ошибки", area: "Финансы", status: "useful" },
  { key: "bonus", label: "Бонус директора", area: "Финансы", status: "useful" },
  { key: "all_price", label: "Всего", area: "Финансы", status: "useful" },
  { key: "withheld", label: "Удержано", area: "Финансы", status: "useful" },
  {
    key: "test_all_price",
    label: "К выплате",
    area: "Финансы",
    status: "useful_legacy_name",
  },
  { key: "given", label: "Выдано", area: "Финансы", status: "useful" },
  { key: "given_cart", label: "На карты", area: "Финансы", status: "useful" },
  { key: "premia", label: "Премия по ведомости", area: "Финансы", status: "useful" },
  { key: "salary_block", label: "Блок зарплаты", area: "Финансы", status: "useful_fe_group" },
  {
    key: "payroll_actions",
    label: "Действия с выплатами",
    area: "Финансы",
    status: "useful_fe_group",
  },
  { key: "bonus_of_day", label: "Сумма за период", area: "Итоги", status: "useful" },
  { key: "sums_all", label: "Сводные итоги", area: "Итоги", status: "useful" },
  { key: "rolls", label: "Роллы", area: "Итоги", status: "useful" },
  { key: "pizza", label: "Пицца", area: "Итоги", status: "useful" },
  { key: "over_40_min", label: "Заказы более 40 минут", area: "Итоги", status: "useful" },
  { key: "footer_stats", label: "Блок итогов", area: "Итоги", status: "useful_fe_group" },
  { key: "full_month", label: "Месячная карточка", area: "График", status: "useful" },
  { key: "day_edit", label: "Редактирование дня", area: "График", status: "useful_missing" },
  { key: "full_day", label: "Полный доступ к дню", area: "График", status: "useful_missing" },
  {
    key: "schedule_actions",
    label: "Панель действий графика",
    area: "График",
    status: "useful_fe_group",
  },
  {
    key: "create_edit_smena",
    label: "Создание/редактирование смен",
    area: "Смены",
    status: "useful",
  },
  {
    key: "smena_actions",
    label: "Действия со сменами",
    area: "Смены",
    status: "useful_fe_group",
  },
  { key: "fast_month", label: "Быстро: месяц", area: "Быстрые действия", status: "useful" },
  {
    key: "fast_2_week",
    label: "Быстро: половина месяца",
    area: "Быстрые действия",
    status: "useful",
  },
  { key: "fast_smena", label: "Быстро: смена", area: "Быстрые действия", status: "useful" },
  { key: "fast_point", label: "Быстро: кафе", area: "Быстрые действия", status: "useful" },
  { key: "export_excel", label: "Экспорт Excel", area: "Экспорт", status: "useful_missing" },
];

export const STAFF_SCHEDULE_ROLE_OPTIONS = [
  { id: "", name: "kind из API" },
  { id: "MEGA", name: "MEGA" },
  { id: "mega_dir", name: "mega_dir" },
  { id: "dir", name: "dir" },
  { id: "manager", name: "manager" },
  { id: "other", name: "other" },
];

export const STAFF_SCHEDULE_ACCESS_PRESETS = [
  { id: "all_on", name: "Все включить" },
  { id: "all_off", name: "Все выключить" },
  { id: "read_only", name: "Только просмотр" },
  { id: "finance", name: "Только финансы" },
  { id: "schedule", name: "Только график" },
  { id: "fast", name: "Только быстрые" },
];

const FINANCE_RULES = new Set([
  "1h",
  "1h_plus",
  "com_bonus",
  "full_h",
  "errors",
  "bonus",
  "all_price",
  "withheld",
  "test_all_price",
  "given",
  "given_cart",
  "premia",
  "salary_block",
  "payroll_actions",
  "bonus_of_day",
  "sums_all",
  "footer_stats",
]);
const SCHEDULE_RULES = new Set([
  "full_month",
  "day_edit",
  "full_day",
  "schedule_actions",
  "create_edit_smena",
  "smena_actions",
]);
const FAST_RULES = new Set(["fast_month", "fast_2_week", "fast_smena", "fast_point"]);

export function buildStaffScheduleAccessSkeleton(access = {}) {
  const next = { ...access };

  STAFF_SCHEDULE_ACCESS_RULES.forEach(({ key }) => {
    ["access", "view", "edit"].forEach((action) => {
      const accessKey = `${key}_${action}`;
      if (!Object.prototype.hasOwnProperty.call(next, accessKey)) {
        next[accessKey] = 0;
      }
    });
  });

  return next;
}

export function applyStaffScheduleAccessPreset(access = {}, presetId) {
  const next = buildStaffScheduleAccessSkeleton(access);

  STAFF_SCHEDULE_ACCESS_RULES.forEach(({ key }) => {
    const canFinance = presetId === "finance" && FINANCE_RULES.has(key);
    const canSchedule = presetId === "schedule" && SCHEDULE_RULES.has(key);
    const canFast = presetId === "fast" && FAST_RULES.has(key);
    const enabled = presetId === "all_on" || canFinance || canSchedule || canFast;
    const readOnly = presetId === "read_only";

    next[`${key}_access`] = enabled ? 1 : 0;
    next[`${key}_view`] = enabled || readOnly ? 1 : 0;
    next[`${key}_edit`] = enabled ? 1 : 0;
  });

  return next;
}

export function getMissingStaffScheduleAccessKeys(access = {}) {
  return STAFF_SCHEDULE_ACCESS_RULES.flatMap(({ key }) =>
    ["access", "view", "edit"]
      .map((action) => `${key}_${action}`)
      .filter((accessKey) => !Object.prototype.hasOwnProperty.call(access, accessKey)),
  );
}
