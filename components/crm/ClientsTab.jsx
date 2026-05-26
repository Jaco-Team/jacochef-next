import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import {
  MyAutoCompleteWithAll,
  MyAutocomplite,
  MyCheckBox,
  MyDatePickerNew,
  MyTextInput,
} from "@/ui/Forms";
import dayjs from "dayjs";
import { Clear, Download } from "@mui/icons-material";
import { delivery_types, order_types_all } from "@/components/site_clients/config";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import ClientHistoryTable from "@/components/site_clients/history/ClientHistoryTable";
import React from "react";

export const ClientsTab = ({
  form,
  setField,
  points,
  categories,
  segments,
  all_items,
  clientHistory,
  columns,
  is_load,
  applyRequest,
  exportXLSX,
  canAccess,
}) => {
  return (
    <>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, sm: 4 }}>
          <CityCafeAutocomplete2
            label="Кафе"
            points={points}
            value={form.points_history}
            onChange={(v) => setField("points_history", v)}
            withAll
            withAllSelected
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MyDatePickerNew
            label="Дата от"
            customActions={true}
            value={dayjs(form.date_start)}
            maxDate={dayjs(form.date_end) ?? dayjs()}
            func={(e) => setField("date_start", e)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <MyDatePickerNew
            label="Дата до"
            customActions={true}
            value={dayjs(form.date_end)}
            minDate={dayjs(form.date_start)}
            maxDate={dayjs()}
            func={(e) => setField("date_end", e)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <MyTextInput
            type="number"
            label="Заказов за период, от"
            value={form.orders_count}
            func={({ target }) => setField("orders_count", target?.value)}
          />
        </Grid>

        <Grid
          size={{ xs: 12, sm: 5 }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <MyTextInput
            type="text"
            className="input_promo"
            label="Промокод содержит"
            value={form.promo}
            func={({ target }) => setField("promo", target?.value)}
            inputAdornment={
              !form.promo ? null : (
                <IconButton>
                  <Clear onClick={() => setField("promo", "")} />
                </IconButton>
              )
            }
            sx={{ width: "55%" }}
          />
          <MyCheckBox
            value={form.promo_dr}
            func={({ target }) => setField("promo_dr", Number(target?.checked) || 0)}
            label="Промик на ДР"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <MyTextInput
            type="text"
            label="UTM содержит"
            value={form.order_utm}
            func={({ target }) => setField("order_utm", target?.value)}
            inputAdornment={
              !form.order_utm ? null : (
                <IconButton>
                  <Clear onClick={() => setField("order_utm", "")} />
                </IconButton>
              )
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <MyAutoCompleteWithAll
            withAll={true}
            label="Кто оформил"
            multiple={true}
            options={order_types_all}
            value={form.order_types}
            onChange={(e) => setField("order_types", e)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <MyAutocomplite
            label="Пол"
            multiple={false}
            data={[
              { id: 1, name: "Все", type: "all" },
              { id: 2, name: "Мужчина", type: "male" },
              { id: 3, name: "Женщина", type: "female" },
            ]}
            value={form.gender}
            func={(data, value) => setField("gender", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <MyAutocomplite
            label="Сегмент"
            multiple={false}
            data={segments}
            value={form.segment}
            func={(data, value) => setField("segment", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <MyAutocomplite
            label="Категории в заказе"
            multiple={true}
            data={categories}
            value={form.categories}
            func={(data, value) => setField("categories", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <MyTextInput
            type="number"
            label="Дней с последнего заказа"
            value={form.day_last}
            func={({ target }) => setField("day_last", target?.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <MyAutoCompleteWithAll
            withAll={true}
            label="Тип доставки"
            multiple={true}
            options={delivery_types}
            value={form.delivery_type}
            onChange={(e) => setField("delivery_type", e)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <MyAutocomplite
            label="Позиции в заказе"
            multiple={true}
            data={all_items}
            value={form.items}
            func={(_, v) => setField("items", v)}
          />
        </Grid>

        <Grid
          size={{ xs: 12, sm: 2 }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: { xs: "flex-end", sm: "space-evenly" },
          }}
        >
          <Button
            onClick={() => applyRequest()}
            variant="contained"
          >
            Показать
          </Button>

          {canAccess("download_file") && clientHistory?.length > 0 && (
            <Tooltip title={<Typography>{"Скачать таблицу в Excel"}</Typography>}>
              <span>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#3cb623ff" }}
                  onClick={() =>
                    exportXLSX(
                      clientHistory,
                      columns,
                      `client_history_${formatYMD(form.date_start)}-${formatYMD(form.date_end)}.xlsx`,
                    )
                  }
                >
                  <Download />
                </Button>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      {!!clientHistory.length ? (
        <div style={{ padding: "24px" }}>
          <ClientHistoryTable
            columns={columns}
            rows={clientHistory}
          />
        </div>
      ) : (
        <Typography sx={{ mt: 3, mx: "auto" }}>Нет данных</Typography>
      )}
    </>
  );
};
