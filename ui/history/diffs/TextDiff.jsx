"use client";

import { Card, Stack, Typography } from "@mui/material";

function formatValue(value) {
  if (value !== null && typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

export default function TextDiff({ items }) {
  return (
    <Stack spacing={1}>
      {items.map(({ field, from, to }, index) => {
        const hasFromValue = from !== null && from !== undefined && from !== "";

        return (
          <Card
            key={`${field}-${index}`}
            variant="outlined"
          >
            <Stack
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

              {hasFromValue && (
                <>
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: "line-through", color: "text.secondary" }}
                  >
                    {formatValue(from)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    →
                  </Typography>
                </>
              )}

              <Typography
                variant="body2"
                fontWeight={500}
              >
                {formatValue(to)}
              </Typography>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}
