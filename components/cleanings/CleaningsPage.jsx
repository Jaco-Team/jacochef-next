import React, { useCallback, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Box, Grid, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoBackdropLoader,
  JacoCompactTabs,
  JacoSegmentedTabs,
  JacoSurface,
  uiColors,
  uiShadows,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import { useConfirm } from "@/src/hooks/useConfirm";
import { UNSAVED_CHANGES_CONFIRM } from "./constants";
import { getSectionSegments } from "./helpers";
import CleaningTemplateDialog from "./CleaningTemplateDialog";
import CleaningHistoryDialog from "./CleaningHistoryDialog";
import CleaningsListPage, { TemplateStatusConfirmDialog } from "./CleaningsListPage";
import CleaningCategoriesView, { DeleteCategoryDialog } from "./CategoriesPage";
import CafesView, { AddCafeCleaningDialog, RemoveCafeCleaningDialog } from "./CafesPage";
import ControlView, { AddManualCleaningDialog } from "./ControlCleaningsPage";
import PreparationControlView, { PreparationEditDialog } from "./ControlPreparationsPage";
import { ControlActionConfirmDialog, PreparationActionConfirmDialog } from "./ControlDialogs";
import useCleaningsPage from "./useCleaningsPage";

const PAGE_PATHNAME = "/cleanings/[[...section]]";

function getRouteSegments(section) {
  if (Array.isArray(section)) {
    return section;
  }

  return section ? [section] : [];
}

function sectionUrl(query, segments) {
  const { section, ...otherQuery } = query;

  return {
    pathname: PAGE_PATHNAME,
    query: { ...otherQuery, section: segments },
  };
}

export default function CleaningsPage() {
  const router = useRouter();
  const routeSegments = getRouteSegments(router.query.section);
  const routeKey = routeSegments.join("/");
  const { confirm: confirmUnsaved, ConfirmDialog: UnsavedChangesDialog } = useJacoConfirm();
  const confirmDiscardChanges = useCallback(
    () => confirmUnsaved(UNSAVED_CHANGES_CONFIRM),
    [confirmUnsaved],
  );
  const page = useCleaningsPage({
    requestedPath: routeSegments[0] ?? null,
    requestedKind: routeSegments[1] ?? null,
    routeReady: router.isReady,
    confirmDiscardChanges,
  });
  const { withConfirm, ConfirmDialog } = useConfirm();
  const { route, showAlert } = page;
  const canonicalKey = route ? route.segments.join("/") : null;
  const activeTab = page.sectionTabs.find((tab) => tab.value === page.section) || null;

  const navigate = (segments, method = "push") =>
    router[method](sectionUrl(router.query, segments), undefined, {
      shallow: true,
      scroll: false,
    }).catch((error) => {
      if (!error?.cancelled) {
        showAlert("Не удалось открыть раздел");
      }
    });

  // Bare /cleanings, unknown or forbidden sections are replaced with the resolved accessible one.
  useEffect(() => {
    if (!route || canonicalKey === routeKey) {
      return;
    }

    navigate(route.segments, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalKey, routeKey]);

  const changeSection = async (_, value) => {
    if (value === page.section || !(await page.confirmSectionLeave())) {
      return;
    }

    const kind = value === "control" ? page.controlKindTabs[0]?.value : null;
    navigate(getSectionSegments(value, kind));
  };

  const changeControlKind = (_, value) => {
    if (value === page.controlKind) {
      return;
    }

    navigate(getSectionSegments("control", value));
  };

  return (
    <>
    <Head>
      <title>{page.moduleName}</title>
    </Head>
    <Box
      sx={{
        "& .MuiButton-root": {
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "20px",
        },
        "& .MuiButton-startIcon, & .MuiButton-endIcon": {
          alignItems: "center",
        },
      }}
    >
      <JacoBackdropLoader
        open={page.bootstrapLoading || page.controlLoading || page.mutationLoading}
        sx={{ "& .MuiCircularProgress-root": { color: "common.white" } }}
      />

      <JacoAlert
        isOpen={page.isAlert}
        onClose={page.closeAlert}
        status={page.alertStatus}
        text={page.alertMessage}
      />

      <Grid
        container
        spacing={2.5}
        className="container_first_child"
      >
        <Grid size={12}>
          <h1>{page.moduleName}</h1>
        </Grid>

        {page.sectionTabs.length ? (
          <Grid size={12}>
            <JacoSurface
              sx={{
                p: 0,
                overflow: "hidden",
                backgroundColor: uiColors.surface,
                borderColor: uiColors.border,
                boxShadow: uiShadows.surface,
              }}
            >
              <JacoCompactTabs
                value={page.section ?? false}
                onChange={changeSection}
                items={page.sectionTabs.map((tab) => ({
                  id: tab.value,
                  value: tab.value,
                  label: tab.label,
                }))}
                aria-label="cleanings tabs"
                variant="scrollable"
                scrollButtons={false}
                allowScrollButtonsMobile
                tabSx={{ textTransform: "uppercase" }}
              />
            </JacoSurface>
            {activeTab?.description ? (
              <Typography sx={{ mt: 1.5, color: "text.secondary", fontSize: 15 }}>
                {activeTab.description}
              </Typography>
            ) : null}
          </Grid>
        ) : null}

        {page.bootstrapReady && !page.sectionTabs.length ? (
          <Grid size={12}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Нет доступных разделов</Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Проверьте права доступа к модулю.
            </Typography>
          </Grid>
        ) : null}

        {page.section === "categories" ? (
          <Grid size={12}>
            <CleaningCategoriesView
              categories={page.categories}
              templates={page.templates}
              categoryQuery={page.categoryQuery}
              onCategoryQueryChange={page.setCategoryQuery}
              onSelectCategory={page.selectCategory}
              onCreateCategory={page.createCategory}
              card={page.categoryCard}
              dirty={page.isCategoryDirty}
              onCardChange={page.changeCategoryCard}
              onCloseCard={page.confirmCategoryLeave}
              onSaveCategory={page.saveCategory}
              onDeleteCategory={page.setDeleteCategoryId}
              history={page.categoryHistoryRows}
              historyLoading={page.categoryHistoryLoading}
              canEdit={page.canEdit("categories")}
            />
          </Grid>
        ) : null}

        {page.section === "templates" ? (
          <CleaningsListPage
            query={page.query}
            setQuery={page.setQuery}
            filter={page.filter}
            setFilter={page.setFilter}
            filteredTemplates={page.filteredTemplates}
            templates={page.templates}
            categories={page.categories}
            scheduleTypeOptions={page.scheduleTypeOptions}
            onCreate={page.openCreate}
            canCreate={page.canAccess("create_cleaning")}
            openEdit={page.openEdit}
            toggleArchive={page.setArchiveToggleId}
            removeTemplate={withConfirm(page.removeTemplate, "Удалить уборку полностью?", 3)}
            onHistory={page.openTemplateHistory}
            canEdit={page.canEdit("cleanings")}
          />
        ) : null}

        {page.section === "cafes" ? (
          <Grid size={12}>
            <CafesView
              templates={page.cafeAssignedTemplates}
              categories={page.categories}
              locations={page.locations}
              roles={page.roles}
              scheduleTypeOptions={page.scheduleTypeOptions}
              additionTypeOptions={page.additionTypeOptions}
              selectedCafeId={page.selectedCafeId}
              roleFilter={page.cafeRoleFilter}
              onCafeChange={page.selectCafe}
              onRoleFilterChange={page.setCafeRoleFilter}
              onRemoveCleaning={page.setRemoveCafeCleaningId}
              onAddOpen={() => page.setAddCafeDialogOpen(true)}
              onHistoryOpen={page.openCafeHistory}
              onSaveDopTimes={withConfirm(
                page.saveCafeDopTimes,
                "Сохранить изменения доп. времени?",
              )}
              dopTimeDraftCount={Object.keys(page.cafeDopTimeDrafts).length}
              dopTimeDrafts={page.cafeDopTimeDrafts}
              onDopTimeChange={page.setCafeDopTimeDraft}
              canEdit={page.canEdit("cafes")}
            />
          </Grid>
        ) : null}

        {page.section === "control" ? (
          <Grid size={12}>
            <JacoSegmentedTabs
              size="compact"
              value={page.controlKind ?? false}
              onChange={changeControlKind}
              items={page.controlKindTabs.map((tab) => ({ id: tab.value, label: tab.label }))}
              aria-label="cleanings control tabs"
              sx={{ maxWidth: 360, mb: 2 }}
            />

            {page.controlKind === "cleanings" ? (
              <ControlView
                items={page.controlItems}
                templates={page.templates}
                locations={page.locations}
                filter={page.controlFilter}
                selectedCafeId={page.controlCafeId}
                dateFrom={page.controlDateFrom}
                dateTo={page.controlDateTo}
                onFilterChange={page.setControlFilter}
                onCafeChange={page.setControlCafeId}
                onDateFromChange={page.setControlDateFrom}
                onDateToChange={page.setControlDateTo}
                onAddManualOpen={() => page.setAddManualDialogOpen(true)}
                onApprove={(id) => page.setControlAction({ type: "approve", id })}
                onReturn={(id) => page.setControlAction({ type: "return", id })}
                onDetach={(id) => page.setControlAction({ type: "detach", id })}
                onDelete={(id) => page.setControlAction({ type: "delete", id })}
                onHistory={(id) => page.openControlHistory("cleaning", id)}
                onRefresh={page.refreshControl}
                isLoading={page.controlLoading}
                refreshing={page.controlRefreshing}
                updatedAt={page.controlUpdatedAt}
                refreshError={page.controlRefreshError}
                canEdit={page.canEdit("control_cleanings")}
              />
            ) : null}

            {page.controlKind === "preparations" ? (
              <PreparationControlView
                items={page.preparationItems}
                locations={page.locations}
                selectedCafeId={page.preparationCafeId}
                dateFrom={page.preparationDateFrom}
                dateTo={page.preparationDateTo}
                onCafeChange={page.setPreparationCafeId}
                onDateFromChange={page.setPreparationDateFrom}
                onDateToChange={page.setPreparationDateTo}
                onEdit={page.openPreparationEdit}
                onApprove={(id) => page.setPreparationAction({ type: "approve", id })}
                onDelete={(id) => page.setPreparationAction({ type: "delete", id })}
                onHistory={(id) => page.openControlHistory("preparation", id)}
                onRefresh={page.refreshControl}
                isLoading={page.controlLoading}
                refreshing={page.controlRefreshing}
                updatedAt={page.controlUpdatedAt}
                refreshError={page.controlRefreshError}
                canEdit={page.canEdit("control_pf")}
              />
            ) : null}
          </Grid>
        ) : null}
      </Grid>

      <CleaningTemplateDialog
        open={page.dialogOpen}
        item={page.editingItem}
        categories={page.categories}
        templates={page.templates}
        locations={page.locations}
        cities={page.cities}
        roles={page.roles}
        scheduleTypeOptions={page.scheduleTypeOptions}
        additionTypeOptions={page.additionTypeOptions}
        onClose={page.closeDialog}
        onSave={page.saveTemplate}
        confirmDiscardChanges={confirmDiscardChanges}
        canEdit={page.canEdit("cleanings")}
      />

      <TemplateStatusConfirmDialog
        open={Boolean(page.archiveToggleCandidate)}
        item={page.archiveToggleCandidate}
        onClose={() => page.setArchiveToggleId(null)}
        onConfirm={page.confirmArchiveToggle}
      />

      <CleaningHistoryDialog
        open={Boolean(page.historyItem)}
        item={page.historyItem}
        history={page.historyRows}
        loading={page.historyLoading}
        onClose={page.closeTemplateHistory}
      />

      <CleaningHistoryDialog
        open={Boolean(page.cafeHistoryLocation)}
        item={page.cafeHistoryLocation}
        history={page.cafeHistoryRows}
        loading={page.cafeHistoryLoading}
        onClose={page.closeCafeHistory}
      />

      <CleaningHistoryDialog
        open={Boolean(page.controlHistoryTarget)}
        item={page.controlHistorySubject}
        history={page.controlHistoryRows}
        loading={page.controlHistoryLoading}
        onClose={page.closeControlHistory}
        title="История действий"
        dateLabel="Время действия"
      />

      <DeleteCategoryDialog
        open={Boolean(page.deleteCategoryCandidate)}
        category={page.deleteCategoryCandidate}
        templates={page.deleteCategoryTemplates}
        onClose={() => page.setDeleteCategoryId(null)}
        onConfirm={page.deleteCategory}
      />

      <AddCafeCleaningDialog
        open={page.addCafeDialogOpen}
        cafe={page.selectedCafe}
        items={page.addableCafeCleanings}
        categories={page.categories}
        query={page.addCafeQuery}
        roleFilter={page.addCafeRoleFilter}
        roles={page.roles}
        onQueryChange={page.setAddCafeQuery}
        onRoleFilterChange={page.setAddCafeRoleFilter}
        onClose={() => page.setAddCafeDialogOpen(false)}
        onAdd={page.addCleaningToCafe}
      />

      <AddManualCleaningDialog
        open={page.addManualDialogOpen}
        items={page.manualTemplates}
        supported={page.manualTemplatesSupported}
        locations={page.locations}
        cafeId={page.controlCafeId}
        query={page.addManualQuery}
        onQueryChange={page.setAddManualQuery}
        onClose={() => page.setAddManualDialogOpen(false)}
        onAdd={page.addManualCleaning}
      />

      <RemoveCafeCleaningDialog
        open={Boolean(page.removeCafeCleaningCandidate)}
        cleaning={page.removeCafeCleaningCandidate}
        cafe={page.selectedCafe}
        onClose={() => page.setRemoveCafeCleaningId(null)}
        onConfirm={page.removeCleaningFromCafe}
      />

      <ControlActionConfirmDialog
        open={Boolean(page.controlActionCandidate)}
        action={page.controlAction}
        item={page.controlActionCandidate}
        cleaning={page.controlActionCleaningCandidate}
        onClose={() => page.setControlAction(null)}
        onConfirm={page.confirmControlAction}
      />

      <PreparationActionConfirmDialog
        open={Boolean(page.preparationActionCandidate)}
        action={page.preparationAction}
        item={page.preparationActionCandidate}
        onClose={() => page.setPreparationAction(null)}
        onConfirm={page.confirmPreparationAction}
      />

      <PreparationEditDialog
        open={Boolean(page.editingPreparation)}
        item={page.editingPreparation}
        onClose={() => page.setEditingPreparation(null)}
        onSave={page.savePreparation}
      />

      <ConfirmDialog />
      <UnsavedChangesDialog />
    </Box>
    </>
  );
}
