import { Alert, Backdrop, Box, CircularProgress, Grid } from "@mui/material";
import StaffScheduleConfirmDialog from "./modals/StaffScheduleConfirmDialog";
import StaffScheduleDayModal from "./modals/StaffScheduleDayModal";
import StaffScheduleExportDialog from "./modals/StaffScheduleExportDialog";
import StaffScheduleFastActionsDialog from "./modals/StaffScheduleFastActionsDialog";
import StaffScheduleMonthModal from "./modals/StaffScheduleMonthModal";
import StaffScheduleSmenaModal from "./modals/StaffScheduleSmenaModal";
import useStaffSchedulePage from "./useStaffSchedulePage";
import { PAGE_BOTTOM_PADDING } from "./staffScheduleConstants";
import StaffScheduleHeaderSection from "./sections/StaffScheduleHeaderSection";
import StaffScheduleTableSection from "./sections/StaffScheduleTableSection";

export default function StaffSchedulePage() {
  const page = useStaffSchedulePage();

  return (
    <Box sx={{ pb: PAGE_BOTTOM_PADDING }}>
      <Backdrop
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
        open={page.isBootstrapping}
      >
        <CircularProgress />
      </Backdrop>

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
            <Alert severity="error">{page.error}</Alert>
          </Grid>
        ) : null}

        <Grid size={12}>
          <StaffScheduleTableSection
            period={page.view.activePeriod}
            rows={page.view.visibleRows}
            shownShiftCount={page.view.shownShiftCount}
            summaryColumns={page.view.summaryColumns}
            access={page.access}
            loading={page.isGraphLoading}
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
      <StaffScheduleConfirmDialog
        open={page.confirmDialog.open}
        title={page.confirmDialog.title}
        message={page.confirmDialog.message}
        confirmLabel={page.confirmDialog.confirmLabel}
        onClose={page.handleCloseConfirmDialog}
        onConfirm={page.handleConfirmDialog}
      />
      <StaffScheduleFastActionsDialog
        state={page.fastActions}
        access={page.access}
        selectedPart={page.selectedPart}
        onClose={page.handleCloseFastActions}
        onOpenTimeWeek={page.handleOpenFastActionsTimeWeek}
        onOpenSmenaList={page.handleOpenFastActionsSmenaList}
        onOpenPointList={page.handleOpenFastActionsPointList}
        onSelectSmena={page.handleSelectFastSmena}
        onSelectPoint={page.handleSelectFastPoint}
        onSelectTimeWeekType={page.handleSelectFastTimeWeekType}
      />
      <StaffScheduleExportDialog
        dialog={page.exportDialog}
        onClose={page.handleCloseExportDialog}
        onDateStartChange={page.handleExportDateStartChange}
        onDateEndChange={page.handleExportDateEndChange}
        onDownload={page.handleExportDownload}
      />
    </Box>
  );
}
