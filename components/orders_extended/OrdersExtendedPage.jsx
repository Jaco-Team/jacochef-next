"use client";

import { useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import DownloadIcon from "@mui/icons-material/Download";
import { Close } from "@mui/icons-material";
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import { PARAM_OPTIONS, useOrdersExtendedStore } from "./useOrdersExtendedStore";

export default function OrdersExtendedPage() {
  const { api_laravel } = useApi("orders_extended");
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const {
    rawAccess,
    moduleName,
    points,
    allItems,
    filters,
    rows,
    total,
    page,
    perPage,
    loading,
    exportUrl,
    setLoading,
    setBootstrap,
    setFilters,
    setReport,
    clearReport,
    setPage,
    setPerPage,
    setExportUrl,
    setSearchRequestId,
  } = useOrdersExtendedStore();

  const apiRef = useRef(api_laravel);
  const showAlertRef = useRef(showAlert);
  const mountedRef = useRef(false);
  const bootstrapRequestRef = useRef(0);
  const reportRequestRef = useRef(0);

  apiRef.current = api_laravel;
  showAlertRef.current = showAlert;

  const accessHandler = useMemo(() => handleUserAccess(rawAccess ?? {}), [rawAccess]);
  const canAccess = (property) => {
    if (!rawAccess || !Object.keys(rawAccess).length) return true;
    return accessHandler.userCan("access", property);
  };

  const formatDateForApi = (value) => {
    if (!value) return null;
    const formatted = dayjs(value);
    return formatted.isValid() ? formatted.format("YYYY-MM-DD") : null;
  };

  const isValidBootstrapResponse = (response) => {
    if (response?.st === false) return false;
    if (!response || typeof response !== "object" || Array.isArray(response)) return false;
    return Boolean(response.module_info);
  };

  const buildReportPayload = (currentFilters, nextPage = page, nextPerPage = perPage) => ({
    date_start_true: formatDateForApi(currentFilters.date_start_true),
    date_end_true: formatDateForApi(currentFilters.date_end_true),
    date_start_false: formatDateForApi(currentFilters.date_start_false),
    date_end_false: formatDateForApi(currentFilters.date_end_false),
    is_show_claim: Boolean(currentFilters.is_show_claim),
    is_show_claim_last: Boolean(currentFilters.is_show_claim_last),
    is_show_marketing: Boolean(currentFilters.is_show_marketing),
    count_orders_min: currentFilters.count_orders_min,
    count_orders_max: currentFilters.count_orders_max,
    min_summ: currentFilters.min_summ,
    max_summ: currentFilters.max_summ,
    promo: currentFilters.promo,
    no_promo: Boolean(currentFilters.no_promo),
    param: currentFilters.param,
    point: currentFilters.point,
    item: currentFilters.item,
    number: currentFilters.number || null,
    page: nextPage + 1,
    perPage: nextPerPage,
  });

  const normalizeFilterValue = (name, value) => {
    if (name === "number") return value?.target?.value?.replace(/\D/g, "") || "";
    if (
      name === "is_show_claim" ||
      name === "is_show_claim_last" ||
      name === "is_show_marketing" ||
      name === "no_promo"
    ) {
      return Boolean(value?.target?.checked);
    }
    if (
      name === "date_start_true" ||
      name === "date_end_true" ||
      name === "date_start_false" ||
      name === "date_end_false" ||
      name === "point" ||
      name === "item" ||
      name === "param"
    ) {
      return value;
    }
    return value?.target?.value ?? value ?? "";
  };

  const updateFilter = (name, rawValue) => {
    const nextValue = normalizeFilterValue(name, rawValue);
    const patch = { [name]: nextValue };

    if (name === "promo" && nextValue) {
      patch.no_promo = false;
    }

    if (name === "no_promo" && nextValue) {
      patch.promo = "";
    }

    if (name === "param" && nextValue?.id === "new") {
      patch.date_start_false = null;
      patch.date_end_false = null;
    }

    setFilters(patch);
  };

  const applyPreset = (presetName) => {
    if (presetName === "returned") {
      setFilters({
        preset: presetName,
        date_start_true: dayjs().subtract(91, "day"),
        date_end_true: dayjs().subtract(1, "day"),
        date_start_false: dayjs().subtract(6, "month"),
        date_end_false: dayjs().subtract(92, "day"),
        count_orders_min: 1,
      });
      return;
    }

    if (presetName === "missed_90_days") {
      setFilters({
        preset: presetName,
        date_start_false: dayjs().subtract(91, "day"),
        date_end_false: dayjs().subtract(1, "day"),
        date_start_true: dayjs().subtract(6, "month"),
        date_end_true: dayjs().subtract(92, "day"),
        count_orders_min: 1,
      });
      return;
    }

    if (presetName === "new_week") {
      setFilters({
        preset: presetName,
        date_start_true: dayjs().subtract(8, "day"),
        date_end_true: dayjs().subtract(1, "day"),
        date_start_false: null,
        date_end_false: null,
      });
    }
  };

  const runBootstrap = async () => {
    const requestId = ++bootstrapRequestRef.current;
    setLoading("bootstrap", true);
    try {
      const response = await apiRef.current("get_all", {});
      if (!isValidBootstrapResponse(response)) {
        throw new Error(response?.text || "Ошибка загрузки модуля");
      }
      if (!mountedRef.current || requestId !== bootstrapRequestRef.current) return;
      setBootstrap(response);
      document.title = response?.module_info?.name || "Заказы";
    } catch (error) {
      if (!mountedRef.current || requestId !== bootstrapRequestRef.current) return;
      showAlertRef.current(error?.message || "Ошибка загрузки модуля");
    } finally {
      if (!mountedRef.current || requestId !== bootstrapRequestRef.current) return;
      setLoading("bootstrap", false);
    }
  };

  const runSearch = async ({
    nextPage = page,
    nextPerPage = perPage,
    currentFilters = filters,
    preserveRows = true,
  } = {}) => {
    const phone = currentFilters?.number || "";
    if (phone.length > 0 && phone.length < 4) {
      showAlertRef.current("Минимум 4 цифры в телефоне");
      return false;
    }

    const requestId = ++reportRequestRef.current;
    setSearchRequestId(requestId);
    setLoading("search", true);
    if (!preserveRows) clearReport();

    try {
      const response = await apiRef.current(
        "get_orders_more",
        buildReportPayload(currentFilters, nextPage, nextPerPage),
      );
      if (!mountedRef.current || requestId !== reportRequestRef.current) return false;
      if (!response?.orders) throw new Error(response?.text || "Не найдено заказов");
      setReport({
        rows: response.orders,
        total: response.total,
        exportUrl: response.url || "",
        page: nextPage,
        perPage: nextPerPage,
        requestId,
      });
      return true;
    } catch (error) {
      if (!mountedRef.current || requestId !== reportRequestRef.current) return false;
      showAlertRef.current(error?.message || "Ошибка получения данных");
      return false;
    } finally {
      if (!mountedRef.current || requestId !== reportRequestRef.current) return;
      setLoading("search", false);
    }
  };

  const runExport = async () => {
    if (!rows.length || !canAccess("export_items")) return;
    if (loading.export) return;

    setLoading("export", true);
    try {
      let url = exportUrl;
      if (!url) {
        const response = await apiRef.current("get_orders_more_files", {
          ...buildReportPayload(filters, page, perPage),
          page: undefined,
          perPage: undefined,
        });
        url = response?.url || "";
        if (!url) throw new Error("Ссылка для скачивания недоступна");
        if (!mountedRef.current) return;
        setExportUrl(url);
      }

      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    } catch (error) {
      if (!mountedRef.current) return;
      showAlertRef.current(error?.message || "Ошибка получения ссылки на экспорт");
    } finally {
      if (!mountedRef.current) return;
      setLoading("export", false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    runBootstrap();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <>
      <Backdrop
        open={loading.bootstrap || loading.search}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={isAlert}
        onClose={closeAlert}
        status={alertStatus}
        text={alertMessage}
      />
      <Grid
        container
        spacing={3}
        className="container_first_child"
      >
        <Grid
          size={12}
          sx={{ mb: 2 }}
        >
          <h1>{moduleName || "Заказы"}</h1>
        </Grid>
        <Grid
          container
          size={12}
          spacing={3}
        >
          <Grid
            container
            size={{ xs: 12, sm: 8 }}
            spacing={3}
          >
            <Grid size={6}>
              <MyDatePickerNew
                label="Делал заказ от"
                value={filters.date_start_true}
                maxDate={filters.date_end_true ? dayjs(filters.date_end_true) : dayjs()}
                func={(value) => updateFilter("date_start_true", value)}
              />
            </Grid>
            <Grid size={6}>
              <MyDatePickerNew
                label="Делал заказ до"
                value={filters.date_end_true}
                minDate={filters.date_start_true ? dayjs(filters.date_start_true) : undefined}
                maxDate={dayjs()}
                func={(value) => updateFilter("date_end_true", value)}
              />
            </Grid>

            <Grid size={6}>
              <MyDatePickerNew
                label="Не заказывал от"
                disabled={filters.param?.id === "new"}
                value={filters.date_start_false}
                func={(value) => updateFilter("date_start_false", value)}
              />
            </Grid>
            <Grid size={6}>
              <MyDatePickerNew
                label="Не заказывал до"
                disabled={filters.param?.id === "new"}
                value={filters.date_end_false}
                func={(value) => updateFilter("date_end_false", value)}
              />
            </Grid>

            <Grid size={6}>
              <MyTextInput
                label="Количество заказов от"
                type="number"
                min={0}
                value={filters.count_orders_min}
                func={(event) => updateFilter("count_orders_min", event)}
              />
            </Grid>
            <Grid size={6}>
              <MyTextInput
                label="Количество заказов до"
                type="number"
                min={0}
                value={filters.count_orders_max}
                func={(event) => updateFilter("count_orders_max", event)}
              />
            </Grid>

            <Grid size={6}>
              <MyTextInput
                label="Сумма заказа от"
                type="number"
                min={0}
                value={filters.min_summ}
                func={(event) => updateFilter("min_summ", event)}
              />
            </Grid>
            <Grid size={6}>
              <MyTextInput
                label="Сумма заказа до"
                type="number"
                min={0}
                value={filters.max_summ}
                func={(event) => updateFilter("max_summ", event)}
              />
            </Grid>

            <Grid size={6}>
              <MyAutocomplite
                label="Пользователи"
                disableClearable
                data={PARAM_OPTIONS}
                value={filters.param}
                func={(_, value) => updateFilter("param", value)}
              />
            </Grid>
            <Grid size={6}>
              <MyAutocomplite
                label="Позиции в заказе"
                multiple
                data={allItems}
                value={filters.item}
                func={(_, value) => updateFilter("item", value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CityCafeAutocomplete2
                points={points}
                value={filters.point}
                onChange={(value) => updateFilter("point", value)}
                label="Кафе"
                withAll
                withAllSelected
                withOrganizationMode={false}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <MyTextInput
                label="Телефон"
                type="text"
                value={filters.number}
                slotProps={{
                  input: {
                    endAdornment: filters.number ? (
                      <IconButton onClick={() => updateFilter("number", { target: { value: "" } })}>
                        <Close />
                      </IconButton>
                    ) : null,
                  },
                }}
                func={(event) => updateFilter("number", event)}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <MyTextInput
                label="Промокод"
                value={filters.promo}
                disabled={Boolean(filters.no_promo)}
                slotProps={{
                  input: {
                    endAdornment: filters.promo ? (
                      <IconButton onClick={() => updateFilter("promo", { target: { value: "" } })}>
                        <Close />
                      </IconButton>
                    ) : null,
                  },
                }}
                func={(event) => updateFilter("promo", event)}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <MyCheckBox
                label="Заказ без промокода"
                value={filters.no_promo}
                func={(event) => updateFilter("no_promo", event)}
              />
            </Grid>
          </Grid>

          <Grid
            container
            size={{ xs: 12, sm: 4 }}
            spacing={2}
          >
            <Grid
              size={12}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: { sm: "flex-start", xs: "normal" },
              }}
            >
              <Button
                variant="contained"
                onClick={() => applyPreset("returned")}
              >
                Вернувшиеся
              </Button>
              <Button
                variant="contained"
                onClick={() => applyPreset("missed_90_days")}
              >
                Не делал заказ 90 дней
              </Button>
              <Button
                variant="contained"
                onClick={() => applyPreset("new_week")}
              >
                Новые за неделю
              </Button>
              <MyCheckBox
                label="Была оформлена ошибка на заказ"
                value={filters.is_show_claim}
                func={(event) => updateFilter("is_show_claim", event)}
              />
              <MyCheckBox
                label="Была оформлена ошибка на последний заказ"
                value={filters.is_show_claim_last}
                func={(event) => updateFilter("is_show_claim_last", event)}
              />
              <MyCheckBox
                label="Подписка на рекламную рассылку"
                value={filters.is_show_marketing}
                func={(event) => updateFilter("is_show_marketing", event)}
              />
              <Stack
                sx={{
                  mt: 2,
                  gap: 1,
                  alignSelf: { xs: "center", sm: "flex-end" },
                  alignItems: "center",
                  flexDirection: { xs: "row-reverse", sm: "row" },
                }}
              >
                <Button
                  variant="contained"
                  disabled={loading.search || loading.bootstrap}
                  onClick={() =>
                    runSearch({ nextPage: 0, nextPerPage: perPage, preserveRows: true })
                  }
                >
                  Получить список заказов
                </Button>
                {canAccess("export_items") ? (
                  <Button
                    variant="contained"
                    disabled={!rows.length || loading.export || loading.search}
                    onClick={runExport}
                    sx={{ backgroundColor: exportUrl ? "#3cb623ff" : "#ffcc00" }}
                  >
                    <DownloadIcon />
                  </Button>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        {!rows.length ? null : (
          <Grid size={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Заказ</TableCell>
                    <TableCell>Точка</TableCell>
                    <TableCell>Источник трафика</TableCell>
                    <TableCell>Оформил</TableCell>
                    <TableCell>Номер клиента</TableCell>
                    <TableCell>Адрес доставки</TableCell>
                    <TableCell>Время открытия заказа</TableCell>
                    <TableCell>Ко времени</TableCell>
                    <TableCell>Закрыт на кухне</TableCell>
                    <TableCell>Получен клиентом</TableCell>
                    <TableCell>Время обещ</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Оплата</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((item, index) => {
                    const rowStyle =
                      parseInt(item.is_delete, 10) === 1
                        ? { backgroundColor: "red", color: "#fff", fontWeight: "bold" }
                        : {};
                    const orderCellStyle =
                      parseInt(item.dist, 10) >= 0
                        ? { backgroundColor: "yellow", color: "#000", fontWeight: "inherit" }
                        : { color: "inherit", fontWeight: "inherit" };

                    return (
                      <TableRow
                        key={`${item.point_id ?? "point"}-${item.id ?? index}`}
                        hover
                        style={rowStyle}
                      >
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {page * perPage + index + 1}
                        </TableCell>
                        <TableCell style={orderCellStyle}>{item.id}</TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.point_addr}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.source}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.type_user}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.number}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.street} {item.home}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.date_time_order}
                        </TableCell>
                        <TableCell
                          style={{
                            color: "inherit",
                            fontWeight: "inherit",
                            backgroundColor:
                              parseInt(item.is_preorder, 10) === 1 ? "#bababa" : "inherit",
                          }}
                        >
                          {item.need_time}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.give_data_time === "00:00:00" ? "" : item.give_data_time}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.close_order}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.unix_time_to_client === "0" || parseInt(item.is_preorder, 10) === 1
                            ? ""
                            : item.unix_time_to_client}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.type_order}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.order_price}
                        </TableCell>
                        <TableCell style={{ color: "inherit", fontWeight: "inherit" }}>
                          {item.type_pay}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 50, 100]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
              labelRowsPerPage="Записей на странице:"
              component="div"
              count={total}
              rowsPerPage={perPage}
              page={page}
              onPageChange={(_, nextPage) => {
                setPage(nextPage);
                runSearch({ nextPage, nextPerPage: perPage, preserveRows: true });
              }}
              onRowsPerPageChange={(event) => {
                const nextPerPage = parseInt(event.target.value, 10);
                setPerPage(nextPerPage);
                setPage(0);
                runSearch({ nextPage: 0, nextPerPage, preserveRows: true });
              }}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
}
