"use client";

import { Paper, Typography } from "@mui/material";

export default function PromoItemsStatEmptyState() {
  return (
    <Paper sx={{ py: 6, px: 2, textAlign: "center" }}>
      <Typography color="text.secondary">
        Нет данных за выбранный период. Настройте параметры и нажмите "ПОКАЗАТЬ".
      </Typography>
    </Paper>
  );
}
