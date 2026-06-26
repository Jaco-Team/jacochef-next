import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import { V2Button, V2IconButton, V2SegmentedTabs, V2Select } from "@/ui/v2";

export default function StaffScheduleHeaderSection({ page }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const canExport = page.canExport;
  const fieldBoxSx = { flex: 1, minWidth: 0 };

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

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", md: "flex-end" }}
        sx={{ mb: 1.5 }}
      >
        <Box sx={fieldBoxSx}>
          <V2Select
            allowNone={false}
            options={page.points}
            value={page.pointId}
            onChange={page.handlePointChange}
            label="Кафе"
          />
        </Box>

        <Box sx={fieldBoxSx}>
          <V2Select
            allowNone={false}
            options={page.months}
            value={page.monthId}
            onChange={page.handleMonthChange}
            label="Месяц"
          />
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
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

            {isDesktop ? (
              <>
                <V2IconButton
                  disabled={!canExport}
                  onClick={() => page.handleOpenExportDialog("ws")}
                  aria-label="Распечатать график работ"
                >
                  <PrintOutlinedIcon fontSize="small" />
                </V2IconButton>
                <V2IconButton
                  disabled={!canExport}
                  onClick={() => page.handleOpenExportDialog("ws")}
                  aria-label="Скачать график работ"
                >
                  <FileDownloadOutlinedIcon fontSize="small" />
                </V2IconButton>
              </>
            ) : null}
          </Box>
        </Box>
      </Stack>

      <V2SegmentedTabs
        value={page.selectedPart}
        onChange={(_, nextValue) => page.setSelectedPart(nextValue)}
        items={page.view.periodTabs.map((tab, index) => ({
          id: tab.id,
          value: index,
          label: tab.label,
        }))}
        sx={{ mb: 1.5, borderRadius: "10px", "& .MuiTabs-root": { minHeight: 40 } }}
        tabSx={{
          minHeight: 40,
          fontSize: 16,
          borderRadius: "8px",
        }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", md: "flex-end" }}
      >
        <Box sx={fieldBoxSx}>
          <V2Select
            allowNone={false}
            options={page.view.shiftOptions}
            value={page.selectedShiftId}
            onChange={page.handleShiftChange}
            label="Смена"
          />
        </Box>

        <Box sx={{ width: { xs: "100%", md: 382 }, flexShrink: 0 }}>
          <V2Button
            fullWidth
            disabled={!canExport}
            onClick={() => page.handleOpenExportDialog("hj")}
            startIcon={<HealthAndSafetyOutlinedIcon />}
            sx={{
              color: canExport ? "#FFFFFF" : "#666666",
              fontWeight: 500,
            }}
          >
            Журнал здоровья
          </V2Button>
        </Box>
      </Stack>
    </Box>
  );
}
