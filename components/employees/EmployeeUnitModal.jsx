import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

export default function EmployeeUnitModal({
  open,
  unitId,
  canEdit,
  request,
  showAlert,
  onClose,
  onSaved,
}) {
  const [unit, setUnit] = useState(null);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const response = await request("get_position_unit", { unit_id: unitId || 0 });
      if (!response?.st) {
        showAlert(false, response?.text || "Не удалось загрузить отдел");
        onClose();
        return;
      }

      setUnit({
        ...(response.unit || { name: "", sort: 0 }),
        apps: Array.isArray(response.unit?.apps) ? response.unit.apps : [],
      });
      setApps(Array.isArray(response.apps) ? response.apps : []);
    };

    load();
  }, [open, unitId]);

  const save = async () => {
    const response = await request("save_position_unit", { unit });
    if (!response?.st) {
      showAlert(false, response?.text || "Не удалось сохранить отдел");
      return;
    }

    showAlert(true, response.text || "Отдел сохранён");
    onSaved();
  };

  if (!unit) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {unit.id ? "Отдел" : "Новый отдел"}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={2}
          sx={{ pt: 1 }}
        >
          <Grid size={{ xs: 12, sm: 8 }}>
            <MyTextInput
              label="Название"
              value={unit.name ?? ""}
              disabled={!canEdit}
              func={(event) => setUnit((current) => ({ ...current, name: event.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextInput
              label="Порядок"
              type="number"
              value={unit.sort ?? 0}
              disabled={!canEdit}
              func={(event) => setUnit((current) => ({ ...current, sort: event.target.value }))}
            />
          </Grid>
          <Grid size={12}>
            <MyAutocomplite
              label="Должности отдела"
              data={apps}
              value={unit.apps ?? []}
              disabled={!canEdit}
              multiple
              func={(_, value) => setUnit((current) => ({ ...current, apps: value || [] }))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        {canEdit ? (
          <Button
            variant="contained"
            onClick={save}
          >
            Сохранить
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
