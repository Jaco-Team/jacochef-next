"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { JacoButton, JacoModal, JacoSelect, JacoTextInput } from "@/design-system/shared/ui";
import SkladCategoryHistoryDialog from "../SkladCategoryHistoryDialog";
import useSkladApi from "../useSkladApi";

export default function SkladSiteCategoryManagerDialog({
  open,
  onClose,
  onChanged,
  canCreate,
  canEdit,
}) {
  const api = useSkladApi();
  const [state, setState] = useState({ loading: false, error: "", categories: [] });
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("0");
  const [historyCategory, setHistoryCategory] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    const response = await api.getSiteCategories();
    if (!response?.st || !Array.isArray(response.list))
      throw new Error(response?.text || "Ошибка загрузки категорий");
    return response.list.filter((item) => Number(item.id) > 0);
  }, [api]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setEditing(null);
    setName("");
    setParentId("0");
    setState({ loading: true, error: "", categories: [] });
    load()
      .then((categories) => {
        if (!cancelled) setState({ loading: false, error: "", categories });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            loading: false,
            error: error?.message || "Ошибка загрузки категорий",
            categories: [],
          });
      });
    return () => {
      cancelled = true;
    };
  }, [open, load, attempt]);

  const save = async () => {
    const nextName = name.trim();
    if (!nextName || state.loading || (editing ? !canEdit : !canCreate)) return;
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = editing
        ? await api.updateSiteCategory({ id: editing.id, name: nextName })
        : await api.createSiteCategory({ name: nextName, parent_id: Number(parentId) || 0 });
      if (!response?.st) throw new Error(response?.text || "Ошибка сохранения категории");
      const categories = await load();
      setState({ loading: false, error: "", categories });
      setEditing(null);
      setName("");
      setParentId("0");
      await onChanged();
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Ошибка сохранения категории",
      }));
    }
  };

  return (
    <>
      <JacoModal
        open={open}
        onClose={state.loading ? undefined : onClose}
        title="Категории товаров сайта"
        maxWidth="md"
      >
        <Stack spacing={1.5}>
          {state.error ? (
            <Alert
              severity="error"
              action={
                !state.categories.length && !editing && !name ? (
                  <JacoButton
                    compact
                    tone="secondary"
                    onClick={() => setAttempt((value) => value + 1)}
                  >
                    Повторить
                  </JacoButton>
                ) : null
              }
            >
              {state.error}
            </Alert>
          ) : null}
          {canCreate || editing ? (
            <Stack spacing={1}>
              <JacoTextInput
                label={editing ? "Название категории" : "Новая категория"}
                value={name}
                disabled={state.loading}
                onChange={(event) => setName(event.target.value)}
              />
              {!editing ? (
                <JacoSelect
                  label="Родительская категория"
                  value={parentId}
                  options={[{ id: "0", name: "Без родительской категории" }, ...state.categories]}
                  allowNone={false}
                  disabled={state.loading}
                  onChange={(event) => setParentId(event.target.value)}
                />
              ) : null}
              <Stack
                direction="row"
                spacing={1}
              >
                <JacoButton
                  disabled={state.loading || !name.trim()}
                  onClick={save}
                >
                  {editing ? "Сохранить" : "Добавить"}
                </JacoButton>
                {editing ? (
                  <JacoButton
                    tone="secondary"
                    onClick={() => {
                      setEditing(null);
                      setName("");
                    }}
                  >
                    Отмена
                  </JacoButton>
                ) : null}
              </Stack>
            </Stack>
          ) : null}
          {state.loading ? <Typography role="status">Загрузка…</Typography> : null}
          {!state.loading && !state.categories.length && !state.error ? (
            <Typography>Категории не найдены.</Typography>
          ) : null}
          {state.categories.map((category) => (
            <Box
              key={category.id}
              sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 1.5 }}
            >
              <Typography fontWeight={600}>{category.name}</Typography>
              {category.parent_name ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {category.parent_name}
                </Typography>
              ) : null}
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, flexWrap: "wrap" }}
              >
                {canEdit ? (
                  <JacoButton
                    compact
                    tone="secondary"
                    disabled={state.loading}
                    onClick={() => {
                      setEditing(category);
                      setName(category.name);
                    }}
                  >
                    Переименовать
                  </JacoButton>
                ) : null}
                <JacoButton
                  compact
                  tone="secondary"
                  disabled={state.loading}
                  onClick={() => setHistoryCategory({ ...category, source_type: "site_item" })}
                >
                  История
                </JacoButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </JacoModal>
      <SkladCategoryHistoryDialog
        category={historyCategory}
        onClose={() => setHistoryCategory(null)}
      />
    </>
  );
}
