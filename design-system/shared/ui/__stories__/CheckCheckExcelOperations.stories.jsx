import { Stack } from "@mui/material";
import ExcelOperationsButton from "@/components/check_check/ExcelOperationsDialog";
import ExcelCompareSummary from "@/components/check_check/ExcelCompareSummary";

export default {
  title: "Chef Design System/Modules/Check Check/Excel Operations",
  parameters: { layout: "padded" },
};

const operation = (row_number, amount, operation_type, extra = {}) => ({
  row_number,
  amount,
  operation_type,
  date: "2026-09-18",
  date_time: "2026-09-18 17:05:30",
  terminal: "12345678",
  rrn: `260918000${row_number}`,
  kassa: 1,
  smena: 380,
  ...extra,
});
const excelCompare = {
  upload: { rows_used: 5, rows_total: 6 },
  diff: { stats: { days_ok: 28, days_total: 29, days_mismatch: 1 } },
  excel: {
    operations: [
      operation(18, 295, "Оплата Цифровым рублем в ТСТ Сбербанка"),
      operation(19, 105, "Оплата Цифровым рублем в ТСТ Сбербанка"),
      operation(20, 19, "Оплата Цифровым рублем в ТСТ Сбербанка"),
      operation(21, -150, "Возврат покупки"),
      operation(22, 200, "Покупка", { rrn: "", date_time: null, kassa: null, smena: null }),
    ],
  },
  warnings: {
    unknown_operation_types: ["Неизвестная операция банка"],
    unknown_operations: [
      operation(23, 37, "Неизвестная операция банка", { kassa: null, smena: null }),
    ],
  },
};

export const SeptemberDetails = () => (
  <Stack spacing={2}>
    <ExcelCompareSummary
      excelCompare={excelCompare}
      formatNumber={(value) => String(value)}
    />
    <ExcelOperationsButton
      excelCompare={excelCompare}
      scope={{ date: "2026-09-18" }}
    />
  </Stack>
);

export const ShiftDetails = () => (
  <ExcelOperationsButton
    excelCompare={excelCompare}
    scope={{ date: "2026-09-18", kassa: 1, smena: 380 }}
  />
);

export const LegacyResponse = () => (
  <ExcelCompareSummary
    excelCompare={{ ...excelCompare, excel: {} }}
    formatNumber={(value) => String(value)}
  />
);
