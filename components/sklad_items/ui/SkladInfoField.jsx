"use client";

import { Stack, Typography } from "@mui/material";

export default function SkladInfoField({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}
