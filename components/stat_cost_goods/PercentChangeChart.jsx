"use client";

import { useLayoutEffect, useRef } from "react";

export default function PercentChangeChart({ data, title = "График процентного изменения цены" }) {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current || !data?.length) return;

    let root;

    const loadChart = async () => {
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

        // Рассчитываем процент изменения относительно первой цены
        const firstPrice = parseFloat(sortedData[0]?.one_price || 0);
        const chartData = sortedData.map((item, index) => {
          const currentPrice = parseFloat(item.one_price);
          let percentChange = 0;

          if (index > 0) {
            percentChange = ((currentPrice - firstPrice) / firstPrice) * 100;
          }

          return {
            date: new Date(item.date_create).getTime(),
            percent_change: parseFloat(percentChange.toFixed(2)),
            original_price: currentPrice,
            name: item.name,
          };
        });

        // Создаем корневой элемент
        root = am5.Root.new(chartRef.current);
        root.locale = am5locales_ru_RU.default;
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

        // Создаем ось Y для процентов
        const percentAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {}),
            numberFormat: "#'%'",
            tooltip: am5.Tooltip.new(root, {}),
            extraTooltipPrecision: 2,
          }),
        );

        // Серия для процентного изменения
        const percentSeries = chart.series.push(
          am5xy.SmoothedXLineSeries.new(root, {
            name: "Изменение цены",
            xAxis: xAxis,
            yAxis: percentAxis,
            valueYField: "percent_change",
            valueXField: "date",
            stroke: am5.color(0xe74c3c),
            tension: 0.3,
            tooltip: am5.Tooltip.new(root, {
              labelText:
                "[bold]{name}[/]\nДата: {valueX.formatDate('dd.MM.yyyy')}\nИзменение: {valueY.formatNumber('#.00')}%\nЦена: {original_price} руб.",
            }),
          }),
        );

        // Настраиваем стиль линии
        percentSeries.strokes.template.setAll({
          strokeWidth: 3,
          stroke: am5.color(0xe74c3c),
        });

        // Добавляем точки данных
        percentSeries.bullets.push(() =>
          am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 5,
              fill: am5.color(0xe74c3c),
              strokeWidth: 2,
              stroke: root.interfaceColors.get("background"),
            }),
          }),
        );

        // Устанавливаем данные
        percentSeries.data.setAll(chartData);

        // Добавляем линию нулевого уровня
        const zeroSeries = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: "Базовый уровень",
            xAxis: xAxis,
            yAxis: percentAxis,
            valueYField: "zero",
            valueXField: "date",
            stroke: am5.color(0x7f8c8d),
            strokeDasharray: [5, 5],
          }),
        );

        // Данные для нулевой линии
        const zeroLineData = chartData.map((item) => ({
          date: item.date,
          zero: 0,
        }));
        zeroSeries.data.setAll(zeroLineData);

        // Добавляем курсор
        const cursor = chart.set(
          "cursor",
          am5xy.XYCursor.new(root, {
            behavior: "zoomX",
          }),
        );
        cursor.lineY.set("visible", false);
        cursor.snapToSeries = [percentSeries];

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
      } catch (error) {
        console.error("Ошибка загрузки amCharts:", error);
      }
    };

    loadChart();

    return () => {
      // Очищаем при размонтировании
      if (root) {
        root.dispose();
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
