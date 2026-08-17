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
  onApplyPreset,
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
          size={{ xs: 12, md: 9 }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Делал заказ от"
              value={filters.date_start_true}
              maxDate={filters.date_end_true ? dayjs(filters.date_end_true) : dayjs()}
              func={(value) => onUpdateFilter("date_start_true", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Делал заказ до"
              value={filters.date_end_true}
              minDate={filters.date_start_true ? dayjs(filters.date_start_true) : undefined}
              maxDate={dayjs()}
              func={(value) => onUpdateFilter("date_end_true", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Не заказывал от"
              disabled={filters.param?.id === "new"}
              value={filters.date_start_false}
              func={(value) => onUpdateFilter("date_start_false", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Не заказывал до"
              disabled={filters.param?.id === "new"}
              value={filters.date_end_false}
              func={(value) => onUpdateFilter("date_end_false", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Количество заказов от"
              type="number"
              min={0}
              value={filters.count_orders_min}
              func={(event) => onUpdateFilter("count_orders_min", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Количество заказов до"
              type="number"
              min={0}
              value={filters.count_orders_max}
              func={(event) => onUpdateFilter("count_orders_max", event)}
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
            <MyTextInput
              label="Средний чек от"
              type="number"
              min={0}
              value={filters.avg_check_min}
              func={(event) => onUpdateFilter("avg_check_min", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Средний чек до"
              type="number"
              min={0}
              value={filters.avg_check_max}
              func={(event) => onUpdateFilter("avg_check_max", event)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyAutocomplite
              label="Пользователи"
              disableClearable
              data={PARAM_OPTIONS}
              value={filters.param}
              func={(_, value) => onUpdateFilter("param", value)}
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
              label="Категории в заказе"
              multiple
              data={categories}
              value={filters.category_ids}
              func={(_, value) => onUpdateFilter("category_ids", value)}
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
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <CityCafeAutocomplete2
              points={points}
              value={filters.point || []}
              onChange={(value) => onUpdateFilter("point", value)}
              label="Кафе"
              withAll={points.length > 0}
              withOrganizationMode={false}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyTextInput
              label="Телефон"
              type="text"
              value={filters.number}
              slotProps={{
                input: {
                  endAdornment: filters.number ? (
                    <IconButton
                      type="button"
                      onClick={() => onUpdateFilter("number", { target: { value: "" } })}
                    >
                      <Close />
                    </IconButton>
                  ) : null,
                },
              }}
              func={(event) => onUpdateFilter("number", event)}
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
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              flexWrap="wrap"
              sx={{ minHeight: "100%", alignItems: "center" }}
            >
              <MyCheckBox
                label="Заказ без промокода"
                value={filters.no_promo}
                func={(event) => onUpdateFilter("no_promo", event)}
              />
              <MyCheckBox
                label="Заказы с промокодом"
                value={filters.with_promo}
                func={(event) => onUpdateFilter("with_promo", event)}
              />
            </Stack>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Stack spacing={1}>
            <Button
              type="button"
              variant="contained"
              onClick={() => onApplyPreset("returned")}
            >
              Вернувшиеся
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => onApplyPreset("missed_90_days")}
            >
              Не делал заказ 90 дней
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => onApplyPreset("new_week")}
            >
              Новые за неделю
            </Button>
            <MyCheckBox
              label="Была оформлена ошибка на заказ"
              value={filters.is_show_claim}
              func={(event) => onUpdateFilter("is_show_claim", event)}
            />
            <MyCheckBox
              label="Была оформлена ошибка на последний заказ"
              value={filters.is_show_claim_last}
              func={(event) => onUpdateFilter("is_show_claim_last", event)}
            />
            <MyCheckBox
              label="Подписка на рекламную рассылку"
              value={filters.is_show_marketing}
              func={(event) => onUpdateFilter("is_show_marketing", event)}
            />
            <Stack
              direction={isDesktop ? "row" : "column"}
              spacing={1}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={onReset}
                disabled={loading.search || loading.bootstrap || loading.export}
                sx={{ flexGrow: 1 }}
              >
                Сбросить
              </Button>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexGrow: 1 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading.search || loading.bootstrap}
                  sx={{ flexGrow: 1 }}
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
                          width: 46,
                          height: 46,
                          borderRadius: 1,
                        }}
                      >
                        {loading.export ? <CircularProgress size={22} /> : <ExcelIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
