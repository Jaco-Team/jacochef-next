import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
// import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
// import am5locales_ru_RU from "@amcharts/amcharts5/locales/ru_RU";

export const PfWeeklyChart = () => {
  const { chartData, chartPfId: pfId } = usePfPlanStore();
  const ref = useRef(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(ref.current);
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
        focusable: true,
      }),
    );

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "week", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      }),
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    const createSeries = (name, color, field) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: field,
          valueXField: "week",
          stroke: color,
        }),
      );
      series.strokes.template.set("strokeWidth", 2);
      return series;
    };

    const formatPfData = (pfData) => {
      return Object.entries(pfData).map(([week, value]) => ({
        week: new Date(week),
        value,
      }));
    };

    const seriesLastYear = createSeries("Last year avg", am5.color(0xaaaaaa), "value");
    seriesLastYear.data.setAll(formatPfData(chartData.last_year_avg[pfId]));

    const seriesActual = createSeries("Actual", am5.color(0x008800), "value");
    seriesActual.data.setAll(formatPfData(chartData.this_year_actual[pfId]));

    Object.entries(chartData.forecasts).forEach(([model, weeks]) => {
      const s = createSeries(model, am5.color(Math.random() * 0xffffff), "value");
      s.data.setAll(
        formatPfData(
          Object.fromEntries(
            Object.entries(weeks).map(([week, pfMap]) => [week, pfMap[pfId]?.weekly_total ?? 0]),
          ),
        ),
      );
    });

    return () => root.dispose();
  }, [chartData]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "450px" }}
    />
  );
};
