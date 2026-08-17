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
  Typography,
} from "@mui/material";

import MyModal from "@/ui/MyModal";
import { MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import { emptySupplierForm, formatNumber, formatValue } from "./utils";
import { getStatusColor, getStatusLabel } from "./status";

function CalcItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

export default function SupplierCardModal({
  open,
  onClose,
  loading = false,
  material = null,
  initial = null,
  suppliersDict = [],
  freeNeed = null,
  canEdit = false,
  canRequestStock = false,
  canDelete = false,
  saving = false,
  onSave,
  onRequestStock,
  onDelete,
}) {
  const [form, setForm] = useState(emptySupplierForm());

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptySupplierForm(material?.id ?? null),
      ...(initial || {}),
      material_id: initial?.material_id ?? material?.id ?? null,
      supplier_id: initial?.supplier_id ?? "",
    });
  }, [open, initial, material]);

  const selectedSupplier = useMemo(() => {
    if (!form.supplier_id) return null;
    return (
      suppliersDict.find((s) => String(s.id) === String(form.supplier_id)) ||
      (initial?.supplier_id && String(initial.supplier_id) === String(form.supplier_id)
        ? { id: initial.supplier_id, name: initial.supplier_name || initial.name }
        : null)
    );
  }, [form.supplier_id, suppliersDict, initial]);

  const overAllocationWarning = useMemo(() => {
    const allocated = Number(form.allocated_qty);
    const free = Number(freeNeed);
    if (!Number.isFinite(allocated) || !Number.isFinite(free)) return false;
    const previous = Number(initial?.allocated_qty) || 0;
    const othersAllocated = Number(material?.allocated);
    let baseFree = free;
    if (Number.isFinite(othersAllocated) && initial?.id) {
      // free_need already excludes current allocation on backend usually;
      // compare against free + current if editing existing row.
      baseFree = free + previous;
    }
    return allocated > baseFree;
  }, [form.allocated_qty, freeNeed, initial, material]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const title = form.id
    ? `Поставщик: ${formatValue(selectedSupplier?.name || initial?.supplier_name)}`
    : "Распределение на поставщика";

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={title}
    >
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Сырьё: {formatValue(material?.name)}
              {freeNeed != null && freeNeed !== ""
                ? ` · Свободная потребность: ${formatNumber(freeNeed)}`
                : ""}
            </Typography>

            {form.id ? (
              <Chip
                size="small"
                color={getStatusColor(initial?.status)}
                label={getStatusLabel(initial?.status)}
                sx={{ alignSelf: "flex-start" }}
              />
            ) : null}

            {overAllocationWarning ? (
              <Alert severity="warning">
                Распределяемое количество превышает свободную потребность по сырью
              </Alert>
            ) : null}

            <Typography variant="subtitle1">Основные данные</Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 8 }}>
                <MyAutocomplite
                  label="Поставщик"
                  data={suppliersDict}
                  value={selectedSupplier}
                  disabled={!canEdit}
                  multiple={false}
                  func={(event, value) => setField("supplier_id", value?.id ?? "")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyTextInput
                  label="Выделенное количество"
                  type="number"
                  value={form.allocated_qty ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("allocated_qty", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                <MyTextInput
                  label="Комментарий"
                  value={form.comment || ""}
                  disabled={!canEdit}
                  multiline
                  minRows={2}
                  func={(e) => setField("comment", e.target.value)}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1">Остатки и поставка</Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyTextInput
                  label="Остаток у поставщика"
                  type="number"
                  value={form.stock_at_supplier ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("stock_at_supplier", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyTextInput
                  label="Товар в пути"
                  type="number"
                  value={form.in_transit ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("in_transit", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyDatePickerNew
                  label="Ожидаемая дата прихода"
                  value={form.expected_arrival_date || null}
                  disabled={!canEdit}
                  clearable
                  func={(value) =>
                    setField("expected_arrival_date", value ? value.format("YYYY-MM-DD") : "")
                  }
                />
              </Grid>
              {initial?.stock_updated_at ? (
                <Grid size={{ xs: 12, sm: 12 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Дата обновления остатка: {formatValue(initial.stock_updated_at)}
                  </Typography>
                </Grid>
              ) : null}
            </Grid>

            <Typography variant="subtitle1">Сроки</Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 6, sm: 3 }}>
                <MyTextInput
                  label="Наработка, дни"
                  type="number"
                  value={form.production_days ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("production_days", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <MyTextInput
                  label="Логистика, дни"
                  type="number"
                  value={form.logistics_days ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("logistics_days", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <MyTextInput
                  label="Праздники, дни"
                  type="number"
                  value={form.holiday_days ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("holiday_days", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <MyTextInput
                  label="Запас, дни"
                  type="number"
                  value={form.safety_days ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("safety_days", e.target.value)}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1">Цены</Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyTextInput
                  label="Текущая цена"
                  type="number"
                  value={form.price_current ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("price_current", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyTextInput
                  label="Будущая цена"
                  type="number"
                  value={form.price_future ?? ""}
                  disabled={!canEdit}
                  func={(e) => setField("price_future", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <MyTextInput
                  label="Комментарий к будущей цене"
                  value={form.price_future_comment || ""}
                  disabled={!canEdit}
                  func={(e) => setField("price_future_comment", e.target.value)}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1">Расчёт</Typography>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 6, sm: 3 }}>
                <CalcItem
                  label="Обеспеченность, дни"
                  value={formatNumber(initial?.stock_days)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <CalcItem
                  label="Нехватка"
                  value={formatNumber(initial?.shortage)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <CalcItem
                  label="Рекомендация к заказу"
                  value={formatValue(initial?.order_recommendation)}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <CalcItem
                  label="Горизонт покрытия"
                  value={formatNumber(initial?.horizon_days)}
                />
              </Grid>
            </Grid>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose}>Отмена</Button>
        {canRequestStock && form.id ? (
          <Button
            variant="outlined"
            onClick={() => onRequestStock?.(form)}
          >
            Запросить остатки
          </Button>
        ) : null}
        {canDelete && form.id ? (
          <Button
            color="error"
            variant="outlined"
            onClick={() => onDelete?.(form)}
          >
            Удалить
          </Button>
        ) : null}
        {canEdit ? (
          <Button
            variant="contained"
            disabled={saving || !form.supplier_id}
            onClick={() => onSave?.(form)}
          >
            Сохранить
          </Button>
        ) : null}
      </DialogActions>
    </MyModal>
  );
}
