import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MyDrawer from "@/ui/MyDrawer";

export default function StaffScheduleResponsiveModal({
  open,
  onClose,
  title,
  maxWidth = "md",
  children,
  actions = null,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    return (
      <MyDrawer
        open={open}
        onClose={onClose}
        title={title}
      >
        {children}
        {actions}
      </MyDrawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      scroll="body"
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #ECECEC",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            minWidth: 0,
          }}
        >
          <Typography
            component="span"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: 28,
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#1F2937",
              wordBreak: "break-word",
            }}
          >
            {title}
          </Typography>
          <IconButton
            aria-label="закрыть"
            onClick={onClose}
            size="small"
            sx={{
              mt: 0.25,
              flexShrink: 0,
              alignSelf: "flex-start",
              color: "#6B7280",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2 }}>{children}</DialogContent>
      {actions ? <DialogActions sx={{ px: 3, pb: 3 }}>{actions}</DialogActions> : null}
    </Dialog>
  );
}
