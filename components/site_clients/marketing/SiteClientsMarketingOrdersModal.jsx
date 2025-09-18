"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Slide,
} from "@mui/material";
import { forwardRef, memo } from "react";
import useMarketingTabStore from "./useMarketingTabStore";
import { Close } from "@mui/icons-material";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SiteClientsMarketingOrdersModal({ isOpen, onClose, title, children }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const subtitle = useMarketingTabStore((state) => state.subtitle);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="stats-dialog-title"
      fullWidth={true}
      maxWidth={"xl"}
      fullScreen={fullScreen}
      TransitionComponent={Transition}
    >
      <DialogTitle
        className="button"
        id="stats-dialog-title"
      >
        <Typography
          style={{
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          {title} : {subtitle}
        </Typography>
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export default memo(SiteClientsMarketingOrdersModal);
