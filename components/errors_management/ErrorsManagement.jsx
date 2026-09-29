"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
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

function ErrorEditor({ value, positions, catalog, solutions, stages, onChange, onRemove }) {
  const leaves = useMemo(() => {
    const parentIds = new Set(catalog.map((node) => Number(node.parent_id)).filter(Boolean));
    return catalog.filter(
      (node) => Number(node.is_active) === 1 && !parentIds.has(Number(node.id)),
    );
  }, [catalog]);
  const position = positions.find((item) => item.position_key === value.position_key);
  const hasIngredients = Array.isArray(position?.ingredients) && position.ingredients.length > 0;

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
        <Grid
          container
          spacing={1.5}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Ошибка"
              value={value.error_id || ""}
              onChange={(event) => onChange({ ...value, error_id: event.target.value })}
            >
              <MenuItem value="">Выберите ошибку</MenuItem>
              {leaves.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {hasIngredients ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Ингредиент"
                value={value.ingredient_id || ""}
                onChange={(event) => onChange({ ...value, ingredient_id: event.target.value })}
              >
                <MenuItem value="">Не выбран</MenuItem>
                {position.ingredients.map((item) => (
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
              label="Этап"
              value={value.stage_id || ""}
              onChange={(event) => onChange({ ...value, stage_id: event.target.value })}
            >
              <MenuItem value="">Выберите этап</MenuItem>
              {Object.entries(stages).map(([id, name]) => (
                <MenuItem
                  key={id}
                  value={id}
                >
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Решение"
              value={value.solution_id || ""}
              onChange={(event) => onChange({ ...value, solution_id: event.target.value })}
            >
              <MenuItem value="">Не выбрано</MenuItem>
              {solutions.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
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
      {
        object_type: position.type,
        position_key: position.position_key,
        error_id: "",
        stage_id: "",
        solution_id: "",
        comment: "",
      },
    ]);
  };
  const addOrderError = () =>
    setErrors((previous) => [
      ...previous,
      { object_type: "order", error_id: "", stage_id: "", solution_id: "", comment: "" },
    ]);
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
  const [tab, setTab] = useState("journal");
  const [statistics, setStatistics] = useState(null);
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
  useEffect(() => {
    if (!ready || tab !== "statistics") return;
    request("v2/statistics", {
      filters: {
        city_id: filters.cityId || null,
        point_id: filters.pointId || null,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
      },
    }).then((response) => setStatistics(response?.data ?? response ?? null));
  }, [filters.cityId, filters.dateFrom, filters.dateTo, filters.pointId, ready, request, tab]);
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
            {mobile ? (
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
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {row.created_at || "—"}
                          </Typography>
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
                              "—"
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
            <Grid
              container
              spacing={2}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, ...surfaceSx }}
                >
                  <Typography color="text.secondary">Всего жалоб</Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    {statistics?.total ?? "—"}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, ...surfaceSx }}
                >
                  <Typography color="text.secondary">Доля решённых</Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    {statistics ? `${statistics.resolution_rate}%` : "—"}
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
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Источник</TableCell>
                    <TableCell align="right">Жалобы</TableCell>
                    <TableCell align="right">Решено</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(statistics?.by_source || []).map((row) => (
                    <TableRow key={row.source}>
                      <TableCell>{row.source === "cafe" ? "Кафе" : "Контакт-центр"}</TableCell>
                      <TableCell align="right">{row.total}</TableCell>
                      <TableCell align="right">{row.resolved}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ p: { xs: 2, md: 2.5 }, ...surfaceSx }}
            >
              <Typography
                fontWeight={700}
                mb={1.5}
              >
                Категории и ошибки
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Категория</TableCell>
                      <TableCell>Тип ошибки</TableCell>
                      <TableCell>Ошибка</TableCell>
                      <TableCell align="right">Количество</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(statistics?.by_error || []).map((row, index) => (
                      <TableRow key={`${row.error_name}-${index}`}>
                        <TableCell>{row.category_name}</TableCell>
                        <TableCell>{row.error_type_name || "—"}</TableCell>
                        <TableCell>{row.error_name}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        )}
      </Stack>
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
