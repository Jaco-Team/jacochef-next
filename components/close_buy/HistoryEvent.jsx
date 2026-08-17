import { Chip, Paper, Stack, Typography } from "@mui/material";

import { getHistoryEventTitle } from "./closeBuyUtils";

const actionLabels = {
  category_close: "Закрытие категории",
  category_open: "Открытие категории",
  item_close: "Закрытие товара",
  item_open: "Открытие товара",
  legacy_change: "Старая запись",
};

export default function HistoryEvent({ event, selected, onClick }) {
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
        border: selected ? "1px solid #c03" : "1px solid #E5E5E5",
        borderRadius: "14px",
        bgcolor: selected ? "rgba(204, 0, 51, 0.04)" : "#fff",
        boxShadow: "none",
      }}
    >
      <Stack spacing={0.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={1}
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
          sx={{ color: "#c03" }}
          noWrap
        >
          {event.user_name || "Автор не указан"} • {event.point_name || "Кафе не указано"}
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
        >
          <Chip
            size="small"
            label={actionLabels[event.event_type] || "Изменение"}
          />
          {event.card_variant === "legacy" ? (
            <Chip
              size="small"
              label="Legacy"
            />
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
