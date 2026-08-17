import { Box, Chip, Rating, Typography } from "@mui/material";

export const brandRed = "#DD1A32";
export const blockBackground = "#F3F3F3";
export const blockBorder = "#E5E5E5";
export const textPrimary = "#3C3B3B";
export const textSecondary = "#5E5E5E";
export const CAFE_REVIEWS_AUTO_REFRESH_MINUTES = 1;

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

export function SeverityChip({ value, options }) {
  const colors = {
    low: { color: "#356647", bgcolor: "#EAF5EE", borderColor: "#B8D9C3" },
    medium: { color: "#7A5900", bgcolor: "#FFF6D8", borderColor: "#E8D48F" },
    high: { color: "#A14C00", bgcolor: "#FFF0E1", borderColor: "#EDC299" },
    critical: { color: "#A11425", bgcolor: "#FDECEF", borderColor: "#E8AFB6" },
  };
  const palette = colors[value] || {
    color: textSecondary,
    bgcolor: "#F6F6F6",
    borderColor: blockBorder,
  };

  return (
    <Chip
      size="small"
      label={getOptionLabel(options, value, "Не задана")}
      sx={{ ...palette, border: "1px solid", fontWeight: 700 }}
    />
  );
}

export function StatusChip({ value, options, highlightNew = false }) {
  const isNewIncident = highlightNew && value === "new";

  return (
    <Chip
      size="small"
      label={getOptionLabel(options, value, "Без статуса")}
      sx={{
        color: isNewIncident ? "#FFFFFF" : textPrimary,
        bgcolor: isNewIncident ? brandRed : "#FFFFFF",
        border: `1px solid ${isNewIncident ? brandRed : blockBorder}`,
        fontWeight: 700,
      }}
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
        sx={isIncident ? { color: brandRed } : undefined}
      />
      <Typography
        component="span"
        sx={{ fontWeight: 800, color: textPrimary }}
      >
        {Number(value) || 0}
      </Typography>
    </Box>
  );
}

export function EmptyState({ children }) {
  return (
    <Box
      role="status"
      sx={{
        p: 4,
        textAlign: "center",
        color: textSecondary,
        bgcolor: "#FFFFFF",
        border: `1px solid ${blockBorder}`,
        borderRadius: "12px",
      }}
    >
      {children}
    </Box>
  );
}

export function DetailRow({ label, children }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: textSecondary, mb: 0.25 }}>{label}</Typography>
      <Box sx={{ color: textPrimary, overflowWrap: "anywhere" }}>{children || "—"}</Box>
    </Box>
  );
}
