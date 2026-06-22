import { Alert, Backdrop, Box, CircularProgress, Grid } from "@mui/material";
import useStaffSchedulePage from "./useStaffSchedulePage";
import StaffScheduleHeaderSection from "./sections/StaffScheduleHeaderSection";
import StaffScheduleTableSection from "./sections/StaffScheduleTableSection";

export default function StaffSchedulePage() {
  const page = useStaffSchedulePage();

  return (
    <Box sx={{ pb: 4 }}>
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
            summaryColumns={page.view.summaryColumns}
            access={page.access}
            loading={page.isGraphLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
