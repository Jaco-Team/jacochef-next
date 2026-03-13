import React, { useEffect, useRef, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { IconButton, Box, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const RatingDynamicsChart = ({ data }) => {
  const chartRef = useRef(null);
  const rootRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("📊 Chart data received:", data);

    if (!data || data.length === 0) {
      console.warn("⚠️ No data for chart");
      return;
    }

    if (!chartRef.current) {
      console.error("❌ Chart ref is not available");
      return;
    }

    if (rootRef.current) {
      console.log("🗑️ Disposing previous chart");
      rootRef.current.dispose();
      rootRef.current = null;
    }

    try {
      setError(null);
      console.log("✅ Creating new chart...");

      const root = am5.Root.new(chartRef.current);
      rootRef.current = root;

      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          layout: root.verticalLayout,
        }),
      );

      const chartData = data
        .map((item) => {
          const dateStr = item[0];
          const values = item[1];

          const [year, month, day] = dateStr.split("-").map(Number);
          const date = new Date(year, month - 1, day);

          return {
            date: date.getTime(),
            count: values.count || 0,
            mediumRating: values.mediumRating || 0,
          };
        })
        .sort((a, b) => a.date - b.date);

      console.log("📊 Processed chart data:", chartData);

      // Создаем оси
      const xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          baseInterval: { timeUnit: "day", count: 1 },
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 50,
            minorGridEnabled: true,
          }),
          tooltipDateFormat: "yyyy-MM-dd",
        }),
      );

      xAxis.get("renderer").labels.template.setAll({
        rotation: -45,
        centerY: am5.p50,
        centerX: am5.p0,
        paddingTop: 10,
        paddingRight: 5,
        fontSize: 11,
      });

      // Левая ось Y (для рейтинга 1-5)
      const yAxisLeft = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 1,
          max: 5,
          strictMinMax: true,
          renderer: am5xy.AxisRendererY.new(root, {}),
          numberFormat: "#.0",
        }),
      );

      // Правая ось Y (для количества)
      const yAxisRight = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {
            opposite: true,
          }),
        }),
      );

      // СЕРИЯ ДЛЯ КОЛИЧЕСТВА (колонки)
      const columnSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Количество отзывов",
          xAxis: xAxis,
          yAxis: yAxisRight,
          valueYField: "count",
          valueXField: "date",
          fill: am5.color(0x9e9e9e),
          stroke: am5.color(0x9e9e9e),
          // ВАЖНО: tooltip настраивается через columns.template
        }),
      );

      columnSeries.columns.template.setAll({
        fillOpacity: 0.6,
        strokeWidth: 0,
        width: am5.percent(60),
        // ВАЖНО: используем tooltipText для колонок
        tooltipText:
          "[bold]{name}[/]\nДата: {valueX.formatDate('yyyy-MM-dd')}\nКоличество: {valueY}",
      });

      // СЕРИЯ ДЛЯ РЕЙТИНГА (линия)
      const lineSeries = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: "Средний рейтинг",
          xAxis: xAxis,
          yAxis: yAxisLeft,
          valueYField: "mediumRating",
          valueXField: "date",
          stroke: am5.color(0x2196f3),
          // ВАЖНО: tooltip настраивается напрямую для линии
          tooltip: am5.Tooltip.new(root, {
            labelText:
              "[bold]{name}[/]\nДата: {valueX.formatDate('yyyy-MM-dd')}\nРейтинг: {valueY}",
          }),
        }),
      );

      lineSeries.strokes.template.setAll({
        strokeWidth: 3,
      });

      // Добавляем точки на линию
      lineSeries.bullets.push(() => {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 5,
            fill: am5.color(0x2196f3),
            stroke: am5.color(0xffffff),
            strokeWidth: 2,
          }),
        });
      });

      // Устанавливаем данные
      columnSeries.data.setAll(chartData);
      lineSeries.data.setAll(chartData);

      // Добавляем курсор для активации тултипов
      chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "none",
          lineX: { visible: true },
          lineY: { visible: false },
        }),
      );

      // Легенда
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          layout: root.horizontalLayout,
        }),
      );

      legend.data.setAll(chart.series.values);

      // Анимация
      columnSeries.appear(1000);
      lineSeries.appear(1000);
      chart.appear(1000, 100);

      console.log("✅ Chart created successfully");
    } catch (err) {
      console.error("❌ Error creating chart:", err);
      setError(err.message);
    }

    return () => {
      if (rootRef.current) {
        console.log("🧹 Cleaning up chart");
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">Нет данных для отображения</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error">Ошибка: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          fontWeight="600"
        >
          Динамика оценок
        </Typography>
        <IconButton
          size="small"
          sx={{ ml: 0.5 }}
          title="Показывает изменение средней оценки по дням"
        >
          <InfoOutlined fontSize="small" />
        </IconButton>
      </Box>
      <div
        ref={chartRef}
        style={{ width: "100%", height: "400px" }}
      />
    </Box>
  );
};

export default RatingDynamicsChart;
