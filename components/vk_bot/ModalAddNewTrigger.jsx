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
import { IOSSwitch } from "@/components/vk_bot/ModalAddNewGroup";
import { MATCH_TYPE, SCENE_TYPE, TYPE_VK } from "@/pages/vk_bot";

export const ModalAddNewTrigger = ({
  open,
  onClose,
  save,
  scenes,
  groups,
  title = "Добавить триггер",
  defaultValue,
}) => {
  const dV = {
    name: "",
    vk_group_id: {},
    type_vk: {},
    phrase: "",
    answer: "",
    match_type: {},
    city_id: {},
    is_active: 0,
    scene: {},
    scene_id: {},
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
      vk_group_id: data.vk_group_id.vk_group_id,
      type_vk: data.type_vk.type_vk,
      match_type: data.match_type.match_type,
      scene: data.scene.id,
      scene_id: data.scene_id.id,
      city_id: data.vk_group_id.city_id,
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
            label="Группы ВК"
            data={groups}
            multiple={false}
            value={data.vk_group_id}
            func={(event, data) => {
              handleChange("vk_group_id", data);
            }}
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyAutocomplite
            label="Событие"
            data={TYPE_VK}
            multiple={false}
            value={data.type_vk}
            func={(event, data) => {
              handleChange("type_vk", data);
            }}
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyAutocomplite
            label="Режим"
            data={MATCH_TYPE}
            multiple={false}
            value={data.match_type}
            func={(event, data) => {
              handleChange("match_type", data);
            }}
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyTextInput
            value={data.phrase}
            func={(e) => handleChange("phrase", e.target.value)}
            label="Фраза"
          />
        </Grid>
        <Grid style={{ marginTop: "20px" }}>
          <MyAutocomplite
            label="Сценарий"
            data={SCENE_TYPE}
            multiple={false}
            value={data.scene}
            func={(event, data) => {
              handleChange("scene", data);
            }}
          />
        </Grid>
        {data.scene?.id === 2 ? (
          <Grid style={{ marginTop: "20px" }}>
            <MyAutocomplite
              label="Выбор сценария"
              data={scenes}
              multiple={false}
              value={data.scene_id}
              func={(event, data) => {
                handleChange("scene_id", data);
              }}
            />
          </Grid>
        ) : (
          <Grid style={{ marginTop: "20px" }}>
            <MyTextInput
              value={data.answer}
              multiline={true}
              minRows={4}
              func={(e) => handleChange("answer", e.target.value)}
              label="Ответ"
            />
          </Grid>
        )}
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
