"use client";

import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5locales_ru_RU from "@amcharts/amcharts5/locales/ru_RU";
import usePfPlanStore from "./usePfPlanStore";

const PfWeeklyChart = () => {
  const { chartData, chartPfId: pfId, allPfs } = usePfPlanStore();
  const ref = useRef(null);
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartData || !pfId) return;

    const pfBlock = chartData.find((x) => +x.pf_id === +pfId);
    if (!pfBlock) return;

    // const pf = allPfs?.find((p) => +p.id === +pfId);
    // const pfName = pf?.name ?? `PF ${pfId}`;

    if (rootRef.current) rootRef.current.dispose();
    const root = am5.Root.new(ref.current);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);
    root.locale = am5locales_ru_RU;

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
        wheelY: "zoomXY",
        pinchZoom: true,
      }),
    );

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
      }),
    );

    legend.markers.template.setAll({
      width: 14,
      height: 14,
      cornerRadius: 7,
    });

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

    chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));

    const createSeries = (name, color) => {
      const s = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: "value",
          valueXField: "week",
          stroke: color,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{name}: [bold]{valueY}[/]",
            getFillFromSprite: false,
            getStrokeFromSprite: false,
          }),
        }),
      );

      s.strokes.template.setAll({
        strokeWidth: 2,
        stroke: color,
      });

      // --- color tooltip box SAME as the line ---
      const tt = s.get("tooltip");
      tt.get("background").setAll({
        fill: color,
        stroke: color,
        fillOpacity: 0.9,
      });
      tt.label.setAll({
        fill: am5.color(0xffffff),
      });

      s.bullets.push(() =>
        am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 3,
            fill: color,
            stroke: color,
          }),
        }),
      );

      legend.data.push(s);
      return s;
    };

    const format = (obj) =>
      Object.entries(obj || {})
        .map(([week, value]) => ({
          week: new Date(week).getTime(),
          value,
        }))
        .sort((a, b) => a.week - b.week);

    const cLastYear = am5.color(0x555555);
    const cActual = am5.color(0xd32f2f);

    createSeries("Предыдущий год", cLastYear).data.setAll(format(pfBlock.last_year_avg));
    createSeries("Текущий год", cActual).data.setAll(format(pfBlock.actual));

    const modelColors = {
      MA: am5.color(0x7da9ff),
      SA: am5.color(0xffb480),
      YY: am5.color(0xdca6ff),
      MAG: am5.color(0xcce39b),
    };

    Object.entries(pfBlock.forecasts).forEach(([model, data]) => {
      const color = modelColors[model] ?? am5.color(0x999999);
      createSeries(model, color).data.setAll(format(data));
    });

    return () => root.dispose();
  }, [chartData, pfId]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "500px" }}
    />
  );
};

export default PfWeeklyChart;
