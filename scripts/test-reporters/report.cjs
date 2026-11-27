const fs = require("fs");
const path = require("path");
const { stripVTControlCharacters } = require("util");

function line(value, limit = 240) {
  const clean =
    stripVTControlCharacters(String(value ?? ""))
      .split(/\r?\n/)
      .find((text) => text.trim())
      ?.trim() || "Причина не предоставлена раннером";
  return clean.length > limit ? `${clean.slice(0, limit - 1)}…` : clean;
}

function valueText(value) {
  if (typeof value === "string")
    return value.length <= 80 && !/[\r\n]/.test(value)
      ? JSON.stringify(value)
      : `строка (${value.length} символов)`;
  if (value === null || ["number", "boolean", "undefined", "bigint"].includes(typeof value))
    return String(value);
  return Array.isArray(value) ? `массив (${value.length})` : "объект";
}

function messageReason(message) {
  const text = stripVTControlCharacters(String(message || ""));
  const first = line(text);
  const details = text
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter((entry) =>
      /^(Expected|Received):\s*(?:[-+]?\d[\d.eE+-]*|true|false|null|undefined|"[^"\r\n]{0,70}"|'[^'\r\n]{0,70}')$/.test(
        entry,
      ),
    );
  return details.length ? `${first}; ${details.slice(0, 2).join("; ")}` : first;
}

function startupReason(output) {
  const lines = stripVTControlCharacters(String(output || ""))
    .split(/\r?\n/)
    .map((entry) => entry.trim());
  const diagnostic = lines.find((entry) =>
    /^(?:Error(?: \[[^\]]+\])?:|SyntaxError:|TypeError:|ReferenceError:|Cannot |failed to load config|No tests found)/i.test(
      entry,
    ),
  );
  return diagnostic
    ? line(diagnostic)
    : "Раннер не предоставил структурированную причину; см. полный журнал";
}

function reason(error) {
  let cause = error;
  for (let depth = 0; cause?.cause && depth < 5; depth += 1) cause = cause.cause;
  if (!cause) return "Причина не предоставлена раннером";
  if (cause.operator === "match") return `Не найден ожидаемый шаблон: ${line(cause.expected, 150)}`;
  if (cause.operator === "doesNotMatch")
    return `Найден запрещённый шаблон: ${line(cause.expected, 150)}`;
  if (
    ["strictEqual", "equal", "notStrictEqual", "notEqual", "==", "===", "!=", "!=="].includes(
      cause.operator,
    )
  ) {
    return `Проверка ${cause.operator}: ожидалось ${valueText(cause.expected)}, получено ${valueText(cause.actual)}`;
  }
  if (
    ["deepEqual", "deepStrictEqual", "notDeepEqual", "notDeepStrictEqual"].includes(cause.operator)
  )
    return `Структуры данных не соответствуют проверке ${cause.operator}`;
  return messageReason(cause.message || cause);
}

function createReportDirectory(
  root,
  prefix = "run-",
  base = path.join(root, "test-reports", "summary"),
) {
  fs.mkdirSync(base, { recursive: true });
  return fs.mkdtempSync(path.join(base, prefix));
}

function emptyReport(name) {
  return {
    name,
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    cancelled: 0,
    todo: 0,
    flaky: 0,
    failures: [],
    errors: [],
  };
}

function fromVitest(raw) {
  const report = emptyReport("Vitest");
  Object.assign(report, {
    total: raw.numTotalTests || 0,
    passed: raw.numPassedTests || 0,
    failed: raw.numFailedTests || 0,
    todo: raw.numTodoTests || 0,
    skipped: raw.numPendingTests || 0,
  });
  for (const file of raw.testResults || []) {
    for (const test of file.assertionResults || []) {
      if (test.status !== "failed") continue;
      report.failures.push({
        name: test.fullName || test.title,
        file: file.name,
        line: test.location?.line,
        reason: messageReason(
          test.failureMessages?.[0] || file.message || "Тест завершился с ошибкой без подробностей",
        ),
        details: test.failureMessages,
      });
    }
    if (
      file.status === "failed" &&
      !(file.assertionResults || []).some((test) => test.status === "failed")
    ) {
      report.errors.push({
        message: line(file.message || `Не удалось выполнить файл ${file.name}`),
        file: file.name,
        details: file.message,
      });
    }
  }
  if (raw.success === false && !report.failed && !report.errors.length)
    report.errors.push({ message: "Vitest завершился с ошибкой вне отдельных тестов" });
  return report;
}

function location(failure, root) {
  if (!failure.file) return "место не предоставлено раннером";
  const file = path.isAbsolute(failure.file) ? path.relative(root, failure.file) : failure.file;
  return `${file}${failure.line ? `:${failure.line}` : ""}`;
}

function formatReports(
  reports,
  { root = process.cwd(), directory, style = (format, text) => text } = {},
) {
  const output = [];
  const sum = reports.reduce(
    (total, report) => {
      for (const key of ["total", "passed", "failed", "skipped", "cancelled", "todo", "flaky"])
        total[key] += report[key] || 0;
      total.errors += report.errors.length;
      return total;
    },
    { total: 0, passed: 0, failed: 0, skipped: 0, cancelled: 0, todo: 0, flaky: 0, errors: 0 },
  );
  const stats = (report) =>
    `всего ${report.total}, ${style(report.passed ? "green" : "dim", `успешно ${report.passed}`)}, ${style(report.failed ? "red" : "dim", `ошибок ${report.failed}`)}, ${style(report.skipped ? "yellow" : "dim", `пропущено ${report.skipped}`)}` +
    (report.cancelled ? `, ${style("yellow", `отменено ${report.cancelled}`)}` : "") +
    (report.todo ? `, ${style("yellow", `todo ${report.todo}`)}` : "") +
    (report.flaky ? `, ${style("yellow", `нестабильных ${report.flaky}`)}` : "") +
    (report.errors
      ? `, ${style("red", `ошибок запуска ${Array.isArray(report.errors) ? report.errors.length : report.errors}`)}`
      : "");
  for (const report of reports)
    output.push(
      `${style("cyan", report.name)}: ${stats({ ...report, errors: report.errors.length })}`,
    );
  if (reports.length > 1) output.push(`${style("bold", "Итого")}: ${stats(sum)}`);
  const failures = reports.flatMap((report) =>
    report.failures.map((failure) => ({ ...failure, runner: report.name })),
  );
  if (failures.length) {
    output.push("", style("red", "Не прошли:"));
    failures.forEach((failure, index) => {
      output.push(style("red", `${index + 1}. ${line(failure.name, 300)}`));
      output.push(`   ${style("dim", location(failure, root))} — ${style("red", failure.reason)}`);
      if (failure.artifacts?.length)
        output.push(
          style(
            "dim",
            `   Артефакты: ${failure.artifacts.map((item) => path.relative(root, item.path)).join(", ")}`,
          ),
        );
    });
  }
  for (const report of reports)
    for (const error of report.errors)
      output.push(style("red", `Ошибка ${report.name}: ${line(error.message)}`));
  if (directory)
    output.push("", style("dim", `Подробности: ${path.relative(root, directory) || "."}`));
  return output.join("\n");
}

module.exports = {
  line,
  messageReason,
  startupReason,
  reason,
  emptyReport,
  fromVitest,
  formatReports,
  createReportDirectory,
};
