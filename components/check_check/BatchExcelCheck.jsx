import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { api_laravel, credentialsConfig, getAuthHeaders } from "@/src/api_new";

const apiUrl = (method) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/";
  return `${baseUrl.replace(/\/$/, "")}/check_check/${method}`;
};

const money = (value) =>
  `${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(value) || 0,
  )} ₽`;

const statusMeta = {
  ok: { label: "Сошлось", color: "success" },
  mismatch: { label: "Есть расхождения", color: "error" },
  warning: { label: "Нужна проверка", color: "warning" },
};

const issueLabels = {
  none: "Расхождений нет",
  chef: "Проблема в ШЕФ",
  ofd: "Проблема ОФД / фискализации",
  bank: "Проблема банковской выгрузки",
  ambiguous: "Неоднозначное расхождение",
  mapping_required: "Нужно подтвердить терминалы",
  incomplete_file: "Файл покрывает период не полностью",
  input_warning: "Есть нераспознанные данные выгрузки",
};

const diagnosticRecommendations = {
  chef: {
    error: "Данные ШЕФ отличаются от банковской выгрузки и ОФД.",
    solution: "Проверьте заказы и способы оплаты в ШЕФ за этот период, затем повторите проверку.",
  },
  ofd: {
    error: "Данные ОФД отличаются от банковской выгрузки и ШЕФ.",
    solution: "Проверьте фискализацию и чеки ОФД за этот период, затем повторите проверку.",
  },
  bank: {
    error: "ШЕФ и ОФД совпадают между собой, но отличаются от банковской выгрузки.",
    solution:
      "Проверьте состав и период банковской выгрузки, затем загрузите корректный файл повторно.",
  },
  ambiguous: {
    error: "Несколько источников расходятся, поэтому однозначно определить источник ошибки нельзя.",
    solution:
      "Сопоставьте операции в Excel, ШЕФ и ОФД вручную, после уточнения данных повторите проверку.",
  },
  mapping_required: {
    error: "Для банковского терминала не подтверждено соответствие кассе.",
    solution: "Проверьте и подтвердите соответствие терминала кассе, затем повторите проверку.",
  },
  incomplete_file: {
    error: "Загруженный файл не полностью покрывает выбранный период.",
    solution:
      "Проверьте даты выгрузки и загрузите полный файл за выбранный период, затем повторите проверку.",
  },
  input_warning: {
    error: "В банковской выгрузке есть строки или типы операций, которые не удалось распознать.",
    solution: "Проверьте нераспознанные строки и формат исходного файла, затем повторите проверку.",
  },
};

const signedMoney = (value) => {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}${money(number)}`;
};

function buildDiagnostic(row) {
  const differences = [];

  if (row?.pairs?.excel_chef === "mismatch") {
    differences.push(`Excel − ШЕФ по безналу: ${signedMoney(row.diff_excel_chef_bank)}`);
  }
  if (row?.pairs?.excel_ofd === "mismatch") {
    differences.push(`Excel − ОФД по безналу: ${signedMoney(row.diff_excel_ofd_bank)}`);
  }
  if (row?.pairs?.chef_ofd === "mismatch") {
    differences.push(`ШЕФ − ОФД по безналу: ${signedMoney(row.diff_chef_ofd_bank)}`);
  }
  if (Number(row?.diff_chef_ofd_cash || 0) !== 0) {
    differences.push(`ШЕФ − ОФД по наличным: ${signedMoney(row.diff_chef_ofd_cash)}`);
  }

  const recommendation =
    diagnosticRecommendations[row?.issue] || diagnosticRecommendations.ambiguous;
  return {
    output:
      differences.length > 0
        ? differences.join("; ")
        : issueLabels[row?.issue] || "Требуется ручная проверка данных.",
    ...recommendation,
  };
}

function OrderIssuesPanel({ issues, canComplete, onResolve }) {
  if (!Array.isArray(issues) || issues.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, mt: 1.5 }}
    >
      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Конкретные заказы</Typography>
      {issues.map((issue, index) => {
        const status = issue.status_name
          ? `${issue.status_name}${issue.status_order == null ? "" : ` (${issue.status_order})`}`
          : (issue.status_order ?? "—");
        const orderKassas =
          Array.isArray(issue.order_kassas) && issue.order_kassas.length > 0
            ? issue.order_kassas.join(", ")
            : "—";
        const dateTime = [issue.date, issue.time].filter(Boolean).join(" ") || "—";

        return (
          <Box
            key={`${issue.receipt_id || "receipt"}-${issue.order_id || index}`}
            sx={{ py: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>Заказ №{issue.order_id || "—"}</Typography>
              <Typography sx={{ fontWeight: 600 }}>Сумма: {money(issue.amount)}</Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(4, minmax(0, 1fr))" },
                gap: 1,
                mt: 0.75,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Дата/время: {dateTime}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Статус: {status}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Касса ОФД: {issue.ofd_kassa || "—"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Кассы order_info: {orderKassas}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
                mt: 1,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Что не так
                </Typography>
                <Typography variant="body2">{issue.reason || "—"}</Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Что проверить
                </Typography>
                <Typography variant="body2">{issue.solution || "—"}</Typography>
              </Box>
            </Box>
            {canComplete && issue.completion_action && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                sx={{ mt: 1 }}
                onClick={() => onResolve(issue, issue.completion_action)}
              >
                Перевести в статус 6
              </Button>
            )}
            {canComplete && issue.correction_return_action && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                sx={{ mt: 1 }}
                onClick={() => onResolve(issue, issue.correction_return_action)}
              >
                Оформить коррекцию возврата
              </Button>
            )}
            {index < issues.length - 1 && <Divider sx={{ mt: 1.5 }} />}
          </Box>
        );
      })}
    </Paper>
  );
}

function DiagnosticPanel({ row, canComplete = false, onResolve }) {
  if (!row || row.status === "ok") return null;

  const diagnostic = buildDiagnostic(row);
  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
          p: 1.5,
          mt: 1.5,
          bgcolor: "action.hover",
        }}
      >
        {[
          ["Вывод", diagnostic.output],
          ["Возможная ошибка", diagnostic.error],
          ["Возможное решение", diagnostic.solution],
        ].map(([title, text]) => (
          <Box key={title}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography variant="body2">{text}</Typography>
          </Box>
        ))}
      </Paper>
      <OrderIssuesPanel
        issues={row.order_issues}
        canComplete={canComplete}
        onResolve={onResolve}
      />
    </>
  );
}

function filterIssueHierarchy(points) {
  return (points || [])
    .filter((point) => point.status !== "ok")
    .map((point) => ({
      ...point,
      days: (point.days || [])
        .filter((day) => day.status !== "ok")
        .map((day) => ({
          ...day,
          kassas: (day.kassas || [])
            .filter((kassa) => kassa.status !== "ok")
            .map((kassa) => ({
              ...kassa,
              smenas: (kassa.smenas || []).filter((smena) => smena.status !== "ok"),
            })),
        })),
    }));
}

function StatusChip({ status, issue }) {
  const meta = statusMeta[status] || statusMeta.warning;
  const label = issue === "mapping_required" ? "Подтвердите терминалы" : meta.label;
  return (
    <Chip
      size="small"
      label={label}
      color={meta.color}
    />
  );
}

function ComparisonTable({ row }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Источник</TableCell>
            <TableCell align="right">Безнал</TableCell>
            <TableCell align="right">Операций</TableCell>
            <TableCell align="right">Наличные</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Excel</TableCell>
            <TableCell align="right">
              {row.excel_available === false ? "—" : money(row.excel_bank)}
            </TableCell>
            <TableCell align="right">
              {row.excel_available === false ? "—" : row.excel_bank_count}
            </TableCell>
            <TableCell align="right">—</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ШЕФ</TableCell>
            <TableCell align="right">{money(row.chef_bank)}</TableCell>
            <TableCell align="right">{row.chef_bank_count}</TableCell>
            <TableCell align="right">{money(row.chef_cash)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ОФД</TableCell>
            <TableCell align="right">{money(row.ofd_bank)}</TableCell>
            <TableCell align="right">{row.ofd_bank_count}</TableCell>
            <TableCell align="right">{money(row.ofd_cash)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PairChips({ pairs }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
      {[
        ["Excel ↔ ШЕФ", pairs?.excel_chef],
        ["Excel ↔ ОФД", pairs?.excel_ofd],
        ["ШЕФ ↔ ОФД", pairs?.chef_ofd],
      ].map(([label, status]) => (
        <Chip
          key={label}
          size="small"
          label={`${label}: ${status === "ok" ? "совпало" : status === "unavailable" ? "нет детализации" : "расхождение"}`}
          color={status === "ok" ? "success" : status === "unavailable" ? "default" : "error"}
          variant={status === "unavailable" ? "outlined" : "filled"}
        />
      ))}
    </Box>
  );
}

function KassaDetails({ row }) {
  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography>Касса {row.kassa}</Typography>
          <StatusChip status={row.status} />
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {issueLabels[row.issue] || row.issue}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <ComparisonTable row={row} />
        <PairChips pairs={row.pairs} />
        <DiagnosticPanel row={row} />
        {(row.smenas || []).map((smena) => (
          <Accordion
            key={smena.smena}
            disableGutters
            sx={{ mt: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>Смена {smena.smena}</Typography>
                <StatusChip status={smena.status} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <ComparisonTable row={smena} />
              <PairChips pairs={smena.pairs} />
              <DiagnosticPanel row={smena} />
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

function PointDetails({ point, canConfirm, onConfirm, canComplete, onResolve }) {
  const warnings = point.warnings || {};
  const needsMapping = Number(point.mapping?.unresolved_count || 0) > 0;
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: "100%" }}
        >
          <Typography sx={{ fontWeight: 600 }}>{point.point_name}</Typography>
          <StatusChip
            status={point.status}
            issue={point.issue}
          />
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {issueLabels[point.issue] || point.issue}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {needsMapping && (
          <Alert
            severity="warning"
            action={
              canConfirm ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => onConfirm(point.point_id)}
                >
                  Подтвердить и перепроверить
                </Button>
              ) : null
            }
            sx={{ mb: 2 }}
          >
            Итоги кафе и дней уже проверены. Чтобы проверить кассы и смены, подтвердите, к какой
            кассе относится каждый банковский терминал.
          </Alert>
        )}
        <ComparisonTable row={point.totals} />
        <PairChips pairs={point.totals?.pairs} />
        <DiagnosticPanel row={{ ...point.totals, status: point.status, issue: point.issue }} />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
          <Chip
            label={`Незаполненные чеки: ${warnings.incomplete_checks_count || 0}`}
            variant="outlined"
          />
          <Chip
            label={`Невыгруженные смены: ${warnings.unloaded_shifts_count || 0}`}
            variant="outlined"
          />
          <Chip
            label={`Нефискализированные онлайн-заказы: ${warnings.unfiscalized_online_orders_count || 0}`}
            variant="outlined"
          />
          <Chip
            label={`Группы 1С: ${warnings.data_1c_groups_count || 0}`}
            variant="outlined"
          />
        </Box>

        {(point.days || []).map((day) => (
          <Accordion
            key={day.date}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography>{dayjs(day.date).format("DD.MM.YYYY")}</Typography>
                <StatusChip
                  status={day.status}
                  issue={day.issue}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {issueLabels[day.issue] || day.issue}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <ComparisonTable row={day} />
              <PairChips pairs={day.pairs} />
              <DiagnosticPanel
                row={day}
                canComplete={canComplete}
                onResolve={onResolve}
              />
              {needsMapping ? (
                <Alert
                  severity="info"
                  sx={{ mt: 2 }}
                >
                  Кассы и смены появятся после подтверждения терминалов.
                </Alert>
              ) : (
                (day.kassas || []).map((kassa) => (
                  <KassaDetails
                    key={kassa.kassa}
                    row={kassa}
                  />
                ))
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

export default function BatchExcelCheck({
  dateStart,
  dateEnd,
  points,
  access,
  onLoading,
  onAlert,
}) {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [mappingDialog, setMappingDialog] = useState(false);
  const [mappingRows, setMappingRows] = useState([]);
  const [resolutionDialog, setResolutionDialog] = useState(null);
  const [resolutionSubmitting, setResolutionSubmitting] = useState(false);
  const inputRef = useRef(null);

  const formattedStart = dateStart ? dayjs(dateStart).format("YYYY-MM-DD") : "";
  const formattedEnd = dateEnd ? dayjs(dateEnd).format("YYYY-MM-DD") : "";

  useEffect(() => {
    setResult(null);
  }, [formattedStart, formattedEnd]);

  const selectedNames = useMemo(() => files.map((file) => file.name), [files]);
  const visiblePoints = useMemo(
    () => (showOnlyIssues ? filterIssueHierarchy(result?.points) : result?.points || []),
    [result, showOnlyIssues],
  );

  const upload = async () => {
    if (!formattedStart || !formattedEnd) {
      onAlert(false, "Укажите начало и конец периода");
      return;
    }
    if (files.length === 0) {
      onAlert(false, "Выберите хотя бы один Excel файл");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files[]", file));
    formData.append("date_start", formattedStart);
    formData.append("date_end", formattedEnd);
    formData.append("data", JSON.stringify({ date_start: formattedStart, date_end: formattedEnd }));
    formData.append("method", "upload_excel_batch");
    formData.append("module", "check_check");
    formData.append("version", 2);

    onLoading(true);
    try {
      const response = await axios.post(apiUrl("upload_excel_batch"), formData, {
        ...credentialsConfig,
        headers: getAuthHeaders({ "Content-Type": "multipart/form-data" }),
      });
      const data = response.data?.data || response.data;
      if (!data?.st) {
        setResult(null);
        onAlert(false, data?.text || "Не удалось проверить Excel файлы");
        return;
      }
      setResult(data);
      onAlert(true, `Проверено кафе: ${data.batch?.points_total || 0}`);
    } catch (error) {
      setResult(null);
      onAlert(false, "Не удалось проверить Excel файлы");
    } finally {
      onLoading(false);
    }
  };

  const confirmResolution = async () => {
    const action = resolutionDialog?.action;
    if (!action || resolutionSubmitting) return;

    setResolutionSubmitting(true);
    try {
      const response = await api_laravel("check_check", "resolve_mismatch", action);
      const data = response?.data || response;
      if (!data?.st) {
        onAlert(false, data?.text || "Не удалось применить решение");
        return;
      }

      setResolutionDialog(null);
      onAlert(
        true,
        data.text ||
          (action.action === "correction_return"
            ? "Коррекция возврата оформлена, заказ помечен удалённым"
            : "Заказ переведён в статус 6"),
      );
      await upload();
    } catch (error) {
      const errorData = error.response?.data?.data || error.response?.data;
      onAlert(false, errorData?.text || "Не удалось применить решение");
    } finally {
      setResolutionSubmitting(false);
    }
  };

  const openMappings = (pointId = null) => {
    const suggestions = (result?.mappings?.suggestions || []).filter(
      (row) => pointId === null || Number(row.point_id) === Number(pointId),
    );
    setMappingRows(
      suggestions.map((row) => ({
        terminal_number: row.terminal_number,
        point_id: Number(row.point_id) || "",
        kassa: row.suggested_kassa || "",
        suggestion_reason: row.suggestion_reason || "Кассу нужно выбрать вручную",
        valid_from: row.valid_from || formattedStart,
        valid_to: row.valid_to || formattedEnd,
      })),
    );
    setMappingDialog(true);
  };

  const updateMapping = (index, field, value) => {
    setMappingRows((rows) =>
      rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  };

  const confirmMappings = async () => {
    const mappings = mappingRows.filter((row) => row.point_id && row.kassa && row.valid_from);
    if (mappings.length === 0) {
      onAlert(false, "Выберите кафе и кассу хотя бы для одного терминала");
      return;
    }

    onLoading(true);
    try {
      const response = await api_laravel("check_check", "confirm_terminal_mappings", { mappings });
      const data = response?.data || response;
      if (!data?.st) {
        onAlert(false, data?.text || "Не удалось подтвердить терминалы");
        return;
      }
      setMappingDialog(false);
      onAlert(true, data.text || "Терминалы подтверждены");
      await upload();
    } catch (error) {
      onAlert(false, "Не удалось подтвердить терминалы");
    } finally {
      onLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, width: "100%" }}>
      <Typography
        variant="h6"
        sx={{ mb: 1 }}
      >
        Пакетная проверка Excel
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        Автоматически данные не исправляются. Вручную после подтверждения можно изменить статус
        заказа или оформить подтверждённую коррекцию возврата.
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
        >
          Выбрать файлы
          <input
            ref={inputRef}
            hidden
            multiple
            type="file"
            accept=".xls,.xlsx"
            onChange={(event) => {
              setFiles(Array.from(event.target.files || []));
              setResult(null);
            }}
          />
        </Button>
        <Button
          variant="contained"
          onClick={upload}
          disabled={files.length === 0}
        >
          Проверить все кафе
        </Button>
        {files.length > 0 && (
          <Button
            color="inherit"
            onClick={() => {
              setFiles([]);
              setResult(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Очистить
          </Button>
        )}
      </Box>

      {selectedNames.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
          {selectedNames.map((name, index) => (
            <Chip
              key={`${name}-${index}`}
              label={name}
              size="small"
            />
          ))}
        </Box>
      )}

      {result && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <StatusChip
              status={result.overall?.status}
              issue={result.overall?.issue}
            />
            <Chip
              label={`Кафе: ${result.batch?.points_total || 0}`}
              variant="outlined"
            />
            <Chip
              label={`Сошлось: ${result.batch?.points_ok || 0}`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`Расхождения: ${result.batch?.points_mismatch || 0}`}
              color="error"
              variant="outlined"
            />
            <Chip
              label={`Предупреждения: ${result.batch?.points_warning || 0}`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`Строк: ${result.batch?.rows_used || 0}`}
              variant="outlined"
            />
            <Chip
              label={`Дубли: ${result.batch?.duplicates || 0}`}
              variant="outlined"
            />
          </Box>

          <FormControlLabel
            sx={{ mb: 2 }}
            control={
              <Checkbox
                checked={showOnlyIssues}
                onChange={(event) => setShowOnlyIssues(event.target.checked)}
              />
            }
            label="Показывать только расхождения"
          />

          <Paper
            variant="outlined"
            sx={{ p: 1.5, mb: 2 }}
          >
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Все распознанные кафе — {issueLabels[result.overall?.issue] || result.overall?.issue}
            </Typography>
            <ComparisonTable row={result.overall || {}} />
            <PairChips pairs={result.overall?.pairs} />
            <DiagnosticPanel row={result.overall} />
          </Paper>

          {!result.mappings?.storage_ready && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
            >
              Справочник терминалов ещё не создан. Общая и дневная сверка доступны, подтверждение
              касс — после миграции.
            </Alert>
          )}

          {(result.mappings?.suggestions || []).length > 0 && (
            <Alert
              severity="info"
              action={
                Number(access?.resolve_access) === 1 ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => openMappings()}
                  >
                    Подтвердить и перепроверить
                  </Button>
                ) : null
              }
              sx={{ mb: 2 }}
            >
              Новых или неоднозначных терминалов: {result.mappings.suggestions.length}. До
              подтверждения детализация по кассам и сменам недоступна.
            </Alert>
          )}

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Покрытие файлов</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Файл</TableCell>
                      <TableCell>Фактический период</TableCell>
                      <TableCell align="right">Строк</TableCell>
                      <TableCell align="right">Не распознано</TableCell>
                      <TableCell>Покрытие</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(result.batch?.files || []).map((file, index) => (
                      <TableRow key={`${file.original_name}-${index}`}>
                        <TableCell>{file.original_name}</TableCell>
                        <TableCell>
                          {file.date_min && file.date_max
                            ? `${file.date_min} — ${file.date_max}`
                            : "Нет данных"}
                        </TableCell>
                        <TableCell align="right">
                          {file.rows_used}/{file.rows_total}
                        </TableCell>
                        <TableCell align="right">
                          {(file.unmatched_rows_count || 0) +
                            (file.unknown_operation_types_count || 0)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={file.coverage_status === "complete" ? "Полное" : "Неполное"}
                            color={file.coverage_status === "complete" ? "success" : "warning"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {visiblePoints.map((point) => (
            <PointDetails
              key={point.point_id}
              point={point}
              canConfirm={Number(access?.resolve_access) === 1}
              onConfirm={openMappings}
              canComplete={Number(access?.resolve_access) === 1}
              onResolve={(issue, action) => setResolutionDialog({ issue, action })}
            />
          ))}

          {showOnlyIssues && visiblePoints.length === 0 && (
            <Alert severity="info">По кафе расхождений и предупреждений нет.</Alert>
          )}

          {((result.warnings?.unmatched_rows_count || 0) > 0 ||
            Object.keys(result.warnings?.unknown_operation_types || {}).length > 0) && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Нераспознанные данные: {result.warnings.unmatched_rows_count || 0} строк
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(result.warnings?.unknown_operation_types || {}).map(
                  ([type, count]) => (
                    <Typography
                      key={type}
                      variant="body2"
                      sx={{ mb: 1 }}
                    >
                      Неизвестный тип операции «{type}»: {count}
                    </Typography>
                  ),
                )}
                {(result.warnings.unmatched_rows || []).map((row) => (
                  <Typography
                    key={`${row.file}-${row.row}`}
                    variant="body2"
                    sx={{ mb: 1 }}
                  >
                    {row.file}, строка {row.row}: {row.address || "адрес отсутствует"}, терминал{" "}
                    {row.terminal_number || "не указан"}
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}

      <Dialog
        open={mappingDialog}
        onClose={() => setMappingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Подтверждение терминалов</DialogTitle>
        <DialogContent dividers>
          <Alert
            severity="info"
            sx={{ mb: 2 }}
          >
            Кафе определено по адресу из Excel. Проверьте предложенную кассу или выберите её
            вручную. После подтверждения система автоматически повторит проверку и покажет
            детализацию по кассам и сменам.
          </Alert>
          {mappingRows.map((row, index) => (
            <Box
              key={`${row.terminal_number}-${index}`}
              sx={{ py: 1.5 }}
            >
              <Typography sx={{ mb: 1, fontWeight: 600 }}>
                Терминал {row.terminal_number}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr 1fr" },
                  gap: 1,
                }}
              >
                <TextField
                  select
                  size="small"
                  label="Кафе"
                  value={row.point_id}
                  onChange={(event) => updateMapping(index, "point_id", Number(event.target.value))}
                >
                  {(points || []).map((point) => (
                    <MenuItem
                      key={point.id}
                      value={Number(point.id)}
                    >
                      {point.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Касса"
                  value={row.kassa}
                  onChange={(event) => updateMapping(index, "kassa", Number(event.target.value))}
                >
                  <MenuItem value={1}>Касса 1</MenuItem>
                  <MenuItem value={3}>Касса 3</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  type="date"
                  label="Действует от"
                  value={row.valid_from}
                  onChange={(event) => updateMapping(index, "valid_from", event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Действует до"
                  value={row.valid_to}
                  onChange={(event) => updateMapping(index, "valid_to", event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {row.suggestion_reason}
              </Typography>
              {index < mappingRows.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMappingDialog(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={confirmMappings}
          >
            Подтвердить и перепроверить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(resolutionDialog)}
        onClose={() => {
          if (!resolutionSubmitting) setResolutionDialog(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {resolutionDialog?.action?.action === "correction_return"
            ? "Оформить коррекцию возврата?"
            : "Перевести заказ в статус 6?"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 1, mb: 2 }}>
            <Typography>Заказ №{resolutionDialog?.issue?.order_id || "—"}</Typography>
            {resolutionDialog?.action?.action === "correction_return" ? (
              <Typography variant="body2">
                Чек ОФД: {resolutionDialog?.issue?.receipt_id || "—"}
              </Typography>
            ) : (
              <Typography variant="body2">
                Текущий статус: {resolutionDialog?.issue?.status_name || "—"}
                {resolutionDialog?.issue?.status_order == null
                  ? ""
                  : ` (${resolutionDialog.issue.status_order})`}
              </Typography>
            )}
            <Typography variant="body2">Сумма: {money(resolutionDialog?.issue?.amount)}</Typography>
            <Typography variant="body2">
              Ожидаемый эффект: {resolutionDialog?.action?.expected_effect || "—"}
            </Typography>
          </Box>
          <Alert severity="warning">
            {resolutionDialog?.action?.action === "correction_return"
              ? "Будет создан чек коррекции возврата, а связанный заказ будет помечен удалённым (is_delete = 1). status_order заказа не изменится."
              : "Будет изменён только status_order: 7 → 6. Остальные данные заказа останутся без изменений."}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={resolutionSubmitting}
            onClick={() => setResolutionDialog(null)}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={resolutionSubmitting}
            onClick={confirmResolution}
          >
            {resolutionSubmitting
              ? "Сохранение…"
              : resolutionDialog?.action?.action === "correction_return"
                ? "Оформить коррекцию возврата"
                : "Перевести в статус 6"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
