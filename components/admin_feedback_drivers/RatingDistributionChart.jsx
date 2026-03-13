import React, { useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { IconButton, Box, Typography } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const RatingDistributionChart = ({ data }) => {
  const chartRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) {
      return;
    }

    if (rootRef.current) {
      rootRef.current.dispose();
    }

    try {
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
          const starMatch = item[0].match(/(\d+)star/);
          const stars = starMatch ? parseInt(starMatch[1], 10) : 0;
          return {
            stars,
            category: `${stars} ★`,
            count: item[1]?.count || 0,
          };
        })
        .sort((a, b) => a.stars - b.stars);

      const totalCount = chartData.reduce((sum, item) => sum + item.count, 0);

      const getColorForStars = (stars) => {
        switch (stars) {
          case 1:
            return am5.color(0xe53935);
          case 2:
            return am5.color(0xff6b6b);
          case 3:
            return am5.color(0xffb300);
          case 4:
            return am5.color(0x66bb6a);
          case 5:
            return am5.color(0x43a047);
          default:
            return am5.color(0x9e9e9e);
        }
      };

      // Создаем ось X
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "category",
          renderer: am5xy.AxisRendererX.new(root, {
            cellStartLocation: 0.1,
            cellEndLocation: 0.9,
          }),
        }),
      );

      xAxis.get("renderer").labels.template.setAll({
        fontSize: 14,
        fontWeight: "500",
      });

      // Создаем ось Y
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererY.new(root, {}),
        }),
      );

      // ВАЖНО: Создаем серию и сразу настраиваем тултип через set()
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Количество",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "count",
          categoryXField: "category",
        }),
      );

      // Настраиваем столбцы
      series.columns.template.setAll({
        fillOpacity: 0.9,
        strokeWidth: 0,
        width: am5.percent(70),
        cornerRadiusTL: 6,
        cornerRadiusTR: 6,
        tooltipText: "[bold]{categoryX}[/]\nОтзывов: {valueY}\n",
      });

      // Настраиваем цвета
      series.columns.template.adapters.add("fill", (fill, target) => {
        const dataItem = target.dataItem;
        if (dataItem?.dataContext) {
          return getColorForStars(dataItem.dataContext.stars);
        }
        return fill;
      });

      // Устанавливаем данные
      xAxis.data.setAll(chartData);
      series.data.setAll(chartData);

      // Добавляем курсор для активации тултипов
      chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "none",
          lineY: { visible: false },
        }),
      );

      // Анимация
      series.appear(1000);
    } catch (error) {
      console.error("Error creating chart:", error);
    }

    return () => {
      if (rootRef.current) {
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
          minHeight: "350px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">Нет данных для отображения</Typography>
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
          Распределение оценок
        </Typography>
        <IconButton
          size="small"
          sx={{ ml: 0.5 }}
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

export default RatingDistributionChart;
