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

export default function SkladCategoryDialog({
  open,
  mode,
  draft,
  sourceOptions,
  parentOptions,
  isParentDisabled,
  isSaveDisabled,
  onClose,
  onFieldChange,
  onSave,
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
        {mode === "edit" ? "Редактирование категории" : "Новая категория"}
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
            <MySelect
              label="Семейство"
              data={sourceOptions}
              is_none={false}
              value={draft?.source_type || "semi_finished"}
              disabled={mode === "edit"}
              func={(event) => onFieldChange("source_type", event.target.value)}
            />
          </Grid>

          <Grid size={12}>
            <MyTextInput
              label="Название"
              value={draft?.name || ""}
              func={(event) => onFieldChange("name", event.target.value)}
            />
          </Grid>

          <Grid size={12}>
            <MySelect
              label="Родительская категория"
              data={parentOptions}
              is_none={false}
              value={draft?.parent_id ?? ""}
              disabled={isParentDisabled}
              func={(event) => onFieldChange("parent_id", event.target.value)}
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
