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
import { MyAutocomplite, MyTextInput } from "@/components/shared/Forms";

const AppointmentUnitModal = (props) => {
  const [unit, setUnit] = useState(props.unit);
  const [apps, setApps] = useState([]);

  const onClose = () => {
    props.onClose();
  };

  const save = useCallback(async () => {
    await props.save(unit);
    onClose();
  }, [unit]);

  useEffect(() => {
    setApps(props.apps);
  }, [props.apps]);

  useEffect(() => {
    setUnit(props.unit);
  }, [props.unit]);

  const { fullScreen, open, method, canEdit, canView } = props;

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
              size={{
                xs: 8
              }}>
              <MyTextInput
                label="Название отдела"
                value={unit?.name || ""}
                disabled={!canEdit("units")}
                func={(event) => {
                  setUnit((prev) => ({ ...prev, name: event.target.value }));
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 4
              }}>
              <MyTextInput
                type="number"
                inputProps={{ min: 0 }}
                label="Сортировка"
                value={unit?.sort || 0}
                disabled={!canEdit("units")}
                func={(event) => {
                  setUnit((prev) => ({ ...prev, sort: event.target.value }));
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 12
              }}>
              <MyAutocomplite
                data={apps}
                multiple={true}
                label="Должности отдела"
                value={unit?.apps || []}
                disabled={!canEdit("units") || !canEdit("app")}
                func={(_, newValue) => {
                  setUnit((prev) => ({ ...prev, apps: newValue }));
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          {canEdit("units") && (
            <Button
              color="primary"
              onClick={save}
            >
              Сохранить
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(AppointmentUnitModal);
