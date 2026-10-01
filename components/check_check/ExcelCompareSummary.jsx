import React from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { JacoAlert } from "@/design-system/shared/ui";
import ExcelOperationsButton from "./ExcelOperationsDialog";

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
  const unknownOperations = excelCompare?.warnings?.unknown_operations;
  const unknownTypes = excelCompare?.warnings?.unknown_operation_types;
  const hasUnknownDetails = Array.isArray(unknownOperations);
  const hasUnknown = hasUnknownDetails
    ? unknownOperations.length > 0
    : Array.isArray(unknownTypes) && unknownTypes.length > 0;
  const displayedUnknownTypes = hasUnknownDetails
    ? [...new Set(unknownOperations.map((row) => row.operation_type).filter(Boolean))]
    : Array.isArray(unknownTypes)
      ? unknownTypes
      : [];

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
      {hasUnknown && (
        <Box sx={{ mt: 1.5 }}>
          <JacoAlert severity="warning">
            {hasUnknownDetails
              ? `Не учтены операции с неизвестным типом: ${unknownOperations.length}. Сверка может быть неполной.`
              : "В файле найдены неизвестные типы операций. Для детализации загрузите файл повторно после обновления сервера."}
            {displayedUnknownTypes.length > 0 && ` Типы: ${displayedUnknownTypes.join(", ")}.`}
          </JacoAlert>
        </Box>
      )}
      <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <ExcelOperationsButton excelCompare={excelCompare} />
        {hasUnknown && (
          <ExcelOperationsButton
            excelCompare={excelCompare}
            onlyUnknown
            label="Показать пропущенные операции"
          />
        )}
      </Box>
    </Paper>
  );
}
