import dayjs from "dayjs";
import { Box, Stack, Typography } from "@mui/material";

import StaffScheduleExportDialog from "@/components/staff_schedule/modals/StaffScheduleExportDialog";
import StaffScheduleFastActionsDialog from "@/components/staff_schedule/modals/StaffScheduleFastActionsDialog";
import StaffScheduleDayModal from "@/components/staff_schedule/modals/StaffScheduleDayModal";
import StaffScheduleColorLegendModal from "@/components/staff_schedule/sections/StaffScheduleColorLegendModal";
import StaffScheduleMobileTableSection from "@/components/staff_schedule/sections/StaffScheduleMobileTableSection";
import StaffScheduleTableSection from "@/components/staff_schedule/sections/StaffScheduleTableSection";
import { DAY_COLUMN_WIDTH } from "@/components/staff_schedule/staffScheduleConstants";
import { getHolidayStripeSx } from "@/components/staff_schedule/staffSchedulePatterns";

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
        fast_month_access: 1,
        fast_2_week_access: 1,
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

export function EmployeeDayDialog() {
  return (
    <StaffScheduleDayModal
      modal={{
        open: true,
        loading: false,
        error: "",
        request: { user_id: 7, date: "2026-09-16" },
        data: {
          personName: "Беседина Г. М.",
          positionName: "Менеджер",
          dateLabel: "16 сентября 2026",
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
          canEditAssignment: true,
          canEditHealth: true,
          canEditHours: true,
        },
      }}
      onClose={() => {}}
      onSave={() => {}}
    />
  );
}

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
  { row: "header", data: "1 смена", __shiftId: "shift-1", __smenaId: 1 },
  {
    data: {
      id: 7,
      smena_id: 1,
      user_name: "Беседина Г. М.",
      app_name: "Менеджер",
      dates: [{ date: "16", info: { hours: "08:00" } }],
    },
  },
  {
    data: {
      id: 8,
      smena_id: 1,
      user_name: "Орифов Д. О.",
      app_name: "Повар",
      dates: [{ date: "16", info: { hours: "06:00" } }],
    },
  },
  { row: "header", data: "2 смена", __shiftId: "shift-2", __smenaId: 2 },
  {
    data: {
      id: 9,
      smena_id: 2,
      user_name: "Юкова В. Л.",
      app_name: "Менеджер",
      dates: [{ date: "16", info: { hours: "10:00" } }],
    },
  },
];

function EmployeeSearchSchedule({ isMobile = false, summaryColumns = [] }) {
  return (
    <StaffScheduleTableSection
      period={{ meta: { days: [{ day: "Ср", date: "16" }] } }}
      rows={employeeSearchRows}
      shownShiftCount={2}
      summaryColumns={summaryColumns}
      access={{}}
      graphKind="latest"
      directorLevel={0}
      periodBonusState={0}
      selectedPart={0}
      onOpenDay={() => {}}
      onOpenMonth={() => {}}
      onOpenFastActions={() => {}}
      onOpenSummaryAction={() => {}}
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

export function EmployeeSearchFilter() {
  return (
    <Box sx={{ width: 440, maxWidth: "100%", p: 1.5 }}>
      <EmployeeSearchSchedule isMobile />
    </Box>
  );
}

export function DesktopSalaryHeaderTypography() {
  return (
    <Box sx={{ width: 1600, maxWidth: "100%", p: 2 }}>
      <EmployeeSearchSchedule
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
