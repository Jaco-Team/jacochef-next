"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoModal,
  JacoSelect,
  JacoSwitch,
  JacoTextInput,
} from "@/design-system/shared/ui";
import {
  STAGE_FIELDS,
  canSaveCategory,
  categoryDraft,
  categoryHasChildren,
  flattenCategoryTree,
} from "../../optionTreeModel.mjs";
import StageHint from "../StageHint";

function idsFromEvent(event) {
  return Array.isArray(event.target.value) ? event.target.value.map(Number) : [];
}

function SwitchRow({ checked, onChange, title, hint }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center" }}
    >
      <JacoSwitch
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <Box>
        <Typography fontWeight={700}>{title}</Typography>
        {hint ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {hint}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
}

export default function CategoryEditor({
  state,
  tree,
  errCats,
  siteCategories,
  stages,
  solutions,
  saving,
  error,
  onClose,
  onSave,
  onDelete,
}) {
  const [draft, setDraft] = useState(() => categoryDraft(state.node, state.parent));
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    setDraft(categoryDraft(state.node, state.parent));
    setConfirmDelete(false);
  }, [state]);
  const creating = !draft.id;
  const isRoot = !draft.parent_id;
  const parentOptions = useMemo(
    () => [
      { id: "root", name: "Корневой раздел" },
      ...flattenCategoryTree(tree)
        .filter((item) => item.id !== draft.id)
        .map((item) => ({ id: item.id, name: item.name })),
    ],
    [draft.id, tree],
  );
  const parent = (errCats || []).find((node) => Number(node.id) === Number(draft.parent_id));
  const hasChildren = categoryHasChildren(errCats, draft.id);
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const changeParent = (value) => {
    const nextParent = (errCats || []).find((node) => Number(node.id) === Number(value));
    const parentDraft = nextParent ? categoryDraft(null, nextParent) : null;
    update({
      parent_id: nextParent ? Number(nextParent.id) : null,
      site_cats: parentDraft ? parentDraft.site_cats : [],
    });
  };

  return (
    <JacoModal
      open
      onClose={onClose}
      title={creating ? "Новый вариант" : `Редактировать: ${state.node?.name || ""}`}
      maxWidth="md"
      actions={
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1}
          sx={{ width: "100%", justifyContent: "space-between" }}
        >
          {!creating ? (
            <JacoButton
              tone="danger"
              disabled={hasChildren || saving}
              onClick={() => setConfirmDelete(true)}
            >
              Удалить
            </JacoButton>
          ) : (
            <Box />
          )}
          <Stack
            direction="row"
            spacing={1}
          >
            <JacoButton
              tone="outlinePrimary"
              onClick={onClose}
            >
              Отмена
            </JacoButton>
            <JacoButton
              loading={saving}
              disabled={!canSaveCategory(draft)}
              onClick={() => onSave(draft)}
            >
              {creating ? "Добавить" : "Сохранить"}
            </JacoButton>
          </Stack>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error ? <JacoAlert severity="error">{error}</JacoAlert> : null}
        {confirmDelete ? (
          <JacoAlert
            severity="warning"
            action={
              <Stack
                direction="row"
                spacing={1}
              >
                <JacoButton
                  compact
                  tone="outlinePrimary"
                  onClick={() => setConfirmDelete(false)}
                >
                  Нет
                </JacoButton>
                <JacoButton
                  compact
                  tone="danger"
                  loading={saving}
                  onClick={() => onDelete(draft.id)}
                >
                  Удалить
                </JacoButton>
              </Stack>
            }
          >
            Удалить «{state.node?.name}»? Действие нельзя отменить. Уже зарегистрированные жалобы
            сохранят свои названия.
          </JacoAlert>
        ) : null}
        {hasChildren && !creating ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Вариант с вложенными элементами удалить нельзя: сначала удалите или перенесите их.
          </Typography>
        ) : null}
        <Grid
          container
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 8 }}>
            <JacoTextInput
              fullWidth
              required
              label="Наименование"
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <JacoTextInput
              fullWidth
              type="number"
              label="Порядок"
              value={draft.sort}
              slotProps={{ htmlInput: { min: 0, step: 1, inputMode: "numeric" } }}
              onChange={(event) => update({ sort: event.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <JacoSelect
              label="Родительский раздел"
              options={parentOptions}
              value={draft.parent_id ? String(draft.parent_id) : "root"}
              allowNone={false}
              disabled={!creating}
              onChange={(event) =>
                changeParent(event.target.value === "root" ? null : event.target.value)
              }
            />
            {!creating ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5, mx: 1.75 }}
              >
                Родительский раздел выбирается при создании варианта.
              </Typography>
            ) : null}
          </Grid>
          <Grid size={12}>
            <JacoSelect
              multiple
              withCheckboxes
              label="Категории сайта"
              options={siteCategories}
              value={(draft.site_cats || []).map(String)}
              allowNone={false}
              noneLabel="Не выбраны (ошибки заказа и доставки)"
              disabled={!isRoot}
              onChange={(event) => update({ site_cats: idsFromEvent(event) })}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5, mx: 1.75 }}
            >
              {isRoot
                ? "Позиции этих категорий сайта получат ветку при регистрации. Без категорий ветка используется для доставки и ошибок всего заказа."
                : `Наследуются от раздела «${parent?.name || ""}».`}
            </Typography>
          </Grid>
          {!isRoot ? (
            <>
              <Grid size={12}>
                <JacoSelect
                  multiple
                  withCheckboxes
                  label="Варианты решения"
                  options={solutions}
                  value={(draft.solution_ids || []).map(String)}
                  allowNone={false}
                  noneLabel="Без выбора решения"
                  onChange={(event) => update({ solution_ids: idsFromEvent(event) })}
                />
              </Grid>
              {STAGE_FIELDS.map((field) => (
                <Grid
                  key={field.key}
                  size={{ xs: 12, md: 4 }}
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: "flex-start" }}
                  >
                    <JacoSelect
                      multiple
                      withCheckboxes
                      label={field.label}
                      options={stages}
                      value={(draft[field.key] || []).map(String)}
                      allowNone={false}
                      noneLabel="Не выбраны"
                      onChange={(event) => update({ [field.key]: idsFromEvent(event) })}
                    />
                    <StageHint
                      stages={stages}
                      selectedIds={(draft[field.key] || []).map(String)}
                    />
                  </Stack>
                </Grid>
              ))}
              <Grid size={12}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Этапы и решения используются на конечном варианте ветки. Если для типа товара этапы
                  не заданы, при регистрации предлагаются все этапы варианта.
                </Typography>
              </Grid>
              <Grid size={12}>
                <SwitchRow
                  checked={Boolean(draft.need_img)}
                  onChange={(checked) => update({ need_img: checked })}
                  title="Фото обязательно"
                  hint="При регистрации такой ошибки нужно приложить хотя бы одно фото."
                />
              </Grid>
            </>
          ) : null}
          <Grid size={12}>
            <SwitchRow
              checked={Boolean(draft.is_active)}
              onChange={(checked) => update({ is_active: checked })}
              title="Вариант активен"
            />
          </Grid>
        </Grid>
      </Stack>
    </JacoModal>
  );
}
