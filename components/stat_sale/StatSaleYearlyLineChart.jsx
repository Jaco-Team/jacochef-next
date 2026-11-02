"use client";

import StatSaleMonthlyLineChart from "@/components/stat_sale/StatSaleMonthlyLineChart";

const months = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
const yearColorPalette = [
  "#00acc1",
  "#1e88e5",
  "#43a047",
  "#fdd835",
  "#8e24aa",
  "#fb8c00",
  "#5c6bc0",
  "#00897b",
];
const averageSeriesName = "Среднее значение";
const averageColor = "#e53935";

const groupByYear = (data) => {
  if (!data || Object.keys(data).length === 0) return {};
  const grouped = {};
  Object.keys(data).forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    const value = Number(data[key]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(value)) return;
    if (!grouped[year]) grouped[year] = {};
    grouped[year][month] = value;
  });
  return grouped;
};

const toPeriodIndex = (year, month) => year * 12 + (month - 1);

const parsePeriod = (value) => {
  const match = String(value ?? "").match(/^(\d{4})-(\d{1,2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) return null;

  return { year, month };
};

const getSelectedRange = (dateStart, dateEnd) => {
  const start = parsePeriod(dateStart);
  const end = parsePeriod(dateEnd);
  if (!start || !end) return null;

  const startIndex = toPeriodIndex(start.year, start.month);
  const endIndex = toPeriodIndex(end.year, end.month);

  return {
    from: Math.min(startIndex, endIndex),
    to: Math.max(startIndex, endIndex),
  };
};

const isMonthSelected = (year, month, range) => {
  if (!range) return true;
  const index = toPeriodIndex(year, month);
  return index >= range.from && index <= range.to;
};

const yearIntersectsRange = (year, range) => {
  if (!range) return true;
  return months.some((_, index) => isMonthSelected(year, index + 1, range));
};

const calculateMonthlyAverage = (groupedData, range) => {
  const monthlySums = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);
  Object.entries(groupedData).forEach(([year, yearData]) => {
    const numericYear = Number(year);
    if (!yearIntersectsRange(numericYear, range)) return;

    for (let month = 1; month <= 12; month++) {
      if (!isMonthSelected(numericYear, month, range)) continue;
      const value = yearData[month];
      if (value !== null && value !== undefined) {
        monthlySums[month - 1] += value;
        monthlyCounts[month - 1] += 1;
      }
    }
  });
  return monthlySums.map((sum, idx) => (monthlyCounts[idx] > 0 ? sum / monthlyCounts[idx] : null));
};

export default function StatSaleYearlyLineChart({
  rawData,
  title,
  dateStart,
  dateEnd,
  collapsible = false,
  defaultExpanded = true,
  resetKey,
}) {
  const groupedData = groupByYear(rawData);
  const selectedRange = getSelectedRange(dateStart, dateEnd);
  const years = Object.keys(groupedData)
    .map(Number)
    .filter((year) => yearIntersectsRange(year, selectedRange))
    .sort((a, b) => b - a);
  const averageValues = calculateMonthlyAverage(groupedData, selectedRange);
  const series = [
    ...(averageValues.some((value) => value !== null)
      ? [
          {
            name: averageSeriesName,
            color: averageColor,
            isMain: true,
            values: averageValues,
          },
        ]
      : []),
    ...years.map((year, index) => ({
      name: year.toString(),
      color: yearColorPalette[index % yearColorPalette.length],
      includedInAverage: true,
      values: months.map((_, monthIndex) => {
        const month = monthIndex + 1;
        if (!isMonthSelected(year, month, selectedRange)) return null;
        return groupedData[year]?.[month] ?? null;
      }),
    })),
  ];

  return (
    <StatSaleMonthlyLineChart
      title={title}
      series={series}
      valueSuffix="шт"
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
      resetKey={resetKey}
    />
  );
}
