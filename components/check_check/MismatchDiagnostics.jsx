import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import HistoryLog from "@/ui/history/HistoryLog";

const directionLabels = {
  ofd_over: "В ОФД больше",
  chef_over: "В системе больше",
};

const actionColors = {
  complete_order: "success",
  link_receipt: "primary",
  correction_return: "error",
  correction_income: "warning",
  manual_review: "info",
};

const formatAmount = (value, formatNumber) => `${formatNumber(Number(value) || 0)} ₽`;

const getSelectionHint = (action, selectedReceiptId, selectedOrderId) => {
  if (action.requires_receipt && !selectedReceiptId && action.requires_order && !selectedOrderId) {
    return "Выберите чек ОФД и заказ";
  }
  if (action.requires_receipt && !selectedReceiptId) return "Выберите чек ОФД";
  if (action.requires_order && !selectedOrderId) return "Выберите заказ";
  return "";
};

export default function MismatchDiagnostics({
  diagnostics,
  selectedReceiptId,
  selectedOrderId,
  onSelectReceipt,
  onSelectOrder,
  onAction,
  canResolve,
  formatNumber,
}) {
  if (!diagnostics) return null;

  const totals = diagnostics.totals || {};
  const receipts = diagnostics.ofd_receipts || [];
  const orders = diagnostics.chef_orders || [];
  const actions = diagnostics.actions || [];
  const history = diagnostics.history || [];

  return (
    <Stack spacing={2}>
      <Paper
        variant="outlined"
        sx={{ p: 2 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ alignItems: { xs: "flex-start", sm: "center" }, mb: 1 }}
        >
          <Typography sx={{ fontWeight: "bold" }}>Результат диагностики</Typography>
          <Chip
            size="small"
            color="error"
            label={
              directionLabels[diagnostics.direction] || diagnostics.direction_text || "Расхождение"
            }
          />
        </Stack>

        {diagnostics.reason_text && (
          <Typography sx={{ mb: 1 }}>{diagnostics.reason_text}</Typography>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
        >
          <Typography>
            ОФД: <b>{formatAmount(totals.ofd_sum, formatNumber)}</b>
            {totals.ofd_count != null && ` (${formatNumber(totals.ofd_count)} чек.)`}
          </Typography>
          <Typography>
            ШЕФ: <b>{formatAmount(totals.chef_sum, formatNumber)}</b>
            {totals.chef_count != null && ` (${formatNumber(totals.chef_count)} заказ.)`}
          </Typography>
          <Typography>
            Разница: <b>{formatAmount(totals.difference, formatNumber)}</b>
          </Typography>
        </Stack>
      </Paper>

      {!canResolve && (
        <Alert severity="info">
          Диагностика доступна для просмотра. Для применения решения требуется отдельное право.
        </Alert>
      )}

      <Box>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1, fontWeight: "bold" }}
        >
          Чеки ОФД
        </Typography>
        {receipts.length === 0 ? (
          <Typography color="text.secondary">Подходящие чеки ОФД не найдены</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Чек</TableCell>
                  <TableCell>Заказ</TableCell>
                  <TableCell>Дата / время</TableCell>
                  <TableCell>Касса</TableCell>
                  <TableCell>Смена</TableCell>
                  <TableCell>Оплата</TableCell>
                  <TableCell>Операция</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow
                    key={receipt.id}
                    hover
                    selected={String(selectedReceiptId) === String(receipt.id)}
                    onClick={() => onSelectReceipt(receipt.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Radio
                        checked={String(selectedReceiptId) === String(receipt.id)}
                        onChange={() => onSelectReceipt(receipt.id)}
                        value={receipt.id}
                      />
                    </TableCell>
                    <TableCell>{receipt.id}</TableCell>
                    <TableCell>{receipt.order_id || "—"}</TableCell>
                    <TableCell>{receipt.date_time || "—"}</TableCell>
                    <TableCell>{receipt.kassa || "—"}</TableCell>
                    <TableCell>{receipt.smena || "—"}</TableCell>
                    <TableCell>{receipt.pay_type_text || "—"}</TableCell>
                    <TableCell>{receipt.operation_text || "—"}</TableCell>
                    <TableCell align="right">
                      {formatAmount(receipt.amount, formatNumber)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1, fontWeight: "bold" }}
        >
          Заказы системы
        </Typography>
        {orders.length === 0 ? (
          <Typography color="text.secondary">Подходящие заказы не найдены</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Заказ</TableCell>
                  <TableCell>Дата / время</TableCell>
                  <TableCell>Касса</TableCell>
                  <TableCell>Смена</TableCell>
                  <TableCell>Оплата</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    selected={String(selectedOrderId) === String(order.id)}
                    onClick={() => onSelectOrder(order.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Radio
                        checked={String(selectedOrderId) === String(order.id)}
                        onChange={() => onSelectOrder(order.id)}
                        value={order.id}
                      />
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.date_time || "—"}</TableCell>
                    <TableCell>{order.kassa || "—"}</TableCell>
                    <TableCell>
                      <Typography variant="body2">ШЕФ: {order.smena || "—"}</Typography>
                      {order.ofd_smena && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          ОФД: {order.ofd_smena}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{order.pay_type_text || "—"}</TableCell>
                    <TableCell>
                      {order.status_text || order.status_order || "—"}
                      {Number(order.status_order) === 7 && (
                        <Chip
                          label="Ожидает оплаты"
                          color="warning"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                      {order.match_reason && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {order.match_reason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{formatAmount(order.amount, formatNumber)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1, fontWeight: "bold" }}
        >
          Варианты решения
        </Typography>
        {actions.length === 0 ? (
          <Alert severity="warning">Автоматически применимых вариантов не найдено</Alert>
        ) : (
          <Stack spacing={1}>
            {actions.map((action) => {
              const selectionHint = getSelectionHint(action, selectedReceiptId, selectedOrderId);
              const disabled = !canResolve || action.available === false || Boolean(selectionHint);

              return (
                <Paper
                  key={action.type}
                  variant="outlined"
                  sx={{ p: 1.5 }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: "bold" }}>{action.label}</Typography>
                      {action.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {action.description}
                        </Typography>
                      )}
                      {(action.blocked_reason || selectionHint) && (
                        <Typography
                          variant="caption"
                          color="error"
                        >
                          {action.blocked_reason || selectionHint}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      color={actionColors[action.type] || "primary"}
                      disabled={disabled}
                      onClick={() => onAction(action)}
                    >
                      Выбрать
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      <HistoryLog
        history={history}
        title="История разбора"
      />
    </Stack>
  );
}
