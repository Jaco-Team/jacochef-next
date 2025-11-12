"use client";
import { useState, useMemo, useEffect } from "react";
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
import useApi from "@/src/hooks/useApi";
import { GROUPS, OPERATIONS } from "../config";

const emptyForm = { name: "", group_id: null, operation_id: null, type: "" };

export default function ModalAddEditArticle({ open, onClose, showAlert, article = null }) {
  const { module } = useDDSStore();
  const setState = useDDSStore.setState;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { api_laravel } = useApi(module);

  const filteredOperations = useMemo(() => {
    if (!form.group_id) return [];
    return OPERATIONS.filter((op) => String(op.group_id) === String(form.group_id));
  }, [form.group_id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.group_id) e.group_id = true;
    if (!form.type) e.type = true;
    if (!form.operation_id) e.operation_id = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addArticle = async () => {
    if (!validate()) {
      return showAlert("Ошибки в форме");
    }
    try {
      setState({ is_load: true });
      const req = {
        name: form.name,
        group: form.group_id,
        type: form.type,
        operation: OPERATIONS.find((op) => +op.id === +form.operation_id)?.name ?? "n/a",
      };
      const res = await api_laravel("articles/add", req);
      if (!res?.st) {
        return showAlert("Ошибка добавления статьи");
      }
      setState((state) => ({
        articles: [...state.articles, res.article],
        articlesRefreshToken: Date.now(),
      }));
      setForm(emptyForm);
      showAlert(`Статья успешно добавлена, id: ${res.article.id}`, true);
      onClose();
    } catch (e) {
      showAlert(e?.message || "Ошибка добавления статьи");
    } finally {
      setState({ is_load: false });
    }
  };
  const updateArticle = async () => {
    if (!validate()) {
      return showAlert("Ошибки в форме");
    }
    try {
      setState({ is_load: true });
      const req = {
        id: article.id,
        name: form.name,
        group: form.group_id,
        type: form.type,
        operation: OPERATIONS.find((op) => +op.id === +form.operation_id)?.name ?? "n/a",
      };
      const res = await api_laravel("articles/update", req);
      if (!res?.st) {
        return showAlert(res?.text || "Ошибка обновления статьи");
      }
      setState({
        articlesRefreshToken: Date.now(),
      });
      setForm(emptyForm);
      showAlert(`Статья ${article.name} успешно обновлена`, true);
      onClose();
    } catch (e) {
      showAlert(e?.message || "Ошибка обновления статьи");
    } finally {
      setState({ is_load: false });
    }
  };

  useEffect(() => {
    if (article) {
      setForm({
        name: article.name,
        group_id: article.group,
        operation_id: OPERATIONS.find((op) => op.name === article.operation)?.id,
        type: article.type,
      });
    }
  }, [article]);

  return (
    <MyModal
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      title={article ? "Редактировать статью ДДС" : "Создать статью ДДС"}
      fullWidth
    >
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
            <ErrorMessage
              show={errors.group_id}
              message="Обязательное поле"
            />
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
            <ErrorMessage
              show={errors.operation_id}
              message="Обязательное поле"
            />
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
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={article ? updateArticle : addArticle}
        >
          {article ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </MyModal>
  );
}

function ErrorMessage({ show = false, message }) {
  return (
    !!show && (
      <Typography
        variant="caption"
        color="error"
        sx={{ ml: 1, mt: 0.25, display: "block" }}
      >
        {message}
      </Typography>
    )
  );
}
