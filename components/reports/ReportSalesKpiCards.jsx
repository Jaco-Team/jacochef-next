import React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

const FONT =
  '"Roboto", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} ₽`;
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num)}%`;
}

function KpiCard({ label, value, valueColor = "#111827" }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: "1 1 160px",
        minWidth: 160,
        border: "1px solid #e5e7eb",
        borderRadius: 1.5,
        px: 2,
        py: 1.75,
        backgroundColor: "#fff",
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT,
          fontSize: 12,
          lineHeight: 1.3,
          color: "#9ca3af",
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: FONT,
          fontSize: { xs: 20, sm: 22 },
          fontWeight: 600,
          lineHeight: 1.2,
          color: valueColor,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function ReportSalesKpiCards({ totals }) {
  if (!totals) {
    return null;
  }

  const cards = [
    {
      key: "price",
      label: "Выручка",
      value: formatMoney(totals.price),
    },
    {
      key: "cost",
      label: "Себестоимость продаж",
      value: formatMoney(totals.cost),
    },
    {
      key: "gross_profit",
      label: "Валовая прибыль",
      value: formatMoney(totals.gross_profit),
      valueColor: Number(totals.gross_profit) < 0 ? "#dc2626" : "#16a34a",
    },
    {
      key: "markup_percent",
      label: "Наценка",
      value: formatPercent(totals.markup_percent),
    },
    {
      key: "margin_percent",
      label: "Маржинальность",
      value: formatPercent(totals.margin_percent),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        width: "100%",
      }}
    >
      {cards.map((card) => (
        <KpiCard
          key={card.key}
          label={card.label}
          value={card.value}
          valueColor={card.valueColor}
        />
      ))}
    </Box>
  );
}
