"use client";
import { useState, useMemo } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import useDDSStore from "../useDDSStore";
import MyModal from "@/ui/MyModal";
import { MySelect } from "@/ui/Forms";

// === Stubbed dictionaries (simulate backend enums / tables)
const GROUPS = [
  { id: 1, name: "Операционные поступления", flow: 1 },
  { id: 2, name: "Операционные расходы", flow: 0 },
];

const OPERATIONS = [
  { id: 1, group_id: 1, name: "от покупателя" },
  { id: 2, group_id: 1, name: "прочие поступления" },
  { id: 3, group_id: 2, name: "поставщику" },
  { id: 4, group_id: 2, name: "на расходы" },
  { id: 5, group_id: 2, name: "прочие расходы" },
];

const baseForm = { name: "", group_id: "", operation_id: "", type: "" };

export default function ModalAddArticle({ open, onClose }) {
  const setState = useDDSStore.setState;
  const [form, setForm] = useState(baseForm);
  const [errors, setErrors] = useState({});

  const filteredOperations = useMemo(() => {
    if (!form.group_id) return [];
    return OPERATIONS.filter((op) => String(op.group_id) === String(form.group_id));
  }, [form.group_id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.group_id) e.group_id = true;
    if (!form.operation_id) e.operation_id = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const group = GROUPS.find((g) => String(g.id) === String(form.group_id));
    const operation = OPERATIONS.find((o) => String(o.id) === String(form.operation_id));

    const newArticle = {
      id: Date.now(),
      name: form.name.trim(),
      group_id: group?.id || null,
      group: group?.name || "",
      operation_id: operation?.id || null,
      operation: operation?.name || "",
      type: form.type?.trim() || "",
      flow: group?.flow || 0,
      updated: new Date().toLocaleDateString("ru-RU"),
    };

    setState((state) => ({
      articles: [...state.articles, newArticle],
    }));

    alert("Статья успешно добавлена");
    setForm(baseForm);
    onClose();
  };

  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Создать статью ДДС</DialogTitle>

      <DialogContent
        dividers
        sx={{ pt: 2 }}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Наименование *"
              placeholder="Введите название статьи"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name && "Обязательное поле"}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <MySelect
              label="Группа *"
              data={GROUPS}
              value={form.group_id}
              func={(e) => handleChange("group_id", e.target.value)}
              is_none={false}
            />
            {errors.group_id && (
              <Typography
                variant="caption"
                color="error"
                sx={{ ml: 1, mt: 0.25, display: "block" }}
              >
                Обязательное поле
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <MySelect
              label="Вид операции *"
              data={filteredOperations}
              value={form.operation_id}
              func={(e) => handleChange("operation_id", e.target.value)}
              is_none={false}
              disabled={!form.group_id}
            />
            {errors.operation_id && (
              <Typography
                variant="caption"
                color="error"
                sx={{ ml: 1, mt: 0.25, display: "block" }}
              >
                Обязательное поле
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Тип показателя"
              placeholder="Например: Основная деятельность"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Создать
        </Button>
      </DialogActions>
    </MyModal>
  );
}
