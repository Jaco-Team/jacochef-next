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
  cascadeLevelLabel,
  cascadeLevels,
  changeTreePath,
  findLeaf,
  leavesForPosition,
  positionQuantityLimit,
  solutionOptionsForLeaf,
  stageOptionsForLeaf,
  validQuantity,
} from "../complaintTree.mjs";
import FieldMessage from "./FieldMessage";
import PhotoPicker from "./PhotoPicker";
import StageHint from "./StageHint";

const surfaceSx = { boxShadow: "none" };
const EDITOR_FIELDS = [
  "error_id",
  "stage_id",
  "solution_id",
  "ingredient_id",
  "photo_ids",
  "quantity",
  "comment",
  "error_amount",
];

function selectValue(event) {
  return event.target.value === "none" ? "" : event.target.value;
}

function matchesField(entry, field) {
  return entry.field === field || entry.field.startsWith(`${field}.`);
}

export function ComplaintErrorEditor({
  value,
  position,
  positionNumber,
  leaves,
  solutions,
  stages,
  serverErrors = [],
  onChange,
  onRemove,
  onAddPhotos,
  onRemovePhoto,
}) {
  const allowedLeaves = useMemo(() => leavesForPosition(leaves, position), [leaves, position]);
  const pathIds = value.path_ids || [];
  const levels = useMemo(() => cascadeLevels(allowedLeaves, pathIds), [allowedLeaves, pathIds]);
  const leaf = findLeaf(allowedLeaves, pathIds);
  const stageOptions = useMemo(
    () => stageOptionsForLeaf(leaf, position?.product_kind ?? null, stages),
    [leaf, position?.product_kind, stages],
  );
  const solutionOptions = useMemo(
    () => solutionOptionsForLeaf(leaf, solutions),
    [leaf, solutions],
  );
  const selectedStage = stageOptions.find((stage) => String(stage.id) === String(value.stage_id));
  const ingredients = Array.isArray(position?.ingredients) ? position.ingredients : [];
  const quantityLimit = positionQuantityLimit(position);
  const quantityValid = validQuantity(value, position);
  const fieldError = (field) => serverErrors.find((entry) => matchesField(entry, field))?.message;
  const otherErrors = serverErrors.filter(
    (entry) => !EDITOR_FIELDS.some((field) => matchesField(entry, field)),
  );

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
        {allowedLeaves.length === 0 ? (
          <JacoAlert severity="warning">
            Для этой позиции в дереве категорий нет подходящих вариантов ошибок.
          </JacoAlert>
        ) : null}
        <Grid
          container
          spacing={1.5}
        >
          {levels.map((options, level) => {
            const isLast = !options.some((option) =>
              allowedLeaves.some(
                (item) => item.pathIds[level] === option.id && item.pathIds.length > level + 1,
              ),
            );
            return (
              <Grid
                key={level}
                size={{ xs: 12, sm: levels.length > 1 ? 6 : 12 }}
              >
                <JacoSelect
                  required
                  label={cascadeLevelLabel(level, isLast)}
                  options={options}
                  value={pathIds[level] ? String(pathIds[level]) : ""}
                  allowNone
                  noneLabel="Выберите вариант"
                  onChange={(event) => onChange(changeTreePath(value, level, selectValue(event)))}
                />
              </Grid>
            );
          })}
          {fieldError("error_id") ? (
            <Grid size={12}>
              <FieldMessage>{fieldError("error_id")}</FieldMessage>
            </Grid>
          ) : null}
          {leaf && stageOptions.length ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "flex-start" }}
              >
                <JacoSelect
                  required
                  label="Этап возникновения ошибки"
                  options={stageOptions}
                  value={value.stage_id}
                  allowNone
                  noneLabel="Выберите этап"
                  onChange={(event) => onChange({ ...value, stage_id: selectValue(event) })}
                />
                <StageHint
                  stages={stageOptions}
                  selectedIds={value.stage_id ? [value.stage_id] : []}
                />
              </Stack>
              {selectedStage?.description ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {selectedStage.description}
                </Typography>
              ) : null}
              <FieldMessage>{fieldError("stage_id")}</FieldMessage>
            </Grid>
          ) : null}
          {leaf && solutionOptions.length ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoSelect
                label="Решение ошибки"
                options={solutionOptions}
                value={value.solution_id}
                allowNone
                noneLabel="Не выбрано"
                onChange={(event) => onChange({ ...value, solution_id: selectValue(event) })}
              />
              <FieldMessage>{fieldError("solution_id")}</FieldMessage>
            </Grid>
          ) : null}
          {leaf && ingredients.length ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <JacoSelect
                label="Продукт из состава"
                options={ingredients}
                value={value.ingredient_id}
                allowNone
                noneLabel="Не выбран"
                onChange={(event) => onChange({ ...value, ingredient_id: selectValue(event) })}
              />
              <FieldMessage>{fieldError("ingredient_id")}</FieldMessage>
            </Grid>
          ) : null}
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
            <PhotoPicker
              photos={value.photos || []}
              required={Boolean(leaf?.needImg)}
              error={fieldError("photo_ids")}
              onAdd={onAddPhotos}
              onRemove={onRemovePhoto}
            />
          </Grid>
        </Grid>
      </Stack>
    </JacoSurface>
  );
}
