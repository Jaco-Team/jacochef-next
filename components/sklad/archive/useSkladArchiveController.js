"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

import { MySelect } from "@/ui/Forms";

import SkladDeleteDialog from "../SkladDeleteDialog";
import useSkladApi from "../useSkladApi";
import useSkladAccess from "../useSkladAccess";
import { useSkladStore } from "../useSkladStore";
import { normalizeProductionDraft } from "../production/production.helpers";
import SkladProductionEditorDialog from "../production/SkladProductionEditorDialog";
import { normalizeSiteItemDraft } from "../site-items/siteItems.helpers";
import SkladSiteItemEditorDialog from "../site-items/SkladSiteItemEditorDialog";

const ARCHIVE_ENTITY_OPTIONS = [
  { id: "recipe", name: "Рецепты" },
  { id: "semi_finished", name: "Заготовки" },
  { id: "site_item", name: "Товары сайта" },
];

function getArchiveRows(response) {
  return Array.isArray(response?.list) ? response.list : [];
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
    key: [
      row?.entity_type || entityType,
      row?.id ?? "no-id",
      row?.date_start ?? "no-start",
      row?.date_end ?? "no-end",
      index,
    ].join("-"),
    id: row?.id ?? "—",
    name: getRowName(row),
    entityType: row?.entity_type || entityType,
    category: getCategoryLabel(row),
    isArchived: Number(row?.is_archived) === 1,
  }));
}

export default function useSkladArchiveController({ showAlert }) {
  const api = useSkladApi();
  const { canManageArchivedEntity, canView } = useSkladAccess();
  const setShellState = useSkladStore((state) => state.setState);
  const shellUnits = useSkladStore((state) => state.units);
  const shellCategories = useSkladStore((state) => state.categories);
  const shellAllergens = useSkladStore((state) => state.allergens);
  const shellStorages = useSkladStore((state) => state.storages);
  const shellApps = useSkladStore((state) => state.apps);

  const [entityType, setEntityType] = useState("recipe");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [detail, setDetail] = useState(null);
  const [restoreDialog, setRestoreDialog] = useState({
    open: false,
    loading: false,
    row: null,
  });
  const [modal, setModal] = useState({
    open: false,
    loading: false,
    entityType: "recipe",
    tab: "main",
    section: "main",
  });

  const loadRows = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const response = await api.getArchiveList({ entity_type: entityType });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки архива");
      }

      setRows(normalizeRows(entityType, response));
      setPage(0);
    } catch (error) {
      setRows([]);
      showAlert(error?.message || "Ошибка загрузки архива", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, entityType, setShellState, showAlert]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [page, rows, rowsPerPage]);

  const canRestore = canManageArchivedEntity(entityType);

  useEffect(() => {
    const maxPage = rows.length ? Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1) : 0;

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, rows.length, rowsPerPage]);

  const closeModal = useCallback(() => {
    setModal({
      open: false,
      loading: false,
      entityType: "recipe",
      tab: "main",
      section: "main",
    });
    setDetail(null);
  }, []);

  const closeRestoreDialog = useCallback(() => {
    setRestoreDialog({
      open: false,
      loading: false,
      row: null,
    });
  }, []);

  const loadArchiveDetail = useCallback(
    async (row) => {
      if (row.entityType === "recipe") {
        return api.getRecipe(row.id);
      }

      if (row.entityType === "semi_finished") {
        return api.getSemiFinishedOne(row.id);
      }

      if (row.entityType === "site_item") {
        return api.getSiteItem(row.id);
      }

      throw new Error("Неподдержанный тип сущности");
    },
    [api],
  );

  const openView = useCallback(
    async (row) => {
      if (!row?.id) {
        return;
      }

      setModal({
        open: true,
        loading: true,
        entityType: row.entityType,
        tab: "main",
        section: "main",
      });
      setDetail(null);
      setShellState({ isLoading: true });

      try {
        const response = await loadArchiveDetail(row);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки карточки");
        }

        setDetail(
          row.entityType === "site_item"
            ? normalizeSiteItemDraft(response, [])
            : normalizeProductionDraft(response?.entity || {}, response),
        );
        setModal({
          open: true,
          loading: false,
          entityType: row.entityType,
          tab: "main",
          section: "main",
        });
      } catch (error) {
        closeModal();
        showAlert(error?.message || "Ошибка загрузки карточки", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [closeModal, loadArchiveDetail, setShellState, showAlert],
  );

  const openRestoreDialog = useCallback(
    (row) => {
      if (!row?.id || !canManageArchivedEntity(row.entityType)) {
        return;
      }

      setRestoreDialog({
        open: true,
        loading: false,
        row,
      });
    },
    [canManageArchivedEntity],
  );

  const confirmRestore = useCallback(async () => {
    const row = restoreDialog?.row;

    if (!row?.id) {
      return;
    }

    setRestoreDialog({
      open: true,
      loading: true,
      row,
    });
    setShellState({ isLoading: true });

    try {
      const response = await api.archiveEntity({
        entity_type: row.entityType,
        id: row.id,
        value: 0,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка восстановления из архива");
      }

      closeRestoreDialog();
      showAlert(response?.text || "Успешно сохранено", true);
      await loadRows();
    } catch (error) {
      setRestoreDialog({
        open: true,
        loading: false,
        row,
      });
      showAlert(error?.message || "Ошибка восстановления из архива", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, closeRestoreDialog, loadRows, restoreDialog?.row, setShellState, showAlert]);

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

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, mb: 2 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              divider={
                <Divider
                  flexItem
                  orientation="vertical"
                  sx={{ display: { xs: "none", md: "block" } }}
                />
              }
            >
              <Stack
                spacing={0.5}
                sx={{ minWidth: 0, flex: 1 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Тип сущности
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{getEntityLabel(entityType)}</Typography>
              </Stack>
              <Stack
                spacing={0.5}
                sx={{ minWidth: 0, flex: 1 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Архивных записей
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{rows.length}</Typography>
              </Stack>
              <Stack
                spacing={0.5}
                sx={{ minWidth: 0, flex: 1 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Действия
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {canRestore ? "Просмотр и восстановление" : "Только просмотр"}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 88 }}>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell sx={{ width: 180 }}>Категория</TableCell>
                  <TableCell sx={{ width: 140 }}>Статус</TableCell>
                  <TableCell
                    align="right"
                    sx={{ width: 320 }}
                  >
                    Действия
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length ? (
                  paginatedRows.map((row) => (
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
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => openView(row)}
                          >
                            Открыть
                          </Button>
                          <Button
                            size="small"
                            color="inherit"
                            startIcon={<UnarchiveOutlinedIcon />}
                            onClick={() => openRestoreDialog(row)}
                            disabled={!canRestore}
                          >
                            Восстановить
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      sx={{ py: 4 }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                      >
                        Архивных записей по выбранному типу сейчас нет.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setPage(0);
              setRowsPerPage(Number(event.target.value) || 25);
            }}
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage="Строк на странице:"
          />
        </Paper>
      </Stack>
    );
  }, [canRestore, entityType, openRestoreDialog, openView, page, paginatedRows, rows, rowsPerPage]);

  return {
    entityType,
    loadRows,
    content: (
      <>
        {content}
        <SkladProductionEditorDialog
          open={
            modal.open && (modal.entityType === "recipe" || modal.entityType === "semi_finished")
          }
          loading={modal.loading}
          mode="edit"
          entityType={modal.entityType}
          entityLabel={getEntityLabel(modal.entityType)}
          draft={detail}
          units={detail?.units?.length ? detail.units : shellUnits}
          categories={detail?.ref_categories?.length ? detail.ref_categories : shellCategories}
          allergens={detail?.ref_allergens?.length ? detail.ref_allergens : shellAllergens}
          storages={detail?.all_storages?.length ? detail.all_storages : shellStorages}
          apps={detail?.ref_apps?.length ? detail.ref_apps : shellApps}
          allItemsList={detail?.all_items_list || []}
          isEditable={false}
          initialTab={modal.tab}
          onSubmit={() => {}}
          onClose={closeModal}
        />
        <SkladSiteItemEditorDialog
          open={modal.open && modal.entityType === "site_item"}
          mode="edit"
          loading={modal.loading}
          draft={detail}
          categories={[]}
          tags={[]}
          isEditable={false}
          initialTab={modal.section}
          onSubmit={() => {}}
          onCreateTag={() => null}
          onRenameTag={() => null}
          showAlert={showAlert}
          onClose={closeModal}
        />
        <SkladDeleteDialog
          open={restoreDialog.open}
          loading={restoreDialog.loading}
          title="Вернуть запись из архива?"
          description={`Запись "${restoreDialog?.row?.name || ""}" снова станет активной.`}
          warning="Запись снова появится в активном списке и отразится в истории."
          confirmLabel="Восстановить"
          onClose={closeRestoreDialog}
          onConfirm={confirmRestore}
        />
      </>
    ),
  };
}
