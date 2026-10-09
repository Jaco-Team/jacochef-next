import { useEffect, useMemo, useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { alpha, Box, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoSelectableList,
  JacoSelectableListItem,
  JacoTextInput,
  uiColors,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import StaffScheduleResponsiveModal from "./StaffScheduleResponsiveModal";
import { staffScheduleModalTypography } from "./staffScheduleModalTypography";

function buildInitialValue(modal) {
  return modal?.data?.value ?? "";
}

export default function StaffScheduleSummaryActionDialog({ modal, onClose, onSave }) {
  const [value, setValue] = useState(() => buildInitialValue(modal));
  const [saveError, setSaveError] = useState("");
  const { confirm, ConfirmDialog } = useJacoConfirm();

  useEffect(() => {
    if (!modal.open) {
      return;
    }

    setValue(buildInitialValue(modal));
    setSaveError("");
  }, [modal]);

  const options = useMemo(() => modal?.data?.options ?? [], [modal?.data?.options]);
  const isListMode = options.length > 0;
  const isTeamBonusMode = modal?.mode === "dop_bonus_toggle";
  const hasPersonalHeader = Boolean(modal?.data?.columnLabel);
  const modalTitle = hasPersonalHeader ? (
    <Box
      component="span"
      data-staff-schedule-finance-header
      sx={{ display: "inline-flex", flexDirection: "column", minWidth: 0, maxWidth: "100%" }}
    >
      <Box component="span">
        {[modal.data.columnLabel, modal.data.periodLabel].filter(Boolean).join(" · ")}
      </Box>
      <Box
        component="span"
        sx={{ fontSize: 14, lineHeight: 1.3, color: "#666666" }}
      >
        {[modal.data.personName, modal.data.positionName].filter(Boolean).join(" · ")}
      </Box>
    </Box>
  ) : (
    modal?.data?.title || "Изменение"
  );
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
      confirmTone: "success",
      cancelTone: "danger",
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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        gap: 1.5,
        width: "100%",
      }}
    >
      <JacoButton
        compact
        tone="danger"
        onClick={onClose}
        sx={{
          minWidth: 108,
          minHeight: 44,
          borderRadius: "12px",
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        Отмена
      </JacoButton>
      <JacoButton
        compact
        tone="success"
        onClick={handleSave}
        disabled={value === "" || !hasChanges}
        sx={{
          gridColumn: 3,
          minWidth: 112,
          minHeight: 44,
          borderRadius: "12px",
          fontSize: 16,
        }}
      >
        Сохранить
      </JacoButton>
    </Box>
  );

  return (
    <>
      <StaffScheduleResponsiveModal
        open={modal.open}
        onClose={onClose}
        title={modalTitle}
        titleContainerSx={hasPersonalHeader ? { height: "auto", minHeight: 64, py: 1 } : undefined}
        mobileTitleContainerSx={hasPersonalHeader ? { minHeight: 72, py: 1.5 } : undefined}
        maxWidth="sm"
        paperSx={{ maxWidth: 520 }}
        contentSx={{ px: 2.5, pt: 2.5, pb: 2 }}
        actions={actions}
        actionsSx={{
          px: 2.5,
          pt: 1,
          pb: 2.5,
          display: "block",
        }}
      >
        <Stack
          spacing={2}
          data-staff-schedule-finance-content
        >
          {modal.error ? <JacoAlert severity="error">{modal.error}</JacoAlert> : null}
          {saveError ? <JacoAlert severity="error">{saveError}</JacoAlert> : null}

          {isListMode ? (
            <JacoSelectableList sx={{ p: 0 }}>
              {options.map((item) => {
                const optionValue = item?.id ?? "";
                const selected = String(value) === String(optionValue);
                const isApproveOption = isTeamBonusMode && Number(optionValue) === 1;
                const isRejectOption = isTeamBonusMode && Number(optionValue) === 2;
                const optionColor = isApproveOption ? uiColors.success : uiColors.danger;
                const optionTextColor = isApproveOption ? uiColors.successHover : uiColors.danger;
                const optionLabel = selected
                  ? isApproveOption
                    ? "Выдано"
                    : isRejectOption
                      ? "Отказано"
                      : item?.name
                  : item?.name;

                return (
                  <JacoSelectableListItem
                    key={String(optionValue)}
                    selected={selected}
                    onClick={() => setValue(optionValue)}
                    sx={{
                      minHeight: 52,
                      px: 2,
                      color: isTeamBonusMode ? optionTextColor : "#666666",
                      backgroundColor: isTeamBonusMode ? alpha(optionColor, 0.07) : undefined,
                      "&:hover": {
                        backgroundColor: isTeamBonusMode ? alpha(optionColor, 0.23) : "#F5F5F5",
                      },
                      "&.Mui-selected": {
                        backgroundColor: isTeamBonusMode ? alpha(optionColor, 0.19) : "#E5E5E5",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: isTeamBonusMode ? alpha(optionColor, 0.3) : "#DCDCDC",
                      },
                      ...(isTeamBonusMode
                        ? {
                            "&.Mui-focusVisible": {
                              backgroundColor: alpha(optionColor, selected ? 0.3 : 0.23),
                            },
                          }
                        : {}),
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{ width: "100%" }}
                    >
                      <Typography
                        sx={{
                          ...staffScheduleModalTypography.fieldValue,
                          color: "inherit",
                          fontWeight: isTeamBonusMode && selected ? 500 : 400,
                        }}
                      >
                        {optionLabel ?? ""}
                      </Typography>
                      {isTeamBonusMode && selected ? (
                        <CheckRoundedIcon sx={{ fontSize: 20, color: optionTextColor }} />
                      ) : null}
                    </Stack>
                  </JacoSelectableListItem>
                );
              })}
            </JacoSelectableList>
          ) : (
            <Stack spacing={1.5}>
              <JacoTextInput
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
