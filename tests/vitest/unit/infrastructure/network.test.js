import axios from "axios";
import { HttpResponse, http } from "msw";
import { expect, test, vi } from "vitest";
import { server, takeUnhandledRequests } from "../../network";

test("fetch and Axios receive fixture responses without a running API", async () => {
  server.use(
    http.get("http://chef.test/api/example", () =>
      HttpResponse.json({ st: true, name: "fixture" }),
    ),
  );
  expect(await (await fetch("http://chef.test/api/example")).json()).toEqual({
    st: true,
    name: "fixture",
  });
  expect((await axios.get("http://chef.test/api/example")).data).toEqual({
    st: true,
    name: "fixture",
  });
});

test("a missing HTTP fixture fails before network access", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  await expect(fetch("http://chef.test/api/unhandled")).rejects.toThrow();
  expect(log).toHaveBeenCalled();
  expect(takeUnhandledRequests()).toEqual([
    { method: "GET", url: "http://chef.test/api/unhandled" },
  ]);
});

// The teardown checks this queue even when application code handles the rejection.
test("catching a network error does not hide an unmatched request", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  await fetch("http://chef.test/api/caught-unhandled").catch(() => null);
  expect(takeUnhandledRequests()).toEqual([
    { method: "GET", url: "http://chef.test/api/caught-unhandled" },
  ]);
});
