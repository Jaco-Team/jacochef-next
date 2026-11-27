const fs = require("fs");
const path = require("path");
const { styleText } = require("node:util");
const {
  emptyReport,
  line,
  messageReason,
  formatReports,
  createReportDirectory,
} = require("./report.cjs");

class CompactPlaywrightReporter {
  constructor() {
    this.report = emptyReport("Playwright");
    this.listOnly = process.argv.includes("--list");
    this.outputFile = process.env.CHEF_TEST_REPORT_FILE;
    this.external = Boolean(this.outputFile);
  }

  onBegin(config, suite) {
    this.root = config.configFile ? path.dirname(config.configFile) : process.cwd();
    this.suite = suite;
    if (!this.outputFile) {
      this.directory = createReportDirectory(this.root, "playwright-");
      this.outputFile = path.join(this.directory, "playwright.json");
    } else this.directory = path.dirname(this.outputFile);
    this.logFile = path.join(this.directory, "playwright-full.log");
    if (this.listOnly)
      for (const test of suite.allTests())
        console.log(
          `${test.titlePath().filter(Boolean).join(" › ")} (${path.relative(this.root, test.location.file)}:${test.location.line})`,
        );
  }

  onStdOut(chunk) {
    this.log(chunk);
  }
  onStdErr(chunk) {
    this.log(chunk);
  }

  log(chunk) {
    if (!this.logFile) return;
    try {
      fs.appendFileSync(this.logFile, chunk);
    } catch (error) {
      if (!this.report.errors.some((item) => item.kind === "report-persistence")) {
        this.report.errors.push({
          kind: "report-persistence",
          message: `Не удалось сохранить подробный журнал: ${line(error.message)}`,
        });
      }
    }
  }

  onTestEnd(test, result) {
    this.log(
      `${JSON.stringify({ title: test.titlePath(), location: test.location, retry: result.retry, status: result.status, errors: result.errors, attachments: result.attachments })}\n`,
    );
  }

  onError(error) {
    this.report.errors.push({ message: line(error.message || error.value), details: error });
  }

  onEnd(result) {
    if (this.listOnly) {
      console.log(
        `Найдено тестов: ${this.suite?.allTests().length || 0}. Выполнение не запускалось.`,
      );
      return;
    }
    for (const test of this.suite?.allTests() || []) {
      this.report.total += 1;
      const outcome = test.outcome();
      const last = test.results.at(-1);
      if (outcome === "skipped") this.report.skipped += 1;
      else if (outcome === "expected" || outcome === "flaky") {
        this.report.passed += 1;
        if (outcome === "flaky") this.report.flaky += 1;
      } else {
        if (last?.status === "interrupted") this.report.cancelled += 1;
        else this.report.failed += 1;
        this.report.failures.push({
          name: test.titlePath().filter(Boolean).join(" › "),
          file: test.location.file,
          line: test.location.line,
          reason: messageReason(
            last?.errors?.[0]?.message ||
              `Ожидался статус ${test.expectedStatus}, получен ${last?.status || "тест не завершён"}`,
          ),
          details: last?.errors,
          artifacts: (last?.attachments || [])
            .filter((attachment) => attachment.path)
            .map(({ name, path }) => ({ name, path })),
        });
      }
    }
    if (
      result.status !== "passed" &&
      !this.report.failed &&
      !this.report.cancelled &&
      !this.report.errors.length
    )
      this.report.errors.push({ message: `Playwright завершился со статусом ${result.status}` });
    if (!this.outputFile) {
      this.directory = createReportDirectory(process.cwd(), "playwright-");
      this.outputFile = path.join(this.directory, "playwright.json");
    }
    let saved = false;
    try {
      fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
      fs.writeFileSync(this.outputFile, JSON.stringify(this.report, null, 2));
      saved = true;
    } catch (error) {
      this.report.errors.push({
        kind: "report-persistence",
        message: `Не удалось сохранить отчёт Playwright: ${line(error.message)}`,
      });
    }
    if (!this.external)
      console.log(
        formatReports([this.report], {
          root: this.root || process.cwd(),
          directory: saved ? this.directory : undefined,
          style: styleText,
        }),
      );
    if (this.report.errors.length) return { status: "failed" };
  }

  printsToStdio() {
    return true;
  }
}

module.exports = CompactPlaywrightReporter;
