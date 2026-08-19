import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

function ConfirmationBody({ category }) {
  return (
    <>
      <Typography sx={{ color: "#6B6B6B", mb: 1.5 }}>
        Закрыть все товары в категории «{category?.name || "Категория"}»?
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "#8A8A8A" }}
      >
        По текущим данным товаров: {category?.count || 0}. Сервер повторно проверит состав перед
        сохранением.
      </Typography>
    </>
  );
}

export default function CloseConfirmationSheet({ open, category, pending, onClose, onConfirm }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onClose={pending ? undefined : onClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Подтвердите закрытие</DialogTitle>
        <DialogContent>
          <ConfirmationBody category={category} />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={onClose}
            disabled={pending}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={pending}
            sx={{ bgcolor: "#c03", "&:hover": { bgcolor: "#a8002b" } }}
          >
            Закрыть все
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={pending ? undefined : onClose}
      onOpen={() => {}}
      disableDiscovery={pending}
      ModalProps={{
        sx: { zIndex: (theme) => theme.zIndex.modal + 2 },
      }}
      PaperProps={{
        sx: { width: "100%", maxWidth: "100vw", boxSizing: "border-box" },
      }}
    >
      <Box sx={{ p: 3, width: "100%", boxSizing: "border-box" }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 700 }}
        >
          Подтвердите закрытие
        </Typography>
        <ConfirmationBody category={category} />
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          disabled={pending}
          sx={{
            mt: 3,
            minHeight: 44,
            borderRadius: "14px",
            bgcolor: "#c03",
            "&:hover": { bgcolor: "#a8002b" },
          }}
        >
          Закрыть все
        </Button>
        <Button
          fullWidth
          onClick={onClose}
          disabled={pending}
          sx={{ mt: 1.5, minHeight: 44 }}
        >
          Отмена
        </Button>
      </Box>
    </SwipeableDrawer>
  );
}
