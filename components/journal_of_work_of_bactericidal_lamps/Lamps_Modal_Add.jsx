"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import { MyTextInput } from "@/ui/Forms";

const EMPTY_STATE = {
  active_id: "",
  number: "",
  name: "",
  resource: "",
  place: "",
};

export default function Lamps_Modal_Add(props) {
  const { open, onClose, add, lampEdit, fullScreen } = props;

  const [form, setForm] = useState(EMPTY_STATE);

  useEffect(() => {
    if (!lampEdit) return;

    setForm({
      active_id: lampEdit?.id ?? "",
      number: lampEdit?.number ?? "",
      name: lampEdit?.name ?? "",
      resource: lampEdit?.resource ?? "",
      place: lampEdit?.place ?? "",
    });
  }, [lampEdit]);

  const changeItem = useCallback((key, event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  }, []);

  const handleAdd = useCallback(() => {
    add({
      id: form.active_id,
      number: form.number,
      name: form.name,
      resource: form.resource,
      place: form.place,
    });
  }, [add, form]);

  const handleClose = useCallback(() => {
    setForm(EMPTY_STATE);
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Typography variant="h6">Добавление</Typography>
        <IconButton
          onClick={handleClose}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Grid
          container
          spacing={3}
          sx={{ mt: 1 }}
        >
          <Grid size={12}>
            <MyTextInput
              label="Порядковый номер"
              value={form.number}
              func={(e) => changeItem("number", e)}
            />
          </Grid>

          <Grid size={12}>
            <MyTextInput
              label="Модель"
              value={form.name}
              func={(e) => changeItem("name", e)}
            />
          </Grid>

          <Grid size={12}>
            <MyTextInput
              label="Ресурс (часов)"
              type="number"
              value={form.resource}
              func={(e) => changeItem("resource", e)}
            />
          </Grid>

          <Grid size={12}>
            <MyTextInput
              label="Где размещена"
              value={form.place}
              func={(e) => changeItem("place", e)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={handleAdd}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
