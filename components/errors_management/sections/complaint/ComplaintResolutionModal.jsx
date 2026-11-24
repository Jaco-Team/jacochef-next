"use client";

import { Stack, Typography } from "@mui/material";
import {
  JacoAlert,
  JacoButton,
  JacoChoiceChips,
  JacoModal,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";
import { errorSolutionOptions } from "../../complaintTree.mjs";
import { complaintProblemLabel } from "../../errorsManagementViewModel.mjs";
import { fieldErrorsWithPrefix } from "../../requestErrors.mjs";
import FieldMessage from "../FieldMessage";

const RESOLUTION_FIELDS = ["solution_id"];

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
            {errors.map((item) => {
              const index = resolutions.findIndex((entry) => Number(entry.id) === Number(item.id));
              const resolution = resolutions[index] || { id: item.id, solution_id: "" };
              const messages =
                index >= 0 ? fieldErrorsWithPrefix(fields, `resolution_errors.${index}.`) : [];
              const fieldError = (field) => messages.find((entry) => entry.field === field)?.message;
              const options = errorSolutionOptions(item, solutions);
              return (
                <JacoSurface
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 1.5 }}
                >
                  <Stack spacing={1.25}>
                    <Typography fontWeight={700}>{complaintProblemLabel(item)}</Typography>
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
                    {options.length ? (
                      <Stack spacing={0.75}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Решение
                        </Typography>
                        <JacoChoiceChips
                          ariaLabel="Решение"
                          options={options}
                          value={resolution.solution_id}
                          onChange={(solutionId) =>
                            onResolutionsChange(
                              updateResolution(resolutions, item.id, { solution_id: solutionId }),
                            )
                          }
                        />
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.solution_name
                          ? `Решение: ${item.solution_name}`
                          : "Для этой ошибки решение не выбирается."}
                      </Typography>
                    )}
                    <FieldMessage>{fieldError("solution_id")}</FieldMessage>
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
