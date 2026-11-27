import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import useStaffScheduleExport from "@/components/staff_schedule/useStaffScheduleExport";
import { access, createApi, deferred } from "./page-fixture";

beforeEach(() => vi.setSystemTime(new Date("2026-11-27T12:00:00")));

test.each(["ws", "hj"])(
  "export %s opens and downloads the selected date range with permission",
  async (mode) => {
    const api = createApi();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const { result } = renderHook(() => useStaffScheduleExport({ api, access, pointId: 3 }));
    act(() => result.current.open(mode));
    expect(result.current.dialog).toMatchObject({
      open: true,
      mode,
      dateStart: "2026-11-27",
      dateEnd: "2026-11-27",
    });
    act(() => {
      result.current.setDateStart("2026-11-16");
      result.current.setDateEnd("2026-11-30");
    });
    await act(async () => result.current.download());
    expect(api[mode === "ws" ? "downloadWS" : "downloadHJ"]).toHaveBeenCalledExactlyOnceWith({
      point_id: 3,
      date_start: "2026-11-16",
      date_end: "2026-11-30",
    });
    expect(click).toHaveBeenCalledOnce();
    expect(result.current.dialog.open).toBe(false);
  },
);

test.each(["ws", "hj"])("export %s cannot open or download without access", async (mode) => {
  const api = createApi();
  const { result } = renderHook(() => useStaffScheduleExport({ api, access: {}, pointId: 3 }));
  act(() => result.current.open(mode));
  await act(async () => result.current.download());
  expect(result.current.dialog.open).toBe(false);
  expect(api.downloadWS).not.toHaveBeenCalled();
  expect(api.downloadHJ).not.toHaveBeenCalled();
});

test("revoking export access closes the dialog and blocks its cached download callback", async () => {
  const api = createApi();
  const { result, rerender } = renderHook(
    ({ rights }) => useStaffScheduleExport({ api, access: rights, pointId: 3 }),
    { initialProps: { rights: access } },
  );
  act(() => result.current.open("ws"));
  const cachedDownload = result.current.download;
  rerender({ rights: {} });
  expect(result.current.dialog.open).toBe(false);
  await act(async () => cachedDownload());
  expect(api.downloadWS).not.toHaveBeenCalled();
});

test("an export response arriving after revocation cannot download a file or reopen the dialog", async () => {
  const api = createApi();
  const response = deferred();
  api.downloadHJ.mockReturnValue(response.promise);
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  const { result, rerender } = renderHook(
    ({ rights }) => useStaffScheduleExport({ api, access: rights, pointId: 3 }),
    { initialProps: { rights: access } },
  );
  act(() => result.current.open("hj"));
  let pending;
  act(() => {
    pending = result.current.download();
  });
  expect(api.downloadHJ).toHaveBeenCalledOnce();
  rerender({ rights: {} });
  await act(async () => {
    response.resolve({ url: "http://chef.test/private.xlsx" });
    await pending;
  });
  expect(click).not.toHaveBeenCalled();
  expect(result.current.dialog).toMatchObject({ open: false, loading: false, error: "" });
});
