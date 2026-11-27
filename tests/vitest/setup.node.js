import { afterAll, afterEach, beforeAll, expect, vi } from "vitest";
import { server, rejectUnhandledRequest, takeUnhandledRequests } from "./network";
import { resetCafeEditStores } from "./reset-stores";

beforeAll(() => server.listen({ onUnhandledRequest: rejectUnhandledRequest }));
afterEach(() => {
  try {
    expect(takeUnhandledRequests(), "Unexpected HTTP requests: add explicit MSW handlers").toEqual(
      [],
    );
  } finally {
    vi.useRealTimers();
    server.resetHandlers();
    resetCafeEditStores();
  }
});
afterAll(() => server.close());
