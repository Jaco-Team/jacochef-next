"use client";

import { MyDatePickerNew } from "@/ui/Forms";
import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { memo, useState } from "react";

const DateModal = ({ open, onClose, onSave }) => {
  const [newDate, setNewDate] = useState(null);

  const handleChange = (data) => {
    setNewDate(data);
  };

  const handleSubmit = () => {
    onSave(newDate);
    handleClose();
  };

  const handleClose = () => {
    setNewDate(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Создать дату с которой будут применяться изменения
        <IconButton
          onClick={handleClose}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <MyDatePickerNew
            label="Дата изменений"
            value={newDate}
            func={handleChange}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(DateModal);
