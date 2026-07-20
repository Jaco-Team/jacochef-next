"use client";

import { Chip, Paper, Stack, Typography } from "@mui/material";

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

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2 }}
        >
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 600 }}>Раздел подключен к shell модуля</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Контент для этой business-area еще не опубликован в текущем runtime scope.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}
