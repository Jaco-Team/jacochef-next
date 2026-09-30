import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCommonFastActionOptions,
  assertFastActionRequestAccess,
  buildFastActionRequests,
  clearCompletedFastAction,
  canEditFastHoursPeriod,
  hasFastActionDraftChanges,
  persistFastActionRequests,
} from "../../../components/staff_schedule/staffScheduleFastActionsCore.mjs";

const access = { fast_hours_access: 1, fast_smena_access: 1, fast_point_access: 1 };
const cafe = { point_id: 8, smena_id: 9, name: "Кафе" };
const users = [
  {
    id: 1,
    app_id: 5,
    smena_id: 10,
    other_smens: [{ id: 20, name: "Вторая" }],
    other_points: [cafe],
  },
  {
    id: 2,
    app_id: 6,
    smena_id: 20,
    other_smens: [
      { id: 10, name: "Первая" },
      { id: 30, name: "Третья" },
    ],
    other_points: [cafe, { point_id: 80, smena_id: 90, name: "Другое" }],
  },
];
const context = {
  mode: "bulk",
  users,
  access,
  monthId: "2026-09",
  selectedPart: 1,
  referenceDate: "2026-09-01",
};

test("bulk targets use intersection and allow an existing assignment as a no-op for that row", () => {
  const options = buildCommonFastActionOptions(users);
  assert.deepEqual(
    options.smenaOptions.map((item) => item.id),
    [20, 10],
  );
  assert.deepEqual(
    options.pointOptions.map((item) => item.id),
    ["8-9"],
  );
  assert.deepEqual(buildCommonFastActionOptions([]), { smenaOptions: [], pointOptions: [] });
});

test("missing upstream targets do not inherit the first selected employee's targets", () => {
  const options = buildCommonFastActionOptions([users[0], { id: 3, app_id: 6, smena_id: 30 }]);
  assert.deepEqual(options, { smenaOptions: [], pointOptions: [] });
});

test("display-only Free sentinel and malformed identities are not selectable targets", () => {
  const selected = [
    {
      ...users[0],
      other_smens: [
        { id: -1, name: "Свободные" },
        { id: 0, name: "Пустая" },
      ],
      other_points: [
        { point_id: 8, smena_id: -1 },
        { point_id: 0, smena_id: 9 },
      ],
    },
  ];
  assert.deepEqual(buildCommonFastActionOptions(selected), { smenaOptions: [], pointOptions: [] });
  assert.throws(
    () => buildFastActionRequests({ ...context, users: selected, draft: { smenaId: -1 } }),
    /недоступна/,
  );
  assert.deepEqual(buildCommonFastActionOptions([{ other_smens: null, other_points: {} }]), {
    smenaOptions: [],
    pointOptions: [],
  });
});

test("mixed bulk shift applies even if the first selected employee already has that shift", () => {
  const draft = { smenaId: 10 };
  assert.equal(hasFastActionDraftChanges(draft, users), true);
  const [request] = buildFastActionRequests({ ...context, draft });
  assert.equal(request.method, "saveFastSmena");
  assert.deepEqual(request.payload.users, [
    { user_id: 1, app_id: 5, smena_id: 10 },
    { user_id: 2, app_id: 6, smena_id: 20 },
  ]);
});

test("bulk payload keeps distinct app rows and sends hours, shift, cafe in sequence", () => {
  const selected = [users[0], { ...users[0], app_id: 6 }];
  const requests = buildFastActionRequests({
    ...context,
    users: selected,
    draft: {
      scheduleScope: "week",
      scheduleType: 16,
      smenaId: 20,
      point: cafe,
    },
  });
  assert.deepEqual(
    requests.map((item) => item.method),
    ["saveFastTimeArrTwoWeek", "saveFastSmena", "saveFastPoint"],
  );
  assert.deepEqual(requests[2].payload.users, [
    { user_id: 1, app_id: 5, smena_id: 20 },
    { user_id: 1, app_id: 6, smena_id: 20 },
  ]);
  assert.equal(requests[1].payload.part, 1);
  assert.equal(requests[0].payload.part, 1);
  assert.equal(requests[2].payload.date, context.monthId);
  assert.equal(requests[2].payload.part, 1);
});

test("single save keeps scalar contract; shift part matches zero-based table period", () => {
  for (const selectedPart of [0, 1]) {
    const requests = buildFastActionRequests({
      ...context,
      selectedPart,
      users: [users[0]],
      mode: "single",
      draft: {
        scheduleScope: "month",
        scheduleType: 1,
        smenaId: 20,
        point: cafe,
      },
    });
    assert.equal(requests[0].method, "saveFastTime");
    assert.equal(requests[0].payload.part, selectedPart);
    assert.equal(requests[1].payload.part, selectedPart);
    assert.equal(requests[1].payload.user_id, 1);
    assert.equal(requests[1].payload.users, undefined);
    assert.equal(requests[2].payload.smena_id, 20);
    assert.equal(requests[2].payload.date, context.monthId);
    assert.equal(requests[2].payload.part, selectedPart);
  }
});

test("permissions are checked for each requested operation before any save", () => {
  for (const draft of [
    { scheduleType: 16, scheduleScope: "week" },
    { smenaId: 10 },
    { point: cafe },
  ]) {
    assert.throws(() => buildFastActionRequests({ ...context, access: {}, draft }), /Нет доступа/);
  }
  assert.throws(
    () => buildFastActionRequests({ ...context, users: [], draft: {} }),
    /Выберите сотрудников/,
  );
  assert.deepEqual(buildFastActionRequests({ ...context, draft: {} }), []);
});

test("targets inaccessible to any selected row cannot be saved", () => {
  assert.throws(
    () => buildFastActionRequests({ ...context, draft: { smenaId: 30 } }),
    /недоступна/,
  );
  assert.throws(
    () => buildFastActionRequests({ ...context, draft: { point: { point_id: 80, smena_id: 90 } } }),
    /недоступно/,
  );
});

test("changing selected staff retains staged choices and validates them against the remaining rows", () => {
  const draft = { scheduleScope: "month", scheduleType: 1, smenaId: 20, point: cafe };
  assert.equal(buildFastActionRequests({ ...context, draft, users: users.slice(0, 1) }).length, 3);
  assert.deepEqual(draft, { scheduleScope: "month", scheduleType: 1, smenaId: 20, point: cafe });
});

test("partial failure checkpoints successful operations and does not invoke later ones", async () => {
  const requests = buildFastActionRequests({
    ...context,
    draft: { scheduleScope: "month", scheduleType: 1, smenaId: 10, point: cafe },
  });
  const calls = [];
  let draft = { scheduleScope: "month", scheduleType: 1, smenaId: 10, point: cafe };
  const api = {
    saveFastTimeArrMounth: async () => {
      calls.push("hours");
      return { st: true };
    },
    saveFastSmena: async () => {
      calls.push("shift");
      return { st: false, text: "Ошибка смены" };
    },
    saveFastPoint: async () => {
      calls.push("cafe");
      return { st: true };
    },
  };
  await assert.rejects(
    persistFastActionRequests(api, requests, (request) => {
      draft = clearCompletedFastAction(draft, request.action);
    }),
    (error) => error.message === "Ошибка смены" && error.completedActions.join() === "Часы",
  );
  assert.deepEqual(calls, ["hours", "shift"]);
  assert.equal(draft.scheduleType, null);
  assert.equal(draft.smenaId, 10);
  assert.equal(buildFastActionRequests({ ...context, draft })[0].method, "saveFastSmena");
});

test("successful shift is checkpointed as cafe source and not retried after cafe failure", async () => {
  let selected = [users[0]];
  let draft = { scheduleScope: "month", scheduleType: 1, smenaId: 20, point: cafe };
  const requests = buildFastActionRequests({ ...context, users: selected, draft });
  await assert.rejects(
    persistFastActionRequests(
      {
        saveFastTimeArrMounth: async () => ({ st: true }),
        saveFastSmena: async () => ({ st: true }),
        saveFastPoint: async () => ({ st: false, text: "Ошибка кафе" }),
      },
      requests,
      (request) => {
        draft = clearCompletedFastAction(draft, request.action);
        if (request.action === "shift")
          selected = selected.map((item) => ({ ...item, smena_id: request.payload.new_smena_id }));
      },
    ),
    (error) => error.completedActions.join() === "Часы,Смена",
  );
  const retry = buildFastActionRequests({ ...context, users: selected, draft });
  assert.deepEqual(
    retry.map((item) => item.method),
    ["saveFastPoint"],
  );
  assert.equal(retry[0].payload.users[0].smena_id, 20);
});

test("missing success acknowledgment never clears a staged action", async () => {
  let checkpointed = false;
  await assert.rejects(
    persistFastActionRequests(
      { saveFastSmena: async () => undefined },
      [
        {
          method: "saveFastSmena",
          action: "shift",
          label: "Смена",
          payload: {},
        },
      ],
      () => {
        checkpointed = true;
      },
    ),
    /Не удалось сохранить/,
  );
  assert.equal(checkpointed, false);
});

test("each quick action permission is independent in all eight combinations", () => {
  const actions = [
    {
      key: "fast_hours",
      draft: { scheduleScope: "month", scheduleType: 1 },
      method: "saveFastTimeArrMounth",
    },
    { key: "fast_smena", draft: { smenaId: 10 }, method: "saveFastSmena" },
    { key: "fast_point", draft: { point: cafe }, method: "saveFastPoint" },
  ];
  for (let mask = 0; mask < 8; mask += 1) {
    const flags = Object.fromEntries(
      actions.map(({ key }, index) => [`${key}_access`, (mask >> index) & 1]),
    );
    for (const [index, { draft, method }] of actions.entries()) {
      const build = () => buildFastActionRequests({ ...context, access: flags, draft });
      if ((mask >> index) & 1) assert.equal(build()[0].method, method);
      else assert.throws(build, /Нет доступа/);
    }
  }
});

test("hours access grants both scopes, but legacy/view/edit and revoked staged rights cannot save", () => {
  for (const [scheduleScope, scheduleType] of [
    ["month", 1],
    ["week", 16],
  ]) {
    const draft = { scheduleScope, scheduleType };
    assert.equal(
      buildFastActionRequests({ ...context, access: { fast_hours_access: 1 }, draft }).length,
      1,
    );
    for (const flags of [
      { fast_month_access: 1, fast_2_week_access: 1 },
      { fast_hours_view: 1 },
      { fast_hours_edit: 1 },
      { fast_smena_access: 1 },
    ]) {
      assert.throws(
        () => buildFastActionRequests({ ...context, access: flags, draft }),
        /Нет доступа/,
      );
    }
  }
  assert.throws(
    () => buildFastActionRequests({ ...context, access: {}, draft: {} }),
    /Нет доступа/,
  );
  const staged = { scheduleScope: "month", scheduleType: 1, point: cafe };
  assert.throws(
    () => buildFastActionRequests({ ...context, access: { fast_hours_access: 1 }, draft: staged }),
    /кафе/,
  );
});

test("hours periods permit today/future only without a role exemption", () => {
  assert.equal(canEditFastHoursPeriod("2026-09", "month", 0, "2026-09-30"), false);
  assert.equal(canEditFastHoursPeriod("2026-09", "week", 0, "2026-09-16"), false);
  assert.equal(canEditFastHoursPeriod("2026-09", "week", 0, "2026-09-15"), true);
  assert.equal(canEditFastHoursPeriod("2026-09", "week", 1, "2026-09-30"), true);
  assert.equal(canEditFastHoursPeriod("2026-08", "month", 0, "2026-09-01"), false);
  assert.equal(canEditFastHoursPeriod("2026-10", "month", 0, "2026-09-30"), true);
  assert.equal(canEditFastHoursPeriod("2026-13", "month", 0, "2026-09-30"), false);
  assert.throws(
    () =>
      buildFastActionRequests({
        ...context,
        referenceDate: "2026-10-01",
        draft: { scheduleScope: "month", scheduleType: 1 },
      }),
    /Прошедший период/,
  );
});

test("all single and bulk actions reject a past selected half, including month-wide hours", () => {
  for (const mode of ["single", "bulk"]) {
    for (const draft of [
      { scheduleScope: "month", scheduleType: 1 },
      { scheduleScope: "week", scheduleType: 16 },
      { smenaId: 10 },
      { point: cafe },
      {},
    ]) {
      assert.throws(
        () =>
          buildFastActionRequests({
            ...context,
            mode,
            selectedPart: 0,
            referenceDate: "2026-09-16",
            draft,
          }),
        /Прошедший период/,
      );
      assert.throws(
        () =>
          buildFastActionRequests({
            ...context,
            mode,
            monthId: "2026-08",
            referenceDate: "2026-09-16",
            draft,
          }),
        /Прошедший период/,
      );
    }
  }
});

test("today and future selected halves retain every allowed action", () => {
  for (const period of [
    { monthId: "2026-09", selectedPart: 0, referenceDate: "2026-09-15" },
    { monthId: "2026-09", selectedPart: 1, referenceDate: "2026-09-30" },
    { monthId: "2026-10", selectedPart: 0, referenceDate: "2026-09-30" },
  ]) {
    const requests = buildFastActionRequests({
      ...context,
      ...period,
      draft: {
        scheduleScope: "month",
        scheduleType: 1,
        smenaId: 10,
        point: cafe,
      },
    });
    assert.equal(requests.length, 3);
  }
});

test("period expiry between sequential requests prevents subsequent writes", async () => {
  const requests = buildFastActionRequests({
    ...context,
    selectedPart: 0,
    referenceDate: "2026-09-15",
    draft: { scheduleScope: "month", scheduleType: 1, point: cafe },
  });
  let referenceDate = "2026-09-15";
  const calls = [];
  await assert.rejects(
    persistFastActionRequests(
      {
        saveFastTimeArrMounth: async () => {
          calls.push("hours");
          return { st: true };
        },
        saveFastPoint: async () => {
          calls.push("cafe");
          return { st: true };
        },
      },
      requests,
      () => {
        referenceDate = "2026-09-16";
      },
      () => {
        buildFastActionRequests({
          ...context,
          selectedPart: 0,
          referenceDate,
          draft: { point: cafe },
        });
      },
    ),
    (error) =>
      error.message === "Прошедший период нельзя изменить" &&
      error.completedActions.join() === "Часы",
  );
  assert.deepEqual(calls, ["hours"]);
});

test("revocation between sequential requests prevents subsequent writes", async () => {
  const requests = buildFastActionRequests({
    ...context,
    draft: {
      scheduleScope: "month",
      scheduleType: 1,
      point: cafe,
    },
  });
  let currentAccess = access;
  const calls = [];
  await assert.rejects(
    persistFastActionRequests(
      {
        saveFastTimeArrMounth: async () => {
          calls.push("hours");
          return { st: true };
        },
        saveFastPoint: async () => {
          calls.push("cafe");
          return { st: true };
        },
      },
      requests,
      () => {
        currentAccess = { fast_hours_access: 1 };
      },
      (request) => assertFastActionRequestAccess(currentAccess, request),
    ),
    /Нет доступа: Кафе/,
  );
  assert.deepEqual(calls, ["hours"]);
});
