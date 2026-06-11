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

const calculateMonthlyAverage = (groupedData) => {
  const monthlySums = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);
  Object.values(groupedData).forEach((yearData) => {
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

export default function StatSaleYearlyLineChart({ rawData, title }) {
  const groupedData = groupByYear(rawData);
  const years = Object.keys(groupedData)
    .map(Number)
    .sort((a, b) => b - a);
  const averageValues = calculateMonthlyAverage(groupedData);
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
