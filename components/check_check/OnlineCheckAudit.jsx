import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";

const statusConfig = {
  ok: { color: "success", border: "success.main", background: "success.lighter" },
  warning: { color: "warning", border: "warning.main", background: "warning.lighter" },
  error: { color: "error", border: "error.main", background: "error.lighter" },
};

const issueLabels = {
  payment_missing: "Нет платёжной записи",
  payment_waiting_capture: "Платёж ожидает списания",
  payment_canceled: "Платёж отменён",
  payment_failed: "Платёж не подтверждён",
  receipt_missing: "Нет чека ОФД",
  duplicate_receipt: "Несколько чеков продажи",
  amount_mismatch: "Расхождение суммы",
  receipt_unlinked: "Чек не связан с заказом",
  ofd_coverage_incomplete: "Данные ОФД загружены не полностью",
  late_fiscalization: "Поздняя фискализация",
  atol_status_inconsistent: "Некорректный служебный статус АТОЛ",
  atol_duplicate_request: "Повторная отправка в АТОЛ",
  receipt_auto_linked: "Связь восстановлена автоматически",
};

const formatAmount = (value) =>
  value == null ? "—" : `${new Intl.NumberFormat("ru-RU").format(Number(value) || 0)} ₽`;

const detailsText = (issue) => {
  const details = issue?.details ?? {};
  const parts = [];

  if (details.receipt_date) parts.push(`чек от ${details.receipt_date}`);
  if (details.fpd) parts.push(`ФПД ${details.fpd}`);
  if (details.smena) parts.push(`смена ${details.smena}`);
  if (details.number_check) parts.push(`чек № ${details.number_check}`);
  if (details.receipt_amount != null) parts.push(`в чеке ${formatAmount(details.receipt_amount)}`);
  if (details.payment_error) parts.push(details.payment_error);
  if (details.checked_through) parts.push(`проверено по ${details.checked_through}`);

  return parts.join(" · ");
};

export default function OnlineCheckAudit({ result, onRun, disabled = false, canRepair = false }) {
  const config = statusConfig[result?.status] ?? statusConfig.warning;
  const groups = (result?.issues ?? []).reduce((acc, issue) => {
    const key = issue.code || "other";
    acc[key] = acc[key] || [];
    acc[key].push(issue);
    return acc;
  }, {});
  const summary = result?.summary ?? {};

  return (
    <Paper
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Автопроверка онлайн-кассы
          </Typography>
          <Typography color="text.secondary">
            Проверит оплату, АТОЛ и ОФД. Однозначные несвязанные чеки будут сопоставлены
            автоматически.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FactCheckOutlinedIcon />}
          onClick={onRun}
          disabled={disabled}
          sx={{ whiteSpace: "nowrap" }}
        >
          Проверить онлайн-кассу
        </Button>
      </Box>

      {result && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: config.border,
              bgcolor: config.background,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Chip
                color={config.color}
                label={result.title}
              />
              <Typography sx={{ fontWeight: 700 }}>
                {summary.orders_count ?? 0} заказов на {formatAmount(summary.orders_amount)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
              <Chip label={`Оплачено: ${summary.paid_count ?? 0}`} />
              <Chip label={`Чеков: ${summary.receipts_count ?? 0}`} />
              <Chip
                label={`Ошибок: ${summary.errors_count ?? 0}`}
                color={summary.errors_count ? "error" : "default"}
              />
              <Chip
                label={`Нюансов: ${summary.warnings_count ?? 0}`}
                color={summary.warnings_count ? "warning" : "default"}
              />
              <Chip label={`Поздних чеков: ${summary.late_fiscalization_count ?? 0}`} />
              {summary.auto_linked_count > 0 && (
                <Chip
                  color="success"
                  label={`Связано автоматически: ${summary.auto_linked_count}`}
                />
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5 }}
            >
              ОФД проверен по {result.coverage?.checked_through || "—"}.
              {!canRepair && summary.repairable_count > 0
                ? ` Найдено безопасных сопоставлений: ${summary.repairable_count}, но нет права на автоматическое исправление.`
                : ""}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            {Object.entries(groups).map(([code, issues]) => {
              const isError = issues.some((issue) => issue.severity === "error");

              return (
                <Accordion
                  key={code}
                  disableGutters
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {issueLabels[code] || issues[0]?.title || code}
                      </Typography>
                      <Chip
                        size="small"
                        color={isError ? "error" : "warning"}
                        label={issues.length}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer sx={{ maxHeight: 360 }}>
                      <Table
                        size="small"
                        stickyHeader
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>Заказ</TableCell>
                            <TableCell>Дата заказа</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Что произошло</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {issues.map((issue, index) => (
                            <TableRow key={`${code}-${issue.order_id ?? "receipt"}-${index}`}>
                              <TableCell>{issue.order_id || "—"}</TableCell>
                              <TableCell>{issue.order_date || "—"}</TableCell>
                              <TableCell>{formatAmount(issue.amount)}</TableCell>
                              <TableCell>
                                <Typography variant="body2">{issue.title}</Typography>
                                {detailsText(issue) && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {detailsText(issue)}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
