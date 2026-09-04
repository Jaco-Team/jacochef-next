"use client";

import dayjs from "dayjs";
import { Close } from "@mui/icons-material";
import { Button, CircularProgress, Grid, IconButton, Paper, Stack, Tooltip } from "@mui/material";

import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import ExcelIcon from "@/ui/ExcelIcon";
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import { PARAM_OPTIONS } from "./useOrdersExtendedStore";

export default function OrdersExtendedFilters({
  filters,
  points,
  allItems,
  categories,
  sources,
  orderTypes,
  paymentTypes,
  rows,
  loading,
  isDesktop,
  canExport,
  onSubmit,
  onKeyDown,
  onUpdateFilter,
  onReset,
  onExport,
  mobile = false,
}) {
  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
      elevation={mobile ? 0 : 1}
      sx={{
        p: 2,
        maxHeight: { xs: mobile ? "none" : "70vh", md: "50vh" },
        overflowY: { xs: mobile ? "visible" : "auto", md: "auto" },
        boxShadow: mobile ? "none" : undefined,
        borderRadius: mobile ? 0 : undefined,
        backgroundColor: mobile ? "transparent" : undefined,
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, md: 1.5 }}
      >
        <Grid
          container
          spacing={{ xs: 2, md: 1.5 }}
          size={12}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <CityCafeAutocomplete2
              points={points}
              value={filters.point}
              onChange={(value) => onUpdateFilter("point", value)}
              label="Кафе"
              placeholder="Выберите кафе"
              withAll={points.length > 0}
              withOrganizationMode={false}
              compact
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Дата от"
              value={filters.date_start_true}
              maxDate={filters.date_end_true ? dayjs(filters.date_end_true) : dayjs()}
              func={(value) => onUpdateFilter("date_start_true", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Дата до"
              value={filters.date_end_true}
              minDate={filters.date_start_true ? dayjs(filters.date_start_true) : undefined}
              maxDate={dayjs()}
              func={(value) => onUpdateFilter("date_end_true", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Заказов за период от"
              type="number"
              min={0}
              value={filters.count_orders_min}
              func={(event) => onUpdateFilter("count_orders_min", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Заказов за период до"
              type="number"
              min={0}
              value={filters.count_orders_max}
              func={(event) => onUpdateFilter("count_orders_max", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Ср. чек от"
              type="number"
              min={0}
              value={filters.avg_check_min}
              func={(event) => onUpdateFilter("avg_check_min", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Ср. чек до"
              type="number"
              min={0}
              value={filters.avg_check_max}
              func={(event) => onUpdateFilter("avg_check_max", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Сумма заказа от"
              type="number"
              min={0}
              value={filters.min_summ}
              func={(event) => onUpdateFilter("min_summ", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Сумма заказа до"
              type="number"
              min={0}
              value={filters.max_summ}
              func={(event) => onUpdateFilter("max_summ", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyAutocomplite
              label="Клиенты"
              disableClearable
              data={PARAM_OPTIONS}
              value={filters.param}
              func={(_, value) => onUpdateFilter("param", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyAutocomplite
              label="Категории в заказе"
              multiple
              data={categories}
              value={filters.category_ids}
              func={(_, value) => onUpdateFilter("category_ids", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyAutocomplite
              label="Позиции в заказе"
              multiple
              data={allItems}
              value={filters.item}
              func={(_, value) => onUpdateFilter("item", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyAutocomplite
              label="Способ заказа"
              multiple
              data={sources}
              value={filters.source_ids}
              func={(_, value) => onUpdateFilter("source_ids", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Источник трафика"
              value={filters.traffic_source}
              func={(event) => onUpdateFilter("traffic_source", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyAutocomplite
              label="Тип заказа"
              multiple
              data={orderTypes}
              value={filters.order_type_ids}
              func={(_, value) => onUpdateFilter("order_type_ids", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyAutocomplite
              label="Способ оплаты"
              multiple
              data={paymentTypes}
              value={filters.payment_type_ids}
              func={(_, value) => onUpdateFilter("payment_type_ids", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Промокод"
              value={filters.promo}
              disabled={Boolean(filters.no_promo)}
              slotProps={{
                input: {
                  endAdornment: filters.promo ? (
                    <IconButton
                      type="button"
                      onClick={() => onUpdateFilter("promo", { target: { value: "" } })}
                    >
                      <Close />
                    </IconButton>
                  ) : null,
                },
              }}
              func={(event) => onUpdateFilter("promo", event)}
            />
          </Grid>
          <Grid size={12}>
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              sx={{
                flexWrap: "wrap",
                minHeight: "100%",
                alignItems: "center",
              }}
            >
              <MyCheckBox
                label="Заказ без промокода"
                value={filters.no_promo}
                func={(event) => onUpdateFilter("no_promo", event)}
              />
              <MyCheckBox
                label="Заказ с промокодом"
                value={filters.with_promo}
                func={(event) => onUpdateFilter("with_promo", event)}
              />
              <MyCheckBox
                label="Была оформлена ошибка на заказ"
                value={filters.is_show_claim}
                func={(event) => onUpdateFilter("is_show_claim", event)}
              />
            </Stack>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Stack
            direction={isDesktop ? "row" : "column"}
            spacing={1}
            sx={{
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={onReset}
              disabled={loading.search || loading.bootstrap || loading.export}
              sx={{ minHeight: 36, px: 2 }}
            >
              Сбросить
            </Button>
            <Stack
              direction="row"
              spacing={1}
            >
              <Button
                type="submit"
                size="small"
                variant="contained"
                disabled={loading.search || loading.bootstrap}
                sx={{ minHeight: 36, px: 2, flexGrow: isDesktop ? 0 : 1 }}
              >
                Применить
              </Button>
              {canExport && rows.length > 0 ? (
                <Tooltip title="Скачать Excel">
                  <span>
                    <IconButton
                      type="button"
                      onClick={onExport}
                      disabled={loading.export || loading.search}
                      aria-label="Скачать Excel"
                      sx={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                      }}
                    >
                      {loading.export ? <CircularProgress size={18} /> : <ExcelIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
