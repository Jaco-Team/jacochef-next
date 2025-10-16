"use client";

import { useCallback } from "react";
import { getPageDTO, newPageTemplate } from "../seo/pageTextUtils";
import { usePagesStore } from "../seo/usePagesStore";

export default function useSavePage(onClose, showAlert, getData, onAfterSave) {
  const { setItem, setItemName } = usePagesStore.getState();

  const checkForm = useCallback(() => {
    const { item } = usePagesStore.getState();
    if (!item.city_id) {
      showAlert("Необходимо выбрать город", false);
      return false;
    }

    if (!item.page_name) {
      showAlert("Необходимо указать страницу", false);
      return false;
    }

    if (!item.link && (item.page_id !== 1 && item.page_id !== 55)) {
      showAlert("Необходимо указать ссылку", false);
      return false;
    }

    if (!item.page_h || !item.title) {
      showAlert("Необходимо указать все заголовки", false);
      return false;
    }

    if (!item.description) {
      showAlert("Необходимо указать описание", false);
      return false;
    }
    return true;
  }, []);

  const saveNew = useCallback(async () => {
    const { item } = usePagesStore.getState();
    if (!checkForm()) return;
    const data = getPageDTO(item);
    const res = await getData("save_new_page", data);
    if (res.st) {
      showAlert(res.text, res.st);
      onClose();
      setItem(null);
      setItemName(null);
      setTimeout(async () => {
        await onAfterSave();
      }, 300);
    } else {
      showAlert(res.text, false);
    }
  }, [checkForm]);

  const saveEdit = useCallback(async () => {
    const { item } = usePagesStore.getState();
    if (!checkForm()) return;
    const data = getPageDTO(item);
    const res = await getData("save_edit_page", data);
    if (res.st) {
      showAlert(res.text, res.st);
      onClose();
      setItem(null);
      setItemName(null);
      setTimeout(async () => {
        await onAfterSave();
      }, 300);
    } else {
      showAlert(res.text, false);
    }
  }, [checkForm]);

  const setPageItem = useCallback((id = null) => {
    const { pages } = usePagesStore.getState();
    if (id) {
      const selectedItem = pages?.find((p) => p.id === id) || null;
      if (!selectedItem) {
        showAlert(`Item id ${id} not found`);
        return;
      }
      setItem(selectedItem);
      setItemName(selectedItem.page_name);
      // showAlert(`Item id ${id} found`, true);
    } else {
      const itemTemplate = newPageTemplate;
      setItem(itemTemplate);
      setItemName("Новая страница");
      // showAlert(`New page requested`, true);
    }
  }, []);

  return { setPageItem, saveNew, saveEdit };
}
