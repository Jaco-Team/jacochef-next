import React from "react";
import axios from "axios";
import { credentialsConfig, getAuthHeaders } from "@/src/api_new";

import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArchiveIcon from "@mui/icons-material/Archive";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import HelpIcon from "@mui/icons-material/Help";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { MySelect, MyDatePickerNew, MyAutocomplite, MyTextInput } from "@/ui/Forms";

//import {api_laravel_local as api_laravel} from "@/src/api_new";
import { api_laravel } from "@/src/api_new";

import dayjs from "dayjs";
import { formatDateReverse } from "@/src/helpers/ui/formatDate";
import MyAlert from "@/ui/MyAlert";
import { Close } from "@mui/icons-material";
import ExcelCompareSummary from "@/components/check_check/ExcelCompareSummary";
import MismatchDiagnostics from "@/components/check_check/MismatchDiagnostics";
import BatchExcelCheck from "@/components/check_check/BatchExcelCheck";
import OnlineCheckAudit from "@/components/check_check/OnlineCheckAudit";
import TabPanel from "@/ui/TabPanel/TabPanel";
import a11yProps from "@/ui/TabPanel/a11yProps";

const formatNumber = (num) => new Intl.NumberFormat("ru-RU").format(num);

const receiptAmount = (row, field, cashField, bankField) => {
  if (row?.[field] != null) return Number(row[field]) || 0;
  return (Number(row?.[cashField]) || 0) + (Number(row?.[bankField]) || 0);
};

const candidateStatus = (order) => {
  if (!order) return "—";
  if (order.status_text) {
    return `${order.status_text}${order.status_order == null ? "" : ` (${order.status_order})`}`;
  }
  return order.status_order ?? "—";
};

const CompletenessSummary = ({ summary, rowsCount }) => {
  if (!summary) return null;

  const rowsTotal = Number(summary.rows_total) || 0;
  const rowsComplete = Number(summary.rows_complete) || 0;
  const rowsIncomplete = Number(summary.rows_incomplete ?? rowsCount) || 0;
  const percent = Number(
    summary.completeness_percent ?? (rowsTotal > 0 ? (rowsComplete / rowsTotal) * 100 : 100),
  );

  if (rowsIncomplete === 0 && rowsCount === 0) {
    return (
      <Alert severity="success">
        {formatNumber(percent)}% — проблем не найдено. Заполнено {formatNumber(rowsComplete)} из{" "}
        {formatNumber(rowsTotal)} чеков.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
      <Chip
        label={`Заполненность: ${formatNumber(percent)}%`}
        color="primary"
        size="small"
      />
      <Chip
        label={`Заполнено: ${formatNumber(rowsComplete)} / ${formatNumber(rowsTotal)}`}
        size="small"
      />
      <Chip
        label={`Проблемы: ${formatNumber(rowsIncomplete)}`}
        color="error"
        size="small"
      />
      <Chip
        label={`Нет связи с заказом: ${formatNumber(summary.missing_order_count ?? 0)}`}
        size="small"
      />
      <Chip
        label={`Нет рабочей суммы: ${formatNumber(summary.missing_amount_count ?? 0)}`}
        size="small"
      />
      <Chip
        label={`Исходная сумма сохранена: ${formatNumber(summary.recoverable_amount_count ?? 0)} / ${formatNumber(summary.recoverable_amount_total ?? 0)} ₽`}
        color="warning"
        size="small"
      />
      <Chip
        label={`Вероятных заказов: ${formatNumber(summary.unique_candidate_count ?? 0)}`}
        size="small"
      />
      <Chip
        label={`Вероятных лишних чеков: ${formatNumber(summary.duplicate_candidate_count ?? 0)}`}
        color={Number(summary.duplicate_candidate_count) > 0 ? "error" : "default"}
        size="small"
      />
    </Box>
  );
};

const CompletenessRow = ({ row, index, onFind }) => {
  const receiptId = row.receipt_id ?? row.id ?? "—";
  const storedAmount = receiptAmount(row, "stored_amount", "sum_cash", "sum_bank");
  const sourceAmount = receiptAmount(row, "source_amount", "sum_cash_", "sum_bank_");
  const issues = Array.isArray(row.completeness_issues) ? row.completeness_issues : [];
  const likelyOrder = row.likely_order;
  const linkedOrder = row.linked_order;
  const duplicateCandidate = row.duplicate_receipt_candidate;
  const candidateOrders = Array.isArray(row.candidate_orders)
    ? row.candidate_orders.slice(0, 3)
    : [];
  const candidateCount = Number(row.candidate_count ?? candidateOrders.length) || 0;
  const candidateDescriptions = candidateOrders.map(
    (order) =>
      `№${order.order_id} — ${candidateStatus(order)}, ${order.date_time || "время не указано"}`,
  );
  const hasCandidateAnalysis =
    row.linked_order !== undefined ||
    row.likely_order !== undefined ||
    row.duplicate_receipt_candidate !== undefined ||
    row.candidate_count !== undefined ||
    candidateOrders.length > 0;
  const operation =
    row.operation_text ||
    row.transaction_type ||
    (Number(row.type_check) === 2 ? "Возврат" : "Приход");
  const payment = row.payment_type_text || "Не определён";
  const receiptDetails = [
    row.fd ? `ФД ${row.fd}` : null,
    row.fpd ? `ФПД ${row.fpd}` : null,
    row.number_check ? `Чек №${row.number_check}` : null,
  ].filter(Boolean);

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 1.25, sm: 1.5 }, mb: 1.5 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ fontWeight: 600 }}>
          {index + 1}. ID чека ОФД: {receiptId}
        </Typography>
        <Tooltip
          title="Найти заказ"
          arrow
        >
          <IconButton
            size="small"
            aria-label="Найти заказ"
            onClick={() => onFind(row.summ_check, row.date, row)}
          >
            <ReceiptLongIcon sx={{ color: "#c03" }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
        <Chip
          label={operation}
          size="small"
          variant="outlined"
        />
        <Chip
          label={payment}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Касса ${row.kassa ?? "—"}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Смена ${row.smena ?? "—"}`}
          size="small"
          variant="outlined"
        />
        {receiptDetails.map((detail) => (
          <Chip
            key={detail}
            label={detail}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 1,
          mt: 1.25,
        }}
      >
        <Typography variant="body2">
          Дата/время: {row.date || "—"} {row.time || ""}
        </Typography>
        <Typography variant="body2">Рабочая сумма: {formatNumber(storedAmount)} ₽</Typography>
        <Typography variant="body2">Исходная сумма: {formatNumber(sourceAmount)} ₽</Typography>
      </Box>

      {issues.length > 0 && (
        <Box sx={{ mt: 1.25 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {issues.map((issue) => (
              <Chip
                key={issue.code || issue.label}
                label={issue.label || issue.code}
                color="error"
                size="small"
              />
            ))}
          </Box>
          {issues.map((issue) => (
            <Typography
              key={`${issue.code || issue.label}-detail`}
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {issue.detail || issue.label}
            </Typography>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.5,
          mt: 1.25,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Диагноз
          </Typography>
          <Typography variant="body2">
            {row.diagnosis || "Данные чека заполнены не полностью."}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Рекомендация
          </Typography>
          <Typography variant="body2">
            {row.recommendation || "Найдите и проверьте заказ вручную."}
          </Typography>
        </Box>
      </Box>

      {hasCandidateAnalysis && (
        <Box sx={{ mt: 1.25 }}>
          {linkedOrder ? (
            <Alert severity="info">
              Связанный заказ №{linkedOrder.order_id}: {candidateStatus(linkedOrder)},{" "}
              {linkedOrder.date_time || "дата не указана"}.
            </Alert>
          ) : duplicateCandidate ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => onFind(row.summ_check, row.date, row)}
                >
                  Проверить
                </Button>
              }
            >
              Вероятный лишний чек: заказ №{duplicateCandidate.order_id} уже связан с чеком ОФД ID{" "}
              {duplicateCandidate.matching_linked_receipt?.receipt_id || "—"}, чек №
              {duplicateCandidate.matching_linked_receipt?.number_check || "—"}. Обычная привязка
              заблокирована; доступно ручное решение «Исправить лишний чек».
            </Alert>
          ) : likelyOrder ? (
            <Alert severity="warning">
              Вероятный заказ №{likelyOrder.order_id}: {candidateStatus(likelyOrder)}, разница
              времени {formatNumber(likelyOrder.time_difference_minutes ?? 0)} мин. Кандидат не
              применён автоматически.
            </Alert>
          ) : candidateCount > 0 ? (
            <Alert severity="warning">
              Найдено кандидатов: {formatNumber(candidateCount)}.
              {candidateDescriptions.length > 0 && ` ${candidateDescriptions.join("; ")}.`}{" "}
              Однозначный кандидат не выбран и не применён автоматически.
            </Alert>
          ) : (
            <Alert severity="warning">
              Кандидаты заказов не найдены. Связь автоматически не изменялась.
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
};

const getCheckCheckApiUrl = (method) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/";
  return `${baseUrl.replace(/\/$/, "")}/check_check/${method}`;
};

const getExcelDay = (excelCompare, date) =>
  (excelCompare?.diff?.days ?? []).find((day) => day.date === date);

const getExcelSmena = (excelCompare, date, kassa, smena) =>
  (excelCompare?.diff?.smena ?? []).find(
    (row) =>
      row.date === date &&
      Number(row.kassa) === Number(kassa) &&
      Number(row.smena) === Number(smena),
  );

const getExcelColor = (excelDay) => {
  if (!excelDay) return "red";
  return excelDay.color === "green" || excelDay.status === "ok" ? "green" : "red";
};

const getExcelStatusIcon = (color) =>
  color === "green" ? (
    <CheckCircleOutlineIcon
      color="success"
      fontSize="small"
    />
  ) : (
    <ReportProblemOutlinedIcon
      color="error"
      fontSize="small"
    />
  );

const ExcelAmountCell = ({ excelRow, diffField = "diff_chef_bank" }) => {
  const color = getExcelColor(excelRow);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography sx={{ fontWeight: "bold", color }}>
        {formatNumber(excelRow?.excel_bank ?? 0)} ₽
      </Typography>
      <Box sx={{ ml: 1, display: "flex" }}>{getExcelStatusIcon(color)}</Box>
      {color === "red" && Number(excelRow?.[diffField]) !== 0 && (
        <Typography sx={{ ml: 1, color: "red", whiteSpace: "nowrap" }}>
          {formatNumber(excelRow?.[diffField] ?? 0)} ₽
        </Typography>
      )}
    </Box>
  );
};

function getColor(val1, val2, serverColor) {
  const n1 = Number(val1) || 0;
  const n2 = Number(val2) || 0;

  if (n1 !== n2) return "red";

  if (serverColor === "gray" || serverColor === "grey") return "gray";
  if (serverColor === "green") return "green";
  return "inherit";
}

const DiffButton = ({
  visible,
  onClick,
  ctx,
  canEdit = false,
  title = "Расхождение сумм — подробности",
}) => {
  if (!visible) return null;

  const scope = ctx?.scope;
  const canComment = scope === "kassa_day" || scope === "smena";

  const hasComment =
    (typeof ctx?.hasComment === "boolean" ? ctx.hasComment : undefined) ??
    (canComment && typeof ctx?.comment === "string" && ctx.comment.trim().length > 0);

  const tooltip =
    scope === "kassa_day"
      ? hasComment
        ? "Расхождение сумм — есть комментарий"
        : canEdit
          ? "Расхождение сумм — добавить комментарий"
          : "Расхождение сумм — подробности"
      : scope === "day"
        ? hasComment
          ? "Расхождение сумм — есть комментарии"
          : "Расхождение сумм — подробности"
        : title;

  return (
    <Tooltip
      title={tooltip}
      arrow
    >
      <IconButton
        size="small"
        aria-label={tooltip}
        onClick={(e) => {
          e.stopPropagation?.();
          onClick?.(ctx, e);
        }}
        sx={{ ml: 0.5 }}
      >
        <ReportProblemOutlinedIcon
          color={hasComment ? "info" : "error"}
          fontSize="small"
        />
      </IconButton>
    </Tooltip>
  );
};

const status = [
  {
    id: 1,
    name: "Выгружено",
    clr: "green",
    count: 0,
  },
  {
    id: 2,
    name: "Не выгружено",
    clr: "grey",
    count: 0,
  },
  {
    id: 3,
    name: "Ошибка",
    clr: "red",
    count: 0,
  },
  {
    id: 4,
    name: "Комментарий",
    clr: "blue",
    count: 0,
  },
];

class CheckCheck_Accordion_online extends React.Component {
  render() {
    const { orders = [], title = "Не фискализированные онлайн заказы", onCorrection } = this.props;
    const showAction = typeof onCorrection === "function";

    return (
      <Box>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
            <Tooltip
              title="Количество заказов"
              arrow
            >
              <Chip
                label={orders.length}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            </Tooltip>
          </AccordionSummary>

          <AccordionDetails>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Номер заказа</TableCell>
                  <TableCell>Дата / время заказа</TableCell>
                  <TableCell>Тип оплаты</TableCell>
                  <TableCell>Сумма заказа</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.map((order, k) => (
                  <TableRow
                    key={k}
                    hover
                  >
                    <TableCell>{k + 1}</TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.date_time}</TableCell>
                    <TableCell>{order.type_pay_text}</TableCell>
                    <TableCell>{formatNumber(order?.summ_order ?? 0)} ₽</TableCell>

                    {showAction && (
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation?.();
                            onCorrection(order);
                          }}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          Коррекция возврата
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }
}

class CheckCheck_Accordion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openRows: {},
      openSummary: false,
      mismatchOpen: false,
      mismatchCtx: null,
      comment: "",
      activeTab: 0,
      activeKassaTab: 0,
      mismatchDiagnostics: null,
      selectedReceiptId: "",
      selectedOrderId: "",
      resolutionConfirmOpen: false,
      pendingAction: null,
    };
  }

  static findDay(days, date) {
    return (days ?? []).find((d) => d.date === date);
  }

  getPreparedDays = (summ_ofd, summ_chef) => {
    const allDatesSet = new Set([
      ...(summ_ofd?.days ?? []).map((d) => d.date),
      ...(summ_chef?.days ?? []).map((d) => d.date),
    ]);

    const allDates = Array.from(allDatesSet).sort();

    return allDates.map((date) => {
      const ofdDay = CheckCheck_Accordion.findDay(summ_ofd?.days, date);
      const chefDay = CheckCheck_Accordion.findDay(summ_chef?.days, date);

      const kassaIdsSet = new Set([
        ...(ofdDay?.kass ?? []).map((k) => k.kassa),
        ...(chefDay?.kass ?? []).map((k) => k.kassa),
      ]);

      const allKassaIds = Array.from(kassaIdsSet).sort();

      const kassas = allKassaIds.map((kassaId) => ({
        kassaId,
        ofdKassa: (ofdDay?.kass ?? []).find((k) => k.kassa === kassaId) || {},
        chefKassa: (chefDay?.kass ?? []).find((k) => k.kassa === kassaId) || {},
      }));

      return { date, ofdDay, chefDay, kassas };
    });
  };

  toggleRow = (date) => {
    this.setState((prev) => ({
      openRows: { ...prev.openRows, [date]: !prev.openRows[date] },
    }));
  };

  toggleSummary = () => {
    this.setState((prev) => ({ openSummary: !prev.openSummary }));
  };

  getKassTotals = (summ_ofd, summ_chef) => {
    const ids = new Set([
      ...(summ_ofd?.kass_total ?? []).map((k) => k.kassa),
      ...(summ_chef?.kass_total ?? []).map((k) => k.kassa),
    ]);

    return Array.from(ids)
      .sort((a, b) => a - b)
      .map((kassaId) => ({
        kassaId,
        ofdTotal: (summ_ofd?.kass_total ?? []).find((k) => k.kassa === kassaId) || {},
        chefTotal: (summ_chef?.kass_total ?? []).find((k) => k.kassa === kassaId) || {},
      }));
  };

  // данные по сменам
  getSmenaByKassa = (summ_ofd, summ_chef) => {
    const result = {};

    const ofdSmena = summ_ofd?.smena ?? [];
    const chefSmena = summ_chef?.smena ?? [];

    const metaByDateKassa = {};
    (summ_ofd?.days ?? []).forEach((day) => {
      const date = day.date;
      (day.kass ?? []).forEach((k) => {
        const kassaId = Number(k.kassa);
        if (!kassaId) return;

        const key = `${date}__${kassaId}`;

        metaByDateKassa[key] = {
          color: k.color || day.color || "inherit",
          comment: typeof k.comment === "string" ? k.comment : "",
        };
      });
    });

    const makeKey = (kassaId, smena) => `${kassaId}__${smena}`;

    const ofdMap = {};
    const chefMap = {};
    const keysSet = new Set();

    // ---------- ОФД ----------
    ofdSmena.forEach((row) => {
      const date = row.date || row.day || "";
      const kassa = Number(row.kassa);
      const smena = Number(row.smena);

      if (!date || !kassa || !smena) return;

      const key = makeKey(kassa, smena);
      const meta = metaByDateKassa[`${date}__${kassa}`] || {};

      keysSet.add(key);

      ofdMap[key] = {
        date,
        kassaId: kassa,
        smena,
        cash: Number(row.summ_cash) || 0,
        bank: Number(row.summ_bank) || 0,
        cashCount: Number(row.count_cash_checks) || 0,
        bankCount: Number(row.count_bank_checks) || 0,
        // приоритет — комментарий с уровня дня/кассы
        comment:
          meta.comment && meta.comment.trim().length > 0
            ? meta.comment
            : typeof row.comment === "string"
              ? row.comment
              : "",
        serverColor: meta.color || "inherit",
      };
    });

    // ---------- ШЕФ ----------
    chefSmena.forEach((row) => {
      const date = row.date || row.day || "";
      const kassa = Number(row.kassa);
      const smena = Number(row.smena);

      if (!date || !kassa || !smena) return;

      const key = makeKey(kassa, smena);
      const meta = metaByDateKassa[`${date}__${kassa}`] || {};

      keysSet.add(key);

      chefMap[key] = {
        date,
        kassaId: kassa,
        smena,
        cash: Number(row.summ_cash) || 0,
        bank: Number(row.summ_bank) || 0,
        cashCount: Number(row.count_cash_checks) || 0,
        bankCount: Number(row.count_bank_checks) || 0,
        comment:
          meta.comment && meta.comment.trim().length > 0
            ? meta.comment
            : typeof row.comment === "string"
              ? row.comment
              : "",
        serverColor: meta.color || "inherit",
      };
    });

    // ---------- Склейка ОФД + ШЕФ ----------
    keysSet.forEach((key) => {
      const [kassaStr, smenaStr] = key.split("__");
      const kassaId = Number(kassaStr);
      const smena = Number(smenaStr);

      const ofd = ofdMap[key] || {};
      const chef = chefMap[key] || {};

      const date = ofd.date || chef.date || "";

      const comment =
        typeof ofd.comment === "string" && ofd.comment.trim().length > 0
          ? ofd.comment
          : typeof chef.comment === "string"
            ? chef.comment
            : "";

      const serverColor = ofd.serverColor ?? chef.serverColor ?? "inherit";

      if (!result[kassaId]) result[kassaId] = [];

      result[kassaId].push({
        date,
        smena,
        smenaLabel: String(smena),

        ofdCash: ofd.cash ?? 0,
        ofdBank: ofd.bank ?? 0,
        ofdCashCount: ofd.cashCount ?? 0,
        ofdBankCount: ofd.bankCount ?? 0,

        chefCash: chef.cash ?? 0,
        chefBank: chef.bank ?? 0,
        chefCashCount: chef.cashCount ?? 0,
        chefBankCount: chef.bankCount ?? 0,

        comment,
        serverColor,
      });
    });

    return result;
  };

  getMismatchDiagnostics = async (ctx) => {
    const { point, getData } = this.props;

    if (!ctx?.date || !ctx?.kassaId || !ctx?.payType || !point?.base) return null;

    const data = {
      point,
      date: ctx.date,
      kassa: ctx.kassaId,
      pay_type: ctx.payType,
      scope: ctx.scope,
    };

    if (ctx.scope === "smena" && ctx.smena) data.smena = ctx.smena;

    const res = await getData("diagnose_mismatch", data);
    if (!res?.st) return res || null;

    return res.diagnostics || res;
  };

  openMismatch = async (ctx) => {
    this.setState({
      mismatchOpen: true,
      mismatchCtx: ctx,
      comment: ctx?.comment ?? "",
      mismatchDiagnostics: null,
      selectedReceiptId: "",
      selectedOrderId: "",
      resolutionConfirmOpen: false,
      pendingAction: null,
    });

    if (!(ctx?.scope === "kassa_day" || ctx?.scope === "smena")) return;

    const diagnostics = await this.getMismatchDiagnostics(ctx);

    if (diagnostics?.st === false) {
      this.props.openAlert?.(false, diagnostics.text || "Не удалось выполнить диагностику");
      return;
    }

    if (diagnostics?.resolved) {
      this.closeMismatch();
      this.props.openAlert?.(true, diagnostics.text || "Расхождение уже устранено");
      return;
    }

    this.setState({ mismatchDiagnostics: diagnostics });
  };

  closeMismatch = () =>
    this.setState({
      mismatchOpen: false,
      mismatchCtx: null,
      comment: "",
      mismatchDiagnostics: null,
      selectedReceiptId: "",
      selectedOrderId: "",
      resolutionConfirmOpen: false,
      pendingAction: null,
    });

  goToMismatchDetails = () => {
    const { mismatchCtx } = this.state;

    this.setState((prev) => ({
      activeTab: 0,
      openRows: mismatchCtx?.date ? { ...prev.openRows, [mismatchCtx.date]: true } : prev.openRows,
      mismatchOpen: false,
      mismatchCtx: null,
      comment: "",
      mismatchDiagnostics: null,
    }));
  };

  openResolutionConfirm = (action) => {
    this.setState({
      resolutionConfirmOpen: true,
      pendingAction: action,
    });
  };

  closeResolutionConfirm = () => {
    this.setState({
      resolutionConfirmOpen: false,
      pendingAction: null,
    });
  };

  resolveMismatch = async () => {
    const { getData, openAlert, refreshOrders } = this.props;
    const {
      mismatchCtx,
      mismatchDiagnostics,
      pendingAction,
      selectedReceiptId,
      selectedOrderId,
      comment,
    } = this.state;

    if (!mismatchCtx || !mismatchDiagnostics?.case_id || !pendingAction?.type) return;

    const data = {
      case_id: mismatchDiagnostics.case_id,
      version: mismatchDiagnostics.version,
      action: pendingAction.type,
      receipt_id: selectedReceiptId || null,
      order_id: selectedOrderId || null,
      comment: comment.trim(),
    };

    const res = await getData("resolve_mismatch", data);

    if (!res?.st) {
      this.closeResolutionConfirm();
      openAlert?.(false, res?.text || "Не удалось применить решение");
      return;
    }

    this.setState({
      resolutionConfirmOpen: false,
      pendingAction: null,
      selectedReceiptId: "",
      selectedOrderId: "",
    });

    openAlert?.(true, res.text || "Решение применено");
    await refreshOrders?.();

    if (res.resolved) {
      this.closeMismatch();
      return;
    }

    const diagnostics = res.diagnostics || (await this.getMismatchDiagnostics(mismatchCtx));

    if (!diagnostics || diagnostics.st === false || diagnostics.resolved) {
      this.closeMismatch();
      return;
    }

    this.setState({ mismatchDiagnostics: diagnostics });
  };

  handleCommentChange = (e) => this.setState({ comment: e.target.value });

  saveComment = async () => {
    const { mismatchCtx, comment } = this.state;
    const { acces_comment, save_comment } = this.props;

    if (!mismatchCtx || (mismatchCtx.scope !== "kassa_day" && mismatchCtx.scope !== "smena")) {
      return;
    }
    if (String(acces_comment) !== "1") return;
    const smena_list = (mismatchCtx.smena_list || "").trim();
    if (!smena_list) return;

    const data = {
      date: mismatchCtx.date,
      kassa: mismatchCtx.kassaId,
      smena_list,
      comment: comment,
    };

    save_comment(data);

    this.setState({
      mismatchOpen: false,
      mismatchCtx: null,
      comment: "",
    });
  };

  changeTab = (event, value) => {
    this.setState({
      activeTab: value,
    });
  };

  changeKassaTab = (event, value) => {
    this.setState({
      activeKassaTab: value,
    });
  };

  calcSmenaCountForDayKassa = (date, kassaId, summ_ofd, summ_chef) => {
    const ofdCnt = (summ_ofd?.smena ?? []).filter(
      (s) => s.date === date && Number(s.kassa) === Number(kassaId),
    ).length;

    const chefCnt = (summ_chef?.smena ?? []).filter(
      (s) => s.date === date && Number(s.kassa) === Number(kassaId),
    ).length;

    const cnt = Math.max(ofdCnt, chefCnt);

    return cnt || 1;
  };

  render() {
    const { summ_ofd, summ_chef, acces_comment, acces_resolve, excelCompare } = this.props;
    const {
      openRows,
      openSummary,
      mismatchOpen,
      mismatchCtx,
      comment,
      activeTab,
      activeKassaTab,
      mismatchDiagnostics,
      selectedReceiptId,
      selectedOrderId,
      resolutionConfirmOpen,
      pendingAction,
    } = this.state;

    const daysMerged = this.getPreparedDays(summ_ofd, summ_chef);
    const kassTotals = this.getKassTotals(summ_ofd, summ_chef);

    // готовим данные по сменам
    const smenaByKassa = this.getSmenaByKassa(summ_ofd, summ_chef);

    const counts = { green: 0, gray: 0, red: 0 };

    daysMerged.forEach(({ date, ofdDay, chefDay, kassas }) => {
      kassas.forEach(({ kassaId, ofdKassa = {}, chefKassa = {} }) => {
        const ofdSum = (ofdKassa.summ_cash ?? 0) + (ofdKassa.summ_bank ?? 0);
        const chefSum = (chefKassa.summ_cash ?? 0) + (chefKassa.summ_bank ?? 0);

        let smenaCount = Number(ofdKassa.smena_count ?? 0);
        if (!smenaCount || smenaCount < 1) {
          smenaCount = this.calcSmenaCountForDayKassa(date, kassaId, summ_ofd, summ_chef);
        }

        const summColor = ofdKassa.color ?? ofdDay?.color ?? "inherit";
        const color = getColor(ofdSum, chefSum, summColor);

        if (color === "red") counts.red += smenaCount;
        else if (color === "gray" || color === "grey") counts.gray += smenaCount;
        else if (color === "green") counts.green += smenaCount;
      });
    });

    const statusRows = status.map((s) => {
      let baseCount =
        s.clr === "green"
          ? counts.green
          : s.clr === "grey" || s.clr === "gray"
            ? counts.gray
            : s.clr === "red"
              ? counts.red
              : s.count;

      if (s.id === 4) {
        return {
          ...s,
          clr: "info.main",
          count: Number(summ_ofd?.comment_count ?? 0),
        };
      }

      return { ...s, count: baseCount };
    });

    const num = (v) => Number(v) || 0;
    const hasCashMismatchInside = daysMerged.some(
      ({ ofdDay, chefDay }) => num(ofdDay?.summ_cash) !== num(chefDay?.summ_cash),
    );
    const hasBankMismatchInside = daysMerged.some(
      ({ ofdDay, chefDay }) => num(ofdDay?.summ_bank) !== num(chefDay?.summ_bank),
    );

    let colorAllCash = getColor(summ_ofd?.all_cash, summ_chef?.all_cash, summ_ofd?.color);
    let colorAllBank = getColor(summ_ofd?.all_bank, summ_chef?.all_bank, summ_ofd?.color);
    if (hasCashMismatchInside) colorAllCash = "red";
    if (hasBankMismatchInside) colorAllBank = "red";

    const canEdit = Number(acces_comment) === 1;
    const canResolve = Number(acces_resolve) === 1;

    return (
      <Box>
        <Accordion expanded>
          <AccordionSummary>
            <Typography sx={{ fontWeight: "bold" }}>Данные по суммам</Typography>
          </AccordionSummary>

          <AccordionDetails>
            {/* таблица статуса смен */}
            <TableContainer
              component={Paper}
              sx={{ mb: 5, width: "40%" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                    <TableCell
                      sx={{ minWidth: 180, fontWeight: 400 }}
                      colSpan={2}
                    >
                      Тип цвета суммы в зависимости от смены
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statusRows.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: item.clr, fontWeight: "bold" }}>
                        {item.name}
                      </TableCell>
                      <TableCell sx={{ color: item.clr, fontWeight: "bold" }}>
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* таблица с общими суммами */}
            <Table
              size="small"
              sx={{ mb: 5, tableLayout: excelCompare ? "fixed" : "auto" }}
            >
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                  <TableCell style={{ width: "8%" }} />
                  <TableCell
                    style={{ width: excelCompare ? "36%" : "46%" }}
                    colSpan={2}
                  >
                    Суммы из выгруженного ОФД
                  </TableCell>
                  <TableCell
                    style={{ width: excelCompare ? "36%" : "46%" }}
                    colSpan={2}
                  >
                    Суммы из системы ШЕФ
                  </TableCell>
                  {excelCompare && <TableCell style={{ width: "18%" }}>Суммы из Excel</TableCell>}
                  <TableCell style={{ width: 48 }} />
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow
                  hover
                  onClick={(e) => {
                    e.stopPropagation();
                    this.toggleSummary();
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell style={{ width: "8%", fontWeight: "bold" }} />

                  <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ mr: 1 }}>Наличные за период:</Typography>
                      <Typography sx={{ fontWeight: "bold", color: colorAllCash }}>
                        {formatNumber(summ_ofd?.all_cash ?? 0)} ₽
                      </Typography>

                      <DiffButton
                        visible={colorAllCash === "red"}
                        onClick={this.openMismatch}
                        ctx={{
                          scope: "period",
                          label: "Наличные (период)",
                          ofd: summ_ofd?.all_cash,
                          chef: summ_chef?.all_cash,
                          smena_list: "",
                          comment: "",
                        }}
                        canEdit={canEdit}
                      />

                      <Tooltip
                        title="Количество чеков"
                        arrow
                      >
                        <Chip
                          label={formatNumber(summ_ofd?.count_cash_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ mr: 1 }}>Безнал за период:</Typography>
                      <Typography sx={{ fontWeight: "bold", color: colorAllBank }}>
                        {formatNumber(summ_ofd?.all_bank ?? 0)} ₽
                      </Typography>

                      <DiffButton
                        visible={colorAllBank === "red"}
                        onClick={this.openMismatch}
                        ctx={{
                          scope: "period",
                          label: "Безнал (период)",
                          ofd: summ_ofd?.all_bank,
                          chef: summ_chef?.all_bank,
                          smena_list: "",
                          comment: "",
                        }}
                        canEdit={canEdit}
                      />

                      <Tooltip
                        title="Количество чеков"
                        arrow
                      >
                        <Chip
                          label={formatNumber(summ_ofd?.count_bank_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ mr: 1 }}>Наличные за период:</Typography>
                      <Typography sx={{ fontWeight: "bold", color: colorAllCash }}>
                        {formatNumber(summ_chef?.all_cash ?? 0)} ₽
                      </Typography>
                      <Tooltip
                        title="Количество чеков"
                        arrow
                      >
                        <Chip
                          label={formatNumber(summ_chef?.count_cash_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ mr: 1 }}>Безнал за период:</Typography>
                      <Typography sx={{ fontWeight: "bold", color: colorAllBank }}>
                        {formatNumber(summ_chef?.all_bank ?? 0)} ₽
                      </Typography>
                      <Tooltip
                        title="Количество чеков"
                        arrow
                      >
                        <Chip
                          label={formatNumber(summ_chef?.count_bank_checks ?? 0)}
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  {excelCompare && (
                    <TableCell style={{ width: "18%" }}>
                      <ExcelAmountCell excelRow={excelCompare?.diff?.all} />
                    </TableCell>
                  )}

                  <TableCell
                    style={{ width: 48 }}
                    align="left"
                  >
                    <ExpandMoreIcon
                      style={{
                        display: "flex",
                        transform: openSummary ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* таблица с общими суммами по кассам */}
            {openSummary && kassTotals.length > 0 && (
              <TableContainer
                component={Paper}
                sx={{ mb: 3 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "7%", borderRight: "1px solid #ccc" }}>
                        Касса
                      </TableCell>
                      <TableCell style={{ width: "22%" }}>Наличные за период</TableCell>
                      <TableCell style={{ width: "22%", borderRight: "1px solid #ccc" }}>
                        Безнал за период
                      </TableCell>
                      <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                        Наличные за период
                      </TableCell>
                      <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                        Безнал за период
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kassTotals.map(({ kassaId, ofdTotal, chefTotal }) => {
                      const colCash = getColor(
                        ofdTotal.summ_cash,
                        chefTotal.summ_cash,
                        ofdTotal.color,
                      );
                      const colBank = getColor(
                        ofdTotal.summ_bank,
                        chefTotal.summ_bank,
                        ofdTotal.color,
                      );
                      return (
                        <TableRow key={`tot-${kassaId}`}>
                          <TableCell style={{ borderRight: "1px solid #ccc" }}>
                            {`${kassaId}${kassaId === 2 ? " (онлайн)" : ""}`}
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ color: colCash }}>
                                {formatNumber(ofdTotal?.summ_cash ?? 0)} ₽
                              </Typography>
                              <DiffButton
                                visible={colCash === "red"}
                                onClick={this.openMismatch}
                                ctx={{
                                  scope: "kassa_total",
                                  kassaId,
                                  label: "Наличные (период по кассе)",
                                  ofd: ofdTotal?.summ_cash,
                                  chef: chefTotal?.summ_cash,
                                  smena_list: "",
                                  comment: "",
                                }}
                                canEdit={canEdit}
                              />
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(ofdTotal?.count_cash_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell style={{ borderRight: "1px solid #ccc" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ color: colBank }}>
                                {formatNumber(ofdTotal?.summ_bank ?? 0)} ₽
                              </Typography>
                              <DiffButton
                                visible={colBank === "red"}
                                onClick={this.openMismatch}
                                ctx={{
                                  scope: "kassa_total",
                                  kassaId,
                                  label: "Безнал (период по кассе)",
                                  ofd: ofdTotal?.summ_bank,
                                  chef: chefTotal?.summ_bank,
                                  smena_list: "",
                                  comment: "",
                                }}
                                canEdit={canEdit}
                              />
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(ofdTotal?.count_bank_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ color: colCash }}>
                                {formatNumber(chefTotal?.summ_cash ?? 0)} ₽
                              </Typography>
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(chefTotal?.count_cash_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ color: colBank }}>
                                {formatNumber(chefTotal?.summ_bank ?? 0)} ₽
                              </Typography>
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(chefTotal?.count_bank_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* табы для переключения между датами и сменами */}
            <Grid
              style={{ paddingBottom: 24 }}
              size={12}
            >
              <Paper>
                <Tabs
                  value={activeTab}
                  onChange={this.changeTab}
                  centered
                  variant="fullWidth"
                >
                  <Tab
                    label="Даты"
                    {...a11yProps(0)}
                  />
                  <Tab
                    label="Смены"
                    {...a11yProps(1)}
                  />
                </Tabs>
              </Paper>
            </Grid>

            {/* таб с таблицами по датам */}
            <TabPanel
              value={activeTab}
              index={0}
            >
              <Table
                size="small"
                sx={{ tableLayout: excelCompare ? "fixed" : "auto" }}
              >
                {excelCompare && (
                  <colgroup>
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: 48 }} />
                  </colgroup>
                )}
                <TableBody>
                  {daysMerged.map(({ date, ofdDay, chefDay, kassas }) => {
                    const excelDay = getExcelDay(excelCompare, date);
                    const colorCashDay = getColor(
                      ofdDay?.summ_cash,
                      chefDay?.summ_cash,
                      ofdDay?.color,
                    );
                    const colorBankDay = getColor(
                      ofdDay?.summ_bank,
                      chefDay?.summ_bank,
                      ofdDay?.color,
                    );

                    const hasCommentForDate = [
                      ...(ofdDay?.kass ?? []),
                      ...(chefDay?.kass ?? []),
                    ].some((k) => typeof k?.comment === "string" && k.comment.trim().length > 0);

                    return (
                      <React.Fragment key={date}>
                        <TableRow
                          hover
                          onClick={() => this.toggleRow(date)}
                          style={{ cursor: "pointer" }}
                        >
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {formatDateReverse(date)}
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ mr: 1 }}>Наличные за день:</Typography>
                              <Typography sx={{ fontWeight: "bold", color: colorCashDay }}>
                                {formatNumber(ofdDay?.summ_cash ?? 0)} ₽
                              </Typography>
                              <DiffButton
                                visible={colorCashDay === "red"}
                                onClick={this.openMismatch}
                                ctx={{
                                  scope: "day",
                                  date,
                                  label: "Наличные (день)",
                                  ofd: ofdDay?.summ_cash,
                                  chef: chefDay?.summ_cash,
                                  smena_list: "",
                                  comment: "",
                                  hasComment: hasCommentForDate,
                                }}
                                canEdit={canEdit}
                              />
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(ofdDay?.count_cash_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ mr: 1 }}>Безнал за день:</Typography>
                              <Typography sx={{ fontWeight: "bold", color: colorBankDay }}>
                                {formatNumber(ofdDay?.summ_bank ?? 0)} ₽
                              </Typography>
                              <DiffButton
                                visible={colorBankDay === "red"}
                                onClick={this.openMismatch}
                                ctx={{
                                  scope: "day",
                                  date,
                                  label: "Безнал (день)",
                                  ofd: ofdDay?.summ_bank,
                                  chef: chefDay?.summ_bank,
                                  smena_list: ofdDay?.smena_list || "",
                                  comment: "",
                                  hasComment: hasCommentForDate,
                                }}
                                canEdit={canEdit}
                              />
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(ofdDay?.count_bank_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ mr: 1 }}>Наличные за день:</Typography>
                              <Typography sx={{ fontWeight: "bold", color: colorCashDay }}>
                                {formatNumber(chefDay?.summ_cash ?? 0)} ₽
                              </Typography>
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(chefDay?.count_cash_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ mr: 1 }}>Безнал за день:</Typography>
                              <Typography sx={{ fontWeight: "bold", color: colorBankDay }}>
                                {formatNumber(chefDay?.summ_bank ?? 0)} ₽
                              </Typography>
                              <Tooltip
                                title="Количество чеков"
                                arrow
                              >
                                <Chip
                                  label={formatNumber(chefDay?.count_bank_checks ?? 0)}
                                  size="small"
                                  sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                />
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {excelCompare && (
                            <TableCell style={{ width: "18%" }}>
                              <ExcelAmountCell excelRow={excelDay} />
                            </TableCell>
                          )}

                          <TableCell
                            style={{ width: 48 }}
                            align="center"
                          >
                            <ExpandMoreIcon
                              style={{
                                display: "flex",
                                transform: openRows[date] ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s",
                              }}
                            />
                          </TableCell>
                        </TableRow>

                        {openRows[date] && (
                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={excelCompare ? 7 : 6}
                            >
                              <TableContainer
                                component={Paper}
                                sx={{ mt: 3, mb: 3 }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        style={{ width: "7%", borderRight: "1px solid #ccc" }}
                                      >
                                        Касса
                                      </TableCell>
                                      <TableCell style={{ width: "22%" }}>Наличные</TableCell>
                                      <TableCell
                                        style={{ width: "22%", borderRight: "1px solid #ccc" }}
                                      >
                                        Безнал
                                      </TableCell>
                                      <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                                        Наличные
                                      </TableCell>
                                      <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                                        Безнал
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {kassas.map(({ kassaId, ofdKassa = {}, chefKassa = {} }) => {
                                      const colCash = getColor(
                                        ofdKassa.summ_cash,
                                        chefKassa.summ_cash,
                                        ofdKassa.color,
                                      );
                                      const colBank = getColor(
                                        ofdKassa.summ_bank,
                                        chefKassa.summ_bank,
                                        ofdKassa.color,
                                      );

                                      return (
                                        <TableRow key={kassaId}>
                                          <TableCell style={{ borderRight: "1px solid #ccc" }}>
                                            {`${kassaId}${kassaId === 2 ? " (онлайн)" : ""}`}
                                          </TableCell>

                                          <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <Typography sx={{ color: colCash }}>
                                                {formatNumber(ofdKassa.summ_cash ?? 0)} ₽
                                              </Typography>
                                              <DiffButton
                                                visible={colCash === "red"}
                                                onClick={this.openMismatch}
                                                ctx={{
                                                  scope: "kassa_day",
                                                  date,
                                                  kassaId,
                                                  payType: "cash",
                                                  label: "Наличные (касса/день)",
                                                  ofd: ofdKassa.summ_cash,
                                                  chef: chefKassa.summ_cash,
                                                  smena_list: ofdKassa?.smena_list || "",
                                                  comment: ofdKassa?.comment || "",
                                                }}
                                                canEdit={canEdit}
                                              />
                                              <Tooltip
                                                title="Количество чеков"
                                                arrow
                                              >
                                                <Chip
                                                  label={formatNumber(
                                                    ofdKassa.count_cash_checks ?? 0,
                                                  )}
                                                  size="small"
                                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                                />
                                              </Tooltip>
                                            </Box>
                                          </TableCell>

                                          <TableCell style={{ borderRight: "1px solid #ccc" }}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <Typography sx={{ color: colBank }}>
                                                {formatNumber(ofdKassa.summ_bank ?? 0)} ₽
                                              </Typography>
                                              <DiffButton
                                                visible={colBank === "red"}
                                                onClick={this.openMismatch}
                                                ctx={{
                                                  scope: "kassa_day",
                                                  date,
                                                  kassaId,
                                                  payType: "bank",
                                                  label: "Безнал (касса/день)",
                                                  ofd: ofdKassa.summ_bank,
                                                  chef: chefKassa.summ_bank,
                                                  smena_list: ofdKassa?.smena_list || "",
                                                  comment: ofdKassa?.comment || "",
                                                }}
                                                canEdit={canEdit}
                                              />
                                              <Tooltip
                                                title="Количество чеков"
                                                arrow
                                              >
                                                <Chip
                                                  label={formatNumber(
                                                    ofdKassa.count_bank_checks ?? 0,
                                                  )}
                                                  size="small"
                                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                                />
                                              </Tooltip>
                                            </Box>
                                          </TableCell>

                                          <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <Typography sx={{ color: colCash }}>
                                                {formatNumber(chefKassa.summ_cash ?? 0)} ₽
                                              </Typography>
                                              <Tooltip
                                                title="Количество чеков"
                                                arrow
                                              >
                                                <Chip
                                                  label={formatNumber(
                                                    chefKassa.count_cash_checks ?? 0,
                                                  )}
                                                  size="small"
                                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                                />
                                              </Tooltip>
                                            </Box>
                                          </TableCell>

                                          <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                              <Typography sx={{ color: colBank }}>
                                                {formatNumber(chefKassa.summ_bank ?? 0)} ₽
                                              </Typography>
                                              <Tooltip
                                                title="Количество чеков"
                                                arrow
                                              >
                                                <Chip
                                                  label={formatNumber(
                                                    chefKassa.count_bank_checks ?? 0,
                                                  )}
                                                  size="small"
                                                  sx={{ ml: 1, fontWeight: 400, cursor: "default" }}
                                                />
                                              </Tooltip>
                                            </Box>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TabPanel>

            {/* таб с таблицами по сменам */}
            <TabPanel
              value={activeTab}
              index={1}
            >
              {kassTotals.length === 0 ? (
                <Typography>Нет данных по кассам за выбранный период</Typography>
              ) : (
                <>
                  {/* ТАБЫ по кассам */}
                  <Grid
                    style={{ paddingBottom: 24 }}
                    size={12}
                  >
                    <Paper>
                      <Tabs
                        value={activeKassaTab}
                        onChange={this.changeKassaTab}
                        centered
                        variant="fullWidth"
                      >
                        {kassTotals.map(({ kassaId }, idx) => (
                          <Tab
                            key={kassaId}
                            label={`Касса ${kassaId}${kassaId === 2 ? " (онлайн)" : ""}`}
                            {...a11yProps(idx)}
                          />
                        ))}
                      </Tabs>
                    </Paper>
                  </Grid>

                  {/* Кассы в табе Смены */}
                  {kassTotals.map(({ kassaId }, idx) => {
                    const rows = smenaByKassa[kassaId] || [];

                    return (
                      <TabPanel
                        key={`kassa-tab-${kassaId}`}
                        value={activeKassaTab}
                        index={idx}
                      >
                        {rows.length === 0 ? (
                          <Typography>По данной кассе нет смен за выбранный период</Typography>
                        ) : (
                          <Table
                            size="small"
                            sx={{ tableLayout: excelCompare ? "fixed" : "auto" }}
                          >
                            {excelCompare && (
                              <colgroup>
                                <col style={{ width: "8%" }} />
                                <col style={{ width: "18%" }} />
                                <col style={{ width: "18%" }} />
                                <col style={{ width: "18%" }} />
                                <col style={{ width: "18%" }} />
                                <col style={{ width: "18%" }} />
                              </colgroup>
                            )}
                            <TableHead>
                              <TableRow>
                                <TableCell style={{ width: "8%" }}>Смены</TableCell>
                                <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                                  Наличные за период (ОФД)
                                </TableCell>
                                <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                                  Безналичные за период (ОФД)
                                </TableCell>
                                <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                                  Наличные за период (ШЕФ)
                                </TableCell>
                                <TableCell style={{ width: excelCompare ? "18%" : "23%" }}>
                                  Безналичные за период (ШЕФ)
                                </TableCell>
                                {excelCompare && (
                                  <TableCell style={{ width: "18%" }}>
                                    Безналичные за период (Excel)
                                  </TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows.map((row, i) => {
                                const isOnline = kassaId === 2;

                                const colCash = getColor(
                                  row.ofdCash,
                                  row.chefCash,
                                  row.serverColor,
                                );
                                const colBank = getColor(
                                  row.ofdBank,
                                  row.chefBank,
                                  row.serverColor,
                                );

                                const excelSmena = getExcelSmena(
                                  excelCompare,
                                  row.date,
                                  kassaId,
                                  row.smena,
                                );

                                return (
                                  <TableRow
                                    key={`${kassaId}-${row.date}-${row.smena}-${i}`}
                                    hover
                                  >
                                    {/* Смена */}
                                    <TableCell style={{ fontWeight: "bold" }}>
                                      {row.smenaLabel}
                                    </TableCell>

                                    {/* ОФД НАЛ */}
                                    <TableCell>
                                      {isOnline ? (
                                        <Typography sx={{ color: "text.secondary" }}>—</Typography>
                                      ) : (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                          <Typography sx={{ color: colCash }}>
                                            {formatNumber(row.ofdCash || 0)} ₽
                                          </Typography>

                                          <DiffButton
                                            visible={colCash === "red"}
                                            onClick={this.openMismatch}
                                            ctx={{
                                              scope: "smena",
                                              date: row.date,
                                              kassaId,
                                              smena: row.smena,
                                              payType: "cash",
                                              smena_list: row.smenaLabel,
                                              label: "Наличные (смена)",
                                              ofd: row.ofdCash,
                                              chef: row.chefCash,
                                              comment: row.comment || "",
                                            }}
                                            canEdit={canEdit}
                                          />

                                          <Tooltip
                                            title="Количество чеков"
                                            arrow
                                          >
                                            <Chip
                                              label={formatNumber(row.ofdCashCount || 0)}
                                              size="small"
                                              sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                            />
                                          </Tooltip>
                                        </Box>
                                      )}
                                    </TableCell>

                                    {/* ОФД БЕЗНАЛ */}
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ color: colBank }}>
                                          {formatNumber(row.ofdBank || 0)} ₽
                                        </Typography>

                                        <DiffButton
                                          visible={colBank === "red"}
                                          onClick={this.openMismatch}
                                          ctx={{
                                            scope: "smena",
                                            date: row.date,
                                            kassaId,
                                            smena: row.smena,
                                            payType: "bank",
                                            smena_list: row.smenaLabel,
                                            label: "Безнал (смена)",
                                            ofd: row.ofdBank,
                                            chef: row.chefBank,
                                            comment: row.comment || "",
                                          }}
                                          canEdit={canEdit}
                                        />

                                        <Tooltip
                                          title="Количество чеков"
                                          arrow
                                        >
                                          <Chip
                                            label={formatNumber(row.ofdBankCount || 0)}
                                            size="small"
                                            sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                          />
                                        </Tooltip>
                                      </Box>
                                    </TableCell>

                                    {/* ШЕФ НАЛ */}
                                    <TableCell>
                                      {isOnline ? (
                                        <Typography sx={{ color: "text.secondary" }}>—</Typography>
                                      ) : (
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                          <Typography sx={{ color: colCash }}>
                                            {formatNumber(row.chefCash || 0)} ₽
                                          </Typography>
                                          <Tooltip
                                            title="Количество чеков"
                                            arrow
                                          >
                                            <Chip
                                              label={formatNumber(row.chefCashCount || 0)}
                                              size="small"
                                              sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                            />
                                          </Tooltip>
                                        </Box>
                                      )}
                                    </TableCell>

                                    {/* ШЕФ БЕЗНАЛ */}
                                    <TableCell>
                                      <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Typography sx={{ color: colBank }}>
                                          {formatNumber(row.chefBank || 0)} ₽
                                        </Typography>
                                        <Tooltip
                                          title="Количество чеков"
                                          arrow
                                        >
                                          <Chip
                                            label={formatNumber(row.chefBankCount || 0)}
                                            size="small"
                                            sx={{ ml: 1, fontWeight: 500, cursor: "default" }}
                                          />
                                        </Tooltip>
                                      </Box>
                                    </TableCell>

                                    {excelCompare && (
                                      <TableCell>
                                        <ExcelAmountCell excelRow={excelSmena} />
                                      </TableCell>
                                    )}
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </TabPanel>
                    );
                  })}
                </>
              )}
            </TabPanel>
          </AccordionDetails>
        </Accordion>

        {/* Модалка по ошибкам (расхождение сумм ОФД и ШЕФ) */}
        <Dialog
          open={mismatchOpen}
          onClose={this.closeMismatch}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Расхождение сумм
            <IconButton
              onClick={this.closeMismatch}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {(() => {
              const c = mismatchCtx || {};
              const nOfd = Number(c.ofd) || 0;
              const nChef = Number(c.chef) || 0;
              const diff = Math.abs(nOfd - nChef);
              const smenaList = (typeof c.smena_list === "string" ? c.smena_list : "").trim();
              const num = (v) => Number(v) || 0;

              let dayCommentRows = [];
              if (c.scope === "day") {
                const ofdDay = (summ_ofd?.days ?? []).find((d) => d.date === c.date) || {};
                const chefDay = (summ_chef?.days ?? []).find((d) => d.date === c.date) || {};

                (ofdDay?.kass ?? []).forEach((ofdK) => {
                  const id = Number(ofdK?.kassa);
                  const txt = (ofdK?.comment ?? "").trim();
                  if (!id || !txt) return;

                  const chfK = (chefDay?.kass ?? []).find((k) => Number(k.kassa) === id) || {};
                  const cashMismatch = num(ofdK?.summ_cash) !== num(chfK?.summ_cash);
                  const bankMismatch = num(ofdK?.summ_bank) !== num(chfK?.summ_bank);

                  if (cashMismatch)
                    dayCommentRows.push({ kassa: id, payType: "Наличные", comment: txt });
                  if (bankMismatch)
                    dayCommentRows.push({ kassa: id, payType: "Безнал", comment: txt });
                });

                const order = { Наличные: 1, Безнал: 2 };
                dayCommentRows.sort(
                  (a, b) => a.kassa - b.kassa || order[a.payType] - order[b.payType],
                );
              }

              return (
                <>
                  {c.date && (
                    <Typography sx={{ mb: 0.5 }}>
                      Дата: <b>{formatDateReverse(c.date) || c.date}</b>
                    </Typography>
                  )}
                  {c.kassaId != null && (
                    <Typography sx={{ mb: 0.5 }}>
                      Касса: <b>{c.kassaId}</b>
                    </Typography>
                  )}
                  {smenaList && (
                    <Typography sx={{ mb: 0.5 }}>
                      Смена: <b>{smenaList}</b>
                    </Typography>
                  )}
                  {c.label && (
                    <Typography sx={{ mb: 1 }}>
                      Показатель: <b>{c.label}</b>
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography>
                      ОФД: <b>{formatNumber ? formatNumber(nOfd) : nOfd} ₽</b>
                    </Typography>
                    <Typography>
                      ШЕФ: <b>{formatNumber ? formatNumber(nChef) : nChef} ₽</b>
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      Разница: <b>{formatNumber ? formatNumber(diff) : diff} ₽</b>
                    </Typography>
                  </Box>

                  {(c.scope === "kassa_day" || c.scope === "smena") && (
                    <MismatchDiagnostics
                      diagnostics={mismatchDiagnostics}
                      selectedReceiptId={selectedReceiptId}
                      selectedOrderId={selectedOrderId}
                      onSelectReceipt={(id) => this.setState({ selectedReceiptId: id })}
                      onSelectOrder={(id) => this.setState({ selectedOrderId: id })}
                      onAction={this.openResolutionConfirm}
                      canResolve={canResolve}
                      formatNumber={formatNumber}
                    />
                  )}

                  {c.scope !== "kassa_day" && c.scope !== "smena" && (
                    <Typography color="text.secondary">
                      Подробный разбор доступен в красной строке конкретной кассы за день или смены.
                    </Typography>
                  )}

                  {c.scope === "day" && dayCommentRows.length > 0 && (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3}>Комментарии:</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ width: "18%" }}>Касса</TableCell>
                            <TableCell sx={{ width: "22%" }}>Тип оплаты</TableCell>
                            <TableCell>Комментарий</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dayCommentRows.map((row, idx) => (
                            <TableRow key={`${row.kassa}-${row.payType}-${idx}`}>
                              <TableCell>{`${row.kassa}${row.kassa === 2 ? " (онлайн)" : ""}`}</TableCell>
                              <TableCell>{row.payType}</TableCell>
                              <TableCell>
                                <Typography sx={{ whiteSpace: "pre-line" }}>
                                  {row.comment}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {(c.scope === "kassa_day" || c.scope === "smena") && (
                    <Box sx={{ mt: 2 }}>
                      <MyTextInput
                        label="Комментарий"
                        value={comment}
                        func={this.handleCommentChange}
                        multiline
                        maxRows={6}
                        disabled={!canEdit && !canResolve}
                        className={!canEdit && !canResolve ? "disabled_input" : undefined}
                      />
                    </Box>
                  )}
                </>
              );
            })()}
          </DialogContent>

          <DialogActions>
            {mismatchCtx && mismatchCtx.scope !== "kassa_day" && mismatchCtx.scope !== "smena" && (
              <Button
                onClick={this.goToMismatchDetails}
                variant="contained"
                color="info"
              >
                К детализации
              </Button>
            )}
            {mismatchCtx &&
              (mismatchCtx.scope === "kassa_day" || mismatchCtx.scope === "smena") &&
              canEdit && (
                <Button
                  onClick={this.saveComment}
                  variant="contained"
                  color="success"
                >
                  Сохранить комментарий
                </Button>
              )}
            <Button
              onClick={this.closeMismatch}
              variant="contained"
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>

        {/* Подтверждение выбранного решения */}
        <Dialog
          open={resolutionConfirmOpen}
          onClose={this.closeResolutionConfirm}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Подтвердите действие</DialogTitle>

          <DialogContent dividers>
            <Typography sx={{ mb: 1 }}>
              Решение: <b>{pendingAction?.label}</b>
            </Typography>
            {pendingAction?.description && (
              <Typography sx={{ mb: 1 }}>{pendingAction.description}</Typography>
            )}
            {pendingAction?.expected_effect && (
              <Typography sx={{ mb: 1 }}>
                Ожидаемый результат: <b>{pendingAction.expected_effect}</b>
              </Typography>
            )}
            {selectedReceiptId && (
              <Typography>
                Чек ОФД: <b>{selectedReceiptId}</b>
              </Typography>
            )}
            {selectedOrderId && (
              <Typography>
                Заказ: <b>{selectedOrderId}</b>
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <MyTextInput
                label="Комментарий"
                value={comment}
                func={this.handleCommentChange}
                multiline
                maxRows={6}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              style={{ color: "#fff", backgroundColor: "#000" }}
              onClick={this.closeResolutionConfirm}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color={pendingAction?.type?.startsWith("correction_") ? "error" : "success"}
              onClick={this.resolveMismatch}
            >
              Подтвердить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
}

class CheckCheck_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      selectedOrder: null,
      manualOrderId: "",
      manualSearchError: "",
      confirmDialog: false,
      duplicateConfirmDialog: false,
      duplicateSubmitting: false,
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props);

    if (!this.props.orders) {
      return;
    }

    if (this.props.orders !== prevProps.orders) {
      this.setState({
        orders: this.props.orders,
      });
    }
  }

  openConfirm = (order) => {
    if (order?.can_link !== true) return;

    this.setState({
      confirmDialog: true,
      selectedOrder: order,
    });
  };

  save = async () => {
    const { selectedOrder } = this.state;
    if (!selectedOrder?.can_link) return;

    const saved = await this.props.saveOrder(
      this.props.searchMeta?.receipt?.receipt_id ??
        this.props.order?.receipt_id ??
        this.props.order?.id,
      selectedOrder,
    );

    if (saved) this.onClose();
  };

  searchManualOrder = () => {
    const orderId = Number(this.state.manualOrderId);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      this.setState({ manualSearchError: "Укажите корректный ID заказа" });
      return;
    }

    this.setState({ manualSearchError: "" });
    this.props.searchOrder(orderId);
  };

  resolveDuplicate = async () => {
    const {
      duplicate_receipt_candidate: candidate,
      receipt,
      recommended_action: action,
    } = this.props.searchMeta || {};
    const receiptId =
      action?.receipt_id ??
      receipt?.receipt_id ??
      this.props.order?.receipt_id ??
      this.props.order?.id;
    const orderId = action?.order_id ?? candidate?.order_id;
    if (
      action?.action !== "duplicate_receipt_correction" ||
      !orderId ||
      !receiptId ||
      this.state.duplicateSubmitting
    )
      return;

    this.setState({ duplicateSubmitting: true });
    try {
      const resolved = await this.props.resolveDuplicate(receiptId, orderId);
      if (resolved) this.setState({ duplicateConfirmDialog: false });
    } finally {
      this.setState({ duplicateSubmitting: false });
    }
  };

  onClose = () => {
    this.setState({
      orders: [],
      confirmDialog: false,
      duplicateConfirmDialog: false,
      duplicateSubmitting: false,
      selectedOrder: null,
      manualOrderId: "",
      manualSearchError: "",
    });

    this.props.onClose();
  };

  render() {
    const {
      orders,
      selectedOrder,
      manualOrderId,
      manualSearchError,
      confirmDialog,
      duplicateConfirmDialog,
      duplicateSubmitting,
    } = this.state;
    const { order, open, fullScreen, searchMeta, canResolve } = this.props;
    const receipt = searchMeta?.receipt || {
      receipt_id: order?.receipt_id ?? order?.id,
      date_time: [order?.date, order?.time].filter(Boolean).join(" "),
      amount: order?.summ_check,
      payment_type_text: order?.payment_type_text,
    };
    const duplicateCandidate = searchMeta?.duplicate_receipt_candidate;
    const duplicateAction = searchMeta?.recommended_action;
    const matchingReceipt = duplicateCandidate?.matching_linked_receipt;

    return (
      <>
        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
          maxWidth="sm"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false })}
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>Подтвердите действие</DialogTitle>
          <DialogContent dividers>
            <Typography>
              Привязать чек ОФД ID {receipt?.receipt_id || "—"} к заказу №
              {selectedOrder?.order_id ?? selectedOrder?.id ?? "—"}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={this.save}
            >
              Привязать
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={duplicateConfirmDialog}
          onClose={() => {
            if (!duplicateSubmitting) this.setState({ duplicateConfirmDialog: false });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Исправить лишний чек?</DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ mb: 1 }}>
              Заказ №{duplicateCandidate?.order_id || "—"}; лишний чек ОФД ID{" "}
              {receipt?.receipt_id || "—"}.
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Уже связанный чек: ID {matchingReceipt?.receipt_id || "—"}, чек №
              {matchingReceipt?.number_check || "—"},{" "}
              {matchingReceipt?.date_time || "дата не указана"}.
            </Typography>
            <Typography sx={{ mb: 2 }}>Сумма: {formatNumber(receipt?.amount ?? 0)} ₽.</Typography>
            <Alert severity="warning">
              Лишний чек будет связан с заказом, исходная сумма будет перенесена в рабочее поле и
              будет создан чек коррекции возврата. Заказ не будет удалён.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={duplicateSubmitting}
              onClick={() => this.setState({ duplicateConfirmDialog: false })}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={duplicateSubmitting}
              onClick={this.resolveDuplicate}
            >
              {duplicateSubmitting ? "Исправление…" : "Исправить лишний чек"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={open}
          onClose={this.onClose}
          fullScreen={fullScreen}
          fullWidth={true}
          maxWidth={"lg"}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle className="button">
            <Typography style={{ fontWeight: "bold" }}>
              Выбрать из списка подходящий заказ
            </Typography>
            <IconButton onClick={this.onClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent style={{ paddingTop: 10, paddingBottom: 10 }}>
            <Paper
              variant="outlined"
              sx={{ p: 1.5, mb: 2 }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                Чек ОФД ID {receipt?.receipt_id || "—"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {receipt?.date_time || "Дата не указана"} · {formatNumber(receipt?.amount ?? 0)} ₽ ·{" "}
                {receipt?.payment_type_text || "Тип оплаты не определён"}
              </Typography>
            </Paper>

            {duplicateCandidate && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  Number(canResolve) === 1 &&
                  duplicateAction?.action === "duplicate_receipt_correction" ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => this.setState({ duplicateConfirmDialog: true })}
                    >
                      Исправить лишний чек
                    </Button>
                  ) : null
                }
              >
                Заказ №{duplicateCandidate.order_id} уже связан с чеком ОФД ID{" "}
                {matchingReceipt?.receipt_id || "—"} на ту же сумму. Обычная привязка заблокирована.
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "stretch", sm: "flex-start" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
                mb: 2,
              }}
            >
              <TextField
                size="small"
                type="number"
                label="ID заказа"
                value={manualOrderId}
                error={Boolean(manualSearchError)}
                helperText={manualSearchError}
                onChange={(event) =>
                  this.setState({ manualOrderId: event.target.value, manualSearchError: "" })
                }
              />
              <Button
                variant="outlined"
                onClick={this.searchManualOrder}
              >
                Найти по ID
              </Button>
            </Box>

            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Кандидаты: {formatNumber(searchMeta?.candidate_count ?? orders.length)}
            </Typography>

            {orders.length === 0 ? (
              <Alert severity="info">Подходящие заказы не найдены.</Alert>
            ) : (
              orders.map((item, index) => {
                const orderId = item.order_id ?? item.id;
                const linkedReceipts = Array.isArray(item.linked_receipts)
                  ? item.linked_receipts
                  : [];
                return (
                  <Paper
                    key={orderId ?? index}
                    variant="outlined"
                    sx={{ p: 1.5, mb: 1.5 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>Заказ №{orderId || "—"}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatNumber(item.amount ?? item.summ_check ?? 0)} ₽
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {item.order_type || "Тип заказа не указан"} ·{" "}
                      {item.date_time || item.date || "Дата не указана"}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                      <Chip
                        label={`Статус: ${candidateStatus(item)}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={item.payment_type_text || "Тип оплаты не указан"}
                        size="small"
                        variant="outlined"
                      />
                      {item.time_difference_minutes != null && (
                        <Chip
                          label={`Разница: ${formatNumber(item.time_difference_minutes)} мин`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {item.payment_matches === false && (
                        <Chip
                          label="Оплата не совпадает"
                          size="small"
                          color="warning"
                        />
                      )}
                      {item.duplicate_receipt_match && (
                        <Chip
                          label="Вероятный лишний чек"
                          size="small"
                          color="error"
                        />
                      )}
                      {Number(item.is_delete) === 1 && (
                        <Chip
                          label="Заказ удалён"
                          size="small"
                          color="error"
                        />
                      )}
                    </Box>

                    {linkedReceipts.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Уже связанные чеки
                        </Typography>
                        {linkedReceipts.map((linkedReceipt) => (
                          <Typography
                            key={linkedReceipt.receipt_id}
                            variant="body2"
                          >
                            ID {linkedReceipt.receipt_id}, чек №{linkedReceipt.number_check || "—"},{" "}
                            {linkedReceipt.date_time || "дата не указана"},{" "}
                            {formatNumber(
                              linkedReceipt.stored_amount || linkedReceipt.source_amount || 0,
                            )}{" "}
                            ₽
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {item.blocked_reason && (
                      <Alert
                        severity="warning"
                        sx={{ mt: 1 }}
                      >
                        {item.blocked_reason}
                      </Alert>
                    )}

                    {item.can_link === true && Number(canResolve) === 1 && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        sx={{ mt: 1 }}
                        startIcon={<ArchiveIcon />}
                        onClick={() => this.openConfirm(item)}
                      >
                        Привязать заказ
                      </Button>
                    )}
                  </Paper>
                );
              })
            )}
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              onClick={this.onClose}
            >
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

class CheckCheck_ extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      module: "check_check",
      module_name: "",
      is_load: false,

      points: [],
      kass: [],

      date_start: dayjs(),
      date_end: dayjs(),

      point_id: "",
      kassa: [],

      open_alert: false,
      err_status: true,
      err_text: "",

      complete_data: [],
      complete_data_summary: null,
      summ_ofd: null,
      summ_chef: null,

      order: null,
      modalOrder: false,
      fullScreen: false,
      orders: [],
      orderSearchMeta: null,

      isAccordionOpen: false,
      confirmDialog: false,
      unfisc_online_orders: null,

      acces: null,
      needsRefresh: true,
      need_upload: false,
      excelCompare: null,
      excelFileName: "",
      onlineAudit: null,
    };
  }

  async componentDidMount() {
    const data = await this.getData("get_all");

    this.setState({
      kass: data.kass,
      points: data.points,
      module_name: data.module_info.name,
      acces: data.acces,
    });

    document.title = data.module_info.name;
  }

  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };

  handleResize = () => {
    if (window.innerWidth < 601) {
      this.setState({
        fullScreen: true,
      });
    } else {
      this.setState({
        fullScreen: false,
      });
    }
  };

  changeDateRange = (field, newDate) => {
    this.setState({
      [field]: newDate,
      needsRefresh: true,
      excelCompare: null,
      excelFileName: "",
      onlineAudit: null,
      complete_data: [],
      complete_data_summary: null,
    });
  };

  changeSort = (type, event) => {
    this.setState({
      [type]: event.target.value,
      needsRefresh: true,
      excelCompare: null,
      excelFileName: "",
      onlineAudit: null,
      complete_data: [],
      complete_data_summary: null,
    });
  };

  changeKass = (data, event, value) => {
    this.setState({
      [data]: value,
      needsRefresh: true,
      excelCompare: null,
      excelFileName: "",
      onlineAudit: null,
      complete_data: [],
      complete_data_summary: null,
    });
  };

  check_data() {
    let { date_start, date_end, point_id, kassa, points } = this.state;

    if (!date_start || !date_end || !point_id || !Array.isArray(kassa) || kassa.length === 0) {
      this.openAlert(
        false,
        "Необходимо заполнить даты начала и конца, указать точку и выбрать кассу",
      );
      return null;
    }

    const formattedStart = dayjs(date_start).format("YYYY-MM-DD");
    const formattedEnd = dayjs(date_end).format("YYYY-MM-DD");

    const point = points.find((it) => parseInt(it.id, 10) === parseInt(point_id, 10));

    return {
      date_start: formattedStart,
      date_end: formattedEnd,
      point,
      kassa,
    };
  }

  getOrders = async () => {
    const data = this.check_data();
    if (!data) return;

    if (Number(this.state.acces?.check_access) === 1) {
      data.acces = "check";
    }

    const res = await this.getData("get_orders", data);

    // console.log('getOrders res', res);

    if (!res.st) {
      this.openAlert(false, res.text);
    } else {
      this.setState({
        complete_data: res.complete_data ?? [],
        complete_data_summary: res.complete_data_summary ?? null,
        summ_ofd: res.summ_ofd,
        summ_chef: res.summ_chef,
        unfisc_online_orders: res.unfisc_online_orders,
        needsRefresh: false,
        need_upload: false,
        excelCompare: null,
        excelFileName: "",
      });
    }
  };

  auditOnline = async () => {
    const { date_start, date_end, point_id, points, acces } = this.state;

    if (!date_start || !date_end || !point_id) {
      this.openAlert(false, "Укажите период и кафе");
      return;
    }

    const point = points.find((it) => Number(it.id) === Number(point_id));
    if (!point) {
      this.openAlert(false, "Не найдено выбранное кафе");
      return;
    }

    const res = await this.getData("audit_online", {
      date_start: dayjs(date_start).format("YYYY-MM-DD"),
      date_end: dayjs(date_end).format("YYYY-MM-DD"),
      point,
      auto_repair: Number(acces?.resolve_access) === 1,
    });

    if (!res.st) {
      this.setState({ onlineAudit: null });
      this.openAlert(false, res.text);
      return;
    }

    this.setState({ onlineAudit: res.online_audit });
  };

  uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (this.state.needsRefresh) {
      this.openAlert(false, "Параметры изменились. Нажмите «Показать».");
      return;
    }

    const data = this.check_data();
    if (!data) return;

    data.compare_with = "chef";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(data));
    formData.append("method", "upload_excel");
    formData.append("module", "check_check");
    formData.append("version", 2);

    this.setState({ is_load: true });

    try {
      const response = await axios.post(getCheckCheckApiUrl("upload_excel"), formData, {
        ...credentialsConfig,
        headers: getAuthHeaders({ "Content-Type": "multipart/form-data" }),
      });

      const res = response.data?.data || response.data;

      if (!res?.st) {
        this.setState({ excelCompare: null, excelFileName: "" });
        this.openAlert(false, res?.text || "Ошибка загрузки Excel файла");
        return;
      }

      this.setState({
        excelCompare: res,
        excelFileName: file.name,
      });
      this.openAlert(true, "Excel файл загружен");
    } catch (error) {
      this.setState({ excelCompare: null, excelFileName: "" });
      this.openAlert(false, "Ошибка загрузки Excel файла");
    } finally {
      setTimeout(() => {
        this.setState({ is_load: false });
      }, 500);
    }
  };

  openModal = async (summ, date, order) => {
    this.handleResize();

    const { point_id, points } = this.state;

    const point = points.find((it) => parseInt(it.id) === parseInt(point_id));

    const data = {
      summ,
      point,
      date,
      receipt_id: order?.receipt_id ?? order?.id,
    };

    const res = await this.getData("find_order", data);
    if (!res.st) {
      this.openAlert(false, res.text || "Не удалось найти подходящие заказы");
      return;
    }

    this.setState({
      modalOrder: true,
      orders: Array.isArray(res.orders) ? res.orders : [],
      orderSearchMeta: res,
      order,
    });
  };

  searchOrderById = async (orderId) => {
    const { point_id, points, order, orderSearchMeta } = this.state;
    const point = points.find((it) => parseInt(it.id) === parseInt(point_id));
    const receiptId = orderSearchMeta?.receipt?.receipt_id ?? order?.receipt_id ?? order?.id;
    if (!point || !receiptId || !orderId) {
      this.openAlert(false, "Не хватает данных для поиска заказа");
      return;
    }

    const res = await this.getData("find_order", {
      point,
      receipt_id: receiptId,
      order_id: orderId,
    });
    if (!res.st) {
      this.openAlert(false, res.text || "Не удалось найти заказ");
      return;
    }

    this.setState({
      orders: Array.isArray(res.orders) ? res.orders : [],
      orderSearchMeta: res,
    });
  };

  saveOrder = async (receiptId, candidate) => {
    if (candidate?.can_link !== true) {
      this.openAlert(
        false,
        candidate?.blocked_reason || "Обычная привязка этого заказа недоступна",
      );
      return false;
    }

    const { point_id, points } = this.state;
    const point = points.find((it) => parseInt(it.id) === parseInt(point_id));
    const orderId = candidate.order_id ?? candidate.id;

    const data = {
      id: receiptId,
      order_id: orderId,
      point,
    };

    const res = await this.getData("save_order", data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }

    return Boolean(res.st);
  };

  resolveDuplicateReceipt = async (receiptId, orderId) => {
    const { point_id, points } = this.state;
    const point = points.find((it) => parseInt(it.id) === parseInt(point_id));
    if (!point || !receiptId || !orderId) {
      this.openAlert(false, "Не хватает данных для исправления лишнего чека");
      return false;
    }

    const res = await this.getData("resolve_duplicate_receipt", {
      point,
      receipt_id: receiptId,
      order_id: orderId,
    });
    this.openAlert(res.st, res.text);

    if (!res.st) return false;

    this.setState({
      modalOrder: false,
      orders: [],
      order: null,
      orderSearchMeta: null,
    });
    await this.getOrders();
    return true;
  };

  openAlert = (status, text) => {
    this.setState({
      open_alert: true,
      err_status: status,
      err_text: text,
    });
  };

  handleAccordionChange = (event, isExpanded) => {
    this.setState({ isAccordionOpen: isExpanded });
  };

  set_orders = async () => {
    if (this.state.needsRefresh) {
      this.openAlert(false, "Параметры изменились. Нажмите «Показать».");
      return;
    }

    const data = this.check_data();
    if (!data) return;

    const res = await this.getData("set_orders", data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }
  };

  check_data_for_1C = async () => {
    if (this.state.needsRefresh) {
      this.openAlert(false, "Параметры изменились. Нажмите «Показать».");
      return;
    }

    const data = this.check_data();
    if (!data) return;

    const res = await this.getData("check_data_1C", data);

    if (res.st) {
      this.setState({
        confirmDialog: true,
        need_upload: res.need_upload,
      });
    } else {
      this.openAlert(res.st, res.text);
    }
  };

  upload_data_1C = async (type) => {
    this.setState({
      confirmDialog: false,
    });

    const data = this.check_data();
    if (!data) return;

    data.type = type;

    // включать/выключать debug-режим
    data.debug = false;

    const res = await this.getData("upload_data_1C", data);

    this.openAlert(res.st, res.text);

    if (res.st && !data.debug) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }
  };

  save_comment = async (data) => {
    data.point_id = this.state.point_id;

    const res = await this.getData("save_err_comment", data);

    this.openAlert(res.st, res.text);

    if (res.st) {
      setTimeout(() => {
        this.getOrders();
      }, 500);
    }
  };

  render() {
    const {
      is_load,
      open_alert,
      err_status,
      err_text,
      modalOrder,
      fullScreen,
      orders,
      orderSearchMeta,
      module_name,
      date_start,
      date_end,
      points,
      kass,
      point_id,
      kassa,
      complete_data,
      complete_data_summary,
      order,
      summ_ofd,
      summ_chef,
      confirmDialog,
      unfisc_online_orders,
      acces,
      needsRefresh,
      need_upload,
      excelCompare,
      excelFileName,
      onlineAudit,
    } = this.state;

    const canAct = summ_ofd != null && summ_chef != null && !needsRefresh;

    const text_primary = need_upload
      ? "Выгрузить данные в 1C"
      : "Все равно выгрузить данные в 1С (возможны дубли!)";

    const point = points.find((p) => Number(p.id) === Number(point_id));
    const completenessRows = Array.isArray(complete_data) ? complete_data : [];
    const completenessVisibleRows = completenessRows.slice(0, 100);
    const completenessProblems =
      Number(complete_data_summary?.rows_incomplete ?? completenessRows.length) || 0;
    const hasCompletenessData =
      complete_data_summary?.rows_total != null || completenessRows.length > 0;

    return (
      <>
        <Backdrop
          style={{ zIndex: 2000 }}
          open={is_load}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog
          sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 600 } }}
          maxWidth="md"
          open={confirmDialog}
          onClose={() => this.setState({ confirmDialog: false, need_upload: false })}
        >
          <DialogTitle>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
              }}
            >
              Выберите действие
            </Typography>
            <IconButton
              onClick={() => this.setState({ confirmDialog: false, need_upload: false })}
              style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <List>
              {Number(acces?.upload_access) === 1 && (
                <ListItemButton
                  onClick={() => this.upload_data_1C("export")}
                  sx={{
                    mb: 3,
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "primary.lighter" },
                  }}
                >
                  <ListItemText
                    primary={text_primary}
                    slotProps={{
                      primary: { fontWeight: "medium", color: "primary.main" },
                    }}
                  />
                </ListItemButton>
              )}
              {Number(acces?.clear_access) === 1 && (
                <ListItemButton
                  onClick={() => this.upload_data_1C("clear")}
                  sx={{
                    mb: 3,
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "primary.lighter" },
                  }}
                >
                  <ListItemText
                    primary="Очистить данные по выбранным параметрам в 1С и после выгрузить данные в 1С"
                    slotProps={{
                      primary: { fontWeight: "medium", color: "primary.main" },
                    }}
                  />
                </ListItemButton>
              )}
              {Number(acces?.clear_export_access) === 1 && (
                <ListItemButton
                  onClick={() => this.upload_data_1C("clear_export")}
                  sx={{
                    mb: 3,
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "primary.lighter" },
                  }}
                >
                  <ListItemText
                    primary="Очистить ВСЕ данные по выбранной точке в 1С и после выгрузить данные в 1С"
                    slotProps={{
                      primary: { fontWeight: "medium", color: "primary.main" },
                    }}
                  />
                </ListItemButton>
              )}
              {Number(acces?.all_clear_access) === 1 && (
                <ListItemButton
                  onClick={() => this.upload_data_1C("all_clear")}
                  sx={{
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "primary.lighter" },
                  }}
                >
                  <ListItemText
                    primary="Очистить ВСЕ данные по выбранной точке в 1С"
                    slotProps={{
                      primary: { fontWeight: "medium", color: "primary.main" },
                    }}
                  />
                </ListItemButton>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => this.setState({ confirmDialog: false })}
            >
              Отмена
            </Button>
          </DialogActions>
        </Dialog>

        <MyAlert
          isOpen={open_alert}
          onClose={() => this.setState({ open_alert: false })}
          status={err_status}
          text={err_text}
        />

        <CheckCheck_Modal
          open={modalOrder}
          onClose={() =>
            this.setState({ modalOrder: false, orders: [], order: null, orderSearchMeta: null })
          }
          fullScreen={fullScreen}
          orders={orders}
          order={order}
          searchMeta={orderSearchMeta}
          canResolve={acces?.resolve_access}
          searchOrder={this.searchOrderById}
          saveOrder={this.saveOrder}
          resolveDuplicate={this.resolveDuplicateReceipt}
        />

        <Grid
          container
          spacing={3}
          className="container_first_child"
        >
          <Grid size={12}>
            <h1>{module_name}</h1>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNew
              label="Начало периода"
              value={date_start}
              func={(newDate) => this.changeDateRange("date_start", newDate)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyDatePickerNew
              label="Конец периода"
              value={date_end}
              func={(newDate) => this.changeDateRange("date_end", newDate)}
            />
          </Grid>

          {Number(acces?.check_access) === 1 && (
            <Grid size={12}>
              <BatchExcelCheck
                dateStart={date_start}
                dateEnd={date_end}
                points={points}
                access={acces}
                onLoading={(value) => this.setState({ is_load: value })}
                onAlert={(status, text) => this.openAlert(status, text)}
              />
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MySelect
              label="Точка"
              is_none={false}
              data={points}
              value={point_id}
              func={(event) => this.changeSort("point_id", event)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <MyAutocomplite
              label="Касса"
              multiple={true}
              data={kass}
              value={kassa}
              func={(event, value) => this.changeKass("kassa", event, value)}
            />
          </Grid>

          {Number(acces?.check_access) === 1 && (
            <Grid size={12}>
              <OnlineCheckAudit
                result={onlineAudit}
                onRun={this.auditOnline}
                disabled={!date_start || !date_end || !point_id}
                canRepair={Number(acces?.resolve_access) === 1}
              />
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                onClick={this.getOrders}
                variant="contained"
              >
                Показать
              </Button>

              {needsRefresh && (
                <Tooltip
                  title={
                    <span style={{ fontSize: "18px", lineHeight: 1.5 }}>
                      Нажмите «Показать», чтобы обновить данные.
                    </span>
                  }
                  placement="right"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: "18px",
                        maxWidth: 600,
                        p: "10px",
                        whiteSpace: "normal",
                        bgcolor: "#333",
                        color: "#fff",
                      },
                    },
                    arrow: {
                      sx: { color: "#333" },
                    },
                  }}
                >
                  <HelpIcon sx={{ color: "#c03" }} />
                </Tooltip>
              )}
            </Box>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            {Number(acces?.check_access) === 1 ? (
              <Button
                onClick={this.set_orders}
                sx={{ whiteSpace: "nowrap" }}
                color="success"
                variant={canAct ? "contained" : "outlined"}
                disabled={!canAct}
              >
                Расставить номера заказов / суммы
              </Button>
            ) : Number(acces?.upload_access) === 1 ? (
              <Button
                onClick={this.check_data_for_1C}
                variant={canAct ? "contained" : "outlined"}
                disabled={!canAct}
                color="info"
                sx={{ whiteSpace: "nowrap" }}
              >
                Выгрузить в 1С
              </Button>
            ) : null}
          </Grid>

          {Number(acces?.check_access) === 1 && Number(acces?.upload_access) === 1 && (
            <Grid
              container
              size={{
                xs: 12,
                sm: 3,
              }}
              sx={{
                justifyContent: { xs: "flex-start", sm: "flex-end" },
              }}
            >
              <Button
                onClick={this.check_data_for_1C}
                variant={canAct ? "contained" : "outlined"}
                disabled={!canAct}
                color="info"
                sx={{ whiteSpace: "nowrap" }}
              >
                Выгрузить в 1С
              </Button>
            </Grid>
          )}

          {summ_ofd && summ_chef && (
            <Grid size={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  disabled={!canAct}
                >
                  Загрузить Excel
                  <input
                    hidden
                    id="check-check-excel-upload"
                    name="check-check-excel-upload"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={this.uploadExcel}
                  />
                </Button>

                {excelFileName && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {excelFileName}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {excelCompare && (
            <Grid size={12}>
              <ExcelCompareSummary
                excelCompare={excelCompare}
                formatNumber={formatNumber}
              />
            </Grid>
          )}

          {hasCompletenessData && Number(acces?.check_access) === 1 && (
            <Grid
              size={12}
              sx={{
                mb: summ_ofd ? 0 : 5,
              }}
            >
              <Accordion
                style={{ width: "100%" }}
                expanded={this.state.isAccordionOpen}
                onChange={this.handleAccordionChange}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      Проверка на заполненность данных
                    </Typography>
                    {complete_data_summary && (
                      <Chip
                        label={`${formatNumber(complete_data_summary.completeness_percent ?? 100)}%`}
                        color={completenessProblems === 0 ? "success" : "warning"}
                        size="small"
                      />
                    )}
                    <Chip
                      label={`Проблемы: ${formatNumber(completenessProblems)}`}
                      color={completenessProblems === 0 ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <CompletenessSummary
                    summary={complete_data_summary}
                    rowsCount={completenessRows.length}
                  />
                  {completenessRows.length > completenessVisibleRows.length && (
                    <Alert
                      severity="info"
                      sx={{ mb: 2 }}
                    >
                      Показаны первые {formatNumber(completenessVisibleRows.length)} из{" "}
                      {formatNumber(completenessRows.length)} проблемных чеков. Список ограничен для
                      удобства просмотра.
                    </Alert>
                  )}
                  {completenessVisibleRows.map((it, index) => (
                    <CompletenessRow
                      key={it.receipt_id ?? it.id ?? index}
                      row={it}
                      index={index}
                      onFind={this.openModal}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          {unfisc_online_orders?.length > 0 && Number(acces?.check_access) === 1 && (
            <Grid size={12}>
              <CheckCheck_Accordion_online orders={unfisc_online_orders} />
            </Grid>
          )}

          {summ_ofd && summ_chef && (
            <Grid
              size={12}
              sx={{
                mb: 5,
              }}
            >
              <CheckCheck_Accordion
                summ_ofd={summ_ofd}
                summ_chef={summ_chef}
                save_comment={this.save_comment}
                acces_comment={acces?.comment_access}
                acces_resolve={acces?.resolve_access}
                point={point}
                getData={this.getData}
                openAlert={this.openAlert}
                refreshOrders={this.getOrders}
                excelCompare={excelCompare}
              />
            </Grid>
          )}
        </Grid>
      </>
    );
  }
}

export default function CheckCheck() {
  return <CheckCheck_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return {
    props: {},
  };
}
