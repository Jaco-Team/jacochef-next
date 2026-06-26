import { useEffect, useMemo, useRef, useState } from "react";
import AddAlarmOutlinedIcon from "@mui/icons-material/AddAlarmOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import {
  Box,
  ClickAwayListener,
  Grid,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { V2Alert, V2Button, V2IconButton, V2Select, V2TimePicker } from "@/ui/v2";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

const TEMPERATURE_SUGGESTIONS = ["36.0", "36,6", "37.0"];

function normalizeNullableValue(value) {
  return value && value !== "none" ? value : "";
}

function buildDraft(data) {
  return {
    newApp: data?.newApp ?? "",
    mentorId: data?.mentorId ?? "",
    userTemp: data?.userTemp ?? "",
    typeHealf: data?.typeHealf ?? 2,
    hours: Array.isArray(data?.hours)
      ? data.hours.map((item, index) => ({
          id: item?.id || `hour-${index}`,
          time_start: item?.time_start ?? "",
          time_end: item?.time_end ?? "",
          appName: item?.appName ?? "",
        }))
      : [],
  };
}

function buildSavePayload(request, draft) {
  return {
    date: request?.date,
    user_id: request?.user_id,
    app_id: request?.app_id,
    smena_id: request?.smena_id,
    point_id: request?.point_id,
    new_app: normalizeNullableValue(draft.newApp),
    mentor_id: normalizeNullableValue(draft.mentorId),
    user_temp: draft.userTemp || "",
    type_healf: draft.typeHealf || "",
    hours: draft.hours.map((item) => ({
      time_start: item?.time_start ?? "",
      time_end: item?.time_end ?? "",
    })),
  };
}

function DayPersonHeader({ data, onHistoryOpen }) {
  return (
    <Box sx={{ position: "relative", pb: 2.75 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Box>
          <Typography sx={{ fontSize: 20, lineHeight: 1.2, fontWeight: 700, color: "#666666" }}>
            {data?.personName || data?.title || "—"}
          </Typography>
          <Typography sx={{ fontSize: 20, lineHeight: 1.25, color: "#666666", mt: 0.25 }}>
            {data?.positionName || data?.subtitle || "—"}
          </Typography>
          <Stack
            spacing={0.5}
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ fontSize: 16, lineHeight: 1.25, color: "#666666" }}>
              Нагрузка: {data?.loadTime || "—"}
            </Typography>
            <Typography sx={{ fontSize: 16, lineHeight: 1.25, color: "#666666" }}>
              Средняя нагрузка: {data?.averageLoadTime || "—"}
            </Typography>
            <Typography sx={{ fontSize: 16, lineHeight: 1.25, color: "#666666" }}>
              Бонус: {data?.bonusValue || 0}
            </Typography>
          </Stack>
        </Box>
        <Typography sx={{ fontSize: 20, lineHeight: 1.2, fontWeight: 700, color: "#666666" }}>
          {data?.dateLabel || "—"}
        </Typography>
      </Stack>

      <V2Button
        compact
        tone="secondary"
        startIcon={<DescriptionOutlinedIcon sx={{ fontSize: 17 }} />}
        onClick={onHistoryOpen}
        disabled={!data?.history?.length}
        sx={{
          position: "absolute",
          right: 0,
          bottom: 5,
          minWidth: 120,
          minHeight: 44,
          border: "none",
          borderRadius: "12px",
          backgroundColor: "#E5E5E5",
          color: "#666666",
          fontSize: 16,
          fontWeight: 500,
          "&:hover": { border: "none", backgroundColor: "#DCDCDC" },
          "&.Mui-disabled": { backgroundColor: "#E5E5E5", color: "#A6A6A6" },
        }}
      >
        История
      </V2Button>
    </Box>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontSize: 16,
        lineHeight: 1.25,
        fontWeight: 700,
        color: "#A6A6A6",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  );
}

function TemperatureField({ value, onChange }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const setTemperature = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleInputChange = (event) => {
    const nextValue = event.target.value
      .replace(/\./g, ",")
      .replace(/[^\d,]/g, "")
      .replace(/(,.*),/g, "$1")
      .slice(0, 4);
    onChange(nextValue);
  };

  return (
    <>
      <TextField
        ref={anchorRef}
        fullWidth
        size="small"
        label="Температура"
        value={value ?? ""}
        placeholder="Введите данные или выберите из списка"
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 44,
            borderRadius: open ? "18px 18px 0 0" : "18px",
            border: "1px solid #E5E5E5",
            backgroundColor: "#FFFFFF",
            "& .MuiOutlinedInput-notchedOutline": { display: "none" },
          },
          "& .MuiInputBase-input": {
            fontSize: 16,
            color: "#666666",
          },
          "& .MuiInputLabel-root": {
            color: "#A6A6A6",
            backgroundColor: "#FFFFFF",
            px: 1,
          },
        }}
        InputProps={{
          endAdornment: value ? (
            <IconButton
              size="small"
              onClick={() => onChange("")}
              sx={{ color: "#BABABA" }}
            >
              <CloseIcon />
            </IconButton>
          ) : (
            <IconButton
              size="small"
              onClick={() => setOpen((prev) => !prev)}
              sx={{ color: "#A6A6A6" }}
            >
              <KeyboardArrowDownRoundedIcon />
            </IconButton>
          ),
        }}
      />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        sx={{ zIndex: 1500, width: anchorRef.current?.offsetWidth }}
      >
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper
            sx={{
              border: "1px solid #E5E5E5",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
              overflow: "hidden",
            }}
          >
            <MenuList sx={{ p: 1 }}>
              <MenuItem
                onClick={() => setTemperature("")}
                sx={{ minHeight: 44 }}
              >
                None
              </MenuItem>
              {TEMPERATURE_SUGGESTIONS.map((item) => {
                const selected = String(value) === item;
                return (
                  <MenuItem
                    key={item}
                    selected={selected}
                    onClick={() => setTemperature(item)}
                    sx={{
                      minHeight: 44,
                      borderTop: "1px solid #E5E5E5",
                      borderRadius: selected ? "6px" : 0,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {item}
                    {selected ? <CheckRoundedIcon sx={{ color: "#EE2737" }} /> : null}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

function TimeRow({ item, onRemove }) {
  return (
    <Box
      sx={{
        minHeight: 44,
        border: "1px solid #E5E5E5",
        borderRadius: "12px",
        px: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        <AccessTimeIcon sx={{ fontSize: 22, color: "#A6A6A6" }} />
        <Typography sx={{ fontSize: 16, color: "#666666", lineHeight: 1.25 }}>
          {[item.time_start, item.time_end].filter(Boolean).join("-") || "—"}
        </Typography>
      </Stack>
      <V2IconButton
        aria-label="Удалить время"
        onClick={onRemove}
        sx={{
          width: 32,
          height: 32,
          border: "none",
          backgroundColor: "transparent",
          color: "#BABABA",
          "&:hover": { backgroundColor: "#F2F2F2" },
        }}
      >
        <CloseIcon />
      </V2IconButton>
    </Box>
  );
}

function HistoryDialog({ open, history, onClose }) {
  const [expandedId, setExpandedId] = useState("");

  useEffect(() => {
    if (open) {
      setExpandedId("");
    }
  }, [open]);

  return (
    <StaffScheduleResponsiveModal
      open={open}
      onClose={onClose}
      title="История редактирования"
      maxWidth="sm"
      paperSx={{ maxWidth: 600 }}
      contentSx={{ px: 2.5, pt: 2.5, minHeight: 292 }}
    >
      <Stack spacing={1.5}>
        {history.map((historyItem) => {
          const expanded = expandedId === historyItem.id;
          return (
            <Box
              key={historyItem.id}
              sx={{
                border: "1px solid #E5E5E5",
                borderRadius: "12px",
                px: 1.5,
                py: 1,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                onClick={() => setExpandedId(expanded ? "" : historyItem.id)}
                sx={{ minHeight: 40, cursor: "pointer" }}
              >
                <Typography
                  sx={{ fontSize: 16, color: "#666666", fontWeight: expanded ? 700 : 400 }}
                >
                  {historyItem.title}
                </Typography>
                <ExpandMoreIcon
                  sx={{
                    color: "#A6A6A6",
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </Stack>
              {expanded ? (
                <Stack
                  spacing={0.5}
                  sx={{ pb: 0.25 }}
                >
                  {historyItem.items.map((item) => (
                    <Typography
                      key={item.id}
                      sx={{ fontSize: 14, color: "#666666" }}
                    >
                      {[item.label, item.appName].filter(Boolean).join(" - ")}
                    </Typography>
                  ))}
                </Stack>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}

export default function StaffScheduleDayModal({ modal, onClose, onSave }) {
  const [draft, setDraft] = useState(() => buildDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);
  const [newTimeStart, setNewTimeStart] = useState("");
  const [newTimeEnd, setNewTimeEnd] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    setDraft(buildDraft(modal.data));
    setSaveError("");
    setIsSaving(false);
    setIsAddTimeOpen(false);
    setNewTimeStart("");
    setNewTimeEnd("");
    setIsHistoryOpen(false);
  }, [modal.open, modal.data]);

  const hasData = !modal.loading && modal.data;
  const appOptions = useMemo(() => modal.data?.otherApps ?? [], [modal.data?.otherApps]);
  const healthOptions = useMemo(() => modal.data?.healthOptions ?? [], [modal.data?.healthOptions]);

  const removeHour = (index) => {
    setDraft((prev) => ({
      ...prev,
      hours: prev.hours.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addHour = () => {
    if (!newTimeStart || !newTimeEnd) {
      setIsAddTimeOpen((prev) => !prev);
      return;
    }

    setDraft((prev) => ({
      ...prev,
      hours: [
        ...prev.hours,
        {
          id: `hour-${Date.now()}`,
          time_start: newTimeStart,
          time_end: newTimeEnd,
          appName: "",
        },
      ],
    }));
    setIsAddTimeOpen(false);
    setNewTimeStart("");
    setNewTimeEnd("");
  };

  const handleSave = async () => {
    if (!onSave || !modal.request) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(buildSavePayload(modal.request, draft));
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить день");
      setIsSaving(false);
    }
  };

  const actions =
    modal.loading || !modal.data ? null : (
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{ width: "100%" }}
      >
        <V2Button
          compact
          tone="secondary"
          onClick={onClose}
          disabled={isSaving}
          sx={{
            minWidth: 108,
            minHeight: 44,
            borderRadius: "12px",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          Отменить
        </V2Button>
        <V2Button
          compact
          tone="primary"
          onClick={handleSave}
          disabled={isSaving}
          sx={{ minWidth: 112, minHeight: 44, borderRadius: "12px", fontSize: 16 }}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </V2Button>
      </Stack>
    );

  return (
    <>
      <StaffScheduleResponsiveModal
        open={modal.open}
        onClose={onClose}
        title="Сведения о сотруднике"
        maxWidth="md"
        actions={actions}
        contentSx={{ px: 2.5, pt: 3.25, pb: 1.5 }}
        actionsSx={{ px: 2.5, pt: 1, pb: 3 }}
        paperSx={{ maxWidth: 800 }}
      >
        <Stack spacing={2.5}>
          {modal.error ? <V2Alert severity="error">{modal.error}</V2Alert> : null}
          {saveError ? <V2Alert severity="error">{saveError}</V2Alert> : null}

          {hasData ? (
            <>
              <DayPersonHeader
                data={modal.data}
                onHistoryOpen={() => setIsHistoryOpen(true)}
              />

              <V2Select
                options={appOptions}
                value={draft.newApp}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    newApp: event.target.value,
                  }))
                }
                label="Кем работает"
              />

              <Stack spacing={1}>
                <SectionTitle>Дневник здоровья</SectionTitle>
                <Grid
                  container
                  spacing={1.25}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TemperatureField
                      value={draft.userTemp}
                      onChange={(nextValue) =>
                        setDraft((prev) => ({
                          ...prev,
                          userTemp: nextValue,
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <V2Select
                      options={healthOptions}
                      value={draft.typeHealf}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          typeHealf: event.target.value,
                        }))
                      }
                      label="Здоровье"
                      allowNone={false}
                    />
                  </Grid>
                </Grid>
              </Stack>

              <Stack spacing={1}>
                <SectionTitle>Время работы</SectionTitle>
                <Grid
                  container
                  spacing={1.25}
                >
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={1}>
                      {draft.hours.map((item, index) => (
                        <TimeRow
                          key={item.id}
                          item={item}
                          onRemove={() => removeHour(index)}
                        />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <V2Button
                      fullWidth
                      tone="secondary"
                      startIcon={<AddAlarmOutlinedIcon />}
                      onClick={addHour}
                      sx={{
                        minHeight: 44,
                        border: "none",
                        borderRadius: "12px",
                        backgroundColor: "#E5E5E5",
                        color: "#666666",
                        fontSize: 16,
                        fontWeight: 500,
                        "&:hover": { border: "none", backgroundColor: "#DCDCDC" },
                      }}
                    >
                      Добавить время
                    </V2Button>
                    {isAddTimeOpen ? (
                      <Grid
                        container
                        spacing={1}
                        sx={{ mt: 1 }}
                      >
                        <Grid size={6}>
                          <V2TimePicker
                            value={newTimeStart}
                            onChange={(event) => setNewTimeStart(event.target.value)}
                            label="Начало"
                          />
                        </Grid>
                        <Grid size={6}>
                          <V2TimePicker
                            value={newTimeEnd}
                            onChange={(event) => setNewTimeEnd(event.target.value)}
                            label="Конец"
                          />
                        </Grid>
                      </Grid>
                    ) : null}
                  </Grid>
                </Grid>
              </Stack>
            </>
          ) : null}
        </Stack>
      </StaffScheduleResponsiveModal>

      <HistoryDialog
        open={isHistoryOpen}
        history={modal.data?.history ?? []}
        onClose={() => setIsHistoryOpen(false)}
      />
    </>
  );
}
