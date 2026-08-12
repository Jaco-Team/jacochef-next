import { Box, Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { textSecondary } from "./shared";

export default function CafeReviewsPageHeader({ title, onRefresh, refreshDisabled }) {
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
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        disabled={refreshDisabled}
        sx={{ minHeight: 40, borderRadius: "12px", textTransform: "none" }}
      >
        Обновить
      </Button>
    </Box>
  );
}
