"use client";

import { Box, Card, Stack, Typography } from "@mui/material";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";

export default function SectionCard({ title, subtitle, action, children }) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: CP_RADIUS.card,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: CP_SPACE.group,
          flex: 1,
          p: CP_PADDING.panel,
        }}
      >
        {hasHeader ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={CP_SPACE.component}
          >
            <Stack spacing={CP_SPACE.micro}>
              {title ? (
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700 }}
                >
                  {title}
                </Typography>
              ) : null}
              {subtitle ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {subtitle}
                </Typography>
              ) : null}
            </Stack>
            {action ? <Box>{action}</Box> : null}
          </Stack>
        ) : null}
        {children}
      </Box>
    </Card>
  );
}
