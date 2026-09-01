"use client";

import { useCallback, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { useConfirm } from "@/src/hooks/useConfirm";
import { MyTextInput } from "@/ui/Forms";

import { useSkladStore } from "../useSkladStore";
import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { getDefaultUnitDraft, useSkladUnitsStore } from "./useSkladUnitsStore";
import SkladUnitDialog from "./SkladUnitDialog";

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeUnitDraft(draft) {
  return {
    id: draft?.id ?? null,
    name: String(draft?.name || "").trim(),
    con_id: normalizeNumber(draft?.con_id, 0),
    main_count: normalizeNumber(draft?.main_count, 1),
    con_count: normalizeNumber(draft?.con_count, 1),
  };
}

function getDeleteHint(row) {
  const activeCount = row?.delete_usage?.active_relations?.length || 0;
  const historyCount = row?.delete_usage?.history_relations?.length || 0;
  const parts = [];

  if (activeCount) {
    parts.push(`активные связи: ${activeCount}`);
  }

  if (historyCount) {
    parts.push(`история: ${historyCount}`);
  }

  return parts.length ? `Удаление заблокировано, ${parts.join(", ")}` : "Удаление заблокировано";
}

function buildSavePayload(draft) {
  const normalizedDraft = normalizeUnitDraft(draft);

  return {
    name: normalizedDraft.name,
    con_id: normalizedDraft.con_id,
    main_count: normalizedDraft.main_count,
    con_count: normalizedDraft.con_count,
  };
}

function formatUnitAmount(value) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 3,
  }).format(normalizeNumber(value, 0));
}

export default function useSkladUnitsController({ showAlert }) {
  const api = useSkladApi();
  const { ConfirmDialog, withConfirm } = useConfirm();
  const { canEdit, canDelete, canCreateUnit, canViewUnitUsage } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);
  const rows = useSkladUnitsStore((state) => state.rows);
  const search = useSkladUnitsStore((state) => state.search);
  const modal = useSkladUnitsStore((state) => state.modal);
  const draft = useSkladUnitsStore((state) => state.draft);
  const setState = useSkladUnitsStore((state) => state.setState);
  const setDraft = useSkladUnitsStore((state) => state.setDraft);
  const resetDraft = useSkladUnitsStore((state) => state.resetDraft);

  const isEditable = canEdit("units");
  const canCreate = canCreateUnit;
  const canShowUsage = canViewUnitUsage;
  const canDeleteAction = canDelete("unit");

  const loadUnits = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const response = await api.getUnits();

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки единиц измерения");
      }

      const list = response?.list || [];

      setState({ rows: list });
      setShellState({ units: list });
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки единиц измерения", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, setShellState, setState, showAlert]);

  const openCreate = useCallback(() => {
    if (!canCreate) {
      return;
    }

    setState({
      draft: getDefaultUnitDraft(),
      modal: {
        open: true,
        mode: "create",
      },
    });
  }, [canCreate, setState]);

  const openEdit = useCallback(
    (row) => {
      if (!isEditable) {
        return;
      }

      setState({
        draft: {
          id: row?.id ?? null,
          name: row?.name || "",
          con_id: row?.con_id ?? 0,
          main_count: row?.main_count ?? 1,
          con_count: row?.con_count ?? 1,
          delete_usage: row?.delete_usage ?? null,
        },
        modal: {
          open: true,
          mode: "edit",
        },
      });
    },
    [isEditable, setState],
  );

  const closeModal = useCallback(() => {
    resetDraft();
  }, [resetDraft]);

  const saveUnit = useCallback(async () => {
    const canSave = modal.mode === "create" ? canCreate : isEditable;

    if (!canSave) {
      showAlert("Недостаточно прав", false);
      return;
    }

    const normalizedDraft = normalizeUnitDraft(draft);

    if (!normalizedDraft.name) {
      showAlert("Заполните название единицы", false);
      return;
    }

    if (normalizedDraft.main_count <= 0 || normalizedDraft.con_count <= 0) {
      showAlert("Количество должно быть больше нуля", false);
      return;
    }

    setShellState({ isLoading: true });

    try {
      const payload = buildSavePayload(normalizedDraft);
      const response =
        modal.mode === "edit"
          ? await api.updateUnit({ id: normalizedDraft.id, ...payload })
          : await api.createUnit(payload);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка сохранения единицы");
      }

      closeModal();
      showAlert("Единица сохранена", true);
      await loadUnits();
    } catch (error) {
      showAlert(error?.message || "Ошибка сохранения единицы", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [
    api,
    canCreate,
    closeModal,
    draft,
    isEditable,
    loadUnits,
    modal.mode,
    setShellState,
    showAlert,
  ]);

  const deleteUnit = useCallback(
    async (row) => {
      if (!row?.id || !canDeleteAction) {
        return;
      }

      setShellState({ isLoading: true });

      try {
        const response = await api.deleteUnit(row.id);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка удаления единицы");
        }

        showAlert("Единица удалена", true);
        await loadUnits();
      } catch (error) {
        showAlert(error?.message || "Ошибка удаления единицы", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, canDeleteAction, loadUnits, setShellState, showAlert],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = [row?.name, row?.main_count, row?.con_count]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [rows, search]);

  const unitOptions = useMemo(() => {
    const baseOptions = [{ id: 0, name: "Без привязки" }];
    const currentId = draft?.id;
    const selectedId = normalizeNumber(draft?.con_id, 0);
    const selectedRelation = rows.find((row) => Number(row?.id) === selectedId);
    const nextOptions = rows
      .filter((row) => Number(row?.id) !== Number(currentId))
      .map((row) => ({
        id: row.id,
        name: row.name,
      }));

    if (selectedId && !nextOptions.some((option) => Number(option.id) === selectedId)) {
      nextOptions.unshift({
        id: selectedId,
        name: selectedRelation?.name || `Недоступная единица (${selectedId})`,
      });
    }

    return [...baseOptions, ...nextOptions];
  }, [draft?.id, rows]);

  const isSaveDisabled =
    !String(draft?.name || "").trim() ||
    normalizeNumber(draft?.main_count, 0) <= 0 ||
    normalizeNumber(draft?.con_count, 0) <= 0;

  const content = (
    <Paper
      sx={{
        width: "100%",
        maxWidth: 1080,
        mx: "auto",
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Единицы измерения
            </Typography>
            <Chip
              label={rows.length}
              size="small"
            />
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ whiteSpace: "nowrap", alignSelf: { xs: "flex-start", sm: "center" } }}
            onClick={openCreate}
            disabled={!canCreate}
          >
            Добавить единицу
          </Button>
        </Stack>

        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <MyTextInput
            label="Поиск"
            value={search}
            func={(event) => setState({ search: event.target.value })}
          />
        </Box>

        <TableContainer
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                px: { xs: 1, sm: 1.5 },
                py: 0.75,
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ width: "32%", fontWeight: 700 }}>Название</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Пересчёт</TableCell>
                <TableCell
                  align="right"
                  sx={{ width: 96, fontWeight: 700 }}
                >
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRows.map((row) => {
                const relationUnit = rows.find((item) => Number(item.id) === Number(row?.con_id));
                const deleteBlocked = row?.delete_state === "blocked";
                const deleteHint = deleteBlocked
                  ? getDeleteHint(row)
                  : isEditable && canDeleteAction
                    ? "Удалить"
                    : "Недостаточно прав для удаления";
                const isBaseUnit =
                  relationUnit &&
                  Number(row?.id) === Number(row?.con_id) &&
                  normalizeNumber(row?.main_count, 1) === normalizeNumber(row?.con_count, 1);
                const conversionLabel = !relationUnit
                  ? "Без привязки"
                  : isBaseUnit
                    ? "Базовая единица"
                    : `${formatUnitAmount(row?.main_count)} ${row?.name || ""} = ${formatUnitAmount(row?.con_count)} ${relationUnit?.name || ""}`;

                return (
                  <TableRow
                    key={row.id}
                    hover
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{row?.name || "—"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={isBaseUnit || !relationUnit ? "text.secondary" : "text.primary"}
                      >
                        {conversionLabel}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title={isEditable ? "Редактировать" : "Недостаточно прав"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openEdit(row)}
                              disabled={!isEditable}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canDeleteAction ? (
                          <Tooltip
                            title={
                              deleteBlocked
                                ? deleteHint
                                : isEditable
                                  ? "Удалить"
                                  : "Недостаточно прав для удаления"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={deleteBlocked || !isEditable}
                                onClick={withConfirm(
                                  () => deleteUnit(row),
                                  `Удалить единицу "${row?.name || ""}"?`,
                                )}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                  >
                    <Typography
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      Ничего не найдено
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <SkladUnitDialog
        open={modal.open}
        mode={modal.mode}
        draft={draft}
        unitOptions={unitOptions}
        onClose={closeModal}
        onFieldChange={(key, value) => setDraft({ [key]: value })}
        onSave={saveUnit}
        isSaveDisabled={isSaveDisabled}
        showUsage={canShowUsage}
      />

      <ConfirmDialog />
    </Paper>
  );

  return {
    loadUnits,
    content,
  };
}
