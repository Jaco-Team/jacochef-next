export const ACCOUNTING_CORRECTION_NOTICE =
  "Только запись в таблице Шефа. В АТОЛ/ОФД чек не отправляется; это не подтверждение фискализации.";

export const canAddIncomeCorrection = (access) =>
  Number(access?.check_access) === 1 && Number(access?.resolve_access) === 1;

export function isIncomeCorrectionPreview(preview, context) {
  return Boolean(
    preview?.accounting_only === true &&
    Number(preview.point_id) === Number(context?.point?.id) &&
    preview.base === context?.point?.base &&
    Number(preview.order_id) === Number(context?.order_id) &&
    Number.isFinite(Number(preview.amount)) &&
    Number(preview.amount) > 0 &&
    Number.isInteger(Number(preview.kassa)) &&
    Number(preview.kassa) > 0 &&
    Number.isInteger(Number(preview.smena)) &&
    Number(preview.smena) > 0 &&
    typeof preview.version === "string" &&
    preview.version.length > 0,
  );
}

export const hasAccountingCorrection = (issues, orderId) =>
  (issues ?? []).some(
    (issue) =>
      issue.code === "receipt_accounting_correction" && Number(issue.order_id) === Number(orderId),
  );
