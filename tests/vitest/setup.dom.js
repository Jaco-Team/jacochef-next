import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import { server, rejectUnhandledRequest, takeUnhandledRequests } from "./network";
import { resetCafeEditStores } from "./reset-stores";

beforeAll(() => server.listen({ onUnhandledRequest: rejectUnhandledRequest }));
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  try {
    cleanup();
    expect(takeUnhandledRequests(), "Unexpected HTTP requests: add explicit MSW handlers").toEqual(
      [],
    );
  } finally {
    vi.useRealTimers();
    resetCafeEditStores();
    server.resetHandlers();
    takeUnhandledRequests();
    localStorage.clear();
    sessionStorage.clear();
    for (const cookie of document.cookie.split(";")) {
      document.cookie = `${cookie.split("=")[0].trim()}=; Max-Age=0; path=/`;
    }
    document.title = "";
  }
});

afterAll(() => server.close());
