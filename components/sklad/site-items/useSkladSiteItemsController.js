"use client";

import { useCallback, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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

import { MySelect, MyTextInput } from "@/ui/Forms";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import SkladSiteItemEditorDialog from "./SkladSiteItemEditorDialog";
import { useSkladStore } from "../useSkladStore";
import SkladSiteItemViewDialog from "./SkladSiteItemViewDialog";
import { SITE_ITEMS_ARCHIVE_MODE_OPTIONS, useSkladSiteItemsStore } from "./useSkladSiteItemsStore";

function formatDateRange(row) {
  if (!row?.date_start && !row?.date_end) {
    return "-";
  }

  return `${row?.date_start || "..."} - ${row?.date_end || "..."}`;
}

function formatBju(row) {
  const parts = [
    row?.protein !== undefined && row?.protein !== null && row?.protein !== ""
      ? `Б: ${row.protein}`
      : null,
    row?.fat !== undefined && row?.fat !== null && row?.fat !== "" ? `Ж: ${row.fat}` : null,
    row?.carbohydrates !== undefined && row?.carbohydrates !== null && row?.carbohydrates !== ""
      ? `У: ${row.carbohydrates}`
      : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" / ") : "-";
}

function getCategoryName(row, categories) {
  const categoryId = row?.category_id ?? row?.category?.id ?? null;
  const directName =
    row?.category_name || row?.category?.name || row?.cat_name || row?.category_title || "";

  if (directName) {
    return directName;
  }

  if (categoryId === null || categoryId === undefined || categoryId === "") {
    return "-";
  }

  const matched = categories.find((item) => String(item?.id) === String(categoryId));
  return matched?.name || String(categoryId);
}

function getTagNames(row, tags) {
  if (Array.isArray(row?.tags) && row.tags.length) {
    return row.tags.map((item) => item?.name).filter(Boolean);
  }

  if (Array.isArray(row?.tag_ids) && row.tag_ids.length) {
    return row.tag_ids
      .map((tagId) => tags.find((item) => String(item?.id) === String(tagId))?.name || "")
      .filter(Boolean);
  }

  return [];
}

function getStatusChips(row) {
  const chips = [];
  const isVisible = row?.is_show ?? row?.is_active ?? 0;

  if (Number(row?.is_archived) === 1) {
    chips.push({ key: "archived", label: "Архив", color: "default" });
  }

  if (Number(isVisible) === 1) {
    chips.push({ key: "active", label: "Активен", color: "success" });
  }

  if (Number(row?.show_site) === 1) {
    chips.push({ key: "show_site", label: "Сайт", color: "primary" });
  }

  if (Number(row?.show_program) === 1) {
    chips.push({ key: "show_program", label: "Касса", color: "secondary" });
  }

  if (Number(row?.is_hit) === 1) {
    chips.push({ key: "hit", label: "Хит", color: "warning" });
  }

  if (Number(row?.is_new) === 1) {
    chips.push({ key: "new", label: "Новинка", color: "info" });
  }

  return chips;
}

function getArchiveModeLabel(value) {
  return SITE_ITEMS_ARCHIVE_MODE_OPTIONS.find((item) => item.id === value)?.name || "Активные";
}

function createEmptySiteItemRelations() {
  return {
    item_items: {
      this_items: [],
      all_items: [],
    },
    items_stage: {
      stage_1: [],
      stage_2: [],
      stage_3: [],
      all: [],
    },
    composition_source: {
      pf: [],
      recipes: [],
    },
    composition_derived: {
      pf_total: [],
    },
  };
}

export default function useSkladSiteItemsController({ showAlert }) {
  const api = useSkladApi();
  const { canEdit } = useSkladAccess();

  const setShellState = useSkladStore((state) => state.setState);

  const rows = useSkladSiteItemsStore((state) => state.rows);
  const categories = useSkladSiteItemsStore((state) => state.categories);
  const tags = useSkladSiteItemsStore((state) => state.tags);
  const search = useSkladSiteItemsStore((state) => state.search);
  const categoryId = useSkladSiteItemsStore((state) => state.categoryId);
  const tagId = useSkladSiteItemsStore((state) => state.tagId);
  const archiveMode = useSkladSiteItemsStore((state) => state.archiveMode);
  const modal = useSkladSiteItemsStore((state) => state.modal);
  const detail = useSkladSiteItemsStore((state) => state.detail);
  const draft = useSkladSiteItemsStore((state) => state.draft);
  const setState = useSkladSiteItemsStore((state) => state.setState);

  const isEditable = canEdit("site_items");
  const canOpenEditorWireframe = true;

  const loadRows = useCallback(async () => {
    setShellState({ isLoading: true });

    try {
      const response = await api.getSiteItems({
        search: String(search || "").trim(),
        category_id: categoryId ? Number(categoryId) : null,
        tag_id: tagId ? Number(tagId) : null,
        archive_mode: archiveMode,
      });

      if (!response?.st) {
        throw new Error(response?.text || "Ошибка загрузки товаров сайта");
      }

      setState({
        rows: response?.list || [],
        categories: response?.categories || [],
        tags: response?.tags || [],
      });
    } catch (error) {
      showAlert(error?.message || "Ошибка загрузки товаров сайта", false);
    } finally {
      setShellState({ isLoading: false });
    }
  }, [api, archiveMode, categoryId, search, setShellState, setState, showAlert, tagId]);

  const categoryOptions = useMemo(() => {
    return [{ id: "", name: "Все категории" }].concat(
      (categories || []).map((item) => ({
        id: String(item?.id ?? ""),
        name: item?.name || String(item?.id || ""),
      })),
    );
  }, [categories]);

  const tagOptions = useMemo(() => {
    return [{ id: "", name: "Все теги" }].concat(
      (tags || []).map((item) => ({
        id: String(item?.id ?? ""),
        name: item?.name || String(item?.id || ""),
      })),
    );
  }, [tags]);

  const openNotImplemented = useCallback(
    (scopeLabel) => {
      showAlert(`${scopeLabel} для товаров сайта войдет в следующий production slice`, false);
    },
    [showAlert],
  );

  const closeModal = useCallback(() => {
    setState({
      modal: {
        open: false,
        mode: "view",
        loading: false,
        section: "tech",
      },
      detail: null,
      draft: null,
    });
  }, [setState]);

  const openCreate = useCallback(() => {
    const emptyRelations = createEmptySiteItemRelations();

    setState({
      modal: {
        open: true,
        mode: "create",
        loading: false,
        section: "tech",
      },
      detail: null,
      draft: {
        name: "",
        short_name: "",
        category_id: "",
        date_start: "",
        date_end: "",
        art: "",
        stol: "",
        count_part: "",
        weight: "",
        protein: "",
        fat: "",
        carbohydrates: "",
        kkal: "",
        kkal_preview: "",
        tmp_desc: "",
        marc_desc: "",
        marc_desc_full: "",
        tags: [],
        image: null,
        marking: {},
        ...emptyRelations,
      },
    });
  }, [setState]);

  const openEdit = useCallback(
    async (row) => {
      if (!row?.id) {
        return;
      }

      setState({
        modal: {
          open: true,
          mode: "edit",
          loading: true,
          section: "tech",
        },
        detail: null,
        draft: null,
      });
      setShellState({ isLoading: true });

      try {
        const response = await api.getSiteItem(row.id);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки товара");
        }

        const item = response?.item || {};
        const emptyRelations = createEmptySiteItemRelations();
        const normalizedDraft = {
          ...item,
          category_name:
            item?.category_name ||
            categories.find((category) => String(category?.id) === String(item?.category_id))
              ?.name ||
            "",
          tags: item?.tags || [],
          composition_source:
            item?.composition_source ||
            response?.composition_source ||
            emptyRelations.composition_source,
          composition_derived:
            item?.composition_derived ||
            response?.composition_derived ||
            emptyRelations.composition_derived,
          image: item?.image || response?.image || null,
          marking: item?.marking || response?.marking || {},
          item_items: response?.item_items || item?.item_items || emptyRelations.item_items,
          items_stage: response?.items_stage || item?.items_stage || emptyRelations.items_stage,
        };

        setState({
          modal: {
            open: true,
            mode: "edit",
            loading: false,
            section: "tech",
          },
          detail: normalizedDraft,
          draft: normalizedDraft,
        });
      } catch (error) {
        setState({
          modal: {
            open: false,
            mode: "view",
            loading: false,
            section: "tech",
          },
          detail: null,
          draft: null,
        });
        showAlert(error?.message || "Ошибка загрузки товара", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, categories, setShellState, setState, showAlert],
  );

  const openView = useCallback(
    async (row, section = "tech") => {
      if (!row?.id) {
        return;
      }

      setState({
        modal: {
          open: true,
          mode: "view",
          loading: true,
          section,
        },
        detail: null,
      });
      setShellState({ isLoading: true });

      try {
        const response = await api.getSiteItem(row.id);

        if (!response?.st) {
          throw new Error(response?.text || "Ошибка загрузки товара");
        }

        const item = response?.item || {};
        const emptyRelations = createEmptySiteItemRelations();

        setState({
          modal: {
            open: true,
            mode: "view",
            loading: false,
            section,
          },
          detail: {
            ...item,
            category_name:
              item?.category_name ||
              categories.find((category) => String(category?.id) === String(item?.category_id))
                ?.name ||
              "",
            tags: item?.tags || [],
            composition_source:
              item?.composition_source ||
              response?.composition_source ||
              emptyRelations.composition_source,
            composition_derived:
              item?.composition_derived ||
              response?.composition_derived ||
              emptyRelations.composition_derived,
            allergens_derived: item?.allergens_derived || response?.allergens_derived || [],
            possible_allergens_derived:
              item?.possible_allergens_derived || response?.possible_allergens_derived || [],
            image: item?.image || response?.image || null,
            marking: item?.marking || response?.marking || {},
            can_delete:
              typeof response?.can_delete === "boolean"
                ? response.can_delete
                : (item?.can_delete ?? null),
            delete_usage: response?.delete_usage || item?.delete_usage || null,
            item_items: response?.item_items || item?.item_items || emptyRelations.item_items,
            items_stage: response?.items_stage || item?.items_stage || emptyRelations.items_stage,
          },
        });
      } catch (error) {
        setState({
          modal: {
            open: false,
            mode: "view",
            loading: false,
            section: "tech",
          },
          detail: null,
        });
        showAlert(error?.message || "Ошибка загрузки товара", false);
      } finally {
        setShellState({ isLoading: false });
      }
    },
    [api, categories, setShellState, setState, showAlert],
  );

  const content = (
    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
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
              placeholder="Название или короткое название"
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
              label="Тег"
              data={tagOptions}
              is_none={false}
              value={tagId}
              func={(event) => setState({ tagId: event.target.value })}
            />

            <MySelect
              label="Показать"
              data={SITE_ITEMS_ARCHIVE_MODE_OPTIONS}
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
              disabled={!canOpenEditorWireframe}
              onClick={openCreate}
            >
              Добавить товар
            </Button>
          </Stack>
        </Stack>

        <Alert
          severity="info"
          sx={{ borderRadius: 2 }}
        >
          Текущий экран уже закрывает list, detail tabs и editor wireframe. Delete и save остаются
          staged до следующего backend pass.
        </Alert>

        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 3 }}
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
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Режим выборки
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{getArchiveModeLabel(archiveMode)}</Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Найдено позиций
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>{rows.length}</Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Активные фильтры
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {[search, categoryId, tagId].filter(Boolean).length || "Нет"}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0, flex: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Следующий шаг
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                После стабилизации API сюда без перелома UX подключатся edit, marking, image и
                delete flows
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>БЖУ</TableCell>
                <TableCell>Ккал</TableCell>
                <TableCell>Теги</TableCell>
                <TableCell>Действует</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => {
                const rowTagNames = getTagNames(row, tags);
                const statusChips = getStatusChips(row);

                return (
                  <TableRow
                    key={`site-item-${row?.id}`}
                    hover
                    onClick={() => openView(row)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {row?.short_name || "Без короткого названия"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{getCategoryName(row, categories)}</TableCell>
                    <TableCell>{formatBju(row)}</TableCell>
                    <TableCell>{row?.kkal_preview ?? row?.kkal ?? "-"}</TableCell>
                    <TableCell>{rowTagNames.length ? rowTagNames.join(", ") : "-"}</TableCell>
                    <TableCell>{formatDateRange(row)}</TableCell>

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
                              aria-label="Открыть карточку"
                              onClick={(event) => {
                                event.stopPropagation();
                                openView(row, "tech");
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            isEditable
                              ? "Открыть редактор"
                              : "Открыть read-only wireframe редактора"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Редактировать"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEdit(row);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть вкладку маркировки">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Маркировка"
                              onClick={(event) => {
                                event.stopPropagation();
                                openView(row, "marking");
                              }}
                            >
                              <LocalOfferOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть вкладку изображения">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Изображения"
                              onClick={(event) => {
                                event.stopPropagation();
                                openView(row, "image");
                              }}
                            >
                              <PhotoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Открыть вкладку истории">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="История"
                              onClick={(event) => {
                                event.stopPropagation();
                                openView(row, "history");
                              }}
                            >
                              <HistoryOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            isEditable
                              ? "Удаление будет подключено следующим шагом"
                              : "Недостаточно прав"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={!isEditable}
                              aria-label="Удалить"
                              onClick={(event) => {
                                event.stopPropagation();
                                openNotImplemented("Удаление");
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Stack
                      spacing={1.5}
                      sx={{ py: 2 }}
                    >
                      <Typography color="text.secondary">
                        Ничего не найдено. Измените фильтры или режим показа.
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                      >
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setState({
                              search: "",
                              categoryId: "",
                              tagId: "",
                              archiveMode: "active",
                            })
                          }
                        >
                          Сбросить фильтры
                        </Button>
                        <Button
                          variant="text"
                          onClick={loadRows}
                        >
                          Обновить список
                        </Button>
                      </Stack>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        <SkladSiteItemViewDialog
          open={modal.open && modal.mode === "view"}
          loading={modal.loading}
          section={modal.section}
          onSectionChange={(section) =>
            setState({
              modal: {
                ...modal,
                section,
              },
            })
          }
          detail={detail}
          onClose={closeModal}
        />

        <SkladSiteItemEditorDialog
          open={modal.open && (modal.mode === "edit" || modal.mode === "create")}
          mode={modal.mode}
          draft={draft}
          categories={categories}
          tags={tags}
          isEditable={isEditable}
          onClose={closeModal}
        />
      </Stack>
    </Paper>
  );

  return {
    search,
    categoryId,
    tagId,
    archiveMode,
    loadRows,
    content,
  };
}
