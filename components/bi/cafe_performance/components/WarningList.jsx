"use client";

import { Alert, Stack } from "@mui/material";

export default function WarningList({ warnings = [] }) {
  if (!warnings?.length) return null;

  return (
    <Stack spacing={1.5}>
      {warnings.map((warning, index) => (
        <Alert
          key={`${warning}-${index}`}
          severity="warning"
          variant="outlined"
        >
          {warning}
        </Alert>
      ))}
    </Stack>
  );
}
