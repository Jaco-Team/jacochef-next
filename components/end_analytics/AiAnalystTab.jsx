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
import Masonry from "@mui/lab/Masonry";
import Tooltip from "@mui/material/Tooltip";
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PushPinIcon from "@mui/icons-material/PushPin";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";
import AiDailyMetricsChart from "@/components/end_analytics/AiDailyMetricsChart";
import AiTrafficSourcesChart from "@/components/end_analytics/AiTrafficSourcesChart";
import AiReportSchedulesDialog from "@/components/end_analytics/AiReportSchedulesDialog";

const PRIMARY_COLOR = "#cc0033";

const EXPORT_FORMATS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "docx", label: "Word (.docx)" },
  { value: "pdf", label: "PDF (.pdf)" },
];

// Запасной список: актуальные источники приходят с сервера в get_all (ai_sources).
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
  { id: 11, name: "yandex" },
];

export const AI_COMPARISON_MODES = [
  { id: 1, key: "previous_period", name: "Предыдущий период" },
  { id: 2, key: "previous_month", name: "Те же даты прошлого месяца" },
  { id: 3, key: "previous_year", name: "Те же даты прошлого года" },
  { id: 4, key: "custom", name: "Свой период" },
];

export const DEFAULT_AI_COMPARISON = { mode: "previous_period", dateStart: null, dateEnd: null };

const HISTORY_COLLAPSED_COUNT = 8;

// Памятка в окне «Как работает AI-аналитик»: когда какая модель чата уместна.
const AI_MODEL_GUIDE = [
  [
    "Автоматически",
    "Подходит почти всегда: сервер сам берёт быструю модель для справочных вопросов и подробную — для разборов.",
    "Оставьте этот режим, если не уверены.",
  ],
  [
    "Быстрая — YandexGPT 5.1",
    "Когда нужны цифры и ответ за 3–8 секунд: показатели за период, топы товаров, сравнение периодов, список кампаний.",
    "«Покажи продажи только по пиццам», «Сравни с прошлым месяцем».",
  ],
  [
    "Подробная — DeepSeek V4.1 Flash",
    "Когда нужен разбор и можно подождать 10–20 секунд: причины изменений, решения по бюджету, выводы по атрибуции.",
    "«Почему изменился CPA?», «На какие кампании перераспределить бюджет?»",
  ],
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

const BASIS_LABELS = {
  crm: "CRM",
  crm_orders: "CRM",
  crm_orders_to_metrika_visits: "CRM + Метрика",
  metrika_attributed: "Атрибуция Метрики",
  metrika_to_crm: "Метрика / CRM",
};

const METRIC_CONFIG = [
  { key: "spend", dailyKey: "spend", label: "Расходы", color: "#3975ea" },
  { key: "crm_orders", dailyKey: "orders", label: "Заказы", color: "#2eaf6d" },
  { key: "cpa", dailyKey: "cpa", label: "CPA", color: "#8b5cf6" },
  { key: "ctr", dailyKey: "ctr", label: "CTR", color: "#f59e0b" },
  { key: "romi", label: "ROMI", color: "#20b8bd" },
];

const SECONDARY_METRICS = [
  ["crm_revenue", "Выручка CRM"],
  ["average_check", "Средний чек"],
  ["visits", "Визиты"],
  ["conversion", "Конверсия"],
  ["clicks", "Клики"],
  ["leads", "Лиды"],
  ["cpl", "CPL"],
  ["roi", "ROI"],
  ["roas", "ROAS"],
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

const renderInlineMarkdown = (text, keyPrefix) => {
  const parts = String(text).split(
    /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\((?:https?:\/\/|mailto:)[^)\s]+\))/g,
  );

  return parts.map((part, index) => {
    const key = `${keyPrefix}_${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <Box
          key={key}
          component="code"
          sx={{ px: 0.5, py: 0.15, borderRadius: 0.75, backgroundColor: "#eef0f3" }}
        >
          {part.slice(1, -1)}
        </Box>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)$/);
    if (link) {
      return <React.Fragment key={key}>{link[1]}</React.Fragment>;
    }

    return part;
  });
};

const MarkdownMessage = ({ text }) => {
  const lines = String(text || "")
    .replaceAll("\r\n", "\n")
    .split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <Box
          key={`code_${index}`}
          component="pre"
          sx={{ m: 0, mb: 1.25, p: 1, overflowX: "auto", borderRadius: 1, bgcolor: "#eef0f3" }}
        >
          <Box component="code">{codeLines.join("\n")}</Box>
        </Box>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push(
        <Typography
          key={`heading_${index}`}
          component="div"
          variant={heading[1].length <= 2 ? "subtitle2" : "body2"}
          fontWeight={700}
          sx={{ mt: blocks.length ? 1.25 : 0, mb: 0.75 }}
        >
          {renderInlineMarkdown(heading[2], `heading_${index}`)}
        </Typography>,
      );
      index += 1;
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(\d+)[.)]\s+(.+)$/);
        if (!item) break;
        items.push({ number: Number(item[1]), text: item[2] });
        index += 1;
        while (index < lines.length && !lines[index].trim()) index += 1;
      }
      blocks.push(
        <Box
          key={`ordered_${index}`}
          component="ol"
          sx={{ mt: 0, mb: 1.25, pl: 2.75, "& li": { mb: 0.75, pl: 0.25 } }}
        >
          {items.map((item, itemIndex) => (
            <Box
              key={`ordered_${index}_${itemIndex}`}
              component="li"
              value={item.number}
            >
              {renderInlineMarkdown(item.text, `ordered_${index}_${itemIndex}`)}
            </Box>
          ))}
        </Box>,
      );
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index += 1;
        while (index < lines.length && !lines[index].trim()) index += 1;
      }
      blocks.push(
        <Box
          key={`unordered_${index}`}
          component="ul"
          sx={{ mt: 0, mb: 1.25, pl: 2.75, "& li": { mb: 0.75, pl: 0.25 } }}
        >
          {items.map((item, itemIndex) => (
            <Box
              key={`unordered_${index}_${itemIndex}`}
              component="li"
            >
              {renderInlineMarkdown(item, `unordered_${index}_${itemIndex}`)}
            </Box>
          ))}
        </Box>,
      );
      continue;
    }

    const paragraphLines = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^\s*(?:\d+[.)]|[-*+])\s+/.test(lines[index]) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <Typography
        key={`paragraph_${index}`}
        component="p"
        variant="body2"
        sx={{ mt: 0, mb: 1.25, lineHeight: 1.6, "&:last-child": { mb: 0 } }}
      >
        {renderInlineMarkdown(paragraphLines.join(" "), `paragraph_${index}`)}
      </Typography>,
    );
  }

  return <Box sx={{ overflowWrap: "anywhere" }}>{blocks}</Box>;
};

const MemoizedMarkdownMessage = React.memo(MarkdownMessage);

const CHAT_TABLE_PREVIEW_ROWS = 12;

const CHAT_STAGE_LABELS = {
  plan: "Разбираю вопрос…",
  data: "Получаю данные…",
  answer: "Формулирую ответ…",
  check: "Проверяю цифры…",
};

const CHAT_STARTER_QUESTIONS = [
  "Куда перераспределить бюджет?",
  "Почему изменилась конверсия?",
  "Покажи топ-10 позиций по выручке",
  "Какие новинки появились за период?",
];

// ID подробной модели из списка сервера: кнопка «Разобрать подробнее» переспрашивает через неё.
const DEEP_CHAT_MODEL_ID = "deepseek41";

const chatTablesToText = (tables) =>
  (Array.isArray(tables) ? tables : [])
    .map((table) =>
      [
        table.title,
        (table.columns || []).map((column) => column.label).join("\t"),
        ...(table.rows || []).map((row) => row.join("\t")),
      ].join("\n"),
    )
    .join("\n\n");

// Таблицы к ответу строит сервер: здесь только показ, без пересчёта.
const ChatAnswerTable = React.memo(function ChatAnswerTable({ table }) {
  const [expanded, setExpanded] = useState(false);
  const rows = Array.isArray(table?.rows) ? table.rows : [];
  const columns = Array.isArray(table?.columns) ? table.columns : [];
  const visibleRows = expanded ? rows : rows.slice(0, CHAT_TABLE_PREVIEW_ROWS);
  const cellSx = (column, isHead) => ({
    px: 1,
    py: 0.5,
    textAlign: column?.align === "right" ? "right" : "left",
    whiteSpace: column?.align === "right" ? "nowrap" : "normal",
    // Текстовая колонка не сжимается до одной буквы: таблица прокручивается по горизонтали.
    minWidth: column?.align === "right" ? undefined : 96,
    maxWidth: column?.align === "right" ? undefined : 280,
    wordBreak: "normal",
    overflowWrap: "break-word",
    borderBottom: "1px solid #eef0f3",
    fontSize: 12,
    fontWeight: isHead ? 600 : 400,
    color: isHead ? "text.secondary" : "text.primary",
    fontVariantNumeric: "tabular-nums",
    verticalAlign: "top",
  });

  if (!rows.length || !columns.length) return null;

  return (
    <Box sx={{ mt: 1.25 }}>
      {table.title ? (
        <Typography
          variant="caption"
          sx={{ display: "block", fontWeight: 600, mb: 0.5 }}
        >
          {table.title}
        </Typography>
      ) : null}
      <Box sx={{ overflowX: "auto", border: "1px solid #eef0f3", borderRadius: 1.5 }}>
        <Box
          component="table"
          sx={{
            borderCollapse: "collapse",
            width: "max-content",
            minWidth: "100%",
            backgroundColor: "white",
          }}
        >
          <Box component="thead">
            <Box component="tr">
              {columns.map((column, columnIndex) => (
                <Box
                  component="th"
                  key={`head_${columnIndex}`}
                  sx={{ ...cellSx(column, true), backgroundColor: "#f8f9fb" }}
                >
                  {column.label}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {visibleRows.map((row, rowIndex) => (
              <Box
                component="tr"
                key={`row_${rowIndex}`}
              >
                {columns.map((column, columnIndex) => (
                  <Box
                    component="td"
                    key={`cell_${rowIndex}_${columnIndex}`}
                    sx={cellSx(column, false)}
                  >
                    {row[columnIndex] ?? "—"}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {rows.length > CHAT_TABLE_PREVIEW_ROWS ? (
        <Button
          size="small"
          onClick={() => setExpanded((value) => !value)}
          sx={{ mt: 0.25, textTransform: "none", fontSize: 12 }}
        >
          {expanded ? "Свернуть" : `Показать все строки (${rows.length})`}
        </Button>
      ) : null}
      {table.note ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.25 }}
        >
          {table.note}
        </Typography>
      ) : null}
    </Box>
  );
});

const ChatAnswerFooter = React.memo(function ChatAnswerFooter({
  message,
  canAskDeeper,
  disabled,
  onCopy,
  onRate,
  onAskDeeper,
}) {
  const rating = Number(message?.feedback?.rating) || 0;
  const iconSx = { fontSize: 16 };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.75, flexWrap: "wrap" }}>
      {message.aiModelName ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mr: 0.75 }}
        >
          {message.aiModelName}
        </Typography>
      ) : null}
      <Tooltip title="Скопировать ответ">
        <IconButton
          size="small"
          aria-label="Скопировать ответ"
          onClick={() => onCopy(message)}
        >
          <ContentCopyIcon sx={iconSx} />
        </IconButton>
      </Tooltip>
      {message.messageId ? (
        <>
          <Tooltip title="Ответ полезен">
            <IconButton
              size="small"
              aria-label="Ответ полезен"
              color={rating === 1 ? "primary" : "default"}
              onClick={() => onRate(message, rating === 1 ? 0 : 1)}
            >
              {rating === 1 ? <ThumbUpAltIcon sx={iconSx} /> : <ThumbUpOffAltIcon sx={iconSx} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Ответ не помог">
            <IconButton
              size="small"
              aria-label="Ответ не помог"
              color={rating === -1 ? "primary" : "default"}
              onClick={() => onRate(message, rating === -1 ? 0 : -1)}
            >
              {rating === -1 ? (
                <ThumbDownAltIcon sx={iconSx} />
              ) : (
                <ThumbDownOffAltIcon sx={iconSx} />
              )}
            </IconButton>
          </Tooltip>
        </>
      ) : null}
      {canAskDeeper && message.question ? (
        <Button
          size="small"
          disabled={disabled}
          onClick={() => onAskDeeper(message)}
          sx={{ textTransform: "none", fontSize: 12, ml: 0.5 }}
        >
          Разобрать подробнее
        </Button>
      ) : null}
    </Box>
  );
});

const ChatQuestionChips = React.memo(function ChatQuestionChips({ questions, disabled, onSelect }) {
  if (!Array.isArray(questions) || questions.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {questions.map((question) => (
        <Chip
          key={question}
          label={question}
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={() => onSelect(question)}
          sx={{ backgroundColor: "white", maxWidth: "100%" }}
        />
      ))}
    </Box>
  );
});

const ChatComposer = React.memo(function ChatComposer({ canChat, loading, threadId, onSend }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue("");
  }, [threadId]);

  const submit = () => {
    const prompt = value.trim();
    if (!prompt || !canChat || loading) return;

    setValue("");
    onSend(prompt);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-end",
        p: 1.5,
        flexShrink: 0,
        backgroundColor: "white",
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        size="small"
        placeholder={canChat ? "Спросите что-нибудь по отчёту..." : "Сначала получите отчёт"}
        value={value}
        disabled={!canChat || loading}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "white",
          },
        }}
      />
      <IconButton
        color="primary"
        onClick={submit}
        disabled={!canChat || loading || !value.trim()}
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
  );
});

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

function getMetricHint(metric) {
  const statusLine = [
    STATUS_LABELS[metric?.status] || "Нет данных",
    metric?.basis ? BASIS_LABELS[metric.basis] || metric.basis : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return [statusLine, metric?.reason].filter(Boolean).join("\n");
}

const MetricCard = ({ config, metric, trendValues }) => {
  const hint = getMetricHint(metric);

  return (
    <Tooltip
      title={<Box sx={{ whiteSpace: "pre-line" }}>{hint}</Box>}
      arrow
    >
      <Paper
        sx={{
          p: 2,
          minWidth: 0,
          minHeight: 148,
          borderRadius: 3,
          border: "1px solid #e9edf3",
          boxShadow: "0 5px 18px rgba(31, 41, 55, 0.05)",
          cursor: "help",
          transition: "transform 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 28px rgba(31, 41, 55, 0.09)",
          },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}
        >
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
        <MiniSparkline
          values={trendValues}
          color={config.color}
        />
      </Paper>
    </Tooltip>
  );
};

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

const formatOrdersShare = (value) =>
  Number(value || 0).toLocaleString("ru-RU", { maximumFractionDigits: 1 });

// Объявления, фразы, запросы, площадки, аудитория и поведение: считаются по запросу.
const AdInsightsSection = ({ insights, loading, onLoad }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, borderRadius: 2, borderColor: "#e8ebf0" }}
  >
    <SectionHeader title="Реклама в деталях" />
    {!insights ? (
      loading ? (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Собираем объявления, фразы, запросы и аудиторию…
          </Typography>
          <LinearProgress />
        </>
      ) : (
        <Button
          size="small"
          variant="outlined"
          onClick={onLoad}
          sx={{ textTransform: "none" }}
        >
          Показать объявления, фразы, запросы, площадки и аудиторию
        </Button>
      )
    ) : (
      (insights.sections || []).map((section, sectionIndex) => (
        <Box
          key={`insight_${sectionIndex}`}
          sx={{ mt: sectionIndex === 0 ? 0 : 2.5 }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700 }}
          >
            {section.title}
          </Typography>
          {section.reason ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {section.reason}
            </Typography>
          ) : null}
          {section.summary ? <Typography variant="body2">{section.summary}</Typography> : null}
          {(section.tables || []).map((table, tableIndex) => (
            <ChatAnswerTable
              key={`insight_${sectionIndex}_${tableIndex}`}
              table={table}
            />
          ))}
          {section.method ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              {section.method}
            </Typography>
          ) : null}
        </Box>
      ))
    )}
  </Paper>
);

// Отчёт по устройствам считается по запросу: журнал визитов большой.
const DevicesSection = ({ devices, loading, onLoad }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2, borderRadius: 2, borderColor: "#e8ebf0" }}
  >
    <SectionHeader title="Устройства" />
    {!devices ? (
      loading ? (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Считаем визиты по устройствам…
          </Typography>
          <LinearProgress />
        </>
      ) : (
        <Button
          size="small"
          variant="outlined"
          onClick={onLoad}
          sx={{ textTransform: "none" }}
        >
          Показать визиты и заказы по устройствам
        </Button>
      )
    ) : (
      <>
        {devices.reason ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {devices.reason}
          </Typography>
        ) : null}
        {(devices.tables || []).map((table, index) => (
          <ChatAnswerTable
            key={`devices_${index}`}
            table={table}
          />
        ))}
        {devices.coverage?.linked_share != null ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            С визитами связано {devices.coverage.linked_orders} из {devices.coverage.orders} заказов
            сайта ({String(devices.coverage.linked_share).replace(".", ",")}%).
          </Typography>
        ) : null}
        {devices.method ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            {devices.method}
          </Typography>
        ) : null}
      </>
    )}
  </Paper>
);

const AttributionSection = ({ attribution, loading }) => {
  if (!attribution) {
    return loading ? (
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 2, borderColor: "#e8ebf0" }}
      >
        <SectionHeader title="Атрибуция заказов" />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Считаем цепочки касаний посетителей…
        </Typography>
        <LinearProgress />
      </Paper>
    ) : null;
  }

  const channels = (attribution.channels || []).filter(
    (item) => Number(item.data_driven_orders) >= 0.5 || Number(item.last_touch_orders) >= 1,
  );
  const coverage = attribution.coverage || {};

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderRadius: 2, borderColor: "#e8ebf0" }}
    >
      <SectionHeader
        title={`Атрибуция заказов: ${attribution.model_label || "—"}`}
        status={attribution.status}
        reason={attribution.reason}
      />
      {attribution.status === "unavailable" ? null : (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            {`Период ${formatPeriod(attribution.period)}, учитываются касания за ${
              attribution.lookback_days
            } дней до заказа. С визитами связано ${formatOrdersShare(
              coverage.linked_share,
            )}% заказов сайта; ${formatOrdersShare(
              coverage.multi_touch_share,
            )}% заказов сделаны после нескольких каналов.`}
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                "& th, & td": {
                  p: 1,
                  borderBottom: "1px solid #eef0f3",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  fontSize: 14,
                },
                "& th": {
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: 12,
                  whiteSpace: "normal",
                  verticalAlign: "bottom",
                },
                "& th:first-of-type, & td:first-of-type": { textAlign: "left" },
              }}
            >
              <thead>
                <tr>
                  <th>Канал</th>
                  <th>Касаний</th>
                  <th>Заказы по последнему касанию</th>
                  <th>Заказы на основе данных</th>
                  <th>Разница</th>
                  <th>Выручка на основе данных</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((item) => {
                  const difference =
                    item.difference_percent === null || item.difference_percent === undefined
                      ? null
                      : Number(item.difference_percent);

                  return (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{Number(item.touches || 0).toLocaleString("ru-RU")}</td>
                      <td>{formatOrdersShare(item.last_touch_orders)}</td>
                      <td>
                        <strong>{formatOrdersShare(item.data_driven_orders)}</strong>
                      </td>
                      <Box
                        component="td"
                        sx={{
                          color:
                            difference === null || Math.abs(difference) < 5
                              ? "text.secondary"
                              : difference > 0
                                ? "success.main"
                                : "error.main",
                        }}
                      >
                        {difference === null
                          ? "—"
                          : `${difference > 0 ? "+" : ""}${formatOrdersShare(difference)}%`}
                      </Box>
                      <td>{formatHistoryMoney(item.data_driven_revenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Box>
          </Box>
          {(attribution.insights || []).length > 0 ? (
            <Box
              component="ul"
              sx={{ mt: 1.5, mb: 0, pl: 2.5 }}
            >
              {attribution.insights.map((text, index) => (
                <Typography
                  key={`attribution_insight_${index}`}
                  component="li"
                  variant="body2"
                  sx={{ mb: 0.5 }}
                >
                  {text}
                </Typography>
              ))}
            </Box>
          ) : null}
          {attribution.method ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              {attribution.method}
            </Typography>
          ) : null}
        </>
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

const toNumberOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const formatSignedInt = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.trunc(n);
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString("ru-RU")}`;
};

const formatSignedMoneyShort = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n);
  const abs = Math.abs(rounded).toLocaleString("ru-RU");
  return `${rounded > 0 ? "+" : rounded < 0 ? "-" : ""}${abs} ₽`;
};

const formatPpDiff = (current, previous, digits = 2) => {
  const c = Number(current);
  const p = Number(previous);
  if (!Number.isFinite(c) || !Number.isFinite(p)) return null;
  const diff = c - p;
  if (diff === 0) return null;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  return `${sign}${Math.abs(diff).toFixed(digits)} п.п.`;
};

const getHistoryDeltaSummary = (currentItem, previousItem) => {
  if (!previousItem) return null;

  const ordersNow = toNumberOrNull(currentItem?.orders);
  const ordersPrev = toNumberOrNull(previousItem?.orders);
  const revenueNow = toNumberOrNull(currentItem?.revenue);
  const revenuePrev = toNumberOrNull(previousItem?.revenue);

  const ctrNow = toNumberOrNull(currentItem?.ctr);
  const ctrPrev = toNumberOrNull(previousItem?.ctr);
  const cpaNow = toNumberOrNull(currentItem?.cpa);
  const cpaPrev = toNumberOrNull(previousItem?.cpa);
  const conversionNow = toNumberOrNull(currentItem?.conversion);
  const conversionPrev = toNumberOrNull(previousItem?.conversion);

  const parts = [];

  if (ordersNow !== null && ordersPrev !== null) {
    const d = ordersNow - ordersPrev;
    if (d !== 0) parts.push(`Заказы ${formatSignedInt(d)}`);
  }
  if (revenueNow !== null && revenuePrev !== null) {
    const d = revenueNow - revenuePrev;
    if (d !== 0) parts.push(`Выручка ${formatSignedMoneyShort(d)}`);
  }

  const ctrDiff = formatPpDiff(ctrNow, ctrPrev, 2);
  if (ctrDiff) parts.push(`CTR ${ctrDiff}`);

  const cpaDiff = formatPpDiff(cpaNow, cpaPrev, 2);
  if (cpaDiff) parts.push(`CPA ${cpaDiff}`);

  const convDiff = formatPpDiff(conversionNow, conversionPrev, 2);
  if (convDiff) parts.push(`Конверсии ${convDiff}`);

  return parts.slice(0, 3).join(" · ");
};

const getThreadPreviewText = (thread) => {
  const count = Number(thread?.messages_count ?? thread?.messages?.length ?? 0);
  if (!thread) return `${count} сообщений`;

  const direct =
    thread.last_message_preview ||
    thread.last_message ||
    thread.last_text ||
    thread.last_answer_preview ||
    thread.last_prompt;
  const text = typeof direct === "string" ? direct : null;
  if (text) {
    const trimmed = text.trim().replace(/\s+/g, " ");
    return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
  }

  if (Array.isArray(thread.messages) && thread.messages.length) {
    const last = thread.messages[thread.messages.length - 1];
    const lastText = last?.text;
    if (typeof lastText === "string" && lastText.trim()) {
      const trimmed = lastText.trim().replace(/\s+/g, " ");
      return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
    }
  }

  return `${count} сообщений`;
};

export default function AiAnalystTab({
  cities,
  form,
  sources = [],
  sourceOptions = AI_ANALYST_SOURCES,
  comparison = DEFAULT_AI_COMPARISON,
  models = [],
  model = null,
  analysis,
  dailyMetrics = [],
  trafficSourceMetrics = [],
  siteDataRequestId,
  history = [],
  historyTotal = 0,
  historyChatMessages = null,
  chatThreads = [],
  activeChatThreadId = null,
  onCitiesChange,
  onFieldChange,
  onSourcesChange,
  onComparisonChange,
  onModelChange,
  onApply,
  onReset,
  onSendChat,
  onRateChatMessage,
  onSelectChatThread,
  onCreateChatThread,
  onUpdateChatThread,
  onDeleteChatThread,
  onSelectHistory,
  onDeleteHistory,
  onLoadMoreHistory,
  onExport,
  canExport = false,
  canExportData = false,
  onAnalyze,
  canAnalyze = false,
  onError,
  onNotice,
  attributionLoading = false,
  devices = null,
  devicesLoading = false,
  onLoadDevices,
  adInsights = null,
  adInsightsLoading = false,
  onLoadAdInsights,
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [reportHtml, setReportHtml] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [chatMenuAnchor, setChatMenuAnchor] = useState(null);
  const [aiGuideOpen, setAiGuideOpen] = useState(false);
  const [renameChatOpen, setRenameChatOpen] = useState(false);
  const [deleteChatOpen, setDeleteChatOpen] = useState(false);
  const [historyDeleteTarget, setHistoryDeleteTarget] = useState(null);
  const [historyDeleting, setHistoryDeleting] = useState(false);
  const [historyShowAll, setHistoryShowAll] = useState(false);
  const [schedulesOpen, setSchedulesOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const chatListRef = useRef(null);
  const chatRequestInFlightRef = useRef(false);
  const activeChatThread = chatThreads.find(
    (thread) => Number(thread.id) === Number(activeChatThreadId),
  );

  useEffect(() => {
    setChatMessages(Array.isArray(historyChatMessages) ? historyChatMessages : []);
    setChatLoading(false);
    chatRequestInFlightRef.current = false;
  }, [siteDataRequestId, activeChatThreadId, historyChatMessages]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const canChat = Boolean(analysis && siteDataRequestId && activeChatThreadId);
  const hasPendingChatMessage = chatMessages.some((message) => message?.isPending);
  const canSendChat = canChat && !hasPendingChatMessage;

  const handleSendChat = async (prompt, options = {}) => {
    if (!prompt || chatRequestInFlightRef.current || !canSendChat || !onSendChat) return;

    chatRequestInFlightRef.current = true;
    setChatMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setChatLoading(true);

    try {
      const data = await onSendChat(prompt, options);
      if (data?.st === false) {
        if (!data?.chat_synced) {
          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: data?.text || "Не удалось получить ответ AI",
              isError: true,
            },
          ]);
        }
        return;
      }

      if (!data?.chat_synced) {
        const reply = data?.answer || "Пустой ответ AI";
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: reply,
            aiModelName: data?.ai_model_name || null,
          },
        ]);
      }
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
      chatRequestInFlightRef.current = false;
      setChatLoading(false);
    }
  };

  const handleCopyChatAnswer = async (message) => {
    const text = [message?.text, chatTablesToText(message?.tables)].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      onNotice?.("Ответ скопирован");
    } catch (_) {
      onError?.("Не удалось скопировать ответ");
    }
  };

  const handleRateChatAnswer = (message, rating) => {
    if (message?.messageId) {
      onRateChatMessage?.(message.messageId, rating);
    }
  };

  const deepChatModel = (Array.isArray(models) ? models : []).find(
    (item) => item?.id === DEEP_CHAT_MODEL_ID,
  );
  const handleAskDeeper = (message) => {
    if (message?.question && deepChatModel) {
      handleSendChat(message.question, { modelId: deepChatModel.id });
    }
  };
  const lastAssistantIndex = chatMessages.reduce(
    (found, message, index) =>
      message?.role === "assistant" && !message.isPending && !message.isError ? index : found,
    -1,
  );

  const handleCreateChat = async () => {
    setChatMenuAnchor(null);
    await onCreateChatThread?.();
  };

  const handleRenameChat = () => {
    setChatMenuAnchor(null);
    setChatTitle(activeChatThread?.title || "");
    setRenameChatOpen(true);
  };

  const confirmRenameChat = async () => {
    const title = chatTitle.trim();
    if (!activeChatThreadId || !title) return;
    await onUpdateChatThread?.(activeChatThreadId, { title });
    setRenameChatOpen(false);
  };

  const handleTogglePin = async () => {
    setChatMenuAnchor(null);
    if (!activeChatThreadId) return;
    await onUpdateChatThread?.(activeChatThreadId, {
      is_pinned: !activeChatThread?.is_pinned,
    });
  };

  const confirmDeleteChat = async () => {
    if (!activeChatThreadId) return;
    await onDeleteChatThread?.(activeChatThreadId);
    setDeleteChatOpen(false);
  };

  const confirmDeleteHistory = async () => {
    const ids = historyDeleteTarget?.ids || [];
    if (!ids.length || historyDeleting) return;

    setHistoryDeleting(true);
    try {
      await onDeleteHistory?.(ids);
      setHistoryDeleteTarget(null);
    } finally {
      setHistoryDeleting(false);
    }
  };

  const visibleHistory = historyShowAll ? history : history.slice(0, HISTORY_COLLAPSED_COUNT);
  const hiddenHistoryCount = history.length - visibleHistory.length;
  const comparisonMode =
    AI_COMPARISON_MODES.find((item) => item.key === comparison?.mode) || AI_COMPARISON_MODES[0];
  const isCustomComparison = comparisonMode.key === "custom";

  const handleExportClick = (fileType) => {
    if (!canExport) return;
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
                  label={Math.max(Number(historyTotal) || 0, history.length)}
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {history.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Сохранённых отчётов пока нет
                </Typography>
              ) : (
                <>
                  {onDeleteHistory ? (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() =>
                          setHistoryDeleteTarget({
                            ids: history.map((item) => item.site_data_request_id ?? item.id),
                            label: `Отчётов к удалению: ${history.length}`,
                          })
                        }
                      >
                        Удалить все
                      </Button>
                    </Box>
                  ) : null}
                  <Box sx={{ border: "1px solid #e8ebf0", borderRadius: 2, overflow: "hidden" }}>
                    {visibleHistory.map((item, index) => {
                      const itemId = item.site_data_request_id ?? item.id;
                      const isActive = siteDataRequestId === itemId;
                      const previousItem = history[index + 1] || null;
                      const deltaSummary = getHistoryDeltaSummary(item, previousItem);
                      const sourcesText = Array.isArray(item.sources)
                        ? item.sources.join(", ")
                        : "";
                      const title = `${formatHistoryCity(item)}, ${formatHistoryPeriod(item)}`;

                      return (
                        <Box
                          key={itemId}
                          onClick={() => onSelectHistory?.(item)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            px: 1.5,
                            py: 0.75,
                            cursor: "pointer",
                            borderTop: index === 0 ? "none" : "1px solid #eef0f3",
                            backgroundColor: isActive ? "#fff5f7" : "white",
                            "&:hover": { backgroundColor: "#fffafb" },
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
                            <Typography
                              variant="body2"
                              noWrap
                              title={
                                [
                                  item.ai_summary,
                                  deltaSummary && `К предыдущему отчёту: ${deltaSummary}`,
                                ]
                                  .filter(Boolean)
                                  .join("\n") || undefined
                              }
                            >
                              <Box
                                component="span"
                                sx={{ fontWeight: 700 }}
                              >
                                {formatHistoryCity(item)}
                              </Box>
                              {` · ${formatHistoryPeriod(item)}`}
                              {sourcesText ? ` · ${sourcesText}` : ""}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ display: "block" }}
                            >
                              {`Заказы: ${Number(item.orders || 0).toLocaleString("ru-RU")} · Выручка: ${formatHistoryMoney(item.revenue)}`}
                              {Number(item.chat_messages_count || 0) > 0
                                ? ` · в чате: ${Number(item.chat_messages_count)}`
                                : ""}
                            </Typography>
                          </Box>
                          {item.origin === "schedule" ? (
                            <Chip
                              size="small"
                              variant="outlined"
                              label="По расписанию"
                            />
                          ) : null}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}
                          >
                            {item.created_at
                              ? dayjs(item.created_at).format("DD.MM.YYYY HH:mm")
                              : ""}
                          </Typography>
                          <Chip
                            size="small"
                            label={STATUS_LABELS[item.ai_status] || item.ai_status || "—"}
                            color={STATUS_COLORS[item.ai_status] || "default"}
                            variant="outlined"
                            sx={{ display: { xs: "none", md: "inline-flex" } }}
                          />
                          {onDeleteHistory ? (
                            <Tooltip title="Удалить отчёт">
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setHistoryDeleteTarget({ ids: [itemId], label: title });
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    {hiddenHistoryCount > 0 ? (
                      <Button
                        size="small"
                        onClick={() => setHistoryShowAll(true)}
                      >
                        {`Показать ещё ${hiddenHistoryCount}`}
                      </Button>
                    ) : null}
                    {historyShowAll && history.length > HISTORY_COLLAPSED_COUNT ? (
                      <Button
                        size="small"
                        onClick={() => setHistoryShowAll(false)}
                      >
                        Свернуть
                      </Button>
                    ) : null}
                    {hiddenHistoryCount === 0 &&
                    historyTotal > history.length &&
                    onLoadMoreHistory ? (
                      <Button
                        size="small"
                        onClick={() => {
                          setHistoryShowAll(true);
                          onLoadMoreHistory();
                        }}
                      >
                        {`Загрузить ещё (всего ${historyTotal})`}
                      </Button>
                    ) : null}
                  </Box>
                </>
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
                  label="Источники"
                  data={sourceOptions}
                  multiple={true}
                  value={sources}
                  isOptionEqualToValue={(option, value) => option?.name === value?.name}
                  func={(event, data) => onSourcesChange?.(Array.isArray(data) ? data : [])}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="Сравнить с"
                  data={AI_COMPARISON_MODES}
                  multiple={false}
                  disableClearable={true}
                  value={comparisonMode}
                  func={(event, data) =>
                    onComparisonChange?.({
                      ...comparison,
                      mode: data?.key || DEFAULT_AI_COMPARISON.mode,
                    })
                  }
                />
              </Grid>

              {isCustomComparison ? (
                <>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <MyDatePickerNew
                      label="Сравнение от"
                      customActions={true}
                      value={comparison?.dateStart ? dayjs(comparison.dateStart) : null}
                      maxDate={
                        comparison?.dateEnd ? dayjs(comparison.dateEnd) : dayjs().subtract(1, "day")
                      }
                      func={(value) => onComparisonChange?.({ ...comparison, dateStart: value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <MyDatePickerNew
                      label="Сравнение до"
                      customActions={true}
                      value={comparison?.dateEnd ? dayjs(comparison.dateEnd) : null}
                      minDate={comparison?.dateStart ? dayjs(comparison.dateStart) : undefined}
                      maxDate={dayjs().subtract(1, "day")}
                      func={(value) => onComparisonChange?.({ ...comparison, dateEnd: value })}
                    />
                  </Grid>
                </>
              ) : null}

              <Grid size={{ xs: 12, sm: 3 }}>
                <MyAutocomplite
                  label="Модель чата"
                  data={models}
                  multiple={false}
                  value={model}
                  func={(event, data) => onModelChange(data || models[0] || null)}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {model?.description || "Выбранная модель применяется к новым сообщениям"}
                </Typography>
              </Grid>

              <Grid
                size={{ xs: 12, sm: "grow" }}
                sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}
              >
                <StyledButton
                  variant="outlined"
                  onClick={() => setSchedulesOpen(true)}
                  startIcon={<ScheduleSendIcon />}
                >
                  Расписание
                </StyledButton>
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
                      {canExport ? (
                        <>
                          <StyledButton
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            endIcon={<KeyboardArrowDownIcon />}
                            disabled={!canExportData}
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
                        </>
                      ) : null}
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
                      const hint = getMetricHint(metric);
                      return (
                        <Tooltip
                          key={key}
                          title={<Box sx={{ whiteSpace: "pre-line" }}>{hint}</Box>}
                          arrow
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              minWidth: 0,
                              minHeight: 64,
                              border: "1px solid #eef0f3",
                              borderRadius: 2,
                              backgroundColor: "#f8f9fb",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              cursor: "help",
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
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Paper>
              </Grid>

              {analysis.attribution || attributionLoading ? (
                <Grid size={{ xs: 12 }}>
                  <AttributionSection
                    attribution={analysis.attribution}
                    loading={attributionLoading}
                  />
                </Grid>
              ) : null}

              {onLoadAdInsights ? (
                <Grid size={{ xs: 12 }}>
                  <AdInsightsSection
                    insights={adInsights}
                    loading={adInsightsLoading}
                    onLoad={onLoadAdInsights}
                  />
                </Grid>
              ) : null}

              {onLoadDevices ? (
                <Grid size={{ xs: 12 }}>
                  <DevicesSection
                    devices={devices}
                    loading={devicesLoading}
                    onLoad={onLoadDevices}
                  />
                </Grid>
              ) : null}

              {analysis.data_quality && (
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, borderColor: "#e8ebf0" }}
                  >
                    <SectionHeader title="Качество данных" />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Tooltip
                        title="Показатели отчёта относят заказ к источнику, сохранённому у него при оформлении. Вклад всех касаний — в блоке «Атрибуция заказов»."
                        arrow
                      >
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Основа показателей: UTM заказа (последнее касание)"
                        />
                      </Tooltip>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Покрытие расходов кампаниями: ${
                          analysis.data_quality.ads_mapping?.coverage_percent ?? "—"
                        }%`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Строк с показами: ${analysis.data_quality.ctr_rows_count || 0}`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`UTM-строк: ${analysis.data_quality.utm_rows_count || 0}`}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}

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

              <Grid size={{ xs: 12 }}>
                <Masonry
                  columns={{ xs: 1, lg: 2 }}
                  spacing={2}
                  defaultColumns={2}
                  defaultHeight={1200}
                  defaultSpacing={2}
                >
                  <Box>
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
                  </Box>

                  <Box>
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
                  </Box>

                  <Box>
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
                  </Box>

                  <Box>
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
                  </Box>

                  {DETAIL_SECTIONS.filter((section) => analysis[section.key]).map((section) => (
                    <Box key={section.key}>
                      <DetailCard
                        section={section}
                        data={analysis[section.key]}
                      />
                    </Box>
                  ))}
                </Masonry>
              </Grid>

              <Grid
                size={{ xs: 12 }}
                sx={{ height: "fit-content", alignSelf: "flex-start" }}
              >
                <Paper
                  variant="outlined"
                  sx={{ p: 2, height: "fit-content", borderRadius: 2, borderColor: "#e8ebf0" }}
                >
                  <SectionHeader title="Доступность данных" />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                      gap: 1.5,
                      alignItems: "start",
                    }}
                  >
                    {Object.entries(analysis.data_availability || {}).map(([key, item]) => (
                      <Box
                        key={key}
                        sx={{
                          p: 1.5,
                          height: "fit-content",
                          borderRadius: 1.5,
                          backgroundColor: "#f8f9fb",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
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
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        )}

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            height: { xs: "min(72dvh, 620px)", md: "calc(100dvh - 104px)" },
            minHeight: { xs: 420, md: 0 },
            position: { md: "sticky" },
            top: { md: 80 },
            alignSelf: { md: "flex-start" },
          }}
        >
          <Paper
            sx={{
              height: "100%",
              minHeight: 0,
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                minHeight: 64,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                >
                  Чат с AI-аналитиком
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: "block" }}
                >
                  {activeChatThread?.is_pinned ? "📌 " : ""}
                  {activeChatThread?.title || "Выберите чат"}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleCreateChat}
                aria-label="Создать чат"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(event) => setChatMenuAnchor(event.currentTarget)}
                aria-label="Управление чатами"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={chatMenuAnchor}
                open={Boolean(chatMenuAnchor)}
                onClose={() => setChatMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {chatThreads.map((thread) => (
                  <MenuItem
                    key={thread.id}
                    selected={Number(thread.id) === Number(activeChatThreadId)}
                    onClick={() => {
                      onSelectChatThread?.(thread.id);
                      setChatMenuAnchor(null);
                    }}
                  >
                    <ListItemText
                      primary={`${thread.is_pinned ? "📌 " : ""}${thread.title}`}
                      secondary={getThreadPreviewText(thread)}
                    />
                  </MenuItem>
                ))}
                {chatThreads.length > 0 && <Divider />}
                <MenuItem onClick={handleCreateChat}>
                  <AddIcon
                    fontSize="small"
                    sx={{ mr: 1 }}
                  />
                  Новый чат
                </MenuItem>
                {activeChatThread && (
                  <MenuItem onClick={handleTogglePin}>
                    <PushPinIcon
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    {activeChatThread.is_pinned ? "Открепить" : "Закрепить"}
                  </MenuItem>
                )}
                {activeChatThread && (
                  <MenuItem onClick={handleRenameChat}>
                    <EditIcon
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    Переименовать
                  </MenuItem>
                )}
                {activeChatThread && chatThreads.length > 1 && (
                  <MenuItem
                    onClick={() => {
                      setChatMenuAnchor(null);
                      setDeleteChatOpen(true);
                    }}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteIcon
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    Удалить
                  </MenuItem>
                )}
                <Divider />
                <MenuItem
                  onClick={() => {
                    setChatMenuAnchor(null);
                    setAiGuideOpen(true);
                  }}
                >
                  <InfoOutlinedIcon
                    fontSize="small"
                    sx={{ mr: 1 }}
                  />
                  Как работает AI-аналитик
                </MenuItem>
              </Menu>
            </Box>

            <Box
              ref={chatListRef}
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overscrollBehavior: "contain",
                scrollbarGutter: "stable",
                backgroundColor: "#f8f9fb",
                borderTop: "1px solid #eef0f3",
                borderBottom: "1px solid #eef0f3",
                p: 1.5,
              }}
            >
              {!canChat && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 6 }}
                >
                  Сначала примените фильтры и выберите чат
                </Typography>
              )}

              {canChat && chatMessages.length === 0 && !chatLoading && (
                <Box
                  sx={{
                    mt: 5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Задайте вопрос по текущему отчёту AI-анализа или начните с готового
                  </Typography>
                  <Box sx={{ maxWidth: 520 }}>
                    <ChatQuestionChips
                      questions={CHAT_STARTER_QUESTIONS}
                      disabled={!canSendChat}
                      onSelect={handleSendChat}
                    />
                  </Box>
                </Box>
              )}

              {chatMessages.map((message, index) => (
                <Box
                  key={message.id || `${message.role}_${index}`}
                  sx={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                    mb: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth:
                        message.role === "assistant" && message.tables?.length ? "100%" : "88%",
                      minWidth: 0,
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
                      wordBreak: "break-word",
                    }}
                  >
                    {message.isPending ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={14} />
                        <Typography variant="body2">
                          {CHAT_STAGE_LABELS[message.stage] || message.text}
                        </Typography>
                      </Box>
                    ) : message.role === "assistant" && !message.isError ? (
                      <>
                        <MemoizedMarkdownMessage text={message.text} />
                        {(Array.isArray(message.tables) ? message.tables : []).map(
                          (table, tableIndex) => (
                            <ChatAnswerTable
                              key={`${message.id || index}_table_${tableIndex}`}
                              table={table}
                            />
                          ),
                        )}
                        <ChatAnswerFooter
                          message={message}
                          canAskDeeper={
                            Boolean(deepChatModel) &&
                            !String(message.aiModelName || "").includes("DeepSeek")
                          }
                          disabled={!canSendChat}
                          onCopy={handleCopyChatAnswer}
                          onRate={handleRateChatAnswer}
                          onAskDeeper={handleAskDeeper}
                        />
                        {index === lastAssistantIndex ? (
                          <Box sx={{ mt: 1 }}>
                            <ChatQuestionChips
                              questions={message.suggestions}
                              disabled={!canSendChat}
                              onSelect={handleSendChat}
                            />
                          </Box>
                        ) : null}
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {message.text}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}

              {chatLoading && !hasPendingChatMessage && (
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

            <ChatComposer
              canChat={canChat}
              loading={chatLoading || hasPendingChatMessage}
              threadId={activeChatThreadId}
              onSend={handleSendChat}
            />
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        open={aiGuideOpen}
        onClose={() => setAiGuideOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 0, sm: 3 },
              m: { xs: 0, sm: 2 },
              width: { xs: "100%", sm: "calc(100% - 32px)" },
              height: { xs: "100dvh", sm: "auto" },
              maxHeight: { xs: "100dvh", sm: "calc(100dvh - 32px)" },
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            pr: 1.5,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Как работает AI-аналитик
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Памятка по данным, ограничениям и формулировке запросов
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setAiGuideOpen(false)}
            aria-label="Закрыть инструкцию"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "#f7f8fb" }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              mb: 2.5,
              borderRadius: 2.5,
              borderColor: "#eadce1",
              background: "linear-gradient(135deg, #fff 0%, #fff5f7 100%)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <AutoAwesomeIcon sx={{ color: PRIMARY_COLOR, mt: 0.25 }} />
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                >
                  Аналитика на базе моделей Yandex AI Studio
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Модель видит только агрегированные показатели выбранного отчёта: город, период,
                  источник, KPI, дневную динамику, аномалии и текстовые выводы. При необходимости
                  сервер может дозапросить данные через инструменты только на чтение. Сырые заказы и
                  персональные данные в модель не уходят.
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1.5 }}
          >
            Как проходит запрос
          </Typography>
          <Grid
            container
            spacing={1.5}
            alignItems="stretch"
            sx={{ mb: 3 }}
          >
            {[
              [
                "1",
                "Выберите отчёт",
                "Укажите город, даты «от» и «до», при необходимости источник. Нажмите «Применить». Можно открыть прошлый отчёт из истории — чат и дашборд подтянутся вместе с ним.",
              ],
              [
                "2",
                "Задайте вопрос",
                "Пишите в чат справа: какие даты сравнить, какие метрики нужны (заказы, выручка, расходы, CPA, ROMI) и в каком виде ответ — таблица, список причин или рекомендации.",
              ],
              [
                "3",
                "Проверьте ответ",
                "Факты должны опираться на цифры отчёта. Если данных нет, AI обязан это сказать. «Анализировать» собирает HTML-отчёт, «Экспортировать» — xlsx, docx или pdf.",
              ],
            ].map(([number, title, text]) => (
              <Grid
                key={number}
                size={{ xs: 12, sm: 4 }}
                sx={{ display: "flex" }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    borderColor: "#e3e7ed",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        color: "white",
                        backgroundColor: PRIMARY_COLOR,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {number}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1.5 }}
          >
            Какую модель выбрать
          </Typography>
          <Grid
            container
            spacing={1.5}
            alignItems="stretch"
            sx={{ mb: 1.5 }}
          >
            {AI_MODEL_GUIDE.map(([title, when, examples]) => (
              <Grid
                key={title}
                size={{ xs: 12, sm: 4 }}
                sx={{ display: "flex" }}
              >
                <Paper
                  variant="outlined"
                  sx={{ p: 2, width: "100%", flex: 1, borderRadius: 2, borderColor: "#e3e7ed" }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ mb: 0.75 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.75 }}
                  >
                    {when}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {examples}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Если выбранная модель не ответила, вопрос автоматически уходит резервной YandexGPT Pro —
            под ответом будет подпись «YandexGPT Pro (резервная)». Модель можно менять между
            вопросами в одном чате.
          </Typography>

          <Grid
            container
            spacing={2}
            alignItems="stretch"
            sx={{ mb: 3 }}
          >
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex" }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  width: "100%",
                  flex: 1,
                  borderRadius: 2.5,
                  borderColor: "#cdeedc",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 1 }}
                >
                  Какие данные используются
                </Typography>
                <Box
                  component="ul"
                  sx={{ m: 0, pl: 2.5, color: "text.secondary" }}
                >
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    расходы, выручка, заказы, визиты, клики, CPA, CTR, ROMI/ROI и конверсия — если
                    статус метрики «доступно»;
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    сравнение с предыдущим периодом той же длины и аномалии при изменении больше
                    15%;
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    источники и UTM (source, medium, campaign, content, term), лучшие/худшие
                    объявления и ключевые по UTM;
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                  >
                    последние сообщения чата и краткая память диалога по текущему отчёту.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex" }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  width: "100%",
                  flex: 1,
                  borderRadius: 2.5,
                  borderColor: "#cfe1fb",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 1 }}
                >
                  Как защищаются данные
                </Typography>
                <Box
                  component="ul"
                  sx={{ m: 0, pl: 2.5, color: "text.secondary" }}
                >
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    ФИО, телефоны, e-mail, адреса доставки и строки заказов в модель не передаются;
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    точки заменяются стабильными ярлыками «Кафе 1», «Кафе 2» без реального адреса;
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    токены, пароли и скрытые управляющие символы из текста чата удаляются;
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                  >
                    чат видит только авторизованный сотрудник; чужие отчёты из истории недоступны.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mb: 1 }}
          >
            Как лучше формировать запрос
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Чем конкретнее вопрос, тем точнее ответ. Укажите период, город (если он важен сверх
            фильтра), метрики и формат. Если нужны другие даты, чем в отчёте, напишите это явно —
            иначе AI опирается на текущий выбранный период.
          </Typography>
          <Box
            component="ul"
            sx={{ m: 0, mb: 1.5, pl: 2.5, color: "text.secondary" }}
          >
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 0.5 }}
            >
              Хорошо: «Сравни 1–15 июля и 1–15 августа по заказам, выручке и CPA. Если CPA нет — так
              и напиши».
            </Typography>
            <Typography
              component="li"
              variant="body2"
              sx={{ mb: 0.5 }}
            >
              Слабо: «Что у нас с рекламой?» — слишком широко, без периода и метрик.
            </Typography>
            <Typography
              component="li"
              variant="body2"
            >
              Для прогноза отдельно скажите «это прогноз», иначе AI должен опираться только на факт.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
            {[
              "Сравни текущий период с предыдущим: заказы, выручку, расходы, CPA и ROMI. Если метрика недоступна — объясни почему.",
              "Покажи топ источников по выручке и заказам. Какие UTM кампании стоит масштабировать, а какие отключить?",
              "Найди аномалии больше 15% и свяжи их с проблемами в отчёте. Не выдумывай визиты, если их нет.",
              "Собери рекомендации по бюджету: куда добавить расходы, а что отключить. Опирайся только на факты отчёта.",
            ].map((example) => (
              <Paper
                key={example}
                variant="outlined"
                sx={{ px: 1.75, py: 1.25, borderRadius: 2, borderColor: "#e3e7ed" }}
              >
                <Typography variant="body2">«{example}»</Typography>
              </Paper>
            ))}
          </Box>

          <Paper
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 2.5, borderColor: "#f7dfaa", backgroundColor: "#fffaf0" }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
              <WarningAmberIcon
                color="warning"
                sx={{ mt: 0.25, flexShrink: 0 }}
              />
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 0.75 }}
                >
                  Важные ограничения
                </Typography>
                <Box
                  component="ul"
                  sx={{ m: 0, pl: 2.5, color: "text.secondary" }}
                >
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    «Нет данных» и «значение 0» — разные вещи. Расход 0 ₽ означает, что цифра есть и
                    равна нулю; CPA/ROMI при этом часто посчитать нельзя.
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    Визиты, клики, CTR, аудитория, площадки и поисковые запросы могут быть
                    недоступны. Объявления и ключи часто берутся из UTM, а не из Директа.
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.75 }}
                  >
                    Полные маркетинговые ряды стабильны в основном с 2025 года. Периоды с разной
                    атрибуцией нельзя сравнивать как одинаковые.
                  </Typography>
                  <Typography
                    component="li"
                    variant="body2"
                  >
                    Прогноз на незакрытый период — линейный run-rate без сезонности, уверенность
                    низкая. Не вставляйте в чат телефоны, ФИО и доступы.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            Чаты принадлежат сотруднику и привязаны к отчёту. Название создаётся по первому запросу,
            его можно переименовать, закрепить или удалить через меню. История сообщений хранится
            180 дней.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <StyledButton
            variant="primary"
            onClick={() => setAiGuideOpen(false)}
          >
            Понятно
          </StyledButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={renameChatOpen}
        onClose={() => setRenameChatOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Название чата</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Тема"
            value={chatTitle}
            onChange={(event) => setChatTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") confirmRenameChat();
            }}
            sx={{ mt: 1 }}
            slotProps={{
              htmlInput: { maxLength: 160 },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameChatOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={confirmRenameChat}
            disabled={!chatTitle.trim()}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteChatOpen}
        onClose={() => setDeleteChatOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Удалить чат?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Чат «{activeChatThread?.title}» и вся его история будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteChatOpen(false)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteChat}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      <AiReportSchedulesDialog
        open={schedulesOpen}
        onClose={() => setSchedulesOpen(false)}
        cities={cities}
        sourceOptions={sourceOptions}
        onError={onError}
        onNotice={onNotice}
      />
      <Dialog
        open={Boolean(historyDeleteTarget)}
        onClose={() => (historyDeleting ? null : setHistoryDeleteTarget(null))}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {(historyDeleteTarget?.ids?.length || 0) > 1 ? "Удалить отчёты?" : "Удалить отчёт?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {(historyDeleteTarget?.ids?.length || 0) > 1
              ? `${historyDeleteTarget?.label}. Восстановить их не получится.`
              : `Отчёт «${historyDeleteTarget?.label}» будет удалён. Восстановить его не получится.`}{" "}
            Переписка в чатах сохранится.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setHistoryDeleteTarget(null)}
            disabled={historyDeleting}
          >
            Отмена
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteHistory}
            disabled={historyDeleting}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={reportOpen}
        onClose={closeReportModal}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              minHeight: { xs: "70vh", md: "80vh" },
            },
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
