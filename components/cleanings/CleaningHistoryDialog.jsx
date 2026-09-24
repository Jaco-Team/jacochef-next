import { Box, CircularProgress, DialogContent, Typography } from "@mui/material";
import HistoryLog from "@/ui/history/HistoryLog";
import MyModal from "@/ui/MyModal";

export default function CleaningHistoryDialog({
  open,
  item,
  history = [],
  loading = false,
  onClose,
  hiddenFields = [],
}) {
  return (
    <MyModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title="История изменений"
    >
      <DialogContent sx={{ pt: 0, pb: 2 }}>
        <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 2 }}>
          {item?.name || ""}
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <HistoryLog
            history={history}
            defaultExpanded
            hiddenFields={hiddenFields}
          />
        )}
      </DialogContent>
    </MyModal>
  );
}
