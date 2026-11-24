"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import MyModal from "@/ui/MyModal";
import { formatNumber, formatValue } from "./utils";
import { getStatusColor, getStatusLabel } from "./status";
import CoverageControlHistory from "./CoverageControlHistory";

function SummaryItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

export default function MaterialCardModal({
  open,
  onClose,
  loading = false,
  material = null,
  canEdit = false,
  canDelete = false,
  onEditMaterial,
  onAddSupplier,
  onOpenSupplier,
  onToggleActive,
  onDelete,
}) {
  const [local, setLocal] = useState(null);

  useEffect(() => {
    if (open) setLocal(material);
  }, [open, material]);

  const suppliers = Array.isArray(local?.suppliers) ? local.suppliers : [];
  const history = Array.isArray(local?.history) ? local.history : [];

  const overAllocated = useMemo(() => {
    const free = Number(local?.free_need);
    const allocated = Number(local?.allocated);
    if (!Number.isFinite(free) || !Number.isFinite(allocated)) return false;
    return allocated > free && free >= 0;
  }, [local]);

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="lg"
      title={local?.name || "Карточка сырьевой позиции"}
    >
      <DialogContent>
        {loading || !local ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Chip
                size="small"
                color={getStatusColor(local.status)}
                label={getStatusLabel(local.status)}
              />
              {local.is_active === false ? (
                <Chip
                  size="small"
                  label="Отключена"
                  variant="outlined"
                />
              ) : null}
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                {[
                  local.category_name,
                  local.unit_name || local.unit,
                  local.calc_type_label || local.calc_type,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Typography>
            </Stack>

            {overAllocated ? (
              <Alert severity="warning">
                Распределяемое количество превышает свободную потребность по сырью
              </Alert>
            ) : null}

            <Typography variant="subtitle1">Основная информация</Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 4 }}>
                <SummaryItem
                  label="Упаковка"
                  value={formatValue(local.packaging)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <SummaryItem
                  label="Комментарий"
                  value={formatValue(local.comment)}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1">Общий расчёт</Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryItem
                  label="Расход"
                  value={formatNumber(local.usage)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryItem
                  label="Среднее в день"
                  value={formatNumber(local.avg_per_day)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryItem
                  label="Общая потребность"
                  value={formatNumber(local.total_need)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryItem
                  label="Нехватка"
                  value={formatNumber(local.shortage)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryItem
                  label="Свободная потребность"
                  value={formatNumber(local.free_need)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryItem
                  label="Распределено"
                  value={formatNumber(local.allocated)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <SummaryItem
                  label="Осталось распределить"
                  value={formatNumber(local.remaining)}
                />
              </Grid>
            </Grid>

            <Stack
              direction="row"
              useFlexGap
              spacing={1}
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography variant="subtitle1">Поставщики</Typography>
              {canEdit ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onAddSupplier?.(local)}
                >
                  Добавить поставщика
                </Button>
              ) : null}
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Поставщик</TableCell>
                  <TableCell>Выделено</TableCell>
                  <TableCell>Остаток</TableCell>
                  <TableCell>В пути</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.length ? (
                  suppliers.map((row) => (
                    <TableRow
                      key={row.id || `${row.supplier_id}-${row.allocated_qty}`}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => onOpenSupplier?.(local, row)}
                    >
                      <TableCell>{formatValue(row.supplier_name || row.name)}</TableCell>
                      <TableCell>{formatNumber(row.allocated_qty)}</TableCell>
                      <TableCell>{formatNumber(row.stock_at_supplier)}</TableCell>
                      <TableCell>{formatNumber(row.in_transit)}</TableCell>
                      <TableCell>{formatNumber(row.price_current, 2)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={getStatusColor(row.status)}
                          label={getStatusLabel(row.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                    >
                      Поставщики не добавлены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <CoverageControlHistory history={history} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose}>Закрыть</Button>
        {canEdit && local ? (
          <Button
            variant="outlined"
            onClick={() => onEditMaterial?.(local)}
          >
            Редактировать
          </Button>
        ) : null}
        {canEdit && local ? (
          <Button
            variant="outlined"
            color={local.is_active === false ? "success" : "warning"}
            onClick={() => onToggleActive?.(local)}
          >
            {local.is_active === false ? "Включить" : "Отключить"}
          </Button>
        ) : null}
        {canDelete && local ? (
          <Button
            variant="outlined"
            color="error"
            onClick={() => onDelete?.(local)}
          >
            Удалить
          </Button>
        ) : null}
      </DialogActions>
    </MyModal>
  );
}
