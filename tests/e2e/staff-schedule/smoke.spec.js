const { test, expect, request: playwrightRequest } = require("@playwright/test");
const dayjs = require("dayjs");
const { loadLocalEnv } = require("../support/localEnv");
const { StaffScheduleApi } = require("../support/staffScheduleApi");
const { StaffSchedulePage } = require("../support/staffSchedulePage");

test.describe("staff_schedule local smoke", () => {
  let env;
  let apiContext;
  let api;
  let bootstrap;
  let activePoint;
  let activeMonth;
  let alternatePoint;
  let alternateMonth;
  let graph;
  let sampleRow;

  test.beforeAll(async () => {
    env = await loadLocalEnv();
    apiContext = await playwrightRequest.newContext({
      ignoreHTTPSErrors: true,
      timeout: 30000,
    });
    api = new StaffScheduleApi(apiContext, env);

    bootstrap = await api.bootstrap();
    activePoint = bootstrap.point_list?.[0];
    activeMonth =
      bootstrap.months?.find((item) => Number(item?.is_active) === 1) || bootstrap.months?.[0];
    alternatePoint =
      bootstrap.point_list?.find((item) => item?.id !== activePoint?.id) || activePoint;
    alternateMonth = bootstrap.months?.find((item) => item?.id !== activeMonth?.id) || activeMonth;
    graph = await api.graph(activePoint.id, activeMonth.id);
    sampleRow = ((((graph.date || {}).one || {}).users || {}).users || []).find(
      (item) => item && item.row !== "header" && item.id && item.app_id && item.smena_id,
    );
  });

  test.afterAll(async () => {
    await apiContext?.dispose();
  });

  test("uses only local FE/API", async () => {
    expect(env.feBaseUrl).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):/);
    expect(env.apiBaseUrl).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):/);
  });

  test("bootstrap and graph endpoints work on local data", async () => {
    expect(Array.isArray(bootstrap.point_list)).toBeTruthy();
    expect(Array.isArray(bootstrap.months)).toBeTruthy();
    expect(activePoint?.id).toBeTruthy();
    expect(activeMonth?.id).toBeTruthy();
    expect(graph?.st).not.toBe(false);

    const altPointGraph = await api.graph(alternatePoint.id, activeMonth.id);
    const altMonthGraph = await api.graph(activePoint.id, alternateMonth.id);

    expect(altPointGraph?.st).not.toBe(false);
    expect(altMonthGraph?.st).not.toBe(false);
  });

  test("page loads and reload button triggers local get_graph", async ({ page }) => {
    const localApiHosts = [];
    page.on("request", (request) => {
      if (request.url().includes("/staff_schedule/")) {
        localApiHosts.push(new URL(request.url()).hostname);
      }
    });

    const schedulePage = new StaffSchedulePage(page, env);
    await schedulePage.bootstrapSession();
    await schedulePage.goto();
    await schedulePage.expectLoaded();
    await schedulePage.reloadAndWaitForGraph();

    expect(
      localApiHosts.every((host) => host === "localhost" || host === "127.0.0.1"),
    ).toBeTruthy();
  });

  test("day and month read endpoints open on current-month sample row", async () => {
    expect(sampleRow).toBeTruthy();

    const dayPayload = await api.getUserDay({
      date: `${activeMonth.id}-01`,
      date_start: sampleRow.date,
      user_id: sampleRow.id,
      app_id: sampleRow.app_id,
      smena_id: sampleRow.smena_id,
    });

    const monthPayload = await api.getUserMonth({
      date: activeMonth.id,
      date_start: sampleRow.date,
      user_id: sampleRow.id,
      app_id: sampleRow.app_id,
      smena_id: sampleRow.smena_id,
    });

    expect(dayPayload?.st).not.toBe(false);
    expect(monthPayload?.st).not.toBe(false);
  });

  test("unchanged-safe mutation endpoints complete on local data", async () => {
    const dayRequest = {
      date: `${activeMonth.id}-01`,
      date_start: sampleRow.date,
      user_id: sampleRow.id,
      app_id: sampleRow.app_id,
      smena_id: sampleRow.smena_id,
    };
    const dayPayload = await api.getUserDay(dayRequest);
    const monthRequest = {
      date: activeMonth.id,
      date_start: sampleRow.date,
      user_id: sampleRow.id,
      app_id: sampleRow.app_id,
      smena_id: sampleRow.smena_id,
    };
    const monthPayload = await api.getUserMonth(monthRequest);
    const dayHours = Array.isArray(dayPayload?.h_info?.hours)
      ? dayPayload.h_info.hours.map((item) => ({
          time_start: item?.time_start ?? "",
          time_end: item?.time_end ?? "",
        }))
      : [];
    const isTodayRequest = dayjs(dayRequest.date).isSame(dayjs(), "day");
    const canSendHealth = isTodayRequest && dayHours.length > 0;

    await api.call("save_user_day", {
      ...dayRequest,
      point_id: activePoint.id,
      new_app: dayPayload?.h_info?.user?.new_app ?? "",
      mentor_id: dayPayload?.h_info?.user?.mentor_id ?? "",
      ...(canSendHealth
        ? {
            user_temp: dayPayload?.h_info?.user?.user_temp ?? "",
            type_healf: dayPayload?.h_info?.user?.type_healf ?? "",
          }
        : {}),
      hours: dayHours,
    });

    await api.call("save_user_month", {
      ...monthRequest,
      new_app: monthPayload?.h_info?.user?.new_app ?? "",
      mentor_id: monthPayload?.h_info?.user?.mentor_id ?? "",
      dates: Array.isArray(monthPayload?.hours_days)
        ? monthPayload.hours_days.map((item) => ({
            date: item?.date ?? "",
            type: Number(item?.type ?? 0),
            time_start: item?.time_start ?? "",
            time_end: item?.time_end ?? "",
          }))
        : [],
    });

    await api.call("save_userPriceH", {
      date: activeMonth.id,
      part: 0,
      user_id: sampleRow.id,
      app_id: sampleRow.app_id,
      smena_id: sampleRow.smena_id,
      price: sampleRow.price_p_h,
    });

    await api.call("save_dir_lv", {
      point_id: activePoint.id,
      date: activeMonth.id,
      dir_lv: graph.add_lv ?? 0,
    });

    const giveResult = await api.call(
      "save_user_give_price",
      {
        date: `${activeMonth.id}-01`,
        user_id: sampleRow.id,
        app_id: sampleRow.app_id,
        smena_id: sampleRow.smena_id,
        give_price: sampleRow.given ?? sampleRow.given_cash ?? 0,
      },
      { allowAppError: true },
    );

    const giveCartResult = await api.call(
      "save_user_give_cart_price",
      {
        date: `${activeMonth.id}-01`,
        user_id: sampleRow.id,
        app_id: sampleRow.app_id,
        smena_id: sampleRow.smena_id,
        give_price: sampleRow.given_cart ?? 0,
      },
      { allowAppError: true },
    );

    const withheldResult = await api.call(
      "save_user_withheld",
      {
        date: `${activeMonth.id}-01`,
        user_id: sampleRow.id,
        app_id: sampleRow.app_id,
        smena_id: sampleRow.smena_id,
        withheld: sampleRow.withheld ?? 0,
      },
      { allowAppError: true },
    );

    expect(giveResult.payload).toBeTruthy();
    expect(giveCartResult.payload).toBeTruthy();
    expect(withheldResult.payload).toBeTruthy();
  });

  test("health journal export returns a local file response", async () => {
    const { response } = await api.call("downloadHJ", {
      point_id: activePoint.id,
      date_start: `${activeMonth.id}-01`,
      date_end: `${activeMonth.id}-01`,
    });

    const contentType = response.headers()["content-type"] || "";
    expect(contentType.length).toBeGreaterThan(0);
  });
});
