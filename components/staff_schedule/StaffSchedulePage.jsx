import { useMemo } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MySelect } from "@/ui/Forms";
import useStaffSchedulePage from "./useStaffSchedulePage";
import { getRowBaseColor, getSummaryCellValue, isEnabled, toArray } from "./staffScheduleHelpers";

const EMPLOYEE_COLUMN_WIDTH = 170;
const POSITION_COLUMN_WIDTH = 150;
const DAY_COLUMN_WIDTH = 42;
const SUMMARY_COLUMN_WIDTH = 76;

function ScheduleRow({ row, summaryColumns }) {
  const data = row?.data ?? {};
  const baseColors = getRowBaseColor(data?.type, Boolean(row?.color));

  return (
    <TableRow hover>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 2,
          minWidth: EMPLOYEE_COLUMN_WIDTH,
          backgroundColor: baseColors.backgroundColor,
          color: baseColors.color,
          fontWeight: 700,
          borderRight: "1px solid #E5E7EB",
          py: 1,
          px: 2,
        }}
      >
        {data?.user_name || "Без имени"}
      </TableCell>
      <TableCell
        sx={{
          position: "sticky",
          left: EMPLOYEE_COLUMN_WIDTH,
          zIndex: 2,
          minWidth: POSITION_COLUMN_WIDTH,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #E5E7EB",
          py: 1,
          px: 2,
        }}
      >
        {data?.app_name || "—"}
      </TableCell>

      {toArray(data?.dates).map((day, index) => {
        const info = day?.info ?? {};
        const isHoliday = Boolean(data?.holydays?.[day?.date]);
        const backgroundColor = row?.color ? "#D3D3D3" : info?.color || "#ffffff";
        const textColor = row?.color ? "#000000" : info?.colorT || "#111827";

        return (
          <TableCell
            key={`${day?.date || index}-${data?.id || data?.user_name || index}`}
            align="center"
            sx={{
              minWidth: DAY_COLUMN_WIDTH,
              px: 0.25,
              py: 0.5,
              fontSize: 11,
              fontWeight: 600,
              background: isHoliday
                ? `repeating-linear-gradient(-45deg, ${backgroundColor}, ${backgroundColor} 8px, rgba(255, 0, 0, 0.2) 8px, rgba(255, 0, 0, 0.2) 12px)`
                : backgroundColor,
              color: textColor,
            }}
          >
            {info?.hours || ""}
          </TableCell>
        );
      })}

      {summaryColumns.map((column) => (
        <TableCell
          key={`${data?.id || data?.user_name}-${column.key}`}
          align="center"
          sx={{ minWidth: SUMMARY_COLUMN_WIDTH, fontSize: 11.5, px: 0.75 }}
        >
          {getSummaryCellValue(column, data)}
        </TableCell>
      ))}
    </TableRow>
  );
}

function ShiftHeaderRow({ label, colSpan }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{
          backgroundColor: "#E5E7EB",
          fontWeight: 700,
          color: "#111827",
          py: 1.25,
        }}
      >
        {label || "Смена"}
      </TableCell>
    </TableRow>
  );
}

function FooterMetricRow({ label, values, summaryColumns, highlightCurrent = false, getValue }) {
  return (
    <TableRow>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 600,
          py: 0.75,
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: EMPLOYEE_COLUMN_WIDTH,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 600,
          py: 0.75,
        }}
      >
        {label}
      </TableCell>

      {values.map((item, index) => (
        <TableCell
          key={`${label}-${index}`}
          align="center"
          sx={{
            minWidth: DAY_COLUMN_WIDTH,
            px: 0.25,
            py: 0.5,
            backgroundColor: highlightCurrent && item?.type === "cur" ? "#CFF4C8" : "#ffffff",
            fontSize: 11,
          }}
        >
          {getValue
            ? getValue(item)
            : (item?.res ?? item?.count_rolls ?? item?.count_pizza ?? item?.count_false ?? "")}
        </TableCell>
      ))}

      {summaryColumns.map((column) => (
        <TableCell
          key={`${label}-${column.key}`}
          align="center"
        />
      ))}
    </TableRow>
  );
}

function SummaryTotalsRow({ values, summaryColumns }) {
  const keyMap = {
    dop_bonus: "sum_dop_bonus_price",
    h_price: "sum_h_price",
    err_price: "sum_err_price",
    my_bonus: "sum_bonus_price",
    total_sum: "sum_to_given_price",
    given: "sum_given_price",
  };

  return (
    <TableRow>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 1,
          backgroundColor: "#ffffff",
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: EMPLOYEE_COLUMN_WIDTH,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 700,
        }}
      >
        Итоги
      </TableCell>

      <TableCell colSpan={values.length} />

      {summaryColumns.map((column) => (
        <TableCell
          key={`summary-${column.key}`}
          align="center"
          sx={{ fontWeight: 700 }}
        >
          {values?.[keyMap[column.key]] ?? ""}
        </TableCell>
      ))}
    </TableRow>
  );
}

function ScheduleTable({ period, summaryColumns, access, loading = false }) {
  const days = toArray(period?.meta?.days);
  const rows = toArray(period?.rows);
  const colSpan = 2 + days.length + summaryColumns.length;
  const canShowRolls = isEnabled(access?.rolls_view);
  const canShowPizza = isEnabled(access?.pizza_view);
  const canShowSlowOrders = isEnabled(access?.over_40_min_view);
  const canShowTotals = isEnabled(access?.sums_all_view);

  if (loading && !days.length && !rows.length) {
    return (
      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 5, textAlign: "center", color: "text.secondary" }}
      >
        <CircularProgress
          size={28}
          sx={{ mb: 1.5 }}
        />
        <Typography sx={{ fontSize: 14 }}>Загрузка графика...</Typography>
      </Paper>
    );
  }

  if (!days.length && !rows.length) {
    return (
      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: 4, textAlign: "center", color: "text.secondary" }}
      >
        Нет данных за выбранный период
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflowX: "auto",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: 980,
          "& .MuiTableCell-root": {
            borderColor: "#E5E7EB",
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 3,
                minWidth: EMPLOYEE_COLUMN_WIDTH,
                backgroundColor: "#F8FAFC",
                fontWeight: 700,
                py: 1,
                px: 2,
              }}
            >
              Сотрудник
            </TableCell>
            <TableCell
              sx={{
                position: "sticky",
                left: EMPLOYEE_COLUMN_WIDTH,
                zIndex: 3,
                minWidth: POSITION_COLUMN_WIDTH,
                backgroundColor: "#F8FAFC",
                fontWeight: 700,
                py: 1,
                px: 2,
              }}
            >
              Должность
            </TableCell>

            {days.map((day, index) => (
              <TableCell
                key={`${day?.date || index}-day-num`}
                align="center"
                sx={{
                  minWidth: DAY_COLUMN_WIDTH,
                  backgroundColor:
                    day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                      ? "#FBE7B6"
                      : "#F8FAFC",
                  fontWeight: 700,
                  py: 1,
                  px: 0.25,
                }}
              >
                {day?.date ?? ""}
              </TableCell>
            ))}

            {summaryColumns.map((column) => (
              <TableCell
                key={`head-top-${column.key}`}
                align="center"
                sx={{ minWidth: SUMMARY_COLUMN_WIDTH, fontWeight: 700, px: 0.5 }}
              />
            ))}
          </TableRow>

          <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 3,
                backgroundColor: "#F8FAFC",
                py: 0.75,
              }}
            />
            <TableCell
              sx={{
                position: "sticky",
                left: EMPLOYEE_COLUMN_WIDTH,
                zIndex: 3,
                backgroundColor: "#F8FAFC",
                py: 0.75,
              }}
            />

            {days.map((day, index) => (
              <TableCell
                key={`${day?.date || index}-weekday`}
                align="center"
                sx={{
                  minWidth: DAY_COLUMN_WIDTH,
                  backgroundColor:
                    day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                      ? "#FBE7B6"
                      : "#F8FAFC",
                  color: "#6B7280",
                  fontSize: 11,
                  px: 0.25,
                  py: 0.75,
                }}
              >
                {day?.day ?? ""}
              </TableCell>
            ))}

            {summaryColumns.map((column) => (
              <TableCell
                key={`head-bottom-${column.key}`}
                align="center"
                sx={{ minWidth: SUMMARY_COLUMN_WIDTH, fontWeight: 700, fontSize: 11, px: 0.5 }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) =>
            row?.row === "header" ? (
              <ShiftHeaderRow
                key={`shift-${index}`}
                label={row?.data}
                colSpan={colSpan}
              />
            ) : (
              <ScheduleRow
                key={`row-${row?.data?.id || row?.data?.smena_id || row?.data?.user_name || "x"}-${index}`}
                row={row}
                summaryColumns={summaryColumns}
              />
            ),
          )}

          {toArray(period?.meta?.bonus).length ? (
            <FooterMetricRow
              label="Бонус дня"
              values={toArray(period?.meta?.bonus)}
              summaryColumns={summaryColumns}
              highlightCurrent
              getValue={(item) => item?.res ?? ""}
            />
          ) : null}

          {canShowTotals ? (
            <SummaryTotalsRow
              values={period?.meta?.other_summ ?? {}}
              summaryColumns={summaryColumns}
            />
          ) : null}

          {canShowRolls ? (
            <FooterMetricRow
              label="Роллов"
              values={toArray(period?.meta?.bonus)}
              summaryColumns={summaryColumns}
              getValue={(item) => item?.count_rolls ?? ""}
            />
          ) : null}

          {canShowPizza ? (
            <FooterMetricRow
              label="Пиццы"
              values={toArray(period?.meta?.bonus)}
              summaryColumns={summaryColumns}
              getValue={(item) => item?.count_pizza ?? ""}
            />
          ) : null}

          {canShowSlowOrders ? (
            <FooterMetricRow
              label="Заказы больше 40 мин"
              values={toArray(period?.meta?.order_stat)}
              summaryColumns={summaryColumns}
              getValue={(item) => item?.count_false ?? ""}
            />
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function StaffSchedulePage() {
  const page = useStaffSchedulePage();

  const errorSummary = useMemo(() => {
    const activeErrors = page.activePeriod?.errors ?? { orders: [], cam: [] };
    return {
      orders: toArray(activeErrors.orders).length,
      cam: toArray(activeErrors.cam).length,
    };
  }, [page.activePeriod]);

  return (
    <Box sx={{ pb: 4 }}>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={page.isBootstrapping}
      >
        <CircularProgress />
      </Backdrop>

      <Grid
        container
        spacing={2.5}
        className="container_first_child"
      >
        <Grid size={12}>
          <Paper
            variant="outlined"
            sx={{ borderRadius: "8px", overflow: "hidden" }}
          >
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", md: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  flexDirection: { xs: "column", md: "row" },
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ fontWeight: 700, fontSize: { xs: 24, md: 28 } }}
                >
                  {page.moduleName}
                </Typography>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={page.handleReload}
                  disabled={page.isGraphLoading}
                  sx={{
                    minHeight: 36,
                    px: 2,
                    borderRadius: "8px",
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Обновить
                </Button>
              </Box>

              <Tabs
                value={page.selectedPart}
                onChange={(_, nextValue) => page.setSelectedPart(nextValue)}
                sx={{
                  minHeight: 36,
                  mb: 2,
                  borderBottom: "1px solid #E5E7EB",
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#df1f26",
                  },
                  "& .MuiTab-root": {
                    minHeight: 36,
                    minWidth: 0,
                    px: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: 13,
                  },
                }}
              >
                {page.periodTabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    label={tab.label}
                  />
                ))}
              </Tabs>

              <Grid
                container
                spacing={2}
                alignItems="center"
              >
                <Grid size={{ xs: 12, md: 3 }}>
                  <MySelect
                    is_none={false}
                    data={page.points}
                    value={page.pointId}
                    func={page.handlePointChange}
                    label="Точка"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <MySelect
                    is_none={false}
                    data={page.months}
                    value={page.monthId}
                    func={page.handleMonthChange}
                    label="Месяц"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 0.25, md: 1.5 }}
                    justifyContent="flex-end"
                    alignItems={{ xs: "flex-start", md: "center" }}
                  >
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Режим:{" "}
                      <Box
                        component="span"
                        sx={{ color: "text.primary", fontWeight: 700 }}
                      >
                        {page.graphKind || "—"}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Ошибки кухни:{" "}
                      <Box
                        component="span"
                        sx={{ color: "text.primary", fontWeight: 700 }}
                      >
                        {errorSummary.orders}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Ошибки камер:{" "}
                      <Box
                        component="span"
                        sx={{ color: "text.primary", fontWeight: 700 }}
                      >
                        {errorSummary.cam}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Дни / строки:{" "}
                      <Box
                        component="span"
                        sx={{ color: "text.primary", fontWeight: 700 }}
                      >
                        {page.activeDaysCount} / {page.activeRowsCount}
                      </Box>
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {page.error ? (
          <Grid size={12}>
            <Alert severity="error">{page.error}</Alert>
          </Grid>
        ) : null}

        <Grid size={12}>
          <ScheduleTable
            period={page.activePeriod}
            summaryColumns={page.summaryColumns}
            access={page.access}
            loading={page.isGraphLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
