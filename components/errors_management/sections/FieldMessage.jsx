"use client";

import { Typography } from "@mui/material";

export default function FieldMessage({ children }) {
  if (!children) return null;
  return (
    <Typography
      variant="caption"
      color="error"
      role="alert"
      sx={{ display: "block", mt: 0.5, mx: 1.75 }}
    >
      {children}
    </Typography>
  );
}
