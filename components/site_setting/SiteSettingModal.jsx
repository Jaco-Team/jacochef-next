"use client";

import { MyTextInput } from "@/ui/elements";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react";

export function SiteSettingModal(props) {
  const { open, onClose, fullScreen, item, itemName, method, save } = props;

  const [localItem, setLocalItem] = useState(item);

  const changeItem = (field, event) => {
    setItem({ ...item, [field]: event.target.value });
  };

  const saveLocal = () => {
    save(localItem);
    onClose();
  };

  const closeLocal = () => {
    setLocalItem(null);
    onClose();
  };

  useEffect(() => {
    if (item) {
      setLocalItem(item);
    }
  }, [item]);

  return (
    <Dialog
      open={open}
      onClose={() => closeLocal()}
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogTitle className="button">
        {method}
        {itemName && `: ${itemName}`}
      </DialogTitle>

      <IconButton
        onClick={() => closeLocal()}
        style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
      >
        <CloseIcon />
      </IconButton>

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
            <MyTextInput
              label="Название"
              value={localItem ? localItem.name : ""}
              func={(e) => changeItem("name", e)}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
          >
            <MyTextInput
              label="Ссылка"
              value={localItem ? localItem.link : ""}
              func={(e) => changeItem("name", e)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => saveLocal()}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
