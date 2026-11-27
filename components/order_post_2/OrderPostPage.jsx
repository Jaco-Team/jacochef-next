"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid, Stack, TablePagination, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoAutocomplete,
  JacoBackdropLoader,
  JacoButton,
  JacoCheckboxField,
  JacoChoiceChips,
  JacoDatePicker,
  JacoSurface,
  uiColors,
  uiTypography,
} from "@/design-system/shared/ui";
import useApi from "@/src/hooks/useApi";
import useMyAlert from "@/src/hooks/useMyAlert";
import OrderPostDetailsModal from "./OrderPostDetailsModal";
import OrderPostRows from "./OrderPostRows";
import {
  ORDER_POST_MODULE,
  buildStatusCounts,
  groupRowsByVendor,
  isPeriodValid,
  toDateParam,
} from "./orderPostUtils";

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100];

const sectionLabelSx = {
  ...uiTypography.label,
  color: uiColors.textMuted,
  fontWeight: 500,
  mb: 1,
};

function OrderPostPage() {
  const { api_laravel } = useApi(ORDER_POST_MODULE);
  const { isAlert, closeAlert, showAlert, alertMessage, alertStatus } = useMyAlert();
  const requestIdRef = useRef(0);

  const [moduleName, setModuleName] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [selectedVendors, setSelectedVendors] = useState([]);

  const [rows, setRows] = useState([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [hideTests, setHideTests] = useState(false);
  const [isGrouped, setIsGrouped] = useState(true);
  const [collapsedKeys, setCollapsedKeys] = useState(() => new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [selectedRow, setSelectedRow] = useState(null);
  const handleCloseDetails = useCallback(() => setSelectedRow(null), []);

  const callApi = useCallback(
    async (method, data = {}) => {
      try {
        const response = await api_laravel(method, data);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка запроса");
        }

        return response;
      } catch (error) {
        showAlert(error?.message || "Ошибка запроса", false);
        return null;
      }
    },
    // showAlert is recreated on every render and is only used on errors
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api_laravel],
  );

  const loadData = useCallback(
    async (start, end, vendorList) => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);

      const response = await callApi("get_data", {
        date_start: start,
        date_end: end,
        vendor_ids: vendorList.map((vendor) => vendor.id),
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setIsLoading(false);

      if (!response) {
        return;
      }

      setRows(Array.isArray(response.rows) ? response.rows : []);
      setHasLoadedData(true);
      setCollapsedKeys(new Set());
      setPage(0);
    },
    [callApi],
  );

  useEffect(() => {
    let isMounted = true;

    const loadBootstrap = async () => {
      setIsLoading(true);
      const response = await callApi("get_all");

      if (!isMounted) {
        return;
      }

      if (!response) {
        setIsLoading(false);
        return;
      }

      const name = response.module_info?.name || "Рассылка заявок поставщикам";
      const start = response.date_start || "";
      const end = response.date_end || start;

      setModuleName(name);
      document.title = name;
      setStatuses(Array.isArray(response.statuses) ? response.statuses : []);
      setKinds(Array.isArray(response.kinds) ? response.kinds : []);
      setVendors(Array.isArray(response.vendors) ? response.vendors : []);
      setDateStart(start);
      setDateEnd(end);
      setIsBootstrapped(true);

      if (isPeriodValid(start, end)) {
        await loadData(start, end, []);
      } else {
        setIsLoading(false);
      }
    };

    loadBootstrap();

    return () => {
      isMounted = false;
    };
    // Bootstrap runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = isBootstrapped && isPeriodValid(dateStart, dateEnd);

  const handleSubmit = () => {
    if (canSubmit) {
      loadData(dateStart, dateEnd, selectedVendors);
    }
  };

  const handleDateStartChange = (value) => {
    const next = toDateParam(value);
    setDateStart(next);

    if (next && dateEnd && dateEnd < next) {
      setDateEnd(next);
    }
  };

  const handleDateEndChange = (value) => {
    setDateEnd(toDateParam(value));
  };

  // Kind / test filters narrow the data first; status counters reflect that narrowing.
  const scopedRows = useMemo(
    () =>
      rows.filter((row) => {
        if (hideTests && row.is_test) {
          return false;
        }

        return !kindFilter || row.kind === kindFilter;
      }),
    [rows, hideTests, kindFilter],
  );

  const statusCounts = useMemo(
    () => buildStatusCounts(scopedRows, statuses),
    [scopedRows, statuses],
  );

  const visibleRows = useMemo(
    () =>
      statusFilter === ""
        ? scopedRows
        : scopedRows.filter((row) => String(row.status) === statusFilter),
    [scopedRows, statusFilter],
  );

  const groups = useMemo(
    () => (isGrouped ? groupRowsByVendor(visibleRows) : null),
    [isGrouped, visibleRows],
  );

  const pagedRows = useMemo(
    () => visibleRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [visibleRows, page, rowsPerPage],
  );

  const statusOptions = useMemo(
    () => [
      { id: "", name: `Все · ${scopedRows.length}` },
      ...statusCounts.map((status) => ({
        id: String(status.id),
        name: `${status.name} · ${status.count}`,
      })),
    ],
    [scopedRows.length, statusCounts],
  );

  const kindOptions = useMemo(
    () => [
      { id: "", name: "Все типы" },
      ...kinds.map((kind) => ({ id: kind.id, name: kind.name })),
    ],
    [kinds],
  );

  const toggleGroup = useCallback((key) => {
    setCollapsedKeys((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }, []);

  const toggleAllGroups = () => {
    const allKeys = (groups ?? []).map((group) => group.key);
    const isAllCollapsed = allKeys.length > 0 && allKeys.every((key) => collapsedKeys.has(key));
    setCollapsedKeys(isAllCollapsed ? new Set() : new Set(allKeys));
  };

  const isAllCollapsed =
    Boolean(groups?.length) && groups.every((group) => collapsedKeys.has(group.key));

  return (
    <>
      <JacoBackdropLoader open={isLoading} />
      <JacoAlert
        isOpen={isAlert}
        status={alertStatus}
        text={alertMessage}
        onClose={closeAlert}
      />
      <OrderPostDetailsModal
        row={selectedRow}
        onClose={handleCloseDetails}
      />

      <Grid
        container
        spacing={2}
        className="container_first_child"
      >
        <Grid
          size={12}
          sx={{ mb: 1 }}
        >
          <h1>{moduleName}</h1>
        </Grid>

        <Grid
          size={12}
          sx={{ height: "max-content" }}
        >
          <JacoSurface sx={{ p: 2 }}>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <JacoDatePicker
                  label="Дата с"
                  value={dateStart || null}
                  onChange={handleDateStartChange}
                  maxDate={dateEnd || undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <JacoDatePicker
                  label="Дата по"
                  value={dateEnd || null}
                  onChange={handleDateEndChange}
                  minDate={dateStart || undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <JacoAutocomplete
                  multiple
                  disableCloseOnSelect
                  limitTags={2}
                  label="Поставщики (пусто — все)"
                  options={vendors}
                  value={selectedVendors}
                  onChange={(event, value) => setSelectedVendors(Array.isArray(value) ? value : [])}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <JacoButton
                  fullWidth
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  Показать
                </JacoButton>
              </Grid>
            </Grid>
          </JacoSurface>
        </Grid>

        {hasLoadedData ? (
          <Grid
            size={12}
            sx={{ height: "max-content" }}
          >
            <JacoSurface sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={sectionLabelSx}>Статус</Typography>
                  <JacoChoiceChips
                    ariaLabel="Фильтр по статусу"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(id) => {
                      setStatusFilter(id);
                      setPage(0);
                    }}
                  />
                </Box>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
                >
                  <Box>
                    <Typography sx={sectionLabelSx}>Тип письма</Typography>
                    <JacoChoiceChips
                      ariaLabel="Фильтр по типу письма"
                      options={kindOptions}
                      value={kindFilter}
                      onChange={(id) => {
                        setKindFilter(id);
                        setPage(0);
                      }}
                    />
                  </Box>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 1, sm: 3 }}
                    sx={{ alignItems: { sm: "center" } }}
                  >
                    <JacoCheckboxField
                      label="Скрыть тестовые"
                      checked={hideTests}
                      onChange={(event) => {
                        setHideTests(event.target.checked);
                        setPage(0);
                      }}
                    />
                    <JacoCheckboxField
                      label="Группировать по поставщику"
                      checked={isGrouped}
                      onChange={(event) => setIsGrouped(event.target.checked)}
                    />
                    {isGrouped ? (
                      <JacoButton
                        tone="secondary"
                        compact
                        onClick={toggleAllGroups}
                        disabled={!groups?.length}
                      >
                        {isAllCollapsed ? "Развернуть все" : "Свернуть все"}
                      </JacoButton>
                    ) : null}
                  </Stack>
                </Stack>
              </Stack>
            </JacoSurface>
          </Grid>
        ) : null}

        {hasLoadedData ? (
          <Grid
            size={12}
            sx={{ height: "max-content" }}
          >
            <JacoSurface sx={{ overflow: "hidden" }}>
              <OrderPostRows
                rows={isGrouped ? visibleRows : pagedRows}
                groups={groups}
                statuses={statuses}
                collapsedKeys={collapsedKeys}
                onToggleGroup={toggleGroup}
                onSelectRow={setSelectedRow}
              />
              {isGrouped ? null : (
                <TablePagination
                  component="div"
                  count={visibleRows.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                  labelRowsPerPage="Строк на странице"
                  labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
                  onPageChange={(event, nextPage) => setPage(nextPage)}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(Number(event.target.value));
                    setPage(0);
                  }}
                />
              )}
            </JacoSurface>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}

export default OrderPostPage;
