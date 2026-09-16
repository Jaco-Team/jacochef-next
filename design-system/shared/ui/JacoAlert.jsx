import { Alert as MuiAlert, Snackbar } from "@mui/material";

export default function JacoAlert({
  isOpen,
  onClose,
  status,
  text,
  autoHideDuration = 30000,
  severity,
  children,
  ...props
}) {
  const resolvedSeverity = severity ?? (status ? "success" : "error");
  const content = children ?? text ?? (status ? "Данные успешно сохранены!" : "");

  if (isOpen === undefined) {
    return (
      <MuiAlert
        severity={resolvedSeverity}
        {...props}
      >
        {content}
      </MuiAlert>
    );
  }

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={onClose}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        severity={resolvedSeverity}
        onClose={onClose}
        sx={{ width: "100%" }}
        {...props}
      >
        {content}
      </MuiAlert>
    </Snackbar>
  );
}
