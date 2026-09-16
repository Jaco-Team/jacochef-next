import { Chip, Paper, Stack, Typography } from "@mui/material";

import { formatPersonName, getHistoryEventTitle } from "./closeBuyUtils";

const actionLabels = {
  category_close: "Закрытие категории",
  category_open: "Открытие категории",
  item_close: "Закрытие товара",
  item_open: "Открытие товара",
  legacy_change: "Старая запись",
};

export default function HistoryEvent({ event, selected, onClick }) {
  const isOpenEvent = event.event_type === "category_open" || event.event_type === "item_open";
  const isLegacy = event.event_type === "legacy_change";
  const actionSx = isLegacy
    ? { color: "#8A5A00", bgcolor: "#FFF3D6" }
    : isOpenEvent
      ? { color: "#287A38", bgcolor: "#E7F2E8" }
      : { color: "#5F5F5F", bgcolor: "#EEEEEE" };

  return (
    <Paper
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: "100%",
        p: 1.5,
        textAlign: "left",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        border: selected ? "1px solid #BDBDBD" : "1px solid #E3E3E3",
        borderRadius: "14px",
        bgcolor: selected ? "#FAFAFA" : "#FFFFFF",
        boxShadow: selected ? "0 4px 14px rgba(0, 0, 0, 0.06)" : "none",
        transition: "border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease",
        "&::before": selected
          ? {
              content: '""',
              position: "absolute",
              inset: "10px auto 10px 0",
              width: 3,
              borderRadius: "0 3px 3px 0",
              bgcolor: "#c03",
            }
          : undefined,
        "&:hover": {
          borderColor: "#BDBDBD",
          bgcolor: "#FAFAFA",
        },
      }}
    >
      <Stack spacing={0.5}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 700, color: "#2B2B2B" }}>
            {getHistoryEventTitle(event)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#6B6B6B", whiteSpace: "nowrap" }}
          >
            {event.time || "—"}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{ color: "#6B6B6B" }}
          noWrap
        >
          {event.category_name || event.description || "Контекст события недоступен"}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#6B6B6B", fontWeight: 600 }}
          noWrap
        >
          {formatPersonName(event.user_name) || "Автор не указан"}
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
        >
          <Chip
            size="small"
            label={actionLabels[event.event_type] || "Изменение"}
            sx={{ ...actionSx, fontWeight: 700, borderRadius: "9px" }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
