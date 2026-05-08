"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
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
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import MyModal from "@/ui/MyModal";
import EmptyState from "./EmptyState";
import MetricLegendModal from "./MetricLegendModal";
import { CP_SPACE } from "../layout";

const getOrderNumber = (row) => row?.order_number || row?.order_id || "—";
const getPositionName = (row) => row?.position_name || row?.item_name || row?.name || "—";
const getStageType = (stage) => stage?.stage_type || stage?.type || stage?.code || "";
const getStageName = (stage) => stage?.stage_name || stage?.name || getStageType(stage) || "Этап";
const getStageFactSeconds = (stage) =>
  stage?.fact_seconds ?? stage?.duration_seconds ?? stage?.seconds;
const getStageTargetSeconds = (stage) => stage?.target_seconds ?? stage?.sla_seconds;

const getTimeResultColor = (factSeconds, targetSeconds) => {
  if (factSeconds == null || targetSeconds == null) return "text.primary";

  const fact = Number(factSeconds);
  const target = Number(targetSeconds);
  if (!Number.isFinite(fact) || !Number.isFinite(target)) return "text.primary";

  return fact <= target ? "success.main" : "error.main";
};

const sumSeconds = (values) => {
  let hasValue = false;
  const total = values.reduce((sum, value) => {
    if (value == null) return sum;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return sum;
    hasValue = true;
    return sum + numeric;
  }, 0);

  return hasValue ? total : null;
};

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
        font: "inherit",
        fontWeight: 700,
        textAlign: "left",
      }}
    >
      {getOrderNumber(row)}
    </Box>
  );
}

function CategoryDetailsTable({ rows, formatters, onOrderOpen }) {
  const stageColumns = useMemo(() => {
    const stageMap = new Map();

    rows.forEach((row) => {
      (row?.stages || []).forEach((stage) => {
        const key = getStageType(stage) || getStageName(stage);
        if (!key || stageMap.has(key)) return;
        stageMap.set(key, {
          key,
          label: getStageName(stage),
        });
      });
    });

    return Array.from(stageMap.values());
  }, [rows]);

  if (!rows.length) return <EmptyState />;

  return (
    <TableContainer sx={{ maxHeight: "56dvh" }}>
      <Table
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableCell>Заказ</TableCell>
            <TableCell>Позиция</TableCell>
            {stageColumns.map((stage) => (
              <TableCell
                key={stage.key}
                align="center"
              >
                {stage.label}
              </TableCell>
            ))}
            <TableCell align="center">Итого</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const stages = row?.stages || [];
            const stagesByType = new Map(
              stages.map((stage) => [getStageType(stage) || getStageName(stage), stage]),
            );
            const totalFactSeconds = sumSeconds(stages.map(getStageFactSeconds));
            const totalTargetSeconds = sumSeconds(stages.map(getStageTargetSeconds));
            const totalColor = getTimeResultColor(totalFactSeconds, totalTargetSeconds);

            return (
              <TableRow
                key={`${row?.order_id || row?.order_number || "order"}-${row?.position_id || index}`}
                hover
              >
                <TableCell>
                  {onOrderOpen ? (
                    <OrderNumberButton
                      row={row}
                      onClick={() => onOrderOpen(row)}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      {getOrderNumber(row)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ minWidth: 180 }}
                  >
                    {getPositionName(row)}
                  </Typography>
                </TableCell>
                {stageColumns.map((stageColumn) => {
                  const stage = stagesByType.get(stageColumn.key);
                  const stageFactSeconds = getStageFactSeconds(stage);
                  const stageTargetSeconds = getStageTargetSeconds(stage);

                  return (
                    <TableCell
                      key={stageColumn.key}
                      align="center"
                    >
                      <Stack spacing={CP_SPACE.micro}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: getTimeResultColor(stageFactSeconds, stageTargetSeconds),
                          }}
                        >
                          {formatters.duration(stageFactSeconds)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          план {formatters.duration(stageTargetSeconds)}
                        </Typography>
                      </Stack>
                    </TableCell>
                  );
                })}
                <TableCell align="center">
                  <Stack spacing={CP_SPACE.micro}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: totalColor }}
                    >
                      {formatters.duration(totalFactSeconds)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      план {formatters.duration(totalTargetSeconds)}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const getPagination = (data) => data?.meta?.pagination || data?.pagination || {};

export default function SlaCategoryDetailsModal({
  open,
  onClose,
  loading,
  data,
  metric,
  formatters,
  periodLabel,
  page,
  perPage,
  onPageChange,
  onOrderOpen,
}) {
  const [showInfo, setShowInfo] = useState(false);
  const rows = data?.rows || data?.items || [];
  const pagination = getPagination(data);
  const totalRows = pagination.total ?? data?.total ?? rows.length;
  const baseTitle = data?.category?.category_name || metric?.title || "Категория";
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
          >
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Stack spacing={CP_SPACE.group}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700 }}
              >
                Детализация по заказам и позициям
              </Typography>
            </Box>

            <Box>
              <CategoryDetailsTable
                rows={rows}
                formatters={formatters}
                onOrderOpen={onOrderOpen}
              />
              {rows.length ? (
                <TablePagination
                  component="div"
                  count={Number(totalRows) || rows.length}
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

            <Box>
              <Button
                variant="outlined"
                onClick={() => setShowInfo((current) => !current)}
                endIcon={showInfo ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                sx={{
                  px: 1,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {showInfo ? "Скрыть описание" : "Показать описание расчёта"}
              </Button>
              <Collapse in={showInfo}>
                <Box sx={{ mt: CP_SPACE.component }}>
                  <MetricLegendModal
                    inline
                    metric={metric}
                  />
                </Box>
              </Collapse>
            </Box>
          </Stack>
        )}
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
