"use client";

import { Grid } from "@mui/material";
import {
  JacoButton,
  JacoDatePicker,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import {
  COMPLAINT_STATUS_OPTIONS,
  ORDER_STAGE_OPTIONS,
  ORDER_TYPE_OPTIONS,
  filterSx,
} from "../constants";
import { STATISTICS_SOURCES } from "../errorsManagementViewModel.mjs";

export default function ComplaintListFilters({ filters, cities, cafes, mode, onChange, onApply }) {
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
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoSelect
            label="Город"
            options={cities}
            value={filters.cityId}
            multiple={false}
            allowNone={false}
            onChange={(event) => onChange("cityId", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoSelect
            label="Кафе"
            options={cafes}
            value={filters.pointId}
            multiple={false}
            allowNone={false}
            onChange={(event) => onChange("pointId", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoSelect
            label="Источник заказа"
            options={STATISTICS_SOURCES.filter((item) => item.id !== "legacy")}
            value={filters.orderSource}
            multiple={false}
            allowNone
            noneLabel="Все источники"
            onChange={(event) =>
              onChange("orderSource", event.target.value === "none" ? "" : event.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoSelect
            label={mode === "journal" ? "Статус жалобы" : "Этап заказа"}
            options={mode === "journal" ? COMPLAINT_STATUS_OPTIONS : ORDER_STAGE_OPTIONS}
            value={mode === "journal" ? filters.complaintStatuses : filters.orderStages}
            multiple
            allowNone={false}
            noneLabel="Все статусы"
            selectAllLabel="Все"
            onChange={(event) =>
              onChange(mode === "journal" ? "complaintStatuses" : "orderStages", event.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoDatePicker
            label="Дата от"
            value={filters.dateFrom}
            onChange={(value) => onChange("dateFrom", value?.format?.("YYYY-MM-DD") || "")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoDatePicker
            label="Дата до"
            value={filters.dateTo}
            onChange={(value) => onChange("dateTo", value?.format?.("YYYY-MM-DD") || "")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoTextInput
            label="Сумма от"
            type="number"
            min={0}
            value={filters.amountFrom}
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            onChange={(event) => onChange("amountFrom", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoTextInput
            label="Сумма до"
            type="number"
            min={0}
            value={filters.amountTo}
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            onChange={(event) => onChange("amountTo", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoSelect
            label="Тип заказа"
            options={ORDER_TYPE_OPTIONS}
            value={filters.orderType}
            multiple={false}
            allowNone
            noneLabel="Все типы"
            onChange={(event) =>
              onChange("orderType", event.target.value === "none" ? "" : event.target.value)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoTextInput
            label="ID заказа"
            value={filters.orderNumber}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
            onChange={(event) => onChange("orderNumber", event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <JacoTextInput
            label="Телефон клиента"
            value={filters.phone}
            slotProps={{ htmlInput: { inputMode: "tel" } }}
            onChange={(event) => onChange("phone", event.target.value)}
          />
        </Grid>
        <Grid
          size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
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
