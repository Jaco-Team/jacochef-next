"use client";

import { Button, Grid, Paper, Stack } from "@mui/material";
import dayjs from "dayjs";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import { MyAutoCompleteWithAll, MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import usePromoItemsStatStore from "./usePromoItemsStatStore";

export default function PromoItemsStatFilters({ onRefresh }) {
  const pointList = usePromoItemsStatStore((state) => state.pointList);
  const selectedPoints = usePromoItemsStatStore((state) => state.selectedPoints);
  const date_start = usePromoItemsStatStore((state) => state.date_start);
  const date_end = usePromoItemsStatStore((state) => state.date_end);
  const promoList = usePromoItemsStatStore((state) => state.promoList);
  const selectedPromos = usePromoItemsStatStore((state) => state.selectedPromos);
  const selectedItems = usePromoItemsStatStore((state) => state.selectedItems);
  const itemList = usePromoItemsStatStore((state) => state.itemList);
  const typeOrderList = usePromoItemsStatStore((state) => state.typeOrderList);
  const typeOrder = usePromoItemsStatStore((state) => state.typeOrder);
  const clientSourceList = usePromoItemsStatStore((state) => state.clientSourceList);
  const selectedClientSources = usePromoItemsStatStore((state) => state.selectedClientSources);
  const activationsFilter = usePromoItemsStatStore((state) => state.activationsFilter);
  const setFilters = usePromoItemsStatStore((state) => state.setFilters);
  const setSelectedPoints = usePromoItemsStatStore((state) => state.setSelectedPoints);
  const setSelectedPromos = usePromoItemsStatStore((state) => state.setSelectedPromos);
  const setSelectedItems = usePromoItemsStatStore((state) => state.setSelectedItems);
  const setTypeOrder = usePromoItemsStatStore((state) => state.setTypeOrder);
  const setSelectedClientSources = usePromoItemsStatStore(
    (state) => state.setSelectedClientSources,
  );
  const setActivationsFilter = usePromoItemsStatStore((state) => state.setActivationsFilter);
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

  const normalizeActivationValue = (value) => {
    if (value === "") {
      return null;
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      return null;
    }

    return Math.max(0, numberValue);
  };

  const handleActivationInputChange = (key) => (event) => {
    setActivationsFilter({
      [key]: normalizeActivationValue(event.target.value),
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
            value={selectedItems}
            func={(_, value) => setSelectedItems(value || [])}
            multiple={true}
            label="Товар"
            getOptionKey={(option) => option?.id || option?.name || ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
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

        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ order: { xs: 1, md: 2 } }}
        >
          <MyAutoCompleteWithAll
            withAll={true}
            options={clientSourceList}
            value={selectedClientSources}
            onChange={(value) => setSelectedClientSources(value || [])}
            label="Источники заказа"
          />
        </Grid>

        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ order: { xs: 2, md: 1 } }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
          >
            <MyTextInput
              type="number"
              label="Активаций от"
              value={activationsFilter.from ?? ""}
              func={handleActivationInputChange("from")}
              min={0}
              step={1}
            />
            <MyTextInput
              type="number"
              label="Активаций до"
              value={activationsFilter.to ?? ""}
              func={handleActivationInputChange("to")}
              min={0}
              step={1}
            />
          </Stack>
          {/*
          <MyRangeSlider
            label={`Активаций: ${activationValue[0]}-${activationValue[1]}`}
            value={activationValue}
            func={handleActivationChange}
            min={activationMin}
            max={activationMax}
            step={1}
            valueLabelDisplay="auto"
            disabled={activationMin === activationMax}
          />
          */}
        </Grid>

        <Grid
          size={12}
          sx={{ order: { xs: 3, md: 3 } }}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
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
