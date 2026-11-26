/**
 * Rate anomaly detection for the "Метрики сайта" screens.
 *
 * API CONTRACT (new optional field, backend does not provide it yet; demo data is used meanwhile)
 *
 * Auth screen response:
 *   daily_rates: Array<{
 *     date: "YYYY-MM-DD",
 *     label: "DD.MM",
 *     attempts: number, // all auth attempts that day
 *     success: number,  // successful attempts that day
 *   }>
 *
 * Payments screen response:
 *   daily_rates: Array<{
 *     date: "YYYY-MM-DD",
 *     label: "DD.MM",
 *     started: number, // payments started that day (same meaning as `started` in `methods`)
 *     paid: number,    // paid that day (same meaning as `paid` in `methods`)
 *   }>
 *
 * Points are ordered by date ascending, one per day of the selected period/filters.
 * The client computes rates itself, as percent numbers 0..100 (same convention as formatPercent):
 *   auth:     rate = success / attempts * 100
 *   payments: rate = paid / started * 100
 * If `daily_rates` is missing or empty, the anomaly block renders nothing.
 *
 * ANOMALY LOGIC
 *  - baseline for day i = weighted rate (sum(success) / sum(total) * 100) over the previous
 *    up-to-BASELINE_WINDOW days (day i excluded); requires at least BASELINE_MIN_DAYS previous
 *    days with total > 0, otherwise there is no baseline and the day is never flagged;
 *  - day rate is null when total is 0;
 *  - days with total < MIN_DAY_TOTAL are plotted but never flagged (too noisy);
 *  - drop = baseline - rate (percentage points); flagged when drop >= DROP_WARNING,
 *    severity "danger" when drop >= DROP_DANGER, otherwise "warning".
 */

export const BASELINE_WINDOW = 7;
export const BASELINE_MIN_DAYS = 3;
export const MIN_DAY_TOTAL = 30;
export const DROP_WARNING = 5;
export const DROP_DANGER = 10;

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function computeRateAnomalies(points, totalKey, successKey) {
  const list = Array.isArray(points) ? points : [];
  const normalized = list.map((point) => ({
    date: point?.date,
    label: point?.label,
    total: toNumber(point?.[totalKey]),
    success: toNumber(point?.[successKey]),
  }));

  return normalized.map((point, index) => {
    const rate = point.total > 0 ? (point.success / point.total) * 100 : null;

    const previous = normalized
      .slice(Math.max(0, index - BASELINE_WINDOW), index)
      .filter((item) => item.total > 0);

    let baseline = null;
    if (previous.length >= BASELINE_MIN_DAYS) {
      const totalSum = previous.reduce((sum, item) => sum + item.total, 0);
      const successSum = previous.reduce((sum, item) => sum + item.success, 0);
      baseline = (successSum / totalSum) * 100;
    }

    const drop = rate !== null && baseline !== null ? baseline - rate : null;

    let severity = null;
    if (drop !== null && point.total >= MIN_DAY_TOTAL && drop >= DROP_WARNING) {
      severity = drop >= DROP_DANGER ? "danger" : "warning";
    }

    return { ...point, rate, baseline, drop, severity };
  });
}
