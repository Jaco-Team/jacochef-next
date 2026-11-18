"use client";

import { Grid, Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoModal,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import { fieldErrorsWithPrefix } from "../../requestErrors.mjs";
import FieldMessage from "../FieldMessage";

const RESOLUTION_FIELDS = ["solution_id", "changed_amount"];

const COMMAND_LABELS = {
  send_to_cafe: "Отправить в кафе",
  accept: "Принять в работу",
  resolve: "Завершить рассмотрение",
  return_to_cc: "Вернуть в контакт-центр",
  cancel: "Отменить жалобу",
};

export { COMMAND_LABELS };

function commandDescription(command, cafeContext) {
  if (command === "send_to_cafe") return `Жалоба будет отправлена в кафе: ${cafeContext}.`;
  if (command === "accept") return "Кафе примет жалобу в работу.";
  if (command === "return_to_cc") {
    return "Жалоба вернётся в контакт-центр для повторного рассмотрения.";
  }
  if (command === "cancel") {
    return "Жалоба будет отменена. После отмены действия по жалобе станут недоступны.";
  }
  return "Статус жалобы будет изменён.";
}

function updateResolution(resolutions, id, patch) {
  return resolutions.map((entry) => (Number(entry.id) === Number(id) ? { ...entry, ...patch } : entry));
}

export default function ComplaintResolutionModal({
  command,
  errors,
  cafeContext,
  solutions,
  resolutions,
  promoCode,
  transitioning,
  canResolve,
  commandError,
  onClose,
  onConfirm,
  onResolutionsChange,
  onPromoCodeChange,
}) {
  const fields = commandError?.fields || {};
  const destructive = command === "cancel";
  return (
    <JacoModal
      open={Boolean(command)}
      onClose={onClose}
      title={command ? COMMAND_LABELS[command] || command : ""}
      maxWidth={command === "resolve" ? "sm" : "xs"}
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
            {destructive ? "Не отменять" : "Отмена"}
          </JacoButton>
          <JacoButton
            tone={destructive ? "danger" : "primary"}
            loading={transitioning}
            disabled={command === "resolve" && !canResolve}
            onClick={onConfirm}
          >
            {destructive ? "Отменить жалобу" : "Подтвердить"}
          </JacoButton>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {commandError?.text ? <JacoAlert severity="error">{commandError.text}</JacoAlert> : null}
        {command === "resolve" ? (
          <>
            <Typography>
              Зафиксируйте решение по каждой действующей ошибке перед завершением рассмотрения.
              Снятые ошибки не требуют решения.
            </Typography>
            {solutions.length === 0 ? (
              <JacoAlert severity="warning">
                Активные варианты решения не настроены. Укажите сумму изменения, если она известна.
              </JacoAlert>
            ) : null}
            {errors.map((item) => {
              const index = resolutions.findIndex((entry) => Number(entry.id) === Number(item.id));
              const resolution = resolutions[index] || {
                id: item.id,
                solution_id: "",
                changed_amount: "",
              };
              const messages =
                index >= 0 ? fieldErrorsWithPrefix(fields, `resolution_errors.${index}.`) : [];
              const fieldError = (field) => messages.find((entry) => entry.field === field)?.message;
              return (
                <JacoSurface
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 1.5 }}
                >
                  <Stack spacing={1.25}>
                    <Typography fontWeight={700}>
                      {[item.error_type_name, item.error_name].filter(Boolean).join(" / ")}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {[item.position_name, item.category_name, item.stage_name]
                        .filter(Boolean)
                        .join(" · ")}
                    </Typography>
                    {messages
                      .filter((entry) => !RESOLUTION_FIELDS.includes(entry.field))
                      .map((entry) => (
                      <JacoAlert
                        key={entry.field}
                        severity="error"
                      >
                        {entry.message}
                      </JacoAlert>
                    ))}
                    <Grid
                      container
                      spacing={1.25}
                    >
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <JacoSelect
                          required={solutions.length > 0}
                          multiple={false}
                          label="Решение"
                          options={solutions}
                          disabled={solutions.length === 0}
                          value={resolution.solution_id}
                          allowNone
                          noneLabel="Выберите решение"
                          onChange={(event) =>
                            onResolutionsChange(
                              updateResolution(resolutions, item.id, {
                                solution_id: event.target.value === "none" ? "" : event.target.value,
                              }),
                            )
                          }
                        />
                        <FieldMessage>{fieldError("solution_id")}</FieldMessage>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <JacoTextInput
                          type="number"
                          label="Сумма изменения"
                          value={resolution.changed_amount}
                          error={Boolean(fieldError("changed_amount"))}
                          helperText={fieldError("changed_amount")}
                          slotProps={{
                            htmlInput: { min: 0, step: 0.01, inputMode: "decimal" },
                            inputLabel: { shrink: true },
                          }}
                          onChange={(event) =>
                            onResolutionsChange(
                              updateResolution(resolutions, item.id, {
                                changed_amount: event.target.value,
                              }),
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </JacoSurface>
              );
            })}
            <JacoTextInput
              fullWidth
              label="Выданный промокод"
              error={Boolean(fields.resolution_promo_code)}
              helperText={
                fields.resolution_promo_code ||
                "Необязательно. Укажите код, уже выданный клиенту как решение жалобы."
              }
              value={promoCode}
              onChange={(event) => onPromoCodeChange(event.target.value)}
            />
          </>
        ) : (
          <Typography>{commandDescription(command, cafeContext)}</Typography>
        )}
      </Stack>
    </JacoModal>
  );
}
