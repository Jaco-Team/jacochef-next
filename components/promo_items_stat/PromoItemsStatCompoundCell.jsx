"use client";

import { Box, Chip, Typography } from "@mui/material";
import SmallFont from "@/ui/SmallFont";

export default function PromoItemsStatCompoundCell({ primary, secondary, direction = "column" }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        alignItems: direction === "row" ? "center" : "flex-start",
        gap: 0.5,
      }}
    >
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 500, lineHeight: 1.2 }}
      >
        {primary}
      </Typography>
      <Chip
        size="small"
        color="info"
        variant="outlined"
        sx={{ alignSelf: direction === "row" ? "center" : "flex-start", height: 22 }}
        label={<SmallFont size="0.6rem">{secondary}</SmallFont>}
      />
    </Box>
  );
}
