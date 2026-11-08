"use client";

import { Alert, Grid, Stack, Typography } from "@mui/material";
import {
  JacoButton,
  JacoModal,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
} from "@/design-system/shared/ui";

const COMMAND_LABELS = {
  send_to_cafe: "Отправить в кафе",
  accept: "Принять в работу",
  resolve: "Завершить рассмотрение",
};

export { COMMAND_LABELS };

export default function ComplaintResolutionModal({
  command,
  detail,
  cafeContext,
  solutions,
  resolutions,
  promoCode,
  transitioning,
  canResolve,
  onClose,
  onConfirm,
  onResolutionsChange,
  onPromoCodeChange,
}) {
  return (
    <JacoModal
      open={Boolean(command)}
      onClose={onClose}
      title={command ? COMMAND_LABELS[command] : ""}
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
            Отмена
          </JacoButton>
          <JacoButton
            loading={transitioning}
            disabled={command === "resolve" && !canResolve}
            onClick={onConfirm}
          >
            Подтвердить
          </JacoButton>
        </Stack>
      }
    >
      {command === "resolve" ? (
        <Stack spacing={2}>
          <Typography>
            Зафиксируйте решение по каждой ошибке перед завершением рассмотрения.
          </Typography>
          {solutions.length === 0 ? (
            <Alert severity="warning">
              Активные варианты решения не настроены. Укажите сумму изменения, если она известна.
            </Alert>
          ) : null}
          {(detail?.errors || []).map((item) => {
            const resolution = resolutions.find(
              (entry) => Number(entry.id) === Number(item.id),
            ) || { id: item.id, solution_id: "", changed_amount: "" };
            return (
              <JacoSurface
                key={item.id}
                variant="outlined"
                sx={{ p: 1.5 }}
              >
                <Stack spacing={1.25}>
                  <Typography fontWeight={700}>{item.error_name}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.category_name}
                    {item.error_type_name ? ` · ${item.error_type_name}` : ""}
                  </Typography>
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
                            resolutions.map((entry) =>
                              Number(entry.id) === Number(item.id)
                                ? {
                                    ...entry,
                                    solution_id:
                                      event.target.value === "none" ? "" : event.target.value,
                                  }
                                : entry,
                            ),
                          )
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <JacoTextInput
                        type="number"
                        min={0}
                        step={0.01}
                        label="Сумма изменения"
                        value={resolution.changed_amount}
                        slotProps={{
                          htmlInput: { inputMode: "decimal" },
                          inputLabel: { shrink: true },
                        }}
                        onChange={(event) =>
                          onResolutionsChange(
                            resolutions.map((entry) =>
                              Number(entry.id) === Number(item.id)
                                ? { ...entry, changed_amount: event.target.value }
                                : entry,
                            ),
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
            helperText="Необязательно. Укажите код, уже выданный клиенту как решение жалобы."
            value={promoCode}
            onChange={(event) => onPromoCodeChange(event.target.value)}
          />
        </Stack>
      ) : (
        <Typography>
          {command === "send_to_cafe"
            ? `Жалоба будет отправлена в кафе: ${cafeContext}.`
            : "Статус жалобы будет изменён."}
        </Typography>
      )}
    </JacoModal>
  );
}
