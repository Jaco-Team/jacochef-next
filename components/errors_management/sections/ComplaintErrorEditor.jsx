"use client";

import { useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Grid, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import {
  activeNodes,
  changeClassifier,
  positionQuantityLimit,
  validQuantity,
} from "../complaintClassifier.mjs";
import FieldMessage from "./FieldMessage";
import StageHint from "./StageHint";

const surfaceSx = { boxShadow: "none" };
const EDITOR_FIELDS = [
  "category_id",
  "error_type_id",
  "error_id",
  "ingredient_id",
  "stage_id",
  "quantity",
  "comment",
  "error_amount",
  "solution_id",
];

function selectValue(event) {
  return event.target.value === "none" ? "" : event.target.value;
}

export function ComplaintErrorEditor({
  value,
  positions,
  positionNumber,
  catalog,
  solutions,
  stages,
  serverErrors = [],
  onChange,
  onRemove,
}) {
  const position = positions.find((item) => item.position_key === value.position_key);
  const categories = useMemo(
    () =>
      activeNodes(catalog, "category").filter((node) =>
        node.rules?.object_types?.includes(value.object_type),
      ),
    [catalog, value.object_type],
  );
  const types = useMemo(
    () => activeNodes(catalog, "error_type", value.category_id),
    [catalog, value.category_id],
  );
  const errors = useMemo(
    () => activeNodes(catalog, "error", value.error_type_id),
    [catalog, value.error_type_id],
  );
  const selectedError = errors.find((node) => String(node.id) === String(value.error_id));
  const configuredStages = useMemo(() => {
    const stageIds = selectedError?.rules?.stage_ids;
    if (!Array.isArray(stageIds)) return [];
    return stages.filter((stage) => stageIds.map(Number).includes(Number(stage.id)));
  }, [selectedError, stages]);
  const selectedStage = configuredStages.find((node) => String(node.id) === String(value.stage_id));
  const requiresIngredient = Boolean(selectedError?.rules?.requires_ingredient);
  const quantityLimit = positionQuantityLimit(position);
  const quantityValid = validQuantity(value, position);
  const change = (field, nextValue) => onChange(changeClassifier(catalog, value, field, nextValue));
  const fieldError = (field) => serverErrors.find((entry) => entry.field === field)?.message;
  const otherErrors = serverErrors.filter((entry) => !EDITOR_FIELDS.includes(entry.field));

  return (
    <JacoSurface
      variant="outlined"
      sx={{ p: 2, ...surfaceSx }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          gap={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography fontWeight={700}>
            {position ? `Позиция №${positionNumber}: ${position.name}` : "Ошибка заказа"}
          </Typography>
          <JacoButton
            compact
            tone="outlinePrimary"
            startIcon={<CloseIcon />}
            onClick={onRemove}
          >
            Удалить
          </JacoButton>
        </Stack>
        {otherErrors.map((entry) => (
          <JacoAlert
            key={entry.field}
            severity="error"
          >
            {entry.message}
          </JacoAlert>
        ))}
        {categories.length === 0 ? (
          <JacoAlert severity="warning">Для выбранной позиции варианты ошибок не настроены.</JacoAlert>
        ) : null}
        <Grid
          container
          spacing={1.5}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <JacoSelect
              required
              label="Категория"
              options={categories}
              disabled={categories.length === 0}
              value={value.category_id}
              allowNone
              noneLabel="Выберите категорию"
              onChange={(event) => change("category_id", selectValue(event))}
            />
            <FieldMessage>{fieldError("category_id")}</FieldMessage>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <JacoSelect
              required
              label="Тип ошибки"
              options={types}
              disabled={!value.category_id}
              value={value.error_type_id}
              allowNone
              noneLabel="Выберите тип ошибки"
              onChange={(event) => change("error_type_id", selectValue(event))}
            />
            <FieldMessage>{fieldError("error_type_id")}</FieldMessage>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <JacoSelect
              required
              label="Ошибка"
              options={errors}
              disabled={!value.error_type_id}
              value={value.error_id}
              allowNone
              noneLabel="Выберите ошибку"
              onChange={(event) => change("error_id", selectValue(event))}
            />
            <FieldMessage>{fieldError("error_id")}</FieldMessage>
          </Grid>
          {requiresIngredient ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoSelect
                required
                label="Продукт из состава"
                options={position?.ingredients || []}
                value={value.ingredient_id}
                allowNone
                noneLabel="Выберите продукт"
                onChange={(event) => change("ingredient_id", selectValue(event))}
              />
              <FieldMessage>{fieldError("ingredient_id")}</FieldMessage>
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6 }}>
            {value.error_id && configuredStages.length === 0 ? (
              <JacoAlert
                severity="warning"
                sx={{ mb: 1 }}
              >
                Для выбранной ошибки этапы не настроены.
              </JacoAlert>
            ) : null}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "flex-start" }}
            >
              <JacoSelect
                required
                label="Этап возникновения ошибки"
                options={configuredStages}
                disabled={!value.error_id || configuredStages.length === 0}
                value={value.stage_id}
                allowNone
                noneLabel="Выберите этап"
                onChange={(event) => change("stage_id", selectValue(event))}
              />
              <StageHint
                stages={configuredStages}
                selectedIds={value.stage_id ? [value.stage_id] : []}
              />
            </Stack>
            <FieldMessage>{fieldError("stage_id")}</FieldMessage>
            {selectedStage?.description ? (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {selectedStage.description}
              </Typography>
            ) : null}
          </Grid>
          {quantityLimit > 1 ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoTextInput
                type="number"
                label="Количество"
                value={value.quantity ?? 1}
                error={!quantityValid || Boolean(fieldError("quantity"))}
                helperText={fieldError("quantity") || `От 1 до ${quantityLimit} шт.`}
                slotProps={{
                  htmlInput: { min: 1, max: quantityLimit, step: 1, inputMode: "numeric" },
                  inputLabel: { shrink: true },
                }}
                onChange={(event) => onChange({ ...value, quantity: event.target.value })}
              />
            </Grid>
          ) : null}
          <Grid size={12}>
            <JacoTextInput
              fullWidth
              multiline
              minRows={2}
              label="Комментарий"
              value={value.comment || ""}
              error={Boolean(fieldError("comment"))}
              helperText={fieldError("comment")}
              onChange={(event) => onChange({ ...value, comment: event.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <JacoTextInput
              type="number"
              label="Сумма ошибки"
              value={value.error_amount || ""}
              error={Boolean(fieldError("error_amount"))}
              helperText={fieldError("error_amount")}
              slotProps={{
                htmlInput: { min: 0, step: 0.01, inputMode: "decimal" },
                inputLabel: { shrink: true },
              }}
              onChange={(event) => onChange({ ...value, error_amount: event.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <JacoSelect
              label="Решение ошибки"
              options={solutions}
              value={value.solution_id}
              allowNone
              noneLabel="Не выбрано"
              onChange={(event) => onChange({ ...value, solution_id: selectValue(event) })}
            />
            <FieldMessage>{fieldError("solution_id")}</FieldMessage>
          </Grid>
        </Grid>
      </Stack>
    </JacoSurface>
  );
}
