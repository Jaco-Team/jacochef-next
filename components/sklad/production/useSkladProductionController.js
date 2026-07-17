"use client";

import { useCallback, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import { MySelect, MyTextInput } from "@/ui/Forms";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
import { useSkladHistoryStore, HISTORY_INITIAL_STATE } from "../history/useSkladHistoryStore";
import { getVisibleSkladTabs } from "../skladTabs";
import SkladProductionConvertDialog from "./SkladProductionConvertDialog";
import SkladProductionEditorDialog from "./SkladProductionEditorDialog";
import SkladProductionViewDialog from "./SkladProductionViewDialog";
import {
  PRODUCTION_ARCHIVE_MODE_OPTIONS,
  PRODUCTION_ENTITY_OPTIONS,
  useSkladProductionStore,
} from "./useSkladProductionStore";

function getEntityAccessKey(entityType) {
  return entityType === "recipe" ? "recipes" : "semi_finished";
}

function getEntityLabel(entityType) {
  return entityType === "recipe" ? "Рецепт" : "Полуфабрикат";
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

function formatCategories(categories) {
  if (!Array.isArray(categories) || !categories.length) {
    return "-";
  }

  const names = categories
    .map((item) => item?.name || item?.title || item?.label || "")
    .filter(Boolean);

  return names.length ? names.join(", ") : "-";
}

function getStatusChips(row) {
  const chips = [];

  if (Number(row?.is_archived) === 1) {
    chips.push({ key: "archived", label: "Архив", color: "default" });
  }

  if (Number(row?.is_active) === 1) {
    chips.push({ key: "active", label: "Активен", color: "success" });
  }

  if (Number(row?.show_in_rev) === 1) {
    chips.push({ key: "show_in_rev", label: "В ревизии", color: "primary" });
  }

  if (Number(row?.two_user) === 1) {
    chips.push({ key: "two_user", label: "2 сотрудника", color: "secondary" });
  }

  return chips;
}

export default function useSkladProductionController({ showAlert }) {
  const api = useSkladApi();
  const { canEdit, canExecute } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);
  const shellSections = useSkladStore((state) => state.sections);
  const shellAccess = useSkladStore((state) => state.access);
  const categories = useSkladStore((state) => state.categories);
  const setHistoryState = useSkladHistoryStore((state) => state.setState);

  const entityType = useSkladProductionStore((state) => state.entityType);
  const rows = useSkladProductionStore((state) => state.rows);
  const search = useSkladProductionStore((state) => state.search);
  const categoryId = useSkladProductionStore((state) => state.categoryId);
  const archiveMode = useSkladProductionStore((state) => state.archiveMode);
  const modal = useSkladProductionStore((state) => state.modal);
  const detail = useSkladProductionStore((state) => state.detail);
  const draft = useSkladProductionStore((state) => state.draft);
  const setState = useSkladProductionStore((state) => state.setState);

  const accessKey = getEntityAccessKey(entityType);
  const canCreateOrEdit = canEdit(accessKey);
  const canConvert = canExecute("recipes") || canExecute("semi_finished");

  const categoryOptions = useMemo(() => {
    const sourceAwareCategories = (categories || []).filter(
      (item) => item?.source_type === "semi_finished" && Number(item?.is_archived) !== 1,
    );

    return [{ id: "", name: "Все категории" }].concat(
      sourceAwareCategories.map((item) => ({
        id: String(item.id),
        name: item.name,
      })),
    );
  }, [categories]);

  const loadRows = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const payload = {
        search: String(search || "").trim(),
        category_id: categoryId ? Number(categoryId) : null,
        archive_mode: archiveMode,
      };

      const response =
        entityType === "recipe"
          ? await api.getRecipes(payload)
          : await api.getSemiFinished(payload);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки списка");
      }

      setState({ rows: response?.list || [] });
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки списка", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, archiveMode, categoryId, entityType, search, setShellState, setState, showAlert]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((left, right) =>
      String(left?.name || "").localeCompare(String(right?.name || ""), "ru"),
    );
  }, [rows]);

  const openNotImplemented = useCallback(
    (scopeLabel) => {
      showAlert(`${scopeLabel} войдет в следующий production slice`, false);
    },
    [showAlert],
  );

  const openHistoryTab = useCallback(
    (row) => {
      if (!row?.id) {
        showAlert("Не удалось определить сущность для открытия истории", false);
        return;
      }

      const visibleTabs = getVisibleSkladTabs({
        sections: shellSections,
        access: shellAccess,
      });
      const historyTabIndex = visibleTabs.findIndex((item) => item.key === "history");

      if (historyTabIndex === -1) {
        showAlert("Вкладка истории недоступна по текущим section/access", false);
        return;
      }

      setHistoryState({
        entityType,
        entityId: String(row.id),
        ...HISTORY_INITIAL_STATE,
      });
      setShellState({ tab: historyTabIndex });
    },
    [entityType, setHistoryState, setShellState, shellAccess, shellSections, showAlert],
  );

  const closeModal = useCallback(() => {
    setState({
      modal: {
        open: false,
        mode: "view",
        loading: false,
        tab: "main",
      },
      detail: null,
      draft: null,
    });
  }, [setState]);

  const loadEntityDetail = useCallback(
    async (row) => {
      if (!row?.id) {
        return null;
      }

      const response =
        entityType === "recipe"
          ? await api.getRecipe(row.id)
          : await api.getSemiFinishedOne(row.id);

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки карточки");
      }

      const entity = response?.entity || {};

      return {
        ...entity,
        unit_name:
          response?.units?.find((item) => String(item?.id) === String(entity?.ed_izmer_id))?.name ||
          "",
        units: response?.units || [],
        categories: entity?.categories || response?.categories || [],
        allergens: entity?.allergens || [],
        allergens_possible: entity?.allergens_possible || [],
        allergens_derived: entity?.allergens_derived || [],
        allergens_possible_derived: entity?.allergens_possible_derived || [],
        storages: entity?.storages || response?.all_storages || [],
        apps: entity?.apps || response?.apps || [],
        items: entity?.items || [],
      };
    },
    [api, entityType],
  );

  const openView = useCallback(
    async (row, tab = "main") => {
      setState({
        modal: {
          open: true,
          mode: "view",
          loading: true,
          tab,
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const entity = await loadEntityDetail(row);
        setState({
          modal: {
            open: true,
            mode: "view",
            loading: false,
            tab,
          },
          detail: entity,
        });
      } catch (error) {
        closeModal();
        showAlert(error?.message || "Ошибка загрузки карточки", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [closeModal, loadEntityDetail, setShellState, setState, showAlert],
  );

  const openEdit = useCallback(
    async (row) => {
      setState({
        modal: {
          open: true,
          mode: "edit",
          loading: true,
          tab: "main",
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const entity = await loadEntityDetail(row);
        setState({
          modal: {
            open: true,
            mode: "edit",
            loading: false,
            tab: "main",
          },
          detail: entity,
          draft: entity,
        });
      } catch (error) {
        closeModal();
        showAlert(error?.message || "Ошибка загрузки карточки", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [closeModal, loadEntityDetail, setShellState, setState, showAlert],
  );

  const openConvert = useCallback(
    async (row) => {
      setState({
        modal: {
          open: true,
          mode: "convert",
          loading: true,
          tab: "main",
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const entity = await loadEntityDetail(row);
        setState({
          modal: {
            open: true,
            mode: "convert",
            loading: false,
            tab: "main",
          },
          detail: entity,
        });
      } catch (error) {
        closeModal();
        showAlert(error?.message || "Ошибка загрузки карточки для конвертации", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [closeModal, loadEntityDetail, setShellState, setState, showAlert],
  );

  const content = (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={2}>
          <ToggleButtonGroup
            exclusive
            value={entityType}
            onChange={(_, value) => {
              if (!value) {
                return;
              }

              setState({
                entityType: value,
                rows: [],
                categoryId: "",
              });
            }}
            size="small"
            color="primary"
            sx={{ alignSelf: "flex-start", flexWrap: "wrap" }}
          >
            {PRODUCTION_ENTITY_OPTIONS.map((option) => (
              <ToggleButton
                key={option.id}
                value={option.id}
              >
                {option.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack
            direction={{ xs: "column", xl: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", xl: "center" }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ width: "100%" }}
            >
              <MyTextInput
                label="Поиск"
                placeholder={`Название ${getEntityLabel(entityType).toLowerCase()}а`}
                value={search}
                func={(event) => setState({ search: event.target.value })}
              />

              <MySelect
                label="Категория"
                data={categoryOptions}
                is_none={false}
                value={categoryId}
                func={(event) => setState({ categoryId: event.target.value })}
              />

              <MySelect
                label="Показать"
                data={PRODUCTION_ARCHIVE_MODE_OPTIONS}
                is_none={false}
                value={archiveMode}
                func={(event) => setState({ archiveMode: event.target.value })}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              justifyContent={{ xs: "flex-start", xl: "flex-end" }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canCreateOrEdit}
                onClick={() =>
                  openNotImplemented(`Создание ${getEntityLabel(entityType).toLowerCase()}`)
                }
              >
                Добавить {getEntityLabel(entityType).toLowerCase()}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Alert
          severity="info"
          sx={{ borderRadius: 2 }}
        >
          Этот slice уже закрывает общий list/filter contour, basic detail/editor wireframe и
          handoff в unified History tab для production family. Convert и write actions остаются
          staged.
        </Alert>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Категории</TableCell>
                <TableCell>Срок годности</TableCell>
                <TableCell>Период действия</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedRows.map((row) => {
                const canDelete = Boolean(row?.delete_usage?.can_delete);
                const statusChips = getStatusChips(row);

                return (
                  <TableRow
                    key={`${entityType}-${row?.id}`}
                    hover
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                    </TableCell>

                    <TableCell>{formatCategories(row?.categories)}</TableCell>
                    <TableCell>{row?.shelf_life || "-"}</TableCell>
                    <TableCell>
                      {row?.date_start || row?.date_end
                        ? `${row?.date_start || "..."} - ${row?.date_end || "..."}`
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {statusChips.length
                          ? statusChips.map((chip) => (
                              <Chip
                                key={chip.key}
                                label={chip.label}
                                size="small"
                                color={chip.color}
                                variant={chip.color === "default" ? "outlined" : "filled"}
                              />
                            ))
                          : "-"}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Открыть карточку">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Просмотр"
                              onClick={() => openView(row, "main")}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={canCreateOrEdit ? "Открыть редактор" : "Недостаточно прав"}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={!canCreateOrEdit}
                              aria-label="Редактировать"
                              onClick={() => openEdit(row)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            canConvert
                              ? "Открыть staged shell конвертации"
                              : "Недостаточно прав; доступен только staged shell без выполнения"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={!canConvert}
                              aria-label="Открыть staged shell конвертации"
                              onClick={() => openConvert(row)}
                            >
                              <SwapHorizIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть unified History tab">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Открыть историю"
                              onClick={() => openHistoryTab(row)}
                            >
                              <HistoryOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canDelete ? (
                          <Tooltip title="Удаление будет подключено следующим шагом">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={!canCreateOrEdit}
                                onClick={() => openNotImplemented("Удаление")}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title={getDeleteHint(row)}>
                            <span>
                              <IconButton
                                size="small"
                                disabled
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">
                      Ничего не найдено. Измените фильтры или режим показа.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );

  return {
    entityType,
    search,
    categoryId,
    archiveMode,
    loadRows,
    content: (
      <>
        {content}
        <SkladProductionViewDialog
          open={modal.open && modal.mode === "view"}
          loading={modal.loading}
          tab={modal.tab}
          onTabChange={(tab) =>
            setState({
              modal: {
                ...modal,
                tab,
              },
            })
          }
          detail={detail}
          entityLabel={getEntityLabel(entityType)}
          onClose={closeModal}
        />
        <SkladProductionEditorDialog
          open={modal.open && modal.mode === "edit"}
          loading={modal.loading}
          mode="edit"
          entityLabel={getEntityLabel(entityType)}
          draft={draft}
          categories={categories}
          units={draft?.units || detail?.units || []}
          isEditable={canCreateOrEdit}
          onClose={closeModal}
        />
        <SkladProductionConvertDialog
          open={modal.open && modal.mode === "convert"}
          detail={detail}
          entityType={entityType}
          canConvert={canConvert}
          onClose={closeModal}
        />
      </>
    ),
  };
}
