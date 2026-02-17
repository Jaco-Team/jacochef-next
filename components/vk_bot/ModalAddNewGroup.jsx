import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import { styled, Switch } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";

export const IOSSwitch = styled((props) => (
  <Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
  />
))(({ theme }) => ({
  width: 42,
  height: 26,
  marginRight: 5,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#e82d2d",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#ec1919",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#ec1919",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

export const ModalAddNewGroup = ({
  open,
  onClose,
  save,
  cities,
  title = "Добавить группу",
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
