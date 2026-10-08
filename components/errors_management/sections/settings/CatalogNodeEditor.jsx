"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import {
  JacoButton,
  JacoModal,
  JacoSelect,
  JacoSwitch,
  JacoTextInput,
} from "@/design-system/shared/ui";
import { initialDraft } from "./catalogModel.mjs";

export default function CatalogNodeEditor({ state, onClose, onSave, saving, error, stages }) {
  const [draft, setDraft] = useState(() => initialDraft(state.node, state.context));
  const isError = draft.kind === "error";
  useEffect(() => setDraft(initialDraft(state.node, state.context)), [state]);
  const save = () =>
    onSave({
      ...draft,
      sort_order: Number(draft.sort_order || 0),
      rules: isError
        ? {
            requires_ingredient: Boolean(draft.rules?.requires_ingredient),
            stage_ids: (draft.rules?.stage_ids || []).map(Number),
          }
        : draft.rules,
    });

  return (
    <JacoModal
      open
      onClose={onClose}
      title={draft.id ? "Редактировать вариант" : "Добавить вариант"}
      maxWidth="sm"
      actions={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: "100%", justifyContent: "flex-end" }}
        >
          <JacoButton
            tone="outlinePrimary"
            onClick={onClose}
          >
            Отмена
          </JacoButton>
          <JacoButton
            disabled={saving || !draft.name.trim()}
            onClick={save}
          >
            Сохранить
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <JacoTextInput
          fullWidth
          required
          label="Наименование"
          value={draft.name}
          disabled={draft.kind === "category"}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <JacoTextInput
          fullWidth
          multiline
          minRows={3}
          label="Описание"
          value={draft.description}
          onChange={(event) =>
            setDraft((current) => ({ ...current, description: event.target.value }))
          }
        />
        <JacoTextInput
          fullWidth
          type="number"
          label="Порядок"
          value={draft.sort_order}
          onChange={(event) =>
            setDraft((current) => ({ ...current, sort_order: event.target.value }))
          }
        />
        {isError ? (
          <Stack spacing={2}>
            <JacoSelect
              required
              multiple
              label="Этапы возникновения ошибки"
              options={stages}
              value={draft.rules?.stage_ids || []}
              allowNone={false}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  rules: {
                    ...current.rules,
                    stage_ids: Array.isArray(event.target.value)
                      ? event.target.value.map(Number)
                      : [],
                  },
                }))
              }
            />
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center" }}
            >
              <JacoSwitch
                checked={Boolean(draft.rules?.requires_ingredient)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    rules: { ...current.rules, requires_ingredient: event.target.checked },
                  }))
                }
              />
              <Box>
                <Typography fontWeight={700}>Запрашивать продукт из состава</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Показывается только при регистрации ошибки блюда.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        ) : null}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center" }}
        >
          <JacoSwitch
            checked={Boolean(draft.is_active)}
            onChange={(event) =>
              setDraft((current) => ({ ...current, is_active: event.target.checked }))
            }
          />
          <Typography fontWeight={700}>Вариант активен</Typography>
        </Stack>
      </Stack>
    </JacoModal>
  );
}
