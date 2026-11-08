import { Box, Button, Grid, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MyDatePickerNewViews, MySelect } from "@/ui/Forms";

const actionButtonSx = {
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  lineHeight: "20px",
  whiteSpace: "nowrap",
};

export default function CleaningsLampFilters({
  dateFrom,
  dateTo,
  locationId,
  locationOptions,
  loading,
  canEdit,
  canExport,
  onDateFromChange,
  onDateToChange,
  onLocationChange,
  onRefresh,
  onAddLamp,
  onExport,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: "8px", overflow: "hidden" }}
    >
      <Grid
        container
        spacing={1.5}
        sx={{ p: 1.5 }}
        alignItems="center"
      >
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <MyDatePickerNewViews
            label="Дата от"
            views={["month", "year"]}
            value={dateFrom}
            func={onDateFromChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <MyDatePickerNewViews
            label="Дата до"
            views={["month", "year"]}
            value={dateTo}
            func={onDateToChange}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MySelect
            label="Точка"
            data={locationOptions}
            value={locationId}
            func={onLocationChange}
            is_none={false}
            disabled={locationOptions.length <= 1}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "stretch", md: "flex-end" },
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
              sx={actionButtonSx}
            >
              Обновить
            </Button>
            {canEdit ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddLamp}
                sx={actionButtonSx}
              >
                Добавить лампу
              </Button>
            ) : null}
            {canExport ? (
              <Button
                variant="outlined"
                startIcon={<DownloadOutlinedIcon />}
                onClick={onExport}
                sx={actionButtonSx}
              >
                XLS
              </Button>
            ) : null}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
