import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  DialogContent,
  Grid,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { MyDatePickerNew, MySelect } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

import HistoryEvent from "./HistoryEvent";
import HistoryEventDetails from "./HistoryEventDetails";
import { groupHistoryByDate } from "./closeBuyUtils";

const actionOptions = [
  { id: "all", name: "Все действия" },
  { id: "category_close", name: "Закрытие категории" },
  { id: "category_open", name: "Открытие категории" },
  { id: "item_close", name: "Закрытие товара" },
  { id: "item_open", name: "Открытие товара" },
  { id: "legacy_change", name: "Старые записи" },
];

export default function CloseBuyHistory({
  points = [],
  selectedPointId,
  categories,
  filters,
  pagination,
  history,
  loading,
  onFiltersChange,
  onPointChange,
  onPageChange,
}) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const categoryOptions = [{ id: "all", name: "Все категории" }, ...categories];
  const authorOptions = useMemo(() => {
    const authors = new Set(history.map((event) => event.user_name?.trim()).filter(Boolean));

    if (filters.author) authors.add(filters.author);

    return [
      { id: "", name: "Все авторы" },
      ...Array.from(authors)
        .sort((first, second) => first.localeCompare(second, "ru"))
        .map((author) => ({ id: author, name: author })),
    ];
  }, [filters.author, history]);
  const today = dayjs();
  const dateFrom = filters.date_from ? dayjs(filters.date_from) : null;
  const dateTo = filters.date_to ? dayjs(filters.date_to) : null;
  const groupedHistory = useMemo(() => groupHistoryByDate(history), [history]);
  const pointNames = useMemo(
    () => new Map(points.map((point) => [String(point.id), point.name])),
    [points],
  );
  const resolveEvent = (event) =>
    event
      ? {
          ...event,
          point_name: pointNames.get(String(event.point_id)) || event.point_name || "",
        }
      : null;
  const selectedEvent = resolveEvent(
    history.find((event) => event.id === selectedEventId) || history[0] || null,
  );

  useEffect(() => {
    if (!history.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(history[0]?.id || "");
    }
  }, [history, selectedEventId]);

  useEffect(() => {
    if (!isMobile) setIsMobileDetailsOpen(false);
  }, [isMobile]);

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    if (isMobile) setIsMobileDetailsOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Grid
        container
        justifyContent="flex-end"
      >
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MySelect
            is_none={true}
            data={points}
            value={selectedPointId}
            func={onPointChange}
            label="Кафе"
          />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={2}
        alignItems="center"
      >
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="search"
            label="Поиск по событиям"
            value={filters.search}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <MyDatePickerNew
            label="Дата от"
            value={filters.date_from}
            maxDate={dateTo || today}
            func={(value) =>
              onFiltersChange({ date_from: value ? value.format("YYYY-MM-DD") : null })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <MyDatePickerNew
            label="Дата до"
            value={filters.date_to}
            minDate={dateFrom || undefined}
            maxDate={today}
            func={(value) =>
              onFiltersChange({ date_to: value ? value.format("YYYY-MM-DD") : null })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <MySelect
            data={categoryOptions}
            value={filters.category_id}
            func={(event) => onFiltersChange({ category_id: event.target.value })}
            label="Категория"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
          <MySelect
            data={actionOptions}
            value={filters.action}
            func={(event) => onFiltersChange({ action: event.target.value })}
            label="Действие"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <MySelect
            is_none={false}
            data={authorOptions}
            value={filters.author}
            func={(event) => onFiltersChange({ author: event.target.value })}
            label="Автор"
          />
        </Grid>
      </Grid>

      {loading ? (
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton
              variant="rounded"
              height={360}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton
              variant="rounded"
              height={360}
            />
          </Grid>
        </Grid>
      ) : history.length ? (
        <Grid
          container
          spacing={2}
          alignItems="flex-start"
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 1.5, border: "1px solid #E5E5E5", boxShadow: "none" }}>
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ fontWeight: 700 }}>События</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B6B6B" }}
                  >
                    {pagination.total} событий
                  </Typography>
                </Stack>
                {Object.entries(groupedHistory).map(([date, events]) => (
                  <Stack
                    key={date}
                    spacing={1}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "#6B6B6B" }}
                    >
                      {date}
                    </Typography>
                    {events.map((event) => (
                      <HistoryEvent
                        key={event.id}
                        event={resolveEvent(event)}
                        selected={!isMobile && selectedEvent?.id === event.id}
                        onClick={() => handleEventSelect(event.id)}
                      />
                    ))}
                  </Stack>
                ))}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B6B6B" }}
                  >
                    {pagination.page} / {pagination.last_page}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                  >
                    <Button
                      size="small"
                      disabled={pagination.page <= 1}
                      onClick={() => onPageChange(pagination.page - 1)}
                    >
                      Назад
                    </Button>
                    <Button
                      size="small"
                      disabled={pagination.page >= pagination.last_page}
                      onClick={() => onPageChange(pagination.page + 1)}
                    >
                      Далее
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          {!isMobile ? (
            <Grid size={{ xs: 12, md: 8 }}>
              <HistoryEventDetails event={selectedEvent} />
            </Grid>
          ) : null}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, borderRadius: "20px", border: "1px dashed #DADADA" }}>
          <Typography sx={{ fontWeight: 600 }}>История пока пуста</Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "#6B6B6B" }}
          >
            Измените фильтры или выберите другой период.
          </Typography>
        </Paper>
      )}

      {isMobile ? (
        <MyModal
          open={isMobileDetailsOpen && Boolean(selectedEvent)}
          onClose={() => setIsMobileDetailsOpen(false)}
          title="Детали события"
          maxWidth="sm"
        >
          <DialogContent sx={{ px: 2, pb: 2 }}>
            <HistoryEventDetails event={selectedEvent} />
          </DialogContent>
        </MyModal>
      ) : null}
    </Stack>
  );
}
