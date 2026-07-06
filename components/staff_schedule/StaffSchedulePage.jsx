import { Box, Grid } from "@mui/material";
import { V2Alert, V2BackdropLoader } from "@/ui/v2";
import StaffScheduleDayModal from "./modals/StaffScheduleDayModal";
import StaffScheduleExportDialog from "./modals/StaffScheduleExportDialog";
import StaffScheduleFastActionsDialog from "./modals/StaffScheduleFastActionsDialog";
import StaffScheduleMonthModal from "./modals/StaffScheduleMonthModal";
import StaffScheduleErrorAppealDialog from "./modals/StaffScheduleErrorAppealDialog";
import StaffScheduleSmenaModal from "./modals/StaffScheduleSmenaModal";
import StaffScheduleSummaryActionDialog from "./modals/StaffScheduleSummaryActionDialog";
import useStaffSchedulePage from "./useStaffSchedulePage";
import { PAGE_BOTTOM_PADDING } from "./staffScheduleConstants";
import StaffScheduleErrorsSection from "./sections/StaffScheduleErrorsSection";
import StaffScheduleHeaderSection from "./sections/StaffScheduleHeaderSection";
import StaffScheduleTableSection from "./sections/StaffScheduleTableSection";
import StaffScheduleAccessTester from "./StaffScheduleAccessTester";

export default function StaffSchedulePage() {
  const page = useStaffSchedulePage();

  return (
    <Box sx={{ pb: PAGE_BOTTOM_PADDING }}>
      <V2BackdropLoader open={page.isLoading} />

      <Grid
        container
        spacing={2.5}
        className="container_first_child"
      >
        <Grid size={12}>
          <StaffScheduleHeaderSection page={page} />
        </Grid>

        {page.error ? (
          <Grid size={12}>
            <V2Alert severity="error">{page.error}</V2Alert>
          </Grid>
        ) : null}

        <Grid size={12}>
          <StaffScheduleTableSection
            period={page.view.activePeriod}
            rows={page.view.visibleRows}
            shownShiftCount={page.view.shownShiftCount}
            summaryColumns={page.view.summaryColumns}
            access={page.access}
            graphKind={page.effectiveGraphKind}
            directorLevel={page.directorLevel}
            periodBonusState={page.periodBonusState}
            onOpenDay={page.handleOpenDayModal}
            onOpenMonth={page.handleOpenMonthModal}
            onOpenFastActions={page.handleOpenFastActions}
            onOpenBulkFastActions={page.handleOpenBulkFastActions}
            onOpenCreateSmena={page.handleOpenCreateSmena}
            onOpenEditSmena={page.handleOpenEditSmena}
            selectedRowIds={page.selectedRowIds}
            onToggleRowSelection={page.handleToggleRowSelection}
            collapsedShiftIds={page.collapsedShiftIds}
            onToggleShiftCollapse={page.handleToggleShiftCollapse}
            isCalendarHidden={page.isCalendarHidden}
            onCalendarVisibilityChange={page.handleCalendarVisibilityChange}
            colorMode={page.colorMode}
            onColorModeChange={page.handleColorModeChange}
            selectedPart={page.selectedPart}
            onOpenSummaryAction={page.handleOpenSummaryAction}
            onRemoveTeamBonusFromUser={page.handleRemoveTeamBonusFromUser}
          />
        </Grid>

        <Grid size={12}>
          <StaffScheduleErrorsSection
            errors={page.view.activePeriod?.errors}
            onOpenOrderError={page.handleOpenOrderError}
            onOpenCamError={page.handleOpenCamError}
          />
        </Grid>
      </Grid>

      <StaffScheduleDayModal
        modal={page.dayModal}
        onClose={page.handleCloseDayModal}
        onSave={page.handleSaveDayModal}
      />
      <StaffScheduleMonthModal
        modal={page.monthModal}
        onClose={page.handleCloseMonthModal}
        onSave={page.handleSaveMonthModal}
      />
      <StaffScheduleSmenaModal
        modal={page.smenaModal}
        onClose={page.handleCloseSmenaModal}
        onSave={page.handleSaveSmenaModal}
        onRequestDelete={page.handleRequestDeleteSmena}
      />
      <StaffScheduleSummaryActionDialog
        modal={page.summaryActionModal}
        onClose={page.handleCloseSummaryAction}
        onSave={page.handleSaveSummaryAction}
      />
      <StaffScheduleErrorAppealDialog
        modal={page.errorAppealModal}
        onClose={page.handleCloseErrorAppeal}
        onSubmit={page.handleSaveErrorAppeal}
      />
      <page.ConfirmDialog />
      <StaffScheduleFastActionsDialog
        state={page.fastActions}
        access={page.access}
        selectedPart={page.selectedPart}
        monthId={page.monthId}
        pointLabel={page.pointLabel}
        shiftLabel={page.fastActions.shiftLabel}
        onClose={page.handleCloseFastActions}
        onBackToHub={page.handleEditDialogBackToHub}
        onOpenSchedule={page.handleEditDialogOpenSchedule}
        onOpenShift={page.handleEditDialogOpenShift}
        onOpenPoint={page.handleEditDialogOpenPoint}
        onApplyScheduleDraft={page.handleEditDialogApplyScheduleDraft}
        onApplyShiftDraft={page.handleEditDialogApplyShiftDraft}
        onApplyPointDraft={page.handleEditDialogApplyPointDraft}
        onSaveChanges={page.handleEditDialogSaveChanges}
      />
      <StaffScheduleExportDialog
        dialog={page.exportDialog}
        onClose={page.handleCloseExportDialog}
        onDateStartChange={page.handleExportDateStartChange}
        onDateEndChange={page.handleExportDateEndChange}
        onDownload={page.handleExportDownload}
      />
      <StaffScheduleAccessTester page={page} />
    </Box>
  );
}
