"use client";

import { useCallback } from "react";

import { useCategoryStore } from "../category/useCategoryStore";
import { getCategoryDTO, newCategoryTemplate } from "../category/categoryUtils";
import { useSiteSettingStore } from "../useSiteSettingStore";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";

export default function useSaveCategory(onClose, showAlert, getData, onAfterSave) {
  const { setItem, setItemName } = useCategoryStore.getState();

  const checkForm = useCallback(() => {
    const { item } = useCategoryStore.getState();

    if (!item?.name) {
      showAlert("Необходимо указать название", false);
      return false;
    }

    const access = useSiteSettingStore.getState().access;
    if (!handleUserAccess(access).userCan("edit", "category_items")) {
      return true;
    }

    const itemIds = new Set();
    for (const categoryItem of item.items || []) {
      const itemId = String(categoryItem.item_id || "");
      const count = String(categoryItem.count || "");

      if (!/^[1-9]\d*$/.test(itemId)) {
        showAlert("Необходимо выбрать товар", false);
        return false;
      }

      if (!/^[1-9]\d*$/.test(count)) {
        showAlert("Количество должно быть целым положительным числом", false);
        return false;
      }

      if (itemIds.has(itemId)) {
        showAlert("Товар нельзя добавить в категорию повторно", false);
        return false;
      }

      itemIds.add(itemId);
    }

    return true;
  }, []);

  const saveNew = useCallback(async () => {
    const { item } = useCategoryStore.getState();
    if (!checkForm()) return;
    const data = getCategoryDTO(item);
    const res = await getData("save_new_category", data);
    if (res.st) {
      showAlert("Категория успешно добавлена", res.st);
      onClose();
      setItem(null);
      setItemName(null);
      setTimeout(async () => {
        await onAfterSave();
      }, 300);
    } else {
      showAlert("Ошибка при добавлении категории", false);
    }
  }, [checkForm]);

  const saveEdit = useCallback(async () => {
    const { item } = useCategoryStore.getState();
    if (!checkForm()) return;
    const data = getCategoryDTO(item);
    const res = await getData("save_edit_category", data);
    if (res.st) {
      showAlert("Категория успешно сохранена", res.st);
      onClose();
      setItem(null);
      setItemName(null);
      setTimeout(async () => {
        await onAfterSave();
      }, 300);
    } else {
      showAlert("Ошибка при сохранении категории", false);
    }
  }, [checkForm]);

  const setCategoryItem = useCallback((id = null) => {
    const { categories } = useCategoryStore.getState();
    if (id) {
      const selectedCategory = categories?.find((p) => p.id === id) || null;
      if (!selectedCategory) {
        showAlert(`Категория id ${id} не найдена`);
        return;
      }
      setItem({
        ...selectedCategory,
        items: (selectedCategory.items || []).map((item) => ({ ...item })),
      });
      setItemName(selectedCategory.name);
      // showAlert(`Item id ${id} found`, true);
    } else {
      const itemTemplate = { ...newCategoryTemplate, items: [] };
      setItem(itemTemplate);
      setItemName("Новая категория");
      // showAlert(`New page requested`, true);
    }
  }, []);

  return { setCategoryItem, saveNew, saveEdit };
}
