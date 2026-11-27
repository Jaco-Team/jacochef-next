import { expect, test, vi } from "vitest";
import { renderWithProviders, screen } from "../../render";
import BillingPages from "@/pages/billing/pages/index.js";

vi.mock("next/router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/src/api_new", () => ({
  api_laravel: vi.fn(async () => ({
    data: {
      module_info: { name: "Накладные" },
      ocrs: [],
      ocrs_null: [],
      products: [],
    },
  })),
}));

test("an existing .js page with JSX renders with the real theme", async () => {
  renderWithProviders(<BillingPages />);
  expect(
    await screen.findByRole("heading", { name: "Накладные / Сверка наименований" }),
  ).toBeVisible();
  expect(document.title).toBe("Накладные");
  expect(screen.getByRole("button", { name: /Надо сверить/ })).toBeVisible();
});
