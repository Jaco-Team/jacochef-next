import { Box, Button, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MySelect } from "@/ui/Forms";

export default function StaffScheduleHeaderSection({ page }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: "8px", overflow: "hidden" }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            mb: 1.5,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 700, fontSize: { xs: 24, md: 28 } }}
          >
            {page.view.moduleName}
          </Typography>

          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={page.handleReload}
            disabled={page.isGraphLoading}
            sx={{
              minHeight: 36,
              px: 2,
              borderRadius: "8px",
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Обновить
          </Button>
        </Box>

        <Tabs
          value={page.selectedPart}
          onChange={(_, nextValue) => page.setSelectedPart(nextValue)}
          sx={{
            minHeight: 36,
            mb: 2,
            borderBottom: "1px solid #E5E7EB",
            "& .MuiTabs-indicator": {
              backgroundColor: "#df1f26",
            },
            "& .MuiTab-root": {
              minHeight: 36,
              minWidth: 0,
              px: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
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

        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid size={{ xs: 12, md: 3 }}>
            <MySelect
              is_none={false}
              data={page.points}
              value={page.pointId}
              func={page.handlePointChange}
              label="Точка"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <MySelect
              is_none={false}
              data={page.months}
              value={page.monthId}
              func={page.handleMonthChange}
              label="Месяц"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 0.25, md: 1.5 }}
              justifyContent="flex-end"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Режим:{" "}
                <Box
                  component="span"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {page.view.graphKind || "—"}
                </Box>
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Ошибки кухни:{" "}
                <Box
                  component="span"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {page.view.stats.ordersErrorCount}
                </Box>
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Ошибки камер:{" "}
                <Box
                  component="span"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {page.view.stats.camErrorCount}
                </Box>
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Дни / строки:{" "}
                <Box
                  component="span"
                  sx={{ color: "text.primary", fontWeight: 700 }}
                >
                  {page.view.stats.daysCount} / {page.view.stats.rowsCount}
                </Box>
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
