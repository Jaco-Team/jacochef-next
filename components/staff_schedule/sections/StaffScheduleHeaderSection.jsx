import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, IconButton, Stack, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import { MySelect } from "@/ui/Forms";

const controlRadius = "12px";

export default function StaffScheduleHeaderSection({ page }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <h1>{page.view.moduleName}</h1>
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "flex-end" }}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MySelect
            is_none={false}
            data={page.points}
            value={page.pointId}
            func={page.handlePointChange}
            label="Кафе"
            unifiedPopup
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MySelect
            is_none={false}
            data={page.months}
            value={page.monthId}
            func={page.handleMonthChange}
            label="Месяц"
            unifiedPopup
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
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={page.handleReload}
              disabled={page.isGraphLoading}
              sx={{
                minHeight: 44,
                px: 2.25,
                borderRadius: controlRadius,
                fontSize: 14,
                fontWeight: 700,
                textTransform: "none",
                backgroundColor: "#EE2737",
                boxShadow: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  backgroundColor: "#D91E2D",
                  boxShadow: "none",
                },
              }}
            >
              Обновить
            </Button>

            {isDesktop ? (
              <>
                <IconButton
                  disabled
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: controlRadius,
                    backgroundColor: "#E5E5E5",
                    flexShrink: 0,
                  }}
                >
                  <PrintOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  disabled
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: controlRadius,
                    backgroundColor: "#E5E5E5",
                    flexShrink: 0,
                  }}
                >
                  <FileDownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </>
            ) : null}
          </Box>
        </Box>
      </Stack>

      <Box
        sx={{
          p: 0.5,
          mb: 2,
          borderRadius: controlRadius,
          backgroundColor: "#F2F2F2",
        }}
      >
        <Tabs
          value={page.selectedPart}
          onChange={(_, nextValue) => page.setSelectedPart(nextValue)}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "none",
              borderRadius: controlRadius,
              color: "#666666",
              fontSize: 16,
              fontWeight: 500,
            },
            "& .Mui-selected": {
              backgroundColor: "#FFFFFF",
              color: "#EE2737 !important",
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.08)",
            },
          }}
        >
          {page.view.periodTabs.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label}
            />
          ))}
        </Tabs>
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "flex-end" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <MySelect
            is_none={false}
            data={page.view.shiftOptions}
            value={page.selectedShiftId}
            func={page.handleShiftChange}
            label="Смена"
            unifiedPopup
          />
        </Box>

        <Box sx={{ width: { xs: "100%", md: 382 }, flexShrink: 0 }}>
          <Button
            fullWidth
            variant="contained"
            disabled
            startIcon={<HealthAndSafetyOutlinedIcon />}
            sx={{
              minHeight: 44,
              borderRadius: controlRadius,
              color: "#666666",
              backgroundColor: "#E5E5E5",
              boxShadow: "none",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Журнал здоровья
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
