import React, { useEffect } from "react";
import Link from "next/link";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MyAlert from "@/ui/MyAlert";
import { useConfirm } from "@/src/hooks/useConfirm";
import { cleaningSectionTabs, controlKindTabs } from "./constants";
import CleaningTemplateDialog from "./CleaningTemplateDialog";
import CleaningHistoryDialog from "./CleaningHistoryDialog";
import CleaningsListPage from "./CleaningsListPage";
import CleaningCategoriesView, { DeleteCategoryDialog } from "./CategoriesPage";
import CafesView, { AddCafeCleaningDialog, RemoveCafeCleaningDialog } from "./CafesPage";
import ControlView, { AddManualCleaningDialog } from "./ControlCleaningsPage";
import PreparationControlView, { PreparationEditDialog } from "./ControlPreparationsPage";
import { ControlActionConfirmDialog, PreparationActionConfirmDialog } from "./ControlDialogs";
import useCleaningsPage from "./useCleaningsPage";

export default function CleaningsPage({
  initialSection = "templates",
  initialControlKind = "cleanings",
} = {}) {
  const page = useCleaningsPage({ initialSection, initialControlKind });
  const { withConfirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
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
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={page.bootstrapLoading || page.controlLoading || page.mutationLoading}
      >
        <CircularProgress />
      </Backdrop>

      <MyAlert
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
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: 28, md: 32 } }}
              >
                {page.pageTitle}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
                {page.pageSubtitle}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={page.section}
                sx={{
                  "& .MuiToggleButton-root": {
                    width: 92,
                    height: 40,
                    px: 0,
                    py: 0,
                    minHeight: 40,
                    lineHeight: "20px",
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 600,
                  },
                }}
              >
                {cleaningSectionTabs
                  .filter((tab) => {
                    if (tab.value === "templates") return page.canView("cleanings");
                    if (tab.value === "categories") return page.canView("categories");
                    if (tab.value === "cafes") return page.canView("cafes");
                    if (tab.value === "control") {
                      return page.canView("control_cleanings") || page.canView("control_pf");
                    }
                    return true;
                  })
                  .map((tab) => (
                    <ToggleButton
                      key={tab.value}
                      component={Link}
                      href={tab.href}
                      value={tab.value}
                      onClick={() => page.setSection(tab.value)}
                    >
                      {tab.label}
                    </ToggleButton>
                  ))}
              </ToggleButtonGroup>

              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={page.openCreate}
                sx={{
                  minHeight: 40,
                  px: 2.25,
                  borderRadius: "8px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display:
                    page.section === "templates" && page.canAccess("create_cleaning")
                      ? "inline-flex"
                      : "none",
                }}
              >
                Новая уборка
              </Button>

              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={page.createCategory}
                sx={{
                  minHeight: 40,
                  px: 2.25,
                  borderRadius: "8px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display:
                    page.section === "categories" && page.canEdit("categories")
                      ? "inline-flex"
                      : "none",
                }}
              >
                Новая категория
              </Button>

              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => page.setAddCafeDialogOpen(true)}
                sx={{
                  minHeight: 40,
                  px: 2.25,
                  borderRadius: "8px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display:
                    page.section === "cafes" && page.canEdit("cafes") ? "inline-flex" : "none",
                }}
              >
                Добавить уборку
              </Button>

              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={withConfirm(page.saveCafeDopTimes, "Сохранить изменения доп. времени?")}
                disabled={!Object.keys(page.cafeDopTimeDrafts).length}
                sx={{
                  minHeight: 40,
                  px: 2.25,
                  borderRadius: "8px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  display:
                    page.section === "cafes" && page.canEdit("cafes") ? "inline-flex" : "none",
                }}
              >
                Сохранить изменения
              </Button>
            </Box>
          </Box>
        </Grid>

        {page.section === "categories" && page.canView("categories") ? (
          <Grid size={12}>
            <CleaningCategoriesView
              categories={page.categories}
              templates={page.templates}
              selectedCategoryId={page.selectedCategoryId}
              categoryQuery={page.categoryQuery}
              onCategoryQueryChange={page.setCategoryQuery}
              onSelectCategory={page.selectCategory}
              draftCategory={page.categoryDraft}
              onDraftCategoryChange={page.setCategoryDraft}
              onSaveCategory={page.saveCategory}
              onDeleteCategory={page.setDeleteCategoryId}
              history={page.categoryHistoryRows}
              historyLoading={page.categoryHistoryLoading}
              canEdit={page.canEdit("categories")}
            />
          </Grid>
        ) : null}

        {page.section === "cafes" && page.canView("cafes") ? (
          <Grid size={12}>
            <CafesView
              templates={page.cafeAssignedTemplates}
              categories={page.categories}
              locations={page.locations}
              roles={page.roles}
              scheduleTypeOptions={page.scheduleTypeOptions}
              selectedCafeId={page.selectedCafeId}
              roleFilter={page.cafeRoleFilter}
              onCafeChange={page.setSelectedCafeId}
              onRoleFilterChange={page.setCafeRoleFilter}
              onRemoveCleaning={page.setRemoveCafeCleaningId}
              dopTimeDrafts={page.cafeDopTimeDrafts}
              onDopTimeChange={page.setCafeDopTimeDraft}
              canEdit={page.canEdit("cafes")}
            />
          </Grid>
        ) : null}

        {page.section === "control" &&
        (page.canView("control_cleanings") || page.canView("control_pf")) ? (
          <Grid size={12}>
            <Box sx={{ display: "flex", mb: 1.5 }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={page.controlKind}
                sx={{
                  "& .MuiToggleButton-root": {
                    minHeight: 38,
                    px: 2,
                    py: 0,
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 700,
                  },
                }}
              >
                {controlKindTabs
                  .filter((tab) => {
                    if (tab.value === "cleanings") return page.canView("control_cleanings");
                    if (tab.value === "preparations") return page.canView("control_pf");
                    return true;
                  })
                  .map((tab) => (
                    <ToggleButton
                      key={tab.value}
                      component={Link}
                      href={tab.href}
                      value={tab.value}
                      onClick={() => page.setControlKind(tab.value)}
                    >
                      {tab.label}
                    </ToggleButton>
                  ))}
              </ToggleButtonGroup>
            </Box>

            {page.controlKind === "cleanings" && page.canView("control_cleanings") ? (
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
                canEdit={page.canEdit("control_cleanings")}
              />
            ) : page.canView("control_pf") ? (
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
                canEdit={page.canEdit("control_pf")}
              />
            ) : null}
          </Grid>
        ) : null}

        {page.section === "templates" && page.canView("cleanings") ? (
          <CleaningsListPage
            query={page.query}
            setQuery={page.setQuery}
            filter={page.filter}
            setFilter={page.setFilter}
            filteredTemplates={page.filteredTemplates}
            templates={page.templates}
            categories={page.categories}
            scheduleTypeOptions={page.scheduleTypeOptions}
            openEdit={page.openEdit}
            toggleArchive={page.toggleArchive}
            removeTemplate={withConfirm(page.removeTemplate, "Удалить уборку полностью?", 3)}
            onHistory={page.openTemplateHistory}
            canEdit={page.canEdit("cleanings")}
          />
        ) : null}
      </Grid>

      <CleaningTemplateDialog
        open={page.dialogOpen}
        item={page.editingItem}
        categories={page.categories}
        templates={page.templates}
        locations={page.locations}
        roles={page.roles}
        scheduleTypeOptions={page.scheduleTypeOptions}
        additionTypeOptions={page.additionTypeOptions}
        onClose={page.closeDialog}
        onSave={page.saveTemplate}
        canEdit={page.canEdit("cleanings")}
      />

      <CleaningHistoryDialog
        open={Boolean(page.historyItem)}
        item={page.historyItem}
        history={page.historyRows}
        loading={page.historyLoading}
        onClose={page.closeTemplateHistory}
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
        categories={page.categories}
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
    </Box>
  );
}
