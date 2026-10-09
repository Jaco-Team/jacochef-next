import { useCallback, useEffect, useRef, useState } from "react";
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
  const canExport = policy.canExportWorkSchedule;
  const accessRef = useRef(access);
  accessRef.current = access;
  const exportGeneration = useRef(0);
  useEffect(() => {
    if (!canExport) {
      exportGeneration.current += 1;
      setDialog(createExportDialogState());
    }
  }, [canExport]);

  const open = useCallback(
    (mode) => {
      if (!canExport || !["ws", "hj"].includes(mode)) return;
      const today = dayjs().format("YYYY-MM-DD");
      exportGeneration.current += 1;

      setDialog(
        createExportDialogState({
          open: true,
          mode,
          dateStart: today,
          dateEnd: today,
        }),
      );
    },
    [canExport],
  );

  const close = useCallback(() => {
    exportGeneration.current += 1;
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
    if (
      !createStaffSchedulePolicy(accessRef.current).canExportWorkSchedule ||
      !dialog.open ||
      !pointId ||
      !dialog.dateStart ||
      !dialog.dateEnd
    ) {
      return;
    }
    const generation = exportGeneration.current;

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

      if (
        generation !== exportGeneration.current ||
        !createStaffSchedulePolicy(accessRef.current).canExportWorkSchedule
      )
        return;

      if (response?.st === false) {
        throw new Error(response?.text || "Не удалось выгрузить файл");
      }

      if (!openExportDownloadUrl(response)) {
        throw new Error("Не удалось получить ссылку на файл");
      }

      close();
    } catch (requestError) {
      if (generation !== exportGeneration.current) return;
      setDialog((prev) => ({
        ...prev,
        loading: false,
        error: requestError?.message || "Не удалось выгрузить файл",
      }));
    }
  }, [api, close, dialog.dateEnd, dialog.dateStart, dialog.mode, dialog.open, pointId]);

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
