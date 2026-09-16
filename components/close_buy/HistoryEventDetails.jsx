import {
  Alert,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { formatHistoryDescription, formatPersonName, getHistoryEventTitle } from "./closeBuyUtils";

const actionLabels = {
  category_close: "Категория закрыта",
  category_open: "Категория открыта",
  item_close: "Товар закрыт",
  item_open: "Товар открыт",
  legacy_change: "Старая запись",
};

const detailsCardSx = {
  border: { xs: "none", sm: "1px solid #E3E3E3" },
  borderRadius: { xs: 0, sm: "18px" },
  bgcolor: "#FFFFFF",
  boxShadow: { xs: "none", sm: "0 8px 22px rgba(0, 0, 0, 0.05)" },
  overflow: "hidden",
};

function StatusChip({ label }) {
  const isOpen = String(label || "").toLowerCase() === "открыт";

  return (
    <Chip
      size="small"
      label={isOpen ? "Открыт" : "Закрыт"}
      sx={{
        minWidth: { xs: 68, sm: 82 },
        borderRadius: "999px",
        fontWeight: 700,
        color: isOpen ? "#287A38" : "#B4233C",
        bgcolor: isOpen ? "#E7F2E8" : "#FBE7EC",
      }}
    />
  );
}

export default function HistoryEventDetails({ event }) {
  if (!event) {
    return (
      <Paper sx={{ ...detailsCardSx, p: { xs: 2, md: 3 }, minHeight: 280 }}>
        <Typography sx={{ color: "#6B6B6B" }}>
          Выберите событие, чтобы посмотреть детали.
        </Typography>
      </Paper>
    );
  }

  const isLegacy = event.card_variant === "legacy";
  const changedCount = event.changed_item_count ?? event.items.length;
  const isOpenEvent = event.event_type === "category_open" || event.event_type === "item_open";
  const actionSx = isLegacy
    ? { color: "#8A5A00", bgcolor: "#FFF3D6" }
    : isOpenEvent
      ? { color: "#287A38", bgcolor: "#E7F2E8" }
      : { color: "#5F5F5F", bgcolor: "#EEEEEE" };

  return (
    <Paper sx={{ ...detailsCardSx, p: { xs: 0, sm: 3 } }}>
      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        <Stack spacing={0.75}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, minWidth: 0 }}
            >
              {getHistoryEventTitle(event)}
            </Typography>
            <Chip
              label={actionLabels[event.event_type] || "Изменено"}
              size="small"
              sx={{ ...actionSx, flexShrink: 0, fontWeight: 700, borderRadius: "9px" }}
            />
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: "#6B6B6B" }}
          >
            {formatHistoryDescription(event) || "Описание события недоступно."}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Chip
            size="small"
            label={`${event.date || "—"} · ${event.time || "—"}`}
          />
          <Chip
            size="small"
            label={formatPersonName(event.user_name) || "Автор не указан"}
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
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
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
          <>
            <Stack
              divider={<Divider flexItem />}
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              {event.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{ py: 1 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.75, fontWeight: 600 }}
                  >
                    {item.name || "Товар без названия"}
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      alignItems: "end",
                      columnGap: 1,
                    }}
                  >
                    <Stack
                      spacing={0.25}
                      sx={{
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#6B6B6B" }}
                      >
                        Было
                      </Typography>
                      <StatusChip label={item.old_status_label} />
                    </Stack>
                    <Typography sx={{ pb: 0.35, color: "#A0A0A0" }}>→</Typography>
                    <Stack
                      spacing={0.25}
                      sx={{
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#6B6B6B" }}
                      >
                        Стало
                      </Typography>
                      <StatusChip label={item.new_status_label} />
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>

            <TableContainer sx={{ display: { xs: "none", sm: "block" }, width: "100%" }}>
              <Table
                size="small"
                sx={{ minWidth: 420 }}
              >
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
                        <Typography variant="body2">{item.name || "Товар без названия"}</Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip label={item.old_status_label} />
                      </TableCell>
                      <TableCell>
                        <StatusChip label={item.new_status_label} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
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
