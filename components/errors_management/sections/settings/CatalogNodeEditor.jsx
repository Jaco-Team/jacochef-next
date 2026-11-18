"use client";

import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoAutocomplete,
  JacoButton,
  JacoModal,
  JacoSelect,
  JacoSwitch,
  JacoTextInput,
} from "@/design-system/shared/ui";
import FieldMessage from "../FieldMessage";
import StageHint from "../StageHint";
import {
  allowsIngredient,
  canSaveNode,
  hasChildren,
  initialDraft,
  isGlobalNode,
  nodeRules,
  parentKind,
  parentOptions,
  stageOptions,
} from "./catalogModel.mjs";

function parentLabel(node, nodes, draft) {
  const parent = nodes.find((item) => Number(item.id) === Number(node.parent_id));
  const name = node.kind === "error_type" && parent ? `${parent.name} → ${node.name}` : node.name;
  const scope = !isGlobalNode(draft) && isGlobalNode(node) ? " · общий" : "";
  const inactive = node.is_active ? "" : " · отключён";
  return `${name}${scope}${inactive}`;
}

function itemIdsFromInput(values) {
  return [
    ...new Set(
      (values || [])
        .map((value) => String(value).trim())
        .filter((value) => /^\d+$/.test(value) && Number(value) > 0)
        .map(Number),
    ),
  ];
}

export default function CatalogNodeEditor({
  state,
  onClose,
  onSave,
  saving,
  error,
  stages,
  nodes = [],
  siteCategories = [],
  scopeLabel,
}) {
  const [draft, setDraft] = useState(() => initialDraft(state.node, state.context));
  const isError = draft.kind === "error";
  const isCategory = draft.kind === "category";
  const fields = error?.fields || {};
  const availableStages = stageOptions(stages, draft);
  const availableStageIds = availableStages.map((stage) => Number(stage.id));
  const parents = parentOptions(nodes, draft);
  const parentLocked = hasChildren(nodes, state.node);
  const parentSelected = parents.some((node) => Number(node.id) === Number(draft.parent_id));
  const ingredientAllowed = isError && allowsIngredient(nodes, draft);
  const stageIds = (draft.rules?.stage_ids || [])
    .map(Number)
    .filter((id) => availableStageIds.includes(id))
    .map(String);
  const ruleOptions = { allowIngredient: ingredientAllowed, stageIds: availableStageIds };
  useEffect(() => setDraft(initialDraft(state.node, state.context)), [state]);
  const updateRules = (patch) =>
    setDraft((current) => ({ ...current, rules: { ...current.rules, ...patch } }));
  const save = () =>
    onSave({
      ...draft,
      sort_order: Number(draft.sort_order || 0),
      rules: nodeRules(draft.kind, draft.rules, ruleOptions),
    });
  const canSave = canSaveNode(draft, {
    stageIds: availableStageIds,
    parentIds: parents.map((node) => node.id),
  });

  return (
    <JacoModal
      open
      onClose={onClose}
      title={draft.id ? "Редактировать вариант" : "Добавить вариант"}
      maxWidth="sm"
      actions={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <JacoButton
            tone="outlinePrimary"
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          <JacoButton
            loading={saving}
            disabled={!canSave}
            onClick={save}
          >
            Сохранить
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error?.text ? <JacoAlert severity="error">{error.text}</JacoAlert> : null}
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Область: {isGlobalNode(draft) ? "все кафе (общий вариант)" : scopeLabel}
        </Typography>
        <JacoTextInput
          fullWidth
          required
          label="Наименование"
          value={draft.name}
          disabled={isCategory}
          error={Boolean(fields.name)}
          helperText={fields.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <JacoTextInput
          fullWidth
          multiline
          minRows={3}
          label="Описание"
          value={draft.description}
          error={Boolean(fields.description)}
          helperText={fields.description}
          onChange={(event) =>
            setDraft((current) => ({ ...current, description: event.target.value }))
          }
        />
        <JacoTextInput
          fullWidth
          type="number"
          label="Порядок"
          value={draft.sort_order}
          error={Boolean(fields.sort_order)}
          helperText={fields.sort_order}
          slotProps={{ htmlInput: { min: 0, step: 1, inputMode: "numeric" } }}
          onChange={(event) =>
            setDraft((current) => ({ ...current, sort_order: event.target.value }))
          }
        />
        {parentKind(draft.kind) ? (
          <Box>
            <JacoSelect
              required
              label={draft.kind === "error" ? "Тип ошибки" : "Раздел"}
              options={parents.map((node) => ({
                id: node.id,
                name: parentLabel(node, nodes, draft),
              }))}
              value={parentSelected ? String(draft.parent_id) : ""}
              allowNone={false}
              disabled={parentLocked}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  parent_id: Number(event.target.value) || null,
                }))
              }
            />
            <FieldMessage>
              {fields.parent_id ||
                (parentSelected ? null : "Выберите родительский элемент из доступной области.")}
            </FieldMessage>
            {parentLocked ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5, mx: 1.75 }}
              >
                У элемента есть вложенные элементы, поэтому родителя изменить нельзя.
              </Typography>
            ) : null}
          </Box>
        ) : null}
        {isCategory ? (
          <Stack spacing={2}>
            <Box>
              <JacoSelect
                multiple
                withCheckboxes
                label="Категории сайта"
                options={siteCategories}
                value={(draft.rules?.site_category_ids || []).map(String)}
                allowNone={false}
                noneLabel="Не выбраны"
                onChange={(event) =>
                  updateRules({
                    site_category_ids: Array.isArray(event.target.value)
                      ? event.target.value.map(Number)
                      : [],
                  })
                }
              />
              <FieldMessage>{fields["rules.site_category_ids"]}</FieldMessage>
            </Box>
            <Box>
              <JacoAutocomplete
                multiple
                freeSolo
                label="Отдельные позиции сайта (ID)"
                placeholder="Введите ID и нажмите Enter"
                options={[]}
                value={(draft.rules?.item_ids || []).map(String)}
                onChange={(_event, values) => updateRules({ item_ids: itemIdsFromInput(values) })}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5, mx: 1.75 }}
              >
                Необязательно. Позиции, к которым раздел применяется помимо выбранных категорий
                сайта.
              </Typography>
              <FieldMessage>{fields["rules.item_ids"]}</FieldMessage>
            </Box>
          </Stack>
        ) : null}
        {isError ? (
          <Stack spacing={2}>
            <Box>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "flex-start" }}
              >
                <JacoSelect
                  required
                  multiple
                  label="Этапы возникновения ошибки"
                  withCheckboxes
                  options={availableStages}
                  value={stageIds}
                  allowNone={false}
                  noneLabel="Выберите этапы"
                  onChange={(event) =>
                    updateRules({
                      stage_ids: Array.isArray(event.target.value)
                        ? event.target.value.map(Number)
                        : [],
                    })
                  }
                />
                <StageHint
                  stages={availableStages}
                  selectedIds={stageIds}
                />
              </Stack>
              <FieldMessage>
                {fields["rules.stage_ids"] ||
                  (stageIds.length === 0 ? "Выберите хотя бы один этап." : null)}
              </FieldMessage>
            </Box>
            {ingredientAllowed ? (
              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  <JacoSwitch
                    checked={Boolean(draft.rules?.requires_ingredient)}
                    onChange={(event) => updateRules({ requires_ingredient: event.target.checked })}
                  />
                  <Box>
                    <Typography fontWeight={700}>Запрашивать продукт из состава</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Показывается только при регистрации ошибки блюда.
                    </Typography>
                  </Box>
                </Stack>
                <FieldMessage>{fields["rules.requires_ingredient"]}</FieldMessage>
              </Box>
            ) : null}
          </Stack>
        ) : null}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center" }}
        >
          <JacoSwitch
            checked={Boolean(draft.is_active)}
            onChange={(event) =>
              setDraft((current) => ({ ...current, is_active: event.target.checked }))
            }
          />
          <Typography fontWeight={700}>Вариант активен</Typography>
        </Stack>
      </Stack>
    </JacoModal>
  );
}
