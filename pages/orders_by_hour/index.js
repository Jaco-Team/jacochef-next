import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import { formatDate } from "@/src/helpers/ui/formatDate";
import dayjs from "dayjs";
import { Button, Paper, Tabs, Tab, Box, Typography } from "@mui/material";
import { IconButton, TextField, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ExcelIcon from "@/ui/ExcelIcon";
import axios from "axios";
import ColorPickerWithPalette from "@/ui/Forms/ColorPickerWithPalette";

const DetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <Paper
        sx={{
          p: 3,
          minWidth: 300,
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontWeight: "bold" }}
          >
            Детальная информация
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
          >
            {data.type === "hour" ? "Почасовые данные" : "Итоговые данные"}
          </Typography>

          {data.type === "hour" ? (
            <>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Время:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}
                >
                  {data.hour}:00
                </Typography>
              </Box>
              {data.date != "Invalid Date" ? (
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Дата:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500 }}
                  >
                    {data.date}
                  </Typography>
                </Box>
              ) : null}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Показатель:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}
                >
                  {data.metricName}
                </Typography>
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Текущий период:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "#2e7d32" }}
                >
                  {data.currentValue}
                </Typography>
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Прошлый период:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "#d32f2f" }}
                >
                  {data.prevValue}
                </Typography>
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Изменение:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: data.delta > 0 ? "#2e7d32" : data.delta < 0 ? "#d32f2f" : "#666",
                  }}
                >
                  {data.delta > 0 ? `+${data.delta}` : data.delta} (
                  {data.percent > 0 ? `+${data.percent}%` : `${data.percent}%`})
                </Typography>
              </Box>
            </>
          ) : (
            <>
              {data.date != "Invalid Date" ? (
                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Дата:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500 }}
                  >
                    {data.date}
                  </Typography>
                </Box>
              ) : null}
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Показатель:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}
                >
                  {data.metricName}
                </Typography>
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Итого за день:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: "#2e7d32" }}
                >
                  {data.totalValue}
                </Typography>
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Изменение:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: data.delta > 0 ? "#2e7d32" : data.delta < 0 ? "#d32f2f" : "#666",
                  }}
                >
                  {data.delta > 0 ? `+${data.delta}` : data.delta} (
                  {data.percent > 0 ? `+${data.percent}%` : `${data.percent}%`})
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={onClose}
          fullWidth
          sx={{ mt: 1 }}
        >
          Закрыть
        </Button>
      </Paper>
    </Box>
  );
};

const HeatmapCell = ({ value, hourData, metricKey, settings, onClick, metrickId, tabValue }) => {
  const settingsObj = settings.reduce((acc, item) => ({ ...acc, [item.percent]: item.color }), {});

  const getMetricName = () => {
    const isReady = metrickId === 2;
    switch (tabValue) {
      case 0:
        return isReady ? "Завершенные заказы" : "Оформленные заказы";
      case 1:
        return isReady ? "Готовые роллы" : "Роллы";
      case 2:
        return isReady ? "Готовая пицца" : "Пицца";
      default:
        return isReady ? "Завершенные заказы" : "Оформленные заказы";
    }
  };

  const getCellColor = (val) => {
    const percentages = Object.keys(settingsObj)
      .map(Number)
      .sort((a, b) => a - b);
    if (!percentages.length) return "#81c784";
    if (val <= percentages[0]) return settingsObj[percentages[0]];
    if (val >= percentages[percentages.length - 1])
      return settingsObj[percentages[percentages.length - 1]];
    if (val < 0) {
      const found = percentages.filter((p) => p <= val).pop();
      return settingsObj[found] ?? "#81c784";
    } else {
      const found = percentages.find((p) => p >= val);
      return settingsObj[found] ?? "#81c784";
    }
  };

  const getTextColor = (val) => {
    if (val === 0 || val === null || val === undefined) return "#666";
    return Math.abs(val) > 20 ? "#fff" : "#000";
  };

  const percentValue = value || 0;
  const metricName = getMetricName();

  let deltaValue = 0;
  if (hourData) {
    const deltaMap = {
      count_orders_percent: "count_orders_delta",
      count_rolls_percent: "count_rolls_delta",
      count_pizza_percent: "count_pizza_delta",
      ready_orders_percent: "ready_orders_delta",
      ready_rolls_percent: "ready_rolls_delta",
      ready_pizza_percent: "ready_pizza_delta",
    };
    deltaValue = hourData[deltaMap[metricKey]] || 0;
  }

  const displayValue =
    deltaValue !== 0 ? (deltaValue > 0 ? `+${deltaValue}` : `${deltaValue}`) : "0";

  const handleClick = (e) => {
    e.stopPropagation();
    if (!onClick || !hourData) return;

    const valueMap = {
      count_orders_percent: { cur: "count_orders", prev: "count_orders_prev" },
      count_rolls_percent: { cur: "count_rolls", prev: "count_rolls_prev" },
      count_pizza_percent: { cur: "count_pizza", prev: "count_pizza_prev" },
      ready_orders_percent: { cur: "ready_orders", prev: "ready_orders_prev" },
      ready_rolls_percent: { cur: "ready_rolls", prev: "ready_rolls_prev" },
      ready_pizza_percent: { cur: "ready_pizza", prev: "ready_pizza_prev" },
    };

    const fields = valueMap[metricKey] || { cur: "count_orders", prev: "count_orders_prev" };
    const currentValue = hourData[fields.cur] || 0;
    const prevValue = hourData[fields.prev] || 0;

    onClick({
      type: "hour",
      hour: hourData.hour,
      date: hourData.date,
      metricName,
      currentValue,
      prevValue,
      delta: deltaValue,
      percent: percentValue,
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: getCellColor(percentValue),
        color: getTextColor(percentValue),
        padding: "8px 4px",
        textAlign: "center",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: deltaValue === 0 ? "normal" : "600",
        minHeight: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 10,
        },
      }}
      title={`${metricName}: ${displayValue} (${percentValue > 0 ? `+${percentValue}%` : `${percentValue}%`})`}
      onClick={handleClick}
    >
      {displayValue}
    </Box>
  );
};

const TotalCell = ({ value, delta, settings, onClick, date, metricName }) => {
  const settingsObj = settings.reduce((acc, item) => ({ ...acc, [item.percent]: item.color }), {});

  const getCellColor = (val) => {
    const percentages = Object.keys(settingsObj)
      .map(Number)
      .sort((a, b) => a - b);
    if (val <= percentages[0]) return settingsObj[percentages[0]];
    if (val >= percentages[percentages.length - 1])
      return settingsObj[percentages[percentages.length - 1]];
    if (val < 0) {
      const found = percentages.filter((p) => p <= val).pop();
      return settingsObj[found] ?? "#81c784";
    } else {
      const found = percentages.find((p) => p >= val);
      return settingsObj[found] ?? "#81c784";
    }
  };

  const getTextColor = (val) => {
    if (val === 0 || val === null || val === undefined) return "#666";
    return Math.abs(val) > 20 ? "#fff" : "#000";
  };

  const displayValue = delta !== 0 ? (delta > 0 ? `+${delta}` : `${delta}`) : "0";

  const handleClick = () => {
    if (onClick) {
      onClick({
        type: "total",
        date,
        metricName: metricName || "Показатель",
        totalValue: displayValue,
        delta,
        percent: value,
      });
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: getCellColor(value),
        color: getTextColor(value),
        padding: "8px 4px",
        textAlign: "center",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: delta === 0 ? "normal" : "600",
        minHeight: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 10,
        },
      }}
      title={`Итого: ${displayValue} (${value > 0 ? `+${value}%` : `${value}%`})`}
      onClick={handleClick}
    >
      {displayValue}
    </Box>
  );
};

const CafeHeatmapTable = ({
  cafeName,
  data,
  metricKey,
  settings,
  dateStart,
  metrickId,
  tabValue,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 10).padStart(2, "0"));
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const weekDates = Object.keys(data).sort((a, b) => days.indexOf(a) - days.indexOf(b));

  const getDayName = (dateStr) => {
    const dayIndex = dayjs(dateStr).day();
    return dayIndex === 0 ? days[6] : days[dayIndex - 1];
  };

  const getMetricDelta = (hourData, key) => {
    if (!hourData) return 0;
    const deltaMap = {
      count_orders_percent: "count_orders_delta",
      count_rolls_percent: "count_rolls_delta",
      count_pizza_percent: "count_pizza_delta",
      ready_orders_percent: "ready_orders_delta",
      ready_rolls_percent: "ready_rolls_delta",
      ready_pizza_percent: "ready_pizza_delta",
    };
    return hourData[deltaMap[key]] ?? 0;
  };

  const getTotalsDeltaKey = (metricKey) => {
    const map = {
      count_orders_percent: "sv_o_delta",
      ready_orders_percent: "sv_o_delta",
      count_rolls_percent: "sv_r_delta",
      ready_rolls_percent: "sv_r_delta",
      count_pizza_percent: "sv_p_delta",
      ready_pizza_percent: "sv_p_delta",
    };
    return map[metricKey] || "sv_o_delta";
  };

  const formatDate = (dateStr) => dayjs(dateStr).format("DD.MM");
  const getMetricValue = (hourData, key) => hourData?.[key] ?? 0;
  const findHourData = (hoursArray, hourValue) =>
    hoursArray?.find((h) => h.hour === hourValue) || null;

  const getTotalsKey = (metricKey) => {
    const map = {
      count_orders_percent: "sv_o_percent",
      ready_orders_percent: "sv_o_percent",
      count_rolls_percent: "sv_r_percent",
      ready_rolls_percent: "sv_r_percent",
      count_pizza_percent: "sv_p_percent",
      ready_pizza_percent: "sv_p_percent",
    };
    return map[metricKey] || "sv_o_percent";
  };

  const getMetricName = () => {
    const isReady = metrickId === 2;
    switch (tabValue) {
      case 0:
        return isReady ? "Завершенные заказы" : "Оформленные заказы";
      case 1:
        return isReady ? "Готовые роллы" : "Роллы";
      case 2:
        return isReady ? "Готовая пицца" : "Пицца";
      default:
        return isReady ? "Завершенные заказы" : "Оформленные заказы";
    }
  };

  const handleCellClick = (data) => {
    setModalData(data);
    setModalOpen(true);
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          {cafeName}
        </Typography>
        <Typography>Нет данных</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "600",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#fff",
                    zIndex: 2,
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  Час
                </th>
                {weekDates.map((date) => (
                  <th
                    key={date}
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "600",
                      minWidth: "70px",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    <div>{getDayName(date) ?? date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hourStr, hourIdx) => {
                const displayHour = parseInt(hourStr, 10);
                return (
                  <tr key={hourIdx}>
                    <td
                      style={{
                        padding: "4px 8px",
                        fontWeight: "500",
                        fontSize: "14px",
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                        borderRight: "1px solid #eee",
                      }}
                    >
                      {`${displayHour}:00`}
                    </td>
                    {weekDates.map((dateKey) => {
                      const dayData = data[dateKey];
                      const hourData = dayData?.hours ? findHourData(dayData.hours, hourStr) : null;
                      const percentValue = hourData ? getMetricValue(hourData, metricKey) : 0;
                      const deltaValue = hourData ? getMetricDelta(hourData, metricKey) : 0;

                      let enhancedHourData = null;
                      if (hourData) {
                        enhancedHourData = {
                          ...hourData,
                          date: formatDate(dateKey),
                          hour: displayHour,
                        };
                      }

                      return (
                        <td
                          key={`${dateKey}-${hourStr}`}
                          style={{ padding: "2px" }}
                        >
                          <HeatmapCell
                            value={percentValue}
                            hourData={enhancedHourData}
                            metricKey={metricKey}
                            settings={settings}
                            onClick={handleCellClick}
                            metrickId={metrickId}
                            tabValue={tabValue}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td
                  style={{
                    padding: "8px",
                    fontWeight: "bold",
                    borderTop: "2px solid #ddd",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#fff",
                    zIndex: 1,
                  }}
                >
                  Итого
                </td>
                {weekDates.map((dateKey) => {
                  const totalsKey = getTotalsKey(metricKey);
                  const percentTotal = data[dateKey]?.totals?.[totalsKey] ?? 0;
                  const deltaTotal = data[dateKey]?.totals?.[getTotalsDeltaKey(metricKey)] ?? 0;
                  return (
                    <td
                      key={`total-${dateKey}`}
                      style={{ padding: "2px", borderTop: "2px solid #ddd" }}
                    >
                      <TotalCell
                        value={percentTotal}
                        delta={deltaTotal}
                        settings={settings}
                        onClick={handleCellClick}
                        date={formatDate(dateKey)}
                        metricName={getMetricName()}
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </Box>
      </Paper>
      <DetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
      />
    </>
  );
};

function OrdersPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [point, setPoint] = useState([]);
  const [points, setPoints] = useState([]);
  const [metrick, setMetrick] = useState({ id: 1, name: "Оформленные заказы" });
  const [type, setType] = useState({ id: 1, name: "По номеру недели" });
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [tableData, setTableData] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState([]);
  const [changes, setChanges] = useState(false);
  const [timeDiv, setTimeDiv] = useState("");
  const [acces, setAcces] = useState({});

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setPoints(data.points);
      setSettings(data.settings);
      setAcces(data.access);
    });
  }, []);

  const update = () => {
    getData("get_all").then((data) => setSettings(data.settings));
  };

  const exportExcel = async () => {
    try {
      const url = "https://apichef.jacochef.ru/api/orders_by_hour/exportExcel";
      const response = await axios.post(
        url,
        JSON.stringify({
          method: "exportExcel",
          module: "orders_by_hour",
          version: 2,
          login: localStorage.getItem("token"),
          data: {
            differences: tableData,
            date_start:
              type.id === 1
                ? dayjs(dateStart).startOf("week").format("YYYY-MM-DD")
                : dayjs(dateStart).format("YYYY-MM-DD"),
            date_end:
              type.id === 1
                ? dayjs(dateStart).endOf("week").format("YYYY-MM-DD")
                : dayjs(dateEnd).format("YYYY-MM-DD"),
          },
        }),
        { responseType: "blob", headers: { "Content-Type": "application/json" } },
      );
      const blob = response.data;
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = `statistics_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка экспорта");
    }
  };

  const handleColorChange = (id, color) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, color } : s)));
    setChanges(true);
  };
  const handlePercentChange = (id, percent) => {
    if (percent < -100 || percent > 100) return;
    setSettings(settings.map((s) => (s.id === id ? { ...s, percent } : s)));
    setChanges(true);
  };
  const handleDelete = (id) => {
    setSettings(settings.filter((s) => s.id !== id));
    setChanges(true);
  };
  const handleAddPoint = () => {
    const newId = settings.length > 0 ? Math.max(...settings.map((s) => s.id)) + 1 : 1;
    setSettings([
      ...settings,
      {
        id: newId,
        percent: 0,
        color: "#000000",
        date_create: new Date().toISOString().slice(0, 19).replace("T", " "),
      },
    ]);
  };

  const getOrders = () => {
    const data = {
      start_date: dayjs(dateStart).format("YYYY-MM-DD"),
      end_date: dayjs(dateEnd).format("YYYY-MM-DD"),
      type,
      metrick,
      point_list: point,
    };
    getData("get_data", data).then((data) => {
      setTableData(data.differences);
      setTimeDiv(data.timeVs);
    });
  };

  const saveSettings = () => {
    getData("save_settings", { settings }).then(() => {
      setChanges(false);
      update();
    });
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);
    try {
      const result = await api_laravel("orders_by_hour", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const getMetricKey = () => {
    const isReady = metrick.id === 2;
    switch (tabValue) {
      case 0:
        return "count_orders_percent";
      case 1:
        return isReady ? "ready_rolls_percent" : "count_rolls_percent";
      case 2:
        return isReady ? "ready_pizza_percent" : "count_pizza_percent";
      default:
        return "count_orders_percent";
    }
  };

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", paddingBottom: "40px" }}>
      <Grid
        container
        spacing={3}
        sx={{ paddingTop: "86px", paddingLeft: "18px", paddingRight: "18px", mb: 3 }}
      >
        <Backdrop
          style={{ zIndex: 99 }}
          open={isLoad}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid size={{ xs: 12, sm: 12 }}>
          <h1>{module.name}</h1>
        </Grid>
        <Grid
          container
          sx={{ mb: 2 }}
        >
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ backgroundColor: "#f5f5f5", borderRadius: "16px 16px 0 0" }}>
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
              >
                <Tab label="Данные" />
                <Tab label="Настройки" />
              </Tabs>
            </Paper>
          </Grid>
          {tab === 0 && (
            <>
              <Grid size={{ xs: 12, sm: 3 }}>
                <CityCafeAutocomplete2
                  label="Кафе"
                  points={points}
                  value={point}
                  onChange={(v) => setPoint(v)}
                  withAll
                  withAllSelected
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <MyDatePickerNew
                  label="Дата от"
                  value={dateStart}
                  func={(e) => setDateStart(formatDate(e))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <MyDatePickerNew
                  label="Дата до"
                  value={dateEnd}
                  func={(e) => setDateEnd(formatDate(e))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <MyAutocomplite
                  label="Данные"
                  data={[
                    { id: 1, name: "По номеру недели" },
                    { id: 2, name: "Чистые даты" },
                  ]}
                  multiple={false}
                  value={type}
                  func={(event, data) => setType(data)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <MyAutocomplite
                  label="Метрика"
                  data={[
                    { id: 1, name: "Оформленные заказы" },
                    { id: 2, name: "Завершенные заказы" },
                  ]}
                  multiple={false}
                  value={metrick}
                  func={(event, data) => setMetrick(data)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button
                  onClick={() => getOrders()}
                  variant="contained"
                  fullWidth
                >
                  Обновить
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }}>
                {acces?.export_excel_access && (
                  <Button
                    onClick={() => exportExcel()}
                    variant="contained"
                    style={{ backgroundColor: "#1E5945" }}
                  >
                    <ExcelIcon /> .xlsx
                  </Button>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                <Typography>{timeDiv}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      <Paper
        style={{
          display: tab === 0 ? "block" : "none",
          padding: "20px",
          margin: "18px",
          backgroundColor: "#f3f3f3",
        }}
      >
        <Grid
          container
          sx={{ px: 2, mb: 2 }}
        >
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ backgroundColor: "#f5f5f5", borderRadius: "16px 16px 0 0" }}>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
              >
                <Tab label="По заказам" />
                <Tab label="Роллы" />
                <Tab label="Пицца" />
              </Tabs>
            </Paper>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={3}
          sx={{ px: 2 }}
        >
          {Object.keys(tableData).length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  color: "text.secondary",
                  backgroundColor: "#f3f3f3",
                }}
              >
                Выберите кафе и дату, затем нажмите "Обновить"
              </Paper>
            </Grid>
          ) : (
            Object.entries(tableData).map(([cafeName, cafeData]) => (
              <Grid
                key={cafeName}
                size={{ xs: 12 }}
              >
                <CafeHeatmapTable
                  dateStart={dayjs(dateStart).format("YYYY-MM-DD")}
                  cafeName={cafeName}
                  data={cafeData}
                  settings={settings}
                  metricKey={getMetricKey()}
                  metrickId={metrick.id}
                  tabValue={tabValue}
                />
              </Grid>
            ))
          )}
        </Grid>

        <Grid
          container
          sx={{ px: 2, mt: 2 }}
        >
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, backgroundColor: "#f3f3f3" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2">−100%</Typography>
                <Box
                  sx={{
                    width: "200px",
                    height: "20px",
                    background: "linear-gradient(to right, #d32f2f, #ffcdd2, #c8e6c9, #388e3c)",
                    borderRadius: "4px",
                  }}
                />
                <Typography variant="body2">+100%</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        style={{
          display: tab === 1 ? "block" : "none",
          padding: "20px",
          margin: "18px",
          backgroundColor: "#f3f3f3",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 3 }}
        >
          Градиентная шкала
        </Typography>
        <Box sx={{ mb: 3 }}>
          {settings
            .sort((a, b) => a.percent - b.percent)
            .map((setting) => (
              <Box
                key={setting.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  p: 1.5,
                  backgroundColor: "#f9fafb",
                  borderRadius: 1,
                  border: "1px solid #e5e7eb",
                }}
              >
                <ColorPickerWithPalette
                  color={setting.color}
                  onChange={(color) => handleColorChange(setting.id, color)}
                  showGradientPalette={true}
                  value={setting.value || 0}
                />
                <TextField
                  type="number"
                  value={setting.percent}
                  onChange={(e) => handlePercentChange(setting.id, parseInt(e.target.value) || 0)}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  size="small"
                  sx={{ width: "120px", "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                />
                <Box sx={{ flex: 1 }} />
                <IconButton
                  onClick={() => handleDelete(setting.id)}
                  size="small"
                  sx={{ color: "#9ca3af" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))}
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddPoint}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            borderColor: "#d1d5db",
            color: "#374151",
            "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
          }}
        >
          Добавить точку
        </Button>
        {changes && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={saveSettings}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              borderColor: "#d1d5db",
              color: "#fff",
              backgroundColor: "red",
              ml: 1,
              "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
            }}
          >
            Сохранить
          </Button>
        )}
      </Paper>
    </div>
  );
}

export default function Orders() {
  return <OrdersPage />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");
  return { props: {} };
}
