import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import Grid from "@mui/material/Grid";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import { V2Button, V2IconButton, V2SegmentedTabs, V2Select } from "@/ui/v2";

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
      <V2Button
        startIcon={<RefreshIcon />}
        onClick={page.handleReload}
        disabled={page.isGraphLoading}
        sx={{ minWidth: 126, fontWeight: 500 }}
      >
        Обновить
      </V2Button>

      {canExportWorkSchedule ? (
        <>
          <V2IconButton
            onClick={() => page.handleOpenExportDialog("ws")}
            aria-label="Распечатать график работ"
            sx={softActionSx}
          >
            <PrintOutlinedIcon fontSize="small" />
          </V2IconButton>
          <V2IconButton
            onClick={() => page.handleOpenExportDialog("ws")}
            aria-label="Скачать график работ"
            sx={softActionSx}
          >
            <FileDownloadOutlinedIcon fontSize="small" />
          </V2IconButton>
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
        <Grid size={6}>
          <V2Button
            fullWidth
            tone="secondary"
            onClick={() => page.handleOpenExportDialog("hj")}
            startIcon={<HealthAndSafetyOutlinedIcon />}
            sx={{
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
            }}
          >
            Журнал здоровья
          </V2Button>
        </Grid>
      ) : null}

      <Grid size={canExportHealthJournal ? 6 : 12}>
        <V2Button
          fullWidth
          startIcon={<RefreshIcon />}
          onClick={page.handleReload}
          disabled={page.isGraphLoading}
          sx={{ minHeight: 44, fontWeight: 500 }}
        >
          Обновить
        </V2Button>
      </Grid>
    </Grid>
  );
}

export default function StaffScheduleHeaderSection({ page, isMobile = false }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
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
      <Box
        sx={{
          mb: 1.25,
          "& h1": {
            m: 0,
            fontSize: { xs: 18, md: 20 },
            lineHeight: 1.2,
            fontWeight: 700,
            color: "#111827",
          },
        }}
      >
        <h1>{page.view.moduleName}</h1>
      </Box>

      <Grid
        container
        spacing={1.25}
        sx={{ mb: 1.5 }}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <V2Select
            allowNone={false}
            options={page.points}
            value={page.pointId}
            onChange={page.handlePointChange}
            label="Кафе"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <V2Select
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

      <V2SegmentedTabs
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
          <V2Select
            allowNone={false}
            options={page.view.shiftOptions}
            value={page.selectedShiftId}
            onChange={page.handleShiftChange}
            label="Смена"
          />
        </Grid>

        {!isMobile && canExportHealthJournal ? (
          <Grid size={{ xs: 12, md: 4 }}>
            <V2Button
              fullWidth
              tone="secondary"
              onClick={() => page.handleOpenExportDialog("hj")}
              startIcon={<HealthAndSafetyOutlinedIcon />}
              sx={{
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
              }}
            >
              Журнал здоровья
            </V2Button>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
