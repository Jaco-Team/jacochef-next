import { useCallback, useEffect, useMemo, useState } from "react";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Box, Grid, Typography } from "@mui/material";

import {
  JacoAlert,
  JacoBackdropLoader,
  JacoButton,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiTypography,
} from "@/design-system/shared/ui";

import HistoryModal from "./HistoryModal";
import SettingRow from "./SettingRow";
import {
  ALL_POINTS_ID,
  buildTimeOptions,
  formatDateTime,
  formatSettingValue,
  getErrorText,
  toSettingPayloadValue,
  validateSettingInput,
} from "./kitchenQueueUtils";

const ALL_POINTS_OPTION = { id: String(ALL_POINTS_ID), name: "Вся сеть" };

export default function SettingsTab({ api, points, rights, confirm, showAlert }) {
  const [pointId, setPointId] = useState(points[0]?.id ?? ALL_POINTS_ID);
  const [groups, setGroups] = useState([]);
  const [settings, setSettings] = useState([]);
  const [draft, setDraft] = useState({});
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState({ open: false, loading: false, rows: [] });

  const timeOptions = useMemo(() => buildTimeOptions(), []);
  const pointOptions = useMemo(
    () => [
      ALL_POINTS_OPTION,
      ...points.map((point) => ({ id: String(point.id), name: point.name })),
    ],
    [points],
  );
  const settingsByKey = useMemo(
    () => Object.fromEntries(settings.map((setting) => [setting.key, setting])),
    [settings],
  );

  const isAllPoints = pointId === ALL_POINTS_ID;
  const canEdit = rights.settings_edit && (!isAllPoints || rights.settings_all_edit);
  const draftKeys = Object.keys(draft);

  const errors = useMemo(() => {
    const result = {};
    Object.entries(draft).forEach(([key, entry]) => {
      const setting = settingsByKey[key];
      if (!setting || entry.reset) return;
      const error = validateSettingInput(setting, entry.value);
      if (error) result[key] = error;
    });

    return result;
  }, [draft, settingsByKey]);

  const loadSettings = useCallback(
    async (nextPointId) => {
      setLoading(true);
      try {
        const data = await api.getSettings(nextPointId);
        setGroups(data.groups);
        setSettings(data.settings);
        setDraft({});
        setComment("");
      } catch (error) {
        showAlert(getErrorText(error, "Не удалось загрузить параметры"), false);
      } finally {
        setLoading(false);
      }
    },
    [api, showAlert],
  );

  useEffect(() => {
    loadSettings(pointId);
  }, [loadSettings, pointId]);

  const handlePointChange = async (event) => {
    const nextPointId = Number(event.target.value);
    if (nextPointId === pointId) return;

    if (draftKeys.length > 0) {
      const accepted = await confirm({
        title: "Несохранённые изменения",
        message: "Перейти без сохранения? Изменения будут потеряны.",
        confirmLabel: "Перейти",
        cancelLabel: "Остаться",
      });
      if (!accepted) return;
    }

    setPointId(nextPointId);
  };

  const handleChange = (key, value) => {
    const setting = settingsByKey[key];
    if (!setting) return;

    setDraft((prev) => {
      const next = { ...prev };
      const numberText = String(value).trim().replace(",", ".");
      const unchanged =
        setting.type === "bool" || setting.type === "time"
          ? value === setting.value
          : numberText !== "" && Number(numberText) === Number(setting.value);
      if (unchanged) {
        delete next[key];
      } else {
        next[key] = { value };
      }

      return next;
    });
  };

  const handleReset = (key) => setDraft((prev) => ({ ...prev, [key]: { reset: true } }));

  const handleUndo = (key) =>
    setDraft((prev) => {
      const next = { ...prev };
      delete next[key];

      return next;
    });

  const handleSave = async () => {
    if (draftKeys.length === 0 || Object.keys(errors).length > 0) return;

    const critical = draftKeys
      .map((key) => settingsByKey[key])
      .filter(
        (setting) =>
          setting?.critical && draft[setting.key].value === true && setting.value !== true,
      );

    for (const setting of critical) {
      const accepted = await confirm({
        title: "Подтвердите включение",
        message: `${setting.name}. ${setting.hint}`,
        confirmLabel: "Включить",
        cancelLabel: "Отмена",
      });
      if (!accepted) return;
    }

    const items = draftKeys.map((key) => ({
      key,
      value: draft[key].reset ? null : toSettingPayloadValue(settingsByKey[key], draft[key].value),
    }));

    setSaving(true);
    try {
      const result = await api.saveSettings(pointId, items, comment.trim());
      showAlert(
        result.changed > 0 ? `Сохранено параметров: ${result.changed}` : "Значения не изменились",
        true,
      );
      await loadSettings(pointId);
    } catch (error) {
      showAlert(getErrorText(error, "Не удалось сохранить параметры"), false);
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async () => {
    setHistory({ open: true, loading: true, rows: [] });
    try {
      const rows = await api.getSettingsHistory(pointId);
      setHistory({ open: true, loading: false, rows });
    } catch (error) {
      setHistory({ open: false, loading: false, rows: [] });
      showAlert(getErrorText(error, "Не удалось загрузить историю"), false);
    }
  };

  const historyColumns = [
    { key: "created_at", label: "Когда", render: (row) => formatDateTime(row.created_at) },
    {
      key: "scope",
      label: "Где",
      render: (row) => (row.point_id === null || row.point_id === undefined ? "Вся сеть" : "Кафе"),
    },
    { key: "name", label: "Параметр", render: (row) => row.name },
    {
      key: "old_value",
      label: "Было",
      render: (row) => formatSettingValue(settingsByKey[row.key]?.type, row.old_value),
    },
    {
      key: "new_value",
      label: "Стало",
      render: (row) =>
        row.new_value === null || row.new_value === undefined
          ? "сброшено"
          : formatSettingValue(settingsByKey[row.key]?.type, row.new_value),
    },
    { key: "comment", label: "Комментарий", render: (row) => row.comment || "" },
    { key: "user_name", label: "Кто", render: (row) => row.user_name || "" },
  ];

  return (
    <>
      <JacoBackdropLoader open={loading || saving} />

      <HistoryModal
        open={history.open}
        onClose={() => setHistory((prev) => ({ ...prev, open: false }))}
        title="История правок параметров"
        columns={historyColumns}
        rows={history.rows}
        loading={history.loading}
      />

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
          <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
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

      {isAllPoints ? (
        <JacoAlert
          severity="info"
          sx={{ mb: 2 }}
        >
          Значения для всей сети действуют в кафе, где параметр не задан отдельно.
          {rights.settings_all_edit ? "" : " У вас нет права их менять."}
        </JacoAlert>
      ) : null}

      {groups.map((group) => {
        const groupSettings = settings.filter((setting) => setting.group === group.id);
        if (groupSettings.length === 0) return null;

        return (
          <JacoSurface
            key={group.id}
            sx={{ mb: 2, overflow: "hidden" }}
          >
            <Typography
              sx={{ ...uiTypography.sectionTitle, color: uiColors.textStrong, px: 2, py: 1.5 }}
            >
              {group.name}
            </Typography>
            {groupSettings.map((setting) => (
              <SettingRow
                key={setting.key}
                setting={setting}
                draft={draft[setting.key]}
                error={errors[setting.key]}
                canEdit={canEdit}
                timeOptions={timeOptions}
                onChange={handleChange}
                onReset={handleReset}
                onUndo={handleUndo}
              />
            ))}
          </JacoSurface>
        );
      })}

      {canEdit && settings.length > 0 ? (
        <JacoSurface
          sx={{
            position: "sticky",
            bottom: 16,
            zIndex: 2,
            p: 2,
            boxShadow: "0px 10px 24px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{ alignItems: "center" }}
          >
            <Grid size={{ xs: 12, md: 7 }}>
              <JacoTextInput
                label="Комментарий к изменению"
                value={comment}
                inputProps={{ maxLength: 255 }}
                onChange={(event) => setComment(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <JacoButton
                  tone="secondary"
                  disabled={draftKeys.length === 0 || saving}
                  onClick={() => setDraft({})}
                >
                  Отменить
                </JacoButton>
                <JacoButton
                  loading={saving}
                  disabled={draftKeys.length === 0 || Object.keys(errors).length > 0}
                  onClick={handleSave}
                >
                  {draftKeys.length > 0 ? `Сохранить (${draftKeys.length})` : "Сохранить"}
                </JacoButton>
              </Box>
            </Grid>
          </Grid>
        </JacoSurface>
      ) : null}
    </>
  );
}
