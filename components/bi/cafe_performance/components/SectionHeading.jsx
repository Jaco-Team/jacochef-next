"use client";

import { Box, Stack, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CP_PADDING, CP_SPACE } from "../layout";

function HeadingTitle({ title, tooltipText }) {
  const content = (
    <Stack
      direction="row"
      alignItems="center"
      spacing={CP_SPACE.micro}
      sx={{ width: "fit-content" }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700 }}
      >
        {title}
      </Typography>
      {tooltipText ? (
        <Box
          component="span"
          tabIndex={0}
          aria-label={`Описание раздела ${title}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.disabled",
            cursor: "help",
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: "50%",
            touchAction: "manipulation",
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
        </Box>
      ) : null}
    </Stack>
  );

  if (!tooltipText) return content;

  return (
    <Tooltip
      title={tooltipText}
      arrow
      placement="top"
      describeChild
      enterTouchDelay={0}
      leaveTouchDelay={3500}
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: 320,
            fontSize: 12,
            lineHeight: 1.45,
          },
        },
      }}
    >
      {content}
    </Tooltip>
  );
}

export default function SectionHeading({
  icon,
  iconColor = "warning.main",
  iconBg = "warning.50",
  title,
  subtitle,
  action,
  tooltipText,
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
          <HeadingTitle
            title={title}
            tooltipText={tooltipText}
          />
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
