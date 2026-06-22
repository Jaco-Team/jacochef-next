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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { MySelect } from "@/ui/Forms";
import useStaffSchedulePage from "./useStaffSchedulePage";
import { getRowBaseColor, getSummaryCellValue, isEnabled, toArray } from "./staffScheduleHelpers";

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
          minWidth: 220,
          backgroundColor: baseColors.backgroundColor,
          color: baseColors.color,
          fontWeight: 700,
          borderRight: "1px solid #E5E7EB",
        }}
      >
        {data?.user_name || "Без имени"}
      </TableCell>
      <TableCell
        sx={{
          position: "sticky",
          left: 220,
          zIndex: 2,
          minWidth: 190,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #E5E7EB",
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
              minWidth: 52,
              px: 0.5,
              py: 0.75,
              fontSize: 12,
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
          sx={{ minWidth: 92, fontSize: 12.5 }}
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
        }}
      />
      <TableCell
        sx={{
          position: "sticky",
          left: 220,
          zIndex: 1,
          backgroundColor: "#ffffff",
          fontWeight: 600,
        }}
      >
        {label}
      </TableCell>

      {values.map((item, index) => (
        <TableCell
          key={`${label}-${index}`}
          align="center"
          sx={{
            minWidth: 52,
            px: 0.5,
            py: 0.75,
            backgroundColor: highlightCurrent && item?.type === "cur" ? "#CFF4C8" : "#ffffff",
            fontSize: 12,
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
          left: 220,
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

function ScheduleTable({ period, summaryColumns, access }) {
  const days = toArray(period?.meta?.days);
  const rows = toArray(period?.rows);
  const colSpan = 2 + days.length + summaryColumns.length;
  const canShowRolls = isEnabled(access?.rolls_view);
  const canShowPizza = isEnabled(access?.pizza_view);
  const canShowSlowOrders = isEnabled(access?.over_40_min_view);
  const canShowTotals = isEnabled(access?.sums_all_view);

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
          minWidth: 1180,
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
                minWidth: 220,
                backgroundColor: "#F8FAFC",
                fontWeight: 700,
              }}
            >
              Сотрудник
            </TableCell>
            <TableCell
              sx={{
                position: "sticky",
                left: 220,
                zIndex: 3,
                minWidth: 190,
                backgroundColor: "#F8FAFC",
                fontWeight: 700,
              }}
            >
              Должность
            </TableCell>

            {days.map((day, index) => (
              <TableCell
                key={`${day?.date || index}-day-num`}
                align="center"
                sx={{
                  minWidth: 52,
                  backgroundColor:
                    day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                      ? "#FBE7B6"
                      : "#F8FAFC",
                  fontWeight: 700,
                }}
              >
                {day?.date ?? ""}
              </TableCell>
            ))}

            {summaryColumns.map((column) => (
              <TableCell
                key={`head-top-${column.key}`}
                align="center"
                sx={{ minWidth: 92, fontWeight: 700 }}
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
              }}
            />
            <TableCell
              sx={{
                position: "sticky",
                left: 220,
                zIndex: 3,
                backgroundColor: "#F8FAFC",
              }}
            />

            {days.map((day, index) => (
              <TableCell
                key={`${day?.date || index}-weekday`}
                align="center"
                sx={{
                  minWidth: 52,
                  backgroundColor:
                    day?.day === "Пт" || day?.day === "Сб" || day?.day === "Вс"
                      ? "#FBE7B6"
                      : "#F8FAFC",
                  color: "#6B7280",
                  fontSize: 12,
                }}
              >
                {day?.day ?? ""}
              </TableCell>
            ))}

            {summaryColumns.map((column) => (
              <TableCell
                key={`head-bottom-${column.key}`}
                align="center"
                sx={{ minWidth: 92, fontWeight: 700 }}
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
        open={page.isBootstrapping || page.isGraphLoading}
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
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              borderColor: "#E5E7EB",
              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                color: "#ffffff",
                background: "linear-gradient(90deg, #D61F33 0%, #F03D48 100%)",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700 }}
                  >
                    {page.moduleName}
                  </Typography>
                  <Typography sx={{ opacity: 0.9, fontSize: 14 }}>
                    Desktop first. Read-only render on live `staff_schedule` API.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={page.handleReload}
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#D61F33",
                    fontWeight: 700,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#FFF5F5",
                      boxShadow: "none",
                    },
                  }}
                >
                  Обновить
                </Button>
              </Stack>
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid
                container
                spacing={2}
                alignItems="center"
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 3,
                  }}
                >
                  <MySelect
                    is_none={false}
                    data={page.points}
                    value={page.pointId}
                    func={page.handlePointChange}
                    label="Точка"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 3,
                  }}
                >
                  <MySelect
                    is_none={false}
                    data={page.months}
                    value={page.monthId}
                    func={page.handleMonthChange}
                    label="Месяц"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    <Paper
                      variant="outlined"
                      sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 176 }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Источник графика
                          </Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                            {page.dataSource === "staff_schedule"
                              ? "staff_schedule"
                              : "legacy fallback"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 124 }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Ошибки кухни
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{errorSummary.orders}</Typography>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 124 }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Ошибки камер
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{errorSummary.cam}</Typography>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 124 }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Режим
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{page.graphKind || "—"}</Typography>
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 124 }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Дни / строки
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {page.activeDaysCount} / {page.activeRowsCount}
                      </Typography>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Tabs
                value={page.selectedPart}
                onChange={(_, nextValue) => page.setSelectedPart(nextValue)}
                sx={{
                  minHeight: 40,
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: "#D61F33",
                  },
                }}
              >
                {page.periodTabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    label={tab.label}
                    sx={{
                      minHeight: 40,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  />
                ))}
              </Tabs>
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
          />
        </Grid>
      </Grid>
    </Box>
  );
}
