import { HttpResponse, http } from "msw";
import { expect, test, vi } from "vitest";
import { server, takeUnhandledRequests } from "../../network";

function sendXhr(url, body = "fixture") {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.onload = () => resolve({ status: xhr.status, body: JSON.parse(xhr.responseText) });
    xhr.onerror = () => reject(new Error("XHR request blocked"));
    xhr.send(body);
  });
}

test("browser XHR receives an API fixture without a live upload endpoint", async () => {
  server.use(
    http.post("http://chef.test/api/upload-check", async ({ request }) =>
      HttpResponse.json({ received: await request.text() }, { status: 201 }),
    ),
  );
  await expect(sendXhr("http://chef.test/api/upload-check", "test-upload")).resolves.toEqual({
    status: 201,
    body: { received: "test-upload" },
  });
});

test("browser XHR without a fixture is blocked", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  await expect(sendXhr("http://chef.test/api/unhandled-upload")).rejects.toThrow(
    "XHR request blocked",
  );
  expect(log).toHaveBeenCalled();
  expect(takeUnhandledRequests()).toEqual([
    { method: "POST", url: "http://chef.test/api/unhandled-upload" },
  ]);
});
