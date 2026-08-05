"use client";

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import {
  Button,
  Box,
  Chip,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import { MySearchInput, MySelect } from "@/ui/Forms";
import MyModal from "@/ui/MyModal";

import SkladDeleteDialog from "../SkladDeleteDialog";
import SkladSiteItemEditorDialog from "./SkladSiteItemEditorDialog";
import SkladSortableHeader from "../table/SkladSortableHeader";
import { formatDateRU } from "../formatDateRangeRU";
import {
  formatBju,
  getCategoryName,
  getDeleteTooltip,
  getPrimaryStatusChip,
  getSecondaryStatusChips,
  getTagNames,
} from "./siteItems.helpers";
import { SITE_ITEMS_ARCHIVE_MODE_OPTIONS } from "./useSkladSiteItemsStore";
import { resolveSiteItemImagePreviewUrl } from "./siteItemImage";

export default function SkladSiteItemsContent({
  search,
  categoryId,
  tagId,
  archiveMode,
  categoryOptions,
  tagOptions,
  rows,
  paginatedRows,
  sortBy,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  modal,
  detail,
  draft,
  categories,
  tags,
  deleteDialog,
  archiveDialog,
  isEditable,
  canCreate,
  canArchiveAction,
  canDeleteAction,
  showAlert,
  setState,
  loadRows,
  openCreate,
  openEdit,
  handleRestoreImage,
  openArchiveDialog,
  openDeleteDialog,
  closeModal,
  closeDeleteDialog,
  closeArchiveDialog,
  confirmDelete,
  confirmArchive,
  handleUploadImage,
  handleSyncVk,
  handleCreateTag,
  handleRenameTag,
  submitDraft,
}) {
  const [imagePreviewRow, setImagePreviewRow] = useState(null);
  return (
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
            <MySearchInput
              label="Поиск"
              placeholder="Название или короткое название"
              value={search}
              onValueChange={(nextValue) => setState({ search: nextValue, page: 0 })}
            />

            <MySelect
              label="Категория"
              data={categoryOptions}
              is_none={false}
              value={categoryId === "none" ? "" : categoryId}
              func={(event) =>
                setState({
                  categoryId: event.target.value === "none" ? "" : event.target.value,
                  page: 0,
                })
              }
            />

            <MySelect
              label="Тег"
              data={tagOptions}
              is_none={false}
              value={tagId === "none" ? "" : tagId}
              func={(event) =>
                setState({
                  tagId: event.target.value === "none" ? "" : event.target.value,
                  page: 0,
                })
              }
            />

            <MySelect
              label="Показать"
              data={SITE_ITEMS_ARCHIVE_MODE_OPTIONS}
              is_none={false}
              value={archiveMode}
              func={(event) => setState({ archiveMode: event.target.value, page: 0 })}
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
              sx={{ whiteSpace: "nowrap" }}
              disabled={!canCreate}
              onClick={openCreate}
            >
              Добавить
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ maxHeight: "50dvh", overflow: "auto" }}>
          <Table
            size="small"
            stickyHeader
            sx={{
              "& th": {
                whiteSpace: "nowrap",
                fontWeight: 700,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <SkladSortableHeader
                  sortKey="name"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                >
                  Название
                </SkladSortableHeader>
                <SkladSortableHeader
                  sortKey="category"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                >
                  Категория
                </SkladSortableHeader>
                <TableCell sx={{ width: 128 }}>Б/Ж/У</TableCell>
                <SkladSortableHeader
                  sortKey="kkal"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  sx={{ width: 84 }}
                >
                  Ккал
                </SkladSortableHeader>
                <TableCell sx={{ minWidth: 180 }}>Теги</TableCell>
                <SkladSortableHeader
                  sortKey="dateStart"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                >
                  Действует с
                </SkladSortableHeader>
                <SkladSortableHeader
                  sortKey="dateEnd"
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                >
                  Действует до
                </SkladSortableHeader>
                <TableCell sx={{ minWidth: 240 }}>Статус</TableCell>
                <TableCell
                  align="right"
                  sx={{ width: 248 }}
                >
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((row) => {
                const rowTagNames = getTagNames(row);
                const primaryStatusChip = getPrimaryStatusChip(row);
                const secondaryStatusChips = getSecondaryStatusChips(row);
                const hasImage = Boolean(
                  row?.img_app ||
                  row?.image?.asset_key ||
                  row?.image?.current_fields?.img_app ||
                  row?.image?.variants?.webp?.url ||
                  row?.image?.variants?.jpg?.url,
                );

                return (
                  <TableRow
                    key={`site-item-${row?.id}`}
                    hover
                    onClick={() => openEdit(row, "main")}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                        {row?.short_name ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {row.short_name}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>

                    <TableCell>{getCategoryName(row, categories)}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 12, lineHeight: 1.35, fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatBju(row)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {row?.kkal_preview ?? row?.kkal ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color={rowTagNames.length ? "text.primary" : "text.secondary"}
                        sx={{ fontSize: 12, lineHeight: 1.35 }}
                      >
                        {rowTagNames.length ? rowTagNames.join(", ") : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateRU(row?.date_start) || "—"}</TableCell>
                    <TableCell>{formatDateRU(row?.date_end) || "—"}</TableCell>

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="center"
                      >
                        <Chip
                          key={primaryStatusChip.key}
                          label={primaryStatusChip.label}
                          size="small"
                          color={primaryStatusChip.color}
                          variant={primaryStatusChip.color === "default" ? "outlined" : "filled"}
                        />
                        {secondaryStatusChips.map((chip) => (
                          <Chip
                            key={chip.key}
                            label={chip.label}
                            size="small"
                            color={chip.color}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title={isEditable ? "Открыть редактор" : "Открыть карточку"}>
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Редактировать"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEdit(row, "main");
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={hasImage ? "Открыть изображение" : "Изображение отсутствует"}
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={!hasImage}
                              aria-label="Изображения"
                              onClick={(event) => {
                                event.stopPropagation();
                                setImagePreviewRow(row);
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
                                openEdit(row, "history");
                              }}
                            >
                              <HistoryOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {canArchiveAction ? (
                          <Tooltip
                            title={Number(row?.is_archived) === 1 ? "Вернуть из архива" : "В архив"}
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={!isEditable}
                                aria-label="Архив"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openArchiveDialog(row);
                                }}
                              >
                                {Number(row?.is_archived) === 1 ? (
                                  <UnarchiveOutlinedIcon fontSize="small" />
                                ) : (
                                  <ArchiveOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : null}

                        <Tooltip title={getDeleteTooltip(row, isEditable, canDeleteAction)}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={
                                !isEditable || !canDeleteAction || row?.can_delete === false
                              }
                              aria-label="Удалить"
                              onClick={(event) => {
                                event.stopPropagation();
                                openDeleteDialog(row);
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
                  <TableCell colSpan={9}>
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
                              page: 0,
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
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, nextPage) => setState({ page: nextPage })}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) =>
            setState({
              page: 0,
              rowsPerPage: Number(event.target.value) || 25,
            })
          }
          rowsPerPageOptions={[25, 50, 100]}
          labelRowsPerPage="Строк на странице:"
        />

        <SkladSiteItemEditorDialog
          open={modal.open}
          mode={modal.mode}
          draft={draft}
          categories={categories}
          tags={tags}
          loading={modal.loading}
          isEditable={modal.mode === "create" ? canCreate : isEditable}
          canArchiveAction={canArchiveAction}
          initialTab={modal.section}
          onUploadImage={(file) => handleUploadImage(draft, file, modal.section || "main")}
          onRestoreImage={(historyId) =>
            draft?.id ? handleRestoreImage(draft, historyId, "history") : null
          }
          onSubmit={submitDraft}
          onCreateTag={handleCreateTag}
          onRenameTag={handleRenameTag}
          onArchive={openArchiveDialog}
          showAlert={showAlert}
          onClose={closeModal}
        />
        <MyModal
          open={Boolean(imagePreviewRow)}
          onClose={() => setImagePreviewRow(null)}
          maxWidth="lg"
          title={imagePreviewRow?.name || "Изображение"}
        >
          <DialogContent dividers>
            {imagePreviewRow ? (
              <Box
                component="img"
                src={resolveSiteItemImagePreviewUrl(imagePreviewRow.image, imagePreviewRow.img_app)}
                alt={imagePreviewRow.name || "Изображение товара"}
                sx={{
                  width: "100%",
                  maxHeight: "75dvh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : null}
          </DialogContent>
        </MyModal>
        <SkladDeleteDialog
          open={deleteDialog.open}
          loading={deleteDialog.loading}
          title="Удалить товар сайта?"
          description={`Запись "${deleteDialog?.row?.name || ""}" будет удалена без возможности восстановления.`}
          warning="Если товар уже использовался, удаление будет недоступно."
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
        <SkladDeleteDialog
          open={archiveDialog.open}
          loading={archiveDialog.loading}
          title={
            Number(archiveDialog?.row?.is_archived) === 1
              ? "Вернуть товар сайта из архива?"
              : "Отправить товар сайта в архив?"
          }
          description={`Запись "${archiveDialog?.row?.name || ""}" будет ${
            Number(archiveDialog?.row?.is_archived) === 1
              ? "снова показана в активных списках"
              : "убрана из активных списков"
          }.`}
          warning="Изменение будет отражено в истории."
          confirmLabel={Number(archiveDialog?.row?.is_archived) === 1 ? "Вернуть" : "В архив"}
          onClose={closeArchiveDialog}
          onConfirm={confirmArchive}
        />
      </Stack>
    </Paper>
  );
}
