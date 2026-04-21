"use client";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { CP_SPACE } from "../layout";

export default function CategoryPerformanceRow({ item, formatters, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`Открыть описание категории ${item.category_name}`}
      sx={{
        width: "100%",
        display: "block",
        textAlign: "left",
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 2fr) repeat(4, minmax(0, 1fr))",
          },
          gap: CP_SPACE.component,
          px: CP_SPACE.component,
          py: CP_SPACE.compact,
          alignItems: "center",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <Stack spacing={CP_SPACE.micro}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700 }}
          >
            {item.category_name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {formatters.integer(item.sample_size)} заказов
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          P50 {formatters.duration(item.p50)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          P90 {formatters.duration(item.p90)}
        </Typography>

        <Typography
          variant="body2"
          sx={{ fontWeight: 700 }}
        >
          SLA {formatters.percent(item.sla)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {formatters.integer(item.sample_size)} заказов
        </Typography>
      </Box>
    </ButtonBase>
  );
}
