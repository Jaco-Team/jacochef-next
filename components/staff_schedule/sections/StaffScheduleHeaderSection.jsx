import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import {
  JacoButton,
  JacoIconButton,
  JacoSegmentedTabs,
  JacoSelect,
} from "@/design-system/shared/ui";

const secondaryActionButtonSx = {
  minHeight: 44,
  backgroundColor: "#E5E5E5",
  border: "none",
  color: "#666666",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: "#DCDCDC",
    border: "none",
  },
  "&.Mui-disabled": {
    backgroundColor: "#E5E5E5",
    color: "#A6A6A6",
  },
};

function DesktopHeaderActions({ page, canExportWorkSchedule, softActionSx }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 1,
        flexWrap: "nowrap",
      }}
    >
      <JacoButton
        startIcon={<RefreshIcon />}
        onClick={page.handleReload}
        disabled={page.isGraphLoading}
        sx={{ minWidth: 126, fontWeight: 500 }}
      >
        Обновить
      </JacoButton>

      {canExportWorkSchedule ? (
        <>
          <JacoIconButton
            onClick={() => page.handleOpenExportDialog("ws")}
            aria-label="Распечатать график работ"
            sx={softActionSx}
          >
            <PrintOutlinedIcon fontSize="small" />
          </JacoIconButton>
          <JacoIconButton
            onClick={() => page.handleOpenExportDialog("ws")}
            aria-label="Скачать график работ"
            sx={softActionSx}
          >
            <FileDownloadOutlinedIcon fontSize="small" />
          </JacoIconButton>
        </>
      ) : null}
    </Box>
  );
}

function MobileHeaderActions({ page, canExportHealthJournal }) {
  return (
    <Grid
      container
      spacing={1.25}
    >
      {canExportHealthJournal ? (
        <Grid size={{ xs: 12, sm: 6 }}>
          <JacoButton
            fullWidth
            tone="secondary"
            onClick={() => page.handleOpenExportDialog("hj")}
            startIcon={<HealthAndSafetyOutlinedIcon />}
            sx={secondaryActionButtonSx}
          >
            Журнал здоровья
          </JacoButton>
        </Grid>
      ) : null}

      <Grid size={canExportHealthJournal ? { xs: 12, sm: 6 } : 12}>
        <JacoButton
          fullWidth
          startIcon={<RefreshIcon />}
          onClick={page.handleReload}
          disabled={page.isGraphLoading}
          sx={{ minHeight: 44, fontWeight: 500 }}
        >
          Обновить
        </JacoButton>
      </Grid>
    </Grid>
  );
}

export default function StaffScheduleHeaderSection({ page, isMobile = false }) {
  const canExportWorkSchedule = page.canExportWorkSchedule;
  const canExportHealthJournal = page.canExportHealthJournal;
  const softActionSx = {
    backgroundColor: "#E5E5E5",
    border: "none",
    color: "#666666",
    "&:hover": {
      backgroundColor: "#DCDCDC",
    },
    "&.Mui-disabled": {
      backgroundColor: "#E5E5E5",
      color: "#A6A6A6",
    },
  };

  return (
    <Box>
      <Grid
        container
        spacing={1.25}
        sx={{ mb: 1.5 }}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <JacoSelect
            allowNone={false}
            options={page.points}
            value={page.pointId}
            onChange={page.handlePointChange}
            label="Кафе"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <JacoSelect
            allowNone={false}
            options={page.months}
            value={page.monthId}
            onChange={page.handleMonthChange}
            label="Месяц"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {isMobile ? (
            <MobileHeaderActions
              page={page}
              canExportHealthJournal={canExportHealthJournal}
            />
          ) : (
            <DesktopHeaderActions
              page={page}
              canExportWorkSchedule={canExportWorkSchedule}
              softActionSx={softActionSx}
            />
          )}
        </Grid>
      </Grid>

      <JacoSegmentedTabs
        value={page.selectedPart}
        onChange={(_, nextValue) => page.setSelectedPart(nextValue)}
        items={page.view.periodTabs.map((tab, index) => ({
          id: tab.id,
          value: index,
          label: tab.label,
        }))}
        sx={{ mb: 1.5, borderRadius: "10px", minHeight: 40 }}
        tabSx={{
          minHeight: 32,
          fontSize: 16,
          borderRadius: "8px",
        }}
      />

      <Grid
        container
        spacing={1.25}
      >
        <Grid size={{ xs: 12, md: canExportHealthJournal ? 8 : 12 }}>
          <JacoSelect
            allowNone={false}
            options={page.view.shiftOptions}
            value={page.selectedShiftId}
            onChange={page.handleShiftChange}
            label="Смена"
          />
        </Grid>

        {!isMobile && canExportHealthJournal ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <JacoButton
              fullWidth
              tone="secondary"
              onClick={() => page.handleOpenExportDialog("hj")}
              startIcon={<HealthAndSafetyOutlinedIcon />}
              sx={secondaryActionButtonSx}
            >
              Журнал здоровья
            </JacoButton>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
