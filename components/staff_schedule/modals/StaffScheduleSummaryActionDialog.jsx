import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  V2Alert,
  V2Button,
  V2SelectableList,
  V2SelectableListItem,
  V2TextInput,
  useConfirm,
} from "@/ui/v2";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

function buildInitialValue(modal) {
  return modal?.data?.value ?? "";
}

export default function StaffScheduleSummaryActionDialog({ modal, onClose, onSave }) {
  const [value, setValue] = useState(() => buildInitialValue(modal));
  const [saveError, setSaveError] = useState("");
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    setValue(buildInitialValue(modal));
    setSaveError("");
  }, [modal]);

  const options = useMemo(() => modal?.data?.options ?? [], [modal?.data?.options]);
  const isListMode = options.length > 0;
  const initialValue = buildInitialValue(modal);
  const hasChanges = String(value) !== String(initialValue);

  const handleSave = async () => {
    if (!onSave) {
      return;
    }

    if (!hasChanges) {
      return;
    }

    setSaveError("");

    const accepted = await confirm({
      message: (
        <Typography sx={{ ...staffScheduleModalTypography.title, textAlign: "center" }}>
          Сохранить изменения?
        </Typography>
      ),
      confirmLabel: "Да, сохранить",
    });

    if (!accepted) {
      return;
    }

    try {
      await onSave({
        mode: modal?.mode,
        value,
        request: modal?.request,
      });
    } catch (error) {
      setSaveError(error?.message || "Не удалось сохранить изменения");
    }
  };

  const actions = (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1.5}
      sx={{ width: "100%" }}
    >
      <V2Button
        compact
        tone="secondary"
        onClick={onClose}
        sx={{ minWidth: 108, minHeight: 44, borderRadius: "12px", fontSize: 16, fontWeight: 500 }}
      >
        Отмена
      </V2Button>
      <V2Button
        compact
        tone="primary"
        onClick={handleSave}
        disabled={value === "" || !hasChanges}
        sx={{ minWidth: 112, minHeight: 44, borderRadius: "12px", fontSize: 16 }}
      >
        Сохранить
      </V2Button>
    </Stack>
  );

  return (
    <>
      <StaffScheduleResponsiveModal
        open={modal.open}
        onClose={onClose}
        title="Изменение"
        maxWidth="sm"
        paperSx={{ maxWidth: 520 }}
        contentSx={{ px: 2.5, pt: 2.5, pb: 2 }}
        actions={actions}
        actionsSx={{ px: 2.5, pt: 1, pb: 2.5 }}
      >
        <Stack spacing={2}>
          {modal.error ? <V2Alert severity="error">{modal.error}</V2Alert> : null}
          {saveError ? <V2Alert severity="error">{saveError}</V2Alert> : null}

          {modal?.data?.title ? (
            <Typography sx={staffScheduleModalTypography.fieldValue}>{modal.data.title}</Typography>
          ) : null}

          {isListMode ? (
            <V2SelectableList sx={{ p: 0 }}>
              {options.map((item) => {
                const optionValue = item?.id ?? "";
                const selected = String(value) === String(optionValue);

                return (
                  <V2SelectableListItem
                    key={String(optionValue)}
                    selected={selected}
                    onClick={() => setValue(optionValue)}
                    sx={{
                      minHeight: 52,
                      px: 2,
                      "&.Mui-selected": {
                        backgroundColor: "#E5E5E5",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "#DCDCDC",
                      },
                    }}
                  >
                    <Typography sx={staffScheduleModalTypography.fieldValue}>
                      {item?.name ?? ""}
                    </Typography>
                  </V2SelectableListItem>
                );
              })}
            </V2SelectableList>
          ) : (
            <Stack spacing={1.5}>
              <V2TextInput
                label={modal?.data?.label || "Значение"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />

              {modal?.data?.fullAmount !== undefined && modal?.data?.fullAmount !== null ? (
                <Typography sx={staffScheduleModalTypography.helperText}>
                  Вся сумма:{" "}
                  <Box
                    component="span"
                    onClick={() => setValue(String(modal.data.fullAmount))}
                    sx={{
                      color: "#EE2737",
                      borderBottom: "1px dotted #EE2737",
                      cursor: "pointer",
                    }}
                  >
                    {modal.data.fullAmount}
                  </Box>
                </Typography>
              ) : null}
            </Stack>
          )}
        </Stack>
      </StaffScheduleResponsiveModal>
      <ConfirmDialog />
    </>
  );
}
