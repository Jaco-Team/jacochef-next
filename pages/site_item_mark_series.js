import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import LockIcon from "@mui/icons-material/Lock";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import MyAlert from "@/ui/MyAlert";
import { api_laravel_local } from "@/src/api_new";

const MODULE = "site_item_mark_series";

const brandRed = "#DD1A32";
const textPrimary = "#3C3B3B";
const blockBorder = "#E5E5E5";
const blockBackground = "#F3F3F3";

const emptyForm = {
  id: null,
  point_id: "",
  site_item_id: "",
  series: "",
  date_start: new Date().toISOString().slice(0, 10),
  qty: "",
  qty_start: "",
  qty_left: "",
  sort: 0,
  is_active: 1,
  comment: "",
};

function normalizePoint(point) {
  const cityName = point.city_name ? `${point.city_name}, ` : "";
  return { ...point, name: `${cityName}${point.addr}` };
}

function normalizeItem(item) {
  const categoryName = item.category_name ? `${item.category_name}: ` : "";
  return { ...item, name: `${categoryName}${item.name}` };
}

function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10).split("-").reverse().join(".");
}

function formatDateTime(value) {
  if (!value) return "";
  return String(value).replace("T", " ").slice(0, 19);
}

const MOVE_TYPE_NAMES = {
  manual_add: "Ввод остатка",
  manual_correct: "Корректировка",
  manual_close: "Закрытие",
  sale: "Продажа",
};

function getMoveTypeName(type) {
  return MOVE_TYPE_NAMES[type] || type;
}

function getStatusInfo(batch) {
  const isActive = parseInt(batch.is_active) === 1;
  const isSwitched = isActive && parseInt(batch.qty_left) <= 0;
  if (isSwitched) return { color: "success", label: "Берём новый код" };
  if (isActive) return { color: "warning", label: "Расходуем остаток" };
  return { color: "default", label: "Закрыта" };
}

export default function SiteItemMarkSeries() {
  const [moduleName, setModuleName] = useState("Остатки кодов маркировки");
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState([]);
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertStatus, setAlertStatus] = useState(true);
  const [alertText, setAlertText] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("new");
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const [closeOpen, setCloseOpen] = useState(false);
  const [closeBatch, setCloseBatch] = useState(null);
  const [closeReason, setCloseReason] = useState("");

  const [movesOpen, setMovesOpen] = useState(false);
  const [moves, setMoves] = useState([]);
  const [movesBatch, setMovesBatch] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [movesPage, setMovesPage] = useState(0);
  const [movesRowsPerPage, setMovesRowsPerPage] = useState(25);

  const isFirstRender = useRef(true);

  const openAlert = useCallback((status, text) => {
    setAlertOpen(true);
    setAlertStatus(status);
    setAlertText(text);
  }, []);

  const getData = useCallback(async (method, data = {}) => {
    setLoading(true);
    try {
      const result = await api_laravel_local(MODULE, method, data);
      return result?.data || result;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBatches = useCallback(
    async (pointFilter, itemFilter) => {
      const data = await getData("get_all", {
        point_id: pointFilter?.id || null,
        site_item_id: itemFilter?.id || null,
      });
      setPoints((data.points || []).map(normalizePoint));
      setItems((data.items || []).map(normalizeItem));
      setBatches(data.batches || []);
      const name = data.module_info?.name || "Остатки кодов маркировки";
      setModuleName(name);
      document.title = name;
    },
    [getData],
  );

  useEffect(() => {
    loadBatches(null, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    loadBatches(selectedPoint, selectedItem);
  }, [selectedPoint, selectedItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeForm = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const openNewForm = useCallback(() => {
    setFormMode("new");
    setForm({
      ...emptyForm,
      point_id: selectedPoint?.id || "",
      site_item_id: selectedItem?.id || "",
    });
    setIsDirty(false);
    setFormOpen(true);
  }, [selectedPoint, selectedItem]);

  const openEditForm = useCallback((batch) => {
    setFormMode("edit");
    setForm({
      id: batch.id,
      point_id: batch.point_id,
      site_item_id: batch.site_item_id,
      series: batch.series || "",
      date_start: String(batch.date_start || "").slice(0, 10),
      qty: batch.qty_left || "",
      qty_start: batch.qty_start ?? "",
      qty_left: batch.qty_left ?? "",
      sort: batch.sort ?? 0,
      is_active: parseInt(batch.is_active) ? 1 : 0,
      comment: batch.comment || "",
    });
    setIsDirty(false);
    setFormOpen(true);
  }, []);

  const validateForm = useCallback(() => {
    if (!form.point_id || !form.site_item_id || !String(form.series).trim()) {
      openAlert(false, "Заполните обязательные поля: Кафе, Товар и Код");
      return false;
    }
    if (formMode === "new" && (!form.qty || parseInt(form.qty) < 1)) {
      openAlert(false, "Укажите остаток текущего кода");
      return false;
    }
    return true;
  }, [form, formMode, openAlert]);

  const saveForm = useCallback(async () => {
    if (!validateForm()) return;
    setSaving(true);
    const payload =
      formMode === "new"
        ? {
            point_id: parseInt(form.point_id, 10),
            site_item_id: parseInt(form.site_item_id, 10),
            series: String(form.series).trim(),
            date_start: form.date_start,
            qty: parseInt(form.qty, 10),
            sort: parseInt(form.sort || 0, 10),
            comment: form.comment,
          }
        : {
            id: parseInt(form.id, 10),
            series: String(form.series).trim(),
            date_start: form.date_start,
            qty_start: parseInt(form.qty_start, 10),
            qty_left: parseInt(form.qty_left, 10),
            sort: parseInt(form.sort || 0, 10),
            is_active: parseInt(form.is_active, 10),
            comment: form.comment,
          };
    const res = await getData(formMode === "new" ? "save_new" : "save_edit", payload);
    setSaving(false);
    openAlert(res.st, res.text);
    if (res.st) {
      setFormOpen(false);
      setForm({ ...emptyForm });
      setIsDirty(false);
      await loadBatches(selectedPoint, selectedItem);
    }
  }, [form, formMode, getData, openAlert, validateForm, loadBatches, selectedPoint, selectedItem]);

  const requestFormClose = useCallback(() => {
    if (isDirty) {
      setDiscardOpen(true);
    } else {
      setFormOpen(false);
      setForm({ ...emptyForm });
    }
  }, [isDirty]);

  const confirmDiscard = useCallback(() => {
    setDiscardOpen(false);
    setFormOpen(false);
    setForm({ ...emptyForm });
    setIsDirty(false);
  }, []);

  const openCloseDialog = useCallback((batch) => {
    setCloseBatch(batch);
    setCloseReason("");
    setCloseOpen(true);
  }, []);

  const resetCloseDialog = useCallback(() => {
    setCloseOpen(false);
    setCloseBatch(null);
    setCloseReason("");
  }, []);

  const handleCloseBatch = useCallback(async () => {
    if (!closeBatch) return;
    if (!closeReason.trim()) {
      openAlert(false, "Укажите причину закрытия");
      return;
    }
    const res = await getData("close_batch", { id: closeBatch.id, comment: closeReason.trim() });
    openAlert(res.st, res.text);
    if (res.st) {
      resetCloseDialog();
      await loadBatches(selectedPoint, selectedItem);
    }
  }, [
    closeBatch,
    closeReason,
    getData,
    openAlert,
    resetCloseDialog,
    loadBatches,
    selectedPoint,
    selectedItem,
  ]);

  const resetMovesDialog = useCallback(() => {
    setMovesOpen(false);
    setMoves([]);
    setMovesBatch(null);
  }, []);

  const openMoves = useCallback(
    async (batch) => {
      const res = await getData("get_moves", { batch_id: batch.id });
      setMovesBatch(batch);
      setMoves(res.moves || []);
      setMovesPage(0);
      setMovesOpen(true);
    },
    [getData],
  );

  const clearFilters = useCallback(() => {
    setSelectedPoint(null);
    setSelectedItem(null);
  }, []);

  const findPoint = useCallback(
    (id) => points.find((p) => parseInt(p.id) === parseInt(id)) || null,
    [points],
  );

  const findItem = useCallback(
    (id) => items.find((i) => parseInt(i.id) === parseInt(id)) || null,
    [items],
  );

  const paginatedBatches = batches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const paginatedMoves = moves.slice(
    movesPage * movesRowsPerPage,
    movesPage * movesRowsPerPage + movesRowsPerPage,
  );

  const isInitialLoad = loading && batches.length === 0 && points.length === 0;
  const hasFilters = Boolean(selectedPoint || selectedItem);

  const summary = useMemo(() => {
    const acc = { total: batches.length, consuming: 0, switched: 0, closed: 0 };
    batches.forEach((batch) => {
      const isActive = parseInt(batch.is_active) === 1;
      if (!isActive) {
        acc.closed += 1;
      } else if (parseInt(batch.qty_left) <= 0) {
        acc.switched += 1;
      } else {
        acc.consuming += 1;
      }
    });
    return acc;
  }, [batches]);

  const summaryCards = [
    { key: "total", label: "Всего записей", value: summary.total, color: textPrimary },
    { key: "consuming", label: "Расходуем остаток", value: summary.consuming, color: "#ED6C02" },
    { key: "switched", label: "Берём новый код", value: summary.switched, color: "#2E7D32" },
    { key: "closed", label: "Закрыто", value: summary.closed, color: "#9E9E9E" },
  ];

  // ─────────────── dialogs ───────────────

  const renderDiscardDialog = () => (
    <Dialog
      open={discardOpen}
      onClose={() => setDiscardOpen(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Закрыть без сохранения?</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Введённые данные будут потеряны.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDiscardOpen(false)}>Остаться</Button>
        <Button
          color="error"
          variant="contained"
          onClick={confirmDiscard}
        >
          Не сохранять
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderFormDialog = () => {
    const isEdit = formMode === "edit";
    return (
      <Dialog
        open={formOpen}
        onClose={requestFormClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 600, color: textPrimary, pr: 6 }}>
          {isEdit ? "Редактирование остатка" : "Добавление остатка"}
          <IconButton
            aria-label="Закрыть"
            onClick={requestFormClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 3, px: 3 }}>
          <Grid
            container
            spacing={2}
            sx={{ pt: 1 }}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <MyAutocomplite
                label="Кафе"
                data={points}
                value={findPoint(form.point_id)}
                disabled={isEdit}
                func={(_, value) => changeForm("point_id", value?.id || "")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MyAutocomplite
                label="Товар сайта"
                data={items}
                value={findItem(form.site_item_id)}
                disabled={isEdit}
                func={(_, value) => {
                  changeForm("site_item_id", value?.id || "");
                  if (!form.series && value?.series) changeForm("series", value.series);
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MyTextInput
                label="Код после окончания остатка"
                value={form.series}
                func={(e) => changeForm("series", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <MyTextInput
                label="Дата"
                type="date"
                value={form.date_start}
                func={(e) => changeForm("date_start", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <MyTextInput
                label="Сортировка"
                type="number"
                value={form.sort}
                func={(e) => changeForm("sort", e.target.value)}
                fullWidth
              />
            </Grid>
            {isEdit ? (
              <>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MyTextInput
                    label="Введено изначально"
                    type="number"
                    value={form.qty_start}
                    func={(e) => changeForm("qty_start", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MyTextInput
                    label="Остаток текущего кода"
                    type="number"
                    value={form.qty_left}
                    func={(e) => changeForm("qty_left", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MyAutocomplite
                    label="Статус"
                    data={[
                      { id: 1, name: "Активна" },
                      { id: 0, name: "Неактивна" },
                    ]}
                    value={
                      parseInt(form.is_active)
                        ? { id: 1, name: "Активна" }
                        : { id: 0, name: "Неактивна" }
                    }
                    func={(_, value) => changeForm("is_active", value?.id ?? 0)}
                    disableClearable
                  />
                </Grid>
              </>
            ) : (
              <Grid size={{ xs: 12, md: 4 }}>
                <MyTextInput
                  label="Остаток текущего кода"
                  type="number"
                  value={form.qty}
                  func={(e) => changeForm("qty", e.target.value)}
                  fullWidth
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <MyTextInput
                label="Комментарий"
                value={form.comment}
                func={(e) => changeForm("comment", e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={requestFormClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={saveForm}
            disabled={saving}
            sx={{ minWidth: 120 }}
          >
            {saving ? (
              <CircularProgress
                size={18}
                sx={{ mr: 1, color: "inherit" }}
              />
            ) : null}
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderCloseDialog = () => (
    <Dialog
      open={closeOpen}
      onClose={resetCloseDialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Закрыть партию</DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 3, px: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Партия{closeBatch?.series ? ` "${closeBatch.series}"` : ""} будет отключена. Остаток не
          будет списан.
        </Typography>
        <MyTextInput
          label="Причина закрытия"
          value={closeReason}
          func={(e) => setCloseReason(e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={resetCloseDialog}>Отмена</Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleCloseBatch}
        >
          Закрыть партию
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderMovesDialog = () => (
    <Dialog
      open={movesOpen}
      onClose={resetMovesDialog}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ fontWeight: 600, pr: 6 }}>
        История: {movesBatch?.item_name}
        {movesBatch?.series ? (
          <Typography
            component="span"
            sx={{ fontFamily: "monospace", ml: 1.5, fontSize: "0.8rem", color: "text.secondary" }}
          >
            {movesBatch.series}
          </Typography>
        ) : null}
        <IconButton
          aria-label="Закрыть"
          onClick={resetMovesDialog}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 3, px: 3 }}>
        <TableContainer
          component={Paper}
          variant="outlined"
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: blockBackground,
                  "& th": {
                    fontWeight: 700,
                    color: textPrimary,
                    borderBottom: `2px solid ${blockBorder}`,
                  },
                }}
              >
                <TableCell>Дата</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell align="right">
                  <Tooltip
                    title="Изменение остатка"
                    arrow
                  >
                    <span>Δ</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">До</TableCell>
                <TableCell align="right">После</TableCell>
                <TableCell>Заказ</TableCell>
                <TableCell>Пользователь</TableCell>
                <TableCell>Комментарий</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMoves.map((move) => (
                <TableRow
                  key={move.id}
                  sx={{ "&:last-child td": { borderBottom: 0 } }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(move.created_at)}
                  </TableCell>
                  <TableCell>{getMoveTypeName(move.type)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      color: move.qty_delta < 0 ? brandRed : "success.main",
                    }}
                  >
                    {move.qty_delta > 0 ? `+${move.qty_delta}` : move.qty_delta}
                  </TableCell>
                  <TableCell align="right">{move.qty_before}</TableCell>
                  <TableCell align="right">{move.qty_after}</TableCell>
                  <TableCell>{move.order_id || "—"}</TableCell>
                  <TableCell>{move.created_by_name || move.created_by || "—"}</TableCell>
                  <TableCell>{move.comment || "—"}</TableCell>
                </TableRow>
              ))}
              {paginatedMoves.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 5, color: "text.secondary" }}
                  >
                    Движений пока нет
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
        {moves.length > movesRowsPerPage ? (
          <TablePagination
            component="div"
            count={moves.length}
            page={movesPage}
            onPageChange={(_, p) => setMovesPage(p)}
            rowsPerPage={movesRowsPerPage}
            onRowsPerPageChange={(e) => {
              setMovesRowsPerPage(parseInt(e.target.value, 10));
              setMovesPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Строк:"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );

  // ─────────────── main render ───────────────

  return (
    <>
      <Box aria-live="polite">
        <MyAlert
          isOpen={alertOpen}
          onClose={() => setAlertOpen(false)}
          status={alertStatus}
          text={alertText}
        />
      </Box>

      {formOpen ? renderFormDialog() : null}
      {discardOpen ? renderDiscardDialog() : null}
      {closeOpen ? renderCloseDialog() : null}
      {movesOpen ? renderMovesDialog() : null}

      {isInitialLoad ? (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.6)",
          }}
        >
          <CircularProgress aria-label="Загрузка" />
        </Box>
      ) : null}

      <Grid
        container
        spacing={3}
        className="container_first_child"
      >
        {/* Header */}
        <Grid size={{ xs: 12 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-start" }}
            spacing={2}
          >
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
              >
                <h1>{moduleName}</h1>
                <Tooltip title="Обновить">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => loadBatches(selectedPoint, selectedItem)}
                      disabled={loading}
                      aria-label="Обновить данные"
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Коды ведутся отдельно по каждой точке. Текущие поля товара не изменяются.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openNewForm}
              sx={{ mt: { xs: 0, sm: 0.5 }, flexShrink: 0 }}
            >
              Добавить остаток
            </Button>
          </Stack>
        </Grid>

        {/* Filters */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2, border: `1px solid ${blockBorder}` }}>
            <Grid
              container
              spacing={2}
              alignItems="center"
            >
              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <MyAutocomplite
                  label="Кафе"
                  data={points}
                  value={selectedPoint}
                  func={(_, value) => setSelectedPoint(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <MyAutocomplite
                  label="Товар сайта"
                  data={items}
                  value={selectedItem}
                  func={(_, value) => setSelectedItem(value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  sx={{ height: 40 }}
                >
                  Сбросить
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* KPI summary */}
        {batches.length > 0 ? (
          <Grid size={{ xs: 12 }}>
            <Grid
              container
              spacing={2}
            >
              {summaryCards.map((card) => (
                <Grid
                  key={card.key}
                  size={{ xs: 6, sm: 3 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      border: `1px solid ${blockBorder}`,
                      borderLeft: `4px solid ${card.color}`,
                      height: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: card.color,
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {card.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ) : null}

        {/* Table */}
        <Grid size={{ xs: 12 }}>
          {!loading && batches.length === 0 ? (
            <Paper sx={{ py: 8, textAlign: "center", border: `1px solid ${blockBorder}` }}>
              <Typography
                variant="h6"
                color="text.secondary"
              >
                {hasFilters ? "Ничего не найдено" : "Нет записей"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {hasFilters
                  ? "По выбранным фильтрам записей нет"
                  : "Добавьте остаток, выбрав кафе и маркированный товар"}
              </Typography>
              {hasFilters ? (
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ mt: 2 }}
                >
                  Сбросить фильтры
                </Button>
              ) : null}
            </Paper>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{ border: `1px solid ${blockBorder}` }}
              >
                {/* Тонкая полоса загрузки при обновлении существующих данных */}
                {loading && batches.length > 0 ? (
                  <Box
                    sx={{
                      height: 3,
                      backgroundColor: brandRed,
                      opacity: 0.7,
                      borderRadius: "2px 2px 0 0",
                    }}
                  />
                ) : null}
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: blockBackground,
                        "& th": {
                          fontWeight: 700,
                          color: textPrimary,
                          borderBottom: `2px solid ${blockBorder}`,
                        },
                      }}
                    >
                      <TableCell>Кафе</TableCell>
                      <TableCell>Товар</TableCell>
                      <TableCell>Код после остатка</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Дата</TableCell>
                      <TableCell align="right">Введено</TableCell>
                      <TableCell align="right">Остаток</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        Комментарий
                      </TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBatches.map((batch) => {
                      const statusInfo = getStatusInfo(batch);
                      const qtyZero = parseInt(batch.qty_left) === 0;

                      return (
                        <TableRow
                          key={batch.id}
                          sx={{
                            "&:hover": { backgroundColor: "action.hover" },
                            "&:last-child td": { borderBottom: 0 },
                          }}
                        >
                          <TableCell>
                            <Tooltip
                              title={`${batch.city_name ? `${batch.city_name}, ` : ""}${batch.point_addr}`}
                              arrow
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 130,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {batch.point_addr}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={batch.item_name || ""}
                              arrow
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 180,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {batch.item_name}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip
                              title={batch.series || ""}
                              arrow
                            >
                              <Typography
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.8rem",
                                  maxWidth: 140,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {batch.series}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: "none", sm: "table-cell" },
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(batch.date_start)}
                          </TableCell>
                          <TableCell align="right">{batch.qty_start}</TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: qtyZero ? 700 : 400,
                              color: qtyZero ? brandRed : "inherit",
                            }}
                          >
                            {batch.qty_left}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={statusInfo.color}
                              label={statusInfo.label}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: "none", md: "table-cell" },
                              maxWidth: 150,
                            }}
                          >
                            <Tooltip
                              title={batch.comment || ""}
                              arrow
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 150,
                                  color: batch.comment ? "inherit" : "text.disabled",
                                }}
                              >
                                {batch.comment || "—"}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            <Tooltip title="Редактировать">
                              <IconButton
                                size="small"
                                onClick={() => openEditForm(batch)}
                                aria-label="Редактировать"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="История движений">
                              <IconButton
                                size="small"
                                onClick={() => openMoves(batch)}
                                aria-label="История"
                              >
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Закрыть партию">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openCloseDialog(batch)}
                                aria-label="Закрыть партию"
                              >
                                <LockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {batches.length > rowsPerPage ? (
                <TablePagination
                  component="div"
                  count={batches.length}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 25, 50]}
                  labelRowsPerPage="Строк:"
                />
              ) : null}
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
}
