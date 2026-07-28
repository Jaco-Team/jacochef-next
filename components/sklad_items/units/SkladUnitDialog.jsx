"use client";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import useFullScreen from "@/src/hooks/useFullScreen";
import { MySelect, MyTextInput } from "@/ui/Forms";

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
}) {
  const fullScreen = useFullScreen();
  const activeRelations = Array.isArray(draft?.delete_usage?.active_relations)
    ? draft.delete_usage.active_relations
    : [];
  const usageCount = activeRelations.reduce(
    (total, relation) => total + (Number(relation?.count) || 0),
    0,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 700, pr: 7 }}>
        {mode === "edit" ? "Редактирование единицы" : "Новая единица"}
      </DialogTitle>

      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 12, right: 12 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 1 }}>
        <Grid
          container
          spacing={2}
        >
          <Grid size={12}>
            <MyTextInput
              label="Название"
              value={draft?.name || ""}
              func={(event) => onFieldChange("name", event.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextInput
              label="Базовое количество"
              type="number"
              value={toNumericString(draft?.main_count)}
              func={(event) => onFieldChange("main_count", event.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextInput
              label="Количество в связке"
              type="number"
              value={toNumericString(draft?.con_count)}
              func={(event) => onFieldChange("con_count", event.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <MySelect
              label="Базовая единица"
              data={unitOptions}
              is_none={false}
              value={draft?.con_id ?? 0}
              func={(event) => onFieldChange("con_id", event.target.value)}
            />
          </Grid>
        </Grid>

        {showUsage && mode === "edit" && draft?.delete_usage ? (
          <Accordion
            disableGutters
            sx={{ mt: 2, border: 1, borderColor: "divider", borderRadius: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
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
                        color="text.secondary"
                        sx={{ pl: 1.5 }}
                      >
                        {item?.name || "Без названия"}
                      </Typography>
                    ))}
                  </Stack>
                ))}
                {!activeRelations.length ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Активных использований нет.
                  </Typography>
                ) : null}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ width: "100%" }}
        >
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={isSaveDisabled}
          >
            Сохранить
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
