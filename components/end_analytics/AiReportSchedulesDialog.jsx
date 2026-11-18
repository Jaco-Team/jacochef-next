import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import dayjs from "dayjs";
import {
  JacoAutocomplete,
  JacoButton,
  JacoIconButton,
  JacoModal,
  JacoSelect,
  JacoSwitch,
  JacoTextInput,
  uiColors,
  uiRadii,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import { api_laravel } from "@/src/api_new";

const WEEKDAYS = [
  { id: "1", name: "Понедельник" },
  { id: "2", name: "Вторник" },
  { id: "3", name: "Среда" },
  { id: "4", name: "Четверг" },
  { id: "5", name: "Пятница" },
  { id: "6", name: "Суббота" },
  { id: "7", name: "Воскресенье" },
];

const MONTH_DAYS = Array.from({ length: 28 }, (_, index) => ({
  id: String(index + 1),
  name: `${index + 1}-го числа`,
}));

const STATUS_LABELS = {
  sent: { label: "Отправлен", color: "success" },
  error: { label: "Ошибка", color: "error" },
  no_access: { label: "Нет доступа", color: "warning" },
  no_anomalies: { label: "Аномалий нет", color: "default" },
};

// Не отчёт, а ежедневная проверка вчерашнего дня: письмо приходит, только если найдены аномалии.
const ALERTS_FREQUENCY = "alerts";

const DEFAULT_PERIOD_BY_FREQUENCY = {
  daily: "yesterday",
  weekly: "previous_week",
  monthly: "previous_month",
  [ALERTS_FREQUENCY]: "yesterday",
};

const createDraft = (minHour) => ({
  id: null,
  city: null,
  sources: [],
  frequency: "daily",
  weekday: "1",
  month_day: "1",
  send_hour: String(Math.max(10, minHour)),
  period: "yesterday",
  comparison_mode: "previous_period",
  email: "",
  is_active: true,
});

const unwrap = (result) => (result?.data && typeof result.data === "object" ? result.data : result);

export default function AiReportSchedulesDialog({
  open,
  onClose,
  cities = [],
  sourceOptions = [],
  onError,
  onNotice,
}) {
  const [schedules, setSchedules] = useState([]);
  const [options, setOptions] = useState(null);
  const [draft, setDraft] = useState(null);
  const [formError, setFormError] = useState("");
  const [formErrorField, setFormErrorField] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useJacoConfirm();

  const minHour = Number(options?.min_hour ?? 9);
  const maxHour = Number(options?.max_hour ?? 22);
  const maxSchedules = Number(options?.max_schedules ?? 5);
  const hourOptions = Array.from({ length: Math.max(0, maxHour - minHour + 1) }, (_, index) => ({
    id: String(minHour + index),
    name: `${String(minHour + index).padStart(2, "0")}:00`,
  }));

  const applyResponse = (data) => {
    setSchedules(Array.isArray(data?.schedules) ? data.schedules : []);
    if (data?.options) setOptions(data.options);
  };

  const request = async (method, payload = {}) => {
    try {
      const data = unwrap(await api_laravel("end_analytics", method, payload));
      if (!data || data.st === false) {
        return { ok: false, text: data?.text || "Не удалось выполнить запрос" };
      }
      applyResponse(data);
      return { ok: true, text: data.text };
    } catch (_) {
      return { ok: false, text: "Ошибка при обращении к серверу" };
    }
  };

  useEffect(() => {
    if (!open) return;

    setDraft(null);
    setFormError("");
    setLoading(true);
    request("get_report_schedules").then((result) => {
      if (!result.ok) onError?.(result.text);
      setLoading(false);
    });
  }, [open]);

  const setDraftField = (field, value) => {
    setFormError("");
    setFormErrorField("");
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleFrequencyChange = (frequency) => {
    setFormError("");
    setDraft((prev) => ({
      ...prev,
      frequency,
      period: DEFAULT_PERIOD_BY_FREQUENCY[frequency] || prev.period,
    }));
  };

  const startEdit = (schedule) => {
    setFormError("");
    setDraft({
      id: schedule.id,
      city: cities.find((city) => Number(city.id) === Number(schedule.city_id)) || {
        id: schedule.city_id,
        name: schedule.city_name || "",
      },
      sources: (schedule.sources || []).map(
        (name) => sourceOptions.find((item) => item.name === name) || { id: `saved_${name}`, name },
      ),
      frequency: schedule.frequency,
      weekday: String(schedule.weekday ?? 1),
      month_day: String(schedule.month_day ?? 1),
      send_hour: String(schedule.send_hour),
      period: schedule.period,
      comparison_mode: schedule.comparison_mode,
      email: schedule.email,
      is_active: Boolean(schedule.is_active),
    });
  };

  const toPayload = (source) => ({
    id: source.id || undefined,
    city: source.city ? { id: source.city.id, name: source.city.name } : null,
    sources: (source.sources || []).map((item) => item?.name).filter(Boolean),
    frequency: source.frequency,
    weekday: Number(source.weekday),
    month_day: Number(source.month_day),
    send_hour: Number(source.send_hour),
    period: source.period,
    comparison_mode: source.comparison_mode,
    email: String(source.email || "").trim(),
    is_active: Boolean(source.is_active),
  });

  const handleSave = async () => {
    if (!draft?.city) {
      setFormErrorField("city");
      setFormError("Выберите город");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(draft.email || "").trim())) {
      setFormErrorField("email");
      setFormError("Укажите корректный адрес почты");
      return;
    }

    setSaving(true);
    const result = await request("save_report_schedule", toPayload(draft));
    setSaving(false);
    if (!result.ok) {
      setFormError(result.text);
      return;
    }
    setDraft(null);
  };

  const handleToggle = async (schedule, isActive) => {
    const result = await request("save_report_schedule", {
      ...schedule,
      city: { id: schedule.city_id, name: schedule.city_name },
      is_active: isActive,
    });
    if (!result.ok) onError?.(result.text);
  };

  const handleDelete = async (schedule) => {
    const accepted = await confirm({
      title: "Удалить расписание",
      message: `Отчёты «${schedule.city_name || "Все города"}, ${schedule.description}» больше не будут приходить на ${schedule.email}.`,
      confirmLabel: "Удалить",
      cancelLabel: "Отмена",
      confirmTone: "danger",
    });
    if (!accepted) return;

    const result = await request("delete_report_schedule", { id: schedule.id });
    if (!result.ok) onError?.(result.text);
  };

  const handleSendNow = async (schedule) => {
    const result = await request("send_report_schedule_now", { id: schedule.id });
    if (!result.ok) {
      onError?.(result.text);
      return;
    }
    onNotice?.(result.text || "Отчёт поставлен в очередь");
  };

  const periodName = (id) => options?.periods?.find((item) => item.id === id)?.name || id;

  const renderList = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Отчёт формируется автоматически по завершённым дням и приходит на указанную почту. Он также
        сохраняется в «Истории отчётов».
      </Typography>
      {!loading && schedules.length === 0 ? (
        <Typography variant="body2">Расписаний пока нет.</Typography>
      ) : null}
      {schedules.map((schedule) => {
        const status = STATUS_LABELS[schedule.last_status];

        return (
          <Box
            key={schedule.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              border: `1px solid ${uiColors.border}`,
              borderRadius: uiRadii.md,
              opacity: schedule.is_active ? 1 : 0.65,
            }}
          >
            <Tooltip title={schedule.is_active ? "Рассылка включена" : "Рассылка выключена"}>
              <span>
                <JacoSwitch
                  checked={Boolean(schedule.is_active)}
                  onChange={(event) => handleToggle(schedule, event.target.checked)}
                  slotProps={{ input: { "aria-label": "Включить рассылку" } }}
                />
              </span>
            </Tooltip>
            <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
              >
                {schedule.city_name || "Все города"} · {schedule.description}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
                noWrap
              >
                {schedule.frequency === ALERTS_FREQUENCY
                  ? "Письмо только при аномалиях"
                  : periodName(schedule.period)}
                {schedule.sources?.length ? ` · ${schedule.sources.join(", ")}` : ""} ·{" "}
                {schedule.email}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
                noWrap
                title={schedule.last_error || undefined}
              >
                {schedule.is_active && schedule.next_run_at
                  ? `Следующий: ${dayjs(schedule.next_run_at).format("DD.MM.YYYY HH:mm")}`
                  : "Рассылка выключена"}
                {schedule.last_run_at
                  ? ` · последний: ${dayjs(schedule.last_run_at).format("DD.MM.YYYY HH:mm")}`
                  : ""}
              </Typography>
            </Box>
            {status ? (
              <Chip
                size="small"
                variant="outlined"
                color={status.color}
                label={status.label}
              />
            ) : null}
            <Tooltip title="Отправить сейчас">
              <span>
                <JacoIconButton
                  aria-label="Отправить сейчас"
                  onClick={() => handleSendNow(schedule)}
                >
                  <SendRoundedIcon fontSize="small" />
                </JacoIconButton>
              </span>
            </Tooltip>
            <Tooltip title="Изменить">
              <span>
                <JacoIconButton
                  aria-label="Изменить расписание"
                  onClick={() => startEdit(schedule)}
                >
                  <EditRoundedIcon fontSize="small" />
                </JacoIconButton>
              </span>
            </Tooltip>
            <Tooltip title="Удалить">
              <span>
                <JacoIconButton
                  aria-label="Удалить расписание"
                  onClick={() => handleDelete(schedule)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </JacoIconButton>
              </span>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );

  const renderForm = () => (
    <Grid
      container
      spacing={2.5}
      sx={{ pt: 0.5 }}
    >
      <Grid size={{ xs: 12, sm: 6 }}>
        <JacoAutocomplete
          label="Город"
          options={cities}
          value={draft.city}
          isOptionEqualToValue={(option, value) => Number(option?.id) === Number(value?.id)}
          onChange={(event, value) => setDraftField("city", value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <JacoAutocomplete
          label="Источники (пусто — все)"
          options={sourceOptions}
          multiple
          value={draft.sources}
          isOptionEqualToValue={(option, value) => option?.name === value?.name}
          onChange={(event, value) => setDraftField("sources", Array.isArray(value) ? value : [])}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <JacoSelect
          label="Периодичность"
          options={options?.frequencies || []}
          allowNone={false}
          value={draft.frequency}
          onChange={(event) => handleFrequencyChange(String(event.target.value))}
        />
      </Grid>
      {draft.frequency === "weekly" ? (
        <Grid size={{ xs: 12, sm: 3 }}>
          <JacoSelect
            label="День недели"
            options={WEEKDAYS}
            allowNone={false}
            value={draft.weekday}
            onChange={(event) => setDraftField("weekday", String(event.target.value))}
          />
        </Grid>
      ) : null}
      {draft.frequency === "monthly" ? (
        <Grid size={{ xs: 12, sm: 3 }}>
          <JacoSelect
            label="День месяца"
            options={MONTH_DAYS}
            allowNone={false}
            value={draft.month_day}
            onChange={(event) => setDraftField("month_day", String(event.target.value))}
          />
        </Grid>
      ) : null}
      <Grid
        size={{
          xs: 12,
          sm: draft.frequency === "daily" || draft.frequency === ALERTS_FREQUENCY ? 6 : 3,
        }}
      >
        <JacoSelect
          label="Время отправки"
          options={hourOptions}
          allowNone={false}
          value={draft.send_hour}
          onChange={(event) => setDraftField("send_hour", String(event.target.value))}
        />
      </Grid>
      {draft.frequency === ALERTS_FREQUENCY ? (
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Каждый день проверяется вчерашний день: заказы, выручка, расход и CPA сравниваются со
            средним по тем же дням недели, отдельно ищутся кампании с расходом без заказов. Письмо
            приходит, только если найдены отклонения.
          </Typography>
        </Grid>
      ) : (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <JacoSelect
              label="Период отчёта"
              options={options?.periods || []}
              allowNone={false}
              value={draft.period}
              onChange={(event) => setDraftField("period", String(event.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <JacoSelect
              label="Сравнить с"
              options={options?.comparison_modes || []}
              allowNone={false}
              value={draft.comparison_mode}
              onChange={(event) => setDraftField("comparison_mode", String(event.target.value))}
            />
          </Grid>
        </>
      )}
      <Grid size={{ xs: 12 }}>
        <JacoTextInput
          label="Почта для отчёта"
          type="email"
          value={draft.email}
          error={formErrorField === "email"}
          helperText="Время отправки указано по Самаре (UTC+4)"
          onChange={(event) => setDraftField("email", event.target.value)}
        />
      </Grid>
      {formError ? (
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="body2"
            color="error"
            role="alert"
          >
            {formError}
          </Typography>
        </Grid>
      ) : null}
    </Grid>
  );

  const actions = draft ? (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, width: "100%" }}>
      <JacoButton
        tone="secondary"
        disabled={saving}
        onClick={() => setDraft(null)}
      >
        Отмена
      </JacoButton>
      <JacoButton
        loading={saving}
        onClick={handleSave}
      >
        Сохранить
      </JacoButton>
    </Box>
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, width: "100%" }}>
      <JacoButton
        tone="outlinePrimary"
        startIcon={<AddRoundedIcon />}
        disabled={loading || schedules.length >= maxSchedules}
        onClick={() => {
          setFormError("");
          setDraft(createDraft(minHour));
        }}
      >
        Добавить расписание
      </JacoButton>
      <JacoButton
        tone="secondary"
        onClick={onClose}
      >
        Закрыть
      </JacoButton>
    </Box>
  );

  return (
    <>
      <JacoModal
        open={open}
        onClose={onClose}
        onBack={draft ? () => setDraft(null) : null}
        title={
          draft ? (draft.id ? "Изменить расписание" : "Новое расписание") : "Отчёты по расписанию"
        }
        maxWidth="md"
        actions={actions}
      >
        {draft ? renderForm() : renderList()}
      </JacoModal>
      <ConfirmDialog />
    </>
  );
}
