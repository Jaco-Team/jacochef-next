"use client";

import { useState, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MyCheckBox } from "@/ui/Forms";

function CafeEdit_Modal_Zone({ open, fullScreen, zone, save, onClose: parentOnClose }) {
  const [isActive, setIsActive] = useState(zone?.is_active);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const changeItemChecked = (event) => {
    const value = +event.target.checked;
    setIsActive(value);
  };

  const handleSave = () => {
    // TODO: test it, tries to mutate parent state through props
    if (zone) {
      zone.is_active = isActive;
    }
    save();
    onClose();
  };

  const onClose = () => {
    setTimeout(() => {
      setIsActive(0);
      setConfirmDialog(false);
    }, 100);
    parentOnClose();
  };

  return (
    <>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="sm"
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>Подтвердите действие</DialogTitle>
        <DialogContent
          align="center"
          sx={{ fontWeight: "bold" }}
        >
          <Typography>Вы действительно хотите сохранить данные?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => setConfirmDialog(false)}
          >
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Настройка активных зон доставки
          <IconButton
            onClick={onClose}
            style={{
              cursor: "pointer",
              position: "absolute",
              top: 0,
              right: 0,
              padding: 20,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <div style={{ marginBottom: 20 }}>
            <span>
              Если снять активность с выбранной зоны доставки, то прекратиться оформление новых
              доставок в данную зону
            </span>
          </div>
          <MyCheckBox
            label={zone?.zone_name || ""}
            value={isActive === 1}
            func={changeItemChecked}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setConfirmDialog(true)}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(CafeEdit_Modal_Zone);
