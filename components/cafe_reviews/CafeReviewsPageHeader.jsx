import { Box, Typography } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { JacoButton, uiColors } from "@/design-system/shared/ui";
import { CAFE_REVIEWS_AUTO_REFRESH_MINUTES } from "./shared";

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
            lineHeight: 1.2,
            fontWeight: 600,
            color: uiColors.textStrong,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: uiColors.text, mt: 0.5 }}>
          Контроль обратной связи и работа с инцидентами
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <JacoButton
          tone="secondary"
          compact
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={refreshDisabled}
        >
          Обновить
        </JacoButton>
        <JacoButton
          tone={autoRefreshEnabled ? "primary" : "secondary"}
          compact
          startIcon={<AutorenewIcon />}
          onClick={onToggleAutoRefresh}
          disabled={refreshDisabled}
          aria-pressed={autoRefreshEnabled}
          title={`Автообновление каждые ${CAFE_REVIEWS_AUTO_REFRESH_MINUTES} мин.`}
        >
          Авто · {CAFE_REVIEWS_AUTO_REFRESH_MINUTES} мин
        </JacoButton>
      </Box>
    </Box>
  );
}
