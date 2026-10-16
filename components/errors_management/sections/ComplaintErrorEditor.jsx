"use client";

import { useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, Grid, Stack, Typography } from "@mui/material";
import { JacoButton, JacoSelect, JacoSurface, JacoTextInput } from "@/design-system/shared/ui";
import { activeNodes, completeClassifier } from "../complaintClassifier.mjs";

const surfaceSx = { boxShadow: "none" };

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
        {categories.length === 0 ? (
          <Alert severity="warning">Для выбранной позиции варианты ошибок не настроены.</Alert>
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
              onChange={(event) => onChange(completeClassifier(catalog, value, selectValue(event)))}
            />
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
              onChange={(event) =>
                onChange({ ...value, error_type_id: selectValue(event), error_id: "" })
              }
            />
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
              onChange={(event) => onChange({ ...value, error_id: selectValue(event) })}
            />
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
                onChange={(event) => onChange({ ...value, ingredient_id: selectValue(event) })}
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6 }}>
            {value.error_id && configuredStages.length === 0 ? (
              <Alert severity="warning">Для выбранной ошибки этапы не настроены.</Alert>
            ) : null}
            <JacoSelect
              required
              label="Этап возникновения ошибки"
              options={configuredStages}
              disabled={!value.error_id || configuredStages.length === 0}
              value={value.stage_id}
              allowNone
              noneLabel="Выберите этап"
              onChange={(event) => onChange({ ...value, stage_id: selectValue(event) })}
            />
            {selectedStage?.description ? (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {selectedStage.description}
              </Typography>
            ) : null}
          </Grid>
          <Grid size={12}>
            <JacoTextInput
              fullWidth
              multiline
              minRows={2}
              label="Комментарий"
              value={value.comment || ""}
              onChange={(event) => onChange({ ...value, comment: event.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <JacoTextInput
              type="number"
              min={0}
              step={0.01}
              label="Сумма ошибки"
              value={value.error_amount || ""}
              slotProps={{
                htmlInput: { inputMode: "decimal" },
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
          </Grid>
        </Grid>
      </Stack>
    </JacoSurface>
  );
}
