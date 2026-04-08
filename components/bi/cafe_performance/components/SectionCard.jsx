"use client";

import { Box, Paper, Typography } from "@mui/material";

export default function SectionCard({ title, subtitle, action, children, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.96) 100%)",
        ...sx,
      }}
    >
      {(title || subtitle || action) && (
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box>
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
          </Box>
          {action}
        </Box>
      )}
      {children}
    </Paper>
  );
}
