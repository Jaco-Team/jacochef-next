"use client";

import { Box } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import MilitaryTechRoundedIcon from "@mui/icons-material/MilitaryTechRounded";

const TOP_STYLE = {
  1: { bg: "#FFF6D6", fg: "#B8860B", Icon: EmojiEventsRoundedIcon },
  2: { bg: "#ECEFF4", fg: "#6B7280", Icon: WorkspacePremiumRoundedIcon },
  3: { bg: "#F6E7D7", fg: "#B35400", Icon: MilitaryTechRoundedIcon },
};

export default function RankBadge({ position }) {
  const decor = TOP_STYLE[position];
  if (decor) {
    const Icon = decor.Icon;
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: decor.bg,
          color: decor.fg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: "action.hover",
        color: "text.secondary",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {position}
    </Box>
  );
}
