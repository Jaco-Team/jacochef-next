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
import { styled } from "@mui/material/styles";
import { api_laravel_local, api_laravel } from "@/src/api_new";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import MyAlert from "@/ui/MyAlert";

const PRIMARY_COLOR = "#cc0033";
const BACKGROUND_COLOR = "#f5f5f5";

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

const StyledTableCell = styled(TableCell)(({ theme, isHeader, isTotal, noWrap }) => ({
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

const StyledTableRow = styled(TableRow)(({ theme, isTotal, isGrandTotal }) => ({
  backgroundColor: isGrandTotal ? "#f5f5f5" : isTotal ? "#fafafa" : "transparent",
  "&:hover": {
    backgroundColor: isTotal || isGrandTotal ? "inherit" : "#f9f9f9",
  },
  "&:hover .MuiTableCell-root:first-of-type": {
    backgroundColor: isTotal || isGrandTotal ? "inherit" : "#f9f9f9",
  },
}));

const StickyTableContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflowX: "auto",
  width: "100%",
  "& .MuiTable-root": {
    minWidth: 1800,
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

const parseMetric = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const calculateRoi = (revenue, cost) => {
  const totalRevenue = parseMetric(revenue);
  const totalCost = parseMetric(cost);
  return totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
};

const isRowIncludedInRoi = (row) => {
  const cost = parseMetric(row.roiCost ?? row.cost);
  if (cost <= 0) {
    return false;
  }

  const roi = row.roi;
  if (roi === Infinity || roi === -Infinity || !Number.isFinite(roi) || roi === 0) {
    return false;
  }

  return true;
};

const applyAggregatedRoi = (item, rows) => {
  let roiRevenue = 0;
  let roiCost = 0;

  (rows || []).forEach((row) => {
    if (!isRowIncludedInRoi(row)) {
      return;
    }

    roiRevenue += parseMetric(row.roiRevenue ?? row.revenue);
    roiCost += parseMetric(row.roiCost ?? row.cost);
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

  item.conversion = visits > 0 ? (orders / visits) * 100 : 0;
  item.costPerOrder = orders > 0 ? cost / orders : 0;
  item.averageCheck = orders > 0 ? revenue / orders : 0;
  item.roi = calculateRoi(revenue, cost);
  item.roiRevenue = cost > 0 ? revenue : 0;
  item.roiCost = cost > 0 ? cost : 0;
  item.drr = revenue > 0 ? (cost / revenue) * 100 : 0;
  item.ltv = orders > 0 ? revenue / orders : 0;

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
  applyDerivedMetrics(item);
  return applyAggregatedRoi(item, rows);
};

const rollupMetricsFromChildren = (item) => {
  const childKey =
    item.children?.length > 0 ? "children" : item.details?.length > 0 ? "details" : null;

  if (childKey) {
    item[childKey] = item[childKey].map(rollupMetricsFromChildren);

    ADDITIVE_METRIC_FIELDS.forEach((field) => {
      item[field] = 0;
    });

    item[childKey].forEach((child) => {
      ADDITIVE_METRIC_FIELDS.forEach((field) => {
        item[field] += parseMetric(child[field]);
      });
    });

    applyDerivedMetrics(item);
    return applyAggregatedRoi(item, item[childKey]);
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
    dateEnd: dayjs(new Date()).format("YYYY-MM-DD"),
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
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState(standardForm);
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setCities(data.cities);
      setLastUpdate(dayjs().format("HH:mm"));
    });
  }, []);

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

  const applyRequest = () => {
    console.log("Фильтры:", form);
    getData("get_data", {
      ...form,
      dateStart: dayjs(form.dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(form.dateEnd).format("YYYY-MM-DD"),
    }).then((data) => {
      if (data.st) {
        const formattedData = formatApiData(data);
        setTableData(formattedData);
        setLastUpdate(dayjs().format("HH:mm"));
      } else {
        if (!data.st) {
          setErrStatus(data.st);
          setErrText(data.text);
          setOpenAlert(true);
        }
      }
    });
  };

  const resetFilters = () => {
    setForm(standardForm);
    setTableData([]);
  };

  const refreshData = () => {
    applyRequest();
  };

  // Новая функция группировки по типам источников трафика
  const regroupByTrafficSource = (utmData) => {
    if (!utmData || typeof utmData !== "object") return [];

    // Группировка источников по типам
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
      Рефералы: ["promokodi.net", "jacofood.ru", "link.2gis.ru", "suggest.sso.dzen.ru"],
      "Рекламные системы": ["direct", "vk_ads", "yandex_direct"],
      "Прямые заходы": ["none", "(direct)"],
      Другое: [],
    };

    const result = {};

    // Проходим по всем source
    for (const [sourceName, sourceData] of Object.entries(utmData)) {
      if (sourceData.level !== "src_source") continue;

      // Определяем группу для source
      let groupName = "Другое";
      for (const [group, sources] of Object.entries(trafficGroups)) {
        if (sources.includes(sourceName) || sources.some((s) => sourceName.includes(s))) {
          groupName = group;
          break;
        }
      }

      // Создаем группу если её нет
      if (!result[groupName]) {
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
      }

      // Суммируем данные для группы
      const group = result[groupName];
      group.visits += parseMetric(sourceData.visits);
      group.cost += parseMetric(sourceData.cost);
      group.orders += parseMetric(sourceData.orders);
      group.revenue += parseMetric(sourceData.revenue);
      group.newClients += parseMetric(sourceData.newClients);
      group.existingClients += parseMetric(sourceData.existingClients);
      group.primaryOrders += parseMetric(sourceData.primaryOrders);
      group.repeatOrders += parseMetric(sourceData.repeatOrders);

      // Создаем детальный источник (конкретный источник трафика)
      const detailedSource = {
        id: `${sourceData.level}_${sourceName}`,
        name: sourceData.name || sourceName,
        sourceType: "site",
        level: "src_source_detailed",
        visits: parseMetric(sourceData.visits),
        cost: parseMetric(sourceData.cost),
        orders: parseMetric(sourceData.orders),
        revenue: parseMetric(sourceData.revenue),
        newClients: parseMetric(sourceData.newClients),
        existingClients: parseMetric(sourceData.existingClients),
        primaryOrders: parseMetric(sourceData.primaryOrders),
        repeatOrders: parseMetric(sourceData.repeatOrders),
        children: [],
      };

      // Обрабатываем children (medium) и группируем по типу площадки
      if (sourceData.children && sourceData.children.length > 0) {
        const platformGroups = {};

        sourceData.children.forEach((medium) => {
          if (medium.level === "src_medium") {
            // Определяем тип площадки
            let platformType = medium.name;
            if (medium.name === "organic") platformType = "Органика";
            else if (medium.name === "cpc") platformType = "Контекстная реклама";
            else if (medium.name === "referral") platformType = "Рефералы";
            else if (medium.name === "social") platformType = "Социальные сети";
            else if (medium.name === "email") platformType = "E-mail рассылки";
            else if (medium.name === "none" || medium.name === "(utm)")
              platformType = "Прямые заходы";
            else if (medium.name === "cpm") platformType = "Медийная реклама";

            if (!platformGroups[platformType]) {
              platformGroups[platformType] = {
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
            }

            // Суммируем данные для типа площадки
            const platform = platformGroups[platformType];
            platform.visits += parseMetric(medium.visits);
            platform.cost += parseMetric(medium.cost);
            platform.orders += parseMetric(medium.orders);
            platform.revenue += parseMetric(medium.revenue);
            platform.newClients += parseMetric(medium.newClients);
            platform.existingClients += parseMetric(medium.existingClients);
            platform.primaryOrders += parseMetric(medium.primaryOrders);
            platform.repeatOrders += parseMetric(medium.repeatOrders);

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
                  newClients: parseMetric(campaign.newClients),
                  existingClients: parseMetric(campaign.existingClients),
                  primaryOrders: parseMetric(campaign.primaryOrders),
                  repeatOrders: parseMetric(campaign.repeatOrders),
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

        detailedSource.children = Object.values(platformGroups);
      }

      group.children.push(detailedSource);
    }

    // Преобразуем объект в массив и добавляем расчетные поля
    return calculateMetricsForGroupedData(Object.values(result));
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
      newClients: parseMetric(child.newClients),
      existingClients: parseMetric(child.existingClients),
      primaryOrders: parseMetric(child.primaryOrders),
      repeatOrders: parseMetric(child.repeatOrders),
      children: child.children ? transformUtmChildrenSimple(child.children, sourceName) : [],
    }));
  };

  // Расчет метрик для сгруппированных данных
  const calculateMetricsForGroupedData = (items) => {
    return items.map((item) => rollupMetricsFromChildren({ ...item }));
  };

  const formatApiData = (apiData) => {
    const result = [];

    if (apiData.site_data && typeof apiData.site_data === "object") {
      // Используем новую функцию группировки
      const groupedData = regroupByTrafficSource(apiData.site_data);

      if (groupedData.length > 0) {
        result.push(
          aggregateTotalRow(
            {
              id: `total_site`,
              name: "ИТОГО по Сайту",
              isTotal: true,
              sourceType: "site",
            },
            groupedData,
          ),
        );
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
      result.unshift(
        aggregateTotalRow(
          {
            id: `total_grand`,
            name: "ВСЕГО",
            isTotal: true,
            isGrandTotal: true,
            sourceType: "grand",
          },
          result.slice(),
        ),
      );
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
    total.ltv = total.orders > 0 ? total.revenue / total.orders : 0;

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
    grandTotal.ltv = grandTotal.orders > 0 ? grandTotal.revenue / grandTotal.orders : 0;

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
      transformedItem.ltv =
        transformedItem.orders > 0 ? transformedItem.revenue / transformedItem.orders : 0;
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
      transformedChild.ltv =
        transformedChild.orders > 0 ? transformedChild.revenue / transformedChild.orders : 0;
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
      name: item.name,
      sourceType: sourceType,
      visits: parseMetric(item.visits),
      cost: parseMetric(item.cost),
      orders: parseMetric(item.orders),
      revenue: parseMetric(item.revenue),
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
      return value.toLocaleString("ru-RU");
    }
    return "0";
  };

  const formatPercent = (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return (
        value.toLocaleString("ru-RU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "%"
      );
    }
    return "0%";
  };

  const formatCurrency = (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "0,00";
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
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.visits)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.cost)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.orders)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            <Typography
              variant="body2"
              color={row.conversion > 5 ? "success.main" : "inherit"}
              fontWeight={isTotalRow ? 700 : 400}
              sx={{ whiteSpace: "nowrap" }}
            >
              {formatPercent(row.conversion)}
            </Typography>
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatCurrency(row.costPerOrder)} ₽
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.revenue)} ₽
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatCurrency(row.averageCheck)} ₽
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            <Typography
              variant="body2"
              color={row.roi > 100 ? "success.main" : row.roi < 0 ? "error.main" : "inherit"}
              fontWeight={isTotalRow ? 700 : 400}
              sx={{ whiteSpace: "nowrap" }}
            >
              {formatPercent(row.roi)}
            </Typography>
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.newClients)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.existingClients)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.primaryOrders)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatNumber(row.repeatOrders)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatPercent(row.drr)}
          </StyledTableCell>
          <StyledTableCell
            isHeader={false}
            isTotal={isTotalRow}
            align="right"
            noWrap
          >
            {formatCurrency(row.ltv)} ₽
          </StyledTableCell>
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

      <Grid size={{ xs: 12 }}>
        <StyledPaper>
          <Grid
            container
            spacing={3}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
              <MyAutocomplite
                label="Группы"
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
                onClick={resetFilters}
                startIcon={<DeleteIcon />}
              >
                Сбросить
              </StyledButton>
              <StyledButton
                variant="primary"
                onClick={applyRequest}
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
          <StickyTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell isHeader={true}>ИСТОЧНИК ТРАФИКА</StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    ВИЗИТЫ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    РАСХОД
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    ЗАКАЗЫ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    КОНВЕРСИЯ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    СТОИМОСТЬ ЗАКАЗА
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    СУММА ЗАКАЗОВ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    СРЕДНИЙ ЧЕК
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    ROI
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    НОВЫЕ КЛИЕНТЫ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    ДЕЙСТВУЮЩИЕ КЛИЕНТЫ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    ПЕРВИЧНЫЕ ЗАКАЗЫ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    ПОВТОРНЫЕ ЗАКАЗЫ
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    ДРР
                  </StyledTableCell>
                  <StyledTableCell
                    isHeader={true}
                    align="right"
                    noWrap
                  >
                    LTV
                  </StyledTableCell>
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
                      colSpan={15}
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
