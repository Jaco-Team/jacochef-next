import { useMemo } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryLog from "@/ui/history/HistoryLog";
import { buildCleaningHistory } from "./helpers";

export default function CleaningHistoryDialog({ open, item, categories, onClose }) {
  const history = useMemo(() => buildCleaningHistory(item, categories), [categories, item]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "12px",
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
        <HistoryLog
          history={history}
          defaultExpanded
        />
      </DialogContent>
    </Dialog>
  );
}
