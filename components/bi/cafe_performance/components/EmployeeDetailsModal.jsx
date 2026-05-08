"use client";

import { useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import MyModal from "@/ui/MyModal";
import EmployeeAvatar from "./EmployeeAvatar";
import MetricLabel from "./MetricLabel";
import SlaChip from "./SlaChip";
import useCafePerformanceStore from "../useCafePerformanceStore";
import { getSlaTone } from "./SlaProgressBar";
import { CP_PADDING, CP_RADIUS, CP_SPACE } from "../layout";

const TONE_COLOR = {
  success: "success.dark",
  warning: "warning.dark",
  danger: "error.dark",
  neutral: "text.secondary",
};

const LONG_STAGE_TOOLTIP_TEXT =
  "Длинные — это процент заказов, у которых длительность этапа больше P90 этого этапа * 1.5.";

const getStabilityTone = (value) => {
  if (value == null) return "neutral";
  const numeric = Number(value);
  if (numeric >= 80) return "success";
  if (numeric >= 60) return "warning";
  return "danger";
};

const getTimeResultColor = (factSeconds, targetSeconds) => {
  if (factSeconds == null || targetSeconds == null) return "text.primary";

  const fact = Number(factSeconds);
  const target = Number(targetSeconds);
  if (!Number.isFinite(fact) || !Number.isFinite(target)) return "text.primary";

  return fact <= target ? "success.main" : "error.main";
};

function StageMetricRow({ stage, formatters }) {
  const slaTone = getSlaTone(stage?.sla);
  const stabilityTone = getStabilityTone(stage?.stability);

  return (
    <TableRow hover>
      <TableCell align="left">
        <Typography
          variant="body2"
          sx={{ fontWeight: 600 }}
        >
          {stage?.stage_name || "—"}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          sx={{ fontWeight: 700 }}
        >
          {formatters.duration(stage?.p50)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {formatters.duration(stage?.p90)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <SlaChip
            value={stage?.sla}
            formatter={formatters.percent}
          />
        </Box>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          sx={{ color: TONE_COLOR[stabilityTone], fontWeight: 700 }}
        >
          {formatters.percent(stage?.stability)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          sx={{ color: TONE_COLOR[slaTone], fontWeight: 700 }}
        >
          {formatters.percent(stage?.share_long_stage_percent)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {formatters.integer(stage?.sample_size)}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function EmployeeOrdersTable({ orders, formatters }) {
  if (!orders.length) {
    return (
      <Box
        sx={{
          px: CP_PADDING.card,
          py: CP_PADDING.card,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Нет данных по заказам.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ maxHeight: "40dvh" }}>
      <Table
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableCell>Заказ</TableCell>
            <TableCell>Позиция</TableCell>
            <TableCell>Категория</TableCell>
            <TableCell>Этап</TableCell>
            <TableCell align="center">План</TableCell>
            <TableCell align="center">Факт</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order, index) => {
            const timeColor = getTimeResultColor(order?.fact_seconds, order?.target_seconds);

            return (
              <TableRow
                key={`${order?.order_id || order?.order_number || "order"}-${order?.position_id || index}-${order?.stage_type || index}`}
                hover
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700 }}
                  >
                    {order?.order_number || order?.order_id || "—"}
                  </Typography>
                </TableCell>
                <TableCell>{order?.position_name || "—"}</TableCell>
                <TableCell>{order?.category_name || "—"}</TableCell>
                <TableCell>{order?.stage_name || order?.stage_type || "—"}</TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatters.duration(order?.target_seconds)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    sx={{ color: timeColor, fontWeight: 700 }}
                  >
                    {formatters.duration(order?.fact_seconds)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function EmployeeDetailsModal({
  open,
  onClose,
  loading,
  data,
  formatters,
  periodLabel,
  page,
  perPage,
  onPageChange,
}) {
  const points = useCafePerformanceStore((s) => s.points);
  const employeeName = data?.employee?.employee_name || data?.summary?.employee_name || "Сотрудник";
  const stages = data?.stages || [];
  const orders = data?.orders || [];
  const ordersPagination = data?.orders_pagination || {};
  const totalOrders = ordersPagination.total ?? orders.length;
  const imageUrl = data?.employee?.user_image || "";
  const pointId = data?.employee?.point_id || null;
  const point = useMemo(
    () => points.find((item) => String(item?.id) === String(pointId)) || null,
    [pointId, points],
  );
  const pointName = point?.name || "";
  const pointAddress = point?.address || "";
  const modalTitle = periodLabel ? `${employeeName} за период (${periodLabel})` : employeeName;

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      maxWidth="xl"
    >
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 3,
          backgroundColor: "grey.50",
        }}
      >
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 240 }}
          >
            <CircularProgress size={28} />
          </Stack>
        ) : employeeName ? (
          <Stack spacing={CP_SPACE.group}>
            <Box
              sx={{
                borderRadius: CP_RADIUS.card,
                backgroundColor: "background.paper",
                px: CP_PADDING.panel,
                py: CP_PADDING.panel,
              }}
            >
              <Stack spacing={CP_SPACE.component}>
                <Stack
                  direction="row"
                  spacing={CP_SPACE.component}
                  alignItems="center"
                >
                  <EmployeeAvatar
                    name={employeeName}
                    size={56}
                    src={imageUrl}
                  />
                  <Stack spacing={CP_SPACE.micro}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {employeeName}
                    </Typography>
                    {pointName ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {pointName}
                      </Typography>
                    ) : null}
                    {pointAddress ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {pointAddress}
                      </Typography>
                    ) : null}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Детализация по этапам за выбранный период
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>

            <Stack spacing={CP_SPACE.related}>
              <Box
                sx={{
                  borderRadius: CP_RADIUS.card,
                  backgroundColor: "background.paper",
                  overflow: "hidden",
                }}
              >
                {stages.length ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">Этап</TableCell>
                          <TableCell align="center">P50</TableCell>
                          <TableCell align="center">P90</TableCell>
                          <TableCell align="center">SLA</TableCell>
                          <TableCell align="center">Стабильность</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                              <MetricLabel
                                text="Длинные"
                                tooltipText={LONG_STAGE_TOOLTIP_TEXT}
                                variant="body2"
                                color="inherit"
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">Заказов</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stages.map((stage) => (
                          <StageMetricRow
                            key={`${stage.stage_type}-${stage.employee_id}`}
                            stage={stage}
                            formatters={formatters}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box
                    sx={{
                      px: CP_PADDING.card,
                      py: CP_PADDING.card,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Нет данных по этапам.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>

            <Stack spacing={CP_SPACE.related}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, textAlign: "center" }}
              >
                Заказы сотрудника
              </Typography>
              <Box
                sx={{
                  borderRadius: CP_RADIUS.card,
                  backgroundColor: "background.paper",
                  overflow: "hidden",
                }}
              >
                <EmployeeOrdersTable
                  orders={orders}
                  formatters={formatters}
                />
                {orders.length ? (
                  <TablePagination
                    component="div"
                    count={Number(totalOrders) || orders.length}
                    page={page}
                    rowsPerPage={perPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    labelRowsPerPage="Строк на странице:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} из ${count !== -1 ? count : `больше ${to}`}`
                    }
                    onPageChange={(_, nextPage) => onPageChange(nextPage, perPage)}
                    onRowsPerPageChange={(event) => onPageChange(0, Number(event.target.value))}
                  />
                ) : null}
              </Box>
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 0 }}>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </DialogActions>
    </MyModal>
  );
}
