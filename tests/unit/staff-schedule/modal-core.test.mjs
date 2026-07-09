import test from "node:test";
import assert from "node:assert/strict";
import dayjs from "dayjs";
import {
  buildDaySavePayload,
  buildMonthSavePayload,
  canEditDayHealth,
  canEditDayPeriod,
  canEditMonthByRole,
} from "../../../components/staff_schedule/staffScheduleModalCore.mjs";

test("canEditDayPeriod allows mega roles, future days, and open payroll period", () => {
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  assert.equal(canEditDayPeriod({ date: yesterday, roleKind: "MEGA", checkPeriod: 0 }), true);
  assert.equal(canEditDayPeriod({ date: yesterday, roleKind: "mega_dir", checkPeriod: 0 }), true);
  assert.equal(canEditDayPeriod({ date: tomorrow, roleKind: "manager", checkPeriod: 0 }), true);
  assert.equal(canEditDayPeriod({ date: yesterday, roleKind: "manager", checkPeriod: 1 }), true);
  assert.equal(canEditDayPeriod({ date: yesterday, roleKind: "manager", checkPeriod: 0 }), false);
});

test("canEditDayHealth is today-only and requires hours", () => {
  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  assert.equal(
    canEditDayHealth({ date: today, hours: [{ time_start: "10:00", time_end: "22:00" }] }),
    true,
  );
  assert.equal(canEditDayHealth({ date: today, hours: [] }), false);
  assert.equal(
    canEditDayHealth({ date: yesterday, hours: [{ time_start: "10:00", time_end: "22:00" }] }),
    false,
  );
});

test("canEditMonthByRole keeps past months mega-only", () => {
  const lastMonth = dayjs().subtract(1, "month").format("YYYY-MM");
  const nextMonth = dayjs().add(1, "month").format("YYYY-MM");

  assert.equal(canEditMonthByRole({ roleKind: "mega", monthId: lastMonth }), true);
  assert.equal(canEditMonthByRole({ roleKind: "mega_dir", monthId: lastMonth }), false);
  assert.equal(canEditMonthByRole({ roleKind: "manager", monthId: nextMonth }), true);
});

test("buildDaySavePayload emits only the editable sections", () => {
  const payload = buildDaySavePayload(
    {
      date: "2026-07-09",
      user_id: 11,
      app_id: 12,
      smena_id: 13,
      point_id: 14,
      canEditAssignment: true,
      canEditHours: true,
      canEditHealth: true,
    },
    {
      newApp: "2",
      mentorId: "none",
      userTemp: "36,6",
      typeHealf: 2,
      hours: [{ time_start: "10:00", time_end: "22:00" }],
    },
  );

  assert.deepEqual(payload, {
    date: "2026-07-09",
    user_id: 11,
    app_id: 12,
    smena_id: 13,
    point_id: 14,
    new_app: "2",
    mentor_id: "",
    user_temp: "36,6",
    type_healf: 2,
    hours: [{ time_start: "10:00", time_end: "22:00" }],
  });
});

test("buildMonthSavePayload keeps assignment fields behind canEditMonth", () => {
  const payload = buildMonthSavePayload(
    {
      date: "2026-07",
      user_id: 11,
      app_id: 12,
      smena_id: 13,
      canEditMonth: false,
    },
    {
      newApp: "4",
      mentorId: "7",
      dates: [{ date: "2026-07-01", type: "3", time_start: "11:00", time_end: "17:00" }],
    },
  );

  assert.deepEqual(payload, {
    date: "2026-07",
    user_id: 11,
    app_id: 12,
    smena_id: 13,
    dates: [{ date: "2026-07-01", type: 3, time_start: "11:00", time_end: "17:00" }],
  });
});
