import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import CityCafeAutocomplete2 from "@/ui/CityCafeAutocomplete2";
import dayjs from "dayjs";
import { MyAutocomplite, MyDatePickerNew, MyTextInput } from "@/ui/Forms";

function FeedbackPage() {
  const standardForm = {
    points: [],
    dateStart: dayjs(new Date()).format("YYYY-MM-DD"),
    dateEnd: dayjs(new Date()).format("YYYY-MM-DD"),
    utm: [],
    orderStart: null,
    orderEnd: null,
    typeOrder: [{ id: 1, name: "Все" }],
  };
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [points, setPoints] = useState([]);
  const [form, setForm] = useState(standardForm);
  const [tableData, setTableData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setPoints(data.points);
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

  const applyRequest = () => {
    console.log("Фильтры:", form);
    getData("get_data", {
      ...form,
      dateStart: dayjs(form.dateStart).format("YYYY-MM-DD"),
      dateEnd: dayjs(form.dateEnd).format("YYYY-MM-DD"),
    }).then((data) => {
      const formattedData = formatApiData(data);
      setTableData(formattedData);
    });
  };

  // Функция для форматирования данных из API
  const formatApiData = (apiData) => {
    const result = [];

    // Функция для преобразования объекта кафе в строку таблицы
    const transformItem = (item, sourceType) => {
      // Проверяем, есть ли у item нужные поля
      const visits = item.visits || 0;
      const cost = item.cost || 0;
      const orders = parseInt(item.orders) || 0;
      const revenue = item.revenue || 0;
      const newClients = item.newClients || 0;
      const existingClients = item.existingClients || 0;
      const primaryOrders = parseInt(item.primaryOrders) || 0;
      const repeatOrders = parseInt(item.repeatOrders) || 0;

      // Вычисляем производные показатели
      const conversion = visits > 0 ? (orders / visits) * 100 : 0;
      const costPerOrder = orders > 0 ? cost / orders : 0;
      const averageCheck = orders > 0 ? revenue / orders : 0;
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : revenue > 0 ? Infinity : 0;
      const drr = revenue > 0 ? (cost / revenue) * 100 : 0;
      const ltv = orders > 0 ? revenue / orders : 0;

      return {
        id: `${sourceType}_${item.id}`,
        name: item.name,
        sourceType: sourceType,
        visits: visits,
        cost: cost,
        orders: orders,
        conversion: conversion,
        costPerOrder: costPerOrder,
        revenue: revenue,
        averageCheck: averageCheck,
        roi: roi,
        newClients: newClients,
        existingClients: existingClients,
        primaryOrders: primaryOrders,
        repeatOrders: repeatOrders,
        drr: drr,
        ltv: ltv,
      };
    };

    // Обработка cafe_data
    if (apiData.cafe_data && Array.isArray(apiData.cafe_data)) {
      const cafeItems = apiData.cafe_data.map((item) => transformItem(item, "cafe"));

      // Добавляем итоговую строку по кафе
      if (cafeItems.length > 0) {
        const cafeTotal = calculateTotal(cafeItems, "cafe", "ИТОГО по Кафе");
        result.push(cafeTotal);
        // Добавляем детали для раскрытия
        cafeTotal.details = cafeItems;
      }
    }

    // Обработка kc_data
    if (apiData.kc_data && Array.isArray(apiData.kc_data)) {
      const kcItems = apiData.kc_data.map((item) => transformItem(item, "kc"));

      if (kcItems.length > 0) {
        const kcTotal = calculateTotal(kcItems, "kc", "ИТОГО по КЦ");
        result.push(kcTotal);
        kcTotal.details = kcItems;
      }
    }

    // Обработка site_data
    if (apiData.site_data && Array.isArray(apiData.site_data)) {
      const siteItems = apiData.site_data.map((item) => transformItem(item, "site"));

      if (siteItems.length > 0) {
        const siteTotal = calculateTotal(siteItems, "site", "ИТОГО по Сайту");
        result.push(siteTotal);
        siteTotal.details = siteItems;
      }
    }

    // Общий итог
    if (result.length > 0) {
      const grandTotal = calculateTotal(result, "grand", "ВСЕГО ПО ВСЕМ ИСТОЧНИКАМ");
      grandTotal.isGrandTotal = true;
      result.unshift(grandTotal);
    }

    return result;
  };

  // Функция для подсчёта итогов
  const calculateTotal = (items, sourceType, name) => {
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

    items.forEach((item) => {
      total.visits += item.visits;
      total.cost += item.cost;
      total.orders += item.orders;
      total.revenue += item.revenue;
      total.newClients += item.newClients;
      total.existingClients += item.existingClients;
      total.primaryOrders += item.primaryOrders;
      total.repeatOrders += item.repeatOrders;
    });

    // Вычисляем производные показатели для итога
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

  const handleTypeOrderChange = (data, value) => {
    const isAllSelected = value.some((item) => item.id === 1);

    if (isAllSelected) {
      const allItem = value.find((item) => item.id === 1);
      setField("typeOrder", allItem ? [allItem] : []);
    } else {
      setField("typeOrder", value);
    }
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

  // Компонент строки таблицы с возможностью вложенности
  const RenderTableRow = ({ row, level = 0 }) => {
    const isExpanded = expandedRows.has(row.id);
    const hasChildren = row.details && row.details.length > 0;
    const isTotalRow = row.isTotal;
    const isGrandTotal = row.id === "total_grand";

    // Функция для форматирования чисел
    const formatNumber = (value) => {
      if (value === Infinity) return "∞";
      if (typeof value === "number" && !isNaN(value)) {
        return value.toLocaleString();
      }
      return "0";
    };

    const formatPercent = (value) => {
      if (value === Infinity) return "∞";
      if (typeof value === "number" && !isNaN(value)) {
        return value.toFixed(2) + "%";
      }
      return "0%";
    };

    const formatCurrency = (value) => {
      if (value === Infinity) return "∞";
      if (typeof value === "number" && !isNaN(value)) {
        return value.toFixed(2);
      }
      return "0";
    };

    return (
      <>
        <TableRow
          sx={{
            backgroundColor: isTotalRow ? (isGrandTotal ? "#f5f5f5" : "#fafafa") : "transparent",
            fontWeight: isTotalRow ? "bold" : "normal",
            "& > td": {
              borderBottom: isTotalRow ? "2px solid #e0e0e0" : "1px solid #e0e0e0",
              fontWeight: isTotalRow ? "bold" : "normal",
            },
          }}
        >
          <TableCell style={{ paddingLeft: level * 20 + 16 }}>
            {hasChildren && (
              <IconButton
                size="small"
                onClick={() => toggleRow(row.id)}
              >
                {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
              </IconButton>
            )}
            {row.name}
          </TableCell>
          <TableCell align="right">{formatNumber(row.visits)}</TableCell>
          <TableCell align="right">{formatNumber(row.cost)}</TableCell>
          <TableCell align="right">{formatNumber(row.orders)}</TableCell>
          <TableCell align="right">{formatPercent(row.conversion)}</TableCell>
          <TableCell align="right">{formatCurrency(row.costPerOrder)}</TableCell>
          <TableCell align="right">{formatNumber(row.revenue)}</TableCell>
          <TableCell align="right">{formatCurrency(row.averageCheck)}</TableCell>
          <TableCell align="right">
            {row.roi === Infinity ? "∞" : row.roi.toFixed(2) + "%"}
          </TableCell>
          <TableCell align="right">{formatNumber(row.newClients)}</TableCell>
          <TableCell align="right">{formatNumber(row.existingClients)}</TableCell>
          <TableCell align="right">{formatNumber(row.primaryOrders)}</TableCell>
          <TableCell align="right">{formatNumber(row.repeatOrders)}</TableCell>
          <TableCell align="right">{formatPercent(row.drr)}</TableCell>
          <TableCell align="right">{formatCurrency(row.ltv)}</TableCell>
        </TableRow>
        {hasChildren &&
          isExpanded &&
          row.details.map((detail) => (
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
      size={{
        xs: 12,
        sm: 12,
      }}
      sx={{
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

      {/* Фильтры */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <CityCafeAutocomplete2
          label="Кафе"
          points={points}
          value={form.points}
          onChange={(v) => setField("points", v)}
          withAll
          withAllSelected
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <MyDatePickerNew
          label="Дата от"
          customActions={true}
          value={dayjs(form.dateStart)}
          maxDate={dayjs(form.dateEnd) ?? dayjs()}
          func={(e) => setField("dateStart", e)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <MyDatePickerNew
          label="Дата до"
          customActions={true}
          value={dayjs(form.dateEnd)}
          minDate={dayjs(form.dateStart) ?? dayjs()}
          func={(e) => setField("dateEnd", e)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <MyAutocomplite
          label="UTM"
          multiple={true}
          data={[
            { id: 1, name: "source" },
            { id: 2, name: "medium" },
            { id: 3, name: "campaign" },
            { id: 4, name: "content" },
            { id: 5, name: "term" },
          ]}
          value={form.utm}
          func={(data, value) => setField("utm", value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <MyTextInput
          type="number"
          label="Заказов от"
          value={form.orderStart}
          func={({ target }) => setField("orderStart", target?.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <MyTextInput
          type="number"
          label="Заказов до"
          value={form.orderEnd}
          func={({ target }) => setField("orderEnd", target?.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <MyAutocomplite
          label="Способ заказа"
          multiple={true}
          data={[
            { id: 1, name: "Все" },
            { id: 2, name: "Сайт" },
            { id: 3, name: "Кафе" },
            { id: 4, name: "КЦ" },
          ]}
          value={form.typeOrder}
          func={handleTypeOrderChange}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12 }}>
        <Button
          onClick={() => applyRequest()}
          variant="contained"
        >
          Показать
        </Button>
      </Grid>

      {/* Таблица */}
      <Grid
        size={{ xs: 12, sm: 12 }}
        sx={{ mt: 4, overflowX: "auto" }}
      >
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#cc0033" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Источник</TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Визиты
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Расход
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Заказы
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Конверсия в заказ
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Стоимость заказа
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Сумма заказов
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Средний чек
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                ROI
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Новые клиенты
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Действующие клиенты
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Первичные заказы
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Повторные заказы
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                ДРР
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                LTV
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <RenderTableRow
                key={row.id}
                row={row}
              />
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <FeedbackPage />;
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
