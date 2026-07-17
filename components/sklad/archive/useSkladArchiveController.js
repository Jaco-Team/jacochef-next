"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { MySelect } from "@/ui/Forms";

import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";

const ARCHIVE_ENTITY_OPTIONS = [
  { id: "recipe", name: "Рецепты" },
  { id: "semi_finished", name: "Полуфабрикаты" },
  { id: "site_item", name: "Товары сайта" },
];

function getArchiveRows(response) {
  if (Array.isArray(response?.list)) {
    return response.list;
  }

  if (Array.isArray(response?.rows)) {
    return response.rows;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function getEntityLabel(entityType) {
  return (
    ARCHIVE_ENTITY_OPTIONS.find((item) => item.id === entityType)?.name || entityType || "Сущность"
  );
}

function getRowName(row) {
  if (typeof row?.name === "string" && row.name.trim()) {
    return row.name.trim();
  }

  return "Без названия";
}

function getCategoryLabel(row) {
  if (typeof row?.category_name === "string" && row.category_name.trim()) {
    return row.category_name.trim();
  }

  if (Array.isArray(row?.categories)) {
    const names = row.categories
      .map((item) => (typeof item?.name === "string" ? item.name.trim() : ""))
      .filter(Boolean);

    if (names.length) {
      return names.join(", ");
    }
  }

  return "—";
}

function normalizeRows(entityType, response) {
  return getArchiveRows(response).map((row, index) => ({
    key: row?.id ?? `${entityType}-${index}`,
    id: row?.id ?? "—",
    name: getRowName(row),
    entityType: row?.entity_type || entityType,
    category: getCategoryLabel(row),
    isArchived: Number(row?.is_archived) === 1,
  }));
}

export default function useSkladArchiveController({ showAlert }) {
  const api = useSkladApi();
  const setShellState = useSkladStore((state) => state.setState);

  const [entityType, setEntityType] = useState("recipe");
  const [rows, setRows] = useState([]);

  const loadRows = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const response = await api.getArchiveList({ entity_type: entityType });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки архива");
      }

      setRows(normalizeRows(entityType, response));
    } catch (error) {
      setRows([]);
      showAlert(error?.message || "Ошибка загрузки архива", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, entityType, setShellState, showAlert]);

  const content = useMemo(() => {
    return (
      <Stack spacing={2}>
        <Paper sx={{ p: 2, borderRadius: 3, maxWidth: 280 }}>
          <MySelect
            label="Тип сущности"
            data={ARCHIVE_ENTITY_OPTIONS}
            is_none={false}
            value={entityType}
            func={(event) => setEntityType(event.target.value)}
          />
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography sx={{ fontWeight: 700 }}>Архив: {getEntityLabel(entityType)}</Typography>

            <Chip
              label={`Позиций: ${rows.length}`}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Alert
            severity="info"
            sx={{ mb: 2 }}
          >
            Таблица показывает только поддержанные archived entity families canonical API.
          </Alert>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 88 }}>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell sx={{ width: 180 }}>Категория</TableCell>
                  <TableCell sx={{ width: 140 }}>Статус</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.isArchived ? "Архив" : "Неизвестно"}
                          size="small"
                          color={row.isArchived ? "default" : "warning"}
                          variant={row.isArchived ? "filled" : "outlined"}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ py: 4 }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                      >
                        Архивных записей нет или backend вернул сокращенный payload без списка.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    );
  }, [entityType, rows]);

  return {
    entityType,
    loadRows,
    content,
  };
}
