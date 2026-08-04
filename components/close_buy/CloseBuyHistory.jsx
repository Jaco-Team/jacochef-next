import { Button, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";

import { MyDatePickerNew, MySelect } from "@/ui/Forms";

import HistoryEvent from "./HistoryEvent";
import { groupHistoryByDate } from "./closeBuyUtils";

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
  const groupedHistory = groupHistoryByDate(history);
  const categoryOptions = [{ id: "all", name: "Все категории" }, ...categories];
  const today = dayjs();
  const dateFrom = filters.date_from ? dayjs(filters.date_from) : null;
  const dateTo = filters.date_to ? dayjs(filters.date_to) : null;
  const pointNames = new Map(points.map((point) => [String(point.id), point.name]));

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
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <MySelect
            data={categoryOptions}
            value={filters.category_id}
            func={(event) => onFiltersChange({ category_id: event.target.value })}
            label="Категория"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MyDatePickerNew
            label="Дата от"
            value={filters.date_from}
            maxDate={dateTo || today}
            func={(value) =>
              onFiltersChange({ date_from: value ? value.format("YYYY-MM-DD") : null })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
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
      </Grid>

      {loading ? (
        <Stack spacing={2}>
          <Paper sx={{ p: 3, borderRadius: "18px", border: "1px solid #ECECEC" }}>
            <Typography sx={{ color: "#6B6B6B" }}>История загружается...</Typography>
          </Paper>
        </Stack>
      ) : history.length ? (
        <Stack spacing={3}>
          {Object.entries(groupedHistory).map(([date, events]) => (
            <Stack
              key={date}
              spacing={1.5}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                {date}
              </Typography>
              <Stack spacing={1.5}>
                {events.map((event) => (
                  <HistoryEvent
                    key={event.id}
                    event={event}
                    pointName={pointNames.get(String(event.point_id))}
                  />
                ))}
              </Stack>
            </Stack>
          ))}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="body2"
              sx={{ color: "#6B6B6B" }}
            >
              Страница {pagination.page} из {pagination.last_page}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
            >
              <Button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                Назад
              </Button>
              <Button
                disabled={pagination.page >= pagination.last_page}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Далее
              </Button>
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Paper sx={{ p: 4, borderRadius: "20px", border: "1px dashed #DADADA" }}>
          <Typography sx={{ fontWeight: 600 }}>История пока пуста</Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "#6B6B6B" }}
          >
            Измените период или категорию, либо повторите запрос позже.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
