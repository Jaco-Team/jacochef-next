import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import FormControlLabel from "@mui/material/FormControlLabel";
import { IOSSwitch } from "@/components/vk_bot/ModalAddNewGroup";

export const ModalEditNewGroup = ({
  open,
  onClose,
  save,
  cities,
  title = "Редактирование группы",
  defaultValue,
}) => {
  const dV = {
    name: "",
    vk_group_id: 0,
    token: "",
    confirm: "",
    endpoint: "",
    city_id: {},
    is_active: 0,
    is_valid_token: 0,
  };
  const [data, setData] = useState(dV);

  useEffect(() => {
    if (open) {
      setData(defaultValue || dV);
    }
  }, [open, defaultValue]);

  const handleClose = () => {
    setData(dV);
    onClose();
  };

  const handleSave = () => {
    const data2 = {
      ...data,
      city_id: data.city_id.id,
    };
    save(data2);
  };

  const handleChange = (name, value) => {
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%" } }}
      maxWidth="xs"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        <Grid style={{ marginTop: "20px" }}>
          <MyTextInput
            value={data.name}
            func={(e) => handleChange("name", e.target.value)}
            label="Название *"
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyAutocomplite
            label="Точки"
            data={cities}
            multiple={false}
            value={data.city_id}
            func={(event, data) => {
              handleChange("city_id", data);
            }}
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyTextInput
            value={data.endpoint}
            func={(e) => handleChange("endpoint", e.target.value)}
            label="URL для api (например tlt, samara и т.д.) *"
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyTextInput
            value={data.vk_group_id}
            type="number"
            func={(e) => handleChange("vk_group_id", e.target.value)}
            label="ID группы *"
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyTextInput
            value={data.token}
            type="password"
            func={(e) => handleChange("token", e.target.value)}
            label="Token авторизации"
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyTextInput
            value={data.confirm}
            type="password"
            func={(e) => handleChange("confirm", e.target.value)}
            label="Confirm ключ"
          />
        </Grid>
        <Grid style={{ marginTop: "20px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "flex-start", marginLeft: "10px" }}>
            <FormControlLabel
              control={
                <IOSSwitch
                  onClick={(e) => handleChange("is_active", e.target.checked)}
                  checked={data.is_active}
                  color="secondary"
                  size="medium"
                />
              }
              labelPlacement="right"
              label="Активен"
            />
          </div>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={handleClose}
        >
          Отмена
        </Button>
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};
