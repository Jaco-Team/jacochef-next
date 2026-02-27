"use client";

import { Box, Stack, Typography } from "@mui/material";

const BASE = "https://storage.yandexcloud.net/site-home-img/";

export default function MediaDiff({ items }) {
  return (
    <Stack spacing={3}>
      {items.map(({ field, from, to }, i) => (
        <Stack
          key={`${field}-${i}`}
          direction="row"
          spacing={2}
          flexWrap="wrap"
          alignItems="center"
          useFlexGap
        >
          <Box
            component="img"
            src={`${BASE}${from}`}
            sx={{
              flex: "1 1 200px", // grow, shrink, min 200px
              minWidth: 200,
              maxWidth: 520,
              width: "100%",
              height: "auto",
              borderRadius: 2,
            }}
          />

          <Typography
            sx={{
              flex: "0 0 auto",
              alignSelf: "center",
            }}
          >
            →
          </Typography>

          <Box
            component="img"
            src={`${BASE}${to}`}
            sx={{
              flex: "1 1 200px",
              minWidth: 200,
              maxWidth: 520,
              width: "100%",
              height: "auto",
              borderRadius: 2,
            }}
          />
        </Stack>
      ))}
    </Stack>
  );
}
