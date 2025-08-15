"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MyAutocomplite, MyCheckBox, MyTextInput } from "@/ui/elements";


export default function JModal({
  open,
  fullScreen,
  method,
  itemName,
  item: propItem,
  listCat: propListCat,
  mark,
  save,
  onClose,
}) {
  const [item, setItem] = useState(null);
  const [listCat, setListCat] = useState(null);
  const [itemCat, setItemCat] = useState(null);

  useEffect(() => {
    if (propItem) {
      const foundCat = propListCat?.find(
        (c) => parseInt(c.id) === parseInt(propItem.parent_id)
      );
      setItem(propItem);
      setListCat(propListCat || []);
      setItemCat(foundCat || null);
    }
  }, [propItem, propListCat]);

  const changeItem = (key, value) => {
    setItem((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const changeItemChecked = (key, checked) => {
    setItem((prev) =>
      prev ? { ...prev, [key]: checked === true ? 1 : 0 } : prev
    );
  };

  const changeItemCat = (key, value) => {
    setItem((prev) => (prev ? { ...prev, [key]: value ? value.id : "" } : prev));
    setItemCat(value);
  };

  const handleSave = () => {
    if (!item) return;
    save(item);
    handleClose();
  };

  const handleClose = () => {
    setItem(null);
    setListCat(null);
    setItemCat(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle className="button">
        {method}
        {itemName ? `: ${itemName}` : null}
      </DialogTitle>

      <IconButton
        onClick={handleClose}
        sx={{
          cursor: "pointer",
          position: "absolute",
          top: 0,
          right: 0,
          p: 2,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pb: 1, pt: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MyTextInput
              label="Название"
              value={item?.name || ""}
              func={(e) => changeItem("name", e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <MyTextInput
              label="Адрес модуля (URL)"
              value={item?.link ?? ""}
              func={(e) => changeItem("link", e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <MyAutocomplite
              label="Категория"
              multiple={false}
              data={listCat || []}
              value={itemCat || ""}
              func={(_event, value) => changeItemCat("parent_id", value)}
            />
          </Grid>

          {mark === "edit" && (
            <Grid item xs={12}>
              <MyCheckBox
                label="Активность"
                value={parseInt(item?.is_show) === 1}
                func={(e) => changeItemChecked("is_show", e.target.checked)}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={handleSave}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
