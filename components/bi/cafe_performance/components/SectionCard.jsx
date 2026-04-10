"use client";

import { Paper, Stack, Typography } from "@mui/material";

export default function SectionCard({ title, subtitle, action, children, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        ...sx,
      }}
    >
      {(title || subtitle || action) && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{
            mb: 2,
          }}
        >
          <Stack spacing={0.5}>
            {title && (
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Stack>
          {action}
        </Stack>
      )}
      {children}
    </Paper>
  );
}
