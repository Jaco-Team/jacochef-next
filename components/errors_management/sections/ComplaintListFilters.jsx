"use client";

import { Grid } from "@mui/material";
import {
  JacoButton,
  JacoDatePicker,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
  JacoTimePicker,
} from "@/design-system/shared/ui";
import {
  ALL_POINTS_LABEL,
  COMPLAINT_STATUS_OPTIONS,
  ORDER_STAGE_OPTIONS,
  ORDER_TYPE_OPTIONS,
  filterSx,
} from "../constants";
import { STATISTICS_SOURCES, WORKFLOW_SOURCES } from "../errorsManagementViewModel.mjs";
import { ORDER_NUMBER_DIGITS_HINT, orderNumberLookup } from "../orderSearchModel.mjs";

const fieldSize = { xs: 12, sm: 6, md: 4, lg: 2 };
const ORDER_CHANNELS = STATISTICS_SOURCES.filter((item) => item.id !== "legacy");

function noneToEmpty(value) {
  return value === "none" ? "" : value;
}

function dateValue(value) {
  return value?.format?.("YYYY-MM-DD") || "";
}

export default function ComplaintListFilters({
  filters,
  cities,
  cafes,
  mode,
  canSeePhone,
  onChange,
  onApply,
}) {
  const journal = mode === "journal";
  const invalidJournalOrder = journal && orderNumberLookup(filters.orderNumber).invalid;
  return (
    <JacoSurface
      component="form"
      sx={filterSx}
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <Grid
        container
        spacing={1.5}
        sx={{ alignItems: "center" }}
      >
        <Grid size={fieldSize}>
          <JacoSelect
            label="Город"
            options={cities}
            value={filters.cityId}
            multiple={false}
            allowNone={false}
            onChange={(event) => onChange("cityId", event.target.value)}
          />
        </Grid>
        <Grid size={fieldSize}>
          <JacoSelect
            label="Кафе"
            options={cafes}
            value={filters.pointId}
            multiple={false}
            allowNone
            noneLabel={ALL_POINTS_LABEL}
            onChange={(event) => onChange("pointId", noneToEmpty(event.target.value))}
          />
        </Grid>
        <Grid size={fieldSize}>
          <JacoSelect
            label="Канал заказа"
            options={ORDER_CHANNELS}
            value={filters.orderSource}
            multiple={false}
            allowNone
            noneLabel="Все каналы"
            onChange={(event) => onChange("orderSource", noneToEmpty(event.target.value))}
          />
        </Grid>
        {journal ? (
          <Grid size={fieldSize}>
            <JacoSelect
              label="Кто зарегистрировал"
              options={WORKFLOW_SOURCES}
              value={filters.registrationSource}
              multiple={false}
              allowNone
              noneLabel="КК и кафе"
              onChange={(event) => onChange("registrationSource", noneToEmpty(event.target.value))}
            />
          </Grid>
        ) : null}
        <Grid size={fieldSize}>
          <JacoSelect
            label={journal ? "Статус жалобы" : "Этап заказа"}
            options={journal ? COMPLAINT_STATUS_OPTIONS : ORDER_STAGE_OPTIONS}
            value={journal ? filters.complaintStatuses : filters.orderStages}
            multiple
            allowNone={false}
            noneLabel="Все статусы"
            selectAllLabel="Все"
            withCheckboxes
            onChange={(event) =>
              onChange(journal ? "complaintStatuses" : "orderStages", event.target.value)
            }
          />
        </Grid>
        {!journal ? (
          <Grid size={fieldSize}>
            <JacoSelect
              label="Тип заказа"
              options={ORDER_TYPE_OPTIONS}
              value={filters.orderType}
              multiple={false}
              allowNone
              noneLabel="Все типы"
              onChange={(event) => onChange("orderType", noneToEmpty(event.target.value))}
            />
          </Grid>
        ) : null}
        <Grid size={fieldSize}>
          <JacoDatePicker
            label={journal ? "Дата жалобы от" : "Дата заказа от"}
            value={filters.dateFrom}
            onChange={(value) => onChange("dateFrom", dateValue(value))}
          />
        </Grid>
        <Grid size={fieldSize}>
          <JacoDatePicker
            label={journal ? "Дата жалобы до" : "Дата заказа до"}
            value={filters.dateTo}
            onChange={(value) => onChange("dateTo", dateValue(value))}
          />
        </Grid>
        {!journal ? (
          <>
            <Grid size={fieldSize}>
              <JacoTimePicker
                label="Время заказа с"
                value={filters.timeFrom}
                onChange={(event) => onChange("timeFrom", event.target.value)}
              />
            </Grid>
            <Grid size={fieldSize}>
              <JacoTimePicker
                label="Время заказа по"
                value={filters.timeTo}
                onChange={(event) => onChange("timeTo", event.target.value)}
              />
            </Grid>
            <Grid size={fieldSize}>
              <JacoTextInput
                label="Сумма от"
                type="number"
                value={filters.amountFrom}
                slotProps={{ htmlInput: { min: 0, inputMode: "decimal" } }}
                onChange={(event) => onChange("amountFrom", event.target.value)}
              />
            </Grid>
            <Grid size={fieldSize}>
              <JacoTextInput
                label="Сумма до"
                type="number"
                value={filters.amountTo}
                slotProps={{ htmlInput: { min: 0, inputMode: "decimal" } }}
                onChange={(event) => onChange("amountTo", event.target.value)}
              />
            </Grid>
          </>
        ) : null}
        <Grid size={fieldSize}>
          <JacoTextInput
            label="ID заказа"
            value={filters.orderNumber}
            error={invalidJournalOrder}
            helperText={invalidJournalOrder ? ORDER_NUMBER_DIGITS_HINT : undefined}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
            onChange={(event) => onChange("orderNumber", event.target.value)}
          />
        </Grid>
        {!journal && canSeePhone ? (
          <Grid size={fieldSize}>
            <JacoTextInput
              label="Телефон клиента"
              value={filters.phone}
              slotProps={{ htmlInput: { inputMode: "tel" } }}
              onChange={(event) => onChange("phone", event.target.value)}
            />
          </Grid>
        ) : null}
        <Grid
          size={fieldSize}
          sx={{ display: "flex", alignItems: "flex-end" }}
        >
          <JacoButton
            type="submit"
            fullWidth
            sx={{ minHeight: 44 }}
          >
            Применить
          </JacoButton>
        </Grid>
      </Grid>
    </JacoSurface>
  );
}
