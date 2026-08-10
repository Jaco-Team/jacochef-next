"use client";

import StatSaleMonthlyLineChart from "@/components/stat_sale/StatSaleMonthlyLineChart";

const months = new Array(12).fill(null);
const yearColorPalette = ["#1976d2", "#43a047", "#8e24aa", "#fb8c00", "#00897b"];

const toChartValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function StatSalePlanFactLineChart({ data, title, resetKey }) {
  const groupedByYear = data.reduce((acc, item) => {
    const year = Number(item.year);
    const month = Number(item.monthNumber);
    if (!Number.isFinite(year) || month < 1 || month > 12) return acc;

    if (!acc[year]) {
      acc[year] = {
        plan: [...months],
        fact: [...months],
      };
    }

    acc[year].plan[month - 1] = toChartValue(item.planQty);
    acc[year].fact[month - 1] = toChartValue(item.factQty);
    return acc;
  }, {});
  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => a - b);
  const singleYear = years.length === 1;
  const series = years.flatMap((year, index) => {
    const color = yearColorPalette[index % yearColorPalette.length];
    const yearSuffix = singleYear ? "" : ` ${year}`;

    return [
      {
        name: `План${yearSuffix}`,
        color,
        strokeDasharray: [8, 5],
        values: groupedByYear[year].plan,
      },
      {
        name: `Факт${yearSuffix}`,
        color,
        values: groupedByYear[year].fact,
      },
    ];
  });

  return (
    <StatSaleMonthlyLineChart
      title={title}
      series={series}
      valueSuffix="шт"
      collapsible
      defaultExpanded={false}
      resetKey={resetKey}
    />
  );
}
