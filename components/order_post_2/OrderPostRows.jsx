"use client";

import { Fragment, memo } from "react";
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { JacoStatusChip, uiColors, uiTableColors, uiTypography } from "@/design-system/shared/ui";
import {
  KIND_COPY,
  buildStatusCounts,
  formatDate,
  formatDateTime,
  getStatusChipProps,
  hasEmailChanged,
} from "./orderPostUtils";

const headCellSx = {
  ...uiTypography.label,
  color: uiColors.textMuted,
  fontWeight: 500,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${uiColors.border}`,
};

const bodyCellSx = {
  ...uiTypography.label,
  color: uiColors.textStrong,
  verticalAlign: "top",
  borderBottom: `1px solid ${uiColors.borderLight}`,
};

const mutedSx = {
  ...uiTypography.compactLabel,
  color: uiColors.textMuted,
};

const ellipsisSx = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-word",
};

const ERROR_STATUSES = new Set([3, 4, 5]);

function LogRow({ row, showVendor, onSelect }) {
  const statusProps = getStatusChipProps(row.status);
  const isErrorStatus = ERROR_STATUSES.has(Number(row.status));

  return (
    <TableRow
      hover
      tabIndex={0}
      onClick={() => onSelect(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onSelect(row);
        }
      }}
      sx={{ cursor: "pointer", "&:hover": { backgroundColor: uiTableColors.rowHover } }}
    >
      <TableCell sx={bodyCellSx}>
        <Typography sx={{ ...uiTypography.label, whiteSpace: "nowrap" }}>
          {formatDate(row.task_date)}
        </Typography>
        <Typography sx={mutedSx}>
          №{row.task_id} · {Number(row.task_status) === 1 ? "завершена" : "открыта"}
        </Typography>
      </TableCell>
      <TableCell sx={bodyCellSx}>{row.point_name || "—"}</TableCell>
      {showVendor ? <TableCell sx={bodyCellSx}>{row.vendor_name || "—"}</TableCell> : null}
      <TableCell sx={bodyCellSx}>
        <Stack
          direction="row"
          spacing={0.5}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <JacoStatusChip
            label={row.kind_name || row.kind}
            tone={row.kind === KIND_COPY ? "neutral" : "success"}
            variant="outlined"
          />
          {row.is_test ? (
            <JacoStatusChip
              label="Тест"
              tone="warning"
              variant="soft"
            />
          ) : null}
        </Stack>
      </TableCell>
      <TableCell sx={{ ...bodyCellSx, wordBreak: "break-all" }}>
        <Typography sx={uiTypography.label}>{row.email_sent || "—"}</Typography>
        {hasEmailChanged(row) ? (
          <Typography sx={mutedSx}>исходный: {row.email_original}</Typography>
        ) : null}
      </TableCell>
      <TableCell sx={bodyCellSx}>
        <JacoStatusChip
          label={row.status_name}
          {...statusProps}
        />
        {Number(row.attempts) > 0 ? (
          <Typography sx={mutedSx}>Попыток: {row.attempts}</Typography>
        ) : null}
        {row.next_try_at ? (
          <Typography sx={mutedSx}>Повтор: {formatDateTime(row.next_try_at)}</Typography>
        ) : null}
      </TableCell>
      <TableCell sx={{ ...bodyCellSx, whiteSpace: "nowrap" }}>
        <Typography sx={uiTypography.label}>{formatDateTime(row.sent_at)}</Typography>
        <Typography sx={mutedSx}>создано {formatDateTime(row.created_at)}</Typography>
      </TableCell>
      <TableCell sx={{ ...bodyCellSx, minWidth: 220, maxWidth: 360 }}>
        {row.subject ? (
          <Typography
            title={row.subject}
            sx={{ ...uiTypography.label, ...ellipsisSx }}
          >
            {row.subject}
          </Typography>
        ) : null}
        {row.error ? (
          <Typography
            title={row.error}
            sx={{
              ...uiTypography.compactLabel,
              ...ellipsisSx,
              color: isErrorStatus ? uiColors.dangerHover : uiColors.textMuted,
            }}
          >
            {row.error}
          </Typography>
        ) : null}
        {row.message_id ? <Typography sx={mutedSx}>ID: {row.message_id}</Typography> : null}
      </TableCell>
    </TableRow>
  );
}

function GroupHeaderRow({ group, statuses, isExpanded, onToggle, colSpan }) {
  const counts = buildStatusCounts(group.rows, statuses).filter((status) => status.count > 0);

  return (
    <TableRow
      hover
      onClick={onToggle}
      sx={{
        cursor: "pointer",
        backgroundColor: uiColors.surfaceMuted,
        "&:hover": { backgroundColor: uiColors.surfaceMuted },
      }}
    >
      <TableCell
        colSpan={colSpan}
        sx={{ ...bodyCellSx, py: 1 }}
      >
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <IconButton
            size="small"
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
            aria-expanded={isExpanded}
            sx={{ p: 0.25 }}
          >
            {isExpanded ? <KeyboardArrowDownRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
          </IconButton>
          <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
            {group.vendor_name || `Поставщик №${group.vendor_id}`}
          </Typography>
          <JacoStatusChip
            label={group.rows.length}
            tone="neutral"
            variant="outlined"
            sx={{ minWidth: 28 }}
          />
          {counts.map((status) => (
            <JacoStatusChip
              key={status.id}
              label={`${status.name}: ${status.count}`}
              {...getStatusChipProps(status.id)}
              variant="soft"
            />
          ))}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function OrderPostRows({ rows, groups, statuses, collapsedKeys, onToggleGroup, onSelectRow }) {
  const isGrouped = Array.isArray(groups);
  const columnsCount = isGrouped ? 7 : 8;

  return (
    <TableContainer>
      <Table
        size="small"
        sx={{ minWidth: 960 }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={headCellSx}>Задача</TableCell>
            <TableCell sx={headCellSx}>Точка</TableCell>
            {isGrouped ? null : <TableCell sx={headCellSx}>Поставщик</TableCell>}
            <TableCell sx={headCellSx}>Тип</TableCell>
            <TableCell sx={headCellSx}>Email</TableCell>
            <TableCell sx={headCellSx}>Статус</TableCell>
            <TableCell sx={headCellSx}>Отправлено</TableCell>
            <TableCell sx={headCellSx}>Тема / ошибка</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isGrouped
            ? groups.map((group) => {
                const isExpanded = !collapsedKeys.has(group.key);

                return (
                  <Fragment key={group.key}>
                    <GroupHeaderRow
                      group={group}
                      statuses={statuses}
                      isExpanded={isExpanded}
                      onToggle={() => onToggleGroup(group.key)}
                      colSpan={columnsCount}
                    />
                    {isExpanded
                      ? group.rows.map((row) => (
                          <LogRow
                            key={row.id}
                            row={row}
                            showVendor={false}
                            onSelect={onSelectRow}
                          />
                        ))
                      : null}
                  </Fragment>
                );
              })
            : rows.map((row) => (
                <LogRow
                  key={row.id}
                  row={row}
                  showVendor
                  onSelect={onSelectRow}
                />
              ))}
        </TableBody>
      </Table>
      {(isGrouped ? groups.length : rows.length) === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography sx={{ ...uiTypography.body, color: uiColors.textMuted }}>
            Нет писем за выбранный период
          </Typography>
        </Box>
      ) : null}
    </TableContainer>
  );
}

export default memo(OrderPostRows);
