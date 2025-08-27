"use client";

import { formatDate, MyAlert, MyDatePickerNew, MyTextInput } from "@/ui/elements";
import { memo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import useMyAlert from "../../src/hooks/useMyAlert";

const CafeEdit_Modal_Kkt_Info_Add = (props) => {
  const { open, fullScreen, addFN, onClose: parentOnClose } = props;

  const [date_start, setDateStart] = useState(formatDate(new Date()));
  const [date_end, setDateEnd] = useState(formatDate(new Date()));
  const [new_fn, setNewFn] = useState("");

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const add_new_fn = () => {

    if (!date_start || !date_end) {
      showAlert("Указание дат обязательно", true);
      return;
    }

    if (!new_fn) {
      showAlert("Указание номера обязательно", true);
      return;
    }

    addFN(new_fn, date_start, date_end);
    onClose();
  };

  const onClose = () => {
    setDateStart(formatDate(new Date()));
    setDateEnd(formatDate(new Date()));
    setNewFn("");
    closeAlert();
    parentOnClose();
  };

  return (
    <>
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />

      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle style={{ display: "flex", alignItems: "center" }}>
          Добавить ФН
          <IconButton
            onClick={onClose}
            style={{ marginLeft: "auto" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
              sm={6}
            >
              <MyDatePickerNew
                label="Дата регистрации"
                value={date_start}
                func={setDateStart}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <MyDatePickerNew
                label="Дата окончания"
                value={date_end}
                func={setDateEnd}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
            >
              <MyTextInput
                label="ФН"
                value={new_fn}
                func={setNewFn}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={add_new_fn}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(CafeEdit_Modal_Kkt_Info_Add);
