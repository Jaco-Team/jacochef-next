"use client";

import { Box, Card, CardActionArea, Stack, Typography } from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";

export const BEST_EMPLOYEE_VARIANTS = {
  fastest: {
    label: "Самый быстрый",
    Icon: BoltRoundedIcon,
    iconBg: "#FFF0BF",
    iconFg: "#B8860B",
    decorColor: "#FFE7A3",
  },
  stable: {
    label: "Самый стабильный",
    Icon: VerifiedRoundedIcon,
    iconBg: "#E7EFFD",
    iconFg: "#1565C0",
    decorColor: "#D4E4FA",
  },
  sla: {
    label: "Лучший SLA",
    Icon: StarRoundedIcon,
    iconBg: "#E6F6EA",
    iconFg: "#2E7D32",
    decorColor: "#D3ECD9",
  },
};

export default function BestEmployeeCard({
  variant = "fastest",
  label,
  name,
  description,
  caption,
  onClick,
  ariaLabel,
}) {
  const decor = BEST_EMPLOYEE_VARIANTS[variant] || BEST_EMPLOYEE_VARIANTS.fastest;
  const Icon = decor.Icon;
  const content = (
    <>
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 112,
          height: 112,
          borderRadius: "50%",
          backgroundColor: decor.decorColor,
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
      <Stack
        direction="row"
        alignItems="center"
        spacing={CP_SPACE.related}
        sx={{ position: "relative", mb: CP_SPACE.related }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: decor.iconBg,
            color: decor.iconFg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label || decor.label}
        </Typography>
      </Stack>

      <Typography
        variant="h6"
        sx={{ fontWeight: 700, lineHeight: 1.25, position: "relative" }}
      >
        {name || "—"}
      </Typography>

      {description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: CP_SPACE.micro, position: "relative" }}
        >
          {description}
        </Typography>
      ) : null}

      {caption ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: "auto", pt: CP_SPACE.related, position: "relative" }}
        >
          {caption}
        </Typography>
      ) : null}
    </>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: CP_RADIUS.card,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          aria-label={ariaLabel || `Открыть карточку сотрудника ${name || ""}`.trim()}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            flex: 1,
            p: CP_PADDING.card,
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            p: CP_PADDING.card,
          }}
        >
          {content}
        </Box>
      )}
    </Card>
  );
}
