"use client";
import React, { memo, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { CustomColorPicker } from "@/pages/stat_sale";
import { MyAutocomplite, MyDatePickerNewViews } from "@/ui/Forms";
import dayjs from "dayjs";
import { formatDate } from "@/src/helpers/ui/formatDate";

export const ModalAcceptEdit = ({
  open,
  onClose,
  save,
  title = "Подтвердить действие",
  points,
  point_chose,
}) => {
  const [pointSettings, setPointSettings] = useState([]);

  useEffect(() => {
    // Обновляем при открытии модального окна
    if (open && point_chose) {
      setPointSettings([point_chose]);
    }
  }, [open, point_chose]);

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        <Grid
          container
          spacing={3}
        >
          <Grid
            sx={{ marginTop: "10px" }}
            size={{
              xs: 12,
              sm: 12,
            }}
          >
            <MyAutocomplite
              label="Точки"
              data={points}
              multiple={true}
              value={pointSettings}
              func={(event, data) => {
                setPointSettings(data);
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onClose}
        >
          Отмена
        </Button>
        <Button onClick={() => save(pointSettings)}>Подтвердить</Button>
      </DialogActions>
    </Dialog>
  );
};

const ModalSettings = (props) => {
  const {
    open,
    fullScreen,
    type_modal,
    itemIdEdit,
    name_row,
    point_chose,
    balls: propBall = 0,
    points,
    value: propValue = 0,
    color_edit = "#2ECC71",
    openAlert,
    save,
    delete: deleteProp,
    onClose,
  } = props;
  const [color, setColor] = useState("#2ECC71");
  const [value, setValue] = useState(0);
  const [ball, setBall] = useState(0);
  const [date, setDate] = useState(null);
  const [openAccept, setOpenAccept] = useState(false);

  // Обновляем состояние при изменении props
  useEffect(() => {
    console.log(propBall);
    if (type_modal === "edit") {
      setValue(propValue);
      setBall(propBall);
      setColor(color_edit);
    }
  }, [type_modal, propValue, propBall, color_edit]);

  const changeItem = (event) => {
    let newValue = event.target.value;

    if (newValue === "") {
      newValue = "0";
    } else {
      newValue = newValue.replace(/^0+(?=\d)/, "");
    }

    const numericValue = Math.max(Number(newValue), 0);
    setValue(numericValue.toString());
  };

  const changeBall = (event) => {
    let newValue = event.target.value;
    setBall(newValue);
  };

  const hsvaConvertHex = ({ h, s, v, a = 1 }) => {
    const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const r = Math.round(f(5) * 255);
    const g = Math.round(f(3) * 255);
    const b = Math.round(f(1) * 255);

    const toHex = (num) => {
      const hex = num.toString(16).toUpperCase();
      return hex.length === 1 ? "0" + hex : hex;
    };

    const alphaHex = toHex(Math.round(a * 255));
    setColor(`#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`);
  };

  const handleSave = (points = []) => {
    if (!value || Number(value) <= 0) {
      openAlert(false, "Значение должно быть больше 0");
      return;
    }

    if (!date || date === "Invalid Date") {
      openAlert(false, "Укажите дату");
      return;
    }

    save({
      itemIdEdit,
      points,
      value,
      color,
      date_start: date,
      ball,
    });

    handleClose();
  };

  const handleDelete = () => {
    deleteProp();
    handleClose();
  };

  const handleClose = () => {
    setColor("#2ECC71");
    setValue(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={"md"}
      fullScreen={fullScreen}
    >
      <DialogTitle className="button">
        <Typography style={{ fontWeight: "bold" }}>
          {type_modal === "edit"
            ? `Редактировать данные в таблице в строке ${name_row}`
            : `Добавить данные в таблицу строку ${name_row}`}
        </Typography>
        <IconButton
          onClick={handleClose}
          style={{ cursor: "pointer" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {openAlert && (
        <ModalAcceptEdit
          open={openAccept}
          onClose={() => setOpenAccept(false)}
          save={handleSave}
          points={points}
          point_chose={point_chose}
        />
      )}
      <DialogContent>
        <Grid
          container
          spacing={10}
        >
          <Grid
            mt={3}
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <Typography>Время в минутах</Typography>
            <TextField
              type="number"
              value={value}
              size="small"
              variant="outlined"
              onChange={changeItem}
              onBlur={changeItem}
              fullWidth
              InputProps={{
                inputProps: { min: 0, step: 1 },
              }}
              sx={{
                margin: 0,
                padding: 0,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  fontWeight: "bold",
                  backgroundColor: color,
                  borderRadius: "8px",
                  backgroundClip: "padding-box",
                },
              }}
            />
            <Typography>Балл</Typography>
            <TextField
              type="number"
              value={ball}
              variant="outlined"
              onChange={changeBall}
              onBlur={changeBall}
              size="small"
              fullWidth
              InputProps={{
                inputProps: { min: -100, max: 100, step: 0.5 },
              }}
              sx={{
                margin: 0,
                padding: 0,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  fontWeight: "bold",
                  borderRadius: "8px",
                  backgroundClip: "padding-box",
                },
              }}
            />
          </Grid>
          <Grid
            mt={6}
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <MyDatePickerNewViews
              label="Дата старта"
              value={date}
              minDate={dayjs(new Date()).add(1, "day")}
              func={(e) => setDate(formatDate(e))}
            />
          </Grid>

          <Grid
            mt={3}
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <CustomColorPicker
              hsvaConvertHex={hsvaConvertHex}
              initialColor={color}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: type_modal === "edit" ? "space-between" : "flex-end",
        }}
      >
        {type_modal === "edit" && (
          <Button
            variant="contained"
            onClick={handleDelete}
          >
            Удалить
          </Button>
        )}

        <Button
          variant="contained"
          color="success"
          onClick={() => setOpenAccept(true)}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(ModalSettings);
