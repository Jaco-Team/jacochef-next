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

const getYearsFromRange = (dateStart, dateEnd) => {
  const startYear = Number(String(dateStart ?? "").slice(0, 4));
  const endYear = Number(String(dateEnd ?? "").slice(0, 4));

  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) return null;

  const from = Math.min(startYear, endYear);
  const to = Math.max(startYear, endYear);
  const years = [];

  for (let year = from; year <= to; year++) {
    years.push(year);
  }

  return years;
};

const calculateMonthlyAverage = (groupedData, averageYears) => {
  const monthlySums = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);
  Object.entries(groupedData).forEach(([year, yearData]) => {
    if (averageYears?.length && !averageYears.includes(Number(year))) return;

    for (let month = 1; month <= 12; month++) {
      const value = yearData[month];
      if (value !== null && value !== undefined) {
        monthlySums[month - 1] += value;
        monthlyCounts[month - 1] += 1;
      }
    }
  });
  return monthlySums.map((sum, idx) => (monthlyCounts[idx] > 0 ? sum / monthlyCounts[idx] : null));
};

export default function StatSaleYearlyLineChart({ rawData, title, dateStart, dateEnd }) {
  const groupedData = groupByYear(rawData);
  const years = Object.keys(groupedData)
    .map(Number)
    .sort((a, b) => b - a);
  const averageYears = getYearsFromRange(dateStart, dateEnd);
  const averageValues = calculateMonthlyAverage(groupedData, averageYears);
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
      includedInAverage: !averageYears?.length || averageYears.includes(year),
      values: months.map((_, index) => groupedData[year]?.[index + 1] ?? null),
    })),
  ];

  return (
    <StatSaleMonthlyLineChart
      title={title}
      series={series}
      valueSuffix="шт"
    />
  );
}
