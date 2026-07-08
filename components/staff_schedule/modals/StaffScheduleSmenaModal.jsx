import { useEffect, useMemo, useRef, useState } from "react";
import { Divider, Stack, Typography } from "@mui/material";
import {
  V2Alert,
  V2Button,
  V2SelectableList,
  V2SelectableListItem,
  V2TextInput,
  useConfirm,
} from "@/ui/v2";
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
  const initialDraftRef = useRef(buildDraft(modal.data));
  const [saveError, setSaveError] = useState("");
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    const nextDraft = buildDraft(modal.data);

    initialDraftRef.current = nextDraft;
    setDraft(nextDraft);
    setSaveError("");
  }, [modal.open, modal.data]);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraftRef.current),
    [draft],
  );

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

    setSaveError("");

    try {
      await onSave({
        id: modal.request?.id,
        name: draft.name,
        users: draft.users,
      });
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить смену");
    }
  };

  const handleRequestClose = async () => {
    if (!hasChanges) {
      onClose?.();
      return;
    }

    const accepted = await confirm({
      message: (
        <Typography sx={{ color: "#666666", fontSize: 20, textAlign: "center", lineHeight: 1.25 }}>
          Данные были изменены.
          <br />
          Закрыть без сохранения?
        </Typography>
      ),
      confirmLabel: "Да, закрыть",
    });

    if (accepted) {
      onClose?.();
    }
  };

  const actions =
    modal.loading || !modal.data ? null : (
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ width: "100%", pt: 1 }}
      >
        <V2Button
          compact
          tone="success"
          onClick={handleSave}
        >
          Сохранить
        </V2Button>
        <V2Button
          compact
          tone="danger"
          onClick={handleRequestClose}
        >
          Отмена
        </V2Button>
      </Stack>
    );

  return (
    <>
      <StaffScheduleResponsiveModal
        open={modal.open}
        onClose={handleRequestClose}
        title={modal.mode === "create" ? "Новая смена" : "Редактирование смены"}
        maxWidth="sm"
        actions={actions}
      >
        <Stack spacing={2}>
          {modal.error ? <V2Alert severity="error">{modal.error}</V2Alert> : null}
          {saveError ? <V2Alert severity="error">{saveError}</V2Alert> : null}

          {!modal.loading && modal.data ? (
            <>
              <V2TextInput
                label="Название смены"
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />

              <V2SelectableList>
                {draft.users.map((item) => (
                  <V2SelectableListItem
                    key={item.id}
                    label={item.name || "Без имени"}
                    selected={item.is_my === 1}
                    onClick={() => toggleUser(item.id)}
                  />
                ))}
                {modal.mode === "edit" && onRequestDelete ? (
                  <>
                    <Divider />
                    <V2SelectableListItem
                      label="Удалить смену"
                      destructive
                      selected
                      onClick={onRequestDelete}
                    />
                  </>
                ) : null}
              </V2SelectableList>
            </>
          ) : null}
        </Stack>
      </StaffScheduleResponsiveModal>
      <ConfirmDialog />
    </>
  );
}
