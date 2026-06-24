import dayjs from "dayjs";
import { Alert, Box, Button, CircularProgress, Grid } from "@mui/material";
import { MyDatePickerNew } from "@/ui/Forms";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

const EXPORT_TITLES = {
  ws: "График работ",
  hj: "Журнал здоровья",
};

const actionButtonSx = {
  minHeight: 40,
  minWidth: 112,
  px: 2,
  borderRadius: "8px",
  fontWeight: 700,
  textTransform: "none",
};

export default function StaffScheduleExportDialog({
  dialog,
  onClose,
  onDateStartChange,
  onDateEndChange,
  onDownload,
}) {
  const title = EXPORT_TITLES[dialog?.mode] || EXPORT_TITLES.ws;

  return (
    <StaffScheduleResponsiveModal
      open={Boolean(dialog?.open)}
      onClose={onClose}
      title={title}
      maxWidth="md"
      actions={
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            width: "100%",
            px: { xs: 0, sm: 1 },
            pb: { xs: 0, sm: 0.5 },
          }}
        >
          <Button
            variant="contained"
            onClick={onDownload}
            disabled={dialog?.loading}
            sx={{
              ...actionButtonSx,
              backgroundColor: "#16A34A",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#15803D",
                boxShadow: "none",
              },
            }}
          >
            {dialog?.loading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              "Скачать"
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={dialog?.loading}
            sx={actionButtonSx}
          >
            Отмена
          </Button>
        </Box>
      }
    >
      {dialog?.error ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {dialog.error}
        </Alert>
      ) : null}

      <Grid
        container
        spacing={2.5}
        sx={{ pt: 0.5 }}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <MyDatePickerNew
            label="Дата от"
            value={dialog?.dateStart ? dayjs(dialog.dateStart) : null}
            minDate={dayjs("2023-05-01")}
            maxDate={dialog?.dateEnd ? dayjs(dialog.dateEnd) : null}
            func={(value) => onDateStartChange(value ? value.format("YYYY-MM-DD") : "")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MyDatePickerNew
            label="Дата до"
            value={dialog?.dateEnd ? dayjs(dialog.dateEnd) : null}
            minDate={dialog?.dateStart ? dayjs(dialog.dateStart) : dayjs("2023-05-01")}
            func={(value) => onDateEndChange(value ? value.format("YYYY-MM-DD") : "")}
          />
        </Grid>
      </Grid>
    </StaffScheduleResponsiveModal>
  );
}
