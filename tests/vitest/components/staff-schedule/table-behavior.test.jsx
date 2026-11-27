import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, screen, waitFor, within } from "../../render.jsx";
import StaffScheduleTableSection from "@/components/staff_schedule/sections/StaffScheduleTableSection";
import { employee, tableProps } from "./ui-fixtures";

beforeEach(() => vi.setSystemTime(new Date("2026-11-27T12:00:00+04:00")));
const teamBonusButton = /^Изменить командный бонус за выбранный период\. Командный бонус: выдан$/;
function financialBlurSwitch() {
  // The existing design-system switch displays its caption beside the input.
  const caption = screen.getByText("Скрыть финансовые показатели");
  return within(caption.parentElement.parentElement).getByRole("switch");
}
const bonusButton = "Изменить Бонус — Анна Тестовая · Кассир";

for (const isMobile of [false, true]) {
  describe(isMobile ? "mobile schedule" : "desktop schedule", () => {
    it.each([
      ["boolean capability", true, 1, { bonus_edit: 1 }, false, true],
      ["numeric capability", 1, 1, { bonus_edit: 1 }, false, true],
      ["missing server capability", undefined, 1, { bonus_edit: 1 }, false, false],
      ["false server capability", false, 1, { bonus_edit: 1 }, false, false],
      ["string is not server capability", "1", 1, { bonus_edit: 1 }, false, false],
      ["read-only bonus permission", true, 1, { bonus_view: 1 }, false, false],
      ["first half", true, 0, { bonus_edit: 1 }, false, false],
      ["hidden finances", true, 1, { bonus_edit: 1 }, true, false],
    ])(
      "gates bonus editing: %s",
      async (_name, capability, selectedPart, access, hidden, allowed) => {
        const row = { ...employee, can_edit_bonus: capability, finance_hidden: Number(hidden) };
        const props = tableProps({
          isMobile,
          access,
          selectedPart,
          rows: [{ data: row }],
          summaryColumns: [{ key: "my_bonus", label: "Бонус" }],
        });
        renderWithProviders(<StaffScheduleTableSection {...props} />);
        const button = screen.queryByRole("button", { name: bonusButton });
        if (allowed) {
          expect(button).toBeVisible();
          await userEvent.click(button);
          expect(props.onOpenSummaryAction).toHaveBeenCalledExactlyOnceWith(row, "my_bonus");
        } else {
          expect(button).not.toBeInTheDocument();
          expect(props.onOpenSummaryAction).not.toHaveBeenCalled();
        }
      },
    );

    it.each([
      ["no permission", {}, 1, 1, false],
      ["current editable half", { fast_hours_access: 1 }, 1, 1, true],
      ["closed first half", { fast_hours_access: 1 }, 0, 1, false],
      ["view permission is insufficient", { fast_hours_view: 1 }, 1, 1, false],
      ["unassigned row", { fast_hours_access: 1 }, 1, -1, false],
    ])(
      "gates selection and quick actions: %s",
      async (_name, access, selectedPart, smenaId, allowed) => {
        const row = { ...employee, smena_id: smenaId };
        const props = tableProps({
          isMobile,
          access,
          selectedPart,
          rows: [{ data: row }],
          selectedRowIds: isMobile && smenaId !== -1 ? ["1:7:2"] : [],
        });
        renderWithProviders(<StaffScheduleTableSection {...props} />);
        const quick = screen.queryByRole("button", {
          name: isMobile ? "Редактирование" : "Быстрые действия",
          exact: true,
        });
        // Toolbar switches have role switch, so checkbox here is specifically row selection.
        const checkbox = screen.queryByRole("checkbox");
        if (allowed) {
          expect(quick).toBeVisible();
          expect(checkbox).toBeEnabled();
          await userEvent.click(quick);
          if (isMobile) expect(props.onOpenSelectedFastActions).toHaveBeenCalledOnce();
          else expect(props.onOpenFastActions).toHaveBeenCalledExactlyOnceWith(row);
          await userEvent.click(checkbox);
          expect(props.onToggleRowSelection).toHaveBeenCalledExactlyOnceWith("1:7:2");
        } else {
          expect(quick).not.toBeInTheDocument();
          expect(checkbox).not.toBeInTheDocument();
        }
      },
    );

    it.each([
      ["no team-bonus edit", { salary_all_view: 1 }, false],
      ["no all-salaries visibility", { com_bonus_edit: 1 }, false],
      ["team-bonus read only", { com_bonus_view: 1, salary_all_view: 1 }, false],
      ["edit and visibility", { com_bonus_edit: 1, salary_all_view: 1 }, true],
    ])("gates period bonus headers: %s", async (_name, access, allowed) => {
      const props = tableProps({
        isMobile,
        access: { ...access, sums_all_view: 1 },
        summaryColumns: [{ key: "dop_bonus", label: "Командный бонус" }],
      });
      renderWithProviders(<StaffScheduleTableSection {...props} />);
      const buttons = screen.queryAllByRole("button", { name: teamBonusButton });
      expect(buttons).toHaveLength(allowed ? (isMobile ? 2 : 1) : 0);
      for (const button of buttons) {
        expect(button).toBeVisible();
        await userEvent.click(button);
      }
      if (allowed) {
        expect(props.onOpenSummaryAction).toHaveBeenCalledTimes(buttons.length);
        for (const call of props.onOpenSummaryAction.mock.calls)
          expect(call).toEqual([null, "dop_bonus_toggle"]);
        await userEvent.click(financialBlurSwitch());
        expect(screen.queryByRole("button", { name: teamBonusButton })).not.toBeInTheDocument();
      }
    });
  });
}

it("desktop sticky and normal bonus headers obey the same permission, blur and callback rules", async () => {
  // jsdom has no table layout. Supply geometry only; production scroll and sticky logic executes.
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    return {
      top: -10,
      left: 20,
      bottom: this.tagName === "TABLE" ? 500 : 30,
      right: 820,
      width: 800,
      height: 40,
      x: 20,
      y: -10,
      toJSON() {},
    };
  });
  const props = tableProps({
    access: { com_bonus_edit: 1, salary_all_view: 1 },
    summaryColumns: [{ key: "dop_bonus", label: "Командный бонус" }],
  });
  const { rerender } = renderWithProviders(<StaffScheduleTableSection {...props} />);
  await waitFor(() =>
    expect(screen.getAllByRole("button", { name: teamBonusButton })).toHaveLength(2),
  );
  for (const button of screen.getAllByRole("button", { name: teamBonusButton }))
    await userEvent.click(button);
  expect(props.onOpenSummaryAction).toHaveBeenCalledTimes(2);
  for (const call of props.onOpenSummaryAction.mock.calls)
    expect(call).toEqual([null, "dop_bonus_toggle"]);
  await userEvent.click(financialBlurSwitch());
  expect(screen.queryByRole("button", { name: teamBonusButton })).not.toBeInTheDocument();
  await userEvent.click(financialBlurSwitch());
  expect(screen.getAllByRole("button", { name: teamBonusButton })).toHaveLength(2);
  rerender(
    <StaffScheduleTableSection
      {...props}
      access={{ salary_all_view: 1 }}
    />,
  );
  expect(screen.queryByRole("button", { name: teamBonusButton })).not.toBeInTheDocument();
});
