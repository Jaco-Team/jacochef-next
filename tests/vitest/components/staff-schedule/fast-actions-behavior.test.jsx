import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import useStaffScheduleFastActions from "@/components/staff_schedule/useStaffScheduleFastActions";
import { access, createApi, deferred, monthId, row } from "./page-fixture";

beforeEach(() => vi.setSystemTime(new Date("2026-11-27T12:00:00")));
function renderActions(overrides = {}) {
  const api = createApi();
  const onReload = vi.fn().mockResolvedValue();
  const confirm = vi.fn().mockResolvedValue(true);
  const initialProps = { access, monthId, selectedPart: 1, ...overrides };
  const hook = renderHook(
    (props) =>
      useStaffScheduleFastActions({
        api,
        confirm,
        onReload,
        visibleRows: [{ row: "data", data: row }],
        selectedRowIds: [],
        shiftOptions: [{ id: 10, name: "Первая смена" }],
        ...props,
      }),
    { initialProps },
  );
  return { ...hook, api, confirm, onReload, initialProps };
}
const shiftDraft = { smenaId: 20 };
const allDraft = {
  scheduleScope: "month",
  scheduleType: 1,
  smenaId: 20,
  point: row.other_points[0],
};

test("a current-period draft persists hours, shift and cafe in order with the updated assignment", async () => {
  const { result, api, confirm, onReload } = renderActions();
  act(() => result.current.open(row));
  expect(result.current.state).toMatchObject({ open: true, user: row, shiftLabel: "Первая смена" });
  await act(async () => result.current.saveChanges(allDraft));
  expect(confirm).toHaveBeenCalledOnce();
  expect(api.saveFastTime).toHaveBeenCalledExactlyOnceWith({
    user_id: 7,
    app_id: 5,
    smena_id: 10,
    date: monthId,
    part: 1,
    type: 1,
  });
  expect(api.saveFastSmena).toHaveBeenCalledExactlyOnceWith({
    user_id: 7,
    app_id: 5,
    smena_id: 10,
    date: monthId,
    part: 1,
    new_smena_id: 20,
  });
  expect(api.saveFastPoint).toHaveBeenCalledWith(
    expect.objectContaining({
      user_id: 7,
      app_id: 5,
      smena_id: 20,
      new_point_id: 8,
      new_smena_id: 9,
      date: monthId,
      part: 1,
    }),
  );
  expect(api.saveFastTime.mock.invocationCallOrder[0]).toBeLessThan(
    api.saveFastSmena.mock.invocationCallOrder[0],
  );
  expect(api.saveFastSmena.mock.invocationCallOrder[0]).toBeLessThan(
    api.saveFastPoint.mock.invocationCallOrder[0],
  );
  expect(onReload).toHaveBeenCalledOnce();
  expect(result.current.state.open).toBe(false);
});

test.each([
  ["closed half", { selectedPart: 0 }],
  ["past month", { monthId: "2026-10" }],
  ["no rights", { access: {} }],
])("%s blocks opening and saving a draft", async (_name, context) => {
  const { result, api } = renderActions(context);
  act(() => result.current.open(row));
  await act(async () => result.current.saveChanges(shiftDraft));
  expect(result.current.state.open).toBe(false);
  expect(api.saveFastSmena).not.toHaveBeenCalled();
});

test.each([
  ["month", { monthId: "2026-12" }],
  ["half", { selectedPart: 0 }],
  ["permission", { access: { fast_hours_access: 1 } }],
])("changing %s closes the draft and a cached save cannot persist it", async (_name, change) => {
  const { result, api, rerender, initialProps } = renderActions();
  act(() => result.current.open(row));
  const cachedSave = result.current.saveChanges;
  rerender({ ...initialProps, ...change });
  expect(result.current.state.open).toBe(false);
  await act(async () => cachedSave(shiftDraft));
  expect(api.saveFastSmena).not.toHaveBeenCalled();
});

test.each([
  ["month", { monthId: "2026-12" }],
  ["half", { selectedPart: 0 }],
  ["rights", { access: { fast_hours_access: 1 } }],
])(
  "changing %s during an hours request stops subsequent shift/cafe writes",
  async (_name, change) => {
    const { result, api, rerender, initialProps, onReload } = renderActions();
    const hours = deferred();
    api.saveFastTime.mockReturnValue(hours.promise);
    act(() => result.current.open(row));
    let pending;
    act(() => {
      pending = result.current.saveChanges(allDraft);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(api.saveFastTime).toHaveBeenCalledOnce();
    rerender({ ...initialProps, ...change });
    await act(async () => {
      hours.resolve({ st: true });
      await pending;
    });
    expect(api.saveFastSmena).not.toHaveBeenCalled();
    expect(api.saveFastPoint).not.toHaveBeenCalled();
    expect(onReload).toHaveBeenCalledOnce();
    expect(result.current.state).toMatchObject({ open: false, draft: null, error: "" });
  },
);

test("revocation while awaiting cafe confirmation prevents every write", async () => {
  const { result, api, confirm, rerender, initialProps } = renderActions();
  const acceptance = deferred();
  confirm.mockReturnValue(acceptance.promise);
  act(() => result.current.open(row));
  let pending;
  act(() => {
    pending = result.current.saveChanges(allDraft);
  });
  expect(confirm).toHaveBeenCalledOnce();
  rerender({ ...initialProps, access: {} });
  await act(async () => {
    acceptance.resolve(true);
    await pending;
  });
  for (const method of ["saveFastTime", "saveFastSmena", "saveFastPoint"])
    expect(api[method]).not.toHaveBeenCalled();
  expect(result.current.state.open).toBe(false);
});
