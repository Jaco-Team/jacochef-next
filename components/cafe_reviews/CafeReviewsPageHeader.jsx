import { Box, Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { brandRed, CAFE_REVIEWS_AUTO_REFRESH_MINUTES, textSecondary } from "./shared";

export default function CafeReviewsPageHeader({
  title,
  onRefresh,
  refreshDisabled,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        flexDirection: "column",
        "@media (min-width: 668px)": {
          alignItems: "center",
          flexDirection: "row",
        },
      }}
    >
      <Box>
        <Typography
          component="h1"
          sx={{
            fontSize: 28,
            "@media (min-width: 668px)": { fontSize: 32 },
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: textSecondary, mt: 0.5 }}>
          Контроль обратной связи и работа с инцидентами
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={refreshDisabled}
          sx={{ minHeight: 40, px: 1.5, borderRadius: "12px", textTransform: "none" }}
        >
          Обновить
        </Button>
        <Button
          variant={autoRefreshEnabled ? "contained" : "outlined"}
          startIcon={<RefreshIcon />}
          onClick={onToggleAutoRefresh}
          disabled={refreshDisabled}
          aria-pressed={autoRefreshEnabled}
          title={`Автообновление каждые ${CAFE_REVIEWS_AUTO_REFRESH_MINUTES} мин.`}
          sx={{
            minHeight: 40,
            minWidth: 0,
            px: 1.5,
            borderRadius: "12px",
            textTransform: "none",
            ...(autoRefreshEnabled
              ? {
                  color: "#FFFFFF",
                  bgcolor: brandRed,
                  borderColor: brandRed,
                  "&:hover": { bgcolor: brandRed, filter: "brightness(0.9)" },
                }
              : {}),
          }}
        >
          {CAFE_REVIEWS_AUTO_REFRESH_MINUTES}'
        </Button>
      </Box>
    </Box>
  );
}
