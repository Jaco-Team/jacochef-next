"use client";

import { Card, CardContent, Typography } from "@mui/material";

export default function KpiCard({ label, value, caption, tone = "default" }) {
  const valueColor =
    tone === "success"
      ? "success.main"
      : tone === "warning"
        ? "warning.dark"
        : tone === "danger"
          ? "error.main"
          : "text.primary";

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          color={valueColor}
        >
          {value}
        </Typography>
        {caption ? (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
          >
            {caption}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
