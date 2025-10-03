"use client";

import { Alert as MuiAlert, Snackbar } from "@mui/material";
import { forwardRef } from "react";

const Alert = forwardRef(function Alert(props, ref) {
  return (
    <MuiAlert
      elevation={6}
      ref={ref}
      variant="filled"
      {...props}
    />
  );
});

export default function MyAlert({ isOpen, onClose, status, text }) {
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={30000}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      onClose={onClose}
    >
      <Alert
        onClose={onClose}
        severity={status ? "success" : "error"}
        sx={{ width: "100%" }}
      >
        {text || (status ? "Данные успешно сохранены!" : text)}
      </Alert>
    </Snackbar>
  );
}
