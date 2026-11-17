import { Box, Rating, Typography } from "@mui/material";
import {
  JacoStatusChip,
  JacoSurface,
  uiColors,
  uiStateColors,
  uiTypography,
} from "@/design-system/shared/ui";

// Colour names used across the module; the values come from the design system tokens.
export const brandRed = uiColors.primary;
export const blockBackground = uiColors.surfaceMuted;
export const blockBorder = uiColors.border;
export const white = uiColors.surface;
export const successGreen = uiColors.successHover;
export const successBackground = uiColors.successSoft;
export const mutedBackground = uiStateColors.hover;
export const tableHeaderBackground = uiColors.surfaceMuted;
export const accordionHeaderBackground = uiStateColors.hover;
export const textPrimary = uiColors.textStrong;
export const textSecondary = uiColors.text;
export const CAFE_REVIEWS_AUTO_REFRESH_MINUTES = 1;

export const sectionTitleSx = {
  fontSize: 18,
  lineHeight: 1.3,
  fontWeight: 600,
  color: uiColors.textStrong,
};

export const tableHeadCellSx = {
  py: 1.25,
  fontSize: 13,
  fontWeight: 600,
  color: uiColors.text,
  backgroundColor: uiColors.surfaceMuted,
  borderBottomColor: uiColors.border,
  whiteSpace: "nowrap",
};

export const tableCellSx = {
  py: 1.25,
  fontSize: 14,
  color: uiColors.textStrong,
  borderBottomColor: uiColors.borderLight,
  fontVariantNumeric: "tabular-nums",
};

export const desktopOnlySx = {
  display: "none",
  "@media (min-width: 991px)": { display: "block" },
};

export const tabletOnlySx = {
  display: "none",
  "@media (min-width: 668px) and (max-width: 990px)": { display: "block" },
};

export const mobileOnlySx = {
  display: "none",
  "@media (max-width: 667px)": { display: "block" },
};

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getOptionLabel(options, value, fallback = "—") {
  if (!value) return fallback;
  if (value === "positive") return "Решён";
  return options.find((option) => String(option.value) === String(value))?.label || String(value);
}

const severityChips = {
  low: { tone: "success", variant: "soft" },
  medium: { tone: "warning", variant: "soft" },
  high: { tone: "danger", variant: "soft" },
  critical: { tone: "danger", variant: "filled" },
};

export function SeverityChip({ value, options }) {
  const chip = severityChips[value] || { tone: "neutral", variant: "outlined" };

  return (
    <JacoStatusChip
      {...chip}
      label={getOptionLabel(options, value, "Не задана")}
    />
  );
}

const statusChips = {
  in_progress: { tone: "warning", variant: "soft" },
  resolved: { tone: "success", variant: "soft" },
  positive: { tone: "success", variant: "soft" },
  dismissed: { tone: "neutral", variant: "soft" },
};

export function StatusChip({ value, options, highlightNew = false }) {
  const chip =
    highlightNew && value === "new"
      ? { tone: "danger", variant: "filled" }
      : statusChips[value] || { tone: "neutral", variant: "outlined" };

  return (
    <JacoStatusChip
      {...chip}
      label={getOptionLabel(options, value, "Без статуса")}
    />
  );
}

export function RatingValue({ value, size = "small", isIncident = false }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Rating
        value={Number(value) || 0}
        max={5}
        size={size}
        readOnly
        aria-label={`Оценка ${Number(value) || 0} из 5`}
        sx={isIncident ? { color: uiColors.primary } : undefined}
      />
      <Typography
        component="span"
        sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}
      >
        {Number(value) || 0}
      </Typography>
    </Box>
  );
}

export function EmptyState({ children }) {
  return (
    <JacoSurface
      role="status"
      sx={{
        p: 4,
        textAlign: "center",
        color: uiColors.text,
        borderStyle: "dashed",
      }}
    >
      {children}
    </JacoSurface>
  );
}

export function DetailRow({ label, children }) {
  return (
    <Box>
      <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.text, mb: 0.25 }}>
        {label}
      </Typography>
      <Box sx={{ color: uiColors.textStrong, overflowWrap: "anywhere" }}>{children || "—"}</Box>
    </Box>
  );
}

export function ZoneChip({ code, label }) {
  if (!code && !label) return null;

  return (
    <JacoStatusChip
      tone="success"
      variant="soft"
      label={label || "Кафе"}
    />
  );
}
