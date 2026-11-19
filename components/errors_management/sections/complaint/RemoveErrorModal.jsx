"use client";

import { Stack, Typography } from "@mui/material";
import { JacoAlert, JacoButton, JacoModal, JacoTextInput } from "@/design-system/shared/ui";
import { complaintProblemLabel } from "../../errorsManagementViewModel.mjs";

export const REMOVAL_COMMENT_LIMIT = 1000;

export default function RemoveErrorModal({ state, onChange, onClose, onConfirm }) {
  const comment = state?.comment || "";
  const tooLong = comment.length > REMOVAL_COMMENT_LIMIT;
  const commentError = state?.fields?.comment;
  const item = state?.error;
  return (
    <JacoModal
      open={Boolean(state)}
      onClose={onClose}
      title="Снять ошибку"
      maxWidth="xs"
      actions={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <JacoButton
            tone="outlinePrimary"
            disabled={state?.saving}
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          <JacoButton
            tone="danger"
            loading={state?.saving}
            disabled={!comment.trim() || tooLong}
            onClick={onConfirm}
          >
            Снять ошибку
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {state?.text ? <JacoAlert severity="error">{state.text}</JacoAlert> : null}
        {item ? (
          <Typography>
            Ошибка «{complaintProblemLabel(item)}» останется
            в жалобе с отметкой «Снята» и перестанет учитываться в суммах и количестве ошибок.
          </Typography>
        ) : null}
        <JacoTextInput
          fullWidth
          required
          multiline
          minRows={3}
          label="Комментарий"
          value={comment}
          error={tooLong || Boolean(commentError)}
          helperText={
            commentError || `${comment.length}/${REMOVAL_COMMENT_LIMIT}. Обязательное поле.`
          }
          slotProps={{ htmlInput: { maxLength: REMOVAL_COMMENT_LIMIT } }}
          onChange={(event) => onChange(event.target.value)}
        />
      </Stack>
    </JacoModal>
  );
}
