"use client";

import { Stack, useMediaQuery, useTheme } from "@mui/material";

import SkladDeleteDialog from "../SkladDeleteDialog";
import SkladSiteItemsHistoryDialog from "./SkladSiteItemsHistoryDialog";
import SkladSiteItemsCatalog from "./SkladSiteItemsCatalog";
import { SkladSiteItemsLegacyEditorDialog } from "./SkladSiteItemsLegacyEditorDialog";

export default function SkladSiteItemsContent({
  search,
  archiveMode,
  rows,
  modal,
  detail,
  draft,
  access,
  categories,
  tags,
  deleteDialog,
  archiveDialog,
  isEditable,
  canCreate,
  canArchiveAction,
  canDeleteAction,
  canEditActivity,
  canEditCash,
  canEditSort,
  canViewHistory,
  canCreateCategory,
  allowPastDate,
  showAlert,
  setState,
  openCreate,
  onCreateCategory,
  openEdit,
  handleRestoreImage,
  openArchiveDialog,
  openDeleteDialog,
  closeModal,
  closeDeleteDialog,
  closeArchiveDialog,
  confirmDelete,
  confirmArchive,
  handleCreateTag,
  handleRenameTag,
  submitDraft,
  submitLegacyDraft,
  onSaveQuickField,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const showHistory = modal.open && modal.section === "history";
  const legacyItem = detail?.item ? { ...detail.item, tags_all: detail?.tags_all || tags } : null;

  const handleLegacyData = async (method, data = {}) => {
    if (method !== "saveNewTag") {
      return { st: false, text: "Действие недоступно в sklad_items" };
    }

    try {
      const result = await handleCreateTag(data?.name);
      return { st: true, text: result?.text, tags_all: result?.tags || [] };
    } catch (error) {
      return { st: false, text: error?.message || "Ошибка создания тега" };
    }
  };

  return (
    <Stack spacing={2}>
      <SkladSiteItemsCatalog
        search={search}
        archiveMode={archiveMode}
        rows={rows}
        categories={categories}
        isEditable={isEditable}
        canCreate={canCreate}
        canArchiveAction={canArchiveAction}
        canDeleteAction={canDeleteAction}
        canEditActivity={canEditActivity}
        canEditCash={canEditCash}
        canEditSort={canEditSort}
        canViewHistory={canViewHistory}
        setState={setState}
        openCreate={openCreate}
        openEdit={openEdit}
        openArchiveDialog={openArchiveDialog}
        openDeleteDialog={openDeleteDialog}
        onSaveQuickField={onSaveQuickField}
      />

      <SkladSiteItemsLegacyEditorDialog
        open={modal.open && !showHistory && !modal.loading && Boolean(legacyItem)}
        method={
          modal.mode === "create"
            ? "Новое блюдо"
            : `Редактирование: ${legacyItem?.name || "Товар сайта"}`
        }
        item={legacyItem}
        category={detail?.cat_list || categories}
        categoryLegacy={detail?.cat_list_legacy || []}
        item_items={detail?.item_items}
        items_stage={detail?.items_stage}
        stages={[
          { id: "1", name: "1 этап" },
          { id: "2", name: "2 этап" },
          { id: "3", name: "3 этап" },
        ]}
        acces={access}
        fullScreen={fullScreen}
        allowPastDate={allowPastDate}
        save={submitLegacyDraft}
        getData={handleLegacyData}
        update={() => null}
        onClose={closeModal}
      />

      <SkladSiteItemsHistoryDialog
        open={showHistory && !modal.loading && Boolean(legacyItem)}
        history={detail?.history}
        itemName={legacyItem?.name}
        fullScreen={fullScreen}
        access={access}
        imageHistory={detail?.image_history}
        imageAssetKey={legacyItem?.img_app}
        onRestoreImage={(historyId) => handleRestoreImage(legacyItem, historyId, "history")}
        onClose={closeModal}
      />

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
  );
}
