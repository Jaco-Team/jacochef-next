"use client";

import { Box, Typography } from "@mui/material";

export default function EmptyState({ text = "Нет данных для отображения" }) {
  return (
    <Box
      sx={{
        minHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 3,
        px: 2,
      }}
    >
      <Typography color="text.secondary">{text}</Typography>
    </Box>
  );
}
