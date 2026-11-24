"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Stack, Tooltip, Typography } from "@mui/material";

export default function StageHint({ stages = [], selectedIds = [] }) {
  const described = stages.filter((stage) => stage?.description);
  if (!described.length) return null;
  const selected = new Set(selectedIds.map(String));
  return (
    <Tooltip
      arrow
      placement="top"
      enterTouchDelay={0}
      leaveTouchDelay={5000}
      slotProps={{ tooltip: { sx: { maxWidth: 320, fontSize: 12, lineHeight: 1.45 } } }}
      title={
        <Stack spacing={0.75}>
          {described.map((stage) => (
            <Box key={stage.id}>
              <Typography
                variant="caption"
                component="div"
                fontWeight={700}
              >
                {stage.name}
                {selected.has(String(stage.id)) ? " · выбран" : ""}
              </Typography>
              <Typography
                variant="caption"
                component="div"
              >
                {stage.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      }
    >
      <Box
        component="span"
        tabIndex={0}
        aria-label="Описание этапов"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 44,
          flexShrink: 0,
          color: "text.disabled",
          cursor: "help",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 18 }} />
      </Box>
    </Tooltip>
  );
}
