"use client";

import { Box, Typography } from "@mui/material";

export default function DetailField({ label, value, fullWidth = false, emphasized = false }) {
  return (
    <Box sx={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={emphasized ? 700 : 500}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}
