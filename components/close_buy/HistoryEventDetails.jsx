import {
  Alert,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { getHistoryEventTitle } from "./closeBuyUtils";

const actionLabels = {
  category_close: "Категория закрыта",
  category_open: "Категория открыта",
  item_close: "Товар закрыт",
  item_open: "Товар открыт",
  legacy_change: "Старая запись",
};

export default function HistoryEventDetails({ event }) {
  if (!event) {
    return (
      <Paper sx={{ p: 3, minHeight: 280, border: "1px solid #E5E5E5", boxShadow: "none" }}>
        <Typography sx={{ color: "#6B6B6B" }}>
          Выберите событие, чтобы посмотреть детали.
        </Typography>
      </Paper>
    );
  }

  const isLegacy = event.card_variant === "legacy";
  const changedCount = event.changed_item_count ?? event.items.length;

  return (
    <Paper sx={{ p: 2.5, border: "1px solid #E5E5E5", boxShadow: "none" }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              {getHistoryEventTitle(event)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#6B6B6B" }}
            >
              {event.description || "Описание события недоступно."}
            </Typography>
          </Stack>
          <Chip
            label={actionLabels[event.event_type] || "Изменено"}
            color="error"
            size="small"
          />
        </Stack>

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
        >
          <Chip
            size="small"
            label={`${event.date || "—"} · ${event.time || "—"}`}
          />
          <Chip
            size="small"
            label={event.point_name || "Кафе не указано"}
          />
          <Chip
            size="small"
            label={event.user_name || "Автор не указан"}
          />
          <Chip
            size="small"
            label={
              isLegacy ? `${event.item_count} строк исходной записи` : `${changedCount} товаров`
            }
          />
        </Stack>

        {isLegacy ? (
          <Alert severity="warning">
            {event.legacy_reason || "Контекст старой записи неполный."}
          </Alert>
        ) : null}

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ fontWeight: 700 }}>
            {isLegacy ? "Детали записи" : "Фактические изменения"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6B6B6B" }}
          >
            {isLegacy ? "Контекст ограничен" : `${changedCount} товаров`}
          </Typography>
        </Stack>

        {event.details_available && event.items.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Товар</TableCell>
                <TableCell>Было</TableCell>
                <TableCell>Стало</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {event.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2">{item.name || `Товар ${item.item_id}`}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      ID {item.item_id}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.old_status_label}</TableCell>
                  <TableCell>{item.new_status_label}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography
            variant="body2"
            sx={{ color: "#6B6B6B" }}
          >
            Детализация для этого события недоступна.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
