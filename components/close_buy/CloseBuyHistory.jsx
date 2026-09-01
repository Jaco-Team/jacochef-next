import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  JacoAutocomplete,
  JacoDatePicker,
  JacoSelect,
  JacoTextInput,
} from "@/design-system/shared/ui";

import HistoryEvent from "./HistoryEvent";
import HistoryEventDetails from "./HistoryEventDetails";
import { formatPersonName, groupHistoryByDate } from "./closeBuyUtils";

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
  const selectedCategoryOption =
    categoryOptions.find((category) => String(category.id) === String(filters.category_id)) ||
    categoryOptions[0];
  const authorOptions = useMemo(() => {
    const authors = new Set(history.map((event) => event.user_name?.trim()).filter(Boolean));

    if (filters.author) authors.add(filters.author);

    return [
      { id: "", name: "Все авторы" },
      ...Array.from(authors)
        .sort((first, second) => first.localeCompare(second, "ru"))
        .map((author) => ({ id: author, name: formatPersonName(author) })),
    ];
  }, [filters.author, history]);
  const today = dayjs();
  const dateFrom = filters.date_from ? dayjs(filters.date_from) : null;
  const dateTo = filters.date_to ? dayjs(filters.date_to) : null;
  const groupedHistory = useMemo(() => groupHistoryByDate(history), [history]);
  const selectedEvent = history.find((event) => event.id === selectedEventId) || history[0] || null;

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
      <Grid container>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <JacoSelect
            options={points}
            value={selectedPointId}
            onChange={onPointChange}
            label="Кафе"
            allowNone={false}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        alignItems="center"
      >
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <JacoTextInput
            fullWidth
            size="small"
            type="search"
            label="Поиск по событиям"
            value={filters.search}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <JacoDatePicker
            label="Дата от"
            value={filters.date_from}
            maxDate={dateTo || today}
            onChange={(value) =>
              onFiltersChange({ date_from: value ? value.format("YYYY-MM-DD") : null })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <JacoDatePicker
            label="Дата до"
            value={filters.date_to}
            minDate={dateFrom || undefined}
            maxDate={today}
            onChange={(value) =>
              onFiltersChange({ date_to: value ? value.format("YYYY-MM-DD") : null })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <JacoAutocomplete
            options={categoryOptions}
            value={selectedCategoryOption}
            onChange={(_, category) => onFiltersChange({ category_id: category?.id ?? "all" })}
            label="Категория"
            disableClearable
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <JacoSelect
            allowNone={false}
            options={authorOptions}
            value={filters.author}
            onChange={(event) => onFiltersChange({ author: event.target.value })}
            label="Автор"
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        alignItems="flex-start"
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={1.5}>
            {loading ? (
              <Skeleton
                variant="rounded"
                height={360}
              />
            ) : (
              <Paper
                sx={{
                  p: 1.5,
                  border: "1px solid #E3E3E3",
                  borderRadius: "18px",
                  bgcolor: "#F8F8F8",
                  boxShadow: "none",
                }}
              >
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
                  {history.length ? (
                    <>
                      {Object.entries(groupedHistory).map(([date, events]) => (
                        <Stack
                          key={date}
                          spacing={1}
                        >
                          <Typography
                            variant="caption"
                            sx={{ px: 0.5, fontWeight: 700, color: "#6B6B6B" }}
                          >
                            {date}
                          </Typography>
                          {events.map((event) => (
                            <HistoryEvent
                              key={event.id}
                              event={event}
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
                    </>
                  ) : (
                    <Stack sx={{ px: 0.5, py: 2 }}>
                      <Typography sx={{ fontWeight: 600 }}>История пока пуста</Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: "#6B6B6B" }}
                      >
                        Измените фильтры или выберите другое кафе.
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>

        {!isMobile ? (
          <Grid size={{ xs: 12, md: 8 }}>
            {loading ? (
              <Skeleton
                variant="rounded"
                height={360}
              />
            ) : (
              <HistoryEventDetails event={selectedEvent} />
            )}
          </Grid>
        ) : null}
      </Grid>
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={isMobileDetailsOpen && Boolean(selectedEvent)}
          onClose={() => setIsMobileDetailsOpen(false)}
          onOpen={() => {}}
          disableSwipeToOpen
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiBackdrop-root": {
              bgcolor: "rgba(0, 0, 0, 0.48)",
            },
          }}
          slotProps={{
            paper: {
              sx: {
                height: "75dvh",
                maxHeight: "75dvh",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: "24px 24px 0 0",
                overflow: "hidden",
                bgcolor: "#FFFFFF",
              },
            },
          }}
        >
          <Box
            sx={{
              minHeight: 0,
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ flexShrink: 0, pt: 1.25, px: 2.5, pb: 1.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 5,
                  mx: "auto",
                  mb: 1.75,
                  borderRadius: "999px",
                  bgcolor: "#D9D9D9",
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#292929" }}
              >
                Детали события
              </Typography>
            </Box>

            <Box
              sx={{
                height: 0,
                minHeight: 0,
                flex: "1 1 0",
                overflowY: "scroll",
                overflowX: "hidden",
                overscrollBehaviorY: "contain",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
                px: 2,
                pb: "calc(16px + env(safe-area-inset-bottom))",
              }}
            >
              <HistoryEventDetails event={selectedEvent} />
            </Box>
          </Box>
        </SwipeableDrawer>
      ) : null}
    </Stack>
  );
}
