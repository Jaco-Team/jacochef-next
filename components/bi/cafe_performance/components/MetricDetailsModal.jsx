"use client";

import { useMemo, useState } from "react";
import {
  Box,
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
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MyModal from "@/ui/MyModal";
import EmptyState from "./EmptyState";
import { CP_SPACE } from "../layout";

const getOrderNumber = (row) => row?.order_number || row?.order_id || row?.id || "—";
const getPointName = (row) => row?.point_name || row?.point?.name || row?.point?.point_name || "—";
const getMetricStageName = (item) =>
  item?.metric_stage_name || item?.metric_stage || item?.metric_stage_type || "—";
const getStatusLabel = (value) => (value ? "Да" : "Нет");
const getItemName = (item) => item?.item_name || item?.position_name || item?.name || "—";

const formatSigned = (value, fractionDigits = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";

  const abs = Math.abs(numeric);
  const fixed = abs
    .toFixed(fractionDigits)
    .replace(/\.0$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");

  if (numeric > 0) return `+${fixed}`;
  if (numeric < 0) return `-${fixed}`;
  return fixed;
};

const getMetricRawValue = (source, metricId) =>
  source?.metric_value ??
  source?.value ??
  source?.[metricId] ??
  source?.summary_value ??
  source?.result ??
  null;

const getMetricDiffValue = (source, metricId) =>
  source?.metric_diff ??
  source?.value_diff ??
  source?.diff ??
  source?.change ??
  source?.delta ??
  source?.[`${metricId}_diff`] ??
  null;

const getDerivedOrderMetricValue = (row, metricId) => {
  const items = row?.items || row?.positions || [];

  if (metricId === "sla_position") {
    const total = Number(row?.items_count ?? items.length);
    const violations = Number(row?.violations_count);
    if (Number.isFinite(total) && total > 0 && Number.isFinite(violations)) {
      return ((total - violations) / total) * 100;
    }
  }

  if (metricId === "p50_position") {
    const values = items
      .map((item) => Number(item?.fact_seconds))
      .filter((value) => Number.isFinite(value))
      .sort((left, right) => left - right);
    if (!values.length) return null;
    return values[Math.floor(values.length / 2)];
  }

  if (metricId === "sla_order") {
    return row?.fact_seconds ?? null;
  }

  if (metricId === "complaints_per_100_orders") {
    return row?.complaints_count ?? row?.complaints?.length ?? null;
  }

  return null;
};

const formatMetricValue = ({ value, metricId, formatters, fallback }) => {
  if (fallback) return fallback;
  if (value == null) return "—";

  if (metricId === "p50_position") return formatters.duration(value);
  if (metricId === "sla_order") return formatters.duration(value);
  if (metricId === "sla_position" || metricId === "sla_order") return formatters.percent(value);
  return formatters.number(value);
};

const getValueColor = ({ value, metricId, targetSeconds }) => {
  if (metricId === "p50_position") return "text.primary";
  if (metricId === "complaints_per_100_orders") return "warning.dark";

  if (metricId === "sla_order" && targetSeconds != null) {
    return getTimeResultColor(value, targetSeconds);
  }

  if (value == null) return "text.primary";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "text.primary";
  if (numeric >= 95) return "success.main";
  if (numeric >= 85) return "warning.dark";
  return "error.main";
};

const getDeltaTone = (delta, metricId) => {
  const numeric = Number(delta);
  if (!Number.isFinite(numeric) || numeric === 0) return "text.secondary";
  const inverse = metricId === "p50_position" || metricId === "complaints_per_100_orders";
  const improving = inverse ? numeric < 0 : numeric > 0;
  return improving ? "success.main" : "error.main";
};

function MetricValueHeader({
  label,
  value,
  formattedValue,
  delta,
  formattedDelta,
  metricId,
  formatters,
  targetSeconds,
  emptyText,
}) {
  const hasValue = value != null || formattedValue;
  if (!hasValue) {
    if (!emptyText) return null;
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {emptyText}
      </Typography>
    );
  }

  const deltaLabel =
    formattedDelta ||
    (delta == null
      ? ""
      : `${formatSigned(delta)}${metricId === "sla_position" || metricId === "sla_order" ? "%" : ""}`);

  return (
    <Stack spacing={CP_SPACE.micro}>
      {label ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
      ) : null}
      <Stack
        direction="row"
        spacing={CP_SPACE.related}
        alignItems="baseline"
        flexWrap="wrap"
      >
        <Typography
          variant="h4"
          sx={{
            color: getValueColor({ value, metricId, targetSeconds }),
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          {formatMetricValue({ value, metricId, formatters, fallback: formattedValue })}
        </Typography>
        {deltaLabel ? (
          <Typography
            variant="h6"
            sx={{
              color: getDeltaTone(delta, metricId),
              fontWeight: 700,
            }}
          >
            ({deltaLabel})
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}

const getTimeResultColor = (factSeconds, targetSeconds) => {
  if (factSeconds == null || targetSeconds == null) return "text.primary";

  const fact = Number(factSeconds);
  const target = Number(targetSeconds);
  if (!Number.isFinite(fact) || !Number.isFinite(target)) return "text.primary";

  return fact <= target ? "success.main" : "error.main";
};

const getOverdueColor = (overdueSeconds, theme) => {
  const overdue = Number(overdueSeconds);

  if (!Number.isFinite(overdue)) return theme.palette.text.primary;

  return overdue > 0 ? theme.palette.error.main : theme.palette.success.main;
};

const getCalculatedOverdueSeconds = (source) => {
  const fact = Number(source?.fact_seconds);
  const target = Number(source?.target_seconds);

  if (Number.isFinite(fact) && Number.isFinite(target)) return fact - target;

  return source?.overdue_seconds ?? null;
};

const formatOverdueDuration = (overdueSeconds, formatters) => {
  if (overdueSeconds == null) return "—";

  const overdue = Number(overdueSeconds);
  if (!Number.isFinite(overdue)) return "—";
  if (overdue === 0) return formatters.duration(0);

  const prefix = overdue < 0 ? "-" : "";
  return `${prefix}${formatters.duration(Math.abs(overdue))}`;
};

function PreorderBadge({ show }) {
  if (!show) return null;

  return (
    <Box
      component="span"
      title="Предзаказ"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: "50%",
        backgroundColor: "warning.50",
        color: "warning.dark",
        flexShrink: 0,
      }}
    >
      <AccessTimeRoundedIcon sx={{ fontSize: 13 }} />
    </Box>
  );
}

function OrderNumberButton({ row, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        p: 0,
        border: 0,
        background: "transparent",
        color: "primary.main",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: CP_SPACE.micro,
        font: "inherit",
        fontWeight: 700,
        textAlign: "left",
      }}
    >
      <Box component="span">{getOrderNumber(row)}</Box>
      <PreorderBadge show={row?.is_preorder} />
    </Box>
  );
}

function OrderPositionsModal({ open, row, metricId, formatters, periodLabel, onClose }) {
  const items = row?.items || row?.positions || [];
  const orderValue = getMetricRawValue(row, metricId) ?? getDerivedOrderMetricValue(row, metricId);
  const orderDelta = getMetricDiffValue(row, metricId);
  const title = periodLabel
    ? `Заказ ${getOrderNumber(row)} за период (${periodLabel})`
    : `Заказ ${getOrderNumber(row)}`;

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="lg"
    >
      <DialogContent>
        <Stack spacing={CP_SPACE.group}>
          <MetricValueHeader
            label="Значение по заказу"
            value={orderValue}
            delta={orderDelta}
            metricId={metricId}
            formatters={formatters}
            targetSeconds={row?.target_seconds}
            emptyText="API не передал значение метрики по заказу."
          />
          {items.length ? (
            <TableContainer sx={{ maxHeight: "52dvh" }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Позиция</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Этап</TableCell>
                    <TableCell align="center">План</TableCell>
                    <TableCell align="center">Факт</TableCell>
                    <TableCell align="center">Просрочка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow
                      key={`${item?.row_id || item?.item_id || "item"}-${index}`}
                      hover
                    >
                      <TableCell>{getItemName(item)}</TableCell>
                      <TableCell>{item?.category_name || "—"}</TableCell>
                      <TableCell>{getMetricStageName(item)}</TableCell>
                      <TableCell align="center">
                        {formatters.duration(item?.target_seconds)}
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            color: getTimeResultColor(item?.fact_seconds, item?.target_seconds),
                            fontWeight: 700,
                          }}
                        >
                          {formatters.duration(item?.fact_seconds)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            color: (theme) =>
                              getOverdueColor(getCalculatedOverdueSeconds(item), theme),
                            fontWeight: 700,
                          }}
                        >
                          {formatOverdueDuration(getCalculatedOverdueSeconds(item), formatters)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState />
          )}
        </Stack>
      </DialogContent>
      <DialogActions />
    </MyModal>
  );
}

function PositionsTable({ rows, metricId, formatters, periodLabel, onOrderOpen }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const flatRows = useMemo(
    () =>
      rows.flatMap((row, rowIndex) => {
        const items = row?.items || row?.positions || [];

        if (!items.length) {
          return [
            {
              row,
              item: row,
              key: `${row?.order_id || rowIndex}-row`,
            },
          ];
        }

        return items.map((item, itemIndex) => ({
          row,
          item,
          key: `${row?.order_id || rowIndex}-${item?.row_id || item?.item_id || itemIndex}`,
        }));
      }),
    [rows],
  );

  if (!flatRows.length) return <EmptyState />;

  return (
    <>
      <TableContainer sx={{ maxHeight: "58dvh" }}>
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
              <TableCell align="center">Просрочка</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flatRows.map(({ row, item, key }) => (
              <TableRow
                key={key}
                hover
              >
                <TableCell>
                  <OrderNumberButton
                    row={row}
                    onClick={() => onOrderOpen?.(row) || setActiveOrder(row)}
                  />
                </TableCell>
                <TableCell>{getItemName(item)}</TableCell>
                <TableCell>{item?.category_name || "—"}</TableCell>
                <TableCell>{getMetricStageName(item)}</TableCell>
                <TableCell align="center">{formatters.duration(item?.target_seconds)}</TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    sx={{
                      color: getTimeResultColor(item?.fact_seconds, item?.target_seconds),
                      fontWeight: 700,
                    }}
                  >
                    {formatters.duration(item?.fact_seconds)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    sx={{
                      color: (theme) => getOverdueColor(getCalculatedOverdueSeconds(item), theme),
                      fontWeight: 700,
                    }}
                  >
                    {formatOverdueDuration(getCalculatedOverdueSeconds(item), formatters)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <OrderPositionsModal
        open={Boolean(activeOrder)}
        row={activeOrder}
        metricId={metricId}
        formatters={formatters}
        periodLabel={periodLabel}
        onClose={() => setActiveOrder(null)}
      />
    </>
  );
}

function OrdersTable({ rows, formatters, onOrderOpen }) {
  if (!rows.length) return <EmptyState />;

  return (
    <TableContainer sx={{ maxHeight: "58dvh" }}>
      <Table
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableCell>Заказ</TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>Кафе</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell align="center">План</TableCell>
            <TableCell align="center">Факт</TableCell>
            <TableCell align="center">Просрочка</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row?.order_id || row?.id || "order"}-${index}`}
              hover
            >
              <TableCell>
                <OrderNumberButton
                  row={row}
                  onClick={() => onOrderOpen?.(row)}
                />
              </TableCell>
              <TableCell>{row?.order_date || "—"}</TableCell>
              <TableCell>{getPointName(row)}</TableCell>
              <TableCell>{row?.order_type_name || row?.order_type || "—"}</TableCell>
              <TableCell align="center">{formatters.duration(row?.target_seconds)}</TableCell>
              <TableCell align="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: getTimeResultColor(row?.fact_seconds, row?.target_seconds),
                    fontWeight: 700,
                  }}
                >
                  {formatters.duration(row?.fact_seconds)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: (theme) => getOverdueColor(getCalculatedOverdueSeconds(row), theme),
                    fontWeight: 700,
                  }}
                >
                  {formatOverdueDuration(getCalculatedOverdueSeconds(row), formatters)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ComplaintsTable({ rows, onOrderOpen }) {
  if (!rows.length) return <EmptyState />;

  return (
    <TableContainer sx={{ maxHeight: "58dvh" }}>
      <Table
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableCell>Заказ</TableCell>
            <TableCell>Причина</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell align="center">Закрыта</TableCell>
            <TableCell align="center">Переделка</TableCell>
            <TableCell>Позиции</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) =>
            (row?.complaints || []).map((complaint, complaintIndex) => (
              <TableRow
                key={`${row?.order_id || rowIndex}-${complaint?.error_id || complaintIndex}`}
                hover
              >
                {complaintIndex === 0 ? (
                  <TableCell rowSpan={row.complaints.length || 1}>
                    <OrderNumberButton
                      row={row}
                      onClick={() => onOrderOpen?.(row)}
                    />
                  </TableCell>
                ) : null}
                <TableCell>{complaint?.reason_text || "—"}</TableCell>
                <TableCell>{complaint?.status || "—"}</TableCell>
                <TableCell align="center">{getStatusLabel(complaint?.is_closed)}</TableCell>
                <TableCell align="center">
                  {complaint?.has_remake_order ? complaint?.new_order_id || "Да" : "Нет"}
                </TableCell>
                <TableCell>
                  {(complaint?.items || [])
                    .map((item) => item?.item_name || item?.name || item?.position_name)
                    .filter(Boolean)
                    .join(", ") || "—"}
                </TableCell>
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function MetricDetailsTable({ metricId, detailType, rows, formatters, periodLabel, onOrderOpen }) {
  if (metricId === "sla_order" || detailType === "sla_order" || detailType === "order") {
    return (
      <OrdersTable
        rows={rows}
        formatters={formatters}
        onOrderOpen={onOrderOpen}
      />
    );
  }

  if (
    metricId === "complaints_per_100_orders" ||
    detailType === "complaints" ||
    detailType === "complaint_orders"
  ) {
    return (
      <ComplaintsTable
        rows={rows}
        onOrderOpen={onOrderOpen}
      />
    );
  }

  return (
    <PositionsTable
      rows={rows}
      metricId={metricId}
      formatters={formatters}
      periodLabel={periodLabel}
      onOrderOpen={onOrderOpen}
    />
  );
}

export default function MetricDetailsModal({
  open,
  onClose,
  loading,
  data,
  selectedMetric,
  sourceMetric,
  formatters,
  periodLabel,
  page,
  perPage,
  onPageChange,
  onOrderOpen,
  paginationRowsLabel,
}) {
  const rows = data?.rows || [];
  const pagination = data?.pagination || {};
  const metric = data?.metric || data?.order_type || {};
  const detailType = metric?.detail_type || "";
  const totalRows = pagination.total ?? rows.length;
  const metricId = metric?.id || sourceMetric?.id || selectedMetric || detailType || "";
  const metricValue = getMetricRawValue(metric, metricId);
  const metricDelta = getMetricDiffValue(metric, metricId);
  const baseTitle =
    metricId === "sla_position"
      ? "SLA позиций"
      : metric?.label || metric?.order_type_name || "Детализация метрики";
  const title = periodLabel ? `${baseTitle} за период (${periodLabel})` : baseTitle;

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="xl"
    >
      <DialogContent>
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 240 }}
          >
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Stack spacing={CP_SPACE.group}>
            <MetricValueHeader
              value={metricValue}
              formattedValue={sourceMetric?.value}
              delta={metricDelta}
              formattedDelta={sourceMetric?.card?.delta?.label}
              metricId={metricId}
              formatters={formatters}
            />

            <Box>
              <MetricDetailsTable
                metricId={metricId}
                detailType={detailType}
                rows={rows}
                formatters={formatters}
                periodLabel={periodLabel}
                onOrderOpen={onOrderOpen}
              />
              {rows.length ? (
                <TablePagination
                  component="div"
                  count={Number(totalRows) || rows.length}
                  page={page}
                  rowsPerPage={perPage}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  labelRowsPerPage={paginationRowsLabel || "Строк на странице:"}
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} из ${count !== -1 ? count : `больше ${to}`}`
                  }
                  onPageChange={(_, nextPage) => onPageChange(nextPage, perPage)}
                  onRowsPerPageChange={(event) => onPageChange(0, Number(event.target.value))}
                />
              ) : null}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions />
    </MyModal>
  );
}
