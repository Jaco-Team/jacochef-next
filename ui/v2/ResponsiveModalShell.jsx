import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { v2Colors, v2Radii } from "./tokens";

const mobileHandleSx = {
  width: 34,
  height: 4,
  borderRadius: 999,
  backgroundColor: "#CFCFCF",
};

const desktopTitleWrapSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  minWidth: 0,
  width: "100%",
};

const mobileIconButtonSx = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#A6A6A6",
};

function MobileSheetHeader({
  title,
  onBack,
  onClose,
  titleSx,
  titleContainerSx,
  closeButtonSx,
  handleSx,
}) {
  if (!title) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 0.75,
          pb: 0.25,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box sx={{ ...mobileHandleSx, ...handleSx }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        px: 2,
        borderBottom: `1px solid ${v2Colors.borderLight}`,
        backgroundColor: "#FFFFFF",
        touchAction: "pan-y",
        ...titleContainerSx,
      }}
    >
      {onBack ? (
        <IconButton
          aria-label="назад"
          onClick={onBack}
          sx={{ ...mobileIconButtonSx, left: 12 }}
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
      ) : null}

      <Typography
        component="span"
        sx={{
          maxWidth: "calc(100% - 88px)",
          textAlign: "center",
          fontSize: 18,
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
        sx={{ ...mobileIconButtonSx, right: 12, ...closeButtonSx }}
      >
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}

export default function ResponsiveModalShell({
  open,
  onClose,
  title,
  onBack = null,
  maxWidth = "md",
  children,
  actions = null,
  desktopBreakpoint = "md",
  titleSx,
  titleContainerSx,
  contentSx,
  paperSx,
  actionsSx,
  closeButtonSx,
  mobileHandleSx: mobileHandleOverrideSx,
  mobileContentSx,
  mobilePaperSx,
  mobileActionsSx,
  mobileTitleSx,
  mobileTitleContainerSx,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(desktopBreakpoint));

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableDiscovery
        disableSwipeToOpen
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "92vh",
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
            ...paperSx,
            ...mobilePaperSx,
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: actions ? "auto minmax(0, 1fr) auto" : "auto minmax(0, 1fr)",
            maxHeight: "92vh",
            backgroundColor: "#FFFFFF",
          }}
        >
          <MobileSheetHeader
            title={title}
            onBack={onBack}
            onClose={onClose}
            titleSx={{ ...titleSx, ...mobileTitleSx }}
            titleContainerSx={{ ...titleContainerSx, ...mobileTitleContainerSx }}
            closeButtonSx={closeButtonSx}
            handleSx={mobileHandleOverrideSx}
          />

          <Box sx={{ overflowY: "auto", backgroundColor: "#FFFFFF" }}>
            <Box
              sx={{
                px: 2,
                pt: 2,
                pb: 2,
                backgroundColor: "#FFFFFF",
                ...contentSx,
                ...mobileContentSx,
              }}
            >
              {children}
            </Box>
          </Box>

          {actions ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                px: 2,
                pt: 1.5,
                pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                borderTop: `1px solid ${v2Colors.borderLight}`,
                backgroundColor: "#FFFFFF",
                ...actionsSx,
                ...mobileActionsSx,
              }}
            >
              {actions}
            </Box>
          ) : null}
        </Box>
      </SwipeableDrawer>
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
        <Box sx={desktopTitleWrapSx}>
          {onBack ? (
            <IconButton
              aria-label="назад"
              onClick={onBack}
              size="small"
              sx={{ mt: 0.25, flexShrink: 0, color: "#6B7280" }}
            >
              <ArrowBackIosNewRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          <Typography
            component="span"
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              fontSize: 16,
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
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: "#FFFFFF" }}>
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
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${v2Colors.borderLight}`,
            ...actionsSx,
          }}
        >
          {actions}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
