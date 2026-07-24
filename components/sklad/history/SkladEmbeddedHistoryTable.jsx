"use client";

import {
  Alert,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { resolveSiteItemImageUrl } from "../site-items/siteItemImage";

function formatValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function getHistoryRows(history) {
  return Array.isArray(history?.rows) ? history.rows : [];
}

function getImageHistoryRows(imageHistory) {
  return Array.isArray(imageHistory?.rows) ? imageHistory.rows : [];
}

function resolveHistoryImageUrl(imageValue, fallbackAssetKey = "") {
  if (!imageValue) {
    return null;
  }

  if (typeof imageValue === "string") {
    return resolveSiteItemImageUrl({ asset_key: imageValue }, fallbackAssetKey);
  }

  return resolveSiteItemImageUrl(imageValue, fallbackAssetKey);
}

export function SkladEmbeddedHistoryTable({ history, emptyText = "История пока пуста." }) {
  const rows = getHistoryRows(history);

  if (!rows.length) {
    return (
      <Alert
        severity="info"
        sx={{ borderRadius: 2 }}
      >
        {emptyText}
      </Alert>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ревизия</TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>Пользователь</TableCell>
            <TableCell>Источник</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row?.history_id ?? row?.revision_key ?? index}`}>
              <TableCell>{formatValue(row?.revision_label ?? row?.revision_key)}</TableCell>
              <TableCell>{formatValue(row?.changed_at)}</TableCell>
              <TableCell>{formatValue(row?.changed_by)}</TableCell>
              <TableCell>{formatValue(row?.source)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function SkladEmbeddedImageHistoryTable({
  imageHistory,
  imageAssetKey = "",
  onRestoreImage,
  emptyText = "История изображения пока пуста.",
}) {
  const rows = getImageHistoryRows(imageHistory);

  if (!rows.length) {
    return (
      <Alert
        severity="info"
        sx={{ borderRadius: 2 }}
      >
        {emptyText}
      </Alert>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Дата</TableCell>
            <TableCell>Пользователь</TableCell>
            <TableCell>До</TableCell>
            <TableCell>После</TableCell>
            <TableCell align="right">Действие</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const beforeUrl = resolveHistoryImageUrl(row?.before_image, imageAssetKey);
            const afterUrl = resolveHistoryImageUrl(row?.after_image, imageAssetKey);

            return (
              <TableRow key={`${row?.history_id ?? row?.revision_key ?? index}`}>
                <TableCell>{formatValue(row?.changed_at)}</TableCell>
                <TableCell>{formatValue(row?.changed_by)}</TableCell>
                <TableCell>
                  {beforeUrl ? (
                    <img
                      src={beforeUrl}
                      alt="До изменения"
                      style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12 }}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {afterUrl ? (
                    <img
                      src={afterUrl}
                      alt="После изменения"
                      style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12 }}
                    />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell align="right">
                  {row?.can_restore ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onRestoreImage?.(row?.history_id)}
                    >
                      Восстановить
                    </Button>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      -
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
