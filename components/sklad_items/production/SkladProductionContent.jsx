"use client";

import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import {
  Grid,
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

import {
  JacoButton,
  JacoCheckbox,
  JacoIconButton,
  JacoSearchField,
  JacoSegmentedTabs,
  JacoSurface,
} from "@/design-system/shared/ui";
import { uiRadii } from "@/design-system/shared/tokens";

import SkladDeleteDialog from "../SkladDeleteDialog";
import SkladBooleanStatus from "../SkladBooleanStatus";
import { interactiveRowProps } from "../table/interactiveRow";
import SkladProductionEditorDialog from "./SkladProductionEditorDialog";
import SkladSortableHeader from "../table/SkladSortableHeader";
import { formatDateRU } from "../formatDateRangeRU";
import SkladCategorySelect from "../ui/SkladCategorySelect";
import {
  formatCategories,
  getDeleteHint,
  getEntitySingleLabel,
  getPrimaryStatusChip,
  getRowKey,
} from "./production.helpers";

export default function SkladProductionContent({
  activeEntityType,
  creationItems,
  search,
  categoryId,
  archiveMode,
  modeCounts,
  categoryOptions,
  mergedRows,
  paginatedRows,
  sortBy,
  sortDirection,
  onSort,
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
  access,
  canArchiveAction,
  canDeleteAction,
  canCreateProduction,
  canManageProduction,
  canConvertProduction,
  canViewHistory,
  canCreateCategory,
  allowPastDate,
  canManageCategories,
  setState,
  openCreate,
  onCreateCategory,
  onManageCategories,
  openEdit,
  openArchiveDialog,
  openDeleteDialog,
  openConvertDialog,
  closeModal,
  closeDeleteDialog,
  closeArchiveDialog,
  submitDraft,
  confirmDelete,
  confirmArchive,
}) {
  const canViewUnit = Number(access?.production_unit_view) === 1;

  return (
    <>
      <Stack spacing={2}>
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "stretch",
          }}
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <JacoSearchField
              label="Поиск"
              placeholder="Название рецепта или полуфабриката"
              value={search}
              onValueChange={(nextValue) =>
                setState({
                  search: nextValue,
                  page: 0,
                })
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: "center",
              }}
            >
              <Stack sx={{ minWidth: 0, flex: 1 }}>
                <SkladCategorySelect
                  label="Категория"
                  data={categoryOptions}
                  is_none={false}
                  value={categoryId}
                  func={(event) => {
                    setState({
                      categoryId: event.target.value,
                      page: 0,
                    });
                  }}
                />
              </Stack>
              {canManageCategories ? (
                <Tooltip title="Управление категориями рецептов и полуфабрикатов">
                  <JacoIconButton
                    aria-label="Управление категориями рецептов и полуфабрикатов"
                    onClick={onManageCategories}
                  >
                    <SettingsOutlinedIcon />
                  </JacoIconButton>
                </Tooltip>
              ) : null}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <JacoSegmentedTabs
              size="compact"
              variant="standard"
              sx={{ width: "fit-content", maxWidth: "100%" }}
              aria-label="Показать рецепты и полуфабрикаты"
              value={archiveMode}
              onChange={(_, value) => setState({ archiveMode: value, page: 0 })}
              items={[
                { id: "active", label: `Активные${modeCounts ? ` (${modeCounts.active})` : ""}` },
                { id: "archive", label: `Архив${modeCounts ? ` (${modeCounts.archive})` : ""}` },
              ]}
            />
          </Grid>

          <Grid size={12}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{
                justifyContent: "flex-start",
              }}
            >
              <JacoButton
                startIcon={<AddIcon />}
                disabled={!canCreateProduction}
                onClick={() => openCreate("recipe")}
              >
                Добавить рецепт или полуфабрикат
              </JacoButton>
            </Stack>
          </Grid>
        </Grid>

        <JacoSurface sx={{ border: "none", borderRadius: uiRadii.lg, overflow: "hidden" }}>
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
                  <TableCell sx={{ width: 116 }}>Тип</TableCell>
                  <SkladSortableHeader
                    sortKey="name"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  >
                    Название
                  </SkladSortableHeader>
                  {canViewUnit ? <TableCell>Единица</TableCell> : null}
                  <SkladSortableHeader
                    sortKey="categories"
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  >
                    Категории
                  </SkladSortableHeader>
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
                  <TableCell sx={{ minWidth: 116 }}>Обновление</TableCell>
                  <TableCell align="center">Активность</TableCell>
                  <TableCell align="center">Ревизия</TableCell>
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
                  const canCreateOrEdit = canManageProduction;
                  const canDelete =
                    row?.delete_usage?.can_delete === true ||
                    Number(row?.delete_usage?.can_delete) === 1;
                  const primaryStatusChip = getPrimaryStatusChip(row);
                  const isActive = Number(row?.is_active) === 1;
                  const activityLabel = [
                    primaryStatusChip.label,
                    isActive && Number(row?.is_scheduled) === 1 ? "Есть новая версия" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <TableRow
                      key={getRowKey(entityType, row)}
                      {...interactiveRowProps(row?.name, () => openEdit(entityType, row, "main"))}
                    >
                      <TableCell>{getEntitySingleLabel(entityType)}</TableCell>
                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {row?.name || "Без названия"}
                      </TableCell>
                      {canViewUnit ? <TableCell>{row?.ed_izmer_name || "—"}</TableCell> : null}
                      <TableCell>{formatCategories(row?.categories)}</TableCell>
                      <TableCell>{formatDateRU(row?.date_start) || "—"}</TableCell>
                      <TableCell>{formatDateRU(row?.date_end) || "—"}</TableCell>
                      <TableCell>{formatDateRU(row?.date_update) || "—"}</TableCell>
                      <TableCell align="center">
                        <Tooltip
                          title={activityLabel}
                          describeChild
                        >
                          <span
                            role="img"
                            aria-label={activityLabel}
                            tabIndex={0}
                            style={{ display: "inline-flex" }}
                          >
                            <JacoCheckbox
                              checked={isActive}
                              readOnly
                              tabIndex={-1}
                              aria-hidden="true"
                              sx={{ pointerEvents: "none" }}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <SkladBooleanStatus
                          label="Ревизия"
                          value={row?.show_in_rev}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            justifyContent: "flex-end",
                          }}
                        >
                          {canViewHistory ? (
                            <Tooltip title="Открыть вкладку истории">
                              <span>
                                <JacoIconButton
                                  aria-label="Открыть историю"
                                  onClick={() => openEdit(entityType, row, "history")}
                                >
                                  <HistoryOutlinedIcon fontSize="small" />
                                </JacoIconButton>
                              </span>
                            </Tooltip>
                          ) : null}

                          {canConvertProduction ? (
                            <Tooltip
                              title={
                                Number(row?.is_archived) === 1
                                  ? "Сначала верните запись из архива"
                                  : !canDelete
                                    ? "Преобразование недоступно: запись уже используется"
                                    : `Преобразовать в ${getEntitySingleLabel(
                                        entityType === "recipe" ? "semi_finished" : "recipe",
                                      ).toLowerCase()}`
                              }
                            >
                              <span>
                                <JacoIconButton
                                  aria-label={`Преобразовать ${getEntitySingleLabel(entityType).toLowerCase()}`}
                                  disabled={Number(row?.is_archived) === 1 || !canDelete}
                                  onClick={() => openConvertDialog(entityType, row)}
                                >
                                  <SwapHorizIcon fontSize="small" />
                                </JacoIconButton>
                              </span>
                            </Tooltip>
                          ) : null}

                          {canArchiveAction ? (
                            <Tooltip
                              title={
                                Number(row?.is_archived) === 1 ? "Вернуть из архива" : "В архив"
                              }
                            >
                              <span>
                                <JacoIconButton
                                  disabled={!canCreateOrEdit}
                                  onClick={() => openArchiveDialog(entityType, row)}
                                >
                                  {Number(row?.is_archived) === 1 ? (
                                    <UnarchiveOutlinedIcon fontSize="small" />
                                  ) : (
                                    <ArchiveOutlinedIcon fontSize="small" />
                                  )}
                                </JacoIconButton>
                              </span>
                            </Tooltip>
                          ) : null}

                          {canDeleteAction ? (
                            canDelete ? (
                              <Tooltip title="Удалить">
                                <span>
                                  <JacoIconButton
                                    sx={{ color: "error.main" }}
                                    aria-label={`Удалить: ${row.name}`}
                                    disabled={!canCreateOrEdit}
                                    onClick={() => openDeleteDialog(entityType, row)}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </JacoIconButton>
                                </span>
                              </Tooltip>
                            ) : (
                              <Tooltip title={getDeleteHint(row)}>
                                <span
                                  role="img"
                                  tabIndex={0}
                                  aria-label={`${row.name}: ${getDeleteHint(row)}`}
                                >
                                  <JacoIconButton
                                    disabled
                                    aria-hidden="true"
                                    tabIndex={-1}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </JacoIconButton>
                                </span>
                              </Tooltip>
                            )
                          ) : null}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {mergedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canViewUnit ? 10 : 9}>
                      <Typography
                        sx={{
                          color: "text.secondary",
                        }}
                      >
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
        </JacoSurface>
      </Stack>
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
        allItemsList={
          modal.mode === "create"
            ? creationItems
            : detail?.all_items_list || draft?.all_items_list || []
        }
        access={access}
        isEditable={modal.mode === "create" ? canCreateProduction : canManageProduction}
        canViewHistory={canViewHistory}
        canCreateCategory={canCreateCategory}
        allowPastDate={allowPastDate}
        onCreateCategory={onCreateCategory}
        onChangeEntityType={(entityType) => setState({ activeEntityType: entityType })}
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
