import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function Content({ category, pending, onOpenAll, onCloseAll }) {
  return (
    <Stack spacing={2.5}>
      <Typography sx={{ color: "#6B6B6B" }}>
        Выберите итоговое состояние для категории «{category?.name || "Категория"}».
      </Typography>
      <Button
        variant="contained"
        disabled={pending}
        onClick={onOpenAll}
        sx={{
          minHeight: 44,
          borderRadius: "14px",
          bgcolor: "#c03",
          "&:hover": { bgcolor: "#a8002b" },
        }}
      >
        Открыть все
      </Button>
      <Button
        variant="outlined"
        disabled={pending}
        onClick={onCloseAll}
        sx={{ minHeight: 44, borderRadius: "14px", borderColor: "#c03", color: "#c03" }}
      >
        Закрыть все
      </Button>
    </Stack>
  );
}

export default function CategoryActionsSheet({
  open,
  category,
  pending,
  onClose,
  onOpenAll,
  onCloseAll,
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const handleMobileClose = () => {
    if (pending) return;
    onClose?.();
  };
  const handleMobileOpen = () => {};

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onClose={pending ? undefined : onClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Действия с категорией</DialogTitle>
        <DialogContent>
          <Content
            category={category}
            pending={pending}
            onOpenAll={onOpenAll}
            onCloseAll={onCloseAll}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleMobileClose}
      onOpen={handleMobileOpen}
      disableSwipeToOpen={pending}
      ModalProps={{
        sx: { zIndex: (theme) => theme.zIndex.modal + 2 },
      }}
      slotProps={{
        paper: {
          sx: { width: "100%", maxWidth: "100vw", boxSizing: "border-box" },
        },
      }}
    >
      <Box sx={{ p: 3, width: "100%", boxSizing: "border-box" }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 700 }}
        >
          Действия с категорией
        </Typography>
        <Content
          category={category}
          pending={pending}
          onOpenAll={onOpenAll}
          onCloseAll={onCloseAll}
        />
      </Box>
    </SwipeableDrawer>
  );
}
