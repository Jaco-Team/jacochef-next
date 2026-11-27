const fs = require("fs");
const { inspect } = require("util");
const { emptyReport, reason } = require("./report.cjs");

module.exports = async function* nodeReporter(source) {
  const report = emptyReport("Node.js");
  for await (const event of source) {
    yield `${inspect(event, { depth: 12, colors: false, maxStringLength: Infinity })}\n`;
    const data = event.data;
    if (event.type === "test:fail" && !data.todo && !data.skip && data.details?.type !== "suite") {
      report.failures.push({
        name: data.name,
        file: data.file,
        line: data.line,
        reason: reason(data.details?.error),
      });
    }
    if (
      event.type === "test:fail" &&
      !data.todo &&
      data.details?.type === "suite" &&
      data.details.error?.failureType !== "subtestsFailed"
    ) {
      report.errors.push({
        message: `${data.name}: ${reason(data.details.error)}`,
        file: data.file,
        line: data.line,
      });
    }
    if (event.type === "test:summary" && !data.file) {
      Object.assign(report, {
        total: data.counts.tests,
        passed: data.counts.passed,
        failed: data.counts.failed,
        skipped: data.counts.skipped,
        cancelled: data.counts.cancelled,
        todo: data.counts.todo,
      });
    }
  }
  if (process.env.CHEF_TEST_REPORT_FILE)
    fs.writeFileSync(process.env.CHEF_TEST_REPORT_FILE, JSON.stringify(report, null, 2));
};
