import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import CafeEditModalNew from "@/components/cafe_edit/CafeEdit_Modal_New";
import useCafeEditStore from "@/components/cafe_edit/useCafeEditStore";
import useCafeEditModalsStore from "@/components/cafe_edit/useCafeEditModalsStore";
import { renderWithProviders, screen } from "../../render";

const cities = [{ id: 1, name: "Тестовый город" }];

function openModal(cityId = 1) {
  useCafeEditModalsStore.setState({ activePoint: { city_id: cityId, addr: "", cities } });
  const save = vi.fn();
  const onClose = vi.fn();
  renderWithProviders(
    <CafeEditModalNew
      open
      fullScreen={false}
      save={save}
      onClose={onClose}
    />,
  );
  return { save, onClose };
}

test("the actual cafe dialog blocks saving without a city", async () => {
  const { save, onClose } = openModal("");
  await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
  expect(await screen.findByText("Необходимо выбрать город")).toBeVisible();
  expect(save).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test("the actual cafe dialog validates address and sends entered values", async () => {
  const { save, onClose } = openModal();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Сохранить" }));
  expect(await screen.findByText("Необходимо указать адрес")).toBeVisible();
  expect(save).not.toHaveBeenCalled();
  await user.type(screen.getByRole("textbox", { name: "Адрес" }), "Тестовая, 1");
  await user.click(screen.getByRole("button", { name: "Сохранить" }));
  expect(save).toHaveBeenCalledExactlyOnceWith({ city_id: 1, addr: "Тестовая, 1", cities });
  expect(onClose).toHaveBeenCalledTimes(1);
  localStorage.setItem("test-value", "dirty");
  sessionStorage.setItem("test-value", "dirty");
  document.cookie = "test-cookie=dirty; path=/";
  useCafeEditStore.setState({ point: { id: 99 } });
});

test("component DOM, browser storage and both cafe stores start clean", () => {
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
  expect(document.cookie).toBe("");
  expect(useCafeEditStore.getState().point).toBe("");
  expect(useCafeEditModalsStore.getState().activePoint).toBeNull();
  expect(useCafeEditModalsStore.getState()).not.toHaveProperty("activeItem");
});
