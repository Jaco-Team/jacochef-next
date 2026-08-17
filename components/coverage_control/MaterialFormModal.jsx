"use client";

import { useEffect, useState } from "react";
import { Button, DialogActions, DialogContent, Grid } from "@mui/material";

import MyModal from "@/ui/MyModal";
import { MyCheckBox, MySelect, MyTextInput } from "@/ui/Forms";
import { emptyMaterialForm } from "./utils";

export default function MaterialFormModal({
  open,
  onClose,
  onSave,
  initial,
  categories = [],
  units = [],
  calcTypes = [],
  canEdit = false,
  saving = false,
}) {
  const [form, setForm] = useState(emptyMaterialForm());

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyMaterialForm(),
      ...(initial || {}),
      category_id: initial?.category_id ?? "",
      unit_id: initial?.unit_id ?? "",
      calc_type: initial?.calc_type ?? "",
      packaging: initial?.packaging ?? "",
      comment: initial?.comment ?? "",
      name: initial?.name ?? "",
      is_active: initial?.is_active !== false,
      id: initial?.id ?? null,
    });
  }, [open, initial]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!canEdit || saving) return;
    onSave?.(form);
  };

  const title = form.id ? "Редактирование сырьевой позиции" : "Новая сырьевая позиция";

  return (
    <MyModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="md"
    >
      <DialogContent>
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 12 }}>
            <MyTextInput
              label="Наименование сырья"
              value={form.name || ""}
              disabled={!canEdit}
              func={(e) => setField("name", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              label="Категория"
              data={categories}
              value={form.category_id || ""}
              disabled={!canEdit}
              is_none={false}
              func={(e) => setField("category_id", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              label="Единица измерения"
              data={units}
              value={form.unit_id || ""}
              disabled={!canEdit}
              is_none={false}
              func={(e) => setField("unit_id", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              label="Тип расчёта"
              data={calcTypes}
              value={form.calc_type || ""}
              disabled={!canEdit}
              is_none={false}
              func={(e) => setField("calc_type", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextInput
              label="Упаковка"
              type="number"
              value={form.packaging ?? ""}
              disabled={!canEdit}
              func={(e) => setField("packaging", e.target.value)}
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
          {form.id ? (
            <Grid size={{ xs: 12, sm: 12 }}>
              <MyCheckBox
                label="Активна"
                value={Boolean(form.is_active)}
                disabled={!canEdit}
                func={(e) => setField("is_active", Boolean(e.target.checked))}
              />
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        {canEdit ? (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !String(form.name || "").trim()}
          >
            Сохранить
          </Button>
        ) : null}
      </DialogActions>
    </MyModal>
  );
}
