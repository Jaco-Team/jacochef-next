"use client";

import { memo, useEffect, useState } from "react";
import useMyAlert from "@/src/hooks/useMyAlert";
import { MySelect, MyTextInput } from "@/components/shared/Forms";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MyAlert from "@/components/shared/MyAlert";

const CafeEdit_Modal_New = (props) => {
  const { open, fullScreen } = props;

  const activePoint = useCafeEditModalsStore((s) => s.activePoint);

  const [item, setItem] = useState(activePoint);

  const changeItem = (key, event) => {
    setItem((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  const save = () => {
    if (!item?.city_id) {
      showAlert("Необходимо выбрать город");
      return;
    }
    if (!item?.addr) {
      showAlert("Необходимо указать адрес");
      return;
    }
    props.save(item);
    onClose();
  };

  const onClose = () => {
    useCafeEditModalsStore.setState({ activeItem: null });
    closeAlert();
    props.onClose();
  };

  useEffect(() => setItem(activePoint), [activePoint])

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
        fullWidth={true}
        maxWidth={"md"}
      >
        <DialogTitle className="button">
          Новая точка
          <IconButton
            onClick={onClose}
            style={{ cursor: "pointer" }}
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
              size={{
                xs: 12,
                sm: 6
              }}>
              <MySelect
                label="Город"
                is_none={false}
                data={item?.cities || []}
                value={item?.city_id || ""}
                func={(e) => changeItem("city_id", e)}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <MyTextInput
                label="Адрес"
                value={item?.addr || ""}
                func={(e) => changeItem("addr", e)}
              />
            </Grid>
          </Grid>
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
    </>
  );
};

export default memo(CafeEdit_Modal_New);
