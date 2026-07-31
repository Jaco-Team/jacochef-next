"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import DownloadIcon from "@mui/icons-material/Download";
import { Close, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Backdrop,
  Button,
  Collapse,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import MyAlert from "@/ui/MyAlert";
import { MyAutocomplite, MyCheckBox, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import ModalOrderWithFeedback from "@/components/site_clients/ModalOrderWithFeedback";
import OrderDetailsModal from "@/components/shared/order/OrderDetailsModal";
import { formatNumber, formatRUR } from "@/src/helpers/utils/i18n";
import { PARAM_OPTIONS, useOrdersExtendedStore } from "./useOrdersExtendedStore";

export default function OrdersExtendedPage() {
  const { api_laravel } = useApi("orders_extended");
  const { isAlert, showAlert, closeAlert, alertStatus, alertMessage } = useMyAlert();
  const {
    rawAccess,
    moduleName,
    points,
    allItems,
    categories,
    sources,
    orderTypes,
    paymentTypes,
    filters,
    rows,
    total,
    totals,
    page,
    perPage,
    sortBy,
    sortDir,
    loading,
    exportUrl,
    orderModal,
    setLoading,
    setBootstrap,
    setFilters,
    setReport,
    clearReport,
    setPage,
    setPerPage,
    setSort,
    setExportUrl,
    setSearchRequestId,
    openOrderModal,
    setOrderModalOrder,
    closeOrderModal,
  } = useOrdersExtendedStore();

  const apiRef = useRef(api_laravel);
  const showAlertRef = useRef(showAlert);
  const mountedRef = useRef(false);
  const bootstrapRequestRef = useRef(0);
  const reportRequestRef = useRef(0);
  const orderRequestRef = useRef(0);
  const [filtersOpen, setFiltersOpen] = useState(true);

  apiRef.current = api_laravel;
  showAlertRef.current = showAlert;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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

  const buildReportPayload = (
    currentFilters,
    nextPage = page,
    nextPerPage = perPage,
    nextSortBy = sortBy,
    nextSortDir = sortDir,
  ) => ({
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
    avg_check_min: currentFilters.avg_check_min,
    avg_check_max: currentFilters.avg_check_max,
    promo: currentFilters.promo,
    no_promo: Boolean(currentFilters.no_promo),
    with_promo: Boolean(currentFilters.with_promo),
    param: currentFilters.param,
    point: currentFilters.point,
    item: currentFilters.item,
    category_ids: currentFilters.category_ids,
    source_ids: currentFilters.source_ids,
    order_type_ids: currentFilters.order_type_ids,
    payment_type_ids: currentFilters.payment_type_ids,
    number: currentFilters.number || null,
    page: nextPage + 1,
    perPage: nextPerPage,
    sort_by: nextSortBy,
    sort_dir: nextSortDir,
  });

  const normalizeFilterValue = (name, value) => {
    if (name === "number") return value?.target?.value?.replace(/\D/g, "") || "";
    if (
      name === "is_show_claim" ||
      name === "is_show_claim_last" ||
      name === "is_show_marketing" ||
      name === "no_promo" ||
      name === "with_promo"
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
      name === "param" ||
      name === "category_ids" ||
      name === "source_ids" ||
      name === "order_type_ids" ||
      name === "payment_type_ids"
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
      patch.with_promo = false;
    }

    if (name === "with_promo" && nextValue) {
      patch.no_promo = false;
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
    nextSortBy = sortBy,
    nextSortDir = sortDir,
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
        buildReportPayload(currentFilters, nextPage, nextPerPage, nextSortBy, nextSortDir),
      );
      if (!mountedRef.current || requestId !== reportRequestRef.current) return false;
      if (!response?.orders) throw new Error(response?.text || "Не найдено заказов");
      setReport({
        rows: response.orders,
        total: response.total,
        totals: response.totals,
        exportUrl: response.url || "",
        page: nextPage,
        perPage: nextPerPage,
        requestId,
      });
      if (response.orders.length > 0) {
        setFiltersOpen(false);
      }
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

  const handleSort = (field) => {
    const nextSortDir = sortBy === field && sortDir === "asc" ? "desc" : "asc";
    setSort(field, nextSortDir);
    runSearch({
      nextPage: 0,
      nextPerPage: perPage,
      nextSortBy: field,
      nextSortDir,
      preserveRows: true,
    });
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

  const runOpenOrder = async (pointId, orderId, row = null) => {
    if (!pointId || !orderId) {
      showAlertRef.current("Не удалось открыть заказ: отсутствует идентификатор заказа или точки");
      return false;
    }

    const requestId = ++orderRequestRef.current;
    openOrderModal(row);
    setOrderModalOrder(null);
    setLoading("search", true);

    try {
      const response = await apiRef.current("get_order_orders", {
        point_id: pointId,
        order_id: orderId,
      });
      if (!mountedRef.current || requestId !== orderRequestRef.current) return false;
      if (!response?.order) throw new Error(response?.text || "Не удалось загрузить детали заказа");
      setOrderModalOrder(response);
      return true;
    } catch (error) {
      if (!mountedRef.current || requestId !== orderRequestRef.current) return false;
      closeOrderModal();
      showAlertRef.current(error?.message || "Ошибка получения заказа");
      return false;
    } finally {
      if (!mountedRef.current || requestId !== orderRequestRef.current) return;
      setLoading("search", false);
    }
  };

  const handleOrderRowClick = (row) => {
    const pointId = row?.point_id;
    const orderId = row?.id;

    if (!pointId || !orderId) {
      showAlertRef.current("Не удалось открыть заказ: в строке нет point_id или id");
      return;
    }

    runOpenOrder(pointId, orderId, row);
  };

  const handleOrderModalClose = () => {
    orderRequestRef.current += 1;
    closeOrderModal();
  };

  const handleSearchSubmit = async (event) => {
    event?.preventDefault();
    await runSearch({
      nextPage: 0,
      nextPerPage: perPage,
      preserveRows: true,
    });
  };

  const handleDesktopFormKeyDown = (event) => {
    if (!isDesktop || event.key !== "Enter") return;
    const targetTagName = event.target?.tagName?.toLowerCase();
    if (targetTagName === "textarea") return;
    event.preventDefault();
    handleSearchSubmit(event);
  };

  const renderFilterFields = () => (
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
            func={(value) => updateFilter("date_start_true", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyDatePickerNew
            label="Делал заказ до"
            value={filters.date_end_true}
            minDate={filters.date_start_true ? dayjs(filters.date_start_true) : undefined}
            maxDate={dayjs()}
            func={(value) => updateFilter("date_end_true", value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyDatePickerNew
            label="Не заказывал от"
            disabled={filters.param?.id === "new"}
            value={filters.date_start_false}
            func={(value) => updateFilter("date_start_false", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyDatePickerNew
            label="Не заказывал до"
            disabled={filters.param?.id === "new"}
            value={filters.date_end_false}
            func={(value) => updateFilter("date_end_false", value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyTextInput
            label="Количество заказов от"
            type="number"
            min={0}
            value={filters.count_orders_min}
            func={(event) => updateFilter("count_orders_min", event)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyTextInput
            label="Количество заказов до"
            type="number"
            min={0}
            value={filters.count_orders_max}
            func={(event) => updateFilter("count_orders_max", event)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyTextInput
            label="Сумма заказа от"
            type="number"
            min={0}
            value={filters.min_summ}
            func={(event) => updateFilter("min_summ", event)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyTextInput
            label="Сумма заказа до"
            type="number"
            min={0}
            value={filters.max_summ}
            func={(event) => updateFilter("max_summ", event)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyTextInput
            label="Средний чек от"
            type="number"
            min={0}
            value={filters.avg_check_min}
            func={(event) => updateFilter("avg_check_min", event)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyTextInput
            label="Средний чек до"
            type="number"
            min={0}
            value={filters.avg_check_max}
            func={(event) => updateFilter("avg_check_max", event)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyAutocomplite
            label="Пользователи"
            disableClearable
            data={PARAM_OPTIONS}
            value={filters.param}
            func={(_, value) => updateFilter("param", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyAutocomplite
            label="Позиции в заказе"
            multiple
            data={allItems}
            value={filters.item}
            func={(_, value) => updateFilter("item", value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyAutocomplite
            label="Категории в заказе"
            multiple
            data={categories}
            value={filters.category_ids}
            func={(_, value) => updateFilter("category_ids", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyAutocomplite
            label="Способ заказа"
            multiple
            data={sources}
            value={filters.source_ids}
            func={(_, value) => updateFilter("source_ids", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyAutocomplite
            label="Тип заказа"
            multiple
            data={orderTypes}
            value={filters.order_type_ids}
            func={(_, value) => updateFilter("order_type_ids", value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MyAutocomplite
            label="Способ оплаты"
            multiple
            data={paymentTypes}
            value={filters.payment_type_ids}
            func={(_, value) => updateFilter("payment_type_ids", value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                    onClick={() => updateFilter("number", { target: { value: "" } })}
                  >
                    <Close />
                  </IconButton>
                ) : null,
              },
            }}
            func={(event) => updateFilter("number", event)}
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
                    onClick={() => updateFilter("promo", { target: { value: "" } })}
                  >
                    <Close />
                  </IconButton>
                ) : null,
              },
            }}
            func={(event) => updateFilter("promo", event)}
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
              label="Показывать без промокода"
              value={filters.no_promo}
              func={(event) => updateFilter("no_promo", event)}
            />
            <MyCheckBox
              label="Показывать с промокодом"
              value={filters.with_promo}
              func={(event) => updateFilter("with_promo", event)}
            />
          </Stack>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Stack spacing={1}>
          <Button
            type="button"
            variant="contained"
            onClick={() => applyPreset("returned")}
          >
            Вернувшиеся
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => applyPreset("missed_90_days")}
          >
            Не делал заказ 90 дней
          </Button>
          <Button
            type="button"
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
            direction="row"
            spacing={1}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={loading.search || loading.bootstrap}
              sx={{ flexGrow: 1 }}
            >
              Получить список заказов
            </Button>
            {canAccess("export_items") ? (
              <Button
                type="button"
                variant="contained"
                disabled={!rows.length || loading.export || loading.search}
                onClick={runExport}
                sx={{ backgroundColor: exportUrl ? "#3cb623ff" : "#ffcc00", minWidth: 48 }}
              >
                <DownloadIcon />
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );

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
      {orderModal.open && orderModal.order ? (
        canAccess("send_feedback") ? (
          <ModalOrderWithFeedback
            open={orderModal.open}
            onClose={handleOrderModalClose}
            order={orderModal.order}
            getData={(method, payload) => apiRef.current(method, payload)}
            showAlert={showAlert}
            openOrder={(pointId, orderId) => runOpenOrder(pointId, orderId, orderModal.row)}
          />
        ) : (
          <OrderDetailsModal
            open={orderModal.open}
            onClose={handleOrderModalClose}
            order={orderModal.order}
          />
        )
      ) : null}
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
        <Grid size={12}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <h3 style={{ margin: 0 }}>Фильтры</h3>
              <Button
                type="button"
                variant="outlined"
                size="small"
                endIcon={filtersOpen ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setFiltersOpen((prev) => !prev)}
              >
                {filtersOpen ? "Свернуть" : "Развернуть"}
              </Button>
            </Stack>

            <Collapse
              in={filtersOpen}
              timeout="auto"
              unmountOnExit
            >
              <Paper
                component="form"
                onSubmit={handleSearchSubmit}
                onKeyDown={handleDesktopFormKeyDown}
                sx={{
                  p: 2,
                  maxHeight: { xs: "70vh", md: "50vh" },
                  overflowY: "auto",
                }}
              >
                {renderFilterFields()}
              </Paper>
            </Collapse>
          </Stack>
        </Grid>

        {!rows.length ? null : (
          <Grid size={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    {[
                      ["source", "Источник трафика"],
                      ["type_user", "Оформил"],
                      ["address", "Адрес доставки"],
                      ["type_order", "Тип"],
                      ["status", "Статус"],
                      ["order_price", "Сумма"],
                      ["avg_check", "Средний чек"],
                      ["promo_name", "Промокод"],
                      ["type_pay", "Оплата"],
                      ["driver", "Курьер"],
                    ].map(([field, label]) => (
                      <TableCell
                        key={field}
                        sortDirection={sortBy === field ? sortDir : false}
                      >
                        <TableSortLabel
                          active={sortBy === field}
                          direction={sortBy === field ? sortDir : "asc"}
                          onClick={() => handleSort(field)}
                        >
                          {label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((item, index) => {
                    return (
                      <TableRow
                        key={`${item.source ?? "source"}-${item.driver ?? "driver"}-${index}`}
                        hover
                        onClick={() => handleOrderRowClick(item)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{page * perPage + index + 1}</TableCell>
                        <TableCell>{item.source}</TableCell>
                        <TableCell>{item.type_user}</TableCell>
                        <TableCell>{item.address}</TableCell>
                        <TableCell>{item.type_order}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>{formatRUR(item.order_price, false)}</TableCell>
                        <TableCell>{formatRUR(item.avg_check, false)}</TableCell>
                        <TableCell>{item.promo_name}</TableCell>
                        <TableCell>{item.type_pay}</TableCell>
                        <TableCell>{item.driver}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>
                      <strong>Итого: {formatNumber(totals.count, 0, 0)}</strong>
                    </TableCell>
                    <TableCell colSpan={5} />
                    <TableCell>
                      <strong>{formatRUR(totals.order_price_sum, false)}</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{formatRUR(totals.avg_check_avg, false)}</strong>
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
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
