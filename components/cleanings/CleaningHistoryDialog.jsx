import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryLog from "@/ui/history/HistoryLog";

export default function CleaningHistoryDialog({
  open,
  item,
  history = [],
  loading = false,
  onClose,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>История изменений</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>{item?.name || ""}</Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <HistoryLog
            history={history}
            defaultExpanded
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
