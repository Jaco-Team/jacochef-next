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

const HeatmapCell = ({ value, hourData, metricKey, settings }) => {
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

  const displayValue =
    value !== null && value !== undefined ? (value > 0 ? `+${value}%` : `${value}%`) : "0%";

  const getTooltipContent = () => {
    if (!hourData) return "Нет данных";

    let currentValue = 0;
    let prevValue = 0;
    let metricName = "";

    switch (metricKey) {
      case "count_orders_percent":
        currentValue = hourData.count_orders || 0;
        prevValue = hourData.count_orders_prev || 0;
        metricName = "заказов";
        break;
      case "count_rolls_percent":
        currentValue = hourData.count_rolls || 0;
        prevValue = hourData.count_rolls_prev || 0;
        metricName = "роллов";
        break;
      case "count_pizza_percent":
        currentValue = hourData.count_pizza || 0;
        prevValue = hourData.count_pizza_prev || 0;
        metricName = "пицц";
        break;
      case "ready_orders_percent":
        currentValue = hourData.ready_orders || 0;
        prevValue = hourData.ready_orders_prev || 0;
        metricName = "готовых заказов";
        break;
      case "ready_rolls_percent":
        currentValue = hourData.ready_rolls || 0;
        prevValue = hourData.ready_rolls_prev || 0;
        metricName = "готовых роллов";
        break;
      case "ready_pizza_percent":
        currentValue = hourData.ready_pizza || 0;
        prevValue = hourData.ready_pizza_prev || 0;
        metricName = "готовой пиццы";
        break;
      default:
        currentValue = hourData.count_orders || 0;
        prevValue = hourData.count_orders_prev || 0;
        metricName = "заказов";
    }

    return `Количество ${metricName}:\nТекущий период: ${currentValue}\nПрошлый период: ${prevValue}\nИзменение: ${displayValue}`;
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
        fontWeight: value === 0 ? "normal" : "600",
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
      title={getTooltipContent()}
    >
      {displayValue}
    </Box>
  );
};

const TotalCell = ({ value, settings }) => {
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

  const displayValue =
    value !== null && value !== undefined ? (value > 0 ? `+${value}%` : `${value}%`) : "0%";

  return (
    <Box
      sx={{
        backgroundColor: getCellColor(value),
        color: getTextColor(value),
        padding: "8px 4px",
        textAlign: "center",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: value === 0 ? "normal" : "600",
        minHeight: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {displayValue}
    </Box>
  );
};

const CafeHeatmapTable = ({ cafeName, data, metricKey, settings, dateStart }) => {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 10).padStart(2, "0"));
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const startDate = dayjs(dateStart);
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    startDate.add(i, "day").format("YYYY-MM-DD"),
  );

  const getDayName = (dateStr) => {
    const dayIndex = dayjs(dateStr).day();
    return dayIndex === 0 ? days[6] : days[dayIndex - 1];
  };

  const formatDate = (dateStr) => dayjs(dateStr).format("DD.MM");

  const getMetricValue = (hourData, key) => {
    if (!hourData) return 0;
    return hourData[key] ?? 0;
  };

  const findHourData = (hoursArray, hourValue) => {
    return hoursArray?.find((h) => h.hour === hourValue) || null;
  };

  const getTotalsKey = (metricKey) => {
    const map = {
      count_orders_percent: "sv_o_percent",
      count_rolls_percent: "sv_r_percent",
      count_pizza_percent: "sv_p_percent",
    };
    return map[metricKey] || "sv_o_percent";
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: "bold" }}
      >
        {cafeName}
      </Typography>

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
              {weekDates.map((date, idx) => (
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
                  <div>{getDayName(date)}</div>
                  <div style={{ fontSize: "12px", fontWeight: "normal", color: "#666" }}>
                    {formatDate(date)}
                  </div>
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
                    const value = hourData ? getMetricValue(hourData, metricKey) : 0;

                    return (
                      <td
                        key={`${dateKey}-${hourStr}`}
                        style={{ padding: "2px" }}
                      >
                        <HeatmapCell
                          value={value}
                          settings={settings}
                          hourData={hourData}
                          metricKey={metricKey}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Total row */}
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
                const total = data[dateKey]?.totals?.[totalsKey] ?? 0;

                return (
                  <td
                    key={`total-${dateKey}`}
                    style={{ padding: "2px", borderTop: "2px solid #ddd" }}
                  >
                    <TotalCell
                      value={total}
                      settings={settings}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

function OrdersPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [point, setPoint] = useState([]);
  const [points, setPoints] = useState([]);
  const [metrick, setMetrick] = useState({ id: 1, name: "Оформленные заказы" });
  const [dateStart, setDateStart] = useState(null);
  const [tableData, setTableData] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState([]);
  const [changes, setChanges] = useState(false);
  const [timeDiv, setTimeDiv] = useState("");

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setPoints(data.points);
      setSettings(data.settings);
    });
  }, []);

  const update = () => {
    getData("get_all").then((data) => {
      setSettings(data.settings);
    });
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
          data: { differences: tableData, date_start: dayjs(dateStart).format("YYYY-MM-DD") },
        }),
        {
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        },
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
      metrick,
      point_list: point,
    };
    getData("get_data", data).then((data) => {
      const firstCafe = Object.values(data.differences)[0];
      if (firstCafe) {
        const firstDate = Object.keys(firstCafe)[0];
        if (firstDate && firstCafe[firstDate]?.totals) {
          console.log("Totals structure:", firstCafe[firstDate].totals);
        }
      }
      setTableData(data.differences);
      setTimeDiv(data.timeVs);
    });
  };

  const saveSettings = () => {
    const data = {
      settings,
    };
    getData("save_settings", data).then((data) => {
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
    switch (tabValue) {
      case 0:
        return "count_orders_percent";
      case 1:
        return "count_rolls_percent";
      case 2:
        return "count_pizza_percent";
      default:
        return "count_orders_percent";
    }
  };

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", paddingBottom: "40px" }}>
      <Grid
        container
        spacing={3}
        sx={{
          paddingTop: "86px",
          paddingLeft: "18px",
          paddingRight: "18px",
          mb: 3,
        }}
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
          {tab === 0 ? (
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
                  label="Дата начала"
                  value={dateStart}
                  func={(e) => setDateStart(formatDate(e))}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <MyAutocomplite
                  label="Метрика"
                  data={[
                    { id: 1, name: "Оформленные заказы" },
                    { id: 2, name: "Завершенные заказы" },
                  ]}
                  multiple={false}
                  value={metrick}
                  func={(event, data) => {
                    setMetrick(data);
                  }}
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
                <Button
                  onClick={() => exportExcel()}
                  variant="contained"
                  style={{ backgroundColor: "#1E5945" }}
                >
                  <ExcelIcon /> .xlsx
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                <Typography>{timeDiv}</Typography>
              </Grid>
            </>
          ) : null}
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

        {/* Tables for each cafe */}
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
                />
              </Grid>
            ))
          )}
        </Grid>

        {/* Legend */}
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
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  size="small"
                  sx={{
                    width: "120px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                    },
                  }}
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
            "&:hover": {
              borderColor: "#9ca3af",
              backgroundColor: "#f9fafb",
            },
          }}
        >
          Добавить точку
        </Button>
        {changes ? (
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
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            Сохранить
          </Button>
        ) : null}
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
