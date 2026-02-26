"use client";

import { Box, Stack, Typography } from "@mui/material";

const BASE = "https://storage.yandexcloud.net/site-home-img/";

export default function MediaDiff({ items }) {
  return (
    <Stack spacing={2}>
      {items.map(({ field, from, to }, i) => (
        <Stack
          key={`${field}-${i}`}
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Box
            component="img"
            src={`${BASE}${from}`}
            sx={{ width: "100%", height: "auto", maxWidth: 520 }}
          />

          <Typography>→</Typography>

          <Box
            component="img"
            src={`${BASE}${to}`}
            sx={{ width: "100%", height: "auto", maxWidth: 520 }}
          />
        </Stack>
      ))}
    </Stack>
  );
}
