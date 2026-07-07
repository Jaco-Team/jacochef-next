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
import { v2Colors, v2Radii } from "@/ui/v2";
import { buildStaffScheduleModalProps } from "./staffScheduleModalPresets";

const mobileSheetPaperSx = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: "92vh",
  overflow: "hidden",
  backgroundColor: "#FFFFFF",
};

const mobileSheetHandleSx = {
  width: 34,
  height: 4,
  borderRadius: 999,
  backgroundColor: "#CFCFCF",
};

const mobileSheetIconButtonSx = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#A6A6A6",
};

const desktopDialogTitleWrapSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  minWidth: 0,
  width: "100%",
};

function MobileSheetHeader({ title, onBack, onClose, titleSx, titleContainerSx, closeButtonSx }) {
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
        <Box sx={mobileSheetHandleSx} />
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
          sx={{
            ...mobileSheetIconButtonSx,
            left: 12,
          }}
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
        sx={{
          ...mobileSheetIconButtonSx,
          right: 12,
          ...closeButtonSx,
        }}
      >
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}

function MobileStaffScheduleSheet({
  open,
  onClose,
  title,
  onBack,
  children,
  actions,
  titleSx,
  titleContainerSx,
  contentSx,
  paperSx,
  actionsSx,
  closeButtonSx,
}) {
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
          ...mobileSheetPaperSx,
          ...paperSx,
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
          titleSx={titleSx}
          titleContainerSx={titleContainerSx}
          closeButtonSx={closeButtonSx}
        />

        <Box
          sx={{
            overflowY: "auto",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              px: 2,
              pt: 2,
              pb: 2,
              backgroundColor: "#FFFFFF",
              ...contentSx,
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
            }}
          >
            {actions}
          </Box>
        ) : null}
      </Box>
    </SwipeableDrawer>
  );
}

export default function StaffScheduleResponsiveModal({
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const modalProps = buildStaffScheduleModalProps({
    titleSx,
    titleContainerSx,
    contentSx,
    paperSx,
    actionsSx,
    closeButtonSx,
  });

  if (isMobile) {
    return (
      <MobileStaffScheduleSheet
        open={open}
        onClose={onClose}
        title={title}
        onBack={onBack}
        actions={actions}
        titleSx={modalProps.titleSx}
        titleContainerSx={modalProps.titleContainerSx}
        contentSx={modalProps.contentSx}
        paperSx={modalProps.paperSx}
        actionsSx={modalProps.actionsSx}
        closeButtonSx={modalProps.closeButtonSx}
      >
        {children}
      </MobileStaffScheduleSheet>
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
            ...modalProps.paperSx,
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
          ...modalProps.titleContainerSx,
        }}
      >
        <Box
          sx={{
            ...desktopDialogTitleWrapSx,
          }}
        >
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
              ...modalProps.titleSx,
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
              ...modalProps.closeButtonSx,
            }}
          >
            <CloseRoundedIcon fontSize="small" />
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
            ...modalProps.contentSx,
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
            ...modalProps.actionsSx,
          }}
        >
          {actions}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
