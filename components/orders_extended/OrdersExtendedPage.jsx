"use client";

import { useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  CircularProgress,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import MyAlert from "@/ui/MyAlert";
import OrdersExtendedFilters from "./OrdersExtendedFilters";
import OrdersExtendedOrderModal from "./OrdersExtendedOrderModal";
import OrdersExtendedTable from "./OrdersExtendedTable";
import { useOrdersExtendedStore } from "./useOrdersExtendedStore";

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
    clearPersistedFilters,
  } = useOrdersExtendedStore();

  const apiRef = useRef(api_laravel);
  const showAlertRef = useRef(showAlert);
  const mountedRef = useRef(false);
  const bootstrapRequestRef = useRef(0);
  const reportRequestRef = useRef(0);
  const orderRequestRef = useRef(0);
  const reportCacheRef = useRef(new Map());

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

  const selectedIds = (values = []) =>
    values.map((value) => (typeof value === "object" ? value?.id : value));

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
    is_show_claim: Boolean(currentFilters.is_show_claim),
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
    category_ids: selectedIds(currentFilters.category_ids),
    source_ids: selectedIds(currentFilters.source_ids),
    traffic_source: currentFilters.traffic_source,
    order_type_ids: selectedIds(currentFilters.order_type_ids),
    payment_type_ids: selectedIds(currentFilters.payment_type_ids),
    page: nextPage + 1,
    perPage: nextPerPage,
    sort_by: nextSortBy,
    sort_dir: nextSortDir,
  });

  const normalizeFilterValue = (name, value) => {
    if (name === "is_show_claim" || name === "no_promo" || name === "with_promo") {
      return Boolean(value?.target?.checked);
    }
    if (
      name === "date_start_true" ||
      name === "date_end_true" ||
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

    setFilters(patch);
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
    const requestId = ++reportRequestRef.current;
    const payload = buildReportPayload(
      currentFilters,
      nextPage,
      nextPerPage,
      nextSortBy,
      nextSortDir,
    );
    const cacheKey = JSON.stringify(payload);
    setSearchRequestId(requestId);
    setLoading("search", true);
    if (!preserveRows) clearReport();

    const cachedResponse = reportCacheRef.current.get(cacheKey);
    if (cachedResponse) {
      if (mountedRef.current && requestId === reportRequestRef.current) {
        setReport({
          rows: cachedResponse.orders,
          total: cachedResponse.total,
          totals: cachedResponse.totals,
          exportUrl: cachedResponse.url || "",
          page: nextPage,
          perPage: nextPerPage,
          requestId,
        });
        setLoading("search", false);
      }
      return true;
    }

    try {
      const response = await apiRef.current("get_orders_more", payload);
      if (!mountedRef.current || requestId !== reportRequestRef.current) return false;
      if (!response?.orders) throw new Error(response?.text || "Не найдено заказов");
      reportCacheRef.current.set(cacheKey, response);
      if (reportCacheRef.current.size > 50) {
        reportCacheRef.current.delete(reportCacheRef.current.keys().next().value);
      }
      setReport({
        rows: response.orders,
        total: response.total,
        totals: response.totals,
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

  const handleResetFilters = () => {
    reportCacheRef.current.clear();
    clearPersistedFilters();
    setPage(0);
    setPerPage(50);
    setSort("id", "desc");
    setExportUrl("");
    clearReport();
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
      <OrdersExtendedOrderModal
        orderModal={orderModal}
        onClose={handleOrderModalClose}
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
        <Grid size={12}>
          {isDesktop ? (
            <Stack spacing={2}>
              <h3 style={{ margin: 0 }}>Фильтры</h3>
              <OrdersExtendedFilters
                filters={filters}
                points={points}
                allItems={allItems}
                categories={categories}
                sources={sources}
                orderTypes={orderTypes}
                paymentTypes={paymentTypes}
                rows={rows}
                loading={loading}
                isDesktop={isDesktop}
                canExport={canAccess("export_items")}
                onSubmit={handleSearchSubmit}
                onKeyDown={handleDesktopFormKeyDown}
                onUpdateFilter={updateFilter}
                onReset={handleResetFilters}
                onExport={runExport}
              />
            </Stack>
          ) : (
            <Accordion
              defaultExpanded
              disableGutters
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <h3 style={{ margin: 0 }}>Фильтры</h3>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <OrdersExtendedFilters
                  filters={filters}
                  points={points}
                  allItems={allItems}
                  categories={categories}
                  sources={sources}
                  orderTypes={orderTypes}
                  paymentTypes={paymentTypes}
                  rows={rows}
                  loading={loading}
                  isDesktop={isDesktop}
                  canExport={canAccess("export_items")}
                  onSubmit={handleSearchSubmit}
                  onKeyDown={handleDesktopFormKeyDown}
                  onUpdateFilter={updateFilter}
                  onReset={handleResetFilters}
                  onExport={runExport}
                  mobile
                />
              </AccordionDetails>
            </Accordion>
          )}
        </Grid>

        <Grid size={12}>
          <OrdersExtendedTable
            rows={rows}
            totals={totals}
            total={total}
            page={page}
            perPage={perPage}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={handleOrderRowClick}
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
      </Grid>
    </>
  );
}
