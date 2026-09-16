import { Backdrop, CircularProgress } from "@mui/material";

export default function JacoBackdropLoader({ open, sx, ...props }) {
  return (
    <Backdrop
      open={open}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 2, ...sx }}
      {...props}
    >
      <CircularProgress />
    </Backdrop>
  );
}
