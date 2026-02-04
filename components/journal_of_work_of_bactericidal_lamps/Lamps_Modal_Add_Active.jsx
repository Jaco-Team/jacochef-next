"use client";

import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";

import MyAlert from "@/ui/MyAlert";
import DateWithEditableTimePicker from "./DateWithEditableTimePicker";
import { MyDateTimePickerNew, MyTextInput } from "@/ui/Forms";
import { useConfirm } from "@/src/hooks/useConfirm";

const EMPTY_STATE = {
  active_id: "",
  lamp_id: "",
  time_start: null,
  time_end: null,
  name_lamp: "",
  openAlert: false,
  err_status: true,
  err_text: "",
};

export default function Lamps_Modal_Add_Active({
  open,
  onClose,
  add,
  changeLamp,
  itemEdit,
  typeActive,
  fullScreen,
  showAlert,
}) {
  const [state, setState] = useState(EMPTY_STATE);

  const { ConfirmDialog, withConfirm } = useConfirm();

  useEffect(() => {
    if (!itemEdit) return;

    setState((prev) => ({
      ...prev,
      name_lamp: itemEdit?.name ?? "",
      active_id: typeActive === "edit" ? (itemEdit?.id ?? "") : "",
      lamp_id: typeActive === "edit" ? (itemEdit?.lamp_id ?? "") : (itemEdit?.id ?? ""),
      time_start: itemEdit?.time_start ? dayjs(itemEdit.time_start) : null,
      time_end: itemEdit?.time_end ? dayjs(itemEdit.time_end) : null,
    }));
  }, [itemEdit, typeActive]);

  const isEdit = typeActive === "edit";

  const handleAdd = useCallback(() => {
    const { time_start, time_end } = state;

    if (!time_start || !time_end) {
      showAlert("Выберите оба времени!");
      return;
    }

    const diff = time_end.diff(time_start, "minute");

    if (diff <= 0) {
      showAlert("Конечное время должно быть позже начального!");
      return;
    }

    if (diff > 5 * 60) {
      showAlert("Разница во времени не должна превышать 5 часов!");
      return;
    }

    add({
      id: state.active_id,
      lamp_id: state.lamp_id,
      time_start: dayjs(time_start).format("YYYY-MM-DD HH:mm"),
      time_end: dayjs(time_end).format("YYYY-MM-DD HH:mm"),
    });
  }, [add, showAlert, state]);

  const handleChangeLamp = useCallback(() => {
    changeLamp({ lamp_id: state.lamp_id });
  }, [changeLamp, state.lamp_id]);

  const handleClose = useCallback(() => {
    setState(EMPTY_STATE);
    onClose();
  }, [onClose]);

  const changeDateRange = useCallback((key, newValue) => {
    setState((prev) => {
      const next = { ...prev, [key]: newValue ?? null };

      if (key === "time_start" && !prev.time_end && newValue) {
        next.time_end = dayjs(newValue).add(1, "hour");
      }

      return next;
    });
  }, []);

  return (
    <>
      <MyAlert
        isOpen={state.openAlert}
        onClose={() => setState((p) => ({ ...p, openAlert: false }))}
        status={state.err_status}
        text={state.err_text}
      />

      <ConfirmDialog />

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">{isEdit ? "Редактирование" : "Добавление"} активации</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              size={12}
              sx={{ mt: 2 }}
            >
              <MyTextInput
                label="Лампа"
                value={state.name_lamp}
                className="disabled_input"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {typeActive === "new" ? (
                <MyDateTimePickerNew
                  value={state.time_start}
                  func={(v) => changeDateRange("time_start", v)}
                  label="Время начала работы"
                />
              ) : (
                <DateWithEditableTimePicker
                  value={state.time_start}
                  onChange={(v) => changeDateRange("time_start", v)}
                  labelDate="Дата начала работы"
                  labelTime="Время начала"
                />
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {typeActive === "new" ? (
                <MyDateTimePickerNew
                  value={state.time_end}
                  func={(v) => changeDateRange("time_end", v)}
                  label="Время окончания работы"
                />
              ) : (
                <DateWithEditableTimePicker
                  value={state.time_end}
                  onChange={(v) => changeDateRange("time_end", v)}
                  labelDate="Дата окончания работы"
                  labelTime="Время окончания"
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="warning"
            onClick={withConfirm(
              () => handleChangeLamp(),
              `Точно хотите ЗАМЕНИТЬ лампу "${state.lamp_id}"?`,
            )}
          >
            Замена лампы
          </Button>

          <Button
            variant="contained"
            onClick={withConfirm(
              () => handleAdd(),
              `Подтверждаете ${isEdit ? "сохранение изменений" : "добавление"} "${state.lamp_id}"?`,
            )}
          >
            {isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
