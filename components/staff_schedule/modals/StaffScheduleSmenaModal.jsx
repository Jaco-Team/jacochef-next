import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { MyTextInput } from "@/ui/Forms";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";

function buildDraft(data) {
  return {
    name: data?.name ?? "",
    users: Array.isArray(data?.users)
      ? data.users.map((item) => ({
          id: item?.id ?? "",
          name: item?.name ?? "",
          app_id: item?.app_id ?? "",
          is_my: Number(item?.is_my) === 1 ? 1 : 0,
        }))
      : [],
  };
}

export default function StaffScheduleSmenaModal({ modal, onClose, onSave, onRequestDelete }) {
  const [draft, setDraft] = useState(() => buildDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    setDraft(buildDraft(modal.data));
    setSaveError("");
    setIsSaving(false);
  }, [modal.open, modal.data]);

  const toggleUser = (userId) => {
    setDraft((prev) => ({
      ...prev,
      users: prev.users.map((item) =>
        String(item.id) === String(userId) ? { ...item, is_my: item.is_my === 1 ? 0 : 1 } : item,
      ),
    }));
  };

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await onSave({
        id: modal.request?.id,
        name: draft.name,
        users: draft.users,
      });
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить смену");
      setIsSaving(false);
    }
  };

  const actions =
    modal.loading || !modal.data ? null : (
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ width: "100%", pt: 1 }}
      >
        <Stack
          direction="row"
          spacing={1.5}
        >
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={isSaving}
            sx={{ minHeight: 40, textTransform: "none", fontWeight: 700 }}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onClose}
            disabled={isSaving}
            sx={{ minHeight: 40, textTransform: "none", fontWeight: 700 }}
          >
            Отмена
          </Button>
        </Stack>

        {modal.mode === "edit" && onRequestDelete ? (
          <Button
            variant="outlined"
            color="error"
            onClick={onRequestDelete}
            disabled={isSaving}
            sx={{ minHeight: 40, textTransform: "none", fontWeight: 700 }}
          >
            Удалить смену
          </Button>
        ) : null}
      </Stack>
    );

  return (
    <StaffScheduleResponsiveModal
      open={modal.open}
      onClose={onClose}
      title={modal.mode === "create" ? "Новая смена" : "Редактирование смены"}
      maxWidth="sm"
      actions={actions}
    >
      <Stack spacing={2}>
        {modal.error ? <Alert severity="error">{modal.error}</Alert> : null}
        {saveError ? <Alert severity="error">{saveError}</Alert> : null}

        {modal.loading ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <CircularProgress
              size={28}
              sx={{ mb: 1.5 }}
            />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Загрузка смены...
            </Typography>
          </Box>
        ) : null}

        {!modal.loading && modal.data ? (
          <>
            <MyTextInput
              label="Название смены"
              value={draft.name}
              func={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />

            <List
              dense
              sx={{
                border: "1px solid #E5E5E5",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {draft.users.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={item.is_my === 1}
                  onClick={() => toggleUser(item.id)}
                >
                  <ListItemText primary={item.name || "Без имени"} />
                </ListItemButton>
              ))}
            </List>
          </>
        ) : null}
      </Stack>
    </StaffScheduleResponsiveModal>
  );
}
