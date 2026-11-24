import { useState } from "react";
import { Stack } from "@mui/material";
import { JacoAlert } from "@/design-system/shared/ui";
import IncomeCorrectionDialog from "@/components/check_check/IncomeCorrectionDialog";
import OnlineCheckAudit from "@/components/check_check/OnlineCheckAudit";

export default {
  title: "Chef Design System/Modules/Check Check/Income Correction",
  parameters: { layout: "padded" },
};

const context = {
  point: { id: 1, base: "jaco_rolls_1", name: "Тестовое кафе" },
  order_id: 934411,
  date_start: "2026-09-01",
  date_end: "2026-09-29",
};
const preview = {
  point_id: 1,
  base: "jaco_rolls_1",
  order_id: 934411,
  order_date: "2026-09-09 16:58:32",
  amount: 2614,
  kassa: 2,
  smena: 362,
  type_nalog: 1,
  version: "mock-preview-version",
  accounting_only: true,
  history: [],
};
const audit = {
  status: "error",
  title: "Требует действий",
  summary: {
    orders_count: 1,
    orders_amount: 2614,
    paid_count: 1,
    receipts_count: 0,
    errors_count: 1,
  },
  issues: [
    {
      code: "receipt_missing",
      severity: "error",
      order_id: 934411,
      order_date: "2026-09-09",
      amount: 2614,
      title: "Деньги списаны, чек ОФД не найден",
    },
  ],
  coverage: { checked_through: "2026-09-30 15:25:49" },
};

function Fixture({ denied = false, previewError = false, withRecord = false }) {
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const getData = async (method) => {
    if (method === "preview_online_income_correction")
      return previewError
        ? { st: false, text: "Заказ уже имеет учётную коррекцию" }
        : { st: true, preview };
    return { st: true, accounting_only: true, insert_id: 123, text: "Тестовая запись добавлена" };
  };
  // Keep the mock API stable across dialog state updates.
  const [mockApi] = useState(() => getData);
  const result =
    withRecord || saved
      ? {
          ...audit,
          summary: { ...audit.summary, warnings_count: 1, accounting_corrections_count: 1 },
          issues: [
            ...audit.issues,
            {
              code: "receipt_accounting_correction",
              severity: "warning",
              order_id: 934411,
              order_date: "2026-09-09",
              amount: 2614,
              title: "Добавлена учётная коррекция, физического чека нет",
              details: { accounting_only: true, receipt_id: 123 },
            },
          ],
        }
      : audit;

  return (
    <Stack spacing={2}>
      <JacoAlert severity="info">
        Изолированный пример: все ответы API тестовые, фискализация не запускается.
      </JacoAlert>
      {saved && (
        <JacoAlert severity="success">
          Тестовая учётная запись добавлена, чек ОФД не создавался.
        </JacoAlert>
      )}
      <OnlineCheckAudit
        result={result}
        onRun={() => {}}
        onIncomeCorrection={denied ? undefined : () => setSelected(context)}
      />
      <IncomeCorrectionDialog
        context={selected}
        canAdd={!denied}
        getData={mockApi}
        onClose={() => setSelected(null)}
        onSuccess={() => {
          setSelected(null);
          setSaved(true);
        }}
      />
    </Stack>
  );
}

export const MissingReceipt = () => <Fixture />;
export const WithoutAccess = () => <Fixture denied />;
export const PreviewRejected = () => <Fixture previewError />;
export const AccountingRecordOnly = () => <Fixture withRecord />;
