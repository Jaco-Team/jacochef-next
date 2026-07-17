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

import { MySelect, MyTextInput } from "@/ui/Forms";

import useSkladAccess from "../useSkladAccess";
import useSkladApi from "../useSkladApi";
import { useSkladStore } from "../useSkladStore";
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

  if (Number(row?.is_archived) === 1) {
    chips.push({ key: "archived", label: "Архив", color: "default" });
  }

  if (Number(row?.is_show) === 1) {
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

function canDeleteRow(row) {
  if (typeof row?.can_delete === "boolean") {
    return row.can_delete;
  }

  if (typeof row?.delete_state?.can_delete === "boolean") {
    return row.delete_state.can_delete;
  }

  if (typeof row?.delete_usage?.can_delete === "boolean") {
    return row.delete_usage.can_delete;
  }

  return false;
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
  const setState = useSkladSiteItemsStore((state) => state.setState);

  const isEditable = canEdit("site_items");

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
              disabled={!isEditable}
              onClick={() => openNotImplemented("Создание")}
            >
              Добавить товар
            </Button>
          </Stack>
        </Stack>

        <Alert
          severity="info"
          sx={{ borderRadius: 2 }}
        >
          Этот slice закрывает canonical list/filter contour для товаров сайта. Editor, marking,
          image и history flows будут подключены следующим шагом.
        </Alert>

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
                const canDelete = canDeleteRow(row);

                return (
                  <TableRow
                    key={`site-item-${row?.id}`}
                    hover
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
                        <Tooltip title="Просмотр будет подключен следующим шагом">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openNotImplemented("Просмотр")}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            isEditable
                              ? "Редактирование будет подключено следующим шагом"
                              : "Недостаточно прав"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={!isEditable}
                              onClick={() => openNotImplemented("Редактирование")}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Маркировка будет подключена следующим шагом">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openNotImplemented("Маркировка")}
                            >
                              <LocalOfferOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Изображения будут подключены следующим шагом">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openNotImplemented("Изображения")}
                            >
                              <PhotoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="История будет подключена следующим шагом">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openNotImplemented("История")}
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
                                disabled={!isEditable}
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

              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
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
    search,
    categoryId,
    tagId,
    archiveMode,
    loadRows,
    content,
  };
}
