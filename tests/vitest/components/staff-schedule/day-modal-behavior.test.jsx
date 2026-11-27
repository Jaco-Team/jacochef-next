import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor } from "../../render.jsx";
import StaffScheduleDayModal from "@/components/staff_schedule/modals/StaffScheduleDayModal";
import { dayModal } from "./ui-fixtures";

beforeEach(() => vi.setSystemTime(new Date("2026-11-27T12:00:00+04:00")));

function expectEditable(label, editable) {
  const control = screen.getByRole("combobox", { name: label });
  if (control.tagName === "INPUT") expect(control).toHaveProperty("disabled", !editable);
  else if (editable) expect(control).not.toHaveAttribute("aria-disabled", "true");
  else expect(control).toHaveAttribute("aria-disabled", "true");
}

function renderDay(modal = dayModal()) {
  const props = { modal, onClose: vi.fn(), onSave: vi.fn().mockResolvedValue(undefined) };
  return { ...renderWithProviders(<StaffScheduleDayModal {...props} />), props };
}

describe("day card permissions and current modal identity", () => {
  it("keeps a closed half read-only even when cached edit flags are true", async () => {
    const modal = dayModal();
    modal.request = { ...modal.request, date: "2026-11-15" };
    const { props } = renderDay(modal);
    expect(screen.getByText("Прошедший период — только просмотр")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Сохранить" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Добавить время" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Удалить время" })).not.toBeInTheDocument();
    for (const label of ["Кем работает", "Наставник", "Температура", "Здоровье"]) {
      expectEditable(label, false);
    }
    await userEvent.click(screen.getByRole("button", { name: "Закрыть", exact: true }));
    expect(props.onClose).toHaveBeenCalledOnce();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it.each([
    ["hours", true, false, false],
    ["assignment", false, true, false],
    ["health", false, false, true],
    ["read-only", false, false, false],
  ])("only enables the permitted %s fields", (_name, hours, assignment, health) => {
    renderDay(
      dayModal({ canEditHours: hours, canEditAssignment: assignment, canEditHealth: health }),
    );
    for (const label of ["Кем работает", "Наставник"]) {
      expectEditable(label, assignment);
    }
    for (const label of ["Температура", "Здоровье"]) {
      expectEditable(label, health);
    }
    expect(Boolean(screen.queryByRole("button", { name: "Добавить время" }))).toBe(hours);
    expect(Boolean(screen.queryByRole("button", { name: "Удалить время" }))).toBe(hours);
    if (hours || assignment || health) {
      expect(screen.getByRole("button", { name: "Сохранить", exact: true })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Отменить", exact: true })).toBeEnabled();
    } else {
      expect(
        screen.queryByRole("button", { name: "Сохранить", exact: true }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Закрыть", exact: true })).toBeEnabled();
    }
  });

  it("removes a time range only after confirmation and saves the resulting draft", async () => {
    const { props } = renderDay();
    await userEvent.click(screen.getByRole("button", { name: "Удалить время" }));
    expect(screen.getAllByText("10:00-14:00", { exact: false })).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Да, удалить" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Удалить время" })).not.toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: "Сохранить", exact: true }));
    expect(props.onSave).toHaveBeenCalledOnce();
    expect(props.onSave.mock.calls[0][0]).toMatchObject({
      user_id: 7,
      app_id: 2,
      smena_id: 1,
      hours: [],
    });
  });

  it.each(["rights revoked", "request replaced", "period closed"])(
    "does not remove a range after %s while confirmation is open",
    async (change) => {
      const modal = dayModal();
      const { props, rerender } = renderDay(modal);
      await userEvent.click(screen.getByRole("button", { name: "Удалить время" }));
      const next = { ...modal };
      if (change === "rights revoked") next.data = { ...modal.data, canEditHours: false };
      if (change === "request replaced") next.request = { ...modal.request, user_id: 8 };
      if (change === "period closed") vi.setSystemTime(new Date("2026-12-01T12:00:00+04:00"));
      rerender(
        <StaffScheduleDayModal
          {...props}
          modal={next}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Да, удалить" }));
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Да, удалить" })).not.toBeInTheDocument(),
      );
      expect(screen.getByText("10:00-14:00", { exact: false })).toBeVisible();
      expect(props.onSave).not.toHaveBeenCalled();
      if (change === "request replaced")
        expect(screen.getByRole("button", { name: "Удалить время" })).toBeEnabled();
    },
  );

  it.each(["rights revoked", "request replaced", "period closed"])(
    "does not save cached edits after %s during close confirmation",
    async (change) => {
      const modal = dayModal();
      const { props, rerender } = renderDay(modal);
      const temperature = screen.getByRole("combobox", { name: "Температура" });
      await userEvent.clear(temperature);
      await userEvent.type(temperature, "37,0");
      await userEvent.click(screen.getByRole("button", { name: "Отменить", exact: true }));
      expect(screen.getByRole("button", { name: "Да, сохранить" })).toBeVisible();
      const next = { ...modal };
      if (change === "rights revoked")
        next.data = {
          ...modal.data,
          canEditHours: false,
          canEditAssignment: false,
          canEditHealth: false,
        };
      if (change === "request replaced") next.request = { ...modal.request, user_id: 8 };
      if (change === "period closed") vi.setSystemTime(new Date("2026-12-01T12:00:00+04:00"));
      rerender(
        <StaffScheduleDayModal
          {...props}
          modal={next}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Да, сохранить" }));
      await waitFor(() =>
        expect(screen.queryByRole("button", { name: "Да, сохранить" })).not.toBeInTheDocument(),
      );
      expect(props.onSave).not.toHaveBeenCalled();
      if (change === "period closed") expect(props.onClose).toHaveBeenCalledOnce();
      else expect(props.onClose).not.toHaveBeenCalled();
    },
  );
});
