import React from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";

const StatItem = ({ label, value, color = "default" }) => (
  <Chip
    label={`${label}: ${value}`}
    color={color}
    variant={color === "default" ? "outlined" : "filled"}
    size="small"
  />
);

export default function ExcelCompareSummary({ excelCompare, formatNumber }) {
  if (!excelCompare) return null;

  const stats = excelCompare?.diff?.stats || {};
  const upload = excelCompare?.upload || {};
  const daysTotal = Number(stats.days_total) || 0;
  const daysOk = Number(stats.days_ok) || 0;
  const daysMismatch = Number(stats.days_mismatch) || 0;
  const rowsUsed = Number(upload.rows_used) || 0;
  const rowsTotal = Number(upload.rows_total) || 0;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <StatItem
          label="Сошлось"
          value={`${formatNumber(daysOk)}/${formatNumber(daysTotal)}`}
          color={daysMismatch > 0 ? "default" : "success"}
        />
        <StatItem
          label="Строк"
          value={`${formatNumber(rowsUsed)}/${formatNumber(rowsTotal)}`}
        />
        {daysMismatch > 0 && (
          <StatItem
            label="Ошибок"
            value={formatNumber(daysMismatch)}
            color="error"
          />
        )}
      </Box>
    </Paper>
  );
}
