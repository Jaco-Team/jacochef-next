"use client";

import { Card, Stack, Typography } from "@mui/material";

export default function TextDiff({ items }) {
  return (
    <Stack spacing={1}>
      {items.map(({ field, from, to }) => (
        <Card variant="outlined">
          <Stack
            key={field}
            direction="row"
            alignItems="baseline"
            spacing={2}
            sx={{
              px: 2,
              py: 1,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
            >
              {field}:
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
        </Card>
      ))}
    </Stack>
  );
}
