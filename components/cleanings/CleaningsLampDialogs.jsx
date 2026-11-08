import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Button, DialogActions, DialogContent, Grid, Typography } from "@mui/material";
import MyModal from "@/ui/MyModal";
import { MyDateTimePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import CleaningsLampDateTimePicker from "./CleaningsLampDateTimePicker";

const emptyLamp = {
  number: "",
  name: "",
  resource: "",
  place: "",
  serial_number: "",
};
const replacementReasons = [
  "Неисправна",
  "Повреждена",
  "Выработан ресурс",
  "Плановая замена",
  "Другая причина",
];
const replacementReasonOptions = replacementReasons.map((name) => ({ id: name, name }));

function dateTimeValue(value) {
  return value && dayjs(value).isValid() ? dayjs(value) : null;
}

function activityDateTime(activity, field) {
  const value = activity?.[field];
  if (!value) return "";
  if (String(value).includes(" ") || String(value).includes("T")) return dateTimeValue(value);
  return dateTimeValue(`${activity.date || dayjs().format("YYYY-MM-DD")} ${value}`);
}

export function CleaningsLampDialog({ open, lamp, onClose, onSave }) {
  const [form, setForm] = useState(emptyLamp);

  useEffect(() => {
    setForm(lamp ? { ...emptyLamp, ...lamp } : emptyLamp);
  }, [lamp, open]);

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const canSave = [form.number, form.name, form.resource, form.place].every(
    (value) => String(value ?? "").trim() !== "",
  );

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={lamp?.id ? "Редактирование лампы" : "Новая лампа"}
      maxWidth="md"
    >
      <DialogContent sx={{ pt: 1.5 }}>
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              fullWidth
              label="Место размещения"
              required
              value={form.place}
              func={update("place")}
              disabled={Boolean(lamp?.id)}
              helperText={lamp?.id ? "Место фиксируется для этой версии лампы" : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              fullWidth
              label="Порядковый номер"
              required
              value={form.number}
              func={update("number")}
              disabled={Boolean(lamp?.id)}
              helperText={lamp?.id ? "Номер меняется только при замене лампы" : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              fullWidth
              label="Модель"
              required
              value={form.name}
              func={update("name")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              fullWidth
              label="Ресурс, часов"
              required
              type="number"
              value={form.resource}
              func={update("resource")}
            />
          </Grid>
          <Grid size={12}>
            <MyTextInput
              fullWidth
              label="Производитель и серийный номер"
              value={form.serial_number}
              func={update("serial_number")}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <span />
        <Button
          variant="contained"
          onClick={() => onSave({ ...form, id: lamp?.id })}
          disabled={!canSave}
        >
          СОХРАНИТЬ
        </Button>
      </DialogActions>
    </MyModal>
  );
}

export function CleaningsLampReplacementDialog({ open, lamp, onClose, onSave }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason("");
    setDetails("");
    setSerialNumber("");
  }, [open, lamp]);

  const submit = () => {
    const value = reason === "Другая причина" ? details.trim() : reason;
    if (!value) return;
    onSave({
      lamp_id: lamp?.id,
      replacement_reason: value,
      serial_number: serialNumber.trim(),
    });
  };

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title="Замена лампы"
      maxWidth="sm"
    >
      <DialogContent sx={{ pt: 1.5 }}>
        <Grid
          container
          spacing={2}
        >
          <Grid size={12}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {lamp?.place || "—"} · №{lamp?.number || "—"} · {lamp?.name || "—"}
            </Typography>
          </Grid>
          <Grid size={12}>
            <MySelect
              fullWidth
              label="Причина замены"
              data={replacementReasonOptions}
              value={reason}
              func={(event) => setReason(event.target.value)}
              is_none={false}
            />
          </Grid>
          {reason === "Другая причина" ? (
            <Grid size={12}>
              <MyTextInput
                fullWidth
                required
                label="Укажите причину"
                value={details}
                func={(event) => setDetails(event.target.value)}
              />
            </Grid>
          ) : null}
          <Grid size={12}>
            <MyTextInput
              fullWidth
              label="Производитель и серийный номер"
              value={serialNumber}
              func={(event) => setSerialNumber(event.target.value)}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onClose}>ОТМЕНА</Button>
        <Button
          variant="contained"
          color="warning"
          onClick={submit}
          disabled={!reason || (reason === "Другая причина" && !details.trim())}
        >
          ЗАМЕНИТЬ
        </Button>
      </DialogActions>
    </MyModal>
  );
}

export function CleaningsLampActivityDialog({
  open,
  activity,
  mode,
  lamp,
  onClose,
  onSave,
  onReplace,
}) {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  useEffect(() => {
    if (!open) return;
    setStart(activityDateTime(activity, "time_start") || dayjs().hour(8).minute(0));
    setEnd(activityDateTime(activity, "time_end") || dayjs().hour(9).minute(0));
  }, [activity, open]);

  const duration = useMemo(
    () => (start && end ? dayjs(end).diff(dayjs(start), "minute") : null),
    [end, start],
  );

  const save = () => {
    if (
      !start ||
      !end ||
      !dayjs(start).isValid() ||
      !dayjs(end).isValid() ||
      duration <= 0 ||
      duration > 300
    )
      return;
    onSave({
      id: mode === "edit" ? activity?.id : "",
      lamp_id: activity?.lamp_id || lamp?.id,
      time_start: dayjs(start).format("YYYY-MM-DD HH:mm"),
      time_end: dayjs(end).format("YYYY-MM-DD HH:mm"),
    });
  };

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Редактирование активации" : "Новая активация"}
      maxWidth="md"
    >
      <DialogContent sx={{ pt: 1.5 }}>
        <Grid
          container
          spacing={2}
        >
          <Grid size={12}>
            <MyTextInput
              fullWidth
              label="Лампа"
              value={lamp?.name || activity?.name || ""}
              slotProps={{ input: { readOnly: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {mode === "new" ? (
              <MyDateTimePickerNew
                value={start}
                func={setStart}
                label="Начало работы"
              />
            ) : (
              <CleaningsLampDateTimePicker
                value={start}
                onChange={setStart}
                labelDate="Дата начала"
                labelTime="Начало работы"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {mode === "new" ? (
              <MyDateTimePickerNew
                value={end}
                func={setEnd}
                label="Окончание работы"
              />
            ) : (
              <CleaningsLampDateTimePicker
                value={end}
                onChange={setEnd}
                labelDate="Дата окончания"
                labelTime="Окончание работы"
              />
            )}
          </Grid>
          {duration != null && duration > 0 ? (
            <Grid size={12}>
              <Typography
                variant="body2"
                color={duration > 300 ? "error" : "text.secondary"}
              >
                Продолжительность: {Math.floor(duration / 60)} ч {duration % 60} мин
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between", gap: 1 }}>
        {mode === "edit" ? (
          <Button
            variant="contained"
            color="warning"
            onClick={() => onReplace({ lamp_id: activity?.lamp_id })}
          >
            ЗАМЕНА ЛАМПЫ
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant="contained"
          onClick={save}
          disabled={!start || !end || duration <= 0 || duration > 300}
        >
          СОХРАНИТЬ
        </Button>
      </DialogActions>
    </MyModal>
  );
}
