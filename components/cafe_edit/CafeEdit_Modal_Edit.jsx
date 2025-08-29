"use client";

import { memo, useState } from "react";
import { formatDate, MyDatePickerNew } from "@/ui/elements";
import dayjs from "dayjs";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


const CafeEdit_Modal_Edit = (props) => {
  const { open, fullScreen } = props;

  const [dateEdit, setDateEdit] = useState(formatDate(new Date()));

  const save = () => {
    const dateEditFormatted = dayjs(dateEdit).format("YYYY-MM-DD");
    props.save(dateEditFormatted);
    onClose();
  };

  const onClose = () => {
    setTimeout(() => {
      setDateEdit(formatDate(new Date()));
    }, 100);
    props.onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth={"sm"}
    >
      <DialogTitle>
        Укажите дату с которой будут действовать изменения
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
        <MyDatePickerNew
          label="Дата изменений"
          value={dayjs(dateEdit)}
          func={setDateEdit}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={save}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(CafeEdit_Modal_Edit);
