"use client";

import { Fragment } from "react";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  JacoButton,
  JacoIconButton,
  JacoStatusChip,
  JacoSurface,
  uiColors,
} from "@/design-system/shared/ui";
import { formatPlural } from "@/src/helpers/utils/i18n";
import { isRemovedError } from "../../errorsManagementPermissions.mjs";
import {
  complaintObjectLabel,
  complaintProblemLabel,
  historyTimestamp,
} from "../../errorsManagementViewModel.mjs";
import DetailField from "./DetailField";
import PhotoThumbnails from "./PhotoThumbnails";

function positionLabel(item) {
  const name = item.position_name || complaintObjectLabel(item);
  const quantity = Number(item.quantity);
  return Number.isInteger(quantity) && quantity > 1 ? `${name} × ${quantity}` : name;
}

function problemLabel(item) {
  return complaintProblemLabel(item);
}


function removalLabel(item) {
  return [historyTimestamp(item.removed_at), item.removed_by_name].filter(Boolean).join(" · ");
}

function RemoveButton({ item, canRemove, onRemove, compact = false }) {
  if (!canRemove?.(item)) return null;
  if (compact) {
    return (
      <Tooltip
        title="Снять ошибку"
        arrow
      >
        <Box component="span">
          <JacoIconButton
            aria-label="Снять ошибку"
            onClick={() => onRemove(item)}
          >
            <RemoveCircleOutlineIcon fontSize="small" />
          </JacoIconButton>
        </Box>
      </Tooltip>
    );
  }
  return (
    <JacoButton
      compact
      variant="text"
      tone="outlinePrimary"
      onClick={() => onRemove(item)}
    >
      Снять ошибку
    </JacoButton>
  );
}

function RemovedNote({ item }) {
  return (
    <Stack
      spacing={0.25}
      sx={{ borderLeft: `3px solid ${uiColors.warning}`, pl: 1.25 }}
    >
      <Typography
        variant="body2"
        fontWeight={700}
      >
        Ошибка снята: {removalLabel(item)}
      </Typography>
      {item.removed_comment ? (
        <Typography variant="body2">{item.removed_comment}</Typography>
      ) : null}
    </Stack>
  );
}

const removedCellSx = { color: "text.secondary", textDecoration: "line-through" };

function ErrorsTable({ errors, canRemove, onRemove }) {
  const withActions = errors.some((item) => canRemove?.(item));
  const columns = withActions ? 7 : 6;
  return (
    <JacoSurface
      variant="outlined"
      sx={{ overflow: "hidden" }}
    >
      <TableContainer>
        <Table
          size="small"
          aria-label="Ошибки жалобы"
          sx={{ "& td, & th": { px: 1, verticalAlign: "top" } }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Позиция</TableCell>
              <TableCell>Фотография</TableCell>
              <TableCell>Категория проблемы</TableCell>
              <TableCell>Проблема</TableCell>
              <TableCell>Решение</TableCell>
              <TableCell>Этап</TableCell>
              {withActions ? <TableCell /> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {errors.map((item) => {
              const removed = isRemovedError(item);
              const cellSx = removed ? removedCellSx : undefined;
              return (
                <Fragment key={item.id}>
                  <TableRow
                    sx={removed ? { backgroundColor: uiColors.warningSoft } : undefined}
                  >
                    <TableCell sx={cellSx}>{positionLabel(item)}</TableCell>
                    <TableCell>
                      <PhotoThumbnails
                        photos={item.photos || []}
                        size={40}
                        max={2}
                      />
                    </TableCell>
                    <TableCell sx={cellSx}>{item.category_name || "—"}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={cellSx}
                      >
                        {problemLabel(item)}
                      </Typography>
                      {item.comment ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.comment}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={cellSx}
                      >
                        {item.solution_name || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>{item.stage_name || "—"}</TableCell>
                    {withActions ? (
                      <TableCell
                        align="right"
                        sx={{ px: 0.5 }}
                      >
                        <RemoveButton
                          compact
                          item={item}
                          canRemove={canRemove}
                          onRemove={onRemove}
                        />
                      </TableCell>
                    ) : null}
                  </TableRow>
                  {removed ? (
                    <TableRow sx={{ backgroundColor: uiColors.warningSoft }}>
                      <TableCell colSpan={columns}>
                        <RemovedNote item={item} />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </JacoSurface>
  );
}

function ErrorsCards({ errors, canRemove, onRemove }) {
  return (
    <Stack spacing={1}>
      {errors.map((item) => {
        const removed = isRemovedError(item);
        return (
          <JacoSurface
            key={item.id}
            variant="outlined"
            sx={{
              p: 1.5,
              borderLeft: `4px solid ${removed ? uiColors.warning : uiColors.danger}`,
              ...(removed ? { backgroundColor: uiColors.warningSoft } : {}),
            }}
          >
            <Stack spacing={1.25}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 1,
                  ...(removed ? { "& .MuiTypography-body2": removedCellSx } : {}),
                }}
              >
                <DetailField
                  label="Позиция"
                  value={positionLabel(item)}
                  emphasized
                />
                {(item.photos || []).length ? (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Фотография
                    </Typography>
                    <PhotoThumbnails
                      photos={item.photos}
                      size={56}
                      max={5}
                    />
                  </Box>
                ) : null}
                <DetailField
                  label="Категория проблемы"
                  value={item.category_name}
                />
                <DetailField
                  label="Проблема"
                  value={problemLabel(item)}
                />
                <DetailField
                  label="Решение"
                  value={item.solution_name}
                />
                <DetailField
                  label="Этап"
                  value={item.stage_name}
                />
                {item.comment ? (
                  <DetailField
                    label="Комментарий к ошибке"
                    value={item.comment}
                  />
                ) : null}
              </Box>
              {removed ? <RemovedNote item={item} /> : null}
              <Box>
                <RemoveButton
                  item={item}
                  canRemove={canRemove}
                  onRemove={onRemove}
                />
              </Box>
            </Stack>
          </JacoSurface>
        );
      })}
    </Stack>
  );
}

export default function ComplaintErrors({ errors = [], canRemove, onRemove }) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("sm"));
  const removedCount = errors.filter(isRemovedError).length;
  const activeCount = errors.length - removedCount;
  return (
    <Stack spacing={1.25}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
        >
          Состав жалобы
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
        >
          <JacoStatusChip
            tone="neutral"
            variant="soft"
            label={formatPlural(activeCount, ["ошибка", "ошибки", "ошибок"])}
          />
          {removedCount ? (
            <JacoStatusChip
              tone="warning"
              variant="soft"
              label={`снято: ${removedCount}`}
            />
          ) : null}
        </Stack>
      </Stack>
      {compact ? (
        <ErrorsCards
          errors={errors}
          canRemove={canRemove}
          onRemove={onRemove}
        />
      ) : (
        <ErrorsTable
          errors={errors}
          canRemove={canRemove}
          onRemove={onRemove}
        />
      )}
    </Stack>
  );
}
