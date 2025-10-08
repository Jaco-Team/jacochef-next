import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
// import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { MyTextInput } from "@/components/shared/Forms";
import { useEffect, useState } from "react";

export default function AllergensModal(props) {
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!props.item) {
      return;
    }

    if (props.item !== item) {
      setItem(props.item);
    }
  }, [props.item]);

  const changeItem = (data, event) => {
    const newItem = { ...item, [data]: event.target.value };
    setItem(newItem);
  };

  const save = () => {
    props.save(item);
    onClose();
  };

  const onClose = () => {
    setItem(null);
    props.onClose();
  };

  return (
    <Dialog
      open={props.open}
      onClose={onClose}
      fullScreen={props.fullScreen}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogTitle className="button">
        {props.method}
        {props.itemName ? `: ${props.itemName}` : null}
      </DialogTitle>
      <IconButton
        onClick={onClose}
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
            size={{
              xs: 12,
              sm: 12
            }}>
            <MyTextInput
              label="Название"
              value={item?.name || ""}
              func={changeItem.bind(this, "name")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 12
            }}>
            <MyTextInput
              label="Доп. название"
              value={item?.dop_name || ""}
              func={changeItem.bind(this, "dop_name")}
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
  );
}
