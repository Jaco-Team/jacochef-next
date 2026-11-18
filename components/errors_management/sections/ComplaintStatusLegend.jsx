"use client";

import { Box, Stack, Typography } from "@mui/material";
import { JacoStatusChip, uiColors, uiRadii } from "@/design-system/shared/ui";
import { COMPLAINT_STATUSES, REMOVED_ERRORS_LEGEND } from "../complaintStatusModel.mjs";

export const removedErrorsRowSx = {
  backgroundColor: uiColors.warningSoft,
  "&:hover": { backgroundColor: `${uiColors.warningSoft} !important` },
};

export const removedErrorsCardSx = {
  borderLeft: `4px solid ${uiColors.warning}`,
  backgroundColor: uiColors.warningSoft,
};

export default function ComplaintStatusLegend() {
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      aria-label="Обозначения статусов жалоб"
      sx={{ flexWrap: "wrap", alignItems: "center" }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Обозначения:
      </Typography>
      {COMPLAINT_STATUSES.map((status) => (
        <JacoStatusChip
          key={status.id}
          label={status.name}
          tone={status.tone}
          variant={status.variant}
        />
      ))}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: "center" }}
      >
        <Box
          aria-hidden
          sx={{
            width: 14,
            height: 14,
            borderRadius: uiRadii.xs,
            border: `1px solid ${uiColors.warning}`,
            backgroundColor: uiColors.warningSoft,
          }}
        />
        <Typography variant="body2">{REMOVED_ERRORS_LEGEND}</Typography>
      </Stack>
    </Stack>
  );
}
