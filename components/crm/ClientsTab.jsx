import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import {
  MyAutoCompleteWithAll,
  MyAutocomplite,
  MyCheckBox,
  MyDatePickerNew,
  MyTextInput,
} from "@/ui/Forms";
import dayjs from "dayjs";
import { Clear, Download, Settings } from "@mui/icons-material";
import { delivery_types, order_types_all } from "@/components/site_clients/config";
import { formatYMD } from "@/src/helpers/ui/formatDate";
import ClientHistoryTable from "@/components/site_clients/history/ClientHistoryTable";
import React from "react";

const TABLE_COLUMNS_STORAGE_KEY = "crm_clients_table_columns";

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
  const defaultColumnKeys = React.useMemo(() => columns.map((column) => column.key), [columns]);
  const [tableSettingsOpen, setTableSettingsOpen] = React.useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = React.useState(defaultColumnKeys);

  React.useEffect(() => {
    if (!defaultColumnKeys.length) return;

    const savedColumns = localStorage.getItem(TABLE_COLUMNS_STORAGE_KEY);

    if (!savedColumns) {
      setVisibleColumnKeys(defaultColumnKeys);
      return;
    }

    try {
      const parsedColumns = JSON.parse(savedColumns);
      const availableKeys = new Set(defaultColumnKeys);
      const nextVisibleColumns = parsedColumns.filter((key) => availableKeys.has(key));
      setVisibleColumnKeys(nextVisibleColumns.length ? nextVisibleColumns : defaultColumnKeys);
    } catch {
      setVisibleColumnKeys(defaultColumnKeys);
    }
  }, [defaultColumnKeys]);

  React.useEffect(() => {
    if (visibleColumnKeys.length) {
      localStorage.setItem(TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumnKeys));
    }
  }, [visibleColumnKeys]);

  const visibleColumns = React.useMemo(
    () => columns.filter((column) => visibleColumnKeys.includes(column.key)),
    [columns, visibleColumnKeys],
  );

  const toggleColumn = (key) => {
    setVisibleColumnKeys((prev) => {
      if (!prev.includes(key)) {
        return [...prev, key];
      }

      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((columnKey) => columnKey !== key);
    });
  };

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

        <Grid size={{ xs: 12, sm: 3 }}>
          <MyTextInput
            label="Номер телефона"
            value={form.phone}
            func={({ target }) => setField("phone", target?.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <MyTextInput
            label="E-mail"
            value={form.mail}
            func={({ target }) => setField("mail", target?.value)}
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
              { id: 4, name: "Не указан", type: "not_specified" },
            ]}
            value={form.gender}
            func={(data, value) => setField("gender", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <MyAutocomplite
            label="Тип клиента"
            multiple={false}
            data={[
              { id: 1, name: "Все", type: "all" },
              { id: 2, name: "Новый", type: "new" },
              { id: 3, name: "Действующий", type: "current" },
            ]}
            value={form.type_client}
            func={(data, value) => setField("type_client", value)}
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
          <MyTextInput
            type="number"
            label="Дней с первого заказа"
            value={form.day_first}
            func={({ target }) => setField("day_first", target?.value)}
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
          {!!columns.length && (
            <Button
              variant="outlined"
              onClick={() => setTableSettingsOpen(true)}
              sx={{ minWidth: 44 }}
            >
              <Settings />
            </Button>
          )}

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
      <Dialog
        open={tableSettingsOpen}
        onClose={() => setTableSettingsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Настройка вида таблицы</DialogTitle>
        <DialogContent dividers>
          <Stack>
            {columns.map((column) => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={visibleColumnKeys.includes(column.key)}
                    onChange={() => toggleColumn(column.key)}
                  />
                }
                label={column.label}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisibleColumnKeys(defaultColumnKeys)}>Сбросить</Button>
          <Button
            variant="contained"
            onClick={() => setTableSettingsOpen(false)}
          >
            Готово
          </Button>
        </DialogActions>
      </Dialog>
      {!!clientHistory.length ? (
        <div>
          <ClientHistoryTable
            columns={visibleColumns}
            rows={clientHistory}
            tableContainerSx={{
              maxHeight: "none",
              overflowY: "visible",
            }}
          />
        </div>
      ) : (
        <Typography sx={{ mt: 3, mx: "auto" }}>Нет данных</Typography>
      )}
    </>
  );
};
