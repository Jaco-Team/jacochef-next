import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import { api_laravel_local, api_laravel } from "@/src/api_new";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import MyAlert from "@/ui/MyAlert";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import EndAnalyticsColumnsDialog from "@/components/end_analytics/EndAnalyticsColumnsDialog";
import AiAnalystTab, { AI_ANALYST_SOURCES } from "@/components/end_analytics/AiAnalystTab";
import {
  DEFAULT_END_ANALYTICS_VISIBLE_COLUMNS,
  END_ANALYTICS_COLUMNS,
  END_ANALYTICS_COLUMNS_STORAGE_KEY,
} from "@/components/end_analytics/endAnalyticsColumns";

const PRIMARY_COLOR = "#cc0033";
const BACKGROUND_COLOR = "#f5f5f5";
const EMPTY_CUSTOM_COST_OPTIONS = {
  src_source: [],
  src_medium: [],
  src_campaign: [],
  src_term: [],
  src_content: [],
};

const createEmptyCustomCostForm = () => ({
  id: null,
  city_id: 0,
  date: dayjs().format("YYYY-MM-DD"),
  src_source: "",
  src_medium: "",
  src_campaign: "",
  src_term: "",
  src_content: "",
  cost: "",
  comment: "",
});

function UtmFreeSoloAutocomplete({ label, value, options, onChange }) {
  return (
    <Autocomplete
      freeSolo
      size="small"
      options={options || []}
      value={value || null}
      onChange={(_, nextValue) => onChange(nextValue || "")}
      onInputChange={(_, nextValue, reason) => {
        if (reason !== "reset") onChange(nextValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth
        />
      )}
    />
  );
}

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

const StyledToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
  textTransform: "none",
  fontWeight: selected ? 600 : 400,
  padding: "8px 20px",
  border: "1px solid #e0e0e0",
  ...(selected && {
    backgroundColor: PRIMARY_COLOR,
    color: "white",
    "&:hover": {
      backgroundColor: "#a00028",
    },
  }),
  "&:not(:last-of-type)": {
    borderRight: "none",
  },
  "&:first-of-type": {
    borderTopLeftRadius: "6px",
    borderBottomLeftRadius: "6px",
  },
  "&:last-of-type": {
    borderTopRightRadius: "6px",
    borderBottomRightRadius: "6px",
  },
}));

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => !["isHeader", "isTotal", "noWrap"].includes(prop),
})(({ theme, isHeader, isTotal, noWrap }) => ({
  fontWeight: isHeader ? 600 : isTotal ? 700 : 400,
  backgroundColor: isHeader ? PRIMARY_COLOR : isTotal ? "#fafafa" : "transparent",
  color: isHeader ? "white" : "inherit",
  borderBottom: isTotal ? "2px solid #e0e0e0" : "1px solid #f0f0f0",
  padding: "12px 16px",
  ...(noWrap && {
    whiteSpace: "nowrap",
  }),
  ...(!isHeader && {
    "&:first-of-type": {
      position: "sticky",
      left: 0,
      zIndex: 2,
      backgroundColor: isTotal ? "#fafafa" : "white",
      minWidth: 280,
      maxWidth: 350,
      whiteSpace: "normal",
      wordBreak: "break-word",
      boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)",
    },
  }),
  ...(isHeader && {
    "&:first-of-type": {
      position: "sticky",
      left: 0,
      zIndex: 3,
      backgroundColor: PRIMARY_COLOR,
      minWidth: 280,
      maxWidth: 350,
    },
  }),
}));

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => !["isTotal", "isGrandTotal"].includes(prop),
})(({ theme, isTotal, isGrandTotal }) => ({
  backgroundColor: isGrandTotal ? "#f5f5f5" : isTotal ? "#fafafa" : "transparent",
  "&:hover": {
    backgroundColor: isTotal || isGrandTotal ? "inherit" : "#f9f9f9",
  },
  "&:hover .MuiTableCell-root:first-of-type": {
    backgroundColor: isTotal || isGrandTotal ? "inherit" : "#f9f9f9",
  },
}));

const StickyTableContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "tableMinWidth",
})(({ tableMinWidth }) => ({
  position: "relative",
  overflowX: "auto",
  width: "100%",
  "& .MuiTable-root": {
    minWidth: tableMinWidth,
  },
}));

const ADDITIVE_METRIC_FIELDS = [
  "visits",
  "cost",
  "orders",
  "revenue",
  "newClients",
  "existingClients",
  "primaryOrders",
  "repeatOrders",
];
const DERIVED_METRIC_FIELDS = ["conversion", "costPerOrder", "averageCheck", "roi", "drr", "ltv"];

const parseMetric = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const buildTrafficSourceMetrics = (apiData) => {
  const totals = new Map();
  const addSource = (name, value) => {
    const sourceName = String(name || "not_set");
    totals.set(sourceName, (totals.get(sourceName) || 0) + parseMetric(value));
  };

  if (apiData?.site_data && typeof apiData.site_data === "object") {
    Object.entries(apiData.site_data).forEach(([key, item]) => {
      if (item?.level === "src_source") {
        addSource(item.name || key, item.cost);
      }
    });
  }

  if (
    totals.size === 0 &&
    apiData?.site_data_by_category &&
    typeof apiData.site_data_by_category === "object"
  ) {
    const collectNormalizedSources = (nodes) => {
      (Array.isArray(nodes) ? nodes : Object.values(nodes || {})).forEach((node) => {
        if (node?.level === "normalized_source") {
          addSource(node.name || node.value || node.normalized_source, node.cost);
          return;
        }
        if (node?.children) {
          collectNormalizedSources(node.children);
        }
      });
    };

    collectNormalizedSources(apiData.site_data_by_category);
  }

  return Array.from(totals, ([name, value]) => ({ name, value })).filter((item) => item.value > 0);
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed || (trimmed[0] !== "{" && trimmed[0] !== "[")) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch (_) {
    return value;
  }
};

const normalizeAiSiteDataSnapshot = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  const normalized = { ...payload };
  [
    "ai_analysis",
    "site_data",
    "site_data_by_category",
    "site_totals",
    "daily_metrics",
    "analytics_meta",
    "request_payload",
    "ai_chat",
    "ai_chat_threads",
    "data_availability",
  ].forEach((field) => {
    if (field in normalized) {
      normalized[field] = parseMaybeJson(normalized[field]);
    }
  });

  if (
    normalized.daily_metrics &&
    typeof normalized.daily_metrics === "object" &&
    !Array.isArray(normalized.daily_metrics) &&
    "items" in normalized.daily_metrics
  ) {
    normalized.daily_metrics = {
      ...normalized.daily_metrics,
      items: parseMaybeJson(normalized.daily_metrics.items),
    };
  }

  return normalized;
};

const calculateRoi = (revenue, cost) => {
  const totalRevenue = parseMetric(revenue);
  const totalCost = parseMetric(cost);
  return totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
};

const hasMetricValue = (item, field) =>
  item[field] !== null && item[field] !== undefined && item[field] !== "";

const pickDerivedMetrics = (item) =>
  DERIVED_METRIC_FIELDS.reduce((acc, field) => {
    if (hasMetricValue(item, field)) {
      acc[field] = parseMetric(item[field]);
    }
    return acc;
  }, {});

const pickOptionalMetrics = (item) => ({
  clicks: item.clicks ?? null,
  clicksAvailable: Boolean(item.clicksAvailable),
});

const applyOptionalAggregates = (item, rows) => {
  const sourceRows = rows || [];

  item.clicksAvailable =
    sourceRows.length > 0 && sourceRows.every((row) => Boolean(row.clicksAvailable));
  item.clicks = item.clicksAvailable
    ? sourceRows.reduce((sum, row) => sum + parseMetric(row.clicks), 0)
    : null;

  return item;
};

const applyAggregatedRoi = (item, rows) => {
  let roiRevenue = 0;
  let roiCost = 0;

  (rows || []).forEach((row) => {
    roiRevenue += parseMetric(row.revenue);
    roiCost += parseMetric(row.cost);
  });

  item.roiRevenue = roiRevenue;
  item.roiCost = roiCost;
  item.roi = calculateRoi(roiRevenue, roiCost);

  return item;
};

const applyDerivedMetrics = (item) => {
  const visits = parseMetric(item.visits);
  const cost = parseMetric(item.cost);
  const orders = parseMetric(item.orders);
  const revenue = parseMetric(item.revenue);

  item.visits = visits;
  item.cost = cost;
  item.orders = orders;
  item.revenue = revenue;
  item.newClients = parseMetric(item.newClients);
  item.existingClients = parseMetric(item.existingClients);
  item.primaryOrders = parseMetric(item.primaryOrders);
  item.repeatOrders = parseMetric(item.repeatOrders);

  item.conversion = hasMetricValue(item, "conversion")
    ? parseMetric(item.conversion)
    : visits > 0
      ? (orders / visits) * 100
      : 0;
  item.costPerOrder = hasMetricValue(item, "costPerOrder")
    ? parseMetric(item.costPerOrder)
    : orders > 0
      ? cost / orders
      : 0;
  item.averageCheck = hasMetricValue(item, "averageCheck")
    ? parseMetric(item.averageCheck)
    : orders > 0
      ? revenue / orders
      : 0;
  item.roi = hasMetricValue(item, "roi") ? parseMetric(item.roi) : calculateRoi(revenue, cost);
  item.roiRevenue = cost > 0 ? revenue : 0;
  item.roiCost = cost > 0 ? cost : 0;
  item.drr = hasMetricValue(item, "drr")
    ? parseMetric(item.drr)
    : revenue > 0
      ? (cost / revenue) * 100
      : 0;
  const customers = item.newClients + item.existingClients;
  item.ltv = hasMetricValue(item, "ltv")
    ? parseMetric(item.ltv)
    : customers > 0
      ? revenue / customers
      : 0;

  item.clicksAvailable = Boolean(item.clicksAvailable);
  item.clicks = item.clicksAvailable ? parseMetric(item.clicks) : null;

  return item;
};

const aggregateTotalRow = (item, rows) => {
  ADDITIVE_METRIC_FIELDS.forEach((field) => {
    item[field] = 0;
  });

  (rows || []).forEach((row) => {
    ADDITIVE_METRIC_FIELDS.forEach((field) => {
      item[field] += parseMetric(row[field]);
    });
  });

  item.details = rows || [];
  applyOptionalAggregates(item, rows);
  applyDerivedMetrics(item);
  return applyAggregatedRoi(item, rows);
};

const applyServerTotals = (item, totals) => {
  if (!totals || typeof totals !== "object" || Array.isArray(totals)) {
    return item;
  }

  ADDITIVE_METRIC_FIELDS.forEach((field) => {
    if (hasMetricValue(totals, field)) {
      item[field] = parseMetric(totals[field]);
    }
  });
  DERIVED_METRIC_FIELDS.forEach((field) => {
    if (hasMetricValue(totals, field)) {
      item[field] = parseMetric(totals[field]);
    }
  });

  item.uniqueClients = parseMetric(totals.uniqueClients);
  item.clicksAvailable = Boolean(totals.clicksAvailable);
  item.clicks = item.clicksAvailable ? parseMetric(totals.clicks) : null;
  item.roiRevenue = parseMetric(item.revenue);
  item.roiCost = parseMetric(item.cost);

  return applyDerivedMetrics(item);
};

const applyTotalMetricsFromRows = (item, rows) => {
  ADDITIVE_METRIC_FIELDS.forEach((field) => {
    item[field] = 0;
  });

  (rows || []).forEach((row) => {
    ADDITIVE_METRIC_FIELDS.forEach((field) => {
      item[field] += parseMetric(row[field]);
    });
  });

  applyOptionalAggregates(item, rows);
  applyDerivedMetrics(item);
  return applyAggregatedRoi(item, rows);
};

const rollupMetricsFromChildren = (item) => {
  const childKey =
    item.children?.length > 0 ? "children" : item.details?.length > 0 ? "details" : null;

  if (childKey) {
    item[childKey] = item[childKey].map(rollupMetricsFromChildren);

    if (!item.useServerMetrics) {
      ADDITIVE_METRIC_FIELDS.forEach((field) => {
        item[field] = 0;
      });

      item[childKey].forEach((child) => {
        ADDITIVE_METRIC_FIELDS.forEach((field) => {
          item[field] += parseMetric(child[field]);
        });
      });
      applyOptionalAggregates(item, item[childKey]);
    } else {
      ADDITIVE_METRIC_FIELDS.forEach((field) => {
        item[field] = parseMetric(item[field]);
      });
    }

    applyDerivedMetrics(item);
    return item.useServerMetrics ? item : applyAggregatedRoi(item, item[childKey]);
  }

  ADDITIVE_METRIC_FIELDS.forEach((field) => {
    item[field] = parseMetric(item[field]);
  });

  return applyDerivedMetrics(item);
};

function EndPage() {
  const standardForm = {
    points: [],
    dateStart: dayjs(new Date()).subtract(1, "day").format("YYYY-MM-DD"),
    dateEnd: dayjs(new Date()).subtract(1, "day").format("YYYY-MM-DD"),
    cities: {},
    src_source: "",
    src_medium: "",
    src_campaign: "",
    src_term: "",
    src_content: "",
    payOrderStart: null,
    payOrderEnd: null,
    typeClient: { id: 1, name: "Все" },
    roi: null,
    orderStart: null,
    orderEnd: null,
    typeOrder: [{ id: 2, name: "Сайт" }],
  };
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [access, setAccess] = useState(null);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState(standardForm);
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState("");
  const [analyticsMeta, setAnalyticsMeta] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [customCostDialogOpen, setCustomCostDialogOpen] = useState(false);
  const [customCosts, setCustomCosts] = useState([]);
  const [customCostOptions, setCustomCostOptions] = useState(EMPTY_CUSTOM_COST_OPTIONS);
  const [customCostForm, setCustomCostForm] = useState(createEmptyCustomCostForm);
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_END_ANALYTICS_VISIBLE_COLUMNS);
  const [activeTab, setActiveTab] = useState(false);
  const [aiSource, setAiSource] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [siteDataRequestId, setSiteDataRequestId] = useState(null);
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [trafficSourceMetrics, setTrafficSourceMetrics] = useState([]);
  const [siteDataHistory, setSiteDataHistory] = useState([]);
  const [historyChatMessages, setHistoryChatMessages] = useState(null);
  const [aiChatThreads, setAiChatThreads] = useState([]);
  const [activeChatThreadId, setActiveChatThreadId] = useState(null);
  const [aiSiteDataSnapshot, setAiSiteDataSnapshot] = useState(null);
  const accessApi = handleUserAccess(access || {});
  const canViewAnalytics = access !== null && accessApi.userCan("access", "analytics");
  const canViewAiAnalyst = access !== null && accessApi.userCan("access", "ai_analyst");
  const canExportReport = access !== null && accessApi.userCan("access", "export");

  useEffect(() => {
    getData("get_all").then((data) => {
      const nextAccess = data.access || {};
      const nextAccessApi = handleUserAccess(nextAccess);

      document.title = data.module_info.name;
      setModule(data.module_info);
      setAccess(nextAccess);
      setActiveTab(
        nextAccessApi.userCan("access", "analytics")
          ? 0
          : nextAccessApi.userCan("access", "ai_analyst")
            ? 1
            : false,
      );
      setCities(data.cities);
      setSiteDataHistory(data.site_data_history || []);
      const initialThreads = Array.isArray(data.ai_chat_threads) ? data.ai_chat_threads : [];
      if (initialThreads.length) {
        applyChatThreads(initialThreads);
        const initialThread =
          initialThreads.find((thread) => thread.is_pinned) || initialThreads[0] || null;
        if (initialThread) {
          setActiveChatThreadId(initialThread.id);
          loadChatThreadMessages(initialThread.id);
        }
      }
      setLastUpdate(dayjs().format("HH:mm"));
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedColumns = JSON.parse(
        window.localStorage.getItem(END_ANALYTICS_COLUMNS_STORAGE_KEY),
      );
      if (savedColumns && typeof savedColumns === "object" && !Array.isArray(savedColumns)) {
        setVisibleColumns({
          ...DEFAULT_END_ANALYTICS_VISIBLE_COLUMNS,
          ...savedColumns,
        });
      }
    } catch (_) {
      window.localStorage.removeItem(END_ANALYTICS_COLUMNS_STORAGE_KEY);
      setVisibleColumns(DEFAULT_END_ANALYTICS_VISIBLE_COLUMNS);
    }
  }, []);

  const saveVisibleColumns = (columns) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(END_ANALYTICS_COLUMNS_STORAGE_KEY, JSON.stringify(columns));
    }
  };

  const toggleColumn = (key) => {
    setVisibleColumns((current) => {
      const next = {
        ...current,
        [key]: current[key] === false,
      };
      saveVisibleColumns(next);
      return next;
    });
  };

  const setAllColumns = (value) => {
    const next = END_ANALYTICS_COLUMNS.reduce((result, column) => {
      result[column.key] = value;
      return result;
    }, {});
    saveVisibleColumns(next);
    setVisibleColumns(next);
  };

  const resetColumns = () => {
    const next = { ...DEFAULT_END_ANALYTICS_VISIBLE_COLUMNS };
    saveVisibleColumns(next);
    setVisibleColumns(next);
  };

  const visibleColumnDefinitions = END_ANALYTICS_COLUMNS.filter(
    (column) => visibleColumns[column.key] !== false,
  );
  const tableMinWidth =
    300 + visibleColumnDefinitions.reduce((total, column) => total + (column.width || 120), 0);

  const getData = async (method, data = {}) => {
    setIsLoad(true);
    try {
      const result = await api_laravel("end_analytics", method, data);
      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCitiesChange = (value) => {
    setField("cities", value);
  };

  const handleTypeOrderChange = (event, newValue) => {
    if (newValue === null) return;

    const isAllSelected = newValue.includes("all");

    if (isAllSelected) {
      setField("typeOrder", [{ id: 1, name: "Все" }]);
    } else {
      const filteredValue = newValue.filter((v) => v !== "all");

      if (filteredValue.length === 0) {
        setField("typeOrder", [{ id: 1, name: "Все" }]);
      } else {
        const selectedTypes = filteredValue.map((type) => {
          const typeMap = { site: 2, cafe: 3, kc: 4 };
          const nameMap = { site: "Сайт", cafe: "Кафе", kc: "КЦ" };
          return { id: typeMap[type], name: nameMap[type] };
        });
        setField("typeOrder", selectedTypes);
      }
    }
  };

  const applyRequest = async () => {
    if (isLoad) return;

    console.log("Фильтры:", form);
    setTableData([]);
    setAnalyticsMeta(null);

    try {
      const data = await getData("get_data", {
        ...form,
        dateStart: dayjs(form.dateStart).format("YYYY-MM-DD"),
        dateEnd: dayjs(form.dateEnd).format("YYYY-MM-DD"),
      });
      if (data?.st) {
        const formattedData = formatApiData(data);
        setTableData(formattedData);
        setAnalyticsMeta(data.analytics_meta || null);
        setLastUpdate(dayjs().format("HH:mm"));
      } else {
        showError(data?.text || "Не удалось загрузить аналитику");
      }
    } catch (_) {
      showError("Не удалось загрузить аналитику");
    }
  };

  const refreshSiteDataHistory = async () => {
    const data = await getData("get_all");
    if (data?.module_info) {
      setSiteDataHistory(data.site_data_history || []);
    }
  };

  const mapAiChatToMessages = (aiChat) => {
    if (!Array.isArray(aiChat)) return [];

    return aiChat.flatMap((item) => {
      const messages = [];
      if (item?.prompt) {
        messages.push({
          id: `${item.id || "message"}-user`,
          role: "user",
          text: item.prompt,
          dataRefs: item.context_meta?.data_refs || [],
        });
      }
      if (item?.answer) {
        messages.push({
          id: `${item.id || "message"}-assistant`,
          role: "assistant",
          text: item.answer,
          dataRefs: item.context_meta?.data_refs || [],
          limitations: item.context_meta?.limitations || [],
        });
      } else if (item?.status === "error") {
        messages.push({
          id: `${item.id || "message"}-error`,
          role: "assistant",
          text: "Не удалось получить ответ AI. Предыдущая история чата сохранена.",
          isError: true,
          dataRefs: item.context_meta?.data_refs || [],
        });
      }
      return messages;
    });
  };

  const restoreChatThreads = (threads, legacyChat) => {
    const nextThreads = Array.isArray(threads)
      ? threads.map((thread) => ({
          ...thread,
          messages: Array.isArray(thread?.messages) ? thread.messages : [],
        }))
      : [];

    if (!nextThreads.length || !Array.isArray(legacyChat)) {
      return nextThreads;
    }

    const knownMessageIds = new Set(
      nextThreads.flatMap((thread) => thread.messages.map((message) => Number(message?.id))),
    );
    const legacyMessages = legacyChat.filter(
      (message) =>
        message?.thread_id == null && (!message?.id || !knownMessageIds.has(Number(message.id))),
    );

    if (!legacyMessages.length) {
      return nextThreads;
    }

    return nextThreads.map((thread, index) =>
      index === 0 ? { ...thread, messages: [...thread.messages, ...legacyMessages] } : thread,
    );
  };

  const applyChatThreads = (threads, preferredThreadId = null) => {
    const nextThreads = Array.isArray(threads) ? threads : [];
    const selected =
      nextThreads.find((thread) => Number(thread.id) === Number(preferredThreadId)) ||
      nextThreads.find((thread) => thread.is_pinned) ||
      nextThreads[0] ||
      null;

    setAiChatThreads(nextThreads);
    setActiveChatThreadId(selected?.id ?? null);
    if (Array.isArray(selected?.messages)) {
      setHistoryChatMessages(mapAiChatToMessages(selected.messages));
    }
  };

  const loadChatThreadMessages = async (threadId) => {
    if (!threadId) return [];
    const result = await api_laravel("end_analytics", "get_ai_chat_thread_messages", {
      thread_id: threadId,
      page: 1,
      per_page: 100,
    });
    const data = result?.data && typeof result.data === "object" ? result.data : result || {};
    if (data?.st === false) {
      return [];
    }
    const messages = Array.isArray(data.messages) ? data.messages : data.items || [];
    setAiChatThreads((current) =>
      current.map((thread) =>
        Number(thread.id) === Number(threadId) ? { ...thread, messages } : thread,
      ),
    );
    setHistoryChatMessages(mapAiChatToMessages(messages));
    return messages;
  };

  const selectChatThread = async (threadId) => {
    const selected = aiChatThreads.find((thread) => Number(thread.id) === Number(threadId));
    setActiveChatThreadId(selected?.id ?? null);
    if (!selected) {
      setHistoryChatMessages([]);
      return;
    }
    if (Array.isArray(selected.messages) && selected.messages.length > 0) {
      setHistoryChatMessages(mapAiChatToMessages(selected.messages));
    } else {
      await loadChatThreadMessages(selected.id);
    }
  };

  const applyAiRequest = () => {
    setAiAnalysis(null);
    setSiteDataRequestId(null);
    setDailyMetrics([]);
    setTrafficSourceMetrics([]);
    setAiSiteDataSnapshot(null);

    getData("get_site_data", {
      ...form,
      comparisonMode: "previous_period",
      typeOrder: [{ id: 2, name: "Сайт" }],
      src_source: aiSource?.name || "",
      dateStart: dayjs(form.dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(form.dateEnd).format("YYYY-MM-DD"),
    }).then(async (data) => {
      if (data.st) {
        const snapshot = normalizeAiSiteDataSnapshot(data);
        setAiAnalysis(snapshot.ai_analysis || null);
        setSiteDataRequestId(snapshot.site_data_request_id ?? null);
        setDailyMetrics(snapshot.daily_metrics?.items || []);
        setTrafficSourceMetrics(buildTrafficSourceMetrics(snapshot));
        if (!activeChatThreadId && Array.isArray(snapshot.ai_chat_threads)) {
          applyChatThreads(restoreChatThreads(snapshot.ai_chat_threads, snapshot.ai_chat));
        }
        setAiSiteDataSnapshot(snapshot);
        setLastUpdate(dayjs().format("HH:mm"));
        await refreshSiteDataHistory();
      } else {
        setAiAnalysis(null);
        setSiteDataRequestId(null);
        setDailyMetrics([]);
        setTrafficSourceMetrics([]);
        setAiSiteDataSnapshot(null);
        setErrStatus(data.st);
        setErrText(data.text);
        setOpenAlert(true);
      }
    });
  };

  const loadSiteDataHistoryItem = (item) => {
    const requestId = item?.site_data_request_id ?? item?.id;
    if (requestId === null || requestId === undefined) return;

    getData("get_site_data_history", {
      site_data_request_id: requestId,
      id: requestId,
    }).then((data) => {
      if (data?.st === false) {
        setErrStatus(data.st);
        setErrText(data.text);
        setOpenAlert(true);
        return;
      }

      const snapshot = normalizeAiSiteDataSnapshot(data);

      if (snapshot.request_payload) {
        const requestPayload = snapshot.request_payload;
        setForm((current) => ({
          ...current,
          ...requestPayload,
        }));
        setAiSource(
          AI_ANALYST_SOURCES.find((item) => item.name === requestPayload.src_source) || null,
        );
      }

      setAiAnalysis(snapshot.ai_analysis || null);
      setSiteDataRequestId(snapshot.site_data_request_id ?? requestId);
      setDailyMetrics(snapshot.daily_metrics?.items || []);
      setTrafficSourceMetrics(buildTrafficSourceMetrics(snapshot));
      if (!activeChatThreadId && Array.isArray(snapshot.ai_chat_threads)) {
        applyChatThreads(restoreChatThreads(snapshot.ai_chat_threads, snapshot.ai_chat));
      }
      setAiSiteDataSnapshot(snapshot);
      if (snapshot.analytics_meta) {
        setAnalyticsMeta(snapshot.analytics_meta);
      }
      setLastUpdate(dayjs().format("HH:mm"));
    });
  };

  const downloadBlobFile = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const analyzeAiReport = async () => {
    if (!aiSiteDataSnapshot) {
      showError("Сначала получите или откройте отчёт AI-анализа");
      return null;
    }

    setIsLoad(true);
    try {
      const payload = normalizeAiSiteDataSnapshot(aiSiteDataSnapshot);
      const result = await api_laravel("end_analytics", "ai_html_report", payload);

      const data =
        result?.html_report || result?.st !== undefined
          ? result
          : result?.data && typeof result.data === "object"
            ? result.data
            : result;

      if (data?.st === false) {
        showError(data?.text || "Не удалось сформировать HTML-отчёт");
        return null;
      }

      const html = data?.html_report || result?.html_report || result?.data?.html_report;
      if (!html) {
        showError("HTML-отчёт не получен");
        return null;
      }

      return html;
    } catch (_) {
      showError("Ошибка при формировании HTML-отчёта");
      return null;
    } finally {
      setIsLoad(false);
    }
  };

  const exportAiReport = async (fileType) => {
    if (!canExportReport) {
      showError("Недостаточно прав для экспорта");
      return;
    }

    if (!aiSiteDataSnapshot) {
      showError("Сначала получите или откройте отчёт AI-анализа");
      return;
    }

    setIsLoad(true);
    try {
      const payload = normalizeAiSiteDataSnapshot(aiSiteDataSnapshot);
      const blob = await api_laravel(
        "end_analytics",
        "export_ai_report",
        {
          file_type: fileType,
          ...payload,
        },
        { responseType: "blob" },
      );

      if (!(blob instanceof Blob)) {
        showError("Не удалось получить файл экспорта");
        return;
      }

      if (blob.type && blob.type.includes("application/json")) {
        try {
          const errorData = JSON.parse(await blob.text());
          showError(errorData?.text || errorData?.message || "Ошибка экспорта");
        } catch (_) {
          showError("Ошибка экспорта");
        }
        return;
      }

      if (!blob.size) {
        showError("Получен пустой файл");
        return;
      }

      const dateStart =
        aiSiteDataSnapshot?.ai_analysis?.period?.date_start ||
        aiSiteDataSnapshot?.period?.date_start ||
        dayjs(form.dateStart).format("YYYY-MM-DD");
      const dateEnd =
        aiSiteDataSnapshot?.ai_analysis?.period?.date_end ||
        aiSiteDataSnapshot?.period?.date_end ||
        dayjs(form.dateEnd).format("YYYY-MM-DD");

      downloadBlobFile(blob, `AI_отчет_${dateStart}_${dateEnd}.${fileType}`);
    } catch (_) {
      showError("Ошибка экспорта отчёта");
    } finally {
      setIsLoad(false);
    }
  };

  const sendAiChat = async (prompt) => {
    const idempotencyKey =
      typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID().replaceAll("-", "")
        : `${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
    try {
      const result = await api_laravel(
        "end_analytics",
        "ai_chat",
        {
          prompt,
          site_data_request_id: siteDataRequestId,
          thread_id: activeChatThreadId,
          idempotency_key: idempotencyKey,
        },
        { throwErrors: true },
      );
      const data = result?.data && typeof result.data === "object" ? result.data : result || {};
      const chatSynced = Array.isArray(data.ai_chat_threads);

      if (chatSynced) {
        applyChatThreads(data.ai_chat_threads, data.thread_id || activeChatThreadId);
        await loadChatThreadMessages(data.thread_id || activeChatThreadId);
      }

      if (data.st !== false) {
        const historyResult = await api_laravel("end_analytics", "get_all", {});
        if (historyResult?.data) {
          setSiteDataHistory(historyResult.data.site_data_history || []);
        }
      }

      return {
        ...data,
        chat_synced: chatSynced,
      };
    } catch (error) {
      const response = error?.response?.data;
      const data = response?.data && typeof response.data === "object" ? response.data : response;
      const chatSynced = Array.isArray(data?.ai_chat_threads);

      if (chatSynced) {
        applyChatThreads(data.ai_chat_threads, data.thread_id || activeChatThreadId);
        await loadChatThreadMessages(data.thread_id || activeChatThreadId);
      }

      return {
        st: false,
        text: data?.text || "Ошибка при обращении к AI-чату",
        chat_synced: chatSynced,
      };
    }
  };

  const createAiChatThread = async () => {
    const result = await api_laravel("end_analytics", "create_ai_chat_thread", {
      ...(siteDataRequestId ? { site_data_request_id: siteDataRequestId } : {}),
    });
    const thread = result?.data?.thread;
    if (!thread) return null;

    const nextThreads = [thread, ...aiChatThreads];
    applyChatThreads(nextThreads, thread.id);
    setHistoryChatMessages([]);
    return thread;
  };

  const updateAiChatThread = async (threadId, changes) => {
    const result = await api_laravel("end_analytics", "update_ai_chat_thread", {
      thread_id: threadId,
      ...changes,
    });
    const updated = result?.data?.thread;
    if (!updated) return null;

    const nextThreads = aiChatThreads.map((thread) =>
      Number(thread.id) === Number(threadId)
        ? { ...thread, ...updated, messages: thread.messages || [] }
        : thread,
    );
    applyChatThreads(nextThreads, activeChatThreadId);
    return updated;
  };

  const deleteAiChatThread = async (threadId) => {
    const result = await api_laravel("end_analytics", "delete_ai_chat_thread", {
      thread_id: threadId,
    });
    if (result?.data?.st === false) return false;

    const nextThreads = aiChatThreads.filter((thread) => Number(thread.id) !== Number(threadId));
    applyChatThreads(nextThreads);
    return true;
  };

  const resetFilters = () => {
    setForm(standardForm);
    setTableData([]);
    setAnalyticsMeta(null);
  };

  const resetAiFilters = () => {
    setForm((prev) => ({
      ...prev,
      cities: {},
      dateStart: standardForm.dateStart,
      dateEnd: standardForm.dateEnd,
    }));
    setAiSource(null);
    setAiAnalysis(null);
    setSiteDataRequestId(null);
    setDailyMetrics([]);
    setTrafficSourceMetrics([]);
    setAiSiteDataSnapshot(null);
  };

  const refreshData = () => {
    applyRequest();
  };

  const showError = (text) => {
    setErrStatus(false);
    setErrText(text);
    setOpenAlert(true);
  };

  const getSelectedCityId = () => {
    const id = form.cities?.id;
    return id === 0 || id ? Number(id) : null;
  };

  const loadCustomCosts = async (cityId = getSelectedCityId()) => {
    if (cityId === null) return;

    const data = await getData("get_custom_costs", {
      city_id: cityId,
      dateStart: dayjs(form.dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(form.dateEnd).format("YYYY-MM-DD"),
    });

    if (data?.st) {
      setCustomCosts(data.items || []);
      setCustomCostOptions({
        ...EMPTY_CUSTOM_COST_OPTIONS,
        ...(data.options || {}),
      });
    } else {
      showError(data?.text || "Не удалось загрузить ручные расходы");
    }
  };

  const openCustomCostsDialog = async () => {
    const cityId = getSelectedCityId();
    if (cityId === null) {
      showError("Сначала выберите город");
      return;
    }

    setCustomCostForm({
      ...createEmptyCustomCostForm(),
      city_id: cityId,
      date: dayjs(form.dateStart).format("YYYY-MM-DD"),
    });
    setCustomCostDialogOpen(true);
    await loadCustomCosts(cityId);
  };

  const setCustomCostField = (field, value) => {
    setCustomCostForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const normalizeCustomCostField = (value) => (value === "not_set" ? "" : value || "");

  const editCustomCost = (item) => {
    setCustomCostForm({
      id: item.id,
      city_id: item.city_id,
      date: item.date,
      src_source: normalizeCustomCostField(item.src_source),
      src_medium: normalizeCustomCostField(item.src_medium),
      src_campaign: normalizeCustomCostField(item.src_campaign),
      src_term: normalizeCustomCostField(item.src_term),
      src_content: normalizeCustomCostField(item.src_content),
      cost: item.cost,
      comment: item.comment || "",
    });
  };

  const saveCustomCost = async () => {
    const cityId = getSelectedCityId();
    if (cityId === null) {
      showError("Сначала выберите город");
      return;
    }

    const cost = Number(customCostForm.cost);
    if (!Number.isFinite(cost) || cost <= 0) {
      showError("Укажите расход больше 0");
      return;
    }

    const data = await getData("save_custom_cost", {
      ...customCostForm,
      city_id: cityId,
      date: dayjs(customCostForm.date).format("YYYY-MM-DD"),
      cost,
    });

    if (!data?.st) {
      showError(data?.text || "Не удалось сохранить ручной расход");
      return;
    }

    setCustomCostForm({
      ...createEmptyCustomCostForm(),
      city_id: cityId,
      date: dayjs(form.dateStart).format("YYYY-MM-DD"),
    });
    await loadCustomCosts(cityId);
    if (tableData.length > 0) {
      applyRequest();
    }
  };

  const deleteCustomCost = async (id) => {
    const cityId = getSelectedCityId();
    const data = await getData("delete_custom_cost", { id });

    if (!data?.st) {
      showError(data?.text || "Не удалось удалить ручной расход");
      return;
    }

    await loadCustomCosts(cityId);
    if (tableData.length > 0) {
      applyRequest();
    }
  };

  // Новая функция группировки по типам источников трафика
  const regroupByTrafficSource = (utmData) => {
    if (!utmData || typeof utmData !== "object") return [];

    const trafficGroups = {
      "Поисковые системы": [
        "yandex",
        "google",
        "bing",
        "yahoo",
        "mail.ru",
        "rambler",
        "ya.ru",
        "duckduckgo.com",
      ],
      "Социальные сети": [
        "vk",
        "facebook",
        "instagram",
        "ok",
        "telegram",
        "tiktok",
        "away.vk.ru",
        "m.vk.ru",
        "away.vk.com",
      ],
      Рефералы: ["referral", "promokodi.net", "jacofood.ru", "link.2gis.ru", "suggest.sso.dzen.ru"],
      "Рекламные системы": ["vk_ads", "yandex_direct"],
      "Прямой трафик": ["direct", "none", "(direct)"],
      Другое: [],
    };

    const adMediumPatterns = [
      "cpc",
      "ppc",
      "display",
      "epk",
      "poisk",
      "rsya",
      "kampan",
      "campaign",
      "tovarn",
      "context",
      "promo",
      "retarget",
      "remarketing",
    ];

    const result = {};

    const normalizeTrafficValue = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();
    const matchesKnownValue = (value, list) => {
      const normalized = normalizeTrafficValue(value);
      return list.some((item) => {
        const normalizedItem = normalizeTrafficValue(item);
        return normalized === normalizedItem || normalized.includes(normalizedItem);
      });
    };

    const isSearchSource = (value) => matchesKnownValue(value, trafficGroups["Поисковые системы"]);
    const isSocialSource = (value) => matchesKnownValue(value, trafficGroups["Социальные сети"]);
    const isReferralSource = (value) => matchesKnownValue(value, trafficGroups["Рефералы"]);
    const isAdSource = (value) => matchesKnownValue(value, trafficGroups["Рекламные системы"]);
    const isDirectVisitSource = (value) => matchesKnownValue(value, trafficGroups["Прямой трафик"]);
    const isAdMedium = (value) => {
      const normalized = normalizeTrafficValue(value);
      return adMediumPatterns.some((pattern) => normalized.includes(pattern));
    };
    const looksLikeReferralDomain = (value) => {
      const normalized = normalizeTrafficValue(value);
      return normalized.includes(".") && !isSearchSource(normalized) && !isSocialSource(normalized);
    };

    const getGroupName = (sourceName, mediumName = "") => {
      const medium = normalizeTrafficValue(mediumName);

      if (isDirectVisitSource(sourceName)) return "Прямой трафик";
      if (isAdSource(sourceName) || isAdMedium(medium)) return "Рекламные системы";
      if (
        medium === "referral" ||
        isReferralSource(sourceName) ||
        looksLikeReferralDomain(sourceName)
      )
        return "Рефералы";
      if (medium === "social" || isSocialSource(sourceName)) return "Социальные сети";
      if (medium === "organic") return "Поисковые системы";

      return "Другое";
    };

    const getPlatformType = (sourceName, mediumName) => {
      const source = normalizeTrafficValue(sourceName);
      const medium = normalizeTrafficValue(mediumName);

      if (isDirectVisitSource(source)) return "Прямой трафик";
      if (medium === "organic") return "Органика";
      if (medium === "referral" || isReferralSource(source)) return "Рефералы";
      if (medium === "social") return "Социальные сети";
      if (medium === "email") return "E-mail рассылки";
      if (isAdSource(source) || isAdMedium(medium)) return "Контекстная реклама";
      if (
        isDirectVisitSource(source) ||
        medium === "none" ||
        medium === "(direct)" ||
        medium === "(utm)"
      )
        return "Прямой трафик";

      return mediumName || "not_set";
    };

    const addMetrics = (target, source) => {
      ADDITIVE_METRIC_FIELDS.forEach((field) => {
        target[field] += parseMetric(source[field]);
      });
    };

    const ensureGroup = (groupName) => {
      if (result[groupName]) return result[groupName];

      result[groupName] = {
        id: `group_${groupName}`,
        name: groupName,
        level: "src_source_group",
        visits: 0,
        cost: 0,
        orders: 0,
        revenue: 0,
        newClients: 0,
        existingClients: 0,
        primaryOrders: 0,
        repeatOrders: 0,
        children: [],
      };

      return result[groupName];
    };

    const createDetailedSource = (sourceName, sourceData, groupName) => ({
      id: `${sourceData.level}_${sourceName}_${groupName}`,
      name: sourceData.name || sourceName,
      sourceType: "site",
      level: "src_source_detailed",
      visits: 0,
      cost: 0,
      orders: 0,
      revenue: 0,
      newClients: 0,
      existingClients: 0,
      primaryOrders: 0,
      repeatOrders: 0,
      ...pickOptionalMetrics(sourceData),
      useServerMetrics: true,
      children: [],
    });

    // Проходим по всем source
    for (const [sourceName, sourceData] of Object.entries(utmData)) {
      if (sourceData.level !== "src_source") continue;

      const sourceNodesByGroup = {};

      const getSourceNode = (groupName) => {
        if (sourceNodesByGroup[groupName]) return sourceNodesByGroup[groupName];

        const group = ensureGroup(groupName);
        const detailedSource = createDetailedSource(sourceName, sourceData, groupName);

        sourceNodesByGroup[groupName] = detailedSource;
        group.children.push(detailedSource);

        return detailedSource;
      };

      // Обрабатываем children (medium) и группируем по типу площадки
      if (sourceData.children && sourceData.children.length > 0) {
        sourceData.children.forEach((medium) => {
          if (medium.level === "src_medium") {
            const groupName = getGroupName(sourceName, medium.name);
            const group = ensureGroup(groupName);
            const detailedSource = getSourceNode(groupName);

            addMetrics(group, medium);
            addMetrics(detailedSource, medium);

            const platformType = getPlatformType(sourceName, medium.name);
            let platform = detailedSource.children.find((child) => child.name === platformType);

            if (!platform) {
              platform = {
                id: `${sourceName}_platform_${platformType}`,
                name: platformType,
                originalName: medium.name,
                level: "src_platform",
                visits: 0,
                cost: 0,
                orders: 0,
                revenue: 0,
                newClients: 0,
                existingClients: 0,
                primaryOrders: 0,
                repeatOrders: 0,
                children: [],
              };
              detailedSource.children.push(platform);
            }

            addMetrics(platform, medium);

            // Добавляем кампании как children к типу площадки
            if (medium.children && medium.children.length > 0) {
              medium.children.forEach((campaign) => {
                const transformedCampaign = {
                  id: `${sourceName}_${campaign.level}_${campaign.name}`,
                  name: campaign.name,
                  level: campaign.level,
                  visits: parseMetric(campaign.visits),
                  cost: parseMetric(campaign.cost),
                  orders: parseMetric(campaign.orders),
                  revenue: parseMetric(campaign.revenue),
                  ...pickDerivedMetrics(campaign),
                  ...pickOptionalMetrics(campaign),
                  newClients: parseMetric(campaign.newClients),
                  existingClients: parseMetric(campaign.existingClients),
                  primaryOrders: parseMetric(campaign.primaryOrders),
                  repeatOrders: parseMetric(campaign.repeatOrders),
                  useServerMetrics: true,
                  children: [],
                };

                // Добавляем term и content если есть
                if (campaign.children && campaign.children.length > 0) {
                  transformedCampaign.children = transformUtmChildrenSimple(
                    campaign.children,
                    sourceName,
                  );
                }

                platform.children.push(transformedCampaign);
              });
            }
          }
        });
      } else {
        const groupName = getGroupName(sourceName);
        const group = ensureGroup(groupName);
        const detailedSource = getSourceNode(groupName);

        addMetrics(group, sourceData);
        addMetrics(detailedSource, sourceData);
        Object.assign(
          detailedSource,
          pickDerivedMetrics(sourceData),
          pickOptionalMetrics(sourceData),
        );
      }
    }

    // Преобразуем объект в массив и добавляем расчетные поля
    return calculateMetricsForGroupedData(Object.values(result));
  };

  const normalizeBackendCategoryLevel = (level) => {
    switch (level) {
      case "traffic_category":
        return "src_source_group";
      case "normalized_source":
        return "src_source_detailed";
      case "normalized_medium":
        return "src_platform";
      case "normalized_campaign":
        return "src_campaign";
      case "normalized_term":
        return "src_term";
      case "normalized_content":
        return "src_content";
      default:
        return level;
    }
  };

  const transformBackendTrafficCategoryNode = (node, parentId = "site_category", nodeIndex = 0) => {
    const level = normalizeBackendCategoryLevel(node.level);
    const id = `${parentId}_${nodeIndex}_${node.traffic_category || node.value || node.name}_${level}`;

    return rollupMetricsFromChildren({
      id,
      name: node.name,
      value: node.value,
      sourceType: "site",
      level,
      visits: parseMetric(node.visits),
      cost: parseMetric(node.cost),
      orders: parseMetric(node.orders),
      revenue: parseMetric(node.revenue),
      ...pickDerivedMetrics(node),
      ...pickOptionalMetrics(node),
      newClients: parseMetric(node.newClients),
      existingClients: parseMetric(node.existingClients),
      primaryOrders: parseMetric(node.primaryOrders),
      repeatOrders: parseMetric(node.repeatOrders),
      traffic_category: node.traffic_category,
      traffic_category_label: node.traffic_category_label,
      normalized_source: node.normalized_source,
      normalized_medium: node.normalized_medium,
      useServerMetrics: true,
      children: Array.isArray(node.children)
        ? node.children.map((child, childIndex) =>
            transformBackendTrafficCategoryNode(child, id, childIndex),
          )
        : [],
    });
  };

  // Простая трансформация детей без перегруппировки
  const transformUtmChildrenSimple = (children, sourceName) => {
    if (!children || !Array.isArray(children)) return [];

    return children.map((child) => ({
      id: `${sourceName}_${child.level}_${child.name}`,
      name: child.name,
      level: child.level,
      visits: parseMetric(child.visits),
      cost: parseMetric(child.cost),
      orders: parseMetric(child.orders),
      revenue: parseMetric(child.revenue),
      ...pickDerivedMetrics(child),
      ...pickOptionalMetrics(child),
      newClients: parseMetric(child.newClients),
      existingClients: parseMetric(child.existingClients),
      primaryOrders: parseMetric(child.primaryOrders),
      repeatOrders: parseMetric(child.repeatOrders),
      useServerMetrics: true,
      children: child.children ? transformUtmChildrenSimple(child.children, sourceName) : [],
    }));
  };

  // Расчет метрик для сгруппированных данных
  const calculateMetricsForGroupedData = (items) => {
    return items.map((item) => rollupMetricsFromChildren({ ...item }));
  };

  const formatApiData = (apiData) => {
    const result = [];

    const hasCategorySiteData =
      apiData.site_data_by_category &&
      typeof apiData.site_data_by_category === "object" &&
      Object.keys(apiData.site_data_by_category).length > 0;

    if (hasCategorySiteData || (apiData.site_data && typeof apiData.site_data === "object")) {
      const siteSourceRows = hasCategorySiteData
        ? Object.values(apiData.site_data_by_category)
        : Object.values(apiData.site_data);
      const groupedData = hasCategorySiteData
        ? siteSourceRows.map((item, itemIndex) =>
            transformBackendTrafficCategoryNode(item, "site_category", itemIndex),
          )
        : regroupByTrafficSource(apiData.site_data);

      if (groupedData.length > 0) {
        const siteTotal = aggregateTotalRow(
          {
            id: `total_site`,
            name: "ИТОГО по Сайту",
            isTotal: true,
            sourceType: "site",
          },
          groupedData,
        );

        applyTotalMetricsFromRows(siteTotal, siteSourceRows);
        applyServerTotals(siteTotal, apiData.site_totals);

        result.push(siteTotal);
      }
    }

    if (apiData.cafe_data && Array.isArray(apiData.cafe_data)) {
      const cafeItems = apiData.cafe_data.map((item) => transformItem(item, "cafe"));
      if (cafeItems.length > 0) {
        result.push(
          aggregateTotalRow(
            {
              id: `total_cafe`,
              name: "ИТОГО по Кафе",
              isTotal: true,
              sourceType: "cafe",
            },
            cafeItems,
          ),
        );
      }
    }

    if (apiData.kc_data && Array.isArray(apiData.kc_data)) {
      const kcItems = apiData.kc_data.map((item) => transformItem(item, "kc"));
      if (kcItems.length > 0) {
        result.push(
          aggregateTotalRow(
            {
              id: `total_kc`,
              name: "ИТОГО по КЦ",
              isTotal: true,
              sourceType: "kc",
            },
            kcItems,
          ),
        );
      }
    }

    if (result.length > 0) {
      const grandTotal = aggregateTotalRow(
        {
          id: `total_grand`,
          name: "ВСЕГО",
          isTotal: true,
          isGrandTotal: true,
          sourceType: "grand",
        },
        result,
      );
      if (result.length === 1 && result[0].sourceType === "site") {
        applyServerTotals(grandTotal, apiData.site_totals);
      }

      return [grandTotal];
    }

    return result;
  };

  const calculateTotalForRootNodes = (rootNodes, sourceType, name) => {
    const total = {
      id: `total_${sourceType}`,
      name: name,
      isTotal: true,
      sourceType: sourceType,
      visits: 0,
      cost: 0,
      orders: 0,
      revenue: 0,
      newClients: 0,
      existingClients: 0,
      primaryOrders: 0,
      repeatOrders: 0,
    };

    rootNodes.forEach((node) => {
      total.visits += node.visits || 0;
      total.cost += node.cost || 0;
      total.orders += node.orders || 0;
      total.revenue += node.revenue || 0;
      total.newClients += node.newClients || 0;
      total.existingClients += node.existingClients || 0;
      total.primaryOrders += node.primaryOrders || 0;
      total.repeatOrders += node.repeatOrders || 0;
    });

    total.conversion = total.visits > 0 ? (total.orders / total.visits) * 100 : 0;
    total.costPerOrder = total.orders > 0 ? total.cost / total.orders : 0;
    total.averageCheck = total.orders > 0 ? total.revenue / total.orders : 0;
    total.roi =
      total.cost > 0
        ? ((total.revenue - total.cost) / total.cost) * 100
        : total.revenue > 0
          ? Infinity
          : 0;
    total.drr = total.revenue > 0 ? (total.cost / total.revenue) * 100 : 0;
    const totalCustomers = total.newClients + total.existingClients;
    total.ltv = totalCustomers > 0 ? total.revenue / totalCustomers : 0;

    return total;
  };

  const calculateTotalForGrandTotal = (totalRows, sourceType, name) => {
    const grandTotal = {
      id: `total_${sourceType}`,
      name: name,
      isTotal: true,
      isGrandTotal: true,
      sourceType: sourceType,
      visits: 0,
      cost: 0,
      orders: 0,
      revenue: 0,
      newClients: 0,
      existingClients: 0,
      primaryOrders: 0,
      repeatOrders: 0,
    };

    totalRows.forEach((row) => {
      grandTotal.visits += row.visits || 0;
      grandTotal.cost += row.cost || 0;
      grandTotal.orders += row.orders || 0;
      grandTotal.revenue += row.revenue || 0;
      grandTotal.newClients += row.newClients || 0;
      grandTotal.existingClients += row.existingClients || 0;
      grandTotal.primaryOrders += row.primaryOrders || 0;
      grandTotal.repeatOrders += row.repeatOrders || 0;
    });

    grandTotal.conversion =
      grandTotal.visits > 0 ? (grandTotal.orders / grandTotal.visits) * 100 : 0;
    grandTotal.costPerOrder = grandTotal.orders > 0 ? grandTotal.cost / grandTotal.orders : 0;
    grandTotal.averageCheck = grandTotal.orders > 0 ? grandTotal.revenue / grandTotal.orders : 0;
    grandTotal.roi =
      grandTotal.cost > 0
        ? ((grandTotal.revenue - grandTotal.cost) / grandTotal.cost) * 100
        : grandTotal.revenue > 0
          ? Infinity
          : 0;
    grandTotal.drr = grandTotal.revenue > 0 ? (grandTotal.cost / grandTotal.revenue) * 100 : 0;
    const grandTotalCustomers = grandTotal.newClients + grandTotal.existingClients;
    grandTotal.ltv = grandTotalCustomers > 0 ? grandTotal.revenue / grandTotalCustomers : 0;

    return grandTotal;
  };

  // Оставляем старые функции для обратной совместимости с cafe и kc
  const transformUtmTree = (utmData, sourceType) => {
    if (!utmData || typeof utmData !== "object") return [];
    const result = [];
    for (const [key, value] of Object.entries(utmData)) {
      const transformedItem = {
        id: `${sourceType}_${value.level}_${key}`,
        name: value.name || key,
        sourceType: sourceType,
        level: value.level,
        visits: value.visits || 0,
        cost: value.cost || 0,
        orders: parseInt(value.orders) || 0,
        revenue: value.revenue || 0,
        newClients: value.newClients || 0,
        existingClients: value.existingClients || 0,
        primaryOrders: parseInt(value.primaryOrders) || 0,
        repeatOrders: parseInt(value.repeatOrders) || 0,
      };
      transformedItem.conversion =
        transformedItem.visits > 0 ? (transformedItem.orders / transformedItem.visits) * 100 : 0;
      transformedItem.costPerOrder =
        transformedItem.orders > 0 ? transformedItem.cost / transformedItem.orders : 0;
      transformedItem.averageCheck =
        transformedItem.orders > 0 ? transformedItem.revenue / transformedItem.orders : 0;
      transformedItem.roi =
        transformedItem.cost > 0
          ? ((transformedItem.revenue - transformedItem.cost) / transformedItem.cost) * 100
          : transformedItem.revenue > 0
            ? Infinity
            : 0;
      transformedItem.drr =
        transformedItem.revenue > 0 ? (transformedItem.cost / transformedItem.revenue) * 100 : 0;
      const transformedItemCustomers = transformedItem.newClients + transformedItem.existingClients;
      transformedItem.ltv =
        transformedItemCustomers > 0 ? transformedItem.revenue / transformedItemCustomers : 0;
      if (value.children && Array.isArray(value.children) && value.children.length > 0) {
        transformedItem.details = transformUtmChildren(value.children, sourceType, key);
      }
      result.push(transformedItem);
    }
    return result;
  };

  const transformUtmChildren = (children, sourceType, parentKey) => {
    if (!children || !Array.isArray(children)) return [];
    const result = [];
    for (const child of children) {
      const transformedChild = {
        id: `${sourceType}_${child.level}_${parentKey}_${child.name}`,
        name: child.name,
        sourceType: sourceType,
        level: child.level,
        visits: child.visits || 0,
        cost: child.cost || 0,
        orders: parseInt(child.orders) || 0,
        revenue: child.revenue || 0,
        newClients: child.newClients || 0,
        existingClients: child.existingClients || 0,
        primaryOrders: parseInt(child.primaryOrders) || 0,
        repeatOrders: parseInt(child.repeatOrders) || 0,
      };
      transformedChild.conversion =
        transformedChild.visits > 0 ? (transformedChild.orders / transformedChild.visits) * 100 : 0;
      transformedChild.costPerOrder =
        transformedChild.orders > 0 ? transformedChild.cost / transformedChild.orders : 0;
      transformedChild.averageCheck =
        transformedChild.orders > 0 ? transformedChild.revenue / transformedChild.orders : 0;
      transformedChild.roi =
        transformedChild.cost > 0
          ? ((transformedChild.revenue - transformedChild.cost) / transformedChild.cost) * 100
          : transformedChild.revenue > 0
            ? Infinity
            : 0;
      transformedChild.drr =
        transformedChild.revenue > 0 ? (transformedChild.cost / transformedChild.revenue) * 100 : 0;
      const transformedChildCustomers =
        transformedChild.newClients + transformedChild.existingClients;
      transformedChild.ltv =
        transformedChildCustomers > 0 ? transformedChild.revenue / transformedChildCustomers : 0;
      if (child.children && Array.isArray(child.children) && child.children.length > 0) {
        transformedChild.details = transformUtmChildren(
          child.children,
          sourceType,
          transformedChild.name,
        );
      }
      result.push(transformedChild);
    }
    return result;
  };

  const transformItem = (item, sourceType) => {
    return applyDerivedMetrics({
      id: `${sourceType}_${item.id}`,
      name: item.name || `${sourceType === "kc" ? "КЦ" : "Кафе"} #${item.id}`,
      pointName: item.pointName,
      city: item.city,
      address: item.address,
      fullAddress: item.fullAddress,
      sourceType: sourceType,
      visits: parseMetric(item.visits),
      cost: parseMetric(item.cost),
      orders: parseMetric(item.orders),
      revenue: parseMetric(item.revenue),
      ...pickDerivedMetrics(item),
      ...pickOptionalMetrics(item),
      newClients: parseMetric(item.newClients),
      existingClients: parseMetric(item.existingClients),
      primaryOrders: parseMetric(item.primaryOrders),
      repeatOrders: parseMetric(item.repeatOrders),
    });
  };

  const toggleRow = (rowId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const formatNumber = (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return Math.round(value).toLocaleString("ru-RU");
    }
    return "0";
  };

  const formatPercent = (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return Math.round(value).toLocaleString("ru-RU");
    }
    return "0";
  };

  const formatCurrency = (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return Math.round(value).toLocaleString("ru-RU");
    }
    return "0";
  };

  const formatOptionalNumber = (value, available) =>
    available && value !== null && value !== undefined ? formatNumber(value) : "н/д";

  const renderMetricValue = (key, row, isTotalRow) => {
    switch (key) {
      case "visits":
      case "cost":
      case "orders":
      case "revenue":
      case "newClients":
      case "existingClients":
      case "primaryOrders":
      case "repeatOrders":
        return formatNumber(row[key]);
      case "clicks":
        return formatOptionalNumber(row.clicks, row.clicksAvailable);
      case "conversion":
        return (
          <Typography
            variant="body2"
            color={row.conversion > 5 ? "success.main" : "inherit"}
            fontWeight={isTotalRow ? 700 : 400}
            sx={{ whiteSpace: "nowrap" }}
          >
            {formatPercent(row.conversion)}
          </Typography>
        );
      case "costPerOrder":
      case "averageCheck":
      case "ltv":
        return formatCurrency(row[key]);
      case "roi":
        return (
          <Typography
            variant="body2"
            color={row.roi > 100 ? "success.main" : row.roi < 0 ? "error.main" : "inherit"}
            fontWeight={isTotalRow ? 700 : 400}
            sx={{ whiteSpace: "nowrap" }}
          >
            {formatPercent(row.roi)}
          </Typography>
        );
      case "drr":
        return formatPercent(row.drr);
      default:
        return "—";
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case "src_source_group":
        return "📁 ";
      case "src_source_detailed":
        return "🌐 ";
      case "src_platform":
        return "📱 ";
      case "src_campaign":
        return "📢 ";
      case "src_term":
        return "🔍 ";
      case "src_content":
        return "📄 ";
      default:
        return "📌 ";
    }
  };

  const RenderTableRow = ({ row, level = 0 }) => {
    // Проверяем оба варианта - и children, и details
    const hasChildren =
      (row.children && row.children.length > 0) || (row.details && row.details.length > 0);
    const childrenArray = row.children || row.details || [];

    const isExpanded = expandedRows.has(row.id);
    const isTotalRow = row.isTotal;
    const isGrandTotal = row.isGrandTotal;

    return (
      <>
        <StyledTableRow
          isTotal={isTotalRow}
          isGrandTotal={isGrandTotal}
          className={`${isTotalRow ? "isTotal" : ""} ${isGrandTotal ? "isGrandTotal" : ""}`}
        >
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            style={{ paddingLeft: level * 24 + 16 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={() => toggleRow(row.id)}
                  sx={{ p: 0.5, flexShrink: 0 }}
                >
                  {isExpanded ? (
                    <KeyboardArrowDownIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowRightIcon fontSize="small" />
                  )}
                </IconButton>
              )}
              {!hasChildren && <Box sx={{ width: 24, flexShrink: 0 }} />}
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={isTotalRow ? 700 : 500}
                  color={isGrandTotal ? PRIMARY_COLOR : "inherit"}
                  sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                >
                  {row.level && getLevelIcon(row.level)}
                  {row.name}
                </Typography>
                {row.level &&
                  row.level !== "src_source_group" &&
                  row.level !== "src_source_detailed" &&
                  row.level !== "src_platform" && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      ({row.level.replace("src_", "")})
                    </Typography>
                  )}
              </Box>
            </Box>
          </StyledTableCell>
          {visibleColumnDefinitions.map((column) => (
            <StyledTableCell
              key={column.key}
              isHeader={false}
              isTotal={isTotalRow}
              align="right"
              noWrap
            >
              {renderMetricValue(column.key, row, isTotalRow)}
            </StyledTableCell>
          ))}
        </StyledTableRow>
        {hasChildren &&
          isExpanded &&
          childrenArray.map((detail) => (
            <RenderTableRow
              key={detail.id}
              row={detail}
              level={level + 1}
            />
          ))}
      </>
    );
  };

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      size={{ xs: 12, sm: 12 }}
      sx={{ mb: 3, p: 3 }}
    >
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />
      <EndAnalyticsColumnsDialog
        open={columnsDialogOpen}
        visibleColumns={visibleColumns}
        onClose={() => setColumnsDialogOpen(false)}
        onToggle={toggleColumn}
        onSetAll={setAllColumns}
        onReset={resetColumns}
      />
      <Dialog
        open={customCostDialogOpen}
        onClose={() => setCustomCostDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Ручные расходы</DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Можно выбрать существующее значение из списка или ввести своё. Для поискового Яндекса
            укажите Source: yandex и Medium: organic, остальные UTM-поля оставьте пустыми. Яндекс
            Директ с Medium: cpc останется отдельным источником. Пустые поля сохраняются как
            not_set.
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew
                label="Дата расхода"
                customActions={true}
                value={dayjs(customCostForm.date)}
                minDate={dayjs(form.dateStart)}
                maxDate={dayjs(form.dateEnd)}
                func={(value) => setCustomCostField("date", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyTextInput
                type="number"
                label="Расход"
                value={customCostForm.cost}
                func={({ target }) => setCustomCostField("cost", target?.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <UtmFreeSoloAutocomplete
                label="UTM Source"
                value={customCostForm.src_source}
                options={customCostOptions.src_source}
                onChange={(value) => setCustomCostField("src_source", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <UtmFreeSoloAutocomplete
                label="UTM Medium"
                value={customCostForm.src_medium}
                options={customCostOptions.src_medium}
                onChange={(value) => setCustomCostField("src_medium", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <UtmFreeSoloAutocomplete
                label="UTM Campaign"
                value={customCostForm.src_campaign}
                options={customCostOptions.src_campaign}
                onChange={(value) => setCustomCostField("src_campaign", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <UtmFreeSoloAutocomplete
                label="UTM Term"
                value={customCostForm.src_term}
                options={customCostOptions.src_term}
                onChange={(value) => setCustomCostField("src_term", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <UtmFreeSoloAutocomplete
                label="UTM Content"
                value={customCostForm.src_content}
                options={customCostOptions.src_content}
                onChange={(value) => setCustomCostField("src_content", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyTextInput
                label="Комментарий"
                value={customCostForm.comment}
                func={({ target }) => setCustomCostField("comment", target?.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Расход</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Medium</TableCell>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Term</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Комментарий</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customCosts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{dayjs(item.date).format("DD.MM.YYYY")}</TableCell>
                    <TableCell align="right">{formatCurrency(item.cost)} ₽</TableCell>
                    <TableCell>{item.src_source}</TableCell>
                    <TableCell>{item.src_medium}</TableCell>
                    <TableCell>{item.src_campaign}</TableCell>
                    <TableCell>{item.src_term}</TableCell>
                    <TableCell>{item.src_content}</TableCell>
                    <TableCell>{item.comment}</TableCell>
                    <TableCell align="right">
                      <StyledButton
                        variant="outlined"
                        onClick={() => editCustomCost(item)}
                        sx={{ mr: 1 }}
                      >
                        Изменить
                      </StyledButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteCustomCost(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {customCosts.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{ py: 3 }}
                    >
                      Ручных расходов за выбранный период нет
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton
            variant="outlined"
            onClick={() => setCustomCostDialogOpen(false)}
          >
            Закрыть
          </StyledButton>
          <StyledButton
            variant="outlined"
            onClick={() =>
              setCustomCostForm({
                ...createEmptyCustomCostForm(),
                city_id: getSelectedCityId() ?? 0,
                date: dayjs(form.dateStart).format("YYYY-MM-DD"),
              })
            }
          >
            Очистить
          </StyledButton>
          <StyledButton
            variant="primary"
            onClick={saveCustomCost}
          >
            Сохранить расход
          </StyledButton>
        </DialogActions>
      </Dialog>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
            >
              {module.name || "Сквозная аналитика"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}></Box>
        </Box>
      </Grid>

      {(canViewAnalytics || canViewAiAnalyst) && (
        <Grid size={{ xs: 12 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{
              mb: 1,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
              "& .Mui-selected": { color: PRIMARY_COLOR },
              "& .MuiTabs-indicator": { backgroundColor: PRIMARY_COLOR },
            }}
          >
            {canViewAnalytics && (
              <Tab
                value={0}
                label="Сквозная аналитика"
              />
            )}
            {canViewAiAnalyst && (
              <Tab
                value={1}
                label="AI аналитик"
              />
            )}
          </Tabs>
        </Grid>
      )}

      {access !== null && !canViewAnalytics && !canViewAiAnalyst && (
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography color="text.secondary">Нет доступа к вкладкам модуля</Typography>
          </Paper>
        </Grid>
      )}

      {activeTab === 1 && canViewAiAnalyst && (
        <Grid size={{ xs: 12 }}>
          <AiAnalystTab
            cities={cities}
            form={form}
            source={aiSource}
            analysis={aiAnalysis}
            dailyMetrics={dailyMetrics}
            trafficSourceMetrics={trafficSourceMetrics}
            siteDataRequestId={siteDataRequestId}
            history={siteDataHistory}
            historyChatMessages={historyChatMessages}
            chatThreads={aiChatThreads}
            activeChatThreadId={activeChatThreadId}
            onCitiesChange={handleCitiesChange}
            onFieldChange={setField}
            onSourceChange={setAiSource}
            onApply={applyAiRequest}
            onReset={resetAiFilters}
            onSendChat={sendAiChat}
            onSelectChatThread={selectChatThread}
            onCreateChatThread={createAiChatThread}
            onUpdateChatThread={updateAiChatThread}
            onDeleteChatThread={deleteAiChatThread}
            onSelectHistory={loadSiteDataHistoryItem}
            onExport={exportAiReport}
            canExport={canExportReport}
            canExportData={Boolean(aiSiteDataSnapshot)}
            onAnalyze={analyzeAiReport}
            canAnalyze={Boolean(aiSiteDataSnapshot)}
          />
        </Grid>
      )}

      {activeTab === 0 && canViewAnalytics && analyticsMeta && (
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              px: 2,
              py: 1.5,
              borderRadius: "8px",
              backgroundColor: "#fafafa",
              border: "1px solid #eeeeee",
            }}
          >
            <Typography variant="body2">
              Период данных: {analyticsMeta.effective_date_start} —{" "}
              {analyticsMeta.effective_date_end}
            </Typography>
            {analyticsMeta.date_was_clamped && (
              <Typography
                variant="body2"
                color="warning.main"
              >
                Текущий или будущий день исключён; данные доступны по{" "}
                {analyticsMeta.complete_through}
              </Typography>
            )}
          </Box>
        </Grid>
      )}

      {activeTab === 0 && canViewAnalytics && (
        <>
          <Grid size={{ xs: 12 }}>
            <StyledPaper>
              <Grid
                container
                spacing={3}
              >
                <Grid size={{ xs: 12, sm: 4 }}>
                  <MyAutocomplite
                    label="Города"
                    data={cities}
                    multiple={false}
                    value={form.cities}
                    func={(event, data) => handleCitiesChange(data)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2.66 }}>
                  <MyDatePickerNew
                    label="Дата от"
                    customActions={true}
                    value={dayjs(form.dateStart)}
                    maxDate={dayjs(form.dateEnd) ?? dayjs()}
                    func={(e) => setField("dateStart", e)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2.66 }}>
                  <MyDatePickerNew
                    label="Дата до"
                    customActions={true}
                    value={dayjs(form.dateEnd)}
                    minDate={dayjs(form.dateStart) ?? dayjs()}
                    func={(e) => setField("dateEnd", e)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2.66 }}>
                  <MyTextInput
                    label="UTM Source"
                    value={form.src_source}
                    func={({ target }) => setField("src_source", target?.value)}
                    placeholder="yandex, vk..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2.66 }}>
                  <MyTextInput
                    label="UTM Medium"
                    value={form.src_medium}
                    func={({ target }) => setField("src_medium", target?.value)}
                    placeholder="cpc, organic..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2.66 }}>
                  <MyTextInput
                    label="UTM Campaign"
                    value={form.src_campaign}
                    func={({ target }) => setField("src_campaign", target?.value)}
                    placeholder="brand, retarget..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2.66 }}>
                  <MyTextInput
                    label="UTM Content"
                    value={form.src_content}
                    func={({ target }) => setField("src_content", target?.value)}
                    placeholder="banner_top..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2.66 }}>
                  <MyTextInput
                    label="UTM Term"
                    value={form.src_term}
                    func={({ target }) => setField("src_term", target?.value)}
                    placeholder="доставка..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <MyTextInput
                    type="number"
                    label="Заказов от"
                    value={form.orderStart}
                    func={({ target }) => setField("orderStart", target?.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <MyTextInput
                    type="number"
                    label="Заказов до"
                    value={form.orderEnd}
                    func={({ target }) => setField("orderEnd", target?.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <MyTextInput
                    type="number"
                    label="Стоимость заказа от"
                    value={form.payOrderStart}
                    func={({ target }) => setField("payOrderStart", target?.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <MyTextInput
                    type="number"
                    label="Стоимость заказа до"
                    value={form.payOrderEnd}
                    func={({ target }) => setField("payOrderEnd", target?.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <MyTextInput
                    type="number"
                    label="ROI"
                    value={form.roi}
                    func={({ target }) => setField("roi", target?.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <MyAutocomplite
                    label="Тип клиентов"
                    data={[
                      { id: 1, name: "Все" },
                      { id: 2, name: "Новые" },
                      { id: 3, name: "Действующие" },
                    ]}
                    multiple={false}
                    value={form.typeClient}
                    func={(event, data) => {
                      setField("typeClient", data);
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Способ заказа
                  </Typography>
                  <ToggleButtonGroup
                    value={
                      form.typeOrder.some((t) => t.id === 1)
                        ? []
                        : form.typeOrder
                            .filter((t) => t.id !== 1)
                            .map((t) => {
                              const map = { 2: "site", 3: "cafe", 4: "kc" };
                              return map[t.id];
                            })
                    }
                    onChange={handleTypeOrderChange}
                    aria-label="order type"
                    sx={{ "& .MuiToggleButton-root": { border: "none" } }}
                  >
                    <StyledToggleButton value="site">Сайт</StyledToggleButton>
                    <StyledToggleButton value="cafe">Кафе</StyledToggleButton>
                    <StyledToggleButton value="kc">КЦ</StyledToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                <Grid
                  size={{ xs: 12 }}
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}
                >
                  <StyledButton
                    variant="outlined"
                    onClick={openCustomCostsDialog}
                  >
                    Ручные расходы
                  </StyledButton>
                  <StyledButton
                    variant="outlined"
                    onClick={resetFilters}
                    startIcon={<DeleteIcon />}
                  >
                    Сбросить
                  </StyledButton>
                  <StyledButton
                    variant="primary"
                    onClick={applyRequest}
                    disabled={isLoad}
                    startIcon={<SearchIcon />}
                  >
                    Применить
                  </StyledButton>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                width: "100%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, py: 1.5 }}>
                <StyledButton
                  variant="outlined"
                  startIcon={<ViewColumnIcon />}
                  onClick={() => setColumnsDialogOpen(true)}
                >
                  Колонки
                </StyledButton>
              </Box>
              <StickyTableContainer tableMinWidth={tableMinWidth}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell isHeader={true}>ИСТОЧНИК ТРАФИКА</StyledTableCell>
                      {visibleColumnDefinitions.map((column) => (
                        <StyledTableCell
                          key={column.key}
                          isHeader={true}
                          align="right"
                          noWrap
                        >
                          {column.label}
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row) => (
                      <RenderTableRow
                        key={row.id}
                        row={row}
                      />
                    ))}
                    {tableData.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={visibleColumnDefinitions.length + 1}
                          align="center"
                          sx={{ py: 6 }}
                        >
                          <Typography
                            variant="body1"
                            color="text.secondary"
                          >
                            Выберите фильтры и нажмите "Применить" для отображения данных
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </StickyTableContainer>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default function FeedBack() {
  return <EndPage />;
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

  return {
    props: {},
  };
}
