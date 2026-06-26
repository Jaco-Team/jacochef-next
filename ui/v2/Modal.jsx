import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import { v2Colors, v2Radii } from "./tokens";

function ModalTitle({ title, onBack }) {
  if (!onBack) {
    return title;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <IconButton
        aria-label="назад"
        onClick={onBack}
        size="small"
        sx={{ color: "#6B7280", flexShrink: 0 }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <Typography
        component="span"
        sx={{
          fontSize: 18,
          lineHeight: 1.25,
          fontWeight: 700,
          color: "#1F2937",
          wordBreak: "break-word",
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

export default function V2Modal({
  open,
  onClose,
  title,
  onBack = null,
  maxWidth = "md",
  children,
  actions = null,
  titleSx,
  titleContainerSx,
  contentSx,
  paperSx,
  actionsSx,
  closeButtonSx,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const titleNode = (
    <ModalTitle
      title={title}
      onBack={onBack}
    />
  );

  if (isMobile) {
    return (
      <MyDrawer
        open={open}
        onClose={onClose}
        title={titleNode}
        actions={actions}
      >
        {children}
      </MyDrawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: v2Radii.md,
            maxHeight: "calc(100% - 48px)",
            ...paperSx,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${v2Colors.borderLight}`,
          backgroundColor: v2Colors.surface,
          ...titleContainerSx,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            minWidth: 0,
            width: "100%",
          }}
        >
          {onBack ? (
            <IconButton
              aria-label="назад"
              onClick={onBack}
              size="small"
              sx={{ mt: 0.25, flexShrink: 0, color: "#6B7280" }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          ) : null}
          <Typography
            component="span"
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              fontSize: { xs: 20, sm: 22 },
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#1F2937",
              wordBreak: "break-word",
              ...titleSx,
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
              alignSelf: "center",
              color: "#6B7280",
              ...closeButtonSx,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 2, ...contentSx }}>{children}</DialogContent>
      {actions ? (
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: `1px solid ${v2Colors.borderLight}`, ...actionsSx }}
        >
          {actions}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
