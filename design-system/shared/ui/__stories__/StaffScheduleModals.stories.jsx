import dayjs from "dayjs";
import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { expect, userEvent, waitFor, within } from "storybook/test";

import StaffScheduleExportDialog from "@/components/staff_schedule/modals/StaffScheduleExportDialog";
import StaffScheduleFastActionsDialog from "@/components/staff_schedule/modals/StaffScheduleFastActionsDialog";
import StaffScheduleDayModal from "@/components/staff_schedule/modals/StaffScheduleDayModal";
import StaffScheduleMonthModal from "@/components/staff_schedule/modals/StaffScheduleMonthModal";
import StaffScheduleSummaryActionDialog from "@/components/staff_schedule/modals/StaffScheduleSummaryActionDialog";
import StaffScheduleColorLegendModal from "@/components/staff_schedule/sections/StaffScheduleColorLegendModal";
import StaffScheduleMobileTableSection from "@/components/staff_schedule/sections/StaffScheduleMobileTableSection";
import StaffScheduleTableSection from "@/components/staff_schedule/sections/StaffScheduleTableSection";
import { DAY_COLUMN_WIDTH } from "@/components/staff_schedule/staffScheduleConstants";
import { getHolidayStripeSx } from "@/components/staff_schedule/staffSchedulePatterns";
import { getVisibleSummaryColumns } from "@/components/staff_schedule/staffScheduleHelpers";
import {
  buildDayModalViewModel,
  buildSummaryActionHeaderData,
} from "@/components/staff_schedule/staffScheduleModalViewModel";

const meta = {
  title: "Chef Design System/Modules/Staff Schedule",
};

export default meta;

export function HealthJournalExportDialog() {
  const date = dayjs("2026-09-16").format("YYYY-MM-DD");

  return (
    <StaffScheduleExportDialog
      dialog={{
        open: true,
        mode: "hj",
        dateStart: date,
        dateEnd: date,
        error: "",
      }}
      onClose={() => {}}
      onDateStartChange={() => {}}
      onDateEndChange={() => {}}
      onDownload={() => {}}
    />
  );
}

export function ColorLegendDialog() {
  return (
    <StaffScheduleColorLegendModal
      open
      onClose={() => {}}
    />
  );
}

export function FastActionScheduleDialog() {
  return (
    <StaffScheduleFastActionsDialog
      state={{
        open: true,
        mode: "single",
        screen: "schedule",
        user: {
          id: 7,
          user_name: "Юкова В. Л.",
          full_app_name: "Менеджер",
          smena_id: 1,
          current_schedule: {
            start_day: 1,
            text: "2/2 с 10:00 до 22:00",
            pattern: "2/2",
            work_days: [1, 3, 5],
          },
          other_smens: [],
          other_points: [],
        },
        draft: {
          scheduleScope: null,
          scheduleType: null,
          smenaId: 1,
          point: null,
        },
        error: "",
      }}
      access={{
        fast_hours_access: 1,
        fast_smena_access: 1,
        fast_point_access: 1,
      }}
      selectedPart={0}
      monthId="2026-08"
      pointLabel="Тольятти, Ленинградская 47"
      shiftLabel="1 смена"
      onClose={() => {}}
      onBackToHub={() => {}}
      onApplyScheduleDraft={() => {}}
      onApplyShiftDraft={() => {}}
      onApplyPointDraft={() => {}}
      onSaveChanges={() => {}}
    />
  );
}

const FAST_ACTION_USERS = [
  {
    id: 7,
    app_id: 5,
    user_name: "Юкова В. Л.",
    full_app_name: "Повар универсал",
    smena_id: 1,
    other_smens: [
      { id: 2, name: "2 смена" },
      { id: 3, name: "Курьеры" },
    ],
    other_points: [{ point_id: 12, smena_id: 4, name: "Тольятти, Ворошилова 12а" }],
  },
  {
    id: 8,
    app_id: 6,
    user_name: "Беседин А. А.",
    full_app_name: "Менеджер",
    smena_id: 2,
    other_smens: [
      { id: 1, name: "1 смена" },
      { id: 3, name: "Курьеры" },
    ],
    other_points: [{ point_id: 12, smena_id: 4, name: "Тольятти, Ворошилова 12а" }],
  },
];
const FAST_ACTION_ACCESS = { fast_hours_access: 1, fast_smena_access: 1, fast_point_access: 1 };

function FastActionHubExample({
  mode = "bulk",
  access = FAST_ACTION_ACCESS,
  users = FAST_ACTION_USERS,
  initialScreen = "hub",
  initialDraft = {},
}) {
  const [state, setState] = useState(() => ({
    open: true,
    mode,
    screen: initialScreen,
    user: users[0],
    users,
    draft: { scheduleScope: null, scheduleType: null, smenaId: "", point: null, ...initialDraft },
  }));
  const openScreen = (screen) => () => setState((prev) => ({ ...prev, screen }));
  const apply = (nextDraft) =>
    setState((prev) => ({ ...prev, screen: "hub", draft: { ...prev.draft, ...nextDraft } }));

  return (
    <StaffScheduleFastActionsDialog
      state={state}
      access={access}
      monthId="2026-09"
      selectedPart={1}
      pointLabel="Тольятти, Ленинградская 47"
      shiftLabel="1 смена"
      onClose={() => setState((prev) => ({ ...prev, open: false }))}
      onBackToHub={openScreen("hub")}
      onOpenSchedule={openScreen("schedule")}
      onOpenShift={openScreen("shift")}
      onOpenPoint={openScreen("point")}
      onApplyScheduleDraft={apply}
      onApplyShiftDraft={(smenaId) => apply({ smenaId })}
      onApplyPointDraft={(point) => apply({ point })}
      onUsersChange={(nextUsers) => setState((prev) => ({ ...prev, users: nextUsers }))}
      onSaveChanges={() =>
        setState((prev) => ({ ...prev, error: "Демонстрация: данные не отправляются на сервер" }))
      }
    />
  );
}

export const FastActionBulkHub = () => <FastActionHubExample />;
export const FastActionBulkOneEmployee = () => (
  <FastActionHubExample users={FAST_ACTION_USERS.slice(0, 1)} />
);
export const FastActionBulkSameEmployeeRoles = () => (
  <FastActionHubExample
    users={[
      { ...FAST_ACTION_USERS[1], app_name: "Менеджер" },
      { ...FAST_ACTION_USERS[1], app_id: 7, app_name: "Повар", full_app_name: "Повар" },
    ]}
  />
);
export const FastActionBulkHoursOnly = () => (
  <FastActionHubExample access={{ fast_hours_access: 1 }} />
);
export const FastActionBulkShiftOnly = () => (
  <FastActionHubExample access={{ fast_smena_access: 1 }} />
);
export const FastActionBulkCafeOnly = () => (
  <FastActionHubExample access={{ fast_point_access: 1 }} />
);
export const FastActionBulkHoursAndCafe = () => (
  <FastActionHubExample access={{ fast_hours_access: 1, fast_point_access: 1 }} />
);
export const FastActionBulkNoAccess = () => <FastActionHubExample access={{}} />;
export const FastActionSingleHub = () => (
  <FastActionHubExample
    mode="single"
    users={FAST_ACTION_USERS.slice(0, 1)}
  />
);
export const FastActionReadyToSave = () => <FastActionHubExample initialDraft={{ smenaId: 3 }} />;

export const FastActionCafeSearch = () => (
  <FastActionHubExample
    initialScreen="point"
    users={FAST_ACTION_USERS.map((user) => ({
      ...user,
      other_points: [
        { point_id: 12, smena_id: 4, name: "Тольятти, Ворошилова 12а · 1 смена" },
        { point_id: 12, smena_id: 5, name: "Тольятти, Ворошилова 12а · 2 смена" },
        { point_id: 13, smena_id: 6, name: "Тольятти, Ленинградская 47, торговый центр · 1 смена" },
        { point_id: 14, smena_id: 7, name: "Самара, Молодёжная 2 · 1 смена" },
        { point_id: 15, smena_id: 8, name: "Самара, Металлургов 76А · 2 смена" },
      ],
    }))}
  />
);

function EmployeeDayDialogExample({ pastPeriod = false }) {
  const date = (pastPeriod ? dayjs().subtract(1, "month").date(4) : dayjs()).format("YYYY-MM-DD");
  const permissions = buildDayModalViewModel(
    { h_info: { date, user: {} } },
    {
      roleKind: "dir",
      canEditDay: true,
      access: { full_day_access: 1 },
    },
  );
  return (
    <StaffScheduleDayModal
      modal={{
        open: true,
        loading: false,
        error: "",
        request: { user_id: 7, date },
        data: {
          personName: "Беседина Г. М.",
          positionName: "Менеджер",
          date,
          dateLabel: date,
          loadTime: "00:00",
          averageLoadTime: "00:00",
          bonusValue: 540,
          newApp: "",
          otherApps: [{ id: 1, name: "Кассир" }],
          userTemp: "",
          typeHealf: 2,
          healthOptions: [
            { id: 1, name: "Болен" },
            { id: 2, name: "Здоров" },
          ],
          hours: [
            { id: 1, time_start: "10:10", time_end: "23:20" },
            { id: 2, time_start: "10:00", time_end: "22:00" },
          ],
          history: [
            {
              id: "2026-08-07-09-07-58",
              createdAt: "07.08.2026 09:07:58",
              actorName: "Беседина Г. М.",
              title: "07.08.2026 09:07:58 - Беседина Г. М.",
              items: [
                {
                  id: "10-22",
                  label: "10:00:00 - 22:00:00",
                  appName: "Кассир",
                },
              ],
            },
            {
              id: "2026-07-24-14-09-06",
              createdAt: "24.07.2026 14:09:06",
              actorName: "Носов А. В.",
              title: "24.07.2026 14:09:06 - Носов А. В.",
              items: [
                {
                  id: "09-15",
                  label: "09:00:00 - 15:00:00",
                  appName: "Менеджер",
                },
                {
                  id: "16-22",
                  label: "16:00:00 - 22:00:00",
                  appName: "Кассир",
                },
              ],
            },
          ],
          canEditAssignment: permissions.canEditAssignment,
          canEditHealth: permissions.canEditHealth,
          canEditHours: permissions.canEditHours,
        },
      }}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}

export const EmployeeDayDialog = () => <EmployeeDayDialogExample />;
export const PastPeriodDayReadOnly = () => <EmployeeDayDialogExample pastPeriod />;
export const PastPeriodDayReadOnlyMobile = () => <EmployeeDayDialogExample pastPeriod />;
PastPeriodDayReadOnlyMobile.parameters = { viewport: { defaultViewport: "mobile1" } };

const verifyPastDayReadOnly = async ({ canvasElement }) => {
  const root = canvasElement.ownerDocument.body;
  const labels = [...root.querySelectorAll("button")].map((button) => button.textContent.trim());
  if (
    labels.includes("Сохранить") ||
    labels.includes("Добавить время") ||
    root.querySelector('button[aria-label="Удалить время"]')
  ) {
    throw new Error("Прошедший период не должен показывать действия редактирования дня");
  }
  if (
    !root.textContent.includes("Прошедший период — только просмотр") ||
    !labels.includes("Закрыть")
  ) {
    throw new Error("Нужны пояснение режима просмотра и кнопка закрытия");
  }
};
PastPeriodDayReadOnly.play = verifyPastDayReadOnly;
PastPeriodDayReadOnlyMobile.play = verifyPastDayReadOnly;

const teamBonusOptions = [
  { id: 1, name: "Выдать" },
  { id: 2, name: "Отказать" },
];

const teamBonusDecisionModals = [0, 1, 2].map((value) => ({
  open: true,
  mode: "dop_bonus_toggle",
  error: "",
  request: { date: "2026-09", part: 0, point_id: 1 },
  data: {
    title: "Командный бонус 2026-09-01",
    value,
    options: teamBonusOptions,
  },
}));

export function TeamBonusDecisionDefault() {
  return (
    <StaffScheduleSummaryActionDialog
      modal={teamBonusDecisionModals[0]}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}

export function TeamBonusDecisionApproved() {
  return (
    <StaffScheduleSummaryActionDialog
      modal={teamBonusDecisionModals[1]}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}

export function TeamBonusDecisionRejected() {
  return (
    <StaffScheduleSummaryActionDialog
      modal={teamBonusDecisionModals[2]}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}

function NumericBonusExample() {
  return (
    <StaffScheduleSummaryActionDialog
      modal={{
        open: true,
        mode: "my_bonus",
        data: {
          columnLabel: "Бонус",
          periodLabel: "2026-09",
          personName: "Беседин А. А.",
          positionName: "Менеджер",
          label: "Сумма",
          value: "600",
        },
      }}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}
export const BonusSaveDisabled = () => <NumericBonusExample />;
export const BonusSaveEnabled = () => <NumericBonusExample />;
BonusSaveEnabled.play = async () => {
  const input = document.querySelector("input");
  if (!input) throw new Error("Поле суммы должно отображаться");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, "700");
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

function PersonalFinanceHeaderExample({ mode = "given", longName = false }) {
  const fields = {
    given: { columnLabel: "Выдано", label: "Выданная сумма", value: "0.00", fullAmount: "34542" },
    given_cart: {
      columnLabel: "На карты",
      label: "Выданная сумма",
      value: "0.00",
      fullAmount: "34542",
    },
    withheld: { columnLabel: "Удержано", label: "Удержанная сумма", value: "600" },
    price_p_h: {
      columnLabel: "За 1ч",
      value: "300",
      options: [
        { id: 300, name: "300" },
        { id: 320, name: "320" },
      ],
    },
  };
  return (
    <StaffScheduleSummaryActionDialog
      modal={{
        open: true,
        mode,
        data: {
          ...fields[mode],
          periodLabel: mode === "price_p_h" ? "2026-09" : "2026-09-16",
          personName: longName ? "Константинопольский Александр Александрович" : "Беседин А. А.",
          positionName: longName ? "Повар универсал, старший смены" : "Менеджер",
        },
      }}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}

export const CashPayoutHeader = () => <PersonalFinanceHeaderExample />;
export const CardPayoutHeader = () => <PersonalFinanceHeaderExample mode="given_cart" />;
export const RateHeader = () => <PersonalFinanceHeaderExample mode="price_p_h" />;
export const WithholdingHeader = () => <PersonalFinanceHeaderExample mode="withheld" />;
export const FinanceHeaderLongNameMobile = () => <PersonalFinanceHeaderExample longName />;
FinanceHeaderLongNameMobile.parameters = { viewport: { defaultViewport: "mobile1" } };

const verifyPersonalFinanceHeader = async () => {
  const person = Array.from(document.querySelectorAll("[data-staff-schedule-finance-header]")).find(
    (item) => item.textContent.includes("Беседин"),
  );
  if (!person) throw new Error("Сотрудник и название колонки должны отображаться в шапке");
  if (
    document.querySelector("[data-staff-schedule-finance-content]")?.textContent.includes("Беседин")
  ) {
    throw new Error("ФИО не должно дублироваться в содержимом формы");
  }
};
CashPayoutHeader.play = verifyPersonalFinanceHeader;
CardPayoutHeader.play = verifyPersonalFinanceHeader;
RateHeader.play = verifyPersonalFinanceHeader;
WithholdingHeader.play = verifyPersonalFinanceHeader;

export function MonthAssignmentActions() {
  const monthId = dayjs().format("YYYY-MM");
  return (
    <StaffScheduleMonthModal
      modal={{
        open: true,
        loading: false,
        request: { user_id: 7, app_id: 5, date: monthId },
        data: {
          personName: "Юкова В. Л.",
          positionName: "Повар универсал",
          canEditMonth: true,
          days: [],
          overviewDays: [],
          recentCustomHours: [],
        },
      }}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}
MonthAssignmentActions.play = async () => {
  const button = Array.from(document.querySelectorAll("button")).find(
    (item) => item.textContent === "Заполнить часы",
  );
  if (!button) throw new Error("Редактор месяца должен быть доступен");
  button.click();
};

export function MobileScheduleTableTypography() {
  return (
    <Box
      data-testid="mobile-schedule-table-typography"
      sx={{ width: 440, maxWidth: "100%", p: 1.5 }}
    >
      <StaffScheduleMobileTableSection
        shownShiftCount={2}
        rows={[
          {
            row: "header",
            data: "1 смена",
            __shiftId: "shift-1",
            __smenaId: 1,
            __employeeCount: 1,
          },
          {
            data: {
              id: 7,
              smena_id: 1,
              user_name: "Беседина Г. М.",
              app_name: "Менеджер",
              h_price: "1 200",
              err_price: "0",
              my_bonus: "150",
              dates: [{ date: "16", info: { hours: "08:00" } }],
            },
          },
          {
            row: "header",
            data: "2 смена",
            __shiftId: "shift-2",
            __smenaId: 2,
            __employeeCount: 1,
          },
          {
            data: {
              id: 8,
              smena_id: 2,
              user_name: "Орифов Д. О.",
              app_name: "Повар",
              h_price: "680",
              err_price: "15",
              my_bonus: "0",
              dates: [{ date: "16", info: { hours: "06:00" } }],
            },
          },
        ]}
        days={[{ day: "Ср", date: "16" }]}
        collapsedShiftIds={[]}
        onToggleShiftCollapse={() => {}}
        canEditSmena={false}
        onOpenEditSmena={() => {}}
        isCalendarHidden={false}
        showFastActions={false}
        hasBulkSelection={false}
        onOpenBulkFastActions={() => {}}
        onOpenSelectedFastActions={() => {}}
        useColors
        selectedRowIds={[]}
        onToggleRowSelection={() => {}}
        onClearRowSelection={() => {}}
        onOpenMonth={() => {}}
        onOpenDay={() => {}}
        canOpenMonth
        canOpenDayEdit
        hasSummaryRows
        onOpenSummaryAction={() => {}}
        summaryColumns={[
          { key: "h_price", label: "За часы", accessKey: "full_h" },
          { key: "err_price", label: "Ошибки", accessKey: "errors" },
          { key: "my_bonus", label: "Бонус", accessKey: "bonus" },
        ]}
        summaryTotals={{ h_price: "1 880", err_price: "15", my_bonus: "150" }}
        totalsSummaryKeyMap={{
          h_price: "h_price",
          err_price: "err_price",
          my_bonus: "my_bonus",
        }}
        periodBonusSummaryKeyMap={{}}
        canEditTeamBonus={false}
        periodBonusState={0}
        canShowPeriodSum
        bonusDayValues={[{ date: "2026-09-16", res: "14:00" }]}
        canShowTotals
        canShowRolls={false}
        canShowPizza={false}
        canShowSlowOrders={false}
        slowOrderValues={[]}
      />
    </Box>
  );
}

const employeeSearchRows = [
  { row: "header", data: "1 смена", __shiftId: "shift-1", __smenaId: 1, __employeeCount: 2 },
  {
    data: {
      id: 7,
      smena_id: 1,
      app_id: 1,
      user_name: "Беседина Г. М.",
      app_name: "Менеджер",
      h_price: "4 800",
      my_bonus: "500",
      dates: [{ date: "16", info: { hours: "08:00" } }],
    },
  },
  {
    data: {
      id: 7,
      smena_id: 1,
      app_id: 2,
      user_name: "Беседина Г. М.",
      app_name: "Кассир",
      h_price: "2 400",
      my_bonus: "200",
      dates: [{ date: "16", info: { hours: "04:00" } }],
    },
  },
  {
    data: {
      id: 8,
      smena_id: 1,
      app_id: 3,
      user_name: "Орифов Д. О.",
      app_name: "Повар",
      h_price: "3 600",
      my_bonus: "300",
      dates: [{ date: "16", info: { hours: "06:00" } }],
    },
  },
  { row: "header", data: "2 смена", __shiftId: "shift-2", __smenaId: 2, __employeeCount: 1 },
  {
    data: {
      id: 9,
      smena_id: 2,
      app_id: 1,
      user_name: "Юкова В. Л.",
      app_name: "Менеджер",
      h_price: "5 400",
      my_bonus: "600",
      dates: [{ date: "16", info: { hours: "10:00" } }],
    },
  },
];

function EmployeeSearchSchedule({
  isMobile = false,
  summaryColumns = [],
  days = [{ day: "Ср", date: "16" }],
  rows = employeeSearchRows,
  bonusDayValues = [],
  access = {},
  graphKind = "latest",
  monthId = dayjs().format("YYYY-MM"),
  selectedPart = dayjs().date() <= 15 ? 0 : 1,
  onOpenSummaryAction = () => {},
}) {
  return (
    <StaffScheduleTableSection
      monthId={monthId}
      period={{
        meta: {
          days,
          bonus: bonusDayValues,
          other_summ: { sum_h_price: "16 200", sum_bonus_price: "1 600" },
        },
      }}
      rows={rows}
      shownShiftCount={2}
      summaryColumns={summaryColumns}
      access={access}
      graphKind={graphKind}
      directorLevel={0}
      periodBonusState={0}
      selectedPart={selectedPart}
      onOpenDay={() => {}}
      onOpenMonth={() => {}}
      onOpenFastActions={() => {}}
      onOpenSummaryAction={onOpenSummaryAction}
      onRemoveTeamBonusFromUser={() => {}}
      onOpenBulkFastActions={() => {}}
      onOpenSelectedFastActions={() => {}}
      onOpenCreateSmena={() => {}}
      onOpenEditSmena={() => {}}
      selectedRowIds={[]}
      onToggleRowSelection={() => {}}
      onClearRowSelection={() => {}}
      collapsedShiftIds={[]}
      onToggleShiftCollapse={() => {}}
      isCalendarHidden={false}
      onCalendarVisibilityChange={() => {}}
      colorMode="plain"
      onColorModeChange={() => {}}
      isMobile={isMobile}
    />
  );
}

function FastActionPeriodExample({ isMobile = false, period = "current" }) {
  const today = dayjs();
  const month =
    period === "pastMonth"
      ? today.subtract(1, "month")
      : period === "pastPart"
        ? today.date() > 15
          ? today
          : today.subtract(1, "month")
        : period === "future"
          ? today.add(1, "month")
          : today;
  const selectedPart = period === "pastPart" ? 0 : today.date() <= 15 ? 0 : 1;
  return (
    <Box sx={{ width: isMobile ? 390 : 1200, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        isMobile={isMobile}
        access={FAST_ACTION_ACCESS}
        monthId={month.format("YYYY-MM")}
        selectedPart={selectedPart}
      />
    </Box>
  );
}

export const FastActionsPastMonth = () => <FastActionPeriodExample period="pastMonth" />;
export const FastActionsPastPart = () => <FastActionPeriodExample period="pastPart" />;
export const FastActionsCurrentPeriod = () => <FastActionPeriodExample />;
export const FastActionsFuturePeriod = () => <FastActionPeriodExample period="future" />;
export const FastActionsPastMonthMobile = () => (
  <FastActionPeriodExample
    period="pastMonth"
    isMobile
  />
);
export const FastActionsPastPartMobile = () => (
  <FastActionPeriodExample
    period="pastPart"
    isMobile
  />
);
export const FastActionsCurrentPeriodMobile = () => <FastActionPeriodExample isMobile />;
export const FastActionsFuturePeriodMobile = () => (
  <FastActionPeriodExample
    period="future"
    isMobile
  />
);

function verifyFastActionPeriodControls({ canvasElement }, allowed) {
  const hasCheckboxes = Boolean(
    canvasElement.querySelector('.MuiCheckbox-root input[type="checkbox"]'),
  );
  const hasQuickAction = Boolean(
    canvasElement.querySelector('button[aria-label="Быстрые действия"]'),
  );
  if (hasCheckboxes !== allowed || (!allowed && hasQuickAction)) {
    throw new Error("Быстрые действия и выбор сотрудников должны зависеть от выбранного периода");
  }
}

for (const story of [
  FastActionsPastMonth,
  FastActionsPastPart,
  FastActionsPastMonthMobile,
  FastActionsPastPartMobile,
]) {
  story.play = (context) => verifyFastActionPeriodControls(context, false);
}
for (const story of [
  FastActionsCurrentPeriod,
  FastActionsFuturePeriod,
  FastActionsCurrentPeriodMobile,
  FastActionsFuturePeriodMobile,
]) {
  story.play = (context) => verifyFastActionPeriodControls(context, true);
}

export function EmployeeSearchFilter() {
  return (
    <Box sx={{ width: 440, maxWidth: "100%", p: 1.5 }}>
      <EmployeeSearchSchedule isMobile />
    </Box>
  );
}

export function StickyShiftHeaderOnHorizontalScroll() {
  return (
    <Box sx={{ width: 900, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        days={Array.from({ length: 30 }, (_, index) => ({ day: "Ср", date: String(index + 1) }))}
      />
    </Box>
  );
}

export function EmployeeFinancialFocus() {
  return (
    <Box sx={{ width: 1100, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        access={{ sums_all_view: 1 }}
        summaryColumns={[
          { key: "h_price", label: "За часы", accessKey: "full_h" },
          { key: "my_bonus", label: "Бонус", accessKey: "bonus" },
        ]}
      />
    </Box>
  );
}

export function MobileEmployeeFinancialFocus() {
  return (
    <Box sx={{ width: 390, maxWidth: "100%", p: 1 }}>
      <EmployeeSearchSchedule
        isMobile
        access={{ sums_all_view: 1 }}
        summaryColumns={[
          { key: "h_price", label: "За часы", accessKey: "full_h" },
          { key: "my_bonus", label: "Бонус", accessKey: "bonus" },
        ]}
      />
    </Box>
  );
}

const mobileWideDays = Array.from({ length: 12 }, (_, index) => ({
  day: "Ср",
  date: String(index + 1),
}));
const mobileWideRows = employeeSearchRows.map((row) =>
  row.row === "header"
    ? row
    : {
        ...row,
        data: {
          ...row.data,
          dates: mobileWideDays.map((day) => ({ date: day.date, info: { hours: "08:00" } })),
        },
      },
);
const mobileWideBonusDays = mobileWideDays.map((day, index) => ({
  ...day,
  res: index % 2 === 0 ? "99999" : "17448.7",
  count_rolls: "99999",
}));

function MobileWideNumbersExample() {
  return (
    <Box sx={{ width: 390, maxWidth: "100%", p: 1 }}>
      <EmployeeSearchSchedule
        isMobile
        days={mobileWideDays}
        rows={mobileWideRows}
        bonusDayValues={mobileWideBonusDays}
        access={{ sums_all_view: 1, rolls_view: 1 }}
        summaryColumns={[{ key: "h_price", label: "За часы", accessKey: "full_h" }]}
      />
    </Box>
  );
}

export function MobileWideNumbersInitial() {
  return <MobileWideNumbersExample />;
}

export function MobileWideNumbersScrolled() {
  return <MobileWideNumbersExample />;
}

MobileWideNumbersScrolled.play = async ({ canvasElement }) => {
  const firstTable = canvasElement.querySelector("[data-mobile-synced-scroll]");
  if (firstTable) {
    firstTable.scrollLeft = 160;
    firstTable.dispatchEvent(new Event("scroll", { bubbles: true }));
  }
};

function SalaryHeaderTypographyExample({ isMobile = false }) {
  return (
    <Box sx={{ width: isMobile ? 390 : 1600, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        isMobile={isMobile}
        summaryColumns={[
          { key: "price_p_h", label: "За 1ч", accessKey: "1h" },
          { key: "price_p_h_dop", label: "За 1ч + доп.", accessKey: "1h_plus" },
          { key: "dop_bonus", label: "Командный бонус", accessKey: "com_bonus" },
          { key: "h_price", label: "За часы", accessKey: "full_h" },
          { key: "err_price", label: "Ошибки", accessKey: "errors" },
          { key: "my_bonus", label: "Бонус", accessKey: "bonus" },
          { key: "total_sum", label: "Всего", accessKey: "all_price" },
          { key: "withheld", label: "Удержано", accessKey: "withheld" },
          { key: "to_pay_sum", label: "К выплате", accessKey: "test_all_price" },
          { key: "given", label: "Выдано", accessKey: "given" },
          { key: "given_cart", label: "На карты", accessKey: "given_cart" },
          { key: "test_all_price", label: "Премия по ведомости", accessKey: "premia" },
        ]}
      />
    </Box>
  );
}

export const DesktopSalaryHeaderTypography = () => <SalaryHeaderTypographyExample />;
export const MobileSalaryHeaderTypography = () => <SalaryHeaderTypographyExample isMobile />;

async function verifyWholeSalaryHeaderWords({ canvasElement }) {
  const document = canvasElement.ownerDocument;
  await document.fonts.ready;
  const headers = [...canvasElement.querySelectorAll("[data-salary-header-cell]")].filter((cell) =>
    ["Командный бонус", "Премия по ведомости"].includes(cell.textContent.trim()),
  );
  if (headers.length < 2)
    throw new Error("Длинные заголовки финансов должны присутствовать в таблице");

  for (const cell of headers) {
    if (cell.scrollWidth > cell.clientWidth)
      throw new Error("Заголовок не должен выходить за границы ячейки");
    const walker = document.createTreeWalker(cell, 4);
    let textNode;
    while ((textNode = walker.nextNode())) {
      for (const word of textNode.textContent.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(textNode, word.index);
        range.setEnd(textNode, word.index + word[0].length);
        if (range.getClientRects().length > 1)
          throw new Error(`Слово «${word[0]}» не должно дробиться между строками`);
        const bounds = range.getBoundingClientRect();
        const cellBounds = cell.getBoundingClientRect();
        if (bounds.left < cellBounds.left - 1 || bounds.right > cellBounds.right + 1) {
          throw new Error(`Слово «${word[0]}» должно помещаться в ячейке`);
        }
      }
    }
  }
}

DesktopSalaryHeaderTypography.play = verifyWholeSalaryHeaderWords;
MobileSalaryHeaderTypography.play = verifyWholeSalaryHeaderWords;

const salaryPermissionKeys = [
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
];
function SalaryPermissionsExample({ action = null, legacyGroupValue = null, isMobile = false }) {
  const access = {
    ...(action
      ? Object.fromEntries(salaryPermissionKeys.map((key) => [`${key}_${action}`, 1]))
      : {}),
    ...(legacyGroupValue === null
      ? {}
      : Object.fromEntries(
          [
            "salary_block",
            "payroll_actions",
            "schedule_actions",
            "smena_actions",
            "footer_stats",
          ].flatMap((key) =>
            ["access", "view", "edit"].map((suffix) => [`${key}_${suffix}`, legacyGroupValue]),
          ),
        )),
  };
  return (
    <Box sx={{ width: 1200, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        isMobile={isMobile}
        access={access}
        graphKind="other"
        summaryColumns={getVisibleSummaryColumns(access)}
      />
    </Box>
  );
}
export const SalaryNoPermissions = () => <SalaryPermissionsExample />;
export const SalaryViewPermissionsOnly = () => <SalaryPermissionsExample action="view" />;
export const SalaryEditPermissionsWithoutDirectorRole = () => (
  <SalaryPermissionsExample action="edit" />
);
export const RemovedGroupsDoNotGrantAccess = () => (
  <SalaryPermissionsExample legacyGroupValue={1} />
);
export const RemovedGroupsDoNotDenyDetailedAccess = () => (
  <SalaryPermissionsExample
    action="edit"
    legacyGroupValue={0}
  />
);
export const RemovedGroupsIgnoredOnMobile = () => (
  <SalaryPermissionsExample
    action="view"
    legacyGroupValue={0}
    isMobile
  />
);

const payoutColumns = ["price_p_h", "given", "given_cart", "withheld"];
const payoutLabels = ["За 1ч", "Выдано", "На карты", "Удержано"];
function FinancialCellActionsExample({ isMobile = false, permission = "edit" }) {
  const [dialog, setDialog] = useState({ open: false });
  const access =
    permission === "none"
      ? {}
      : Object.fromEntries(
          ["1h", "given", "given_cart", "withheld"].map((key) => [`${key}_${permission}`, 1]),
        );
  const monthId = dayjs().subtract(1, "month").format("YYYY-MM");
  const row = {
    id: 7,
    app_id: 1,
    smena_id: 1,
    user_name: "Беседина А. А.",
    app_name: "Менеджер",
    price_p_h: 300,
    price_arr: [280, 300, 320],
    given: "1250.00",
    given_cart: "1500.00",
    withheld: 500,
    dates: [{ date: `${monthId}-16`, info: { hours: "12" } }],
  };
  return (
    <Box sx={{ width: isMobile ? 390 : 1200, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        isMobile={isMobile}
        access={access}
        graphKind="other"
        monthId={monthId}
        selectedPart={1}
        rows={[
          {
            row: "header",
            data: "1 смена",
            __shiftId: "shift-1",
            __smenaId: 1,
            __employeeCount: 1,
          },
          { data: row },
        ]}
        summaryColumns={getVisibleSummaryColumns(access)}
        onOpenSummaryAction={(selectedRow, mode) =>
          setDialog({
            open: true,
            mode,
            request: {
              user_id: selectedRow.id,
              app_id: selectedRow.app_id,
              smena_id: selectedRow.smena_id,
              date: `${monthId}-16`,
            },
            data: {
              ...buildSummaryActionHeaderData(selectedRow, mode, monthId),
              value: selectedRow[mode],
              label: mode === "withheld" ? "Удержанная сумма" : "Выданная сумма",
              options:
                mode === "price_p_h"
                  ? selectedRow.price_arr.map((id) => ({ id, name: String(id) }))
                  : [],
            },
          })
        }
      />
      <StaffScheduleSummaryActionDialog
        modal={dialog}
        onClose={() => setDialog({ open: false })}
        onSave={() => {}}
      />
    </Box>
  );
}
export const FinancialCellsEditable = () => <FinancialCellActionsExample />;
export const FinancialCellsEditableMobile = () => <FinancialCellActionsExample isMobile />;
export const FinancialCellsViewOnly = () => <FinancialCellActionsExample permission="view" />;
export const FinancialCellsViewOnlyMobile = () => (
  <FinancialCellActionsExample
    permission="view"
    isMobile
  />
);
export const FinancialCellsNoAccess = () => <FinancialCellActionsExample permission="none" />;
export const FinancialCellsNoAccessMobile = () => (
  <FinancialCellActionsExample
    permission="none"
    isMobile
  />
);
export const FinancialCellsBlurred = () => <FinancialCellActionsExample />;
export const FinancialCellsBlurredMobile = () => <FinancialCellActionsExample isMobile />;

const verifyFinancialCellActions = async ({ canvasElement }) => {
  const root = canvasElement.ownerDocument.body;
  for (const [index, column] of payoutColumns.entries()) {
    const cell = canvasElement.querySelector(`td[data-financial-column="${column}"]`);
    await expect(cell).toHaveAttribute("role", "button");
    await expect(cell).toHaveAttribute("tabindex", "0");
    const label = cell.querySelector("[data-financial-value]");
    await expect(getComputedStyle(label).textDecorationStyle).toBe("dotted");
    if (index < 2) {
      cell.focus();
      await userEvent.keyboard(index ? " " : "{Enter}");
    } else await userEvent.click(cell);
    const dialog = await within(root).findByRole("dialog");
    await expect(dialog.querySelector("[data-staff-schedule-finance-header]")).toHaveTextContent(
      payoutLabels[index],
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Отмена", exact: true }));
    await waitFor(() => expect(within(root).queryByRole("dialog")).not.toBeInTheDocument());
  }
};
FinancialCellsEditable.play = verifyFinancialCellActions;
FinancialCellsEditableMobile.play = verifyFinancialCellActions;

const verifyFinancialCellsReadOnly = async ({ canvasElement }) => {
  await expect(canvasElement.querySelector('[data-financial-editable="true"]')).toBeNull();
  for (const cell of canvasElement.querySelectorAll("td[data-financial-column]")) {
    await expect(cell).not.toHaveAttribute("role", "button");
    await userEvent.click(cell);
  }
  await expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).toBeNull();
};
for (const story of [
  FinancialCellsViewOnly,
  FinancialCellsViewOnlyMobile,
  FinancialCellsNoAccess,
  FinancialCellsNoAccessMobile,
]) {
  story.play = verifyFinancialCellsReadOnly;
}
for (const story of [FinancialCellsBlurred, FinancialCellsBlurredMobile]) {
  story.play = async (context) => {
    const label = within(context.canvasElement).getByText("Скрыть финансовые показатели", {
      exact: true,
    });
    const switchInput = label.parentElement.parentElement.querySelector('input[type="checkbox"]');
    await expect(switchInput).not.toBeNull();
    await userEvent.click(switchInput);
    await verifyFinancialCellsReadOnly(context);
  };
}

function TeamBonusHeaderExample({ isMobile = false, readOnly = false }) {
  const [modal, setModal] = useState({ open: false });
  const access = readOnly ? { com_bonus_view: 1 } : { com_bonus_edit: 1 };
  return (
    <Box sx={{ width: isMobile ? 390 : 1200, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        isMobile={isMobile}
        access={access}
        summaryColumns={getVisibleSummaryColumns(access)}
        bonusDayValues={[{ date: "2026-09-16", res: "1000" }]}
        onOpenSummaryAction={(_row, mode) => {
          if (mode === "dop_bonus_toggle") setModal(teamBonusDecisionModals[0]);
        }}
      />
      <StaffScheduleSummaryActionDialog
        modal={modal}
        onClose={() => setModal({ open: false })}
        onSave={() => {}}
      />
    </Box>
  );
}
export const TeamBonusHeaderEntry = () => <TeamBonusHeaderExample />;
export const TeamBonusHeaderMobileEntry = () => <TeamBonusHeaderExample isMobile />;
export const TeamBonusHeaderReadOnly = () => <TeamBonusHeaderExample readOnly />;

TeamBonusHeaderEntry.play = async ({ canvasElement }) => {
  const header = canvasElement.querySelector(
    'button[aria-label="Изменить командный бонус за выбранный период"]',
  );
  if (!header) throw new Error("Командный бонус должен открываться из заголовка");
  header.click();
};
TeamBonusHeaderMobileEntry.play = TeamBonusHeaderEntry.play;
TeamBonusHeaderReadOnly.play = async ({ canvasElement }) => {
  if (
    canvasElement.querySelector('button[aria-label="Изменить командный бонус за выбранный период"]')
  ) {
    throw new Error("Право просмотра не разрешает изменение командного бонуса");
  }
};

function BonusPermissionsExample({ directorTargets = false, viewOnly = false, isMobile = false }) {
  const [dialog, setDialog] = useState({ open: false });
  const access = viewOnly ? { bonus_view: 1 } : { bonus_access: 1 };
  const rows = [
    { row: "header", data: "1 смена", __shiftId: "shift-1", __smenaId: 1, __employeeCount: 2 },
    ...[true, false].map((eligible, index) => ({
      data: {
        id: index + 7,
        app_id: 1,
        smena_id: 1,
        user_name: directorTargets
          ? eligible
            ? "Собственный бонус"
            : "Другой директор"
          : eligible
            ? "Менеджер"
            : "Повар",
        app_name: directorTargets ? "Директор кафе" : eligible ? "Менеджер" : "Повар",
        app_type: directorTargets ? "dir" : eligible ? "manager" : "cook",
        can_edit_bonus: eligible,
        dir_bonus: "300",
        my_bonus: "500",
        dates: [],
      },
    })),
  ];
  return (
    <Box sx={{ width: isMobile ? 390 : 1000, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
        isMobile={isMobile}
        access={access}
        graphKind="other"
        rows={rows}
        selectedPart={1}
        summaryColumns={getVisibleSummaryColumns(access)}
        onOpenSummaryAction={(row, mode) =>
          setDialog({
            open: true,
            mode,
            request: {
              user_id: row.id,
              app_id: row.app_id,
              smena_id: row.smena_id,
              date: "2026-09",
            },
            data: {
              columnLabel: "Бонус",
              periodLabel: "2026-09",
              personName: row.user_name,
              positionName: row.app_name,
              label: "Сумма",
              value: row.dir_bonus,
            },
          })
        }
      />
      <StaffScheduleSummaryActionDialog
        modal={dialog}
        onClose={() => setDialog({ open: false })}
        onSave={() => {}}
      />
    </Box>
  );
}
export const BonusEditableManager = () => <BonusPermissionsExample />;
export const BonusDirectorOwnOnly = () => <BonusPermissionsExample directorTargets />;
export const BonusViewOnly = () => <BonusPermissionsExample viewOnly />;
export const BonusMobileAccess = () => <BonusPermissionsExample isMobile />;

export function HolidayStripeContinuity() {
  return (
    <Stack
      spacing={1.5}
      sx={{ p: 4, color: "#2B2B2B" }}
    >
      <Typography sx={{ fontSize: 16, fontWeight: 500 }}>Бесшовная штриховка</Typography>
      <Box sx={{ display: "flex", width: "max-content" }}>
        {Array.from({ length: 10 }).map((_, index) => (
          <Box
            key={index}
            data-testid={`holiday-day-${index}`}
            sx={{
              width: DAY_COLUMN_WIDTH,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset -1px 0 0 #ECECEC, inset 0 -1px 0 #ECECEC",
              ...getHolidayStripeSx("#FFFFFF", index, DAY_COLUMN_WIDTH),
            }}
          >
            {index + 1}
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
