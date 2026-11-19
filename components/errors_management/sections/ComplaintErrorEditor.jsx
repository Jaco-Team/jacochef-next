"use client";

import { useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Link, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoChoiceChips,
  JacoIconButton,
  JacoSurface,
  JacoTextInput,
  uiColors,
} from "@/design-system/shared/ui";
import {
  findLeafById,
  leafPickerOptions,
  leavesForPosition,
  missingLabel,
  pickLeaf,
  positionQuantityLimit,
  solutionOptionsForLeaf,
  stageOptionsForLeaf,
  stepQuantity,
} from "../complaintTree.mjs";
import FieldMessage from "./FieldMessage";
import PhotoPicker from "./PhotoPicker";
import ProblemPicker from "./ProblemPicker";
import StageHint from "./StageHint";

const EDITOR_FIELDS = ["error_id", "stage_id", "solution_id", "photo_ids", "quantity", "comment"];

function matchesField(entry, field) {
  return entry.field === field || entry.field.startsWith(`${field}.`);
}

function FieldLabel({ children, hint }) {
  return (
    <Stack
      direction="row"
      spacing={0.25}
      sx={{ alignItems: "center", minHeight: 32 }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {children}
      </Typography>
      {hint}
    </Stack>
  );
}

function QuantityStepper({ value, max, onStep, error }) {
  return (
    <Stack spacing={0.5}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center" }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Сколько с ошибкой
        </Typography>
        <JacoIconButton
          aria-label="Меньше"
          disabled={value <= 1}
          onClick={() => onStep(-1)}
        >
          <RemoveIcon fontSize="small" />
        </JacoIconButton>
        <Typography
          aria-live="polite"
          sx={{ minWidth: 56, textAlign: "center" }}
        >
          {value} из {max}
        </Typography>
        <JacoIconButton
          aria-label="Больше"
          disabled={value >= max}
          onClick={() => onStep(1)}
        >
          <AddIcon fontSize="small" />
        </JacoIconButton>
      </Stack>
      <FieldMessage>{error}</FieldMessage>
    </Stack>
  );
}

export function ComplaintErrorEditor({
  value,
  position,
  leaves,
  solutions,
  stages,
  issues = [],
  serverErrors = [],
  onChange,
  onRemove,
  onAddPhotos,
  onRemovePhoto,
}) {
  const allowedLeaves = useMemo(() => leavesForPosition(leaves, position), [leaves, position]);
  const options = useMemo(() => leafPickerOptions(allowedLeaves), [allowedLeaves]);
  const leaf = findLeafById(allowedLeaves, value.leaf_id);
  const productKind = position?.product_kind ?? null;
  const stageOptions = useMemo(
    () => stageOptionsForLeaf(leaf, productKind, stages),
    [leaf, productKind, stages],
  );
  const solutionOptions = useMemo(() => solutionOptionsForLeaf(leaf, solutions), [leaf, solutions]);
  const quantityLimit = positionQuantityLimit(position);
  const fieldError = (field) => serverErrors.find((entry) => matchesField(entry, field))?.message;
  const otherErrors = serverErrors.filter(
    (entry) => !EDITOR_FIELDS.some((field) => matchesField(entry, field)),
  );
  const complete = issues.length === 0;
  const showComment = value.show_comment || Boolean(value.comment) || Boolean(fieldError("comment"));

  return (
    <JacoSurface
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        boxShadow: "none",
        backgroundColor: uiColors.surface,
        borderColor: complete ? uiColors.success : uiColors.border,
      }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "flex-start" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ProblemPicker
              options={options}
              value={value.leaf_id}
              autoOpen={value.auto_open}
              error={fieldError("error_id")}
              onChange={(leafId) =>
                onChange(pickLeaf(value, findLeafById(allowedLeaves, leafId), productKind))
              }
            />
          </Box>
          <JacoIconButton
            aria-label="Удалить ошибку"
            onClick={onRemove}
          >
            <CloseIcon fontSize="small" />
          </JacoIconButton>
        </Stack>
        {otherErrors.map((entry) => (
          <JacoAlert
            key={entry.field}
            severity="error"
          >
            {entry.message}
          </JacoAlert>
        ))}
        {options.length === 0 ? (
          <JacoAlert severity="warning">
            Для этой позиции в дереве категорий нет подходящих проблем.
          </JacoAlert>
        ) : null}
        {leaf && stageOptions.length ? (
          <Box>
            <FieldLabel hint={<StageHint stages={stageOptions} selectedIds={[value.stage_id]} />}>
              Этап
            </FieldLabel>
            <JacoChoiceChips
              ariaLabel="Этап"
              options={stageOptions}
              value={value.stage_id}
              onChange={(stageId) => onChange({ ...value, stage_id: stageId })}
            />
            <FieldMessage>{fieldError("stage_id")}</FieldMessage>
          </Box>
        ) : null}
        {leaf && solutionOptions.length ? (
          <Box>
            <FieldLabel>Решение</FieldLabel>
            <JacoChoiceChips
              ariaLabel="Решение"
              options={solutionOptions}
              value={value.solution_id}
              allowDeselect
              onChange={(solutionId) => onChange({ ...value, solution_id: solutionId })}
            />
            <FieldMessage>{fieldError("solution_id")}</FieldMessage>
          </Box>
        ) : null}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.5, md: 2.5 }}
          useFlexGap
          sx={{ alignItems: { md: "center" }, flexWrap: "wrap" }}
        >
          {quantityLimit > 1 ? (
            <QuantityStepper
              value={Number(value.quantity) || 1}
              max={quantityLimit}
              error={fieldError("quantity")}
              onStep={(step) => onChange(stepQuantity(value, position, step))}
            />
          ) : null}
          <PhotoPicker
            photos={value.photos || []}
            required={Boolean(leaf?.needImg)}
            error={fieldError("photo_ids")}
            onAdd={onAddPhotos}
            onRemove={onRemovePhoto}
          />
        </Stack>
        {showComment ? (
          <JacoTextInput
            fullWidth
            multiline
            minRows={2}
            label="Комментарий к ошибке"
            value={value.comment || ""}
            autoFocus={value.show_comment && !value.comment}
            error={Boolean(fieldError("comment"))}
            helperText={fieldError("comment")}
            onChange={(event) => onChange({ ...value, comment: event.target.value })}
          />
        ) : (
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => onChange({ ...value, show_comment: true })}
            sx={{ alignSelf: "flex-start", minHeight: 32, fontSize: 14 }}
          >
            + Комментарий
          </Link>
        )}
        {!complete ? (
          <Typography
            variant="body2"
            color="error"
          >
            {missingLabel(issues)}
          </Typography>
        ) : null}
      </Stack>
    </JacoSurface>
  );
}
