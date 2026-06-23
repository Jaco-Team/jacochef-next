import { DialogActions, DialogContent, useMediaQuery, useTheme } from "@mui/material";
import MyDrawer from "@/ui/MyDrawer";
import MyModal from "@/ui/MyModal";

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
    <MyModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
    >
      <DialogContent sx={{ pt: 1.5, pb: 2 }}>{children}</DialogContent>
      {actions ? <DialogActions sx={{ px: 3, pb: 3 }}>{actions}</DialogActions> : null}
    </MyModal>
  );
}
