"use client";

import { Stack, Typography } from "@mui/material";

export default function TextDiff({ items }) {
  return (
    <Stack spacing={1}>
      {items.map(({ field, from, to }) => (
        <Stack
          key={field}
          direction="row"
          spacing={1}
          flexWrap="wrap"
        >
          <Typography
            variant="body2"
            fontWeight={600}
          >
            {field}
          </Typography>

          <Typography
            variant="body2"
            sx={{ textDecoration: "line-through", color: "text.secondary" }}
          >
            {from}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            →
          </Typography>

          <Typography
            variant="body2"
            fontWeight={500}
          >
            {to}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
