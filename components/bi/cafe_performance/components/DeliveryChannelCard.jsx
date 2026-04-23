"use client";

import { Box, Card, Stack, Typography } from "@mui/material";
import SlaProgressBar from "./SlaProgressBar";
import { resolveChannelIcon } from "./ChannelListItem";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";
import MetricLabel from "./MetricLabel";

export default function DeliveryChannelCard({
  orderType,
  name,
  count,
  p50,
  p90,
  sla,
  formatters,
  delta,
}) {
  const Icon = resolveChannelIcon(orderType);
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: CP_RADIUS.card,
        display: "flex",
        flexDirection: "column",
        p: CP_PADDING.card,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={CP_SPACE.compact}
        sx={{ mb: CP_SPACE.compact }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: CP_RADIUS.control,
            backgroundColor: "action.hover",
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Stack spacing={CP_SPACE.micro}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700 }}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {formatters.integer(count)} заказов
          </Typography>
        </Stack>
      </Stack>

      <Stack
        spacing={CP_SPACE.related}
        sx={{ mb: CP_SPACE.compact }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <MetricLabel
            text="P50"
            variant="body2"
            color="text.secondary"
          />
          <Stack
            direction="row"
            alignItems="center"
            spacing={CP_SPACE.related}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
            >
              {formatters.duration(p50)}
            </Typography>
            {delta}
          </Stack>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <MetricLabel
            text="P90"
            variant="body2"
            color="text.secondary"
          />
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formatters.duration(p90)}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ mt: "auto" }}>
        <SlaProgressBar
          value={sla}
          formatter={formatters.percent}
        />
      </Box>
    </Card>
  );
}
