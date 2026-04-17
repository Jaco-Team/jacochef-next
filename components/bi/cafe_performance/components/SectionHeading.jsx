"use client";

import { Box, Stack, Typography } from "@mui/material";
import { CP_PADDING, CP_SPACE } from "../layout";

export default function SectionHeading({
  icon,
  iconColor = "warning.main",
  iconBg = "warning.50",
  title,
  subtitle,
  action,
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      spacing={CP_SPACE.group}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={CP_SPACE.component}
      >
        {icon ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: iconBg,
              color: iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Stack spacing={CP_SPACE.micro}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      {action ? (
        <Box sx={{ minWidth: { xs: "100%", sm: "auto" }, pt: { xs: CP_SPACE.related, sm: 0 } }}>
          {action}
        </Box>
      ) : null}
    </Stack>
  );
}
