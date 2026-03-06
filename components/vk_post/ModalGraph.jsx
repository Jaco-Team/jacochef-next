// PostAnalyticsDialog.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const PostAnalyticsDialog = ({
  open,
  onClose,
  data,
  postId = "195376",
  title = "Аналитика поста",
}) => {
  const chartContainerRef = useRef(null);
  const rootRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("14д");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Синхронизируем внутреннее состояние с пропом open
  useEffect(() => {
    if (open) {
      setIsDialogOpen(true);
    }
  }, [open]);

  // Преобразование данных
  const transformData = (data) => {
    return data.map((item) => {
      const dateObj = new Date(item.day_begin);
      return {
        date: dateObj.getTime(),
        reach_total: item.reach_total,
        reach_subscribers: item.reach_subscribers,
        reach_viral: item.reach_total - item.reach_subscribers,
        reach_ads: 0,
        links: item.links,
        to_group: item.to_group,
        join_group: item.join_group,
        hide: item.hide,
        report: item.report,
        unsubscribe: item.unsubscribe,
        to_page: item.to_page,
      };
    });
  };

  const chartData = transformData(data);

  // Создание графика
  const createChart = () => {
    if (!chartContainerRef.current || !isDialogOpen) return;

    if (rootRef.current) {
      rootRef.current.dispose();
    }

    const root = am5.Root.new(chartContainerRef.current);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 0,
      }),
    );

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.3,
        groupData: true,
        baseInterval: { timeUnit: "day", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        }),
      }),
    );

    // Форматирование дат на оси X
    xAxis.get("renderer").labels.template.adapters.add("text", (text, target) => {
      const date = new Date(target.dataItem?.dataContext?.value);
      if (!isNaN(date.getTime())) {
        const day = date.getDate();
        const month = date.toLocaleString("ru", { month: "short" });
        return `${day} ${month}.`;
      }
      return text;
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    const makeSeries = (name, field, color) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: field,
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}: {valueY}",
          }),
        }),
      );

      series.strokes.template.setAll({
        strokeWidth: 2,
        stroke: am5.color(color),
      });

      series.fills.template.setAll({
        fillOpacity: 0.1,
        fill: am5.color(color),
      });

      series.bullets.push(() =>
        am5.Bullet.new(root, {
          locationY: 0,
          sprite: am5.Circle.new(root, {
            radius: 4,
            fill: am5.color(color),
          }),
        }),
      );

      series.data.setAll(chartData);
      series.appear(1000);
    };

    if (activeTab === 0) {
      makeSeries("Всего", "reach_total", 0x2196f3);
      makeSeries("Подписчики", "reach_subscribers", 0x4caf50);
      makeSeries("Виральный", "reach_viral", 0xff9800);
      makeSeries("Рекламный", "reach_ads", 0xf44336);
    } else {
      makeSeries("Ссылки", "links", 0x2196f3);
      makeSeries("В группу", "to_group", 0x4caf50);
      makeSeries("Вступили", "join_group", 0x9c27b0);
      makeSeries("Скрыли", "hide", 0xff9800);
      makeSeries("Жалобы", "report", 0xf44336);
      makeSeries("Отписки", "unsubscribe", 0x795548);
    }

    chart.appear(1000, 100);
  };

  // Инициализация графика ТОЛЬКО когда диалог открыт
  useEffect(() => {
    if (isDialogOpen) {
      // Небольшая задержка, чтобы Dialog успел отрендериться
      const timer = setTimeout(() => {
        createChart();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDialogOpen, activeTab, data]);

  // Очистка при закрытии
  useEffect(() => {
    if (!open && rootRef.current) {
      rootRef.current.dispose();
      rootRef.current = null;
      setIsDialogOpen(false);
    }
  }, [open]);

  // Перерисовка при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (rootRef.current && isDialogOpen) {
        rootRef.current.container.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDialogOpen]);

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: "#f4f6f8",
        },
      }}
    >
      {/* Заголовок */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          bgcolor: "#fff",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 600 }}
        >
          {title} #{postId}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            bgcolor: "rgba(0,0,0,0.06)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Контент */}
      <DialogContent sx={{ p: 3, bgcolor: "#f4f6f8" }}>
        {/* Период */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1, bgcolor: "#e0e0e0", p: 0.5, borderRadius: 1 }}>
            {["7д", "14д", "30д"].map((period) => (
              <Chip
                key={period}
                label={period}
                onClick={() => setSelectedPeriod(period)}
                size="small"
                sx={{
                  fontWeight: selectedPeriod === period ? 600 : 400,
                  bgcolor: selectedPeriod === period ? "#fff" : "transparent",
                  boxShadow: selectedPeriod === period ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  "&:hover": { bgcolor: "#fff" },
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Табы */}
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", mb: 3, bgcolor: "#fff", borderRadius: 1 }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
              },
            }}
          >
            <Tab
              label="Охваты"
              sx={{ width: "50%" }}
            />
            <Tab
              label="Действия"
              sx={{ width: "50%" }}
            />
          </Tabs>
        </Box>

        {/* График */}
        <Box
          ref={chartContainerRef}
          sx={{
            width: "100%",
            height: { xs: 300, sm: 400 },
            "& .am5-root": { width: "100% !important" },
          }}
        />

        {/* Легенда */}
        <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
          {activeTab === 0 ? (
            <>
              <LegendItem
                color="#2196F3"
                label="Всего"
              />
              <LegendItem
                color="#4CAF50"
                label="Подписчики"
              />
              <LegendItem
                color="#FF9800"
                label="Виральный"
              />
              <LegendItem
                color="#F44336"
                label="Рекламный"
              />
            </>
          ) : (
            <>
              <LegendItem
                color="#2196F3"
                label="Ссылки"
              />
              <LegendItem
                color="#4CAF50"
                label="В группу"
              />
              <LegendItem
                color="#9C27B0"
                label="Вступили"
              />
              <LegendItem
                color="#FF9800"
                label="Скрыли"
              />
              <LegendItem
                color="#F44336"
                label="Жалобы"
              />
              <LegendItem
                color="#795548"
                label="Отписки"
              />
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Вспомогательный компонент для легенды
const LegendItem = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Box sx={{ width: 10, height: 10, bgcolor: color, borderRadius: "50%" }} />
    <Typography
      variant="body2"
      sx={{ color: "#666" }}
    >
      {label}
    </Typography>
  </Box>
);

export default PostAnalyticsDialog;
