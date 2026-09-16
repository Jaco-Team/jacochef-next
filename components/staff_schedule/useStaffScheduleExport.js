import { useCallback, useState } from "react";
import dayjs from "dayjs";
import { createStaffSchedulePolicy, openExportDownloadUrl } from "./staffScheduleHelpers";

function createExportDialogState(overrides = {}) {
  return {
    open: false,
    mode: "ws",
    dateStart: "",
    dateEnd: "",
    loading: false,
    error: "",
    ...overrides,
  };
}

export default function useStaffScheduleExport({ api, access, pointId }) {
  const [dialog, setDialog] = useState(() => createExportDialogState());
  const policy = createStaffSchedulePolicy(access);

  const open = useCallback((mode) => {
    const today = dayjs().format("YYYY-MM-DD");

    setDialog(
      createExportDialogState({
        open: true,
        mode,
        dateStart: today,
        dateEnd: today,
      }),
    );
  }, []);

  const close = useCallback(() => {
    setDialog(createExportDialogState());
  }, []);

  const setDateStart = useCallback((dateStart) => {
    setDialog((prev) => ({
      ...prev,
      dateStart,
      error: "",
    }));
  }, []);

  const setDateEnd = useCallback((dateEnd) => {
    setDialog((prev) => ({
      ...prev,
      dateEnd,
      error: "",
    }));
  }, []);

  const download = useCallback(async () => {
    if (!pointId || !dialog.dateStart || !dialog.dateEnd) {
      return;
    }

    setDialog((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const payload = {
        point_id: pointId,
        date_start: dialog.dateStart,
        date_end: dialog.dateEnd,
      };
      const response =
        dialog.mode === "hj" ? await api.downloadHJ(payload) : await api.downloadWS(payload);

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось выгрузить файл");
      }

      if (!openExportDownloadUrl(response)) {
        throw new Error("Не удалось получить ссылку на файл");
      }

      close();
    } catch (requestError) {
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error: requestError?.message || "Не удалось выгрузить файл",
      }));
    }
  }, [api, close, dialog.dateEnd, dialog.dateStart, dialog.mode, pointId]);

  return {
    dialog,
    canExportWorkSchedule: policy.canExportWorkSchedule,
    canExportHealthJournal: policy.canExportHealthJournal,
    open,
    close,
    setDateStart,
    setDateEnd,
    download,
  };
}
