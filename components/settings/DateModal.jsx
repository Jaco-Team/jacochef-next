"use client";

import { MyDatePickerNew } from "@/components/shared/Forms";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
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
      <DialogTitle>Создать дату с которой будут применяться изменения</DialogTitle>

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
