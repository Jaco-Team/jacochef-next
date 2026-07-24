"use client";

import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import {
  Button,
  Chip,
  Grid,
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

import SkladDeleteDialog from "../SkladDeleteDialog";
import SkladProductionEditorDialog from "./SkladProductionEditorDialog";
import {
  formatCategories,
  formatDateRangeCell,
  getDeleteHint,
  getEntitySingleLabel,
  getPrimaryStatusChip,
  getRowKey,
  getSecondaryStatusChips,
} from "./production.helpers";
import { PRODUCTION_ARCHIVE_MODE_OPTIONS } from "./useSkladProductionStore";

export default function SkladProductionContent({
  activeEntityType,
  search,
  entityFilter,
  entityOptions,
  categoryId,
  archiveMode,
  categoryOptions,
  mergedRows,
  paginatedRows,
  page,
  rowsPerPage,
  modal,
  detail,
  draft,
  deleteDialog,
  archiveDialog,
  shellUnits,
  categories,
  shellAllergens,
  shellStorages,
  shellApps,
  canDeleteAction,
  canManageProduction,
  setState,
  openCreate,
  openView,
  openEdit,
  openArchiveDialog,
  openDeleteDialog,
  closeModal,
  closeDeleteDialog,
  closeArchiveDialog,
  submitDraft,
  confirmDelete,
  confirmArchive,
}) {
  return (
    <>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Grid
            container
            spacing={2}
            alignItems="stretch"
          >
            <Grid size={{ xs: 12, md: 3 }}>
              <MySearchInput
                label="Поиск"
                placeholder="Название рецепта или заготовки"
                value={search}
                onValueChange={(nextValue) =>
                  setState({
                    search: nextValue,
                    page: 0,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <MySelect
                label="Тип"
                data={entityOptions}
                is_none={false}
                value={entityFilter}
                func={(event) =>
                  setState({
                    entityFilter: event.target.value,
                    page: 0,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <MySelect
                label="Категория"
                data={categoryOptions}
                is_none={false}
                value={categoryId}
                func={(event) =>
                  setState({
                    categoryId: event.target.value,
                    page: 0,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <MySelect
                label="Показать"
                data={PRODUCTION_ARCHIVE_MODE_OPTIONS}
                is_none={false}
                value={archiveMode}
                func={(event) =>
                  setState({
                    archiveMode: event.target.value,
                    page: 0,
                  })
                }
              />
            </Grid>

            <Grid size={12}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-start"
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!canManageProduction("recipe")}
                  onClick={() => openCreate("recipe")}
                >
                  Добавить рецепт
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!canManageProduction("semi_finished")}
                  onClick={() => openCreate("semi_finished")}
                >
                  Добавить заготовку
                </Button>
              </Stack>
            </Grid>
          </Grid>

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
                  <TableCell>Название</TableCell>
                  <TableCell sx={{ width: 140 }}>Тип</TableCell>
                  <TableCell>Категории</TableCell>
                  <TableCell>Срок годности</TableCell>
                  <TableCell sx={{ width: 220 }}>Действует</TableCell>
                  <TableCell sx={{ minWidth: 220 }}>Статус</TableCell>
                  <TableCell
                    align="right"
                    sx={{ width: 220 }}
                  >
                    Действия
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRows.map((row) => {
                  const entityType = row?.entityType || "semi_finished";
                  const canCreateOrEdit = canManageProduction(entityType);
                  const canDelete = Boolean(row?.delete_usage?.can_delete);
                  const primaryStatusChip = getPrimaryStatusChip(row);
                  const secondaryStatusChips = getSecondaryStatusChips(row);

                  return (
                    <TableRow
                      key={getRowKey(entityType, row)}
                      hover
                    >
                      <TableCell
                        onClick={() => openEdit(entityType, row, "main")}
                        sx={{ cursor: "pointer" }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>{row?.name || "-"}</Typography>
                      </TableCell>

                      <TableCell>{getEntitySingleLabel(entityType)}</TableCell>
                      <TableCell>{formatCategories(row?.categories)}</TableCell>
                      <TableCell>{row?.shelf_life || "-"}</TableCell>
                      <TableCell>{formatDateRangeCell(row)}</TableCell>

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
                          <Tooltip
                            title={canCreateOrEdit ? "Открыть редактор" : "Открыть карточку"}
                          >
                            <span>
                              <IconButton
                                size="small"
                                aria-label="Редактировать"
                                onClick={() => openEdit(entityType, row, "main")}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Открыть вкладку истории">
                            <span>
                              <IconButton
                                size="small"
                                aria-label="Открыть историю"
                                onClick={() => openEdit(entityType, row, "history")}
                              >
                                <HistoryOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip
                            title={Number(row?.is_archived) === 1 ? "Вернуть из архива" : "В архив"}
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={!canCreateOrEdit}
                                onClick={() => openArchiveDialog(entityType, row)}
                              >
                                {Number(row?.is_archived) === 1 ? (
                                  <UnarchiveOutlinedIcon fontSize="small" />
                                ) : (
                                  <ArchiveOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>

                          {canDelete ? (
                            <Tooltip title="Удалить">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={!canCreateOrEdit || !canDeleteAction}
                                  onClick={() => openDeleteDialog(entityType, row)}
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

                {mergedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="text.secondary">
                        Ничего не найдено. Измените фильтры или режим показа.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={mergedRows.length}
            page={page}
            onPageChange={(_, nextPage) => setState({ page: nextPage })}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) =>
              setState({
                rowsPerPage: Number(event.target.value) || 25,
                page: 0,
              })
            }
            rowsPerPageOptions={[25, 50, 100]}
            labelRowsPerPage="Строк на странице:"
          />
        </Stack>
      </Paper>

      <SkladProductionEditorDialog
        open={modal.open}
        loading={modal.loading}
        mode={modal.mode === "edit" ? "edit" : "create"}
        entityType={activeEntityType}
        entityLabel={getEntitySingleLabel(activeEntityType)}
        draft={draft}
        initialTab={modal.tab}
        units={
          draft?.units?.length ? draft.units : detail?.units?.length ? detail.units : shellUnits
        }
        categories={detail?.ref_categories?.length ? detail.ref_categories : categories}
        allergens={detail?.ref_allergens?.length ? detail.ref_allergens : shellAllergens}
        storages={detail?.all_storages?.length ? detail.all_storages : shellStorages}
        apps={detail?.ref_apps?.length ? detail.ref_apps : shellApps}
        allItemsList={detail?.all_items_list || draft?.all_items_list || []}
        isEditable={canManageProduction(activeEntityType)}
        onSubmit={submitDraft}
        onClose={closeModal}
      />
      <SkladDeleteDialog
        open={deleteDialog.open}
        loading={deleteDialog.loading}
        title={`Удалить ${getEntitySingleLabel(deleteDialog?.entityType || activeEntityType).toLowerCase()}?`}
        description={`Запись "${deleteDialog?.row?.name || ""}" будет удалена без возможности восстановления.`}
        warning="Если запись уже использовалась, удаление будет недоступно."
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
      <SkladDeleteDialog
        open={archiveDialog.open}
        loading={archiveDialog.loading}
        title={
          Number(archiveDialog?.row?.is_archived) === 1
            ? `Вернуть ${getEntitySingleLabel(archiveDialog?.entityType || activeEntityType).toLowerCase()} из архива?`
            : `Отправить ${getEntitySingleLabel(archiveDialog?.entityType || activeEntityType).toLowerCase()} в архив?`
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
    </>
  );
}
