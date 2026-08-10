import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import AiDailyMetricsChart from "@/components/end_analytics/AiDailyMetricsChart";
import AiTrafficSourcesChart from "@/components/end_analytics/AiTrafficSourcesChart";

const PRIMARY_COLOR = "#cc0033";

const EXPORT_FORMATS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "docx", label: "Word (.docx)" },
  { value: "pdf", label: "PDF (.pdf)" },
];

export const AI_ANALYST_SOURCES = [
  { id: 1, name: "bing" },
  { id: 2, name: "direct" },
  { id: 3, name: "google" },
  { id: 4, name: "internal" },
  { id: 5, name: "not_set" },
  { id: 6, name: "offline_togliatti" },
  { id: 7, name: "rassylka" },
  { id: 8, name: "referral" },
  { id: 9, name: "vk" },
  { id: 10, name: "ya" },
  { id: 11, name: "yandex" },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "6px",
  textTransform: "none",
  fontWeight: 500,
  padding: "8px 16px",
  ...(variant === "primary" && {
    backgroundColor: PRIMARY_COLOR,
    color: "white",
    "&:hover": {
      backgroundColor: "#a00028",
    },
  }),
  ...(variant === "outlined" && {
    border: "1px solid #e0e0e0",
    color: "#333",
    "&:hover": {
      borderColor: PRIMARY_COLOR,
      color: PRIMARY_COLOR,
    },
  }),
}));

const STATUS_LABELS = {
  available: "Доступно",
  partial: "Частично",
  unavailable: "Недоступно",
};

const STATUS_COLORS = {
  available: "success",
  partial: "warning",
  unavailable: "default",
};

const RATING_COLORS = {
  high: "#2eaf6d",
  medium: "#f59e0b",
  low: "#ef5350",
  unknown: "#90a4ae",
};

const METRIC_CONFIG = [
  { key: "spend", dailyKey: "spend", label: "Расходы", color: "#3975ea" },
  {
    key: "conversions",
    dailyKey: "conversions",
    label: "Конверсии",
    color: "#2eaf6d",
    isDailyTotal: true,
  },
  { key: "cpa", dailyKey: "cpa", label: "CPA", color: "#8b5cf6" },
  { key: "ctr", dailyKey: "ctr", label: "CTR", color: "#f59e0b" },
  { key: "romi", label: "ROMI", color: "#20b8bd" },
];

const SECONDARY_METRICS = [
  ["revenue", "Выручка"],
  ["orders", "Заказы"],
  ["visits", "Визиты"],
  ["conversion", "Конверсия"],
  ["clicks", "Клики"],
  ["leads", "Лиды"],
  ["cpl", "CPL"],
  ["roi", "ROI"],
  ["cpc", "CPC"],
  ["cpm", "CPM"],
];

const DETAIL_SECTIONS = [
  { key: "ads", title: "Объявления", groups: ["best", "worst"] },
  {
    key: "keywords",
    title: "Ключевые слова",
    groups: ["converting", "cheap", "expensive", "waste"],
  },
  { key: "goals", title: "Цели", groups: ["achieved", "not_achieved"] },
  {
    key: "budget",
    title: "Рекомендации по бюджету",
    groups: ["increase", "disable", "overspend", "underspend"],
  },
  { key: "audience", title: "Аудитория", groups: [] },
  { key: "placements", title: "Рекламные площадки", groups: ["waste"] },
  { key: "search_queries", title: "Поисковые запросы", groups: ["waste"] },
];

const GROUP_LABELS = {
  best: "Лучшие",
  worst: "Худшие",
  converting: "Конверсионные",
  cheap: "Недорогие",
  expensive: "Дорогие",
  waste: "Неэффективные",
  achieved: "Достигнуты",
  not_achieved: "Не достигнуты",
  increase: "Увеличить бюджет",
  disable: "Отключить",
  overspend: "Перерасход",
  underspend: "Недорасход",
};

const GROUP_STYLES = {
  best: { backgroundColor: "#f0fbf5", borderColor: "#cdeedc" },
  converting: { backgroundColor: "#f0fbf5", borderColor: "#cdeedc" },
  achieved: { backgroundColor: "#f0fbf5", borderColor: "#cdeedc" },
  increase: { backgroundColor: "#eef9f3", borderColor: "#c5ead5" },
  cheap: { backgroundColor: "#f1f7ff", borderColor: "#cfe1fb" },
  underspend: { backgroundColor: "#f1f7ff", borderColor: "#cfe1fb" },
  expensive: { backgroundColor: "#fff8e9", borderColor: "#f7dfaa" },
  overspend: { backgroundColor: "#fff8e9", borderColor: "#f7dfaa" },
  worst: { backgroundColor: "#fff4f4", borderColor: "#f3cccc" },
  waste: { backgroundColor: "#fff4f4", borderColor: "#f3cccc" },
  disable: { backgroundColor: "#fff4f4", borderColor: "#f3cccc" },
  not_achieved: { backgroundColor: "#fff4f4", borderColor: "#f3cccc" },
};

const formatValue = (metric) => {
  if (!metric || metric.status === "unavailable" || metric.value === null) {
    return "Нет данных";
  }

  const value = Number(metric.value);
  if (!Number.isFinite(value)) return "Нет данных";

  if (metric.unit === "RUB") {
    return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
  }
  if (metric.unit === "percent") {
    return `${value.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%`;
  }
  return Math.round(value).toLocaleString("ru-RU");
};

const formatPeriod = (period) => {
  if (!period?.date_start || !period?.date_end) return "Период не указан";
  return `${dayjs(period.date_start).format("DD.MM.YYYY")} — ${dayjs(period.date_end).format(
    "DD.MM.YYYY",
  )}`;
};

const SectionHeader = ({ title, status, reason }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
      <Typography
        variant="subtitle1"
        fontWeight={700}
      >
        {title}
      </Typography>
      {status && (
        <Chip
          size="small"
          label={STATUS_LABELS[status] || status}
          color={STATUS_COLORS[status] || "default"}
          variant={status === "unavailable" ? "outlined" : "filled"}
        />
      )}
    </Box>
    {reason && (
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {reason}
      </Typography>
    )}
  </Box>
);

const MiniSparkline = ({ values, color }) => {
  const normalizedValues = values.filter((value) => Number.isFinite(value));
  if (normalizedValues.length < 2) return <Box sx={{ height: 42 }} />;

  const width = 120;
  const height = 38;
  const min = Math.min(...normalizedValues);
  const max = Math.max(...normalizedValues);
  const range = max - min || 1;
  const points = normalizedValues
    .map((value, index) => {
      const x = (index / (normalizedValues.length - 1)) * width;
      const y = height - 4 - ((value - min) / range) * (height - 8);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Box sx={{ height: 42, mt: 1 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};

const MetricCard = ({ config, metric, trendValues }) => (
  <Paper
    sx={{
      p: 2,
      minWidth: 0,
      minHeight: 164,
      borderRadius: 3,
      border: "1px solid #e9edf3",
      boxShadow: "0 5px 18px rgba(31, 41, 55, 0.05)",
      transition: "transform 160ms ease, box-shadow 160ms ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 10px 28px rgba(31, 41, 55, 0.09)",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
      <Typography
        variant="body2"
        fontWeight={600}
        color="#4b5563"
      >
        {config.label}
      </Typography>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: `${config.color}18`,
          color: config.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        {config.label.slice(0, 1)}
      </Box>
    </Box>
    <Typography
      variant="h6"
      fontWeight={700}
      sx={{
        color: metric?.status === "unavailable" ? "text.secondary" : "text.primary",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {formatValue(metric)}
    </Typography>
    <Typography
      variant="caption"
      color={metric?.status === "available" ? "success.main" : "text.secondary"}
    >
      {STATUS_LABELS[metric?.status] || "Нет данных"}
    </Typography>
    <MiniSparkline
      values={trendValues}
      color={config.color}
    />
  </Paper>
);

const ComparisonCard = ({ anomaly }) => {
  const current = Math.abs(Number(anomaly.current_value) || 0);
  const previous = Math.abs(Number(anomaly.previous_value) || 0);
  const max = Math.max(current, previous, 1);
  const isIncrease = anomaly.direction === "increase";

  return (
    <Box sx={{ py: 1.25 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
        <Typography
          variant="body2"
          fontWeight={600}
        >
          {anomaly.description || anomaly.metric}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: isIncrease ? "success.main" : "error.main",
            whiteSpace: "nowrap",
          }}
        >
          {isIncrease ? (
            <TrendingUpIcon sx={{ fontSize: 18 }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 18 }} />
          )}
          <Typography
            variant="caption"
            fontWeight={700}
          >
            {Number(anomaly.change_percent || 0).toLocaleString("ru-RU", {
              maximumFractionDigits: 2,
            })}
            %
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 1, mb: 0.5 }}>
        <Typography variant="caption">Текущий</Typography>
        <LinearProgress
          variant="determinate"
          value={(current / max) * 100}
          sx={{ height: 7, borderRadius: 5, alignSelf: "center" }}
        />
        <Typography variant="caption">{current.toLocaleString("ru-RU")}</Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 1 }}>
        <Typography variant="caption">Прошлый</Typography>
        <LinearProgress
          color="inherit"
          variant="determinate"
          value={(previous / max) * 100}
          sx={{ height: 7, borderRadius: 5, alignSelf: "center", color: "#b0bec5" }}
        />
        <Typography variant="caption">{previous.toLocaleString("ru-RU")}</Typography>
      </Box>
    </Box>
  );
};

const DetailCard = ({ section, data }) => {
  if (!data) return null;
  const groups = section.groups.filter((group) => Array.isArray(data[group]) && data[group].length);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        borderColor: "#e8ebf0",
        boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)",
      }}
    >
      <SectionHeader
        title={section.title}
        status={data.status}
        reason={data.reason || data.summary}
      />
      {groups.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Детальных рекомендаций нет
        </Typography>
      ) : (
        groups.map((group, groupIndex) => (
          <Box
            key={group}
            sx={{ mb: groupIndex === groups.length - 1 ? 0 : 2 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              {GROUP_LABELS[group]}
            </Typography>
            {data[group].map((item, index) => (
              <Box
                key={`${group}_${item.name}_${index}`}
                sx={{
                  mt: 0.75,
                  p: 1.25,
                  borderRadius: 2,
                  border: "1px solid",
                  ...(GROUP_STYLES[group] || {
                    backgroundColor: "#f8f9fb",
                    borderColor: "#e8ebf0",
                  }),
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {item.reason}
                </Typography>
              </Box>
            ))}
          </Box>
        ))
      )}
    </Paper>
  );
};

const formatHistoryPeriod = (item) => {
  if (!item?.date_start || !item?.date_end) return "Период не указан";
  return `${dayjs(item.date_start).format("DD.MM.YYYY")} — ${dayjs(item.date_end).format(
    "DD.MM.YYYY",
  )}`;
};

const formatHistoryCity = (item) => {
  if (typeof item?.city_name === "string" && item.city_name) return item.city_name;
  if (typeof item?.city === "string" && item.city) return item.city;
  return "Город не указан";
};

const formatHistoryMoney = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0 ₽";
  return `${Math.round(num).toLocaleString("ru-RU")} ₽`;
};

export default function AiAnalystTab({
  cities,
  form,
  source,
  analysis,
  dailyMetrics = [],
  trafficSourceMetrics = [],
  siteDataRequestId,
  history = [],
  historyChatMessages = null,
  onCitiesChange,
  onFieldChange,
  onSourceChange,
  onApply,
  onReset,
  onSendChat,
  onSelectHistory,
  onExport,
  canExport = false,
  onAnalyze,
  canAnalyze = false,
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [reportHtml, setReportHtml] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const chatListRef = useRef(null);

  useEffect(() => {
    setChatMessages(Array.isArray(historyChatMessages) ? historyChatMessages : []);
    setChatInput("");
    setChatLoading(false);
  }, [siteDataRequestId, historyChatMessages]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const canChat = Boolean(analysis && siteDataRequestId);

  const handleSendChat = async () => {
    const prompt = chatInput.trim();
    if (!prompt || chatLoading || !canChat || !onSendChat) return;

    setChatMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await onSendChat(prompt, analysis);
      if (data?.st === false) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data?.text || "Не удалось получить ответ AI",
            isError: true,
          },
        ]);
        return;
      }

      const reply = data?.answer || "Пустой ответ AI";
      setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (_) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Ошибка при обращении к AI-чату",
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendChat();
    }
  };

  const handleExportClick = (fileType) => {
    setExportMenuAnchor(null);
    onExport?.(fileType);
  };

  const handleAnalyzeClick = async () => {
    if (!canAnalyze || analyzeLoading || !onAnalyze) return;

    setAnalyzeLoading(true);
    try {
      const html = await onAnalyze();
      if (html) {
        setReportHtml(html);
        setReportOpen(true);
      }
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const closeReportModal = () => {
    setReportOpen(false);
  };

  const getKpiMetric = (config) => {
    if (!config.isDailyTotal) {
      return analysis?.metrics?.[config.key];
    }

    const values = dailyMetrics
      .map((item) => Number(item?.[config.dailyKey]))
      .filter((value) => Number.isFinite(value));

    return {
      value: values.reduce((sum, value) => sum + value, 0),
      unit: "count",
      status: values.length > 0 ? "available" : "unavailable",
    };
  };

  const getKpiTrend = (config) => {
    if (!config.dailyKey) return [];
    return dailyMetrics
      .map((item) => Number(item?.[config.dailyKey]))
      .filter((value) => Number.isFinite(value));
  };

  return (
    <>
      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12 }}>
          <Accordion
            defaultExpanded={false}
            sx={{
              borderRadius: "8px !important",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                >
                  История отчётов
                </Typography>
                <Chip
                  size="small"
                  label={history.length}
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {history.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Сохранённых отчётов пока нет
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {history.map((item) => {
                    const itemId = item.site_data_request_id ?? item.id;
                    const isActive = siteDataRequestId === itemId;

                    return (
                      <Paper
                        key={itemId}
                        variant="outlined"
                        onClick={() => onSelectHistory?.(item)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: "pointer",
                          borderColor: isActive ? PRIMARY_COLOR : "#e8ebf0",
                          backgroundColor: isActive ? "#fff5f7" : "white",
                          "&:hover": {
                            borderColor: PRIMARY_COLOR,
                            backgroundColor: "#fffafb",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                            gap: 1,
                            mb: 0.75,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {formatHistoryCity(item)}
                          </Typography>
                          <Chip
                            size="small"
                            label={STATUS_LABELS[item.ai_status] || item.ai_status || "—"}
                            color={STATUS_COLORS[item.ai_status] || "default"}
                            variant="outlined"
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.75 }}
                        >
                          {formatHistoryPeriod(item)}
                          {item.created_at
                            ? ` · создан ${dayjs(item.created_at).format("DD.MM.YYYY HH:mm")}`
                            : ""}
                        </Typography>
                        {item.ai_summary && (
                          <Typography
                            variant="body2"
                            sx={{ mb: 0.75 }}
                          >
                            {item.ai_summary}
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                          <Typography variant="caption">
                            Заказы: {Number(item.orders || 0).toLocaleString("ru-RU")}
                          </Typography>
                          <Typography variant="caption">
                            Выручка: {formatHistoryMoney(item.revenue)}
                          </Typography>
                          <Typography variant="caption">CTR: {Number(item.ctr || 0)}%</Typography>
                          <Typography variant="caption">CPA: {Number(item.cpa || 0)}%</Typography>
                          <Typography variant="caption">
                            Конверсии: {Number(item.conversion || 0)}%
                          </Typography>
                          <Typography variant="caption">
                            Сообщений в чате: {Number(item.chat_messages_count || 0)}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <StyledPaper>
            <Grid
              container
              spacing={3}
            >
              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="Города"
                  data={cities}
                  multiple={false}
                  value={form.cities}
                  func={(event, data) => onCitiesChange(data)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <MyDatePickerNew
                  label="Дата от"
                  customActions={true}
                  value={dayjs(form.dateStart)}
                  maxDate={dayjs(form.dateEnd) ?? dayjs()}
                  func={(e) => onFieldChange("dateStart", e)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <MyDatePickerNew
                  label="Дата до"
                  customActions={true}
                  value={dayjs(form.dateEnd)}
                  minDate={dayjs(form.dateStart) ?? dayjs()}
                  func={(e) => onFieldChange("dateEnd", e)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="Источник"
                  data={AI_ANALYST_SOURCES}
                  multiple={false}
                  value={source}
                  func={(event, data) => onSourceChange(data)}
                />
              </Grid>

              <Grid
                size={{ xs: 12 }}
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
              >
                <StyledButton
                  variant="outlined"
                  onClick={onReset}
                  startIcon={<DeleteIcon />}
                >
                  Сбросить
                </StyledButton>
                <StyledButton
                  variant="primary"
                  onClick={onApply}
                  startIcon={<SearchIcon />}
                >
                  Применить
                </StyledButton>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {!analysis && (
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                minHeight: 480,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
              >
                Выберите фильтры и нажмите «Применить», чтобы получить AI-анализ
              </Typography>
            </Paper>
          </Grid>
        )}

        {analysis && (
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{ height: "max-content" }}
          >
            <Grid
              container
              spacing={2}
              sx={{
                p: { xs: 1, sm: 1.5 },
                borderRadius: 3,
                backgroundColor: "#f7f8fb",
              }}
            >
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: "#e8ebf0",
                    boxShadow: "0 5px 18px rgba(31, 41, 55, 0.04)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                      >
                        Результаты AI-анализа
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatPeriod(analysis.period)} · сравнение с{" "}
                        {formatPeriod(analysis.comparison_period)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <StyledButton
                        variant="primary"
                        startIcon={
                          analyzeLoading ? (
                            <CircularProgress
                              size={16}
                              color="inherit"
                            />
                          ) : (
                            <AnalyticsIcon />
                          )
                        }
                        disabled={!canAnalyze || analyzeLoading}
                        onClick={handleAnalyzeClick}
                      >
                        Анализировать
                      </StyledButton>
                      <StyledButton
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        endIcon={<KeyboardArrowDownIcon />}
                        disabled={!canExport}
                        onClick={(event) => setExportMenuAnchor(event.currentTarget)}
                      >
                        Экспортировать
                      </StyledButton>
                      <Menu
                        anchorEl={exportMenuAnchor}
                        open={Boolean(exportMenuAnchor)}
                        onClose={() => setExportMenuAnchor(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                      >
                        {EXPORT_FORMATS.map((format) => (
                          <MenuItem
                            key={format.value}
                            onClick={() => handleExportClick(format.value)}
                          >
                            <ListItemText primary={format.label} />
                          </MenuItem>
                        ))}
                      </Menu>
                      <Chip
                        label={STATUS_LABELS[analysis.status] || analysis.status}
                        color={STATUS_COLORS[analysis.status] || "default"}
                      />
                    </Box>
                  </Box>
                  {analysis.message && (
                    <Typography
                      variant="body2"
                      color="warning.main"
                      sx={{ mt: 1 }}
                    >
                      {analysis.message}
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(5, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                  }}
                >
                  {METRIC_CONFIG.map((config) => (
                    <MetricCard
                      key={config.key}
                      config={config}
                      metric={getKpiMetric(config)}
                      trendValues={getKpiTrend(config)}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, borderColor: "#e8ebf0" }}
                >
                  <SectionHeader title="Дополнительные показатели" />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(3, minmax(0, 1fr))",
                        lg: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {SECONDARY_METRICS.map(([key, label]) => {
                      const metric = analysis.metrics?.[key];
                      return (
                        <Box
                          key={key}
                          sx={{
                            p: 1.5,
                            minWidth: 0,
                            minHeight: 78,
                            border: "1px solid #eef0f3",
                            borderRadius: 2,
                            backgroundColor: "#f8f9fb",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ overflowWrap: "anywhere" }}
                          >
                            {formatValue(metric)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              </Grid>

              <Grid
                size={{ xs: 12, lg: 7 }}
                sx={{ height: "max-content" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: "#e8ebf0",
                    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 0.5 }}
                  >
                    Динамика показателей
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Расходы, конверсии, CPA и CTR по дням
                  </Typography>
                  <AiDailyMetricsChart items={dailyMetrics} />
                </Paper>
              </Grid>

              <Grid
                size={{ xs: 12, lg: 5 }}
                sx={{ height: "max-content" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: "#e8ebf0",
                    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 0.5 }}
                  >
                    Источники трафика
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Распределение рекламных расходов
                  </Typography>
                  <AiTrafficSourcesChart items={trafficSourceMetrics} />
                </Paper>
              </Grid>

              <Grid
                size={{ xs: 12, lg: 5 }}
                sx={{ height: "max-content" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: "#e8ebf0",
                    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)",
                  }}
                >
                  <SectionHeader
                    title="Общая эффективность"
                    status={analysis.general_effectiveness?.status}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 112,
                        height: 112,
                        borderRadius: "50%",
                        background: `conic-gradient(${
                          RATING_COLORS[analysis.general_effectiveness?.rating] ||
                          RATING_COLORS.unknown
                        } ${analysis.general_effectiveness?.score || 0}%, #edf0f4 0)`,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 82,
                          height: 82,
                          borderRadius: "50%",
                          backgroundColor: "white",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Typography
                          variant="h5"
                          fontWeight={700}
                        >
                          {analysis.general_effectiveness?.score ?? "—"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ mb: 0.5 }}
                      >
                        Оценка периода
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {analysis.general_effectiveness?.summary || "Общая оценка недоступна"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid
                size={{ xs: 12, lg: 7 }}
                sx={{ height: "max-content" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: "#e8ebf0",
                    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)",
                  }}
                >
                  <SectionHeader title="Изменения к предыдущему периоду" />
                  {(analysis.anomalies || []).length > 0 ? (
                    analysis.anomalies.map((anomaly, index) => (
                      <React.Fragment key={`${anomaly.metric}_${index}`}>
                        {index > 0 && <Divider />}
                        <ComparisonCard anomaly={anomaly} />
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Значимых изменений более 15% не обнаружено
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid
                size={{ xs: 12, lg: 6 }}
                sx={{ height: "max-content" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: "#e8ebf0",
                    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)",
                  }}
                >
                  <SectionHeader title="Проблемы" />
                  {(analysis.problems || []).length > 0 ? (
                    analysis.problems.map((problem, index) => (
                      <Box
                        key={`${problem.type}_${problem.title}_${index}`}
                        sx={{ display: "flex", gap: 1.25, mb: 2 }}
                      >
                        <WarningAmberIcon
                          color={problem.severity === "high" ? "error" : "warning"}
                          sx={{ mt: 0.25 }}
                        />
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {problem.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {problem.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="primary"
                          >
                            {problem.recommendation}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Критичных проблем не обнаружено
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid
                size={{ xs: 12, lg: 6 }}
                sx={{ height: "max-content" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: "#e8ebf0",
                    boxShadow: "0 4px 16px rgba(31, 41, 55, 0.04)",
                  }}
                >
                  <SectionHeader title="Выводы AI" />
                  {(analysis.insights || []).length > 0 ? (
                    analysis.insights.map((insight, index) => (
                      <Box
                        key={`${insight.title}_${index}`}
                        sx={{ display: "flex", gap: 1.25, mb: 2 }}
                      >
                        <AutoAwesomeIcon sx={{ mt: 0.25, color: "#8b5cf6" }} />
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {insight.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {insight.description}
                          </Typography>
                          {insight.evidence && (
                            <Typography
                              variant="caption"
                              color="success.main"
                            >
                              Основание: {insight.evidence}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Выводов пока нет
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {DETAIL_SECTIONS.map((section) => (
                <Grid
                  key={section.key}
                  size={{ xs: 12, lg: 6 }}
                  sx={{ height: "max-content" }}
                >
                  <DetailCard
                    section={section}
                    data={analysis[section.key]}
                  />
                </Grid>
              ))}

              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2, borderColor: "#e8ebf0" }}
                >
                  <SectionHeader title="Доступность данных" />
                  <Grid
                    container
                    spacing={1.5}
                  >
                    {Object.entries(analysis.data_availability || {}).map(([key, item]) => (
                      <Grid
                        key={key}
                        size={{ xs: 12, sm: 6 }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            backgroundColor: "#f8f9fb",
                            height: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {key.replaceAll("_", " ")}
                            </Typography>
                            <Chip
                              size="small"
                              label={STATUS_LABELS[item.status] || item.status}
                              color={STATUS_COLORS[item.status] || "default"}
                              variant="outlined"
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {item.reason}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              minHeight: 760,
              maxHeight: { md: "calc(100vh - 20px)" },
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              p: 2,
              display: "flex",
              flexDirection: "column",
              position: { md: "sticky" },
              top: { md: 72 },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ mb: 1.5, px: 1 }}
            >
              Чат с AI-аналитиком
            </Typography>

            <Box
              ref={chatListRef}
              sx={{
                flex: 1,
                minHeight: 280,
                overflowY: "auto",
                borderRadius: 2,
                backgroundColor: "#f8f9fb",
                border: "1px solid #eef0f3",
                p: 1.5,
                mb: 1.5,
              }}
            >
              {!canChat && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 6 }}
                >
                  Сначала примените фильтры, чтобы отправить отчёт в чат
                </Typography>
              )}

              {canChat && chatMessages.length === 0 && !chatLoading && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 6 }}
                >
                  Задайте вопрос по текущему отчёту AI-анализа
                </Typography>
              )}

              {chatMessages.map((message, index) => (
                <Box
                  key={`${message.role}_${index}`}
                  sx={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                    mb: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "88%",
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      backgroundColor:
                        message.role === "user"
                          ? PRIMARY_COLOR
                          : message.isError
                            ? "#fff5f5"
                            : "white",
                      color: message.role === "user" ? "white" : "text.primary",
                      border:
                        message.role === "user"
                          ? "none"
                          : message.isError
                            ? "1px solid #ffcdd2"
                            : "1px solid #e8ebf0",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                  </Box>
                </Box>
              ))}

              {chatLoading && (
                <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      backgroundColor: "white",
                      border: "1px solid #e8ebf0",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={14} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      AI думает...
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                size="small"
                placeholder={
                  canChat ? "Спросите что-нибудь по отчёту..." : "Сначала получите отчёт"
                }
                value={chatInput}
                disabled={!canChat || chatLoading}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={handleChatKeyDown}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: "white",
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendChat}
                disabled={!canChat || chatLoading || !chatInput.trim()}
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  borderRadius: "10px",
                  width: 40,
                  height: 40,
                  "&:hover": { backgroundColor: "#a00028" },
                  "&.Mui-disabled": {
                    backgroundColor: "#f0f0f0",
                    color: "#bdbdbd",
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={reportOpen}
        onClose={closeReportModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: { xs: "70vh", md: "80vh" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pr: 1.5,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
          >
            AI-отчёт
          </Typography>
          <IconButton
            onClick={closeReportModal}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ p: 0, backgroundColor: "#f7f8fb" }}
        >
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              minHeight: { xs: "60vh", md: "70vh" },
              overflow: "auto",
              backgroundColor: "#f7f8fb",
            }}
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <StyledButton
            variant="outlined"
            onClick={closeReportModal}
          >
            Закрыть
          </StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
