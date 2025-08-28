"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { memo, useCallback, useEffect, useState } from "react";
import { MyAutocomplite, MyTextInput } from "@/ui/elements";

const AppointmentUnitModal = (props) => {
  const [unit, setUnit] = useState(props.unit);
  const [apps, setApps] = useState([]);

  const onClose = () => {
    setTimeout(() => {
      setUnit(null);
    }, 100);

    props.onClose();
  };

  const save = useCallback(async () => {
    try {
      await props.save(unit);
    } catch (error) {
      console.error("Error saving unit:", error);
    } finally {
      onClose();
    }
  }, [unit]);

  useEffect(() => {
    console.dir(props.apps);
    setApps(props.apps);
  }, [props.apps]);

  const { fullScreen, open, method } = props;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth={true}
        maxWidth={"lg"}
        fullScreen={fullScreen}
      >
        <DialogTitle>
          {method}
          {unit?.name ? `: ${unit.name}` : ""}
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
              xs={8}
            >
              <MyTextInput
                label="Название отдела"
                value={unit?.name || ""}
                func={(event) => {
                  setUnit((prev) => ({ ...prev, name: event.target.value }));
                }}
              />
            </Grid>
            <Grid
              item
              xs={4}
            >
              <MyTextInput
                type="number"
                label="Сортировка"
                value={unit?.sort || ''}
                func={(event) => {
                  setUnit((prev) => ({ ...prev, sort: event.target.value }));
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <MyAutocomplite
                data={apps}
                multiple={true}
                label="Должности отдела"
                value={unit?.apps || []}
                func={(_, newValue) => {
                  setUnit((prev) => ({ ...prev, apps: newValue }));
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            color="primary"
            onClick={save}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(AppointmentUnitModal);
