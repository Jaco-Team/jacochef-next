import { useCallback, useEffect, useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Box, Grid, Typography } from "@mui/material";
import dayjs from "dayjs";

import {
  JacoAlert,
  JacoBackdropLoader,
  JacoButton,
  JacoDatePicker,
  JacoIconButton,
  JacoModal,
  JacoSegmentedTabs,
  JacoSelect,
  JacoSurface,
  uiColors,
  uiTypography,
} from "@/design-system/shared/ui";

import HistoryModal from "./HistoryModal";
import SlotsGrid from "./SlotsGrid";
import {
  buildSlotItems,
  formatDateKey,
  formatDateTime,
  getErrorText,
  getHourSlots,
  getHours,
  isDateKey,
  parseSlotInput,
  slotKey,
} from "./kitchenQueueUtils";

const MODES = [
  { id: "week", label: "Обычная неделя" },
  { id: "dates", label: "Особые даты" },
];

const EMPTY_DATA = {
  slots: [],
  enabled: true,
  defaultLimit: { delivery: 0, other: 0 },
  week: {},
  dates: [],
};

/** Сохранённые значения одним словарём: "день|слот" => число. */
function toSavedMap(data) {
  const map = {};
  Object.entries(data.week).forEach(([dayKey, slots]) => {
    Object.entries(slots || {}).forEach(([time, value]) => {
      map[slotKey(dayKey, time)] = Number(value);
    });
  });
  data.dates.forEach((item) => {
    Object.entries(item.slots).forEach(([time, value]) => {
      map[slotKey(item.date, time)] = Number(value);
    });
  });

  return map;
}

export default function SlotsTab({ api, points, days, maxCount, rights, confirm, showAlert }) {
  const [pointId, setPointId] = useState(points[0]?.id ?? 0);
  const [data, setData] = useState(EMPTY_DATA);
  const [draft, setDraft] = useState({});
  const [mode, setMode] = useState("week");
  const [extraDates, setExtraDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [newDate, setNewDate] = useState(null);
  const [expandedHours, setExpandedHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState({ open: false, loading: false, rows: [] });
  const [copy, setCopy] = useState({ open: false, sourceId: "", loading: false });

  const canEdit = rights.slots_edit;
  const pointOptions = useMemo(
    () => points.map((point) => ({ id: String(point.id), name: point.name })),
    [points],
  );
  const savedMap = useMemo(() => toSavedMap(data), [data]);
  const hours = useMemo(() => getHours(data.slots), [data.slots]);
  const draftKeys = Object.keys(draft);

  const dateKeys = useMemo(() => {
    const keys = new Set([...data.dates.map((item) => item.date), ...extraDates]);
    Object.keys(draft).forEach((key) => {
      const dayKey = key.split("|")[0];
      if (isDateKey(dayKey)) keys.add(dayKey);
    });

    return [...keys].sort();
  }, [data.dates, draft, extraDates]);

  const activeDate = dateKeys.includes(selectedDate) ? selectedDate : (dateKeys[0] ?? "");
  const weekColumns = useMemo(
    () => days.map((day) => ({ key: String(day.id), label: String(day.name) })),
    [days],
  );
  const dayNames = useMemo(
    () => Object.fromEntries(days.map((day) => [String(day.id), String(day.name)])),
    [days],
  );
  const columns =
    mode === "week"
      ? weekColumns
      : activeDate
        ? [{ key: activeDate, label: formatDateKey(activeDate), header: "Предзаказов на слот" }]
        : [];

  const loadSlots = useCallback(
    async (nextPointId) => {
      if (!nextPointId) return;

      setLoading(true);
      try {
        const result = await api.getSlots(nextPointId);
        setData(result);
        setDraft({});
        setExtraDates((prev) =>
          prev.filter((date) => !result.dates.some((item) => item.date === date)),
        );
      } catch (error) {
        showAlert(getErrorText(error, "Не удалось загрузить лимиты слотов"), false);
      } finally {
        setLoading(false);
      }
    },
    [api, showAlert],
  );

  useEffect(() => {
    loadSlots(pointId);
  }, [loadSlots, pointId]);

  const getValue = (dayKey, time) => {
    const key = slotKey(dayKey, time);

    return key in draft ? draft[key] : (savedMap[key] ?? null);
  };

  const isDirty = (dayKey, time) => slotKey(dayKey, time) in draft;

  const setCells = (dayKey, times, raw) => {
    const value = parseSlotInput(raw, maxCount);

    setDraft((prev) => {
      const next = { ...prev };
      times.forEach((time) => {
        const key = slotKey(dayKey, time);
        if ((savedMap[key] ?? null) === value) {
          delete next[key];
        } else {
          next[key] = value;
        }
      });

      return next;
    });
  };

  const confirmDiscard = async () => {
    if (draftKeys.length === 0) return true;

    return confirm({
      title: "Несохранённые изменения",
      message: "Продолжить без сохранения? Изменения будут потеряны.",
      confirmLabel: "Продолжить",
      cancelLabel: "Остаться",
    });
  };

  const handlePointChange = async (event) => {
    const nextPointId = Number(event.target.value);
    if (nextPointId === pointId || !(await confirmDiscard())) return;

    setExtraDates([]);
    setSelectedDate("");
    setPointId(nextPointId);
  };

  const handleToggleHour = (hour) =>
    setExpandedHours((prev) =>
      prev.includes(hour) ? prev.filter((item) => item !== hour) : [...prev, hour],
    );

  const handleAddDate = () => {
    const date = newDate && dayjs(newDate).isValid() ? dayjs(newDate).format("YYYY-MM-DD") : "";
    if (!date) {
      showAlert("Выберите дату", false);
      return;
    }

    if (!dateKeys.includes(date)) setExtraDates((prev) => [...prev, date]);
    setSelectedDate(date);
    setNewDate(null);
  };

  const dropDateDraft = (date) => {
    setExtraDates((prev) => prev.filter((item) => item !== date));
    setDraft((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([key]) => key.split("|")[0] !== date)),
    );
  };

  const handleDeleteDate = async (date) => {
    const isSaved = data.dates.some((item) => item.date === date);
    if (!isSaved) {
      dropDateDraft(date);
      return;
    }

    const accepted = await confirm({
      title: "Удалить дату",
      message: `Удалить особые значения на ${formatDateKey(date)}? День будет работать по своему дню недели.`,
      confirmLabel: "Удалить",
      cancelLabel: "Отмена",
      confirmTone: "danger",
    });
    if (!accepted) return;

    setSaving(true);
    try {
      await api.deleteSlotsDate(pointId, date);
      showAlert("Дата удалена", true);
      const keptDraft = Object.fromEntries(
        Object.entries(draft).filter(([key]) => key.split("|")[0] !== date),
      );
      await loadSlots(pointId);
      setDraft(keptDraft);
    } catch (error) {
      showAlert(getErrorText(error, "Не удалось удалить дату"), false);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (draftKeys.length === 0) return;

    setSaving(true);
    try {
      const result = await api.saveSlots(pointId, buildSlotItems(draft));
      showAlert(
        result.changed > 0 ? `Сохранено ячеек: ${result.changed}` : "Значения не изменились",
        true,
      );
      await loadSlots(pointId);
    } catch (error) {
      showAlert(getErrorText(error, "Не удалось сохранить лимиты слотов"), false);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    const sourceId = Number(copy.sourceId);
    if (!sourceId) return;

    setCopy((prev) => ({ ...prev, loading: true }));
    try {
      const sourceMap = toSavedMap(await api.getSlots(sourceId));
      const nextDraft = {};
      new Set([...Object.keys(savedMap), ...Object.keys(sourceMap)]).forEach((key) => {
        const target = sourceMap[key] ?? null;
        if ((savedMap[key] ?? null) !== target) nextDraft[key] = target;
      });

      setDraft(nextDraft);
      setCopy({ open: false, sourceId: "", loading: false });
      showAlert("Значения подставлены. Проверьте и сохраните.", true);
    } catch (error) {
      setCopy((prev) => ({ ...prev, loading: false }));
      showAlert(getErrorText(error, "Не удалось загрузить лимиты кафе"), false);
    }
  };

  const openHistory = async () => {
    setHistory({ open: true, loading: true, rows: [] });
    try {
      const rows = await api.getSlotsHistory(pointId);
      setHistory({ open: true, loading: false, rows });
    } catch (error) {
      setHistory({ open: false, loading: false, rows: [] });
      showAlert(getErrorText(error, "Не удалось загрузить историю"), false);
    }
  };

  const formatCount = (value, emptyText) =>
    value === null || value === undefined
      ? emptyText
      : Number(value) === 0
        ? "0, закрыт"
        : String(value);

  const historyColumns = [
    { key: "created_at", label: "Когда", render: (row) => formatDateTime(row.created_at) },
    {
      key: "day_key",
      label: "День",
      render: (row) =>
        isDateKey(row.day_key)
          ? formatDateKey(row.day_key)
          : (dayNames[String(row.day_key)] ?? row.day_key),
    },
    { key: "slot_time", label: "Слот", render: (row) => row.slot_time },
    { key: "old_count", label: "Было", render: (row) => formatCount(row.old_count, "—") },
    { key: "new_count", label: "Стало", render: (row) => formatCount(row.new_count, "очищено") },
    { key: "user_name", label: "Кто", render: (row) => row.user_name || "" },
  ];

  return (
    <>
      <JacoBackdropLoader open={loading || saving} />

      <HistoryModal
        open={history.open}
        onClose={() => setHistory((prev) => ({ ...prev, open: false }))}
        title="История правок лимитов слотов"
        columns={historyColumns}
        rows={history.rows}
        loading={history.loading}
      />

      <JacoModal
        open={copy.open}
        onClose={() => setCopy({ open: false, sourceId: "", loading: false })}
        title="Скопировать лимиты с другого кафе"
        maxWidth="sm"
        actions={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, width: "100%" }}>
            <JacoButton
              tone="secondary"
              onClick={() => setCopy({ open: false, sourceId: "", loading: false })}
            >
              Отмена
            </JacoButton>
            <JacoButton
              loading={copy.loading}
              disabled={!copy.sourceId}
              onClick={handleCopy}
            >
              Подставить
            </JacoButton>
          </Box>
        }
      >
        <Typography sx={{ ...uiTypography.body, color: uiColors.text, mb: 2 }}>
          Неделя и особые даты выбранного кафе заменят значения текущего. Сохранение отдельной
          кнопкой.
        </Typography>
        <JacoSelect
          label="Откуда"
          options={pointOptions.filter((option) => option.id !== String(pointId))}
          allowNone={false}
          value={copy.sourceId}
          onChange={(event) =>
            setCopy((prev) => ({ ...prev, sourceId: String(event.target.value) }))
          }
        />
      </JacoModal>

      <Grid
        container
        spacing={2}
        sx={{ mb: 2, alignItems: "center" }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <JacoSelect
            label="Кафе"
            options={pointOptions}
            allowNone={false}
            value={String(pointId)}
            onChange={handlePointChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
              gap: 1.5,
            }}
          >
            {canEdit && points.length > 1 ? (
              <JacoButton
                tone="secondary"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={() => setCopy({ open: true, sourceId: "", loading: false })}
              >
                Скопировать с кафе
              </JacoButton>
            ) : null}
            <JacoButton
              tone="secondary"
              startIcon={<HistoryRoundedIcon />}
              onClick={openHistory}
            >
              История
            </JacoButton>
          </Box>
        </Grid>
      </Grid>

      {data.enabled ? null : (
        <JacoAlert
          severity="warning"
          sx={{ mb: 2 }}
        >
          Учёт сетки для этого кафе выключен параметром «Учитывать сетку лимитов слотов». Значения
          можно сохранять, но действовать они не будут.
        </JacoAlert>
      )}

      <Typography sx={{ ...uiTypography.label, color: uiColors.text, mb: 2 }}>
        Число задаёт, сколько предзаказов принять на один 15-минутный слот: доставка, самовывоз и
        зал вместе. Ноль закрывает слот. В пустых ячейках действует лимит по умолчанию: доставка{" "}
        {data.defaultLimit.delivery}, самовывоз и зал {data.defaultLimit.other}.
      </Typography>

      <JacoSegmentedTabs
        items={MODES}
        value={mode}
        size="compact"
        onChange={(_, nextMode) => setMode(nextMode)}
        sx={{ mb: 2, maxWidth: 420 }}
      />

      {mode === "dates" ? (
        <JacoSurface sx={{ p: 2, mb: 2 }}>
          <Grid
            container
            spacing={2}
            sx={{ alignItems: "center" }}
          >
            {canEdit ? (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <JacoDatePicker
                    label="Новая дата"
                    format="DD.MM.YYYY"
                    value={newDate}
                    minDate={dayjs()}
                    onChange={(value) => setNewDate(value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <JacoButton
                    tone="outlinePrimary"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleAddDate}
                  >
                    Добавить
                  </JacoButton>
                </Grid>
              </>
            ) : null}
            <Grid size={{ xs: 12, md: canEdit ? 7 : 12 }}>
              {dateKeys.length === 0 ? (
                <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted }}>
                  Особых дат пока нет. На особую дату значения задаются отдельно и важнее дня
                  недели.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {dateKeys.map((date) => (
                    <JacoButton
                      key={date}
                      compact
                      tone={date === activeDate ? "outlinePrimary" : "secondary"}
                      aria-pressed={date === activeDate}
                      onClick={() => setSelectedDate(date)}
                    >
                      {formatDateKey(date)}
                    </JacoButton>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </JacoSurface>
      ) : null}

      {columns.length > 0 ? (
        <JacoSurface
          sx={{ p: 1, mb: 2, overflow: "hidden", maxWidth: mode === "dates" ? 420 : "none" }}
        >
          {mode === "dates" && canEdit ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1,
                pb: 1,
              }}
            >
              <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                {formatDateKey(activeDate)}
              </Typography>
              <JacoIconButton
                aria-label={`Удалить дату ${formatDateKey(activeDate)}`}
                onClick={() => handleDeleteDate(activeDate)}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </JacoIconButton>
            </Box>
          ) : null}
          <SlotsGrid
            columns={columns}
            hours={hours}
            expandedHours={expandedHours}
            disabled={!canEdit}
            getValue={getValue}
            isDirty={isDirty}
            onToggleHour={handleToggleHour}
            onHourChange={(dayKey, hour, raw) => setCells(dayKey, getHourSlots(hour), raw)}
            onSlotChange={(dayKey, time, raw) => setCells(dayKey, [time], raw)}
          />
        </JacoSurface>
      ) : null}

      {canEdit ? (
        <JacoSurface
          sx={{
            position: "sticky",
            bottom: 16,
            zIndex: 2,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            boxShadow: "0px 10px 24px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Typography sx={{ ...uiTypography.label, color: uiColors.text }}>
            {draftKeys.length > 0 ? `Изменено ячеек: ${draftKeys.length}` : "Изменений нет"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <JacoButton
              tone="secondary"
              disabled={draftKeys.length === 0 || saving}
              onClick={() => setDraft({})}
            >
              Отменить
            </JacoButton>
            <JacoButton
              loading={saving}
              disabled={draftKeys.length === 0}
              onClick={handleSave}
            >
              Сохранить
            </JacoButton>
          </Box>
        </JacoSurface>
      ) : null}
    </>
  );
}
