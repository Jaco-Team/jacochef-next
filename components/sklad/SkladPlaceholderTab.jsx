"use client";

import { Alert, Chip, Paper, Stack, Typography } from "@mui/material";

export default function SkladPlaceholderTab({ title, description, summaryValue = null }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {title}
          </Typography>

          {summaryValue !== null ? (
            <Chip
              label={`Активных: ${summaryValue}`}
              color="default"
              variant="outlined"
            />
          ) : null}
        </Stack>

        <Typography color="text.secondary">{description}</Typography>

        <Alert
          severity="info"
          sx={{ alignItems: "center" }}
        >
          Базовый shell готов. Следующим слайсом сюда подключается рабочий list/form flow.
        </Alert>
      </Stack>
    </Paper>
  );
}
