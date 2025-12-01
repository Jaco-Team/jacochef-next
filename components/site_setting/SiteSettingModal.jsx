"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useFullScreen from "@/src/hooks/useFullScreen";

export function SiteSettingModal({
  open,
  children,
  customActions = null,
  title = "",
  closeModal,
  ...restProps
}) {
  const onClose = closeModal || restProps.onClose;
  const fullScreen = useFullScreen();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth={"xl"}
      {...restProps}
    >
      <DialogTitle className="button">{!!title && `${title}`}</DialogTitle>

      <IconButton
        onClick={onClose}
        style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent style={{ paddingBlock: 10 }}>{children || "no content"}</DialogContent>

      <DialogActions>
        {customActions || (
          <Button
            variant="contained"
            onClick={() => console.log("default action")}
          >
            Сохранить
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
