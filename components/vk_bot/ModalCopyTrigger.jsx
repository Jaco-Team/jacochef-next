import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import { styled, Switch } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";

export const ModalCopyTrigger = ({
  open,
  onClose,
  save,
  groups,
  title = "Перенос триггера",
  defaultValue,
}) => {
  const [data, setData] = useState([]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    save(data);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
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
            label="Группы"
            data={groups}
            multiple={true}
            value={data}
            func={(event, data) => {
              setData(data);
            }}
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
