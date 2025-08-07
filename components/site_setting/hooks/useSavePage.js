import { useCallback } from "react";
import { getPageDTO } from "../seo/pageTextUtils";
import { usePagesStore } from "../seo/usePagesStore";

export default function useSavePage(onClose, showAlert, getData) {
  const item = usePagesStore.getState().item;
  const {setItem, setItemName} = usePagesStore.getState();
  const saveNew = useCallback(async () => {
    const data = getPageDTO(item);
    const res = await getData("save_new_page", data);
    if (res.st) {
      showAlert(res.text, res.st);
      onClose();
      setItem(null);
      setItemName(null);
      setTimeout(async () => {
        fetchCoreData();
      }, 300);
    } else {
      showAlert(res.text, false);
    }
  }, []);

  const saveEdit = useCallback(async () => {
    const data = getPageDTO(item);
    const res = await getData("save_edit_page", data);
    if (res.st) {
      showAlert(res.text, res.st);
      onClose();
      setItem(null);
      setItemName(null);
      setTimeout(async () => {
        fetchCoreData();
      }, 300);
    } else {
      showAlert(res.text, false);
    }
  }, [item]);
  return {saveNew, saveEdit};
}
