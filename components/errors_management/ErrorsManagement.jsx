"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { api_laravel } from "@/src/api_new";
import { MyDatePickerNew, MySelect } from "@/ui/Forms";
import JacoSearch from "@/ui/JacoSearch";
import dayjs from "dayjs";

const moduleName = "errors_management";
const DEFAULT_FILTERS = {
  cityId: "",
  pointId: "",
  orderNumber: "",
  dateFrom: dayjs().format("YYYY-MM-DD"),
  dateTo: dayjs().format("YYYY-MM-DD"),
};
const rootSx = { pb: 3 };
const surfaceSx = { borderRadius: "12px", borderColor: "divider", boxShadow: "none" };
const tabSx = {
  minHeight: 48,
  "& .MuiTab-root": { minHeight: 48, textTransform: "none", fontWeight: 700 },
};
const filterSx = { p: { xs: 2, md: 2.5 }, ...surfaceSx };
const titleSx = { fontSize: { xs: 26, md: 32 }, fontWeight: 700, lineHeight: 1.2 };
const STATISTICS_SOURCES = [
  { id: "contact_center", name: "Контакт-центр" },
  { id: "cafe", name: "Кафе" },
];

function EmptyResults({ mode, onAction }) {
  const journal = mode === "journal";
  return (
    <Paper
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
        {journal ? (
          <Button
            variant="contained"
            onClick={onAction}
          >
            Перейти к регистрации
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}

function selectOptions(items = []) {
  return items.filter(Boolean).map((item) => ({
    id: String(item.id),
    name: item.name || item.addr || String(item.id),
    city_id: String(item.city_id ?? ""),
  }));
}

function orderId(row) {
  return Number(row?.id ?? row?.order_id ?? 0);
}

function pointId(row) {
  return Number(row?.point_id ?? 0);
}

function activeNodes(catalog, kind, parentId = null) {
  return catalog.filter(
    (node) =>
      node.kind === kind &&
      Boolean(node.is_active) &&
      (parentId === null || Number(node.parent_id) === Number(parentId)),
  );
}

function completeClassifier(catalog, draft, categoryId) {
  const types = activeNodes(catalog, "error_type", categoryId);
  const errorTypeId = types.length === 1 ? String(types[0].id) : "";
  const errors = errorTypeId ? activeNodes(catalog, "error", errorTypeId) : [];
  return {
    ...draft,
    category_id: String(categoryId || ""),
    error_type_id: errorTypeId,
    error_id: errors.length === 1 ? String(errors[0].id) : "",
  };
}

function classifierDraft(catalog, objectType, positionKey = null) {
  const categories = activeNodes(catalog, "category").filter((node) =>
    node.rules?.object_types?.includes(objectType),
  );
  const draft = {
    object_type: objectType,
    position_key: positionKey,
    category_id: "",
    error_type_id: "",
    error_id: "",
    stage_id: "",
    solution_id: "",
    comment: "",
  };
  return categories.length === 1 ? completeClassifier(catalog, draft, categories[0].id) : draft;
}

function ErrorEditor({ value, positions, catalog, solutions, stages, onChange, onRemove }) {
  const position = positions.find((item) => item.position_key === value.position_key);
  const categories = useMemo(
    () =>
      activeNodes(catalog, "category").filter((node) =>
        node.rules?.object_types?.includes(value.object_type),
      ),
    [catalog, value.object_type],
  );
  const types = useMemo(
    () => activeNodes(catalog, "error_type", value.category_id),
    [catalog, value.category_id],
  );
  const errors = useMemo(
    () => activeNodes(catalog, "error", value.error_type_id),
    [catalog, value.error_type_id],
  );
  const selectedError = errors.find((node) => String(node.id) === String(value.error_id));
  const selectedStage = stages.find((node) => String(node.id) === String(value.stage_id));
  const requiresIngredient = Boolean(selectedError?.rules?.requires_ingredient);

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, ...surfaceSx }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          gap={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography fontWeight={700}>{position?.name || "Ошибка заказа"}</Typography>
          <Button
            color="inherit"
            size="small"
            startIcon={<CloseIcon />}
            onClick={onRemove}
          >
            Удалить
          </Button>
        </Stack>
        {categories.length === 0 ? (
          <Alert severity="warning">Для выбранной позиции варианты ошибок не настроены.</Alert>
        ) : null}
        <Grid
          container
          spacing={1.5}
        >
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Категория"
              disabled={categories.length === 0}
              value={value.category_id || ""}
              onChange={(event) => onChange(completeClassifier(catalog, value, event.target.value))}
            >
              <MenuItem value="">Выберите категорию</MenuItem>
              {categories.map((node) => (
                <MenuItem
                  key={node.id}
                  value={node.id}
                >
                  {node.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Тип ошибки"
              disabled={!value.category_id}
              value={value.error_type_id || ""}
              onChange={(event) =>
                onChange({ ...value, error_type_id: event.target.value, error_id: "" })
              }
            >
              <MenuItem value="">Выберите тип ошибки</MenuItem>
              {types.map((node) => (
                <MenuItem
                  key={node.id}
                  value={node.id}
                >
                  {node.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Ошибка"
              disabled={!value.error_type_id}
              value={value.error_id || ""}
              onChange={(event) => onChange({ ...value, error_id: event.target.value })}
            >
              <MenuItem value="">Выберите ошибку</MenuItem>
              {errors.map((node) => (
                <MenuItem
                  key={node.id}
                  value={node.id}
                >
                  {node.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {requiresIngredient ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                required
                fullWidth
                size="small"
                label="Продукт из состава"
                value={value.ingredient_id || ""}
                onChange={(event) => onChange({ ...value, ingredient_id: event.target.value })}
              >
                <MenuItem value="">Выберите продукт</MenuItem>
                {(position?.ingredients || []).map((item) => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Этап возникновения ошибки"
              value={value.stage_id || ""}
              onChange={(event) => onChange({ ...value, stage_id: event.target.value })}
            >
              <MenuItem value="">Выберите этап</MenuItem>
              {stages.map((node) => (
                <MenuItem
                  key={node.id}
                  value={node.id}
                >
                  {node.name}
                </MenuItem>
              ))}
            </TextField>
            {selectedStage?.description ? (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {selectedStage.description}
              </Typography>
            ) : null}
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Комментарий"
              value={value.comment || ""}
              onChange={(event) => onChange({ ...value, comment: event.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              select
              fullWidth
              size="small"
              label="Решение ошибки"
              value={value.solution_id || ""}
              onChange={(event) => onChange({ ...value, solution_id: event.target.value })}
            >
              <MenuItem value="">Не выбрано</MenuItem>
              {solutions.map((node) => (
                <MenuItem
                  key={node.id}
                  value={node.id}
                >
                  {node.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}

function RegistrationDrawer({ selected, onClose, request, onSaved }) {
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
      await request("v2/create", {
        point_id: pointId(selected),
        order_id: orderId(selected),
        errors,
        common_comment: comment,
      });
      onSaved();
      onClose();
    } catch {
      setMessage("Не удалось зарегистрировать жалобу. Проверьте обязательные поля.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Drawer
      anchor="right"
      open={Boolean(selected)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 640 }, p: { xs: 2, md: 3 } } }}
    >
      <Stack
        spacing={2.5}
        sx={{ height: "100%" }}
      >
        <Stack
          direction="row"
          gap={2}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Регистрация жалобы
            </Typography>
            <Typography color="text.secondary">Заказ №{orderId(selected)}</Typography>
          </Box>
          <Button
            color="inherit"
            onClick={onClose}
            startIcon={<CloseIcon />}
          >
            Закрыть
          </Button>
        </Stack>
        {message ? <Alert severity="error">{message}</Alert> : null}
        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : context ? (
          <>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Кафе
              </Typography>
              <Typography>{context.order?.point_id}</Typography>
            </Box>
            <Divider />
            <Stack spacing={1}>
              <Typography fontWeight={700}>Позиции заказа</Typography>
              {context.positions?.map((position) => (
                <Paper
                  key={position.position_key}
                  variant="outlined"
                  sx={{ p: 1.5, ...surfaceSx }}
                >
                  <Stack
                    direction="row"
                    gap={1}
                    sx={{ alignItems: "center", justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography>{position.name}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {position.total_count} шт.
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addError(position)}
                    >
                      Ошибка
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addOrderError}
            >
              Добавить ошибку заказа
            </Button>
            <Stack spacing={1.5}>
              {errors.map((error, index) => (
                <ErrorEditor
                  key={`${error.position_key || "order"}-${index}`}
                  value={error}
                  positions={context.positions || []}
                  catalog={context.catalog || []}
                  solutions={context.solutions || []}
                  stages={context.stages || {}}
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
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Общий комментарий"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <Button
              variant="contained"
              disabled={!errors.length}
              onClick={save}
            >
              Зарегистрировать жалобу
            </Button>
          </>
        ) : null}
      </Stack>
    </Drawer>
  );
}

function ComplaintDrawer({ complaint, onClose, request }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!complaint) return;
    setDetail(null);
    setError("");
    request("v2/detail", { complaint_id: complaint.id, point_id: complaint.point_id })
      .then((response) => setDetail(response?.data ?? response ?? null))
      .catch(() => setError("Не удалось загрузить жалобу."));
  }, [complaint, request]);

  return (
    <Drawer
      anchor="right"
      open={Boolean(complaint)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 560 }, p: { xs: 2, md: 3 } } }}
    >
      <Stack spacing={2}>
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
          <Button
            color="inherit"
            size="small"
            startIcon={<CloseIcon />}
            onClick={onClose}
          >
            Закрыть
          </Button>
        </Stack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {!detail && !error ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : null}
        {detail ? (
          <>
            <Paper
              variant="outlined"
              sx={{ p: 2, ...surfaceSx }}
            >
              <Stack spacing={0.5}>
                <Typography color="text.secondary">Статус</Typography>
                <Typography fontWeight={700}>{detail.status_label}</Typography>
                <Typography
                  color="text.secondary"
                  mt={1}
                >
                  Общий комментарий
                </Typography>
                <Typography>{detail.common_comment || "—"}</Typography>
              </Stack>
            </Paper>
            <Typography fontWeight={700}>Ошибки</Typography>
            <Stack spacing={1.25}>
              {(detail.errors || []).map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{ p: 1.5, ...surfaceSx }}
                >
                  <Typography fontWeight={700}>{item.error_name}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.category_name}
                    {item.error_type_name ? ` · ${item.error_type_name}` : ""}
                  </Typography>
                  <Typography variant="body2">Этап: {item.stage_name}</Typography>
                  {item.solution_name ? (
                    <Typography variant="body2">Решение: {item.solution_name}</Typography>
                  ) : null}
                  {item.comment ? <Typography variant="body2">{item.comment}</Typography> : null}
                </Paper>
              ))}
            </Stack>
            <Typography fontWeight={700}>История</Typography>
            <Stack spacing={1}>
              {(detail.history || []).map((item) => (
                <Box key={item.id}>
                  <Typography variant="body2">{item.entity_label || item.event_type}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {item.actor_name || "Система"} · {item.created_at}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        ) : null}
      </Stack>
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
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [tab, setTab] = useState("journal");
  const [statistics, setStatistics] = useState(null);
  const [statisticsDraft, setStatisticsDraft] = useState(DEFAULT_FILTERS);
  const [statisticsApplied, setStatisticsApplied] = useState(DEFAULT_FILTERS);
  const [ready, setReady] = useState(false);

  const request = useCallback(
    async (method, data = {}) => api_laravel(moduleName, method, data),
    [],
  );
  const loadOrders = useCallback(
    async (nextFilters) => {
      const response = await request("get_orders", {
        city_id: nextFilters.cityId || "",
        point_id: nextFilters.pointId || 0,
        type_order: 0,
        order_id: nextFilters.orderNumber || "",
        number_order: nextFilters.orderNumber || "",
        sum_from: "",
        sum_to: "",
        date_from: nextFilters.dateFrom || "",
        date_to: nextFilters.dateTo || "",
        phone: "",
        number: "",
        time_from: "",
        time_to: "",
      });
      const payload = response?.data ?? response;
      setOrders(Array.isArray(payload?.orders) ? payload.orders : []);
    },
    [request],
  );
  const loadComplaints = useCallback(
    async (nextFilters) => {
      const response = await request("v2/journal", {
        page: 1,
        per_page: 50,
        filters: {
          city_id: nextFilters.cityId || null,
          point_id: nextFilters.pointId || null,
          order_id: nextFilters.orderNumber || null,
          date_from: nextFilters.dateFrom || null,
          date_to: nextFilters.dateTo || null,
        },
      });
      const payload = response?.data ?? response;
      setComplaints(Array.isArray(payload?.items) ? payload.items : []);
    },
    [request],
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
      setFilters(nextFilters);
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
    loadComplaints(filters);
  }, [filters, loadComplaints, ready, tab]);
  useEffect(() => {
    if (!ready || tab !== "registration") return;
    loadOrders(filters);
  }, [filters, loadOrders, ready, tab]);
  const loadStatistics = useCallback(
    async (nextFilters) => {
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
  const update = (field, value) =>
    setFilters((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "cityId" ? { pointId: "" } : {}),
    }));
  const apply = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (tab === "journal") await loadComplaints(filters);
      else await loadOrders(filters);
    } catch {
      setMessage("Не удалось загрузить журнал.");
    } finally {
      setLoading(false);
    }
  };
  const rows = tab === "journal" ? complaints : orders;
  const statisticsCafes = useMemo(
    () =>
      points.filter((item) => !statisticsDraft.cityId || item.city_id === statisticsDraft.cityId),
    [points, statisticsDraft.cityId],
  );
  const updateStatistics = (field, value) =>
    setStatisticsDraft((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "cityId" ? { pointId: "" } : {}),
    }));
  const applyStatistics = () => setStatisticsApplied(statisticsDraft);

  return (
    <Box
      className="container_first_child"
      sx={rootSx}
    >
      <Backdrop
        open={loading}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
          }}
        >
          <Typography
            component="h1"
            sx={titleSx}
          >
            {title}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={bootstrap}
          >
            Обновить
          </Button>
        </Box>
        {message ? <Alert severity="error">{message}</Alert> : null}
        <Paper
          variant="outlined"
          sx={surfaceSx}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="fullWidth"
            sx={tabSx}
          >
            <Tab
              value="journal"
              label="Журнал"
            />
            <Tab
              value="registration"
              label="Регистрация"
            />
            <Tab
              value="statistics"
              label="Статистика"
            />
          </Tabs>
        </Paper>
        {tab !== "statistics" ? (
          <>
            <Paper
              component="form"
              variant="outlined"
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
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MySelect
                    label="Город"
                    data={cities}
                    value={filters.cityId}
                    multiple={false}
                    is_none={false}
                    func={(event) => update("cityId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MySelect
                    label="Кафе"
                    data={cafes}
                    value={filters.pointId}
                    multiple={false}
                    is_none={false}
                    func={(event) => update("pointId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MyDatePickerNew
                    label="Дата от"
                    value={filters.dateFrom}
                    func={(value) => update("dateFrom", value?.format?.("YYYY-MM-DD") || "")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MyDatePickerNew
                    label="Дата до"
                    value={filters.dateTo}
                    func={(value) => update("dateTo", value?.format?.("YYYY-MM-DD") || "")}
                  />
                </Grid>
              </Grid>
            </Paper>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Box sx={{ width: { xs: "100%", sm: 320 } }}>
                <JacoSearch
                  label="Поиск по номеру заказа"
                  value={filters.orderNumber}
                  onValueChange={(value) => update("orderNumber", value)}
                  minLength={1}
                />
              </Box>
              <Button
                variant="contained"
                onClick={apply}
              >
                Найти
              </Button>
            </Box>
            {rows.length === 0 ? (
              <EmptyResults
                mode={tab}
                onAction={() => setTab("registration")}
              />
            ) : mobile ? (
              <Stack spacing={1.5}>
                {rows.map((row, index) => (
                  <Paper
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
                          label={row.status_label || row.status || "—"}
                        />
                      </Stack>
                      <Typography color="text.secondary">Кафе: {row.point_id || "—"}</Typography>
                      <Typography>{row.number || "Клиент не указан"}</Typography>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography>{row.order_price || "—"} ₽</Typography>
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
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Paper
                variant="outlined"
                sx={surfaceSx}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Заказ</TableCell>
                        <TableCell>Кафе</TableCell>
                        <TableCell>{tab === "journal" ? "Автор" : "Клиент"}</TableCell>
                        <TableCell>{tab === "journal" ? "Дата регистрации" : "Адрес"}</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Сумма</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow
                          hover
                          key={`${orderId(row)}-${index}`}
                          onClick={tab === "journal" ? () => setSelectedComplaint(row) : undefined}
                          sx={tab === "journal" ? { cursor: "pointer" } : undefined}
                        >
                          <TableCell>№{orderId(row)}</TableCell>
                          <TableCell>{row.cafe_name || row.point_id || "—"}</TableCell>
                          <TableCell>
                            {tab === "journal" ? row.created_by_name || "—" : row.number || "—"}
                          </TableCell>
                          <TableCell>
                            {tab === "journal"
                              ? row.created_at || "—"
                              : row.type_order_ === 1
                                ? `${row.street || ""} ${row.home || ""}`
                                : row.type_order_addr_new || "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={row.status_label || row.status || "—"}
                            />
                          </TableCell>
                          <TableCell>{row.order_price || "—"} ₽</TableCell>
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
              </Paper>
            )}
          </>
        ) : (
          <Stack spacing={2}>
            <Paper
              component="form"
              variant="outlined"
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
                  <MySelect
                    label="Город"
                    data={cities}
                    value={statisticsDraft.cityId}
                    multiple={false}
                    is_none={false}
                    func={(event) => updateStatistics("cityId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MySelect
                    label="Кафе"
                    data={statisticsCafes}
                    value={statisticsDraft.pointId}
                    multiple={false}
                    is_none={false}
                    func={(event) => updateStatistics("pointId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MySelect
                    label="Источник"
                    data={STATISTICS_SOURCES}
                    value={statisticsDraft.source || ""}
                    multiple={false}
                    is_none
                    func={(event) => updateStatistics("source", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MyDatePickerNew
                    label="Дата от"
                    value={statisticsDraft.dateFrom}
                    func={(value) =>
                      updateStatistics("dateFrom", value?.format?.("YYYY-MM-DD") || "")
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MyDatePickerNew
                    label="Дата до"
                    value={statisticsDraft.dateTo}
                    func={(value) =>
                      updateStatistics("dateTo", value?.format?.("YYYY-MM-DD") || "")
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <MySelect
                    label="Сотрудник"
                    data={statistics?.employees || []}
                    value={statisticsDraft.employeeId || ""}
                    multiple={false}
                    is_none
                    func={(event) => updateStatistics("employeeId", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                  >
                    Применить фильтры
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
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
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
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
                </Paper>
              </Grid>
            </Grid>
            <Paper
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
            </Paper>
            <Paper
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
            </Paper>
          </Stack>
        )}
      </Stack>
      <ComplaintDrawer
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        request={request}
      />
      <RegistrationDrawer
        selected={selected}
        onClose={() => setSelected(null)}
        request={request}
        onSaved={apply}
      />
    </Box>
  );
}

export default memo(ErrorsManagement);
