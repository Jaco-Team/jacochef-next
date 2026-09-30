import test from "node:test";
import assert from "node:assert/strict";
import dayjs from "dayjs";
import {
  buildDaySavePayload,
  buildAuthorizedDaySavePayload,
  buildMonthSavePayload,
  canEditDayHealth,
  canEditDayPeriod,
  canEditMonthByRole,
  findInvalidTimeRangeIds,
  findOverlappingTimeRangeIds,
  getTimeRangeValidationError,
  isEditableMonthDay,
  isEditableDayHalfPeriod,
  isClosedDayHalfPeriod,
  isDayDraftComplete,
  timeRangesOverlap,
} from "../../../components/staff_schedule/staffScheduleModalCore.mjs";

test("canEditDayPeriod follows day access and role-specific date rules", () => {
  const today = "2026-09-29";
  const yesterday = "2026-09-28";
  const tomorrow = "2026-09-30";
  const referenceDate = today;
  const canEditDay = true;

  const check = (context) => canEditDayPeriod({ ...context, referenceDate });
  assert.equal(check({ date: yesterday, roleKind: "MEGA", canEditDay }), true);
  assert.equal(check({ date: yesterday, roleKind: "mega_dir", canEditDay }), true);
  assert.equal(check({ date: yesterday, roleKind: "dir", canEditDay }), true);
  assert.equal(check({ date: tomorrow, roleKind: "dir_other", canEditDay }), true);
  assert.equal(check({ date: today, roleKind: "manager", canEditDay }), true);
  assert.equal(check({ date: tomorrow, roleKind: "manager", canEditDay }), false);
  assert.equal(check({ date: yesterday, roleKind: "manager", checkPeriod: 1, canEditDay }), false);
  assert.equal(check({ date: tomorrow, roleKind: "other", canEditDay }), true);
  assert.equal(
    check({ date: tomorrow, roleKind: "other", canEditDay, hasDedicatedDayEdit: true }),
    true,
  );
  assert.equal(check({ date: tomorrow, roleKind: "manager" }), false);
});

test("canEditDayHealth follows the day edit gate without requiring hours", () => {
  const today = "2026-09-29";
  const yesterday = "2026-09-28";
  const check = (context) => canEditDayHealth({ ...context, referenceDate: today });

  assert.equal(check({ date: today, roleKind: "manager", hours: [], canEditDay: true }), true);
  assert.equal(check({ date: yesterday, roleKind: "manager", hours: [], canEditDay: true }), false);
  assert.equal(check({ date: yesterday, roleKind: "dir", hours: [], canEditDay: true }), true);
  assert.equal(check({ date: yesterday, roleKind: "dir", hours: [] }), false);
});

test("completed half-month days are view-only before every role or check_period exception", () => {
  for (const roleKind of ["MEGA", "mega_dir", "dir", "dir_other", "manager", "other"]) {
    for (const date of ["2026-08-31", "2026-09-01", "2026-09-15"]) {
      const context = {
        date,
        roleKind,
        canEditDay: true,
        checkPeriod: 1,
        referenceDate: "2026-09-16",
      };
      assert.equal(canEditDayPeriod(context), false);
      assert.equal(canEditDayHealth(context), false);
    }
  }
  assert.equal(
    canEditDayPeriod({
      date: "2026-09-14",
      roleKind: "dir",
      canEditDay: true,
      referenceDate: "2026-09-15",
    }),
    true,
  );
  assert.equal(
    canEditDayPeriod({
      date: "2026-09-16",
      roleKind: "dir",
      canEditDay: true,
      referenceDate: "2026-09-30",
    }),
    true,
  );
  assert.equal(
    canEditDayPeriod({
      date: "2026-09-16",
      roleKind: "dir",
      canEditDay: true,
      referenceDate: "2026-10-01",
    }),
    false,
  );
});

test("day-derived half-period gate is strict and calendar-correct", () => {
  for (const [date, referenceDate, editable] of [
    ["2026-09-01", "2026-09-15", true],
    ["2026-09-15", "2026-09-16", false],
    ["2026-09-16", "2026-09-16", true],
    ["2026-09-16", "2026-09-30", true],
    ["2026-09-30", "2026-10-01", false],
    ["2028-02-16", "2028-02-29", true],
    ["2028-02-29", "2028-03-01", false],
    ["2026-02-28", "2026-03-01", false],
    ["2026-12-31", "2027-01-01", false],
    ["2027-01-01", "2026-12-31", true],
  ]) {
    assert.equal(
      isEditableDayHalfPeriod(date, referenceDate),
      editable,
      `${date} at ${referenceDate}`,
    );
    assert.equal(isClosedDayHalfPeriod(date, referenceDate), !editable);
  }
  for (const date of [
    null,
    undefined,
    "",
    "2026-02-30",
    "2026-9-15",
    "2026-09",
    "2026-09-15T12:00:00",
    "15.09.2026",
  ]) {
    assert.equal(isEditableDayHalfPeriod(date, "2026-09-15"), false);
    assert.equal(
      canEditDayPeriod({
        date,
        roleKind: "MEGA",
        canEditDay: true,
        checkPeriod: 1,
        referenceDate: "2026-09-15",
      }),
      false,
    );
  }
});

test("day save rechecks current rights, role, actual date and ignores caller edit flags", () => {
  const request = { date: "2026-09-15", user_id: 7, app_id: 2, smena_id: 3, point_id: 4 };
  const payload = {
    ...request,
    new_app: 2,
    mentor_id: "",
    user_temp: "36,6",
    type_healf: 2,
    hours: [{ time_start: "10:00", time_end: "22:00" }],
    canEditHours: true,
    canEditHealth: true,
    canEditAssignment: true,
  };
  const context = {
    request,
    payload,
    access: { full_day_access: 1 },
    roleKind: "dir",
    referenceDate: "2026-09-15",
  };
  const result = buildAuthorizedDaySavePayload(context);
  assert.equal(result.canEditHours, undefined);
  assert.deepEqual(result.hours, payload.hours);
  assert.throws(
    () => buildAuthorizedDaySavePayload({ ...context, referenceDate: "2026-09-16" }),
    /только просмотр/,
  );
  assert.throws(() => buildAuthorizedDaySavePayload({ ...context, access: {} }), /Нет доступа/);
  assert.throws(
    () =>
      buildAuthorizedDaySavePayload({
        ...context,
        roleKind: "manager",
        referenceDate: "2026-09-14",
      }),
    /Нет доступа/,
  );
  for (const field of ["date", "user_id", "app_id", "smena_id", "point_id"]) {
    assert.throws(
      () =>
        buildAuthorizedDaySavePayload({
          ...context,
          payload: { ...payload, [field]: "different" },
        }),
      /Откройте карточку/,
    );
  }
});

test("canEditMonthByRole prevents editing past months for every role", () => {
  const lastMonth = dayjs().subtract(1, "month").format("YYYY-MM");
  const currentMonth = dayjs().format("YYYY-MM");
  const nextMonth = dayjs().add(1, "month").format("YYYY-MM");

  assert.equal(canEditMonthByRole({ roleKind: "mega", monthId: lastMonth }), false);
  assert.equal(canEditMonthByRole({ roleKind: "mega_dir", monthId: lastMonth }), false);
  assert.equal(canEditMonthByRole({ roleKind: "dir", monthId: currentMonth }), true);
  assert.equal(canEditMonthByRole({ roleKind: "manager", monthId: nextMonth }), true);
});

test("isEditableMonthDay allows today and future, but not past or malformed dates", () => {
  const today = dayjs();

  assert.equal(isEditableMonthDay(today.subtract(1, "day").format("YYYY-MM-DD"), today), false);
  assert.equal(isEditableMonthDay(today.format("YYYY-MM-DD"), today), true);
  assert.equal(isEditableMonthDay(today.add(1, "day").format("YYYY-MM-DD"), today), true);
  assert.equal(isEditableMonthDay("2026-02-30", today), false);
  assert.equal(isEditableMonthDay("", today), false);
});

test("timeRangesOverlap detects intersections but allows adjacent ranges", () => {
  assert.equal(
    timeRangesOverlap(
      { time_start: "10:00", time_end: "13:30" },
      { time_start: "10:00", time_end: "22:00" },
    ),
    true,
  );
  assert.equal(
    timeRangesOverlap(
      { time_start: "10:00", time_end: "13:30" },
      { time_start: "13:30", time_end: "22:00" },
    ),
    false,
  );
});

test("time range validation rejects equal, reversed, and out-of-day values", () => {
  assert.equal(
    getTimeRangeValidationError({ time_start: "10:00", time_end: "10:00" }),
    "Время окончания должно быть позже начала. Переход через полночь недоступен.",
  );
  assert.equal(
    getTimeRangeValidationError({ time_start: "23:00", time_end: "22:00" }),
    "Время окончания должно быть позже начала. Переход через полночь недоступен.",
  );
  assert.equal(
    getTimeRangeValidationError({ time_start: "23:00", time_end: "24:00" }),
    "Укажите корректное время начала и окончания.",
  );
  assert.equal(getTimeRangeValidationError({ time_start: "10:00", time_end: "22:00" }), "");
});

test("findInvalidTimeRangeIds marks ranges that cross midnight", () => {
  assert.deepEqual(
    [...findInvalidTimeRangeIds([{ id: "invalid", time_start: "23:00", time_end: "22:00" }])],
    ["invalid"],
  );
});

test("findOverlappingTimeRangeIds marks every conflicting row", () => {
  const overlappingIds = findOverlappingTimeRangeIds([
    { id: "first", time_start: "10:00", time_end: "13:30" },
    { id: "second", time_start: "10:00", time_end: "22:00" },
    { id: "third", time_start: "22:00", time_end: "23:00" },
  ]);

  assert.deepEqual([...overlappingIds], ["first", "second"]);
});

test("isDayDraftComplete requires visible selections and a numeric temperature", () => {
  const options = {
    canEditAssignment: true,
    canEditHealth: true,
    canEditHours: true,
    originalHoursCount: 0,
    appOptions: [{ id: 2, name: "Повар" }],
    healthOptions: [{ id: 2, name: "Здоров" }],
  };
  const draft = {
    newApp: 2,
    mentorId: "",
    userTemp: "36,6",
    typeHealf: 2,
    hours: [{ time_start: "10:00", time_end: "22:00" }],
  };

  assert.equal(isDayDraftComplete({ ...options, draft }), true);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, newApp: "" } }), false);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, userTemp: "," } }), false);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, userTemp: "36," } }), false);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, userTemp: "36" } }), true);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, userTemp: "36.6" } }), true);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, typeHealf: "none" } }), false);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, typeHealf: 9 } }), false);
  assert.equal(isDayDraftComplete({ ...options, draft: { ...draft, hours: [] } }), false);
  assert.equal(
    isDayDraftComplete({
      ...options,
      draft: { ...draft, hours: [{ time_start: "22:00", time_end: "10:00" }] },
    }),
    false,
  );
});

test("isDayDraftComplete permits deleting all hours when the day initially had time", () => {
  const draft = { newApp: "", mentorId: "", userTemp: "37,0", typeHealf: 2, hours: [] };

  assert.equal(
    isDayDraftComplete({
      draft,
      originalHoursCount: 1,
      canEditAssignment: true,
      canEditHealth: true,
      canEditHours: true,
      appOptions: [],
      healthOptions: [{ id: 2, name: "Здоров" }],
    }),
    true,
  );
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
  const nextMonth = dayjs().add(1, "month");
  const date = nextMonth.date(1).format("YYYY-MM-DD");
  const payload = buildMonthSavePayload(
    {
      date: nextMonth.format("YYYY-MM"),
      user_id: 11,
      app_id: 12,
      smena_id: 13,
      canEditMonth: false,
    },
    {
      newApp: "4",
      mentorId: "7",
      dates: [{ date, type: "3", time_start: "11:00", time_end: "17:00" }],
    },
  );

  assert.deepEqual(payload, {
    date: nextMonth.format("YYYY-MM"),
    user_id: 11,
    app_id: 12,
    smena_id: 13,
    dates: [{ date, type: 3, time_start: "11:00", time_end: "17:00" }],
  });
});

test("buildMonthSavePayload excludes yesterday and older while preserving today and future", () => {
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const payload = buildMonthSavePayload(
    { date: dayjs().format("YYYY-MM"), user_id: 11 },
    {
      dates: [yesterday, today, tomorrow].map((date) => ({
        date,
        type: 3,
        time_start: "11:00",
        time_end: "17:00",
      })),
    },
  );

  assert.deepEqual(
    payload.dates.map((item) => item.date),
    [today, tomorrow],
  );
});
