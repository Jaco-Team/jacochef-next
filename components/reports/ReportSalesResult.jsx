import React, { useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import ReportSalesTable from "@/components/reports/ReportSalesTable";
import ReportSalesKpiCards from "@/components/reports/ReportSalesKpiCards";
import ReportSalesColumnsDialog from "@/components/reports/ReportSalesColumnsDialog";
import ReportCostDetailModal from "@/components/reports/ReportCostDetailModal";
import {
  DEFAULT_REPORT_SALES_VISIBLE_COLUMNS,
  REPORT_SALES_COLUMNS_STORAGE_KEY,
  REPORT_SALES_COLUMN_OPTIONS,
  REPORT_SALES_TOGGLEABLE_COLUMNS,
} from "@/components/reports/reportSalesColumns";

function normalizePoint(point) {
  if (!point) {
    return null;
  }

  return {
    id: point.id,
    base: point.base,
    name: point.name,
    city_id: point.city_id,
  };
}

export default function ReportSalesResult({ data, filters, onFetchCostDetail }) {
  const [tab, setTab] = useState("total");
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_REPORT_SALES_VISIBLE_COLUMNS);
  const [costDetailOpen, setCostDetailOpen] = useState(false);
  const [costDetailLoading, setCostDetailLoading] = useState(false);
  const [costDetailError, setCostDetailError] = useState(null);
  const [costDetailData, setCostDetailData] = useState(null);
  const [costDetailCafeLabel, setCostDetailCafeLabel] = useState("Все выбранные кафе");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedColumns = JSON.parse(
        window.localStorage.getItem(REPORT_SALES_COLUMNS_STORAGE_KEY),
      );

      if (savedColumns && typeof savedColumns === "object") {
        setVisibleColumns({
          ...DEFAULT_REPORT_SALES_VISIBLE_COLUMNS,
          ...savedColumns,
        });
      }
    } catch (_) {}
  }, []);

  const saveVisibleColumns = (nextColumns) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(REPORT_SALES_COLUMNS_STORAGE_KEY, JSON.stringify(nextColumns));
    }
  };

  const isColumnVisible = (key) => {
    const column = REPORT_SALES_COLUMN_OPTIONS.find((item) => item.key === key);

    if (column?.alwaysVisible) {
      return true;
    }

    return visibleColumns[key] !== false;
  };

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => {
      const nextColumns = {
        ...prev,
        [key]: !prev[key],
      };

      saveVisibleColumns(nextColumns);

      return nextColumns;
    });
  };

  const setAllColumns = (value) => {
    const nextColumns = REPORT_SALES_TOGGLEABLE_COLUMNS.reduce(
      (acc, item) => {
        acc[item.key] = value;
        return acc;
      },
      {
        ...visibleColumns,
        num: true,
        name: true,
      },
    );

    saveVisibleColumns(nextColumns);
    setVisibleColumns(nextColumns);
  };

  const closeCostDetail = () => {
    setCostDetailOpen(false);
    setCostDetailError(null);
  };

  const handleItemClick = async (item, pointContext = null) => {
    if (!item?.id || typeof onFetchCostDetail !== "function") {
      return;
    }

    const selectedPoints = Array.isArray(filters?.points) ? filters.points : [];
    const requestPoints = pointContext
      ? [normalizePoint(pointContext)].filter(Boolean)
      : selectedPoints.map(normalizePoint).filter(Boolean);

    const cafeLabel = pointContext?.name
      ? pointContext.name
      : requestPoints.length === 1
        ? requestPoints[0]?.name || "Выбранное кафе"
        : "Все выбранные кафе";

    setCostDetailCafeLabel(cafeLabel);
    setCostDetailOpen(true);
    setCostDetailLoading(true);
    setCostDetailError(null);
    setCostDetailData(null);

    try {
      const response = await onFetchCostDetail({
        dateStart: filters?.dateStart,
        dateEnd: filters?.dateEnd,
        points: requestPoints,
        item_id: item.id,
      });

      if (response?.st === false) {
        setCostDetailError(
          response?.text || response?.message || "Не удалось получить детализацию",
        );
        return;
      }

      setCostDetailData(response);
    } catch (_) {
      setCostDetailError("Не удалось получить детализацию");
    } finally {
      setCostDetailLoading(false);
    }
  };

  if (!data) {
    return null;
  }

  const totalItems = data?.total?.items || [];
  const totalTotals = data?.total?.totals || null;
  const points = Array.isArray(data?.points) ? data.points : [];
  const kpiTotals = tab === "total" ? totalTotals : null;

  return (
    <Grid
      container
      spacing={2}
    >
      {kpiTotals ? (
        <Grid size={{ xs: 12 }}>
          <ReportSalesKpiCards totals={kpiTotals} />
        </Grid>
      ) : null}

      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: "inline-flex",
              border: "1px solid #e5e7eb",
              borderRadius: 1.5,
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <Tabs
              value={tab}
              onChange={(event, newValue) => setTab(newValue)}
              variant="standard"
              scrollButtons={false}
              TabIndicatorProps={{ sx: { display: "none" } }}
              sx={{
                minHeight: 40,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  minHeight: 40,
                  px: 2.5,
                  color: "#6b7280",
                  fontFamily:
                    '"Roboto", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
                },
                "& .Mui-selected": {
                  color: "#111827 !important",
                  backgroundColor: "#f3f4f6",
                },
              }}
            >
              <Tab
                label="Сводно"
                value="total"
              />
              <Tab
                label="По кафе"
                value="points"
              />
            </Tabs>
          </Paper>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewColumnIcon />}
            onClick={() => setColumnsDialogOpen(true)}
            sx={{
              color: "#d50032",
              borderColor: "#d50032",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 1.5,
              px: 1.5,
              "&:hover": {
                borderColor: "#d50032",
                backgroundColor: "rgba(213, 0, 50, 0.04)",
              },
            }}
          >
            Колонки
          </Button>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        {tab === "total" ? (
          <ReportSalesTable
            title="Все выбранные кафе"
            items={totalItems}
            totals={totalTotals}
            isColumnVisible={isColumnVisible}
            onItemClick={(item) => handleItemClick(item, null)}
          />
        ) : null}

        {tab === "points" ? (
          points.length ? (
            points.map((point) => (
              <Box
                key={point?.id ?? point?.base ?? point?.name}
                sx={{ mb: 1 }}
              >
                {point?.totals ? (
                  <Box sx={{ mb: 1.5 }}>
                    <ReportSalesKpiCards totals={point.totals} />
                  </Box>
                ) : null}
                <ReportSalesTable
                  title={point?.name || "Кафе"}
                  items={point?.items || []}
                  totals={point?.totals || null}
                  isColumnVisible={isColumnVisible}
                  onItemClick={(item) => handleItemClick(item, point)}
                />
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2 }}
            >
              Нет данных по кафе
            </Typography>
          )
        ) : null}
      </Grid>

      <ReportSalesColumnsDialog
        open={columnsDialogOpen}
        onClose={() => setColumnsDialogOpen(false)}
        isColumnVisible={isColumnVisible}
        setAllColumns={setAllColumns}
        toggleColumn={toggleColumn}
      />

      <ReportCostDetailModal
        open={costDetailOpen}
        onClose={closeCostDetail}
        loading={costDetailLoading}
        error={costDetailError}
        data={costDetailData}
        cafeLabel={costDetailCafeLabel}
        dateStart={filters?.dateStart}
        dateEnd={filters?.dateEnd}
      />
    </Grid>
  );
}
