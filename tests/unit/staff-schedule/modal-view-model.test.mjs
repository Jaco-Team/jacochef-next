import test from "node:test";
import assert from "node:assert/strict";
import dayjs from "dayjs";
import { readFileSync } from "node:fs";
import {
  buildDayModalViewModel,
  buildMonthModalViewModel,
  buildSummaryActionHeaderData,
} from "../../../components/staff_schedule/staffScheduleModalViewModel.js";
import { createStaffSchedulePolicy } from "../../../components/staff_schedule/staffScheduleAccess.mjs";
import { getVisibleSummaryColumns } from "../../../components/staff_schedule/staffScheduleHelpers.js";

test("personal finance headers use exact column names and the selected assignment context", () => {
  const row = { user_name: "Беседин А. А.", full_app_name: "Менеджер", app_name: "М" };
  const columns = getVisibleSummaryColumns({
    "1h_view": 1,
    given_view: 1,
    given_cart_view: 1,
    withheld_view: 1,
    bonus_view: 1,
  });
  for (const mode of ["price_p_h", "given", "given_cart", "withheld", "my_bonus"]) {
    const periodLabel = mode === "price_p_h" || mode === "my_bonus" ? "2026-09" : "2026-09-16";
    assert.deepEqual(buildSummaryActionHeaderData(row, mode, periodLabel), {
      columnLabel: columns.find((column) => column.key === mode).label,
      personName: "Беседин А. А.",
      positionName: "Менеджер",
      periodLabel,
    });
  }
  assert.equal(
    buildSummaryActionHeaderData(
      { ...row, full_app_name: "", app_name: "Повар" },
      "given",
      "2026-09-16",
    ).positionName,
    "Повар",
  );
  assert.deepEqual(buildSummaryActionHeaderData(null, "my_bonus"), {
    columnLabel: "Бонус",
    personName: "",
    positionName: "",
    periodLabel: "",
  });
});

test("summary action dialog renders personal metadata only in its adaptive header", () => {
  const source = readFileSync(
    new URL(
      "../../../components/staff_schedule/modals/StaffScheduleSummaryActionDialog.jsx",
      import.meta.url,
    ),
    "utf8",
  );
  const header = source.slice(
    source.indexOf("const modalTitle"),
    source.indexOf("const initialValue"),
  );
  const content = source.slice(
    source.indexOf("<Stack spacing={2} data-staff-schedule-finance-content>"),
  );
  for (const key of ["columnLabel", "periodLabel", "personName", "positionName"]) {
    assert.match(header, new RegExp(`modal\\.data\\.${key}`));
    assert.doesNotMatch(content, new RegExp(`modal\\.data\\.${key}`));
  }
  assert.doesNotMatch(content, /modal\.data\.title/);
  assert.match(source, /titleContainerSx=\{hasPersonalHeader \? \{ height: "auto"/);
  assert.match(source, /mobileTitleContainerSx=\{hasPersonalHeader \? \{ minHeight: 72/);
  assert.match(header, /modal\?\.data\?\.title \|\| "Изменение"/);
});

test("finance dialogs retain verified bonus assignment and use header metadata for all personal modes", () => {
  const source = readFileSync(
    new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url),
    "utf8",
  );
  const handler = source.slice(
    source.indexOf("const handleOpenSummaryAction"),
    source.indexOf("const handleCloseSummaryAction"),
  );
  assert.equal((handler.match(/buildSummaryActionHeaderData\(row, key,/g) || []).length, 4);
  assert.match(handler, /buildSummaryActionHeaderData\(currentRow, key, monthId\)/);
  assert.match(handler, /value: currentRow\?\.dir_bonus \?\? ""/);
  assert.match(handler, /fullAmount: getAvailablePayoutAmount\(row, accessRef\.current, "given"\)/);
  assert.match(
    handler,
    /fullAmount: getAvailablePayoutAmount\(row, accessRef\.current, "given_cart"\)/,
  );
});

test("buildDayModalViewModel reads assignment fields from the day payload", () => {
  const model = buildDayModalViewModel({
    h_info: {
      date: "2026-09-11",
      new_app: 12,
      mentor_id: 34,
      user_temp: "36,6",
      type_healf: 2,
      user: {
        user_name: "Орифов Д. О.",
        app_name: "Повар",
      },
    },
    other_app: [{ id: 12, name: "Повар" }],
  });

  assert.equal(model.newApp, 12);
  assert.equal(model.mentorId, 34);
  assert.equal(model.userTemp, "36,6");
  assert.equal(model.typeHealf, 2);
});

test("buildDayModalViewModel enables all day fields without hours for an authorized manager today", () => {
  const model = buildDayModalViewModel(
    { h_info: { date: dayjs().format("YYYY-MM-DD"), hours: [], user: {} } },
    { roleKind: "manager", canEditDay: true },
  );

  assert.equal(model.canEditAssignment, true);
  assert.equal(model.canEditHours, true);
  assert.equal(model.canEditHealth, true);
});

test("day model preserves past data/history while every editing section is read-only", () => {
  const response = {
    h_info: {
      date: "2026-09-15",
      user: { user_name: "Сотрудник", app_name: "Менеджер" },
      new_app: 2,
      mentor_id: 3,
      user_temp: "36,6",
      type_healf: 2,
      hours: [{ time_start: "10:00", time_end: "22:00" }],
      hist: [
        {
          date: "2026-09-15T08:00:00",
          user_name: "Директор",
          items: [{ time_start: "10:00", time_end: "22:00" }],
        },
      ],
    },
  };
  for (const roleKind of ["dir", "MEGA", "mega_dir", "manager"]) {
    const model = buildDayModalViewModel(response, {
      roleKind,
      canEditDay: true,
      checkPeriod: 1,
      referenceDate: "2026-09-16",
      access: { full_day_access: 1 },
    });
    assert.equal(model.date, "2026-09-15");
    assert.equal(model.isPastPeriod, true);
    assert.equal(model.canEditHours, false);
    assert.equal(model.canEditAssignment, false);
    assert.equal(model.canEditHealth, false);
    assert.equal(model.mentorId, 3);
    assert.equal(model.hours.length, 1);
    assert.equal(model.history.length, 1);
  }
});

test("day modal and page independently defend cached edit flags and stale context", () => {
  const modal = readFileSync(
    new URL("../../../components/staff_schedule/modals/StaffScheduleDayModal.jsx", import.meta.url),
    "utf8",
  );
  const page = readFileSync(
    new URL("../../../components/staff_schedule/useStaffSchedulePage.js", import.meta.url),
    "utf8",
  );
  assert.match(modal, /const dayDate = modal\.request\?\.date \|\| modal\.data\?\.date/);
  for (const section of ["Hours", "Assignment", "Health"]) {
    assert.match(
      modal,
      new RegExp(
        `const canEdit${section} = isPeriodEditable && Boolean\\(modal\\.data\\?\\.canEdit${section}\\)`,
      ),
    );
  }
  assert.match(modal, /\{onRemove \? <JacoIconButton/);
  assert.match(modal, /\{canSave \? <JacoButton/);
  assert.match(modal, /\{canEditHours \? <Grid/);
  assert.match(modal, /open=\{isAddTimeOpen && canEditHours\}/);
  assert.match(modal, /current\.request === modal\.request/);
  assert.match(
    modal,
    /isEditableDayHalfPeriod\(current\.request\?\.date \|\| current\.data\?\.date\)/,
  );
  assert.match(modal, /if \(!isCurrentDayEditable\("canEditHours"\)\) return/g);
  assert.match(modal, /Прошедший период — только просмотр/);
  assert.match(modal, /\{canSave \? "Отменить" : "Закрыть"\}/);
  assert.match(
    page,
    /buildAuthorizedDaySavePayload\(\{ request, payload, access: accessRef\.current/,
  );
  assert.match(page, /api\.saveUserDay\(buildCurrentPayload\(\)\)/);
  assert.match(page, /generation === dayRequestGeneration\.current/);
  assert.match(page, /if \(!isCurrentContext\(\)\) return;\s*handleCloseDayModal\(\)/);
});

test("buildMonthModalViewModel forwards recent custom ranges without changing month days", () => {
  const model = buildMonthModalViewModel({
    h_info: { user: {} },
    hours_days: [{ date: "2026-09-20", type: 3, time_start: "11:00", time_end: "17:00" }],
    recent_custom_hours: [{ time_start: "12:00", time_end: "19:00" }],
  });

  assert.deepEqual(model.recentCustomHours, [{ time_start: "12:00", time_end: "19:00" }]);
  assert.equal(model.days.length, 1);
});

test("buildMonthModalViewModel keeps loaded month hours without stale period summary", () => {
  const model = buildMonthModalViewModel(
    {
      h_info: { user: { user_name: "Сотрудник", app_name: "Повар" } },
      hours_days: [{ date: "2026-10-05", type: 3, time_start: "10:00", time_end: "22:00" }],
    },
    { monthId: "2026-10", hasPeriodSummary: false },
  );

  assert.equal(model.hasPeriodSummary, false);
  assert.equal(model.personName, "Сотрудник");
  assert.deepEqual(
    model.days.map((day) => day.date),
    ["2026-10-05"],
  );
});

test("month permissions are role-independent and financial fields stay individually masked", () => {
  const response = {
    h_info: {
      user: {
        total_sum: 900,
        to_pay_sum: 700,
        premium_sheet: 30,
        price_p_h: 300,
        given: 50,
        given_cart: 150,
      },
    },
  };
  for (const roleKind of ["manager", "dir", "other", "MEGA", "mega_dir"]) {
    const context = {
      roleKind,
      monthId: dayjs().format("YYYY-MM"),
      access: { full_month_access: 1, all_price_view: 1 },
    };
    const granted = buildMonthModalViewModel(response, context);
    assert.equal(granted.canEditMonth, true);
    assert.equal(granted.summary.total, 900);
    assert.equal(granted.summary.toPay, "");
    assert.equal(granted.summary.ratePerHour, "");
    assert.equal(granted.summary.transferred, "");
    assert.equal(
      buildMonthModalViewModel(response, { ...context, access: {} }).canEditMonth,
      false,
    );
    assert.equal(
      buildMonthModalViewModel(response, {
        ...context,
        access: { full_month_access: 1, all_price_view: 1, salary_block_view: 0 },
      }).summary.total,
      900,
    );
  }
  const zero = buildMonthModalViewModel(
    { h_info: { user: { total_sum: 0, to_pay_sum: "", premium_sheet: 0, h_price: 1000 } } },
    { access: { all_price_view: 1, test_all_price_view: 1, premia_view: 1 } },
  );
  assert.equal(zero.summary.total, 0);
  assert.equal(zero.summary.toPay, "");
  assert.equal(zero.summary.premiumSheet, 0);
});

test("an other-role user with full-month day access may edit today without a dedicated role exception", () => {
  const policy = createStaffSchedulePolicy({ full_month_access: 1 });
  const model = buildDayModalViewModel(
    { h_info: { date: dayjs().format("YYYY-MM-DD"), user: {}, hours: [] } },
    { roleKind: "other", canEditDay: policy.canOpenDayCard },
  );
  assert.equal(model.canEditHours, true);
  assert.equal(model.canEditAssignment, true);
  assert.equal(model.canEditHealth, true);
});

test("day bonus is visible only through its detailed finance permission, not group or role", () => {
  const response = { show_bonus: 1, h_info: { user: { bonus: 555 } } };
  for (const roleKind of ["manager", "other", "dir", "MEGA"]) {
    assert.equal(buildDayModalViewModel(response, { roleKind, access: {} }).bonusValue, "");
    assert.equal(
      buildDayModalViewModel(response, { roleKind, access: { bonus_view: 1 } }).bonusValue,
      555,
    );
    assert.equal(
      buildDayModalViewModel(response, { roleKind, access: { bonus_edit: 1 } }).bonusValue,
      555,
    );
    assert.equal(
      buildDayModalViewModel(response, {
        roleKind,
        access: { bonus_access: 1, salary_block_view: 0 },
      }).bonusValue,
      555,
    );
  }
});
