"use client";

import { useCallback, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
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

export default function useSkladUnitsController({ showAlert }) {
  const api = useSkladApi();
  const { ConfirmDialog, withConfirm } = useConfirm();
  const { canEdit, canDelete } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);
  const rows = useSkladUnitsStore((state) => state.rows);
  const search = useSkladUnitsStore((state) => state.search);
  const modal = useSkladUnitsStore((state) => state.modal);
  const draft = useSkladUnitsStore((state) => state.draft);
  const setState = useSkladUnitsStore((state) => state.setState);
  const setDraft = useSkladUnitsStore((state) => state.setDraft);
  const resetDraft = useSkladUnitsStore((state) => state.resetDraft);

  const isEditable = canEdit("ed_izmer");
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
    if (!isEditable) {
      return;
    }

    setState({
      draft: getDefaultUnitDraft(),
      modal: {
        open: true,
        mode: "create",
      },
    });
  }, [isEditable, setState]);

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
    if (!isEditable) {
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
  }, [api, closeModal, draft, isEditable, loadUnits, modal.mode, setShellState, showAlert]);

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
    const nextOptions = rows
      .filter((row) => Number(row?.id) !== Number(currentId))
      .map((row) => ({
        id: row.id,
        name: row.name,
      }));

    return [...baseOptions, ...nextOptions];
  }, [draft?.id, rows]);

  const isSaveDisabled =
    !String(draft?.name || "").trim() ||
    normalizeNumber(draft?.main_count, 0) <= 0 ||
    normalizeNumber(draft?.con_count, 0) <= 0;

  const content = (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ width: "100%" }}
          >
            <MyTextInput
              label="Поиск"
              value={search}
              func={(event) => setState({ search: event.target.value })}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              disabled={!isEditable}
            >
              Новая единица
            </Button>
          </Stack>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell align="right">Базовое количество</TableCell>
                <TableCell align="right">Количество в связке</TableCell>
                <TableCell>Базовая единица</TableCell>
                <TableCell align="right">Действия</TableCell>
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

                return (
                  <TableRow
                    key={row.id}
                    hover
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{row?.name || "—"}</Typography>
                    </TableCell>
                    <TableCell align="right">{row?.main_count ?? "—"}</TableCell>
                    <TableCell align="right">{row?.con_count ?? "—"}</TableCell>
                    <TableCell>{relationUnit?.name || "—"}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title={isEditable ? "Редактировать" : "Недостаточно прав"}>
                          <span>
                            <IconButton
                              onClick={() => openEdit(row)}
                              disabled={!isEditable}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            deleteBlocked
                              ? deleteHint
                              : isEditable && canDeleteAction
                                ? "Удалить"
                                : "Недостаточно прав для удаления"
                          }
                        >
                          <span>
                            <IconButton
                              color="error"
                              disabled={deleteBlocked || !isEditable || !canDeleteAction}
                              onClick={withConfirm(
                                () => deleteUnit(row),
                                `Удалить единицу "${row?.name || ""}"?`,
                              )}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                  >
                    <Typography color="text.secondary">Ничего не найдено</Typography>
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
      />

      <ConfirmDialog />
    </Paper>
  );

  return {
    loadUnits,
    content,
  };
}
