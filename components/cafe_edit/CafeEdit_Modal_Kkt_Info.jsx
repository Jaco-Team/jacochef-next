"use client";

import { memo, useEffect, useState } from "react";
import {
  formatDate,
  MyAlert,
  MyAutocomplite,
  MyCheckBox,
  MyDatePickerNew,
  MySelect,
  MyTextInput,
} from "@/ui/elements";
import {
  Dialog,
  DialogTitle,
  Typography,
  IconButton,
  DialogContent,
  Grid,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMyAlert from "@/src/hooks/useMyAlert";
import dayjs from "dayjs";
import CafeEdit_Modal_Kkt_Info_Add from "./CafeEdit_Modal_Kkt_Info_Add";

const defaultKassRange = [
  { id: "1", name: "1" },
  { id: "2", name: "2" },
  { id: "3", name: "3" },
  { id: "4", name: "4" },
  { id: "5", name: "5" },
  { id: "6", name: "6" },
];

const CafeEdit_Modal_Kkt_Info = (props) => {
  const { kkt, save_kkt, type, onClose: parentOnClose, fullScreen, pointModal, open } = props;
  const { canView, canEdit } = props;

  const [dateLicense, setDateLicense] = useState(null);
  const [rnKkt, setRnKkt] = useState("");
  const [fn, setFn] = useState("");
  const [kassa, setKassa] = useState("");
  const [dopKassa, setDopKassa] = useState("");
  const [base, setBase] = useState("");
  const [isActive, setIsActive] = useState(1);

  const [allFn, setAllFn] = useState([]);
  const [addDialog, setAddDialog] = useState(false);

  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();

  useEffect(() => {
    setAllFn(kkt?.all_fn ?? []);
    if (type === "update_kkt" || type === "view_kkt") {
      const name = `${kkt?.fn} ( с ${dayjs(kkt?.date_start).format("DD-MM-YYYY")} по ${dayjs(
        kkt?.date_end
      ).format("DD-MM-YYYY")} )`;

      let kkt_fn = {
        id: kkt?.fn,
        name,
        date_start: dayjs(kkt?.date_start).format("YYYY-MM-DD"),
        date_end: dayjs(kkt?.date_end).format("YYYY-MM-DD"),
      };

      setRnKkt(kkt.rn_kkt);
      setFn(kkt_fn);
      setKassa(kkt.kassa);
      setDopKassa(kkt.dop_kassa);
      setBase(kkt.base);
      setIsActive(parseInt(kkt.is_active));
      setDateLicense(kkt.date_license ? formatDate(kkt.date_license) : null);
    } else {
      setRnKkt("");
      setFn({ id: "", name: "", date_start: "", date_end: "" });
      setKassa("");
      setDopKassa("");
      setBase("");
      setIsActive(1);
    }
  }, [props]);

  const changeFN = (value) => {
    if (value && parseInt(value?.id) === 0) {
      setAddDialog(true);
    }
    setFn(value);
  };

  const addFN = (new_fn, date_start, date_end) => {
    if (!date_start || !date_end) {
      showAlert("Указание дат обязательно", false);
      return;
    }

    if (!new_fn) {
      showAlert("Указание номера обязательно", false);
      return;
    }

    const name = `${new_fn} ( с ${dayjs(date_start).format("DD-MM-YYYY")} по ${dayjs(
      date_end
    ).format("DD-MM-YYYY")} )`;

    const add_fn = {
      id: new_fn,
      name,
      date_start: dayjs(date_start).format("YYYY-MM-DD"),
      date_end: dayjs(date_end).format("YYYY-MM-DD"),
    };

    const all_fn = [...allFn, ...[add_fn]];

    setAllFn(all_fn);
    setAddDialog(false);
    setFn(add_fn);
  };

  const saveChanges = () => {
    if (!fn || parseInt(fn?.id) === 0) {
      showAlert("Необходимо указать ФН");
      return;
    }

    if (!rnKkt || !kassa || !dopKassa || !base || !dateLicense) {
      showAlert("Необходимо заполнить все поля");
      return;
    }

    const date_license = dayjs(dateLicense).format("YYYY-MM-DD");

    const data = {
      date_start: fn.date_start,
      date_end: fn.date_end,
      fn: fn.id,
      rn_kkt: rnKkt,
      kassa,
      dop_kassa: dopKassa,
      base,
      is_active: isActive,
      date_license,
    };

    save_kkt(data);
    onClose();
  };

  const onClose = () => {
    setDateLicense(null);
    setRnKkt("");
    setFn("");
    setKassa("");
    setDopKassa("");
    setBase("");
    setIsActive(1);
    setAllFn([]);
    setAddDialog(false);
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

      <CafeEdit_Modal_Kkt_Info_Add
        open={addDialog}
        onClose={() => setAddDialog(false)}
        fullScreen={fullScreen}
        addFN={addFN}
      />

      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle style={{ display: "flex", alignItems: "center" }}>
          <Typography>
            Точка: <span style={{ fontWeight: "bold" }}>{pointModal}</span>
          </Typography>
          <IconButton
            onClick={onClose}
            style={{ cursor: "pointer", marginLeft: "auto" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
          <Grid
            container
            spacing={3}
          >
            {type === "view_kkt" && (
              <>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Номер кассы"
                    value={kassa}
                    disabled={true}
                    className="disabled_input"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Доп касса"
                    value={dopKassa}
                    disabled={true}
                    className="disabled_input"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="РН ККТ"
                    value={rnKkt}
                    disabled={true}
                    className="disabled_input"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="База"
                    value={base}
                    disabled={true}
                    className="disabled_input"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                >
                  <MyTextInput
                    label="ФН"
                    value={fn?.name ?? ""}
                    disabled={true}
                    className="disabled_input"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="Лицензия ОФД дата завершения"
                    value={dateLicense}
                    disabled={true}
                    className="disabled_input"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MyTextInput
                    label="Активность"
                    value={parseInt(isActive) === 1 ? "Активна" : "Не активна"}
                    disabled={true}
                    className="disabled_input"
                  />
                </Grid>
              </>
            )}

            {(type === "update_kkt" || type === "add_kkt") && (
              <>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MySelect
                    is_none={false}
                    data={defaultKassRange}
                    value={kassa}
                    disabled={!canEdit("edit_kkt")}
                    func={(e) => canEdit("edit_kkt") && setKassa(e.target.value)}
                    label="Номер кассы"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MySelect
                    is_none={false}
                    data={defaultKassRange}
                    value={dopKassa}
                    disabled={!canEdit("edit_dop_kassa")}
                    func={(e) => canEdit("edit_dop_kassa") && setDopKassa(e.target.value)}
                    label="Доп касса"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="РН ККТ"
                    value={rnKkt}
                    disabled={!canEdit("edit_rn_kkt")}
                    func={(e) => canEdit("edit_rn_kkt") && setRnKkt(e.target.value)}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyTextInput
                    label="База"
                    value={base}
                    disabled={!canEdit("edit_base")}
                    func={(e) => canEdit("edit_base") && setBase(e.target.value)}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                >
                  <MyAutocomplite
                    label="ФН"
                    multiple={false}
                    disableCloseOnSelect={false}
                    disabled={!canEdit("edit_fn")}
                    data={allFn}
                    value={fn}
                    func={(_, value) => canEdit("edit_fn") && changeFN(value)}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <MyDatePickerNew
                    label="Лицензия ОФД дата завершения"
                    value={dateLicense}
                    disabled={!canEdit("edit_license")}
                    func={(date) => canEdit("edit_license") && setDateLicense(date)}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MyCheckBox
                    value={parseInt(isActive) === 1 ? true : false}
                    disabled={!canEdit("edit_active")}
                    func={(e) => canEdit("edit_active") && setIsActive(e.target.checked)}
                    label="Активность"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {type === "update_kkt" && (
            <Button
              variant="contained"
              onClick={saveChanges}
            >
              {type === "update_kkt" ? "Сохранить изменения" : "Добавить кассу"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default memo(CafeEdit_Modal_Kkt_Info);
