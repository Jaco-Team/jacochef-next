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
            outline: "none",
            ...paperSx,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: `1px solid ${v2Colors.borderLight}`,
          backgroundColor: "#F7F7F7",
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
              fontSize: { xs: 16, sm: 16 },
              lineHeight: 1.25,
              fontWeight: 400,
              color: "#666666",
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
              flexShrink: 0,
              alignSelf: "center",
              color: "#A6A6A6",
              p: 0,
              mr: -0.25,
              ...closeButtonSx,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 2,
            backgroundColor: "#FFFFFF",
            ...contentSx,
          }}
        >
          {children}
        </Box>
      </DialogContent>
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
