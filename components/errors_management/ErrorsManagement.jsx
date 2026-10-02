"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { api_laravel } from "@/src/api_new";
import {
  JacoBackdropLoader,
  JacoButton,
  JacoModal,
  JacoSegmentedTabs,
  JacoDatePicker,
  JacoIconButton,
  JacoSelect,
  JacoSurface,
  JacoTextInput,
  JacoResponsiveModalShell,
} from "@/design-system/shared/ui";
import JacoSearch from "@/ui/JacoSearch";
import ComplaintOptionsSettings from "./sections/ComplaintOptionsSettings";
import { classifierDraft, ErrorEditor } from "./sections/ErrorEditor";
import dayjs from "dayjs";

const moduleName = "errors_management";
const DEFAULT_FILTERS = {
  cityId: "",
  pointId: "",
  orderNumber: "",
  dateFrom: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  dateTo: dayjs().format("YYYY-MM-DD"),
};
const rootSx = { pb: 3 };
const surfaceSx = { boxShadow: "none" };
const filterSx = {
  p: { xs: 2, md: 2.5 },
  "& .MuiOutlinedInput-notchedOutline legend > span, & .MuiPickersOutlinedInput-notchedOutline legend > span":
    {
      fontSize: "12px !important",
      lineHeight: "18px !important",
    },
  ...surfaceSx,
};
const titleSx = { fontSize: { xs: 26, md: 32 }, fontWeight: 700, lineHeight: 1.2 };
const STATISTICS_SOURCES = [
  { id: "contact_center", name: "Контакт-центр" },
  { id: "cafe", name: "Кафе" },
];
const COMPLAINT_HISTORY_FIELDS = {
  status: "Статус",
  common_comment: "Общий комментарий",
  sent_to_cafe_at: "Отправлено в кафе",
  accepted_at: "Принято в работу",
  resolved_at: "Решение принято",
};
const COMPLAINT_STATUS_LABELS = {
  registered: "В решении",
  sent_to_cafe: "В решении",
  accepted_by_cafe: "В решении",
  resolved: "Решена",
  cancelled: "Отменена",
};

function historyFieldLabel(field) {
  if (COMPLAINT_HISTORY_FIELDS[field]) return COMPLAINT_HISTORY_FIELDS[field];
  const errorField = field.match(
    /^errors\.\d+\.(category_name|error_type_name|error_name|stage_name|solution_name|error_amount|changed_amount|comment)$/,
  )?.[1];
  return {
    category_name: "Категория",
    error_type_name: "Тип ошибки",
    error_name: "Ошибка",
    stage_name: "Этап возникновения ошибки",
    solution_name: "Решение",
    error_amount: "Сумма ошибки",
    changed_amount: "Сумма изменения",
    comment: "Комментарий к ошибке",
  }[errorField];
}

function hasHistoryValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function historyChanges(item) {
  try {
    const diff = typeof item?.diff_json === "string" ? JSON.parse(item.diff_json) : item?.diff_json;
    if (!diff || typeof diff !== "object") return [];
    return Object.entries(diff)
      .map(([field, change]) => ({ field, label: historyFieldLabel(field), change }))
      .filter(
        ({ label, change }) =>
          label &&
          change &&
          typeof change === "object" &&
          (hasHistoryValue(change.from) || hasHistoryValue(change.to)),
      )
      .map(({ field, label, change }) => ({ field, label, ...change }))
      .sort((left, right) => historyFieldOrder(left.field) - historyFieldOrder(right.field));
  } catch {
    return [];
  }
}

function historyFieldOrder(field) {
  if (field === "status") return 0;
  if (field.endsWith(".category_name")) return 1;
  if (field.endsWith(".error_type_name")) return 2;
  if (field.endsWith(".error_name")) return 3;
  if (field.endsWith(".stage_name")) return 4;
  if (field.endsWith(".solution_name")) return 5;
  if (field.endsWith(".error_amount")) return 6;
  if (field.endsWith(".changed_amount")) return 7;
  if (field.endsWith(".comment")) return 8;
  if (field === "common_comment") return 9;
  return 10;
}

const HISTORY_STATUS_LABELS = {
  registered: "Зарегистрирована",
  sent_to_cafe: "Отправлена в кафе",
  accepted_by_cafe: "Принята кафе",
  resolved: "Решена",
  cancelled: "Отменена",
};

function historyValue(value, field) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "status") return HISTORY_STATUS_LABELS[value] || String(value);
  if (["sent_to_cafe_at", "accepted_at", "resolved_at"].includes(field))
    return historyTimestamp(value);
  if (field.endsWith(".error_amount") || field.endsWith(".changed_amount"))
    return amountLabel(value);
  return String(value);
}

function historyTimestamp(value) {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY HH:mm") : value || "—";
}

function amountLabel(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amount.toFixed(2)} ₽` : "—";
}

function complaintStatusLabel(item) {
  const label = item?.status_label || COMPLAINT_STATUS_LABELS[item?.status] || "—";
  return item?.status_context ? `${label} · ${item.status_context}` : label;
}

function DetailField({ label, value, fullWidth = false, emphasized = false }) {
  return (
    <Box sx={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={emphasized ? 700 : 500}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

function DrawerSection({ title, children, sx }) {
  return (
    <JacoSurface
      variant="outlined"
      sx={{ p: { xs: 1.5, sm: 2 }, ...surfaceSx, ...sx }}
    >
      <Stack spacing={1.25}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
        >
          {title}
        </Typography>
        {children}
      </Stack>
    </JacoSurface>
  );
}

function EmptyResults({ mode, onAction }) {
  const journal = mode === "journal";
  return (
    <JacoSurface
      variant="outlined"
      sx={{ p: { xs: 3, md: 4 }, textAlign: "center", ...surfaceSx }}
    >
      <Stack
        spacing={1.5}
        sx={{ alignItems: "center" }}
      >
        <Typography fontWeight={700}>
          {journal ? "Жалобы не найдены" : "Заказы не найдены"}
        </Typography>
        <Typography color="text.secondary">
          {journal
            ? "За выбранный период жалоб нет."
            : "Измените фильтры или найдите заказ по номеру."}
        </Typography>
        {journal ? <JacoButton onClick={onAction}>Перейти к регистрации</JacoButton> : null}
      </Stack>
    </JacoSurface>
  );
}

function selectOptions(items = []) {
  return items.filter(Boolean).map((item) => ({
    id: String(item.id),
    name: item.name || item.addr || String(item.id),
    addr: item.addr || item.name || "",
    city_id: String(item.city_id ?? ""),
  }));
}

function orderId(row) {
  return Number(row?.order_id ?? row?.id ?? 0);
}

function pointId(row) {
  return Number(row?.point_id ?? 0);
}

function RegistrationDrawer({ selected, onClose, request, onSaved, cities, points }) {
  const [context, setContext] = useState(null);
  const [errors, setErrors] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selected) return;
    setContext(null);
    setErrors([]);
    setComment("");
    setMessage("");
    setLoading(true);
    request("v2/context", { point_id: pointId(selected), order_id: orderId(selected) })
      .then((result) => setContext(result?.data ?? result))
      .catch(() => setMessage("Не удалось загрузить данные заказа."))
      .finally(() => setLoading(false));
  }, [request, selected]);

  const addError = (position) => {
    setErrors((previous) => [
      ...previous,
      classifierDraft(context?.catalog || [], position.type, position.position_key),
    ]);
  };
  const addOrderError = () => {
    setErrors((previous) => [...previous, classifierDraft(context?.catalog || [], "order")]);
  };
  const save = async () => {
    setMessage("");
    setLoading(true);
    try {
      await request(
        "v2/create",
        {
          point_id: pointId(selected),
          order_id: orderId(selected),
          errors,
          common_comment: comment,
        },
        { throwErrors: true, suppressAuthRedirect: true },
      );
      onSaved();
      onClose();
    } catch {
      setMessage("Не удалось зарегистрировать жалобу. Проверьте обязательные поля.");
    } finally {
      setLoading(false);
    }
  };
  const cafeContext = useMemo(() => {
    const point = points.find((item) => String(item.id) === String(context?.order?.point_id));
    const city = cities.find((item) => String(item.id) === String(context?.order?.city_id));
    return (
      [city?.name, point?.addr || point?.name].filter(Boolean).join(" · ") || "Кафе не определено"
    );
  }, [cities, context?.order?.city_id, context?.order?.point_id, points]);

  const actions =
    context && !loading ? (
      <JacoButton
        fullWidth
        disabled={!errors.length}
        onClick={save}
      >
        Зарегистрировать жалобу
      </JacoButton>
    ) : null;

  return (
    <JacoResponsiveModalShell
      open={Boolean(selected)}
      onClose={onClose}
      title="Регистрация жалобы"
      maxWidth="md"
      actions={actions}
      mobilePaperSx={{ height: "100vh", maxHeight: "100vh", borderRadius: 0 }}
      mobileContentSx={{ px: 2, py: 2.5 }}
      mobileActionsSx={{ px: 2, pt: 1.5, pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
    >
      <Stack spacing={2.5}>
        {message ? <Alert severity="error">{message}</Alert> : null}
        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", minHeight: 240 }}>
            <CircularProgress />
          </Box>
        ) : context ? (
          <>
            <JacoSurface sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Заказ №{orderId(selected)}
              </Typography>
              <Typography
                fontWeight={700}
                mt={0.5}
              >
                Кафе: {cafeContext}
              </Typography>
            </JacoSurface>
            <Stack spacing={1.25}>
              <Typography fontWeight={700}>Позиции заказа</Typography>
              {context.positions?.map((position) => (
                <JacoSurface
                  key={position.position_key}
                  sx={{ p: 1.5 }}
                >
                  <Stack
                    direction="row"
                    gap={1}
                    sx={{ alignItems: "center", justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{position.name}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {position.total_count} шт.
                      </Typography>
                    </Box>
                    <JacoButton
                      compact
                      tone="outlinePrimary"
                      startIcon={<AddIcon />}
                      onClick={() => addError(position)}
                    >
                      Ошибка
                    </JacoButton>
                  </Stack>
                </JacoSurface>
              ))}
            </Stack>
            <JacoButton
              tone="outlinePrimary"
              startIcon={<AddIcon />}
              onClick={addOrderError}
            >
              Добавить ошибку заказа
            </JacoButton>
            <Stack spacing={1.5}>
              {errors.map((error, index) => (
                <ErrorEditor
                  key={`${error.position_key || "order"}-${index}`}
                  value={error}
                  positions={context.positions || []}
                  catalog={context.catalog || []}
                  solutions={context.solutions || []}
                  stages={context.stages || []}
                  onChange={(next) =>
                    setErrors((previous) =>
                      previous.map((item, itemIndex) => (itemIndex === index ? next : item)),
                    )
                  }
                  onRemove={() =>
                    setErrors((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
                  }
                />
              ))}
            </Stack>
            <JacoTextInput
              fullWidth
              multiline
              minRows={3}
              label="Общий комментарий"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </>
        ) : null}
      </Stack>
    </JacoResponsiveModalShell>
  );
}
function ComplaintDrawer({ complaint, onClose, onChanged, request, cities, points }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [pendingCommand, setPendingCommand] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [resolutionErrors, setResolutionErrors] = useState([]);

  useEffect(() => {
    if (!complaint) return;
    setDetail(null);
    setError("");
    setPendingCommand(null);
    setResolutionErrors([]);
    request("v2/detail", { complaint_id: complaint.id, point_id: complaint.point_id })
      .then((response) => setDetail(response?.data ?? response ?? null))
      .catch(() => setError("Не удалось загрузить жалобу."));
  }, [complaint, request]);

  useEffect(() => {
    setResolutionErrors(
      (detail?.errors || []).map((item) => ({
        id: item.id,
        solution_id: item.solution_id ? String(item.solution_id) : "",
        changed_amount: item.changed_amount ?? "",
      })),
    );
  }, [detail?.id, detail?.lock_version]);

  const resolutionSolutions = detail?.resolution_solutions || [];
  const canResolve =
    resolutionSolutions.length === 0 ||
    (resolutionErrors.length === (detail?.errors || []).length &&
      resolutionErrors.every((item) => Boolean(item.solution_id)));

  const cafeContext = useMemo(() => {
    const point = points.find((item) => String(item.id) === String(detail?.point_id));
    const city = cities.find((item) => String(item.id) === String(detail?.city_id));
    return (
      [city?.name, point?.addr || point?.name].filter(Boolean).join(" · ") ||
      "указанное в заказе кафе"
    );
  }, [cities, detail?.city_id, detail?.point_id, points]);

  const commandLabels = {
    send_to_cafe: "Отправить в кафе",
    accept: "Принять в работу",
    resolve: "Завершить рассмотрение",
  };
  const executeTransition = async () => {
    if (!pendingCommand || !detail) return;
    setTransitioning(true);
    setError("");
    try {
      const response = await request(
        "v2/transition",
        {
          complaint_id: detail.id,
          point_id: detail.point_id,
          lock_version: detail.lock_version,
          command: pendingCommand,
          ...(pendingCommand === "resolve" ? { resolution_errors: resolutionErrors } : {}),
        },
        { throwErrors: true, suppressAuthRedirect: true },
      );
      setDetail(response?.data ?? response ?? null);
      setPendingCommand(null);
      onChanged?.();
    } catch {
      setError("Не удалось изменить статус жалобы. Обновите детали и повторите действие.");
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(complaint)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100dvw", sm: "clamp(600px, 40dvw, 760px)" },
            maxWidth: "100dvw",
            boxSizing: "border-box",
            overflow: "hidden",
            p: 0,
          },
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          p: { xs: 2, sm: 2.5, md: 3 },
          pb: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          boxSizing: "border-box",
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Жалоба №{complaint?.id}
              </Typography>
              <Typography color="text.secondary">Заказ №{complaint?.order_id}</Typography>
            </Box>
            <JacoIconButton
              aria-label="Закрыть жалобу"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </JacoIconButton>
          </Stack>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {!detail && !error ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : null}
          {detail ? (
            <>
              <DrawerSection title="Жалоба">
                <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 1.25 }}>
                  <DetailField
                    label="Статус"
                    value={complaintStatusLabel(detail)}
                    emphasized
                  />
                  <DetailField
                    label="Общий комментарий"
                    value={detail.common_comment}
                  />
                  {detail.resolved_by_name ? (
                    <DetailField
                      label="Кто решил жалобу"
                      value={detail.resolved_by_name}
                    />
                  ) : null}
                  {detail.resolved_at ? (
                    <DetailField
                      label="Дата решения"
                      value={historyTimestamp(detail.resolved_at)}
                    />
                  ) : null}
                </Box>
              </DrawerSection>
              {detail.order && Object.keys(detail.order).length ? (
                <DrawerSection title="Данные заказа">
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1.25,
                    }}
                  >
                    <DetailField
                      label="Оформил"
                      value={detail.order.placed_by}
                    />
                    <DetailField
                      label="Сотрудник"
                      value={detail.order.employee_name}
                    />
                    {detail.order.client_name ? (
                      <DetailField
                        label="Клиент"
                        value={detail.order.client_name}
                      />
                    ) : null}
                    {detail.order.traffic_source ? (
                      <DetailField
                        label="Источник"
                        value={detail.order.traffic_source}
                      />
                    ) : null}
                    {detail.order.promo_name ? (
                      <DetailField
                        label="Промокод в заказе"
                        value={detail.order.promo_name}
                      />
                    ) : null}
                    <DetailField
                      fullWidth
                      label="Комментарий клиента"
                      value={detail.order.customer_comment}
                    />
                  </Box>
                </DrawerSection>
              ) : null}
              {(detail.available_commands || []).length ? (
                <Stack spacing={1}>
                  <Typography fontWeight={700}>Действия</Typography>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                  >
                    {detail.available_commands.map((command) => (
                      <JacoButton
                        key={command}
                        onClick={() => setPendingCommand(command)}
                      >
                        {commandLabels[command] || command}
                      </JacoButton>
                    ))}
                  </Stack>
                </Stack>
              ) : null}
              <Typography fontWeight={700}>Ошибки</Typography>
              <Stack spacing={1.25}>
                {(detail.errors || []).map((item) => (
                  <JacoSurface
                    key={item.id}
                    variant="outlined"
                    sx={{ p: 1.5, ...surfaceSx }}
                  >
                    <Stack spacing={0.75}>
                      <DetailField
                        label="Ошибка"
                        value={item.error_name}
                        emphasized
                      />
                      <DetailField
                        label="Категория"
                        value={item.category_name}
                      />
                      {item.error_type_name ? (
                        <DetailField
                          label="Тип ошибки"
                          value={item.error_type_name}
                        />
                      ) : null}
                      <DetailField
                        label="Этап"
                        value={item.stage_name}
                      />
                      <DetailField
                        label="Сумма ошибки"
                        value={item.error_amount != null ? amountLabel(item.error_amount) : null}
                      />
                      {item.solution_name ? (
                        <DetailField
                          label="Решение"
                          value={item.solution_name}
                        />
                      ) : null}
                      <DetailField
                        label="Сумма изменения"
                        value={
                          item.changed_amount != null ? amountLabel(item.changed_amount) : null
                        }
                      />
                      {item.comment ? (
                        <DetailField
                          label="Комментарий к ошибке"
                          value={item.comment}
                        />
                      ) : null}
                    </Stack>
                  </JacoSurface>
                ))}
              </Stack>
              <Typography fontWeight={700}>История</Typography>
              <Stack spacing={1.25}>
                {(detail.history || []).map((item) => {
                  const changes = historyChanges(item);
                  return (
                    <JacoSurface
                      key={item.id}
                      variant="outlined"
                      sx={{ p: 1.5, ...surfaceSx }}
                    >
                      <Stack spacing={0.75}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {item.entity_label || item.event_type}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.actor_name || "Система"} · {historyTimestamp(item.created_at)}
                        </Typography>
                        {changes.length ? (
                          <Stack spacing={0.5}>
                            {changes.map((change) => (
                              <Typography
                                key={change.field}
                                variant="body2"
                                color="text.secondary"
                              >
                                {change.label}:{" "}
                                {hasHistoryValue(change.from)
                                  ? `${historyValue(change.from, change.field)} → `
                                  : ""}
                                {historyValue(change.to, change.field)}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Без изменений полей
                          </Typography>
                        )}
                      </Stack>
                    </JacoSurface>
                  );
                })}
              </Stack>
            </>
          ) : null}
        </Stack>
      </Box>
      <JacoModal
        open={Boolean(pendingCommand)}
        onClose={() => setPendingCommand(null)}
        title={pendingCommand ? commandLabels[pendingCommand] : ""}
        maxWidth={pendingCommand === "resolve" ? "sm" : "xs"}
        actions={
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: "100%", justifyContent: "flex-end" }}
          >
            <JacoButton
              tone="outlinePrimary"
              onClick={() => setPendingCommand(null)}
            >
              Отмена
            </JacoButton>
            <JacoButton
              loading={transitioning}
              disabled={pendingCommand === "resolve" && !canResolve}
              onClick={executeTransition}
            >
              Подтвердить
            </JacoButton>
          </Stack>
        }
      >
        {pendingCommand === "resolve" ? (
          <Stack spacing={2}>
            <Typography>
              Зафиксируйте решение по каждой ошибке перед завершением рассмотрения.
            </Typography>
            {resolutionSolutions.length === 0 ? (
              <Alert severity="warning">
                Активные варианты решения не настроены. Укажите сумму изменения, если она известна.
              </Alert>
            ) : null}
            {(detail?.errors || []).map((item) => {
              const resolution = resolutionErrors.find(
                (entry) => Number(entry.id) === Number(item.id),
              ) || {
                id: item.id,
                solution_id: "",
                changed_amount: "",
              };
              return (
                <JacoSurface
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 1.5, ...surfaceSx }}
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
                          required={resolutionSolutions.length > 0}
                          label="Решение"
                          options={resolutionSolutions}
                          disabled={resolutionSolutions.length === 0}
                          value={resolution.solution_id}
                          allowNone
                          noneLabel="Выберите решение"
                          onChange={(event) =>
                            setResolutionErrors((previous) =>
                              previous.map((entry) =>
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
                            setResolutionErrors((previous) =>
                              previous.map((entry) =>
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
          </Stack>
        ) : (
          <Typography>
            {pendingCommand === "send_to_cafe"
              ? `Жалоба будет отправлена в кафе: ${cafeContext}.`
              : "Статус жалобы будет изменён."}
          </Typography>
        )}
      </JacoModal>
    </Drawer>
  );
}

function ErrorsManagement() {
  const mobileViewport = useMediaQuery("(max-width:667px)", { noSsr: false });
  const [mounted, setMounted] = useState(false);
  const mobile = mounted && mobileViewport;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("Регистрация ошибок");
  const [cities, setCities] = useState([]);
  const [points, setPoints] = useState([]);
  const [access, setAccess] = useState({});
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintsPage, setComplaintsPage] = useState(0);
  const [complaintsPerPage, setComplaintsPerPage] = useState(25);
  const [complaintsTotal, setComplaintsTotal] = useState(0);
  const [complaintsSort, setComplaintsSort] = useState({ by: "created_at", direction: "desc" });
  const [selected, setSelected] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [tableOrderIdSearch, setTableOrderIdSearch] = useState("");
  const [tab, setTab] = useState("journal");
  const [statistics, setStatistics] = useState(null);
  const [statisticsDraft, setStatisticsDraft] = useState(DEFAULT_FILTERS);
  const [statisticsApplied, setStatisticsApplied] = useState(DEFAULT_FILTERS);
  const [ready, setReady] = useState(false);

  const request = useCallback(
    async (method, data = {}, config = {}) => api_laravel(moduleName, method, data, config),
    [],
  );
  const loadOrders = useCallback(
    async (nextFilters) => {
      setLoading(true);
      try {
        const orderNumber = nextFilters.orderNumber.trim();
        const response = await request("get_orders", {
          city_id: nextFilters.cityId || "",
          point_id: nextFilters.pointId || 0,
          type_order: 0,
          order_id: orderNumber,
          number_order: orderNumber,
          sum_from: "",
          sum_to: "",
          date_from: orderNumber ? "" : nextFilters.dateFrom || "",
          date_to: orderNumber ? "" : nextFilters.dateTo || "",
          phone: "",
          number: "",
          time_from: "",
          time_to: "",
        });
        const payload = response?.data ?? response;
        setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
      } finally {
        setLoading(false);
      }
    },
    [request],
  );
  const loadComplaints = useCallback(
    async (
      nextFilters,
      page = complaintsPage,
      perPage = complaintsPerPage,
      sort = complaintsSort,
    ) => {
      setLoading(true);
      try {
        const orderNumber = nextFilters.orderNumber.trim();
        const response = await request("v2/journal", {
          page: page + 1,
          per_page: perPage,
          sort_by: sort.by,
          sort_direction: sort.direction,
          filters: {
            city_id: nextFilters.cityId || null,
            point_id: nextFilters.pointId || null,
            order_id: orderNumber || null,
            date_from: orderNumber ? null : nextFilters.dateFrom || null,
            date_to: orderNumber ? null : nextFilters.dateTo || null,
          },
        });
        const payload = response?.data ?? response;
        setComplaints(Array.isArray(payload?.items) ? payload.items : []);
        setComplaintsTotal(Number(payload?.total || 0));
      } finally {
        setLoading(false);
      }
    },
    [complaintsPage, complaintsPerPage, complaintsSort, request],
  );

  const bootstrap = useCallback(async () => {
    setReady(false);
    setLoading(true);
    setMessage("");
    try {
      const response = await request("get_all");
      const payload = response?.data ?? response;
      const nextCities = selectOptions(payload?.cities);
      const nextPoints = selectOptions(payload?.points);
      const cityId = String(payload?.city_id || nextCities[0]?.id || "");
      const firstCafe = nextPoints.find((point) => point.city_id === cityId) || nextPoints[0];
      const nextFilters = { ...DEFAULT_FILTERS, cityId, pointId: firstCafe?.id || "" };
      setTitle(payload?.module_info?.name || "Регистрация ошибок");
      setCities(nextCities);
      setPoints(nextPoints);
      setAccess(payload?.acces || {});
      setFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setStatisticsDraft(nextFilters);
      setStatisticsApplied(nextFilters);
      setReady(true);
    } catch {
      setMessage("Не удалось загрузить модуль.");
    } finally {
      setLoading(false);
    }
  }, [loadComplaints, loadOrders, request]);
  useEffect(() => {
    setMounted(true);
    bootstrap();
  }, [bootstrap]);
  useEffect(() => {
    document.title = title;
  }, [title]);
  useEffect(() => {
    if (!ready || tab !== "journal") return;
    loadComplaints(appliedFilters, complaintsPage, complaintsPerPage, complaintsSort).catch(() =>
      setMessage("Не удалось загрузить журнал."),
    );
  }, [
    appliedFilters,
    complaintsPage,
    complaintsPerPage,
    complaintsSort,
    loadComplaints,
    ready,
    tab,
  ]);
  useEffect(() => {
    if (!ready || tab !== "registration") return;
    loadOrders(appliedFilters).catch(() => setMessage("Не удалось загрузить заказы."));
  }, [appliedFilters, loadOrders, ready, tab]);
  const loadStatistics = useCallback(
    async (nextFilters) => {
      setLoading(true);
      try {
        const response = await request("v2/statistics", {
          filters: {
            city_id: nextFilters.cityId || null,
            point_id: nextFilters.pointId || null,
            date_from: nextFilters.dateFrom || null,
            date_to: nextFilters.dateTo || null,
            source: nextFilters.source || null,
            employee_id: nextFilters.employeeId || null,
          },
        });
        setStatistics(response?.data ?? response ?? null);
      } finally {
        setLoading(false);
      }
    },
    [request],
  );
  useEffect(() => {
    if (!ready || tab !== "statistics") return;
    loadStatistics(statisticsApplied).catch(() => setMessage("Не удалось загрузить статистику."));
  }, [loadStatistics, ready, statisticsApplied, tab]);
  const cafes = useMemo(
    () => points.filter((item) => !filters.cityId || item.city_id === filters.cityId),
    [filters.cityId, points],
  );
  const update = (field, value) => {
    const next = {
      [field]: value,
      ...(field === "cityId" ? { pointId: "" } : {}),
    };
    setFilters((previous) => ({ ...previous, ...next }));
    if (["cityId", "pointId", "dateFrom", "dateTo"].includes(field)) {
      setStatisticsDraft((previous) => ({ ...previous, ...next }));
    }
  };
  const apply = () => {
    setMessage("");
    setComplaintsPage(0);
    setAppliedFilters(filters);
  };
  const changeComplaintsSort = (by) => {
    setComplaintsPage(0);
    setComplaintsSort((current) => ({
      by,
      direction: current.by === by && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  const rows = tab === "journal" ? complaints : orders;
  const visibleRows = useMemo(() => {
    const query = tableOrderIdSearch.trim();
    if (!query) return rows;
    return rows.filter((row) => String(orderId(row)).includes(query));
  }, [rows, tableOrderIdSearch]);
  const statisticsCafes = useMemo(
    () =>
      points.filter((item) => !statisticsDraft.cityId || item.city_id === statisticsDraft.cityId),
    [points, statisticsDraft.cityId],
  );
  const updateStatistics = (field, value) => {
    const next = {
      [field]: value,
      ...(field === "cityId" ? { pointId: "" } : {}),
    };
    setStatisticsDraft((previous) => ({ ...previous, ...next }));
    if (["cityId", "pointId", "dateFrom", "dateTo"].includes(field)) {
      setFilters((previous) => ({ ...previous, ...next }));
    }
  };
  const applyStatistics = () => setStatisticsApplied(statisticsDraft);

  return (
    <Box
      className="container_first_child"
      sx={rootSx}
    >
      <JacoBackdropLoader
        open={loading}
        sx={{ "& .MuiCircularProgress-root": { color: "#FFFFFF" } }}
      />
      <Stack spacing={2.5}>
        <Typography
          component="h1"
          sx={titleSx}
        >
          {title}
        </Typography>
        {message ? <Alert severity="error">{message}</Alert> : null}
        <JacoSegmentedTabs
          size="compact"
          sx={{ minHeight: 42 }}
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant={mobile ? "scrollable" : "fullWidth"}
          scrollButtons={false}
          tabSx={{
            whiteSpace: "nowrap",
            flex: { xs: "0 0 auto", sm: 1 },
            minWidth: { xs: "auto", sm: 0 },
            px: { xs: 1.5, sm: 2 },
          }}
          items={[
            { id: "journal", label: "Журнал" },
            { id: "registration", label: "Регистрация" },
            { id: "statistics", label: "Статистика" },
            { id: "settings", label: "Варианты решения жалоб" },
          ]}
        />
        {tab === "settings" ? (
          <ComplaintOptionsSettings
            request={request}
            pointId={filters.pointId}
            canEdit={Number(access.errors_management_settings_edit) === 1}
          />
        ) : tab !== "statistics" ? (
          <>
            <JacoSurface
              component="form"
              sx={filterSx}
              onSubmit={(event) => {
                event.preventDefault();
                apply();
              }}
            >
              <Grid
                container
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <JacoSelect
                    label="Город"
                    options={cities}
                    value={filters.cityId}
                    multiple={false}
                    allowNone={false}
                    onChange={(event) => update("cityId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <JacoSelect
                    label="Кафе"
                    options={cafes}
                    value={filters.pointId}
                    multiple={false}
                    allowNone={false}
                    onChange={(event) => update("pointId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <JacoDatePicker
                    label="Дата от"
                    value={filters.dateFrom}
                    onChange={(value) => update("dateFrom", value?.format?.("YYYY-MM-DD") || "")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <JacoDatePicker
                    label="Дата до"
                    value={filters.dateTo}
                    onChange={(value) => update("dateTo", value?.format?.("YYYY-MM-DD") || "")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <JacoTextInput
                    label="Номер заказа"
                    type="number"
                    min={1}
                    slotProps={{
                      htmlInput: { inputMode: "numeric" },
                      inputLabel: { shrink: true },
                    }}
                    value={filters.orderNumber}
                    onChange={(event) => update("orderNumber", event.target.value)}
                  />
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 6, md: 2 }}
                  sx={{ display: "flex", alignItems: "flex-end" }}
                >
                  <JacoButton
                    type="submit"
                    fullWidth
                    sx={{ minHeight: 44 }}
                  >
                    Применить
                  </JacoButton>
                </Grid>
              </Grid>
            </JacoSurface>
            {rows.length > 0 ? (
              <Box sx={{ width: { xs: "100%", sm: 360 } }}>
                <JacoSearch
                  label="Поиск в таблице по ID заказа"
                  value={tableOrderIdSearch}
                  onValueChange={setTableOrderIdSearch}
                  debounceMs={350}
                />
              </Box>
            ) : null}
            {visibleRows.length === 0 ? (
              tableOrderIdSearch ? (
                <JacoSurface
                  variant="outlined"
                  sx={{ p: { xs: 3, md: 4 }, textAlign: "center", ...surfaceSx }}
                >
                  <Typography color="text.secondary">
                    По указанному ID заказа ничего не найдено.
                  </Typography>
                </JacoSurface>
              ) : (
                <EmptyResults
                  mode={tab}
                  onAction={() => setTab("registration")}
                />
              )
            ) : mobile ? (
              <Stack spacing={1.5}>
                {visibleRows.map((row, index) => (
                  <JacoSurface
                    key={`${orderId(row)}-${index}`}
                    variant="outlined"
                    sx={{ p: 2, ...surfaceSx }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between", alignItems: "center" }}
                      >
                        <Typography fontWeight={700}>Заказ №{orderId(row)}</Typography>
                        <Chip
                          size="small"
                          color={row.status === "resolved" ? "success" : "warning"}
                          label={
                            tab === "journal"
                              ? complaintStatusLabel(row)
                              : row.status_label || row.status || "—"
                          }
                        />
                      </Stack>
                      <Typography color="text.secondary">
                        Кафе: {row.cafe_name || row.point_id || "—"}
                      </Typography>
                      {tab === "journal" ? (
                        <Typography color="text.secondary">
                          Ошибок: {row.errors_count ?? "—"} · Сумма:{" "}
                          {amountLabel(row.error_amount_total)}
                        </Typography>
                      ) : (
                        <Typography>{row.number || "Клиент не указан"}</Typography>
                      )}
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography>
                          {amountLabel(
                            tab === "journal" ? row.order_snapshot?.order_amount : row.order_price,
                          )}
                        </Typography>
                        {tab === "registration" ? (
                          <Button
                            size="small"
                            onClick={() => setSelected(row)}
                          >
                            Зарегистрировать
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            onClick={() => setSelectedComplaint(row)}
                          >
                            Открыть детали
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </JacoSurface>
                ))}
              </Stack>
            ) : (
              <JacoSurface
                variant="outlined"
                sx={surfaceSx}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {tab === "journal" ? (
                          <>
                            <TableCell
                              sortDirection={
                                complaintsSort.by === "order_id" ? complaintsSort.direction : false
                              }
                            >
                              <TableSortLabel
                                active={complaintsSort.by === "order_id"}
                                direction={
                                  complaintsSort.by === "order_id"
                                    ? complaintsSort.direction
                                    : "asc"
                                }
                                onClick={() => changeComplaintsSort("order_id")}
                              >
                                Заказ
                              </TableSortLabel>
                            </TableCell>
                            <TableCell>Кафе</TableCell>
                            <TableCell>Клиент</TableCell>
                            <TableCell>Адрес</TableCell>
                            <TableCell>Сумма заказа</TableCell>
                            <TableCell>Оплата</TableCell>
                            <TableCell>Общий комментарий</TableCell>
                            <TableCell>Кто решил жалобу</TableCell>
                            <TableCell
                              sortDirection={
                                complaintsSort.by === "status" ? complaintsSort.direction : false
                              }
                            >
                              <TableSortLabel
                                active={complaintsSort.by === "status"}
                                direction={
                                  complaintsSort.by === "status" ? complaintsSort.direction : "asc"
                                }
                                onClick={() => changeComplaintsSort("status")}
                              >
                                Статус жалобы
                              </TableSortLabel>
                            </TableCell>
                            <TableCell
                              sortDirection={
                                complaintsSort.by === "error_amount"
                                  ? complaintsSort.direction
                                  : false
                              }
                            >
                              <TableSortLabel
                                active={complaintsSort.by === "error_amount"}
                                direction={
                                  complaintsSort.by === "error_amount"
                                    ? complaintsSort.direction
                                    : "asc"
                                }
                                onClick={() => changeComplaintsSort("error_amount")}
                              >
                                Сумма ошибки
                              </TableSortLabel>
                            </TableCell>
                            <TableCell
                              sortDirection={
                                complaintsSort.by === "changed_amount"
                                  ? complaintsSort.direction
                                  : false
                              }
                            >
                              <TableSortLabel
                                active={complaintsSort.by === "changed_amount"}
                                direction={
                                  complaintsSort.by === "changed_amount"
                                    ? complaintsSort.direction
                                    : "asc"
                                }
                                onClick={() => changeComplaintsSort("changed_amount")}
                              >
                                Сумма изменения
                              </TableSortLabel>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>Заказ</TableCell>
                            <TableCell>Кафе</TableCell>
                            <TableCell>Клиент</TableCell>
                            <TableCell>Адрес</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Сумма</TableCell>
                          </>
                        )}
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleRows.map((row, index) => (
                        <TableRow
                          hover
                          key={`${orderId(row)}-${index}`}
                          onClick={tab === "journal" ? () => setSelectedComplaint(row) : undefined}
                          sx={tab === "journal" ? { cursor: "pointer" } : undefined}
                        >
                          <TableCell>№{orderId(row)}</TableCell>
                          <TableCell>{row.cafe_name || row.point_id || "—"}</TableCell>
                          {tab === "journal" ? (
                            <>
                              <TableCell>{row.order_snapshot?.client_name || "—"}</TableCell>
                              <TableCell>{row.order_snapshot?.delivery_address || "—"}</TableCell>
                              <TableCell>{row.order_snapshot?.order_amount ?? "—"} ₽</TableCell>
                              <TableCell>{row.order_snapshot?.payment_method || "—"}</TableCell>
                              <TableCell>{row.common_comment || "—"}</TableCell>
                              <TableCell>{row.resolved_by_name || "—"}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  color={row.status === "resolved" ? "success" : "warning"}
                                  label={complaintStatusLabel(row)}
                                />
                              </TableCell>
                              <TableCell>{amountLabel(row.error_amount_total)}</TableCell>
                              <TableCell>
                                {row.is_salary_visible
                                  ? amountLabel(row.changed_amount_total)
                                  : "—"}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{row.number || "—"}</TableCell>
                              <TableCell>
                                {row.type_order_ === 1
                                  ? `${row.street || ""} ${row.home || ""}`
                                  : row.type_order_addr_new || "—"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  color={row.status === "resolved" ? "success" : "warning"}
                                  label={row.status_label || row.status || "—"}
                                />
                              </TableCell>
                              <TableCell>{row.order_price || "—"} ₽</TableCell>
                            </>
                          )}
                          <TableCell align="right">
                            {tab === "registration" ? (
                              <Button
                                size="small"
                                onClick={() => setSelected(row)}
                              >
                                Зарегистрировать
                              </Button>
                            ) : (
                              <Button size="small">Открыть детали</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {tab === "journal" ? (
                  <TablePagination
                    component="div"
                    count={complaintsTotal}
                    page={complaintsPage}
                    rowsPerPage={complaintsPerPage}
                    rowsPerPageOptions={[25, 50, 100]}
                    labelRowsPerPage="Строк на странице"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
                    onPageChange={(_, page) => setComplaintsPage(page)}
                    onRowsPerPageChange={(event) => {
                      setComplaintsPerPage(Number(event.target.value));
                      setComplaintsPage(0);
                    }}
                  />
                ) : null}
              </JacoSurface>
            )}
          </>
        ) : (
          <Stack spacing={2}>
            <JacoSurface
              component="form"
              sx={filterSx}
              onSubmit={(event) => {
                event.preventDefault();
                applyStatistics();
              }}
            >
              <Grid
                container
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <JacoSelect
                    label="Город"
                    options={cities}
                    value={statisticsDraft.cityId}
                    multiple={false}
                    allowNone={false}
                    onChange={(event) => updateStatistics("cityId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <JacoSelect
                    label="Кафе"
                    options={statisticsCafes}
                    value={statisticsDraft.pointId}
                    multiple={false}
                    allowNone={false}
                    onChange={(event) => updateStatistics("pointId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <JacoSelect
                    label="Источник"
                    options={STATISTICS_SOURCES}
                    value={statisticsDraft.source || ""}
                    multiple={false}
                    allowNone
                    noneLabel="Все источники"
                    onChange={(event) =>
                      updateStatistics(
                        "source",
                        event.target.value === "none" ? "" : event.target.value,
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <JacoDatePicker
                    label="Дата от"
                    value={statisticsDraft.dateFrom}
                    onChange={(value) =>
                      updateStatistics("dateFrom", value?.format?.("YYYY-MM-DD") || "")
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <JacoDatePicker
                    label="Дата до"
                    value={statisticsDraft.dateTo}
                    onChange={(value) =>
                      updateStatistics("dateTo", value?.format?.("YYYY-MM-DD") || "")
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <JacoSelect
                    label="Сотрудник"
                    options={statistics?.employees || []}
                    value={statisticsDraft.employeeId || ""}
                    multiple={false}
                    allowNone
                    noneLabel="Все сотрудники"
                    onChange={(event) =>
                      updateStatistics(
                        "employeeId",
                        event.target.value === "none" ? "" : event.target.value,
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <JacoButton
                    type="submit"
                    fullWidth={mobile}
                  >
                    Применить
                  </JacoButton>
                </Grid>
              </Grid>
            </JacoSurface>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <JacoSurface
                  variant="outlined"
                  sx={{ p: 2.5, ...surfaceSx }}
                >
                  <Typography color="text.secondary">Заказов с ошибками</Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    {statistics?.unique_orders ?? "—"}
                  </Typography>
                </JacoSurface>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <JacoSurface
                  variant="outlined"
                  sx={{ p: 2.5, ...surfaceSx }}
                >
                  <Typography color="text.secondary">Всего ошибок</Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    {statistics?.total_errors ?? "—"}
                  </Typography>
                </JacoSurface>
              </Grid>
            </Grid>
            <JacoSurface
              variant="outlined"
              sx={{ p: { xs: 2, md: 2.5 }, ...surfaceSx }}
            >
              <Typography
                fontWeight={700}
                mb={1.5}
              >
                По источнику
              </Typography>
              {(statistics?.by_source || []).length === 0 ? (
                <Typography color="text.secondary">За выбранные фильтры данных нет.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Источник</TableCell>
                      <TableCell align="right">Заказов</TableCell>
                      <TableCell align="right">Ошибок</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(statistics?.by_source || []).map((row) => (
                      <TableRow key={row.source}>
                        <TableCell>{row.source === "cafe" ? "Кафе" : "Контакт-центр"}</TableCell>
                        <TableCell align="right">{row.unique_orders}</TableCell>
                        <TableCell align="right">{row.total_errors}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </JacoSurface>
            <JacoSurface
              variant="outlined"
              sx={{ p: { xs: 2, md: 2.5 }, ...surfaceSx }}
            >
              <Typography
                fontWeight={700}
                mb={1.5}
              >
                Категории и типы ошибок
              </Typography>
              {(statistics?.categories || []).length === 0 ? (
                <Typography color="text.secondary">За выбранные фильтры данных нет.</Typography>
              ) : (
                (statistics?.categories || []).map((category) => (
                  <Accordion
                    key={category.name}
                    disableGutters
                    elevation={0}
                    sx={{ borderTop: 1, borderColor: "divider", "&:before": { display: "none" } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Grid
                        container
                        sx={{ width: "100%", alignItems: "center" }}
                      >
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography fontWeight={700}>{category.name}</Typography>
                        </Grid>
                        <Grid size={{ xs: 4, sm: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Заказов: {category.unique_orders}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4, sm: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Ошибок: {category.total_errors}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4, sm: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {category.share}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Тип ошибки</TableCell>
                            <TableCell align="right">Заказов</TableCell>
                            <TableCell align="right">Ошибок</TableCell>
                            <TableCell align="right">Доля</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {category.types.map((type) => (
                            <TableRow key={type.name}>
                              <TableCell>{type.name}</TableCell>
                              <TableCell align="right">{type.unique_orders}</TableCell>
                              <TableCell align="right">{type.total_errors}</TableCell>
                              <TableCell align="right">{type.share}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </JacoSurface>
          </Stack>
        )}
      </Stack>
      <ComplaintDrawer
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onChanged={() => loadComplaints(appliedFilters)}
        request={request}
        cities={cities}
        points={points}
      />
      <RegistrationDrawer
        selected={selected}
        onClose={() => setSelected(null)}
        request={request}
        onSaved={apply}
        cities={cities}
        points={points}
      />
    </Box>
  );
}

export default memo(ErrorsManagement);
