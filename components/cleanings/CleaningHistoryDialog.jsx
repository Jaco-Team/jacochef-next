import { Box, CircularProgress, Typography } from "@mui/material";
import HistoryLog from "@/ui/history/HistoryLog";
import { JacoModal, uiColors, uiTypography } from "@/design-system/shared/ui";

export default function CleaningHistoryDialog({
  open,
  item,
  history = [],
  loading = false,
  onClose,
  title = "История изменений",
  dateLabel,
}) {
  return (
    <JacoModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="md"
    >
      {item?.name ? (
        <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted, mb: 1.5 }}>
          {item.name}
        </Typography>
      ) : null}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <HistoryLog
          history={history}
          title={title}
          dateLabel={dateLabel}
          defaultExpanded
        />
      )}
    </JacoModal>
  );
}
