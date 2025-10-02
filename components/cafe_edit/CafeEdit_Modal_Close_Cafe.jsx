"use client";

import { memo, useState } from "react";
import { MyAlert, MyAutocomplite2, MyCheckBox } from "@/ui/elements";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMyAlert from "@/src/hooks/useMyAlert";
import useCafeEditModalsStore from "./useCafeEditModalsStore";

const CafeEdit_Modal_Close_Cafe = (props) => {
  const { open, fullScreen, changeItemChecked } = props;

  const [confirmDialog, setConfirmDialog] = useState(false);

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const { is_сlosed_overload, is_сlosed_technic, show_comment, reason_list, chooseReason } =
    useCafeEditModalsStore();

  const open_confirm = () => {
    console.log(useCafeEditModalsStore.getState().reason_list)
    const { is_сlosed_overload, is_сlosed_technic, chooseReason } =
      useCafeEditModalsStore.getState();
    if (!is_сlosed_technic && !is_сlosed_overload) {
      showAlert("Необходимо указать причину закрытия кафе");
      return;
    }
    if (is_сlosed_technic && !chooseReason) {
      showAlert("Необходимо выбрать/указать причину технического закрытия кафе");
      return;
    }
    setConfirmDialog(true);
  };

  const changeReason = (event, value) => {
    const res = event.target.value || value || "";
    setModalsStateKey("chooseReason", res);

  };

  const save = () => {
    setConfirmDialog(false);
    props.stop_cafe();
    props.onClose();
  };

  const onClose = () => {
    setTimeout(() => {
      setConfirmDialog(false);
      closeAlert();
    }, 100);
    props.onClose();
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
          <Button onClick={save}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth={true}
        maxWidth={"sm"}
      >
        <DialogTitle>
          Причина закрытия кафе
          <IconButton
            onClick={onClose}
            style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
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
              sm={12}
            >
              <MyCheckBox
                label="Закрыто из-за большого количества заказов"
                value={parseInt(is_сlosed_overload) == 1 ? true : false}
                func={(e) => changeItemChecked("is_сlosed_overload", e)}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
            >
              <MyCheckBox
                label="Закрыто по техническим причинам"
                value={parseInt(is_сlosed_technic) == 1 ? true : false}
                func={(e) => changeItemChecked("is_сlosed_technic", e)}
              />
            </Grid>

            {!!show_comment && (
              <Grid
                item
                xs={12}
                sm={12}
              >
                <MyAutocomplite2
                  id="cafe_upr_edit"
                  data={reason_list}
                  value={chooseReason}
                  func={(e, v) => changeReason(e, v)}
                  multiple={false}
                  label="Причина"
                  freeSolo={true}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={open_confirm}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(CafeEdit_Modal_Close_Cafe);
