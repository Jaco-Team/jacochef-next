"use client";

import { useLayoutEffect, useRef, useState } from "react";

export default function PriceChart({ data, title = "График цены за единицу" }) {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  useLayoutEffect(() => {
    if (!chartRef.current || !data?.length) return;

    const loadAndRenderChart = async () => {
      try {
        // Динамический импорт библиотек
        const am5 = await import("@amcharts/amcharts5");
        const am5xy = await import("@amcharts/amcharts5/xy");
        const am5themes_Animated = await import("@amcharts/amcharts5/themes/Animated");
        const am5locales_ru_RU = await import("@amcharts/amcharts5/locales/ru_RU");

        // Сортируем данные по дате
        const sortedData = [...data].sort(
          (a, b) => new Date(a.date_create) - new Date(b.date_create),
        );

        // Создаем корневой элемент
        const root = am5.Root.new(chartRef.current);

        // Устанавливаем русскую локаль
        root.locale = am5locales_ru_RU.default;

        // Применяем тему
        root.setThemes([am5themes_Animated.default.new(root)]);

        // Создаем контейнер для графика
        const chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panX: true,
            panY: false,
            wheelX: "panX",
            wheelY: "zoomX",
            pinchZoomX: true,
            layout: root.verticalLayout,
            paddingLeft: 0,
            paddingRight: 0,
          }),
        );

        // Создаем ось X (дата)
        const xAxis = chart.xAxes.push(
          am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: "day", count: 1 },
            renderer: am5xy.AxisRendererX.new(root, {
              minGridDistance: 30,
            }),
            tooltip: am5.Tooltip.new(root, {
              pointerOrientation: "horizontal",
            }),
          }),
        );

        // Настраиваем подсказку оси X
        xAxis.get("tooltip").label.setAll({
          text: "{value.formatDate('dd MMM yyyy')}",
        });

        // Создаем ось Y (цена)
        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {}),
            tooltip: am5.Tooltip.new(root, {}),
            extraTooltipPrecision: 2,
          }),
        );

        // Преобразуем данные для графика
        const processedChartData = sortedData.map((item) => ({
          date: new Date(item.date_create).getTime(),
          price: parseFloat(item.one_price),
          name: item.name,
          original_price: item.one_price,
        }));

        setChartData(processedChartData);

        // Создаем серию данных
        const series = chart.series.push(
          am5xy.SmoothedXLineSeries.new(root, {
            name: "Цена за единицу",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "price",
            valueXField: "date",
            stroke: am5.color(0x2c3e50),
            tension: 0.3,
            tooltip: am5.Tooltip.new(root, {
              labelText:
                "[bold]{name}[/]\nДата: {valueX.formatDate('dd.MM.yyyy')}\nЦена: {valueY.formatNumber('#.00')} руб.",
            }),
          }),
        );

        // Настраиваем стиль линии
        series.strokes.template.setAll({
          strokeWidth: 3,
          stroke: am5.color(0x2c3e50),
        });

        // Добавляем точки данных
        series.bullets.push(() =>
          am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 5,
              fill: am5.color(0x2c3e50),
              strokeWidth: 2,
              stroke: root.interfaceColors.get("background"),
            }),
          }),
        );

        // Устанавливаем данные
        series.data.setAll(processedChartData);

        // Добавляем курсор
        const cursor = chart.set(
          "cursor",
          am5xy.XYCursor.new(root, {
            behavior: "zoomX",
          }),
        );
        cursor.lineY.set("visible", false);

        // Добавляем легенду
        chart.children.push(
          am5.Legend.new(root, {
            centerX: am5.p50,
            x: am5.p50,
          }),
        );

        // Добавляем скроллбар
        chart.set(
          "scrollbarX",
          am5.Scrollbar.new(root, {
            orientation: "horizontal",
          }),
        );

        // Сохраняем ссылку на root для очистки
        chartRef.current.root = root;
      } catch (error) {
        console.error("Ошибка загрузки amCharts:", error);
      }
    };

    loadAndRenderChart();

    return () => {
      // Очищаем при размонтировании
      if (chartRef.current?.root) {
        chartRef.current.root.dispose();
      }
    };
  }, [data]);

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div
        ref={chartRef}
        style={{ width: "100%", height: 500 }}
      />
    </div>
  );
}
