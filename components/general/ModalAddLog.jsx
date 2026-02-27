import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";

export const ModalAddLog = ({
  open,
  onClose,
  save,
  title = "Создать новость",
  modules,
  defaultValue,
}) => {
  const [description, setDescription] = useState(defaultValue);
  const [module_id, setModule] = useState({});

  useEffect(() => {
    if (open) {
      setDescription(defaultValue || "");
    }
  }, [open, defaultValue]);

  const handleClose = () => {
    setDescription("");
    onClose();
  };

  const handleSave = () => {
    save({ description, module_id: module_id?.id });
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "100%" } }}
      maxWidth="md"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        <Grid style={{ marginTop: "20px" }}>
          <MyAutocomplite
            label="Модуль"
            data={modules}
            multiple={false}
            value={module_id}
            func={(event, data) => {
              setModule(data);
            }}
          />
        </Grid>
        <Grid style={{ marginTop: "10px" }}>
          <MyTextInput
            minRows={3}
            value={description}
            func={(e) => setDescription(e.target.value)}
            label="Описание"
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={handleClose}
        >
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};
