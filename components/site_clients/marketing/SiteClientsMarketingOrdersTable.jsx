"use client";

import {
  Badge,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  Collapse,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";
import useMarketingTabStore, { defaultFilters } from "./useMarketingTabStore";
import { Clear, FilterAlt, FilterAltOff, Sort, SwapVert } from "@mui/icons-material";
import { useDebounce } from "@/src/hooks/useDebounce";
import ExcelIcon from "@/ui/ExcelIcon";
import DownloadButton from "@/components/shared/DownloadButton";
import { useLoading } from "./useClientsLoadingContext";

function SiteClientsMarketingOrdersTable({
  openOrder,
  openClient,
  showAlert,
  getData,
  canExport,
  ...restAttrs
}) {
  const {
    orders,
    orderIds,
    page,
    setPage,
    perPage,
    setPerPage,
    total,
    filters,
    slices,
    setFiltersItem,
    resetFilters,
    toggleSortDir,
  } = useMarketingTabStore();

  const { isLoading, setIsLoading } = useLoading();

  const handleSort = (key) => {
    if (filters.sortBy === key) {
      toggleSortDir();
    } else {
      setFiltersItem("sortBy", key);
      setFiltersItem("sortDir", "desc"); // default direction
    }
    setPage(1); // reset page on new sort
  };

  const [openFilters, setOpenFilters] = useState({});

  const handleToggleFilter = (key, value = null) => {
    setOpenFilters((prev) => ({ ...prev, [key]: value !== null ? value : !prev[key] }));
  };

  const checkDates = (from, to) => {
    if (!from || !to) return false;
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    return fromDate.isValid() && toDate.isValid() && fromDate.diff(toDate) <= 0;
  };

  // core orders fetcher
  const getOrders = async () => {
    const {
      points,
      dateStart,
      dateEnd,
      orderIds,
      page,
      perPage,
      filters,
      slices,
      setOrders,
      setTotal,
    } = useMarketingTabStore.getState();
    try {
      if (!points.length || !dateStart || !dateEnd) {
        return;
      }
      if (!checkDates(dateStart, dateEnd)) {
        showAlert("Дата начала должна быть перед датой окончания", false);
        return;
      }
      setIsLoading(true);
      setOrders(null);
      setTotal(0);
      const resData = await getData("get_marketing_orders", {
        points: points,
        date_start: dayjs(dateStart).format("YYYY-MM-DD"),
        date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
        ids: orderIds,
        page,
        perPage,
        filters,
        slices,
      });

      if (!resData?.st) {
        showAlert(resData?.text || "За период нет заказов", false);
        return;
      }

      setOrders(resData?.orders || null);
      setTotal(resData.meta?.total_orders || 0);
    } catch (e) {
      showAlert(`Ошибка при загрузке заказов: ${e.message}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  // export handler
  const getExportLink = async () => {
    const { points, dateStart, dateEnd, orderIds, filters, slices } =
      useMarketingTabStore.getState();
    if (!checkDates(dateStart, dateEnd)) {
      showAlert("Дата начала должна быть перед датой окончания", false);
      return;
    }
    try {
      const linkData = await getData("get_marketing_orders_export", {
        points: points,
        date_start: dayjs(dateStart).format("YYYY-MM-DD"),
        date_end: dayjs(dateEnd).format("YYYY-MM-DD"),
        ids: orderIds,
        filters,
        slices,
        export: true,
      });
      if (!linkData?.st || !linkData.link) {
        throw new Error(linkData?.text || `Ссылка на экспорт не найдена`);
      }
      return linkData.link;
    } catch (e) {
      showAlert(`Ошибка при получении ссылки на экспорт: ${e.message}`, false);
    }
  };

  // effects
  const debouncedGetOrders = useDebounce(getOrders, 700);

  useEffect(() => {
    debouncedGetOrders();
  }, [filters, page, perPage, slices, orderIds]);

  return isLoading ? (
    <CircularProgress />
  ) : (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        {canExport && (
          <DownloadButton
            url={async () => await getExportLink()}
            title="Экспортировать в Excel"
            style={{ cursor: "pointer", padding: 10 }}
          >
            <ExcelIcon />
          </DownloadButton>
        )}
        <IconButton
          title="Сбросить фильтры"
          style={{ cursor: "pointer", padding: 10 }}
          onClick={() => resetFilters()}
        >
          <FilterAltOff sx={{ color: "rgba(0, 14, 136, 1)" }} />
        </IconButton>
      </Box>
      <TableContainer
        {...restAttrs}
        sx={{
          maxHeight: "70dvh", // adjust to fit Dialog
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {ordersTableColumns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    px={1}
                  >
                    <Typography sx={{ mr: 1 }}>{col.label}</Typography>
                    <IconButton
                      sx={{ marginLeft: "auto" }}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSort(col.key);
                      }}
                    >
                      {filters.sortBy === col.key ? (
                        <Sort
                          sx={{
                            transform: filters.sortDir === "asc" ? "scaleY(-1)" : "none",
                            transition: "transform 0.2s ease",
                            color: "primary.main",
                          }}
                          fontSize="small"
                        />
                      ) : (
                        <SwapVert />
                      )}
                    </IconButton>
                    {defaultFilters.hasOwnProperty(col.key) && (
                      <IconButton
                        size="small"
                        title={
                          col.filterType !== "boolean"
                            ? `${
                                col.title ? `${col.title}, ` : ""
                              }*: не пустые, -*: пустые, abc, -abc, "a b c", -"a b c"`
                            : ""
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFilter(col.key);
                        }}
                      >
                        <Badge
                          color="error"
                          variant="dot"
                          invisible={!filters[col.key]}
                        >
                          <FilterAlt fontSize="small" />
                        </Badge>
                      </IconButton>
                    )}
                  </Box>
                  <Collapse
                    in={openFilters[col.key]}
                    timeout="auto"
                    unmountOnExit
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 3,
                    }}
                  >
                    <ClickAwayListener onClickAway={() => handleToggleFilter(col.key, false)}>
                      <Box
                        px={1}
                        pb={1}
                        onMouseLeave={() => handleToggleFilter(col.key, false)}
                      >
                        {col.filterType === "boolean" ? (
                          <RadioGroup
                            row
                            value={filters[col.key] ?? ""}
                            onChange={(e) => setFiltersItem(col.key, e.target.value)}
                            onBlur={() => handleToggleFilter(col.key, false)}
                            sx={{ backgroundColor: "white", fontSize: "small" }}
                          >
                            <FormControlLabel
                              control={<Radio />}
                              label="Да"
                              value={1}
                            />
                            <FormControlLabel
                              control={<Radio />}
                              label="Нет"
                              value={0}
                            />
                          </RadioGroup>
                        ) : (
                          <TextField
                            size="small"
                            variant="outlined"
                            sx={{ backgroundColor: "white" }}
                            placeholder="Содержит..."
                            value={filters[col.key] || ""}
                            onChange={(e) => setFiltersItem(col.key, e.target.value)}
                            onBlur={() => handleToggleFilter(col.key, false)}
                            autoFocus
                            fullWidth
                            InputProps={{
                              endAdornment: filters[col.key] && (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => setFiltersItem(col.key, "")}
                                    edge="end"
                                    aria-label="Очистить"
                                  >
                                    <Clear fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      </Box>
                    </ClickAwayListener>
                  </Collapse>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.map((o) => (
              <TableRow
                key={o.id}
                hover
              >
                <TableCell>{dayjs(o.date_time_origin).format("DD.MM.YYYY")}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => openOrder(o.point_id, o.id)}
                  >
                    {o.id}
                  </Button>
                </TableCell>
                <TableCell title={o.is_new ? "Новый клиент" : undefined}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Button
                      disabled={!o.number || o.client_id <= 0}
                      onClick={() => openClient(o.number)}
                    >
                      {o.number || "без номера"}
                    </Button>
                  </Box>
                </TableCell>
                <TableCell>{o.is_new === 1 ? "Новый" : ""}</TableCell>
                <TableCell>{Number(o.order_price).toFixed(2)}</TableCell>
                <TableCell>{o.promo_name}</TableCell>
                <TableCell>{o.type_order}</TableCell>
                <TableCell>{o.point_addr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 30, 50, 100]}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        labelRowsPerPage="Записей на странице:"
        component="div"
        count={total}
        rowsPerPage={perPage}
        page={page - 1}
        onPageChange={(_, newPage) => {
          console.log(`Changing page to ${newPage + 1}`);
          setPage(newPage + 1);
        }}
        onRowsPerPageChange={(event) => {
          const newPerPage = parseInt(event.target.value, 10);
          setPerPage(newPerPage);
          setPage(1);
        }}
      />
    </>
  );
}
export default memo(SiteClientsMarketingOrdersTable);

const ordersTableColumns = [
  { label: "Дата", key: "date_time_origin" },
  { label: "Заказ", key: "id" },
  { label: "Клиент", key: "number", title: "new: новые, -new: не новые" },
  { label: "Новый", key: "is_new", filterType: "boolean" },
  { label: "Сумма", key: "order_price" },
  { label: "Промокод", key: "promo_name" },
  { label: "Тип", key: "type_order" },
  { label: "Кафе", key: "point_addr" },
  // { label: "Статус", key: "status" },
];
