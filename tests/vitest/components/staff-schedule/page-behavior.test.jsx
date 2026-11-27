import { act, renderHook, waitFor, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../render";
import useStaffSchedulePage from "@/components/staff_schedule/useStaffSchedulePage";
import {
  access,
  createApi,
  dayResponse,
  deferred,
  graphResponse,
  monthId,
  monthResponse,
  row,
} from "./page-fixture";

const boundary = vi.hoisted(() => ({ api: null }));
vi.mock("@/components/staff_schedule/useStaffScheduleApi", () => ({ default: () => boundary.api }));

beforeEach(() => {
  vi.setSystemTime(new Date("2026-11-27T12:00:00"));
  boundary.api = createApi();
});
async function renderPage(rights = access, graph = {}) {
  boundary.api.getAll.mockResolvedValue({
    point_list: [{ id: 3, name: "Кафе" }],
    months: [{ id: monthId, is_active: 1 }, { id: "2026-12" }],
    access: rights,
  });
  boundary.api.getGraph.mockImplementation(async () => graphResponse({ access: rights, ...graph }));
  const hook = renderHook(() => useStaffSchedulePage());
  await waitFor(() => expect(hook.result.current.isBootstrapping).toBe(false));
  expect(hook.result.current.error).toBe("");
  expect(hook.result.current.monthId).toBe(monthId);
  expect(hook.result.current.selectedPart).toBe(1);
  return { ...hook, api: boundary.api };
}
async function expectRejected(action, message) {
  await act(async () => {
    await expect(action()).rejects.toThrow(message);
  });
}
function summaryPayload(result, value = 250) {
  const { mode, request } = result.current.summaryActionModal;
  return { mode, request, value };
}

// Replaces the page-handler half of the legacy bonus source-contract check.
test("bonus uses the current graph row value and all three assignment identifiers, then saves", async () => {
  const { result, api } = await renderPage();
  act(() =>
    result.current.handleOpenSummaryAction(
      { ...row, dir_bonus: 999, can_edit_bonus: 0 },
      "my_bonus",
    ),
  );
  expect(result.current.summaryActionModal).toMatchObject({
    open: true,
    mode: "my_bonus",
    data: { value: 120 },
    request: { date: monthId, user_id: 7, app_id: 5, smena_id: 10 },
  });
  const payload = summaryPayload(result, 275);
  await act(async () => result.current.handleSaveSummaryAction(payload));
  expect(api.saveDirBonus).toHaveBeenCalledExactlyOnceWith({
    date: monthId,
    user_id: 7,
    app_id: 5,
    smena_id: 10,
    bonus: 275,
  });
  expect(result.current.summaryActionModal.open).toBe(false);
  expect(api.getGraph).toHaveBeenCalledTimes(2);
});

test.each(["id", "app_id", "smena_id"])(
  "bonus rejects missing %s and forged assignment identifiers",
  async (key) => {
    const { result, api } = await renderPage();
    act(() => result.current.handleOpenSummaryAction({ ...row, [key]: undefined }, "my_bonus"));
    expect(result.current.summaryActionModal.open).toBe(false);
    act(() => result.current.handleOpenSummaryAction({ ...row, [key]: 999 }, "my_bonus"));
    expect(result.current.summaryActionModal.open).toBe(false);
    expect(api.saveDirBonus).not.toHaveBeenCalled();
  },
);

test.each([
  ["capability", { can_edit_bonus: 0 }],
  ["hidden finance", { finance_hidden: 1 }],
])(
  "bonus cannot open when the current graph row has %s restriction",
  async (_name, restriction) => {
    const { result, api } = await renderPage(access, {
      two: [{ row: "data", data: { ...row, ...restriction } }],
    });
    act(() => result.current.handleOpenSummaryAction(row, "my_bonus"));
    expect(result.current.summaryActionModal.open).toBe(false);
    expect(api.saveDirBonus).not.toHaveBeenCalled();
  },
);

test.each(["rights", "half", "month", "graph capability", "graph identity"])(
  "bonus dialog closes after %s changes and its old save is rejected",
  async (change) => {
    const { result, api } = await renderPage();
    act(() => result.current.handleOpenSummaryAction(row, "my_bonus"));
    expect(result.current.summaryActionModal.open).toBe(true);
    const cachedSave = result.current.handleSaveSummaryAction;
    const payload = summaryPayload(result);
    if (change === "rights") act(() => result.current.setAccess({ ...access, bonus_edit: 0 }));
    if (change === "half") act(() => result.current.setSelectedPart(0));
    if (change === "month") {
      await act(async () => result.current.handleMonthChange({ target: { value: "2026-12" } }));
      await waitFor(() => expect(result.current.monthId).toBe("2026-12"));
    }
    if (change.startsWith("graph")) {
      const nextRow =
        change === "graph capability" ? { ...row, can_edit_bonus: 0 } : { ...row, app_id: 55 };
      api.getGraph.mockResolvedValueOnce(graphResponse({ two: [{ row: "data", data: nextRow }] }));
      await act(async () => result.current.handleReload());
    }
    expect(result.current.summaryActionModal.open).toBe(false);
    await expectRejected(() => cachedSave(payload), /Нет доступа/);
    expect(api.saveDirBonus).not.toHaveBeenCalled();
    if (change === "half") {
      act(() => result.current.handleOpenSummaryAction(row, "my_bonus"));
      expect(result.current.summaryActionModal.open).toBe(false);
    }
  },
);

test("bonus rejects a reconstructed request or an old request after reopening the dialog", async () => {
  const { result, api } = await renderPage();
  act(() => result.current.handleOpenSummaryAction(row, "my_bonus"));
  const original = summaryPayload(result);
  await expectRejected(
    () => result.current.handleSaveSummaryAction({ ...original, request: { ...original.request } }),
    /Нет доступа/,
  );
  act(() => {
    result.current.handleCloseSummaryAction();
    result.current.handleOpenSummaryAction(row, "my_bonus");
  });
  await expectRejected(() => result.current.handleSaveSummaryAction(original), /Нет доступа/);
  expect(api.saveDirBonus).not.toHaveBeenCalled();
});

// Replaces hook selection/state checks in the legacy quick-controls contract.
test("selection toggles only with fast-action access and revocation clears selection and the draft", async () => {
  const { result, api } = await renderPage({});
  act(() => {
    result.current.handleToggleRowSelection("7-5-10");
    result.current.handleOpenFastActions(row);
  });
  expect(result.current.selectedRowIds).toEqual([]);
  expect(result.current.fastActions.open).toBe(false);
  act(() => result.current.setAccess(access));
  act(() => {
    result.current.handleToggleRowSelection("7-5-10");
    result.current.handleOpenFastActions(row);
  });
  expect(result.current.selectedRowIds).toEqual(["7-5-10"]);
  expect(result.current.fastActions.open).toBe(true);
  act(() => result.current.handleToggleRowSelection("7-5-10"));
  expect(result.current.selectedRowIds).toEqual([]);
  act(() => result.current.handleToggleRowSelection("7-5-10"));
  act(() => result.current.setAccess({}));
  expect(result.current.selectedRowIds).toEqual([]);
  expect(result.current.fastActions.open).toBe(false);
  expect(api.saveFastSmena).not.toHaveBeenCalled();
});

test("switching to a closed half clears selection, closes quick actions and blocks new selection", async () => {
  const { result } = await renderPage();
  act(() => {
    result.current.handleToggleRowSelection("7-5-10");
    result.current.handleOpenFastActions(row);
  });
  act(() => result.current.setSelectedPart(0));
  expect(result.current.selectedRowIds).toEqual([]);
  expect(result.current.fastActions.open).toBe(false);
  act(() => result.current.handleToggleRowSelection("7-5-10"));
  expect(result.current.selectedRowIds).toEqual([]);
});

const financeModes = [
  ["price_p_h", "1h_edit", "saveUserPriceH", "price"],
  ["given", "given_edit", "saveUserGivePrice", "give_price"],
  ["given_cart", "given_cart_edit", "saveUserGiveCartPrice", "give_price"],
  ["withheld", "withheld_edit", "saveUserWithheld", "withheld"],
];
test.each(financeModes)(
  "%s opens/saves by permission, independently of the selected role",
  async (mode, _permission, method, valueKey) => {
    const { result, api } = await renderPage();
    act(() => result.current.setDevRoleKind("unknown-role"));
    act(() => result.current.handleOpenSummaryAction(row, mode));
    expect(result.current.summaryActionModal.open).toBe(true);
    const payload = summaryPayload(result, 90);
    await act(async () => result.current.handleSaveSummaryAction(payload));
    expect(api[method]).toHaveBeenCalledExactlyOnceWith({ ...payload.request, [valueKey]: 90 });
  },
);

test.each(financeModes)(
  "%s denies opening/saving without rights and rechecks a cached save after revocation",
  async (mode, permission, method) => {
    const { result, api } = await renderPage({});
    act(() => result.current.setDevRoleKind("dir"));
    act(() => result.current.handleOpenSummaryAction(row, mode));
    expect(result.current.summaryActionModal.open).toBe(false);
    await expectRejected(
      () => result.current.handleSaveSummaryAction({ mode, request: {}, value: 90 }),
      /Нет доступа/,
    );
    act(() => result.current.setAccess({ [permission]: 1 }));
    act(() => result.current.handleOpenSummaryAction(row, mode));
    expect(result.current.summaryActionModal.open).toBe(true);
    const payload = summaryPayload(result);
    const cachedSave = result.current.handleSaveSummaryAction;
    act(() => result.current.setAccess({}));
    expect(result.current.summaryActionModal.open).toBe(false);
    await expectRejected(() => cachedSave(payload), /Нет доступа/);
    expect(api[method]).not.toHaveBeenCalled();
  },
);

test("month open and save require current permissions, including a cached save after revocation", async () => {
  const { result, api } = await renderPage({});
  await act(async () => result.current.handleOpenMonthModal(row));
  expect(api.getUserMonth).not.toHaveBeenCalled();
  await expectRejected(() => result.current.handleSaveMonthModal({ dates: [] }), /Нет доступа/);
  act(() => result.current.setAccess({ full_month_access: 1 }));
  await act(async () => result.current.handleOpenMonthModal(row));
  expect(api.getUserMonth).toHaveBeenCalledExactlyOnceWith({
    user_id: 7,
    app_id: 5,
    smena_id: 10,
    date: monthId,
    date_start: "2026-11-16",
  });
  expect(result.current.monthModal).toMatchObject({
    open: true,
    loading: false,
    data: { canEditMonth: true },
  });
  const cachedSave = result.current.handleSaveMonthModal;
  act(() => result.current.setAccess({}));
  expect(result.current.monthModal.open).toBe(false);
  await expectRejected(() => cachedSave({ dates: [] }), /Нет доступа/);
  expect(api.saveUserMonth).not.toHaveBeenCalled();
});

test("month save persists with current permissions and closes the modal", async () => {
  const { result, api } = await renderPage();
  await act(async () => result.current.handleOpenMonthModal(row));
  const payload = { ...result.current.monthModal.request, dates: [] };
  await act(async () => result.current.handleSaveMonthModal(payload));
  expect(api.saveUserMonth).toHaveBeenCalledExactlyOnceWith(payload);
  expect(result.current.monthModal.open).toBe(false);
});

// Revoking financial reads must invalidate modal snapshots even if card-opening rights stay.
test("revoking one finance read closes all cached financial modals and blocks their old writes", async () => {
  const { result, api } = await renderPage();
  await act(async () => {
    await result.current.handleOpenDayModal(row, "2026-11-27");
    await result.current.handleOpenMonthModal(row);
  });
  act(() => result.current.handleOpenSummaryAction(row, "given"));
  expect(result.current.dayModal.open).toBe(true);
  expect(result.current.monthModal.open).toBe(true);
  expect(result.current.summaryActionModal.open).toBe(true);
  const saveDay = result.current.handleSaveDayModal;
  const saveMonth = result.current.handleSaveMonthModal;
  const saveSummary = result.current.handleSaveSummaryAction;
  const summary = summaryPayload(result);
  act(() => result.current.setAccess({ ...access, all_price_view: 0 }));
  expect(result.current.access.full_day_access).toBe(1);
  expect(result.current.access.given_edit).toBe(1);
  for (const modal of ["dayModal", "monthModal", "summaryActionModal"])
    expect(result.current[modal]).toMatchObject({ open: false, data: null, request: null });
  await expectRejected(() => saveDay({ hours: [] }), /Данные дня изменились/);
  await expectRejected(() => saveMonth({ dates: [] }), /Нет доступа/);
  await expectRejected(() => saveSummary(summary), /Нет доступа/);
  expect(api.saveUserDay).not.toHaveBeenCalled();
  expect(api.saveUserMonth).not.toHaveBeenCalled();
  expect(api.saveUserGivePrice).not.toHaveBeenCalled();
});

test.each(["resolve", "reject"])(
  "late day/month requests cannot reopen after financial-read revocation (%s)",
  async (completion) => {
    const { result, api } = await renderPage();
    const day = deferred();
    const month = deferred();
    api.getUserDay.mockReturnValue(day.promise);
    api.getUserMonth.mockReturnValue(month.promise);
    let pendingDay;
    let pendingMonth;
    act(() => {
      pendingDay = result.current.handleOpenDayModal(row, "2026-11-27");
      pendingMonth = result.current.handleOpenMonthModal(row);
    });
    expect(result.current.dayModal.loading).toBe(true);
    expect(result.current.monthModal.loading).toBe(true);
    act(() => result.current.setAccess({ ...access, all_price_view: 0 }));
    await act(async () => {
      if (completion === "resolve") {
        day.resolve(dayResponse);
        month.resolve(monthResponse);
      } else {
        day.reject(new Error("Old day request"));
        month.reject(new Error("Old month request"));
      }
      await Promise.all([pendingDay, pendingMonth]);
    });
    for (const modal of ["dayModal", "monthModal"])
      expect(result.current[modal]).toMatchObject({
        open: false,
        loading: false,
        error: "",
        data: null,
      });
    expect(api.saveUserDay).not.toHaveBeenCalled();
    expect(api.saveUserMonth).not.toHaveBeenCalled();
  },
);

test("period team bonus opens and saves the selected cafe, half and month", async () => {
  const { result, api } = await renderPage({ com_bonus_edit: 1 });
  act(() => result.current.handleOpenSummaryAction(null, "dop_bonus_toggle"));
  expect(result.current.summaryActionModal).toMatchObject({
    open: true,
    mode: "dop_bonus_toggle",
    request: { date: monthId, part: 1, point_id: 3 },
  });
  const payload = summaryPayload(result, 1);
  await act(async () => result.current.handleSaveSummaryAction(payload));
  expect(api.saveDopBonus).toHaveBeenCalledExactlyOnceWith({
    date: monthId,
    part: 1,
    point_id: 3,
    type: 1,
  });
  expect(result.current.summaryActionModal.open).toBe(false);
});

test("team bonus entry and period save are denied without their detailed permission", async () => {
  const { result, api } = await renderPage({});
  await act(async () => result.current.handleChangeTeamBonusForUser(row));
  act(() => result.current.handleOpenSummaryAction(null, "dop_bonus_toggle"));
  expect(result.current.summaryActionModal.open).toBe(false);
  await expectRejected(
    () =>
      result.current.handleSaveSummaryAction({ mode: "dop_bonus_toggle", request: {}, value: 1 }),
    /Нет доступа/,
  );
  expect(api.saveDopBonusUser).not.toHaveBeenCalled();
  expect(api.saveDopBonus).not.toHaveBeenCalled();
});

test.each([false, true])(
  "employee team bonus rechecks permission after real confirmation (revoked: %s)",
  async (revoked) => {
    const { result, api } = await renderPage({ com_bonus_edit: 1 });
    const user = userEvent.setup();
    let pending;
    act(() => {
      pending = result.current.handleChangeTeamBonusForUser(row);
    });
    const ConfirmDialog = result.current.ConfirmDialog;
    renderWithProviders(<ConfirmDialog />);
    expect(screen.getByRole("dialog")).toBeVisible();
    if (revoked) act(() => result.current.setAccess({}));
    await user.click(screen.getByRole("button", { name: "Выдать", exact: true }));
    await act(async () => pending);
    if (revoked) {
      expect(api.saveDopBonusUser).not.toHaveBeenCalled();
      expect(result.current.error).toBe("Нет доступа к командному бонусу");
    } else {
      expect(api.saveDopBonusUser).toHaveBeenCalledExactlyOnceWith({
        point_id: 3,
        user_id: 7,
        smena_id: 10,
        app_id: 5,
        part: 1,
        data: monthId,
        type: 1,
      });
    }
  },
);

function dayPayload(result, overrides = {}) {
  return {
    ...result.current.dayModal.request,
    new_app: "none",
    mentor_id: 2,
    user_temp: "36.6",
    type_healf: 2,
    hours: [{ id: "local-range", time_start: "10:00", time_end: "18:00" }],
    ...overrides,
  };
}

test("day save authorizes the current request and sends only the API payload fields", async () => {
  const { result, api } = await renderPage();
  await act(async () => result.current.handleOpenDayModal(row, "2026-11-27"));
  expect(result.current.dayModal.data).toMatchObject({
    canEditHours: true,
    canEditAssignment: true,
    canEditHealth: true,
  });
  const payload = dayPayload(result, { canEditHours: true, privileged: true });
  await act(async () => result.current.handleSaveDayModal(payload));
  expect(api.saveUserDay).toHaveBeenCalledExactlyOnceWith({
    date: "2026-11-27",
    user_id: 7,
    app_id: 5,
    smena_id: 10,
    point_id: 3,
    new_app: "",
    mentor_id: 2,
    hours: [{ time_start: "10:00", time_end: "18:00" }],
    user_temp: "36.6",
    type_healf: 2,
  });
  expect(result.current.dayModal.open).toBe(false);
  expect(api.getGraph).toHaveBeenCalledTimes(2);
});

test("day open/save is denied without current permissions even with caller-supplied edit flags", async () => {
  const { result, api } = await renderPage({});
  await act(async () => result.current.handleOpenDayModal(row, "2026-11-27"));
  expect(result.current.dayModal.open).toBe(false);
  expect(api.getUserDay).not.toHaveBeenCalled();
  await expectRejected(
    () => result.current.handleSaveDayModal({ canEditHours: true, canEditHealth: true, hours: [] }),
    /Данные дня изменились/,
  );
  expect(api.saveUserDay).not.toHaveBeenCalled();
});

test("day save rejects a substituted employee identity before any API write", async () => {
  const { result, api } = await renderPage();
  await act(async () => result.current.handleOpenDayModal(row, "2026-11-27"));
  await expectRejected(
    () => result.current.handleSaveDayModal(dayPayload(result, { user_id: 999 })),
    /Данные дня изменились/,
  );
  expect(api.saveUserDay).not.toHaveBeenCalled();
  expect(result.current.dayModal.open).toBe(true);
});

test("day save rechecks the actual half-period after cached edit flags were loaded", async () => {
  const { result, api } = await renderPage();
  await act(async () => result.current.handleOpenDayModal(row, "2026-11-27"));
  const payload = dayPayload(result);
  expect(result.current.dayModal.data.canEditHours).toBe(true);
  vi.setSystemTime(new Date("2026-12-01T12:00:00"));
  await expectRejected(
    () => result.current.handleSaveDayModal(payload),
    /Прошедший период — только просмотр/,
  );
  expect(api.saveUserDay).not.toHaveBeenCalled();
});

test("day save rechecks the current role rather than cached edit flags", async () => {
  const { result, api } = await renderPage();
  api.getUserDay.mockResolvedValueOnce({ h_info: { ...dayResponse.h_info, date: "2026-11-26" } });
  await act(async () => result.current.handleOpenDayModal(row, "2026-11-26"));
  expect(result.current.dayModal.data.canEditHours).toBe(true);
  const payload = dayPayload(result);
  act(() => result.current.setDevRoleKind("manager"));
  await expectRejected(
    () => result.current.handleSaveDayModal(payload),
    /Нет доступа к редактированию дня/,
  );
  expect(api.saveUserDay).not.toHaveBeenCalled();
});

test("a previous day save completing after a half switch cannot close the new day or reload its graph", async () => {
  const { result, api } = await renderPage();
  await act(async () => result.current.handleOpenDayModal(row, "2026-11-27"));
  const response = deferred();
  api.saveUserDay.mockReturnValue(response.promise);
  let pending;
  act(() => {
    pending = result.current.handleSaveDayModal(dayPayload(result));
  });
  expect(api.saveUserDay).toHaveBeenCalledOnce();
  act(() => result.current.setSelectedPart(0));
  expect(result.current.dayModal.open).toBe(false);
  act(() => result.current.setSelectedPart(1));
  api.getUserDay.mockResolvedValueOnce({ h_info: { ...dayResponse.h_info, date: "2026-11-28" } });
  await act(async () => result.current.handleOpenDayModal(row, "2026-11-28"));
  const nextRequest = result.current.dayModal.request;
  expect(result.current.dayModal).toMatchObject({ open: true, request: { date: "2026-11-28" } });
  await act(async () => {
    response.resolve({ st: true });
    await pending;
  });
  expect(result.current.dayModal.open).toBe(true);
  expect(result.current.dayModal.request).toBe(nextRequest);
  expect(result.current.dayModal.data.date).toBe("2026-11-28");
  expect(api.getGraph).toHaveBeenCalledOnce();
});
