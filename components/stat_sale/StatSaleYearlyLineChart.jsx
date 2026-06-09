import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { Box, Typography } from "@mui/material";

const months = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];

// Цвета линий как на картинке
const yearColors = {
  2026: "#e53935", // красный
  2025: "#1e88e5", // синий
  2024: "#43a047", // зелёный
  2023: "#fdd835", // жёлтый
  2022: "#8e24aa", // фиолетовый
  2021: "#fb8c00", // оранжевый
};

// Группируем данные по годам
const groupByYear = (data) => {
  if (!data || Object.keys(data).length === 0) return {};

  const grouped = {};
  Object.keys(data).forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    if (!grouped[year]) grouped[year] = {};
    grouped[year][month] = data[key];
  });
  return grouped;
};

export default function StatSaleYearlyLineChart({ rawData, title }) {
  // Группируем данные из пропса
  const groupedData = groupByYear(rawData);

  // Формируем серии для графика
  const series = Object.keys(groupedData)
    .sort()
    .map((year) => ({
      data: months.map((_, index) => {
        const monthNum = index + 1;
        return groupedData[year][monthNum] ?? null;
      }),
      label: year.toString(),
      color: yearColors[year] || "#000",
      showMark: true,
      valueFormatter: (value) => (value !== null ? value.toLocaleString("ru-RU") : "—"),
    }));

  // Если нет данных, показываем сообщение
  if (series.length === 0) {
    return (
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3, textAlign: "center" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ textAlign: "center", mb: 3 }}
        >
          {title}
        </Typography>
        <Typography color="textSecondary">Нет данных для отображения</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "center", mb: 3 }}
      >
        {title}
      </Typography>

      <LineChart
        width={1100}
        height={500}
        series={series}
        xAxis={[
          {
            data: months,
            scaleType: "band",
            label: "",
            tickLabelStyle: {
              fontSize: 12,
              fontWeight: 600,
            },
          },
        ]}
        yAxis={[
          {
            min: 0,
            tickNumber: 6,
            tickLabelStyle: {
              fontSize: 11,
            },
          },
        ]}
        legend={{
          position: { vertical: "bottom", horizontal: "middle" },
          labelStyle: { fontSize: 13 },
        }}
        grid={{ horizontal: true, vertical: false }}
        sx={{
          "& .MuiChartsAxis-tickLabel": {
            fontSize: 12,
          },
        }}
      />
    </Box>
  );
}
