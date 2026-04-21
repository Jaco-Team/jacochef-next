"use client";

import { Card, CardActionArea, Divider, Stack, Typography } from "@mui/material";
import SlaProgressBar from "./SlaProgressBar";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";
import MetricLabel from "./MetricLabel";

function MetricRow({ label, value, strong = false }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={CP_SPACE.related}
    >
      <MetricLabel
        text={label}
        variant="body2"
        color="text.secondary"
      />
      <Typography
        variant="body2"
        sx={{ fontWeight: strong ? 700 : 500 }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function CategoryPerformanceCard({
  title,
  p50,
  p90,
  sla,
  sampleSize,
  formatters,
  compact = false,
  onClick,
  ariaLabel,
}) {
  const content = (
    <>
      <Typography
        variant={compact ? "subtitle2" : "subtitle1"}
        sx={{ fontWeight: 700, mb: compact ? CP_SPACE.related : CP_SPACE.compact }}
        noWrap
      >
        {title}
      </Typography>
      <Stack
        spacing={compact ? CP_SPACE.micro : CP_SPACE.related}
        sx={{ mb: compact ? CP_SPACE.related : CP_SPACE.compact }}
      >
        <MetricRow
          label="P50"
          value={formatters.duration(p50)}
          strong
        />
        <MetricRow
          label="P90"
          value={formatters.duration(p90)}
        />
      </Stack>
      <Divider
        flexItem
        sx={{ mb: compact ? CP_SPACE.related : CP_SPACE.compact }}
      />
      <SlaProgressBar
        value={sla}
        formatter={formatters.percent}
      />
      {sampleSize != null ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: compact ? CP_SPACE.related : CP_SPACE.compact }}
        >
          {formatters.integer(sampleSize)} заказов
        </Typography>
      ) : null}
    </>
  );

  return (
    <Card
      sx={{
        borderRadius: CP_RADIUS.card,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          aria-label={ariaLabel || `Открыть описание категории ${title}`}
          sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
          }}
        >
          <Stack
            sx={{
              p: compact ? CP_SPACE.compact : CP_PADDING.card,
              minWidth: 0,
            }}
          >
            {content}
          </Stack>
        </CardActionArea>
      ) : (
        <Stack
          sx={{
            p: compact ? CP_SPACE.compact : CP_PADDING.card,
            minWidth: 0,
          }}
        >
          {content}
        </Stack>
      )}
    </Card>
  );
}
