import dayjs from "dayjs";
import { Box, Grid } from "@mui/material";
import { JacoAlert, JacoButton, JacoDatePicker } from "@/design-system/shared/ui";
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
          <JacoButton
            compact
            tone="success"
            onClick={onDownload}
            sx={{ minWidth: 112, borderRadius: "8px" }}
          >
            Скачать
          </JacoButton>
          <JacoButton
            compact
            tone="secondary"
            onClick={onClose}
            sx={{ minWidth: 112, borderRadius: "8px" }}
          >
            Отмена
          </JacoButton>
        </Box>
      }
    >
      {dialog?.error ? (
        <JacoAlert
          severity="error"
          sx={{ mb: 2 }}
        >
          {dialog.error}
        </JacoAlert>
      ) : null}

      <Grid
        container
        spacing={2.5}
        sx={{ pt: 0.5 }}
      >
        <Grid size={{ xs: 12, sm: 6 }}>
          <JacoDatePicker
            label="Дата от"
            value={dialog?.dateStart ? dayjs(dialog.dateStart) : null}
            minDate={dayjs("2023-05-01")}
            maxDate={dialog?.dateEnd ? dayjs(dialog.dateEnd) : null}
            onChange={(value) => onDateStartChange(value ? value.format("YYYY-MM-DD") : "")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <JacoDatePicker
            label="Дата до"
            value={dialog?.dateEnd ? dayjs(dialog.dateEnd) : null}
            minDate={dialog?.dateStart ? dayjs(dialog.dateStart) : dayjs("2023-05-01")}
            onChange={(value) => onDateEndChange(value ? value.format("YYYY-MM-DD") : "")}
          />
        </Grid>
      </Grid>
    </StaffScheduleResponsiveModal>
  );
}
