import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import { Box, Grid, Tooltip, Typography } from "@mui/material";

import {
  JacoIconButton,
  JacoSelect,
  JacoSwitch,
  JacoTextInput,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";

import { formatNumber, formatSettingValue } from "./kitchenQueueUtils";

/**
 * Одна строка параметра. draft: undefined — не трогали, { reset: true } — сброс слоя, { value } — новое значение.
 */
export default function SettingRow({
  setting,
  draft,
  error,
  canEdit,
  timeOptions,
  onChange,
  onReset,
  onUndo,
}) {
  const isReset = draft?.reset === true;
  const isEdited = draft !== undefined && !isReset;
  const disabled = !canEdit || setting.locked;
  const shownValue = isReset ? setting.inherited_value : isEdited ? draft.value : setting.value;
  const hasOwnValue = setting.own_value !== null && setting.own_value !== undefined;
  const isOwn = isEdited || (hasOwnValue && !isReset);
  const sourceText = isEdited
    ? "будет задано после сохранения"
    : isReset
      ? `после сохранения: ${setting.inherited_source_text}`
      : setting.source_text;

  const renderControl = () => {
    if (setting.type === "bool") {
      return (
        <JacoSwitch
          checked={shownValue === true}
          disabled={disabled}
          onChange={(event) => onChange(setting.key, event.target.checked)}
          slotProps={{ input: { "aria-label": setting.name } }}
        />
      );
    }

    if (setting.type === "time") {
      return (
        <JacoSelect
          options={timeOptions}
          allowNone={false}
          inputProps={{ "aria-label": setting.name }}
          value={shownValue ?? ""}
          disabled={disabled}
          onChange={(event) => onChange(setting.key, event.target.value)}
        />
      );
    }

    return (
      <JacoTextInput
        value={isEdited ? draft.value : formatNumber(shownValue)}
        disabled={disabled}
        error={Boolean(error)}
        helperText={error || undefined}
        inputProps={{
          inputMode: setting.type === "int" ? "numeric" : "decimal",
          "aria-label": setting.name,
        }}
        inputAdornment={setting.unit ? <span>{setting.unit}</span> : undefined}
        onChange={(event) => onChange(setting.key, event.target.value)}
      />
    );
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: "center",
        px: 2,
        py: 1.5,
        borderTop: `1px solid ${uiColors.borderLight}`,
        backgroundColor: draft !== undefined ? uiColors.primarySoft : "transparent",
      }}
    >
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
            {setting.name}
          </Typography>
          {setting.locked ? (
            <Tooltip title={setting.lock_reason}>
              <LockOutlinedIcon
                fontSize="small"
                sx={{ color: uiColors.textMuted }}
              />
            </Tooltip>
          ) : null}
        </Box>
        {setting.hint ? (
          <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted, mt: 0.5 }}>
            {setting.hint}
          </Typography>
        ) : null}
        {setting.locked ? (
          <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted, mt: 0.5 }}>
            {setting.lock_reason}
          </Typography>
        ) : null}
      </Grid>

      <Grid size={{ xs: 12, sm: 5, md: 2.5 }}>{renderControl()}</Grid>

      <Grid size={{ xs: 12, sm: 7, md: 3.5 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
        >
          <Typography
            sx={{
              ...uiTypography.label,
              px: 1,
              py: 0.5,
              borderRadius: uiRadii.sm,
              color: isOwn ? uiColors.primary : uiColors.text,
              backgroundColor: isOwn ? uiColors.surface : uiColors.surfaceMuted,
              border: `1px solid ${isOwn ? uiColors.primary : "transparent"}`,
            }}
          >
            {sourceText}
          </Typography>

          {draft !== undefined ? (
            <Tooltip title="Отменить правку">
              <span>
                <JacoIconButton
                  aria-label={`Отменить правку: ${setting.name}`}
                  onClick={() => onUndo(setting.key)}
                >
                  <UndoRoundedIcon fontSize="small" />
                </JacoIconButton>
              </span>
            </Tooltip>
          ) : hasOwnValue && !disabled ? (
            <Tooltip
              title={`Сбросить. Будет ${formatSettingValue(
                setting.type,
                setting.inherited_value,
                setting.unit,
              )}: ${setting.inherited_source_text}`}
            >
              <span>
                <JacoIconButton
                  aria-label={`Сбросить значение: ${setting.name}`}
                  onClick={() => onReset(setting.key)}
                >
                  <RestartAltRoundedIcon fontSize="small" />
                </JacoIconButton>
              </span>
            </Tooltip>
          ) : null}
        </Box>
      </Grid>
    </Grid>
  );
}
