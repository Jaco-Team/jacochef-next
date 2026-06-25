import dayjs from "dayjs";
import { Alert, Box, CircularProgress, Grid } from "@mui/material";
import { V2Button, V2DatePicker } from "@/ui/v2";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

const EXPORT_TITLES = {
  ws: "График работ",
  hj: "Журнал здоровья",
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
          <V2Button
            compact
            tone="success"
            onClick={onDownload}
            disabled={dialog?.loading}
            sx={{ minWidth: 112, borderRadius: "8px" }}
          >
            {dialog?.loading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              "Скачать"
            )}
          </V2Button>
          <V2Button
            compact
            tone="secondary"
            onClick={onClose}
            disabled={dialog?.loading}
            sx={{ minWidth: 112, borderRadius: "8px" }}
          >
            Отмена
          </V2Button>
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
          <V2DatePicker
            label="Дата от"
            value={dialog?.dateStart ? dayjs(dialog.dateStart) : null}
            minDate={dayjs("2023-05-01")}
            maxDate={dialog?.dateEnd ? dayjs(dialog.dateEnd) : null}
            func={(value) => onDateStartChange(value ? value.format("YYYY-MM-DD") : "")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <V2DatePicker
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
