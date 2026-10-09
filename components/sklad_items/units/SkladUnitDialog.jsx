"use client";

import SkladAutocomplete from "../ui/SkladAutocomplete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { JacoButton, JacoResponsiveModalShell, JacoTextInput } from "@/design-system/shared/ui";
import { uiRadii } from "@/design-system/shared/tokens";
import SkladUnitHistory from "./SkladUnitHistory";

function toNumericString(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

export default function SkladUnitDialog({
  open,
  mode,
  draft,
  unitOptions,
  onClose,
  onFieldChange,
  onSave,
  isSaveDisabled,
  showUsage = false,
  history = [],
  historyLoading = false,
  historyError = "",
  onRetryHistory,
  readOnly = false,
}) {
  const fieldsDisabled = readOnly || historyLoading || Boolean(historyError);
  const options = Array.isArray(unitOptions) ? unitOptions : [];
  const selectedUnit =
    options.find((option) => String(option.id) === String(draft?.con_id ?? 0)) || null;
  const activeRelations = Array.isArray(draft?.delete_usage?.active_relations)
    ? draft.delete_usage.active_relations
    : [];
  const usageCount = activeRelations.reduce(
    (total, relation) => total + (Number(relation?.count) || 0),
    0,
  );

  return (
    <JacoResponsiveModalShell
      open={open}
      onClose={onClose}
      title={
        readOnly ? "История единицы" : mode === "edit" ? "Редактирование единицы" : "Новая единица"
      }
      maxWidth="sm"
      actions={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", justifyContent: "space-between" }}
        >
          <JacoButton
            tone="danger"
            onClick={onClose}
          >
            {readOnly ? "Закрыть" : "Отмена"}
          </JacoButton>
          {!readOnly ? (
            <JacoButton
              tone="success"
              onClick={onSave}
              disabled={isSaveDisabled}
            >
              Сохранить
            </JacoButton>
          ) : null}
        </Stack>
      }
    >
      <Grid
        container
        spacing={2}
      >
        <Grid size={12}>
          <JacoTextInput
            label="Название"
            disabled={fieldsDisabled}
            value={draft?.name || ""}
            func={(event) => onFieldChange("name", event.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <JacoTextInput
            label="Базовое количество"
            disabled={fieldsDisabled}
            type="number"
            value={toNumericString(draft?.main_count)}
            func={(event) => onFieldChange("main_count", event.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <JacoTextInput
            label="Количество в связке"
            disabled={fieldsDisabled}
            type="number"
            value={toNumericString(draft?.con_count)}
            func={(event) => onFieldChange("con_count", event.target.value)}
          />
        </Grid>

        <Grid size={12}>
          <SkladAutocomplete
            label="Базовая единица"
            disabled={fieldsDisabled}
            placeholder="Введите название единицы"
            options={options}
            value={selectedUnit}
            disableClearable
            selectAppearance
            freeSolo={false}
            multiple={false}
            isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
            getOptionKey={(option) => String(option.id)}
            onChange={(_event, option) => {
              if (option) onFieldChange("con_id", option.id);
            }}
            autocompleteSx={{ width: "100%", minWidth: 0 }}
            slotProps={{
              popper: { allowAdaptivePlacement: true },
              listbox: {
                sx: {
                  maxHeight: "min(280px, calc(100dvh - 160px))",
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                },
              },
            }}
          />
        </Grid>
      </Grid>

      {showUsage && mode !== "create" && draft?.delete_usage ? (
        <Box sx={{ mt: 2 }}>
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: uiRadii.md,
              "&:first-of-type, &:last-of-type": { borderRadius: uiRadii.md },
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>Использования</Typography>
                <Chip
                  size="small"
                  label={usageCount}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.25}>
                {activeRelations.map((relation, relationIndex) => (
                  <Stack
                    key={`active-${relation?.source || "relation"}-${relationIndex}`}
                    spacing={0.5}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {relation?.label || "Использование"} ({relation?.count || 0})
                    </Typography>
                    {(relation?.items || []).map((item, itemIndex) => (
                      <Typography
                        key={`active-item-${item?.id ?? itemIndex}`}
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          pl: 1.5,
                        }}
                      >
                        {item?.name || "Без названия"}
                      </Typography>
                    ))}
                  </Stack>
                ))}
                {!activeRelations.length ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Активных использований нет.
                  </Typography>
                ) : null}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      ) : null}
      {mode !== "create" ? (
        <SkladUnitHistory
          history={history}
          loading={historyLoading}
          error={historyError}
          onRetry={onRetryHistory}
        />
      ) : null}
    </JacoResponsiveModalShell>
  );
}
