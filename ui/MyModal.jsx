"use client";
import { Dialog, DialogTitle, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Close } from "@mui/icons-material";

/**
 * Generic modal wrapper — minimal, override-safe, MUI 7-compliant.
 * Accepts all Dialog props plus optional `title`.
 */
export default function MyModal({
  open = false,
  onClose,
  title,
  fullWidth = true,
  maxWidth = "xl",
  scroll = "body",
  fsBp = "sm", // breakpoint for full-screen mode
  children,
  ...rest
}) {
  const theme = useTheme();
  const fullscreen = useMediaQuery(theme.breakpoints.down(fsBp));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      fullscreen={fullscreen}
      maxWidth={maxWidth}
      scroll={scroll}
      {...rest}
    >
      {!!title && (
        <DialogTitle
          sx={{
            pr: 5, // space for close button
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {title}
        </DialogTitle>
      )}
      <IconButton
        aria-label="закрыть"
        onClick={onClose}
        size="small"
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close fontSize="small" />
      </IconButton>

      {children}
    </Dialog>
  );
}
