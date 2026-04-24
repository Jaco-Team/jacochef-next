"use client";

import { Button, Grid, Paper, Stack } from "@mui/material";
import dayjs from "dayjs";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import usePromoItemsStatStore from "./usePromoItemsStatStore";

export default function PromoItemsStatFilters({ onRefresh }) {
  const pointList = usePromoItemsStatStore((state) => state.pointList);
  const selectedPoints = usePromoItemsStatStore((state) => state.selectedPoints);
  const date_start = usePromoItemsStatStore((state) => state.date_start);
  const date_end = usePromoItemsStatStore((state) => state.date_end);
  const promoList = usePromoItemsStatStore((state) => state.promoList);
  const selectedPromos = usePromoItemsStatStore((state) => state.selectedPromos);
  const selectedItem = usePromoItemsStatStore((state) => state.selectedItem);
  const itemList = usePromoItemsStatStore((state) => state.itemList);
  const typeOrderList = usePromoItemsStatStore((state) => state.typeOrderList);
  const typeOrder = usePromoItemsStatStore((state) => state.typeOrder);
  const setFilters = usePromoItemsStatStore((state) => state.setFilters);
  const setSelectedPoints = usePromoItemsStatStore((state) => state.setSelectedPoints);
  const setSelectedPromos = usePromoItemsStatStore((state) => state.setSelectedPromos);
  const setSelectedItem = usePromoItemsStatStore((state) => state.setSelectedItem);
  const setTypeOrder = usePromoItemsStatStore((state) => state.setTypeOrder);
  const selectedOrderType = typeOrderList.find((item) => `${item?.id}` === `${typeOrder}`) || null;

  const handleDateStartChange = (value) => {
    const nextDateStart = value || null;
    const nextDateEnd =
      nextDateStart && date_end && dayjs(nextDateStart).isAfter(dayjs(date_end), "day")
        ? nextDateStart
        : date_end;

    setFilters({
      date_start: nextDateStart,
      date_end: nextDateEnd,
    });
  };

  const handleDateEndChange = (value) => {
    const nextDateEnd = value || null;
    const nextDateStart =
      nextDateEnd && date_start && dayjs(nextDateEnd).isBefore(dayjs(date_start), "day")
        ? nextDateEnd
        : date_start;

    setFilters({
      date_start: nextDateStart,
      date_end: nextDateEnd,
    });
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <CityCafeAutocomplete2
            points={pointList}
            value={selectedPoints}
            onChange={(value) => setSelectedPoints(value)}
            label="Кафе"
            withAll
            withAllSelected
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MyDatePickerNew
            label="Дата от"
            value={date_start}
            func={handleDateStartChange}
            maxDate={date_end ? dayjs(date_end) : null}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MyDatePickerNew
            label="Дата до"
            value={date_end}
            func={handleDateEndChange}
            minDate={date_start ? dayjs(date_start) : null}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MyAutocomplite
            data={promoList}
            value={selectedPromos}
            func={(_, value) => setSelectedPromos(value || [])}
            multiple={true}
            label="Промокод"
            getOptionKey={(option) => option?.id || option?.name || ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MyAutocomplite
            data={itemList}
            value={selectedItem}
            func={(_, value) => setSelectedItem(value)}
            multiple={false}
            label="Товар"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MyAutocomplite
            data={typeOrderList}
            value={selectedOrderType}
            func={(_, value) =>
              setTypeOrder(
                value?.id !== undefined && value?.id !== null && `${value.id}` !== "-1"
                  ? value.id
                  : null,
              )
            }
            multiple={false}
            label="Тип заказа промика"
          />
        </Grid>

        <Grid size={12}>
          <Stack
            direction="row"
            justifyContent="flex-start"
          >
            <Button
              variant="contained"
              onClick={onRefresh}
            >
              Показать
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
