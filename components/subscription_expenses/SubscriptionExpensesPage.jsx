import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import { api_laravel_local as api_laravel } from "@/src/api_new";
import { MyCheckBox, MyDatePickerNew, MySelect, MyTextInput } from "@/ui/Forms";
import MyAlert from "@/ui/MyAlert";

const CURRENCIES = ["RUB", "EUR", "USD"];
const CURRENCY_OPTIONS = CURRENCIES.map((currency) => ({ id: currency, name: currency }));
const PERIODS = [
  { id: "month", name: "месяц" },
  { id: "year", name: "год" },
  { id: "day", name: "день" },
];
const OPERATION_LABELS = {
  funding: "Пополнение",
  exchange: "Обмен валюты",
  payment: "Оплата подписки",
  purchase: "Разовая покупка",
};
const OPERATION_OPTIONS = Object.entries(OPERATION_LABELS).map(([id, name]) => ({ id, name }));

const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const monthStart = (month = currentMonth()) => `${month}-01`;
const monthEnd = (month = currentMonth()) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
};
const pickerDate = (value) => (value?.isValid?.() ? value.format("YYYY-MM-DD") : "");
const addBillingPeriod = (date, subscription) => {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "";

  const interval = Math.max(1, Number(subscription?.billing_interval || 1));
  const unit = subscription?.billing_unit || "month";

  if (unit === "day") {
    const result = new Date(Date.UTC(year, month - 1, day));
    result.setUTCDate(result.getUTCDate() + interval);
    return result.toISOString().slice(0, 10);
  }

  const targetMonthIndex = unit === "year" ? month - 1 : year * 12 + (month - 1) + interval;
  const targetYear = unit === "year" ? year + interval : Math.floor(targetMonthIndex / 12);
  const targetMonth = unit === "year" ? month - 1 : targetMonthIndex % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();

  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)))
    .toISOString()
    .slice(0, 10);
};
const paymentPeriod = (operationDate, subscription) => ({
  period_start: operationDate,
  period_end: addBillingPeriod(operationDate, subscription),
});
const numberValue = (value) => (value === "" || value === null ? "" : Number(value));
const money = (value, currency = "RUB") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "RUB" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};
const number = (value, digits = 2) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(Number(value || 0));
const dateLabel = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU").format(new Date(`${value}T00:00:00`));
};
const budgetForDate = (budgets, operationDate) =>
  [...(budgets || [])]
    .filter((item) => item.received_date && item.received_date <= operationDate)
    .sort(
      (left, right) =>
        right.received_date.localeCompare(left.received_date) || Number(right.id) - Number(left.id),
    )[0] || null;

function DialogHeader({ children, onClose }) {
  return (
    <DialogTitle sx={{ pr: 6 }}>
      {children}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 12, top: 8 }}
      >
        <CloseRoundedIcon />
      </IconButton>
    </DialogTitle>
  );
}

function FormDialog({ open, title, onClose, onSubmit, submitLabel = "Сохранить", children }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
      >
        <DialogHeader onClose={onClose}>{title}</DialogHeader>
        <DialogContent dividers>
          <Stack spacing={2}>{children}</Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            type="submit"
            variant="contained"
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function ConfirmDialog({ value, onClose, onConfirm }) {
  return (
    <Dialog
      open={Boolean(value)}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogHeader onClose={onClose}>Удалить запись?</DialogHeader>
      <DialogContent dividers>
        <Typography>
          {value?.label || "Эта операция"} будет удалена. Связанные остатки и аналитика будут
          пересчитаны.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MetricCard({ title, value, hint, color = "text.primary", icon }) {
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%" }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{ mt: 0.5, color, fontWeight: 700 }}
            >
              {value}
            </Typography>
            {hint ? (
              <Typography
                color="text.secondary"
                variant="caption"
              >
                {hint}
              </Typography>
            ) : null}
          </Box>
          <Box sx={{ color: "text.secondary" }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function EmptyRow({ colSpan, text }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        align="center"
        sx={{ py: 5, color: "text.secondary" }}
      >
        {text}
      </TableCell>
    </TableRow>
  );
}

function AnalyticsAmount({ rub, currencyAmounts = [], color = "text.primary" }) {
  return (
    <Stack
      spacing={0.25}
      alignItems="flex-end"
    >
      <Typography
        component="span"
        variant="body2"
        sx={{ color }}
      >
        {money(rub)}
      </Typography>
      {currencyAmounts.length ? (
        currencyAmounts.map((item) => (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            key={item.currency}
          >
            {money(item.amount, item.currency)}
          </Typography>
        ))
      ) : (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
        >
          —
        </Typography>
      )}
    </Stack>
  );
}

function SubscriptionDialog({ open, value, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(
      value || {
        name: "",
        amount: "",
        currency: "EUR",
        billing_interval: 1,
        billing_unit: "month",
        billing_anchor_date: today(),
        is_active: true,
        is_personal: false,
        comment: "",
      },
    );
  }, [value, open]);

  return (
    <FormDialog
      open={open}
      title={form.id ? "Редактирование подписки" : "Новая подписка"}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <MyTextInput
        required
        label="Сервис"
        value={form.name || ""}
        func={(event) => setForm({ ...form, name: event.target.value })}
      />
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 8, sm: 8 }}>
          <MyTextInput
            required
            type="number"
            label="Стоимость за период"
            min={0}
            step="0.01"
            value={form.amount ?? ""}
            func={(event) => setForm({ ...form, amount: numberValue(event.target.value) })}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <MySelect
            label="Валюта"
            data={CURRENCY_OPTIONS}
            is_none={false}
            value={form.currency || "EUR"}
            func={(event) => setForm({ ...form, currency: event.target.value })}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 5, sm: 5 }}>
          <MyTextInput
            required
            type="number"
            label="Каждые"
            min={1}
            step={1}
            value={form.billing_interval ?? 1}
            func={(event) =>
              setForm({ ...form, billing_interval: numberValue(event.target.value) })
            }
          />
        </Grid>
        <Grid size={{ xs: 7, sm: 7 }}>
          <MySelect
            label="Период"
            data={PERIODS}
            is_none={false}
            value={form.billing_unit || "month"}
            func={(event) => setForm({ ...form, billing_unit: event.target.value })}
          />
        </Grid>
      </Grid>
      <MyDatePickerNew
        required
        label="Ближайшая дата платежа"
        value={form.billing_anchor_date || ""}
        func={(value) => setForm({ ...form, billing_anchor_date: pickerDate(value) })}
      />
      <MyTextInput
        label="Комментарий"
        multiline
        minRows={2}
        value={form.comment || ""}
        func={(event) => setForm({ ...form, comment: event.target.value })}
      />
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(form.is_active)}
            onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
          />
        }
        label="Активная подписка"
      />
      <MyCheckBox
        label="Личная подписка (без галочки — корпоративная)"
        value={Boolean(form.is_personal)}
        func={(event) => setForm({ ...form, is_personal: event.target.checked })}
      />
    </FormDialog>
  );
}

function WalletDialog({ open, value, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(
      value || {
        name: "",
        currency: "RUB",
        opening_balance: 0,
        opening_cost_rub: 0,
        is_active: true,
      },
    );
  }, [value, open]);

  const isRub = form.currency === "RUB";

  return (
    <FormDialog
      open={open}
      title={form.id ? "Редактирование счёта" : "Новый счёт"}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ ...form, opening_cost_rub: isRub ? form.opening_balance : form.opening_cost_rub });
      }}
    >
      <MyTextInput
        required
        label="Название банка или кошелька"
        value={form.name || ""}
        func={(event) => setForm({ ...form, name: event.target.value })}
      />
      <MySelect
        label="Валюта"
        data={CURRENCY_OPTIONS}
        is_none={false}
        disabled={Boolean(form.id)}
        value={form.currency || "RUB"}
        func={(event) => setForm({ ...form, currency: event.target.value })}
      />
      <MyTextInput
        required
        type="number"
        label="Начальный остаток"
        min={0}
        step="0.01"
        value={form.opening_balance ?? ""}
        func={(event) => setForm({ ...form, opening_balance: numberValue(event.target.value) })}
      />
      {!isRub ? (
        <MyTextInput
          type="number"
          label="Рублёвая стоимость начального остатка"
          helperText="Обязательно для расчёта фактических расходов из существующего валютного остатка"
          min={0}
          step="0.01"
          value={form.opening_cost_rub ?? ""}
          func={(event) => setForm({ ...form, opening_cost_rub: numberValue(event.target.value) })}
        />
      ) : null}
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(form.is_active)}
            onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
          />
        }
        label="Активный счёт"
      />
    </FormDialog>
  );
}

function BudgetDialog({ open, value, dateFrom, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm({
      id: value?.id,
      received_date: value?.received_date || dateFrom,
      base_amount_rub: value?.base_amount_rub ?? "",
      comment: value?.comment || "",
    });
  }, [dateFrom, open, value]);

  return (
    <FormDialog
      open={open}
      title={form.id ? "Редактирование поступления" : "Получение денег от компании"}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <MyDatePickerNew
        required
        label="Дата получения денег"
        value={form.received_date || ""}
        func={(value) => setForm({ ...form, received_date: pickerDate(value) })}
      />
      <MyTextInput
        required
        type="number"
        label="Получено, ₽"
        min={0.01}
        step="0.01"
        value={form.base_amount_rub ?? ""}
        func={(event) => setForm({ ...form, base_amount_rub: numberValue(event.target.value) })}
      />
      <MyTextInput
        label="Комментарий"
        value={form.comment || ""}
        func={(event) => setForm({ ...form, comment: event.target.value })}
      />
    </FormDialog>
  );
}

function BudgetSettingsDialog({ open, value, dateFrom, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm({
      tracking_start_date: value?.tracking_start_date || dateFrom,
      opening_balance_rub: value?.opening_balance_rub ?? 0,
    });
  }, [dateFrom, open, value]);

  return (
    <FormDialog
      open={open}
      title="Начало бюджетного учёта"
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <Alert severity="info">
        Расходы до этой даты останутся в истории, но не будут уменьшать доступный бюджет.
      </Alert>
      <MyDatePickerNew
        required
        label="Считать бюджет с"
        value={form.tracking_start_date || ""}
        func={(value) => setForm({ ...form, tracking_start_date: pickerDate(value) })}
      />
      <MyTextInput
        required
        type="number"
        label="Доступно на начало, ₽"
        helperText="Остаток денег компании на выбранную дату до новых поступлений"
        step="0.01"
        value={form.opening_balance_rub ?? ""}
        func={(event) => setForm({ ...form, opening_balance_rub: numberValue(event.target.value) })}
      />
    </FormDialog>
  );
}

function AdjustmentDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState({ adjustment_date: today(), amount_rub: "", comment: "" });

  useEffect(() => {
    if (open) setForm({ adjustment_date: today(), amount_rub: "", comment: "" });
  }, [open]);

  return (
    <FormDialog
      open={open}
      title="Корректировка бюджета"
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
      submitLabel="Добавить"
    >
      <MyDatePickerNew
        required
        label="Дата"
        value={form.adjustment_date}
        func={(value) => setForm({ ...form, adjustment_date: pickerDate(value) })}
      />
      <MyTextInput
        required
        type="number"
        label="Сумма, ₽"
        helperText="Положительная сумма увеличивает бюджет, отрицательная — уменьшает"
        step="0.01"
        value={form.amount_rub}
        func={(event) => setForm({ ...form, amount_rub: numberValue(event.target.value) })}
      />
      <MyTextInput
        required
        label="Комментарий"
        value={form.comment}
        func={(event) => setForm({ ...form, comment: event.target.value })}
      />
    </FormDialog>
  );
}

function OperationDialog({ open, value, wallets, subscriptions, budgets, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    const operationDate = today();
    setForm(
      value
        ? {
            ...value,
            budget_id: value.is_personal
              ? ""
              : (value.budget_id ?? budgetForDate(budgets, value.operation_date)?.id ?? ""),
          }
        : {
            operation_type: "payment",
            operation_date: operationDate,
            source_wallet_id: "",
            target_wallet_id: "",
            subscription_id: "",
            budget_id: budgetForDate(budgets, operationDate)?.id || "",
            source_amount: "",
            target_amount: "",
            fee_amount: 0,
            rub_amount: "",
            purchase_name: "",
            is_personal: false,
            ...paymentPeriod(operationDate),
            comment: "",
          },
    );
  }, [value, open, budgets]);

  const availableWallets = wallets.filter(
    (item) =>
      item.is_active ||
      item.id === Number(form.source_wallet_id) ||
      item.id === Number(form.target_wallet_id),
  );
  const availableSubscriptions = subscriptions.filter(
    (item) => item.is_active || item.id === Number(form.subscription_id),
  );
  const subscription = availableSubscriptions.find(
    (item) => item.id === Number(form.subscription_id),
  );
  const paymentWallets = availableWallets;
  const targetWallet = availableWallets.find((item) => item.id === Number(form.target_wallet_id));
  const sourceWallet = availableWallets.find((item) => item.id === Number(form.source_wallet_id));
  const availableBudgets = [...(budgets || [])]
    .filter((item) => item.received_date && item.received_date <= form.operation_date)
    .sort(
      (left, right) =>
        right.received_date.localeCompare(left.received_date) || Number(right.id) - Number(left.id),
    );
  const isExpense = ["payment", "purchase"].includes(form.operation_type);
  const isPersonalExpense =
    form.operation_type === "payment"
      ? Boolean(subscription?.is_personal ?? form.is_personal)
      : Boolean(form.is_personal);
  const defaultBudgetId = () => budgetForDate(budgets, form.operation_date)?.id || "";

  return (
    <FormDialog
      open={open}
      title={form.id ? "Редактирование операции" : "Новая операция"}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <MySelect
        label="Тип операции"
        data={OPERATION_OPTIONS}
        is_none={false}
        disabled={Boolean(form.id)}
        value={form.operation_type || "payment"}
        func={(event) => {
          const operationType = event.target.value;
          setForm({
            ...form,
            operation_type: operationType,
            budget_id: ["payment", "purchase"].includes(operationType) ? defaultBudgetId() : "",
            ...(operationType === "payment"
              ? paymentPeriod(form.operation_date, subscription)
              : {}),
          });
        }}
      />
      <MyDatePickerNew
        required
        label="Дата"
        value={form.operation_date || ""}
        func={(value) => {
          const operationDate = pickerDate(value);
          setForm({
            ...form,
            operation_date: operationDate,
            budget_id:
              isExpense && !isPersonalExpense
                ? budgetForDate(budgets, operationDate)?.id || ""
                : "",
            ...(form.operation_type === "payment"
              ? paymentPeriod(operationDate, subscription)
              : {}),
          });
        }}
      />

      {form.operation_type === "payment" ? (
        <>
          <MySelect
            label="Подписка"
            data={availableSubscriptions.map((item) => ({
              id: item.id,
              name: `${item.name} · ${item.currency}`,
            }))}
            is_none={false}
            value={form.subscription_id || ""}
            func={(event) => {
              const item = availableSubscriptions.find(
                (row) => row.id === Number(event.target.value),
              );
              setForm({
                ...form,
                subscription_id: event.target.value,
                is_personal: Boolean(item?.is_personal),
                budget_id: item?.is_personal ? "" : defaultBudgetId(),
                source_amount: form.id ? form.source_amount : item?.amount || "",
                source_wallet_id: "",
                ...paymentPeriod(form.operation_date, item),
              });
            }}
          />
          <MySelect
            label="Счёт списания"
            data={paymentWallets.map((item) => ({
              id: item.id,
              name: `${item.name} · ${money(item.balance, item.currency)}`,
            }))}
            is_none={false}
            value={form.source_wallet_id || ""}
            func={(event) => {
              const wallet = paymentWallets.find((item) => item.id === Number(event.target.value));
              setForm({
                ...form,
                source_wallet_id: event.target.value,
                source_amount: form.id
                  ? form.source_amount
                  : wallet?.currency === subscription?.currency
                    ? subscription?.amount || ""
                    : "",
              });
            }}
          />
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 7, sm: 7 }}>
              <MyTextInput
                required
                type="number"
                label={`Сумма списания${sourceWallet || subscription ? `, ${sourceWallet?.currency || subscription?.currency}` : ""}`}
                helperText={
                  sourceWallet && subscription && sourceWallet.currency !== subscription.currency
                    ? `Укажите фактически списанную сумму в ${sourceWallet.currency}`
                    : undefined
                }
                min={0}
                step="0.01"
                value={form.source_amount ?? ""}
                func={(event) =>
                  setForm({ ...form, source_amount: numberValue(event.target.value) })
                }
              />
            </Grid>
            <Grid size={{ xs: 5, sm: 5 }}>
              <MyTextInput
                type="number"
                label="Комиссия"
                min={0}
                step="0.01"
                value={form.fee_amount ?? 0}
                func={(event) => setForm({ ...form, fee_amount: numberValue(event.target.value) })}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 6, sm: 6 }}>
              <MyDatePickerNew
                label="Начало периода"
                value={form.period_start || ""}
                clearable
                customActions
                func={(value) => setForm({ ...form, period_start: pickerDate(value) })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <MyDatePickerNew
                label="Конец периода"
                value={form.period_end || ""}
                clearable
                customActions
                func={(value) => setForm({ ...form, period_end: pickerDate(value) })}
              />
            </Grid>
          </Grid>
        </>
      ) : null}

      {form.operation_type === "purchase" ? (
        <>
          <MyTextInput
            required
            label="Название покупки"
            value={form.purchase_name || ""}
            func={(event) => setForm({ ...form, purchase_name: event.target.value })}
          />
          <MySelect
            label="Счёт списания"
            data={availableWallets.map((item) => ({
              id: item.id,
              name: `${item.name} · ${money(item.balance, item.currency)}`,
            }))}
            is_none={false}
            value={form.source_wallet_id || ""}
            func={(event) => setForm({ ...form, source_wallet_id: event.target.value })}
          />
          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 7, sm: 7 }}>
              <MyTextInput
                required
                type="number"
                label={`Сумма${sourceWallet ? `, ${sourceWallet.currency}` : ""}`}
                min={0}
                step="0.01"
                value={form.source_amount ?? ""}
                func={(event) =>
                  setForm({ ...form, source_amount: numberValue(event.target.value) })
                }
              />
            </Grid>
            <Grid size={{ xs: 5, sm: 5 }}>
              <MyTextInput
                type="number"
                label="Комиссия"
                min={0}
                step="0.01"
                value={form.fee_amount ?? 0}
                func={(event) => setForm({ ...form, fee_amount: numberValue(event.target.value) })}
              />
            </Grid>
          </Grid>
          <MyCheckBox
            label="Личная покупка (без галочки — корпоративная)"
            value={Boolean(form.is_personal)}
            func={(event) =>
              setForm({
                ...form,
                is_personal: event.target.checked,
                budget_id: event.target.checked ? "" : defaultBudgetId(),
              })
            }
          />
        </>
      ) : null}

      {isExpense && !isPersonalExpense ? (
        <>
          {availableBudgets.length ? (
            <>
              <MySelect
                label="Бюджет"
                data={availableBudgets.map((item) => ({
                  id: item.id,
                  name: `${dateLabel(item.received_date)}${item.comment ? ` · ${item.comment}` : ""} · ${money(item.base_amount_rub)} · осталось ${money(item.remaining_rub)}`,
                }))}
                is_none={false}
                value={form.budget_id || availableBudgets[0].id}
                func={(event) => setForm({ ...form, budget_id: event.target.value })}
              />
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Автоматически выбирается последнее поступление на дату операции. При необходимости
                можно указать более ранний бюджет.
              </Typography>
            </>
          ) : (
            <Alert severity="info">
              До даты операции поступлений нет. Расход сохранится без привязки к бюджету.
            </Alert>
          )}
        </>
      ) : null}

      {form.operation_type === "exchange" ? (
        <>
          <MySelect
            label="Счёт списания"
            data={availableWallets.map((item) => ({
              id: item.id,
              name: `${item.name} · ${money(item.balance, item.currency)}`,
            }))}
            is_none={false}
            value={form.source_wallet_id || ""}
            func={(event) => setForm({ ...form, source_wallet_id: event.target.value })}
          />
          <MyTextInput
            required
            type="number"
            label="Списано"
            min={0}
            step="0.01"
            value={form.source_amount ?? ""}
            func={(event) => setForm({ ...form, source_amount: numberValue(event.target.value) })}
          />
          <MySelect
            label="Счёт зачисления"
            data={availableWallets
              .filter((item) => item.id !== Number(form.source_wallet_id))
              .map((item) => ({ id: item.id, name: `${item.name} · ${item.currency}` }))}
            is_none={false}
            value={form.target_wallet_id || ""}
            func={(event) => setForm({ ...form, target_wallet_id: event.target.value })}
          />
          <MyTextInput
            required
            type="number"
            label={`Получено${targetWallet ? `, ${targetWallet.currency}` : ""}`}
            min={0}
            step="0.01"
            value={form.target_amount ?? ""}
            func={(event) => setForm({ ...form, target_amount: numberValue(event.target.value) })}
          />
        </>
      ) : null}

      {form.operation_type === "funding" ? (
        <>
          <MySelect
            label="Счёт пополнения"
            data={availableWallets.map((item) => ({
              id: item.id,
              name: `${item.name} · ${item.currency}`,
            }))}
            is_none={false}
            value={form.target_wallet_id || ""}
            func={(event) => setForm({ ...form, target_wallet_id: event.target.value })}
          />
          <MyTextInput
            required
            type="number"
            label={`Сумма${targetWallet ? `, ${targetWallet.currency}` : ""}`}
            min={0}
            step="0.01"
            value={form.target_amount ?? ""}
            func={(event) => setForm({ ...form, target_amount: numberValue(event.target.value) })}
          />
          {targetWallet && targetWallet.currency !== "RUB" ? (
            <MyTextInput
              required
              type="number"
              label="Рублёвая стоимость пополнения"
              min={0}
              step="0.01"
              value={form.rub_amount ?? ""}
              func={(event) => setForm({ ...form, rub_amount: numberValue(event.target.value) })}
            />
          ) : null}
        </>
      ) : null}

      <MyTextInput
        label="Комментарий"
        multiline
        minRows={2}
        value={form.comment || ""}
        func={(event) => setForm({ ...form, comment: event.target.value })}
      />
    </FormDialog>
  );
}

export default function SubscriptionExpensesPage() {
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(monthEnd());
  const [tab, setTab] = useState(0);
  const [operationFilter, setOperationFilter] = useState("all");
  const [expandedAnalyticsRow, setExpandedAnalyticsRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    dashboard: {},
    wallets: [],
    subscriptions: [],
    operations: [],
    budget: null,
    budgets: [],
    budget_options: [],
    editable_budgets: [],
    budget_settings: null,
    adjustments: [],
    analytics: [],
    upcoming: [],
    data_quality: {},
  });
  const [subscriptionDialog, setSubscriptionDialog] = useState({ open: false, value: null });
  const [walletDialog, setWalletDialog] = useState({ open: false, value: null });
  const [operationDialog, setOperationDialog] = useState({ open: false, value: null });
  const [budgetDialog, setBudgetDialog] = useState({ open: false, value: null });
  const [budgetSettingsOpen, setBudgetSettingsOpen] = useState(false);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState(null);
  const [alert, setAlert] = useState({ open: false, status: true, text: "" });

  const showAlert = useCallback((text, status = false) => {
    setAlert({ open: true, status, text });
  }, []);

  const request = useCallback(
    async (method, payload = {}) => {
      setLoading(true);
      try {
        const response = await api_laravel("subscription_expenses", method, payload);
        const result = response?.data;
        if (!result) throw new Error("Сервер не вернул данные");
        if (result.st === false) throw new Error(result.text || "Не удалось выполнить операцию");
        return result;
      } catch (error) {
        showAlert(error?.message || "Не удалось выполнить операцию");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert],
  );

  const loadData = useCallback(async () => {
    const result = await request("get_all", { date_from: dateFrom, date_to: dateTo });
    if (result) {
      setData(result);
      document.title = "Расходы на сервисы";
    }
  }, [dateFrom, dateTo, request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mutate = async (method, payload, successText, close) => {
    const result = await request(method, payload);
    if (!result) return;
    close?.();
    showAlert(successText, true);
    await loadData();
  };

  const dashboard = data.dashboard || {};
  const difference = Number(dashboard.difference_rub || 0);
  const overspend = Math.max(0, -difference);
  const isReport = tab === 5;

  const activeWallets = useMemo(
    () => (data.wallets || []).filter((item) => item.is_active),
    [data.wallets],
  );
  const operationFilterOptions = useMemo(() => {
    const options = new Map();

    (data.operations || []).forEach((item) => {
      if (item.subscription_id && item.subscription_name) {
        options.set(`subscription:${item.subscription_id}`, item.subscription_name);
      } else if (item.operation_type === "purchase" && item.purchase_name) {
        options.set(`purchase:${item.purchase_name}`, item.purchase_name);
      }
    });

    return [
      { id: "all", name: "Все операции" },
      ...Array.from(options, ([id, name]) => ({ id, name })).sort((a, b) =>
        a.name.localeCompare(b.name, "ru"),
      ),
    ];
  }, [data.operations]);
  const filteredOperations = useMemo(() => {
    if (operationFilter === "all") return data.operations || [];

    if (operationFilter.startsWith("subscription:")) {
      const subscriptionId = Number(operationFilter.slice("subscription:".length));
      return (data.operations || []).filter(
        (item) => Number(item.subscription_id) === subscriptionId,
      );
    }

    const purchaseName = operationFilter.slice("purchase:".length);
    return (data.operations || []).filter(
      (item) => item.operation_type === "purchase" && item.purchase_name === purchaseName,
    );
  }, [data.operations, operationFilter]);

  useEffect(() => {
    if (!operationFilterOptions.some((item) => item.id === operationFilter)) {
      setOperationFilter("all");
    }
  }, [operationFilter, operationFilterOptions]);

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      sx={{ mb: 4 }}
    >
      <Backdrop
        sx={{ zIndex: 1301 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={alert.open}
        onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
        status={alert.status}
        text={alert.text}
      />

      <Grid size={12}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700 }}
            >
              Расходы на сервисы
            </Typography>
            <Typography color="text.secondary">
              Подписки, валютные остатки и бюджет за выбранный период
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ minWidth: { sm: 440 } }}
          >
            <MyDatePickerNew
              label="Отчёт с"
              value={dateFrom}
              func={(value) => {
                const nextDate = pickerDate(value);
                if (!nextDate) return;
                setDateFrom(nextDate);
                if (nextDate > dateTo) setDateTo(nextDate);
              }}
            />
            <MyDatePickerNew
              label="Отчёт по"
              value={dateTo}
              func={(value) => {
                const nextDate = pickerDate(value);
                if (!nextDate) return;
                setDateTo(nextDate);
                if (nextDate < dateFrom) setDateFrom(nextDate);
              }}
            />
          </Stack>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title="Доступно на начало"
          value={money(
            Number(dashboard.carryover_rub || 0) + Number(dashboard.tracking_opening_rub || 0),
          )}
          hint={
            dashboard.budget_tracking_start
              ? `Учёт с ${dateLabel(dashboard.budget_tracking_start)}`
              : "Настройте начало учёта"
          }
          icon={<SavingsRoundedIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title="Получено за период"
          value={money(
            Number(dashboard.base_budget_rub || 0) + Number(dashboard.adjustments_rub || 0),
          )}
          hint={`Поступления: ${money(dashboard.base_budget_rub || 0)}`}
          icon={<PaymentsRoundedIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title="Корпоративные расходы"
          value={money(dashboard.corporate_actual_rub)}
          hint={
            Number(dashboard.corporate_actual_rub || 0) !== Number(dashboard.budget_actual_rub || 0)
              ? `В бюджете учтено: ${money(dashboard.budget_actual_rub)}`
              : Number(dashboard.personal_actual_rub || 0) > 0
                ? `Личные отдельно: ${money(dashboard.personal_actual_rub)}`
                : `План платежей: ${money(dashboard.planned_rub)}`
          }
          icon={<AnalyticsRoundedIcon />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <MetricCard
          title={overspend > 0 ? "Перерасход" : "Доступно на конец"}
          value={money(overspend > 0 ? overspend : difference)}
          color={overspend > 0 ? "error.main" : "success.main"}
          hint={`На валютных счетах: ${money(dashboard.wallet_value_rub)}`}
          icon={<AccountBalanceWalletRoundedIcon />}
        />
      </Grid>

      {dashboard.budget_tracking_start && dateFrom < dashboard.budget_tracking_start ? (
        <Grid size={12}>
          <Alert severity="info">
            Бюджетный учёт начинается {dateLabel(dashboard.budget_tracking_start)}. Более ранние
            расходы видны в аналитике, но не уменьшают доступный бюджет.
          </Alert>
        </Grid>
      ) : null}

      {dashboard.missing_rate_count > 0 ? (
        <Grid size={12}>
          <Alert severity="warning">
            Для части валютных операций не определена рублёвая себестоимость. Укажите стоимость
            начального остатка или добавьте покупку валюты.
          </Alert>
        </Grid>
      ) : null}

      {(data.data_quality?.negative_wallets || []).map((wallet) => (
        <Grid
          size={12}
          key={`negative-wallet-${wallet.id}`}
        >
          <Alert severity="warning">
            Счёт «{wallet.name}» уходил в минус до {money(wallet.minimum_balance, wallet.currency)}{" "}
            {wallet.first_negative_date ? `с ${dateLabel(wallet.first_negative_date)}` : ""}.
            Проверьте, не пропущено ли пополнение.
          </Alert>
        </Grid>
      ))}

      {(data.data_quality?.duplicate_payment_groups || []).length ? (
        <Grid size={12}>
          <Alert severity="info">
            Найдены похожие повторные списания:{" "}
            {data.data_quality.duplicate_payment_groups
              .map(
                (item) =>
                  `${item.subscription_name} — ${item.count} × ${money(item.amount, item.currency)} ${dateLabel(item.operation_date)}`,
              )
              .join("; ")}
            . Если это разные лицензии, записи можно оставить.
          </Alert>
        </Grid>
      ) : null}

      <Grid size={12}>
        <Paper variant="outlined">
          <Tabs
            value={tab}
            onChange={(event, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Главная" />
            <Tab label="Подписки" />
            <Tab label="Счета" />
            <Tab label="Операции" />
            <Tab label="Аналитика" />
            <Tab label="Отчёт бухгалтеру" />
          </Tabs>
        </Paper>
      </Grid>

      {tab === 0 ? (
        <>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, height: "100%" }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                spacing={2}
                mb={2}
              >
                <Box>
                  <Typography variant="h6">Движение бюджета</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Остаток переносится между периодами автоматически
                  </Typography>
                </Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                >
                  <Button
                    size="small"
                    onClick={() => setBudgetSettingsOpen(true)}
                  >
                    Начало учёта
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setAdjustmentOpen(true)}
                  >
                    Корректировка
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setBudgetDialog({ open: true, value: null })}
                  >
                    Добавить поступление
                  </Button>
                </Stack>
              </Stack>
              <Grid
                container
                spacing={2}
              >
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    На начало
                  </Typography>
                  <Typography fontWeight={700}>
                    {money(
                      Number(dashboard.carryover_rub || 0) +
                        Number(dashboard.tracking_opening_rub || 0),
                    )}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Получено
                  </Typography>
                  <Typography fontWeight={700}>{money(dashboard.base_budget_rub || 0)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Корректировки
                  </Typography>
                  <Typography fontWeight={700}>{money(dashboard.adjustments_rub || 0)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Потрачено
                  </Typography>
                  <Typography fontWeight={700}>
                    {money(dashboard.budget_actual_rub || 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    На конец
                  </Typography>
                  <Typography
                    fontWeight={700}
                    color={difference < 0 ? "error.main" : "success.main"}
                  >
                    {money(difference)}
                  </Typography>
                </Grid>
              </Grid>

              {(data.budget_options || []).some((item) => item.received_date <= dateTo) ||
              (data.adjustments || []).length ? (
                <Stack
                  spacing={1}
                  mt={2}
                >
                  <Divider />
                  {(data.budget_options || [])
                    .filter((item) => item.received_date <= dateTo)
                    .map((item) => (
                      <Stack
                        key={`budget-${item.id}`}
                        direction="row"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Box>
                          <Typography variant="body2">
                            {dateLabel(item.received_date)} · Поступление
                          </Typography>
                          {item.comment ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.comment}
                            </Typography>
                          ) : null}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Потрачено: {money(item.spent_rub)} · Осталось:{" "}
                            <Box
                              component="span"
                              sx={{
                                color:
                                  Number(item.remaining_rub) < 0 ? "error.main" : "success.main",
                                fontWeight: 700,
                              }}
                            >
                              {money(item.remaining_rub)}
                            </Box>
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {money(item.base_amount_rub)}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setBudgetDialog({ open: true, value: item })}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmValue({
                                type: "budget",
                                id: item.id,
                                label: `Поступление ${dateLabel(item.received_date)}`,
                              })
                            }
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    ))}
                  {(data.adjustments || []).map((item) => (
                    <Stack
                      key={`adjustment-${item.id}`}
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Typography variant="body2">
                        {dateLabel(item.adjustment_date)} · {item.comment}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          {money(item.amount_rub)}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirmValue({
                              type: "budget_adjustment",
                              id: item.id,
                              label: item.comment,
                            })
                          }
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography
                  color="text.secondary"
                  variant="body2"
                  mt={2}
                >
                  В выбранном периоде поступлений и корректировок нет
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2, height: "100%" }}
            >
              <Typography
                variant="h6"
                mb={2}
              >
                Ближайшие платежи
              </Typography>
              <Stack spacing={1.5}>
                {(data.upcoming || []).map((item) => (
                  <Stack
                    key={`${item.id}-${item.next_payment_date}`}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography fontWeight={600}>{item.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {dateLabel(item.next_payment_date)}
                      </Typography>
                    </Box>
                    <Typography>{money(item.amount, item.currency)}</Typography>
                  </Stack>
                ))}
                {!data.upcoming?.length ? (
                  <Typography color="text.secondary">В ближайшие 45 дней платежей нет</Typography>
                ) : null}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={12}>
            <Paper
              variant="outlined"
              sx={{ p: 2 }}
            >
              <Typography
                variant="h6"
                mb={2}
              >
                Остатки по счетам на {dateLabel(dateTo)}
              </Typography>
              <Grid
                container
                spacing={2}
              >
                {(data.wallets || []).map((wallet) => (
                  <Grid
                    key={wallet.id}
                    size={{ xs: 12, sm: 6, md: 4 }}
                  >
                    <Card variant="outlined">
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography fontWeight={700}>{wallet.name}</Typography>
                          <Chip
                            size="small"
                            label={wallet.currency}
                          />
                        </Stack>
                        <Typography
                          variant="h6"
                          mt={1}
                        >
                          {money(wallet.balance, wallet.currency)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          В рублях: {money(wallet.value_rub)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {!data.wallets?.length ? (
                  <Grid size={12}>
                    <Typography color="text.secondary">Добавьте первый счёт</Typography>
                  </Grid>
                ) : null}
              </Grid>
            </Paper>
          </Grid>
        </>
      ) : null}

      {tab === 1 ? (
        <Grid size={12}>
          <Paper variant="outlined">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ p: 2 }}
            >
              <Typography variant="h6">Подписки</Typography>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setSubscriptionDialog({ open: true, value: null })}
              >
                Добавить
              </Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Сервис</TableCell>
                    <TableCell>Цена</TableCell>
                    <TableCell>Период</TableCell>
                    <TableCell>В месяц</TableCell>
                    <TableCell>Следующий платёж</TableCell>
                    <TableCell>Принадлежность</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.subscriptions || []).map((item) => (
                    <TableRow
                      hover
                      key={item.id}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{money(item.amount, item.currency)}</TableCell>
                      <TableCell>
                        {item.billing_interval}{" "}
                        {PERIODS.find((p) => p.id === item.billing_unit)?.name}
                      </TableCell>
                      <TableCell>{money(item.monthly_equivalent, item.currency)}</TableCell>
                      <TableCell>{dateLabel(item.next_payment_date)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={item.is_personal ? "warning" : "default"}
                          label={item.is_personal ? "Личная" : "Корпоративная"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={item.is_active ? "success" : "default"}
                          label={item.is_active ? "Активна" : "Отключена"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => setSubscriptionDialog({ open: true, value: item })}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirmValue({ type: "subscription", id: item.id, label: item.name })
                          }
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data.subscriptions?.length ? (
                    <EmptyRow
                      colSpan={8}
                      text="Подписок пока нет"
                    />
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      ) : null}

      {tab === 2 ? (
        <Grid size={12}>
          <Paper variant="outlined">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ p: 2 }}
            >
              <Typography variant="h6">Счета и кошельки</Typography>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setWalletDialog({ open: true, value: null })}
              >
                Добавить
              </Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Счёт</TableCell>
                    <TableCell>Валюта</TableCell>
                    <TableCell align="right">Остаток</TableCell>
                    <TableCell align="right">Средняя стоимость</TableCell>
                    <TableCell align="right">Стоимость в рублях</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.wallets || []).map((item) => (
                    <TableRow
                      hover
                      key={item.id}
                    >
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.currency}</TableCell>
                      <TableCell align="right">{money(item.balance, item.currency)}</TableCell>
                      <TableCell align="right">
                        {item.currency === "RUB" ? "1 ₽" : money(item.average_rate_rub)}
                      </TableCell>
                      <TableCell align="right">{money(item.value_rub)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => setWalletDialog({ open: true, value: item })}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirmValue({ type: "wallet", id: item.id, label: item.name })
                          }
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data.wallets?.length ? (
                    <EmptyRow
                      colSpan={6}
                      text="Счетов пока нет"
                    />
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      ) : null}

      {tab === 3 ? (
        <Grid size={12}>
          <Paper variant="outlined">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              sx={{ p: 2 }}
            >
              <Typography variant="h6">Журнал операций</Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
              >
                <Box sx={{ minWidth: { sm: 260 } }}>
                  <MySelect
                    label="Сервис или покупка"
                    data={operationFilterOptions}
                    is_none={false}
                    value={operationFilter}
                    func={(event) => setOperationFilter(event.target.value)}
                  />
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  disabled={!activeWallets.length}
                  onClick={() => setOperationDialog({ open: true, value: null })}
                >
                  Добавить
                </Button>
              </Stack>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Операция</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Принадлежность</TableCell>
                    <TableCell>Бюджет</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell align="right">В рублях</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOperations.map((item) => (
                    <TableRow
                      hover
                      key={item.id}
                    >
                      <TableCell>{dateLabel(item.operation_date)}</TableCell>
                      <TableCell>{OPERATION_LABELS[item.operation_type]}</TableCell>
                      <TableCell>
                        {item.subscription_name ||
                          item.purchase_name ||
                          item.comment ||
                          [item.source_wallet_name, item.target_wallet_name]
                            .filter(Boolean)
                            .join(" → ")}
                      </TableCell>
                      <TableCell>
                        {["payment", "purchase"].includes(item.operation_type) ? (
                          <Chip
                            size="small"
                            color={item.is_personal ? "warning" : "default"}
                            label={item.is_personal ? "Личная" : "Корпоративная"}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {["payment", "purchase"].includes(item.operation_type) &&
                        !item.is_personal ? (
                          item.budget_received_date ? (
                            <Stack spacing={0}>
                              <Typography variant="body2">
                                {dateLabel(item.budget_received_date)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {money(item.budget_amount_rub)}
                              </Typography>
                            </Stack>
                          ) : (
                            <Chip
                              size="small"
                              color="warning"
                              label="Не распределено"
                            />
                          )
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {item.operation_type === "funding"
                          ? money(item.target_amount, item.target_currency)
                          : money(
                              Number(item.source_amount || 0) + Number(item.fee_amount || 0),
                              item.source_currency,
                            )}
                      </TableCell>
                      <TableCell align="right">{money(item.rub_amount)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => setOperationDialog({ open: true, value: item })}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setConfirmValue({
                              type: "operation",
                              id: item.id,
                              label: OPERATION_LABELS[item.operation_type],
                            })
                          }
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredOperations.length ? (
                    <EmptyRow
                      colSpan={8}
                      text={operationFilter === "all" ? "Операций пока нет" : "Операций не найдено"}
                    />
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      ) : null}

      {tab === 4 || isReport ? (
        <Grid size={12}>
          <Paper
            variant="outlined"
            sx={{ p: isReport ? 3 : 0 }}
          >
            {isReport ? (
              <Box mb={3}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                >
                  Отчёт по расходам за {dateLabel(dateFrom)} — {dateLabel(dateTo)}
                </Typography>
                <Typography color="text.secondary">
                  Доступно с поступлениями: {money(dashboard.effective_budget_rub)} · Корпоративный
                  факт: {money(dashboard.budget_actual_rub)} ·{" "}
                  {overspend > 0
                    ? `Перерасход: ${money(overspend)}`
                    : `Остаток: ${money(difference)}`}
                </Typography>
              </Box>
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 2 }}
              >
                <Typography variant="h6">План и факт по подпискам и покупкам</Typography>
                {dashboard.structural_deficit_rub > 0 ? (
                  <Chip
                    color="error"
                    label={`Дефицит бюджета: ${money(dashboard.structural_deficit_rub)}`}
                  />
                ) : null}
              </Stack>
            )}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Расход</TableCell>
                    <TableCell>Принадлежность</TableCell>
                    <TableCell align="right">План</TableCell>
                    <TableCell align="right">Факт</TableCell>
                    <TableCell align="right">Отклонение</TableCell>
                    <TableCell align="right">Доля расходов</TableCell>
                    <TableCell>Причина</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.analytics || []).map((item) => {
                    const rowKey = `${item.expense_kind}-${item.subscription_id || item.operation_id}`;
                    const isExpanded = expandedAnalyticsRow === rowKey;
                    const hasDetails = Boolean(item.payment_details?.length);

                    return (
                      <Fragment key={rowKey}>
                        <TableRow hover>
                          <TableCell padding="checkbox">
                            <IconButton
                              size="small"
                              disabled={!hasDetails}
                              aria-label={
                                isExpanded ? "Скрыть счета списания" : "Показать счета списания"
                              }
                              aria-expanded={isExpanded}
                              onClick={() => setExpandedAnalyticsRow(isExpanded ? null : rowKey)}
                            >
                              {isExpanded ? (
                                <KeyboardArrowUpRoundedIcon />
                              ) : (
                                <KeyboardArrowDownRoundedIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={item.is_personal ? "warning" : "default"}
                              label={item.is_personal ? "Личная" : "Корпоративная"}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <AnalyticsAmount
                              rub={item.planned_rub}
                              currencyAmounts={[
                                { currency: item.currency, amount: item.planned_native },
                              ]}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <AnalyticsAmount
                              rub={item.actual_rub}
                              currencyAmounts={item.actual_currency_amounts || []}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <AnalyticsAmount
                              rub={item.deviation_rub}
                              currencyAmounts={
                                item.deviation_native === null ||
                                item.deviation_native === undefined
                                  ? []
                                  : [{ currency: item.currency, amount: item.deviation_native }]
                              }
                              color={item.deviation_rub > 0 ? "error.main" : "success.main"}
                            />
                          </TableCell>
                          <TableCell align="right">{number(item.share_percent, 1)}%</TableCell>
                          <TableCell>{item.reason || "—"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            sx={{ py: 0, borderBottom: isExpanded ? undefined : 0 }}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ py: 2, px: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                >
                                  Счета и фактические списания
                                </Typography>
                                <TableContainer
                                  component={Paper}
                                  variant="outlined"
                                >
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Дата</TableCell>
                                        <TableCell>Счёт списания</TableCell>
                                        <TableCell>Бюджет</TableCell>
                                        <TableCell align="right">Списано</TableCell>
                                        <TableCell align="right">Комиссия</TableCell>
                                        <TableCell align="right">В рублях</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {item.payment_details.map((payment) => (
                                        <TableRow key={payment.operation_id}>
                                          <TableCell>{dateLabel(payment.operation_date)}</TableCell>
                                          <TableCell>{payment.wallet_name || "—"}</TableCell>
                                          <TableCell>
                                            {payment.budget_received_date ? (
                                              <Stack spacing={0}>
                                                <Typography variant="body2">
                                                  {dateLabel(payment.budget_received_date)}
                                                </Typography>
                                                <Typography
                                                  variant="caption"
                                                  color="text.secondary"
                                                >
                                                  {money(payment.budget_amount_rub)}
                                                </Typography>
                                              </Stack>
                                            ) : item.is_personal ? (
                                              "—"
                                            ) : (
                                              <Chip
                                                size="small"
                                                color="warning"
                                                label="Не распределено"
                                              />
                                            )}
                                          </TableCell>
                                          <TableCell align="right">
                                            {money(payment.amount, payment.currency)}
                                          </TableCell>
                                          <TableCell align="right">
                                            {money(payment.fee_amount, payment.currency)}
                                          </TableCell>
                                          <TableCell align="right">
                                            {money(payment.rub_amount)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                  {!data.analytics?.length ? (
                    <EmptyRow
                      colSpan={8}
                      text="За выбранный период данных нет"
                    />
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
            {isReport ? (
              <Box mt={3}>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="subtitle2"
                  gutterBottom
                >
                  Остатки
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {(data.wallets || []).map((item) => (
                    <Chip
                      key={item.id}
                      label={`${item.name}: ${money(item.balance, item.currency)}`}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Paper>
        </Grid>
      ) : null}

      <SubscriptionDialog
        open={subscriptionDialog.open}
        value={subscriptionDialog.value}
        onClose={() => setSubscriptionDialog({ open: false, value: null })}
        onSave={(subscription) =>
          mutate("save_subscription", { subscription }, "Подписка сохранена", () =>
            setSubscriptionDialog({ open: false, value: null }),
          )
        }
      />
      <WalletDialog
        open={walletDialog.open}
        value={walletDialog.value}
        onClose={() => setWalletDialog({ open: false, value: null })}
        onSave={(wallet) =>
          mutate("save_wallet", { wallet }, "Счёт сохранён", () =>
            setWalletDialog({ open: false, value: null }),
          )
        }
      />
      <OperationDialog
        open={operationDialog.open}
        value={operationDialog.value}
        wallets={data.wallets || []}
        subscriptions={data.subscriptions || []}
        budgets={data.budget_options || []}
        onClose={() => setOperationDialog({ open: false, value: null })}
        onSave={(operation) =>
          mutate("save_operation", { operation }, "Операция сохранена", () =>
            setOperationDialog({ open: false, value: null }),
          )
        }
      />
      <BudgetDialog
        open={budgetDialog.open}
        value={budgetDialog.value}
        dateFrom={dateFrom}
        onClose={() => setBudgetDialog({ open: false, value: null })}
        onSave={(budget) =>
          mutate("save_budget", { budget }, "Поступление сохранено", () =>
            setBudgetDialog({ open: false, value: null }),
          )
        }
      />
      <BudgetSettingsDialog
        open={budgetSettingsOpen}
        value={data.budget_settings}
        dateFrom={dateFrom}
        onClose={() => setBudgetSettingsOpen(false)}
        onSave={(settings) =>
          mutate("save_budget_settings", { settings }, "Начало бюджетного учёта сохранено", () =>
            setBudgetSettingsOpen(false),
          )
        }
      />
      <AdjustmentDialog
        open={adjustmentOpen}
        onClose={() => setAdjustmentOpen(false)}
        onSave={(adjustment) =>
          mutate("save_budget_adjustment", { adjustment }, "Корректировка добавлена", () =>
            setAdjustmentOpen(false),
          )
        }
      />
      <ConfirmDialog
        value={confirmValue}
        onClose={() => setConfirmValue(null)}
        onConfirm={() => {
          const item = confirmValue;
          if (!item) return;
          mutate(`delete_${item.type}`, { id: item.id }, "Запись удалена", () =>
            setConfirmValue(null),
          );
        }}
      />
    </Grid>
  );
}
