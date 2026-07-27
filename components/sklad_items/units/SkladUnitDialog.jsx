"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
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
}) {
  const fullScreen = useFullScreen();

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
