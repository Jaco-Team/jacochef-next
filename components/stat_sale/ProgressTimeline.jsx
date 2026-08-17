import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";

const TimelineContainer = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  boxSizing: "border-box",
  padding: "40px 20px 60px",
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "20px",
  left: 0,
  height: "4px",
  backgroundColor: theme.palette.grey[200],
  borderRadius: "2px",
  width: "100%",
}));

const MonthMarker = styled(Box, {
  shouldForwardProp: (prop) => prop !== "position",
})(({ position }) => ({
  position: "absolute",
  top: "10px",
  left: `${position}%`,
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
  zIndex: 2,
}));

const MarkerCircle = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isActive" && prop !== "markerColor",
})(({ theme, isActive, markerColor }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: isActive ? "24px" : "16px",
  height: isActive ? "24px" : "16px",
  borderRadius: "50%",
  backgroundColor: isActive ? theme.palette.background.paper : markerColor,
  border: `3px solid ${markerColor}`,
  transition: "all 0.3s ease",
  "&::after": isActive
    ? {
        content: '""',
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: markerColor,
      }
    : {},
}));

const MonthLabel = styled(Box)(() => ({
  marginTop: "8px",
  textAlign: "center",
}));

const CustomTooltip = styled(Paper)(({ theme }) => ({
  padding: "16px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[3],
  minWidth: "230px",
  maxWidth: "280px",
}));

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (num) => new Intl.NumberFormat("ru-RU").format(toNumber(num));

const calculateGoalPercent = (plan, fact) => {
  const safePlan = toNumber(plan);
  if (!safePlan) return 0;
  return ((toNumber(fact) - safePlan) / safePlan) * 100;
};

const calculateCompletionPercent = (plan, fact) => {
  const safePlan = toNumber(plan);
  if (!safePlan) return 0;
  return (toNumber(fact) / safePlan) * 100;
};

const formatSignedPercent = (value) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue > 0 ? "+" : "";
  return `${sign}${safeValue.toFixed(2)}%`;
};

const getGoalPercentColor = (value) => {
  if (value > 0) return "success.main";
  if (value < 0) return "error.main";
  return "text.primary";
};

const getCompletionColor = (value) => (value >= 100 ? "success.main" : "error.main");

const getShortMonthName = (monthName = "") => {
  const shortNames = {
    январь: "ЯНВ",
    февраль: "ФЕВ",
    март: "МАР",
    апрель: "АПР",
    май: "МАЙ",
    июнь: "ИЮН",
    июль: "ИЮЛ",
    август: "АВГ",
    сентябрь: "СЕН",
    октябрь: "ОКТ",
    ноябрь: "НОЯ",
    декабрь: "ДЕК",
  };
  return shortNames[String(monthName).toLowerCase()] || monthName;
};

const getMonthOrder = (item) => {
  const monthNumber = Number(item.monthNumber);
  if (Number.isFinite(monthNumber)) return monthNumber;
  const [, periodMonth] = String(item.periodKey ?? "").split("-");
  return Number(periodMonth) || 0;
};

const SummaryValue = ({ label, value, color, capitalize = false }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
    >
      {label}
    </Typography>
    <Typography
      variant="h6"
      color={color}
      sx={capitalize ? { textTransform: "capitalize" } : undefined}
    >
      {value}
    </Typography>
  </Box>
);

const TooltipRow = ({ label, value, color }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.5 }}>
    <Typography
      variant="body2"
      color="text.secondary"
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      color={color}
    >
      {value}
    </Typography>
  </Box>
);

const ProgressTimeline = ({
  data,
  title = "Выполнение плана",
  cumulative = false,
  annualPlanTotal = null,
  collapsible = true,
  defaultExpanded = false,
  resetKey,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = useState(collapsible ? defaultExpanded : true);
  const [summaryMode, setSummaryMode] = useState("actual");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (collapsible) setExpanded(defaultExpanded);
    setSummaryMode("actual");
  }, [collapsible, defaultExpanded, resetKey]);

  const currentYearData = useMemo(
    () =>
      data
        .filter((item) => Number(item.year) === currentYear)
        .sort((a, b) => getMonthOrder(a) - getMonthOrder(b)),
    [currentYear, data],
  );

  const progressData = useMemo(() => {
    if (!cumulative) return currentYearData;

    let planTotal = 0;
    let factTotal = 0;
    return currentYearData.map((item) => {
      planTotal += toNumber(item.planQty);
      factTotal += toNumber(item.factQty);
      return {
        ...item,
        planQty: planTotal,
        factQty: factTotal,
      };
    });
  }, [cumulative, currentYearData]);

  const annualPlanAvailable =
    annualPlanTotal !== null && annualPlanTotal !== undefined && toNumber(annualPlanTotal) > 0;
  const totalPlan = progressData.reduce((sum, item) => sum + toNumber(item.planQty), 0);
  const totalFact = progressData.reduce((sum, item) => sum + toNumber(item.factQty), 0);
  const currentMonthIndex = progressData.length - 1;
  const lastMonthData = progressData[currentMonthIndex];
  const actualMonthIndex = cumulative
    ? currentMonthIndex
    : [...progressData].reduce(
        (lastIndex, item, index) => (toNumber(item.factQty) > 0 ? index : lastIndex),
        -1,
      );
  const safeActualMonthIndex = actualMonthIndex >= 0 ? actualMonthIndex : currentMonthIndex;
  const actualMonthData = progressData[safeActualMonthIndex];
  const cumulativePeriodLabel = `${progressData[0]?.month ?? ""} - ${lastMonthData?.month ?? ""}`;
  const summaryData = cumulative
    ? lastMonthData
    : summaryMode === "period"
      ? {
          month: cumulativePeriodLabel,
          planQty: totalPlan,
          factQty: totalFact,
        }
      : actualMonthData;
  const summaryTitle = cumulative
    ? `Выполнение плана за период (${currentYear})`
    : summaryMode === "period"
      ? `Выполнение цели за период (${currentYear})`
      : `Выполнение цели ${summaryData?.month ?? ""} (${currentYear})`;
  const summaryProgressPercentage = calculateCompletionPercent(
    summaryData?.planQty,
    summaryData?.factQty,
  );
  const summaryGoalPercent = calculateGoalPercent(summaryData?.planQty, summaryData?.factQty);
  const annualProgressPercentage = annualPlanAvailable
    ? calculateCompletionPercent(annualPlanTotal, summaryData?.factQty)
    : null;
  const isPlanReached = toNumber(summaryData?.factQty) >= toNumber(summaryData?.planQty);
  const selectedMonthIndex = cumulative
    ? currentMonthIndex
    : summaryMode === "period"
      ? currentMonthIndex
      : safeActualMonthIndex;

  const renderContent = () => {
    if (!progressData.length) {
      return (
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ py: 3 }}
        >
          Нет данных за {currentYear} год
        </Typography>
      );
    }

    return (
      <>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 0 }}
            >
              {summaryTitle}
            </Typography>
            {!cumulative ? (
              <ToggleButtonGroup
                size="small"
                color="primary"
                exclusive
                value={summaryMode}
                onChange={(event, nextValue) => {
                  if (nextValue) setSummaryMode(nextValue);
                }}
              >
                <ToggleButton value="actual">Актуальный месяц</ToggleButton>
                <ToggleButton value="period">Весь период</ToggleButton>
              </ToggleButtonGroup>
            ) : null}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1.5, sm: 2 },
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {cumulative ? (
                <>
                  {summaryProgressPercentage.toFixed(1)}% плана периода ·{" "}
                  {annualPlanAvailable
                    ? `${annualProgressPercentage.toFixed(1)}% годового плана`
                    : "годовой план недоступен"}
                </>
              ) : (
                <>
                  {summaryProgressPercentage.toFixed(1)}%
                  {isPlanReached
                    ? " · план выполнен"
                    : ` · осталось ${(100 - summaryProgressPercentage).toFixed(2)}% до ${
                        summaryMode === "period" ? "периода" : (summaryData?.month ?? "")
                      }`}
                </>
              )}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: isPlanReached ? "success.main" : "error.main",
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Факт
              </Typography>
              <Box sx={{ width: 12, height: 2, bgcolor: "grey.400" }} />
              <Typography
                variant="caption"
                color="text.secondary"
              >
                План
              </Typography>
            </Box>
          </Box>
        </Box>

        {summaryData ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: cumulative ? "repeat(5, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <SummaryValue
                label={cumulative ? "ПЕРИОД" : summaryMode === "period" ? "ПЕРИОД" : "МЕСЯЦ"}
                value={cumulative ? cumulativePeriodLabel : summaryData.month}
                capitalize
              />
              <SummaryValue
                label={cumulative ? "ПЛАН ПЕРИОДА" : "ПЛАН"}
                value={formatNumber(summaryData.planQty)}
              />
              <SummaryValue
                label={cumulative ? "ФАКТ ПЕРИОДА" : "ФАКТ"}
                value={formatNumber(summaryData.factQty)}
                color={
                  cumulative
                    ? getCompletionColor(summaryProgressPercentage)
                    : getGoalPercentColor(summaryGoalPercent)
                }
              />
              <SummaryValue
                label={cumulative ? "ВЫПОЛНЕНИЕ ПЕРИОДА" : "% К ЦЕЛИ"}
                value={
                  cumulative
                    ? `${summaryProgressPercentage.toFixed(1)}%`
                    : formatSignedPercent(summaryGoalPercent)
                }
                color={
                  cumulative
                    ? getCompletionColor(summaryProgressPercentage)
                    : getGoalPercentColor(summaryGoalPercent)
                }
              />
              {cumulative ? (
                <SummaryValue
                  label="ОТ ПЛАНА ГОДА"
                  value={
                    annualPlanAvailable
                      ? `${annualProgressPercentage.toFixed(1)}% из ${formatNumber(annualPlanTotal)}`
                      : "Нет данных"
                  }
                  color={
                    annualPlanAvailable
                      ? getCompletionColor(annualProgressPercentage)
                      : "text.secondary"
                  }
                />
              ) : null}
            </Box>
          </Paper>
        ) : null}

        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            overflowX: { xs: "hidden", sm: "visible" },
            pb: { xs: 1, sm: 0 },
          }}
        >
          <TimelineContainer sx={{ minWidth: 0 }}>
            <ProgressBar />

            {progressData.map((item, index) => {
              const itemKey = item.periodKey ?? `${item.year ?? ""}-${item.month}-${index}`;
              const itemGoalPercent = calculateGoalPercent(item.planQty, item.factQty);
              const edgeOffset = isMobile ? 7 : 4;
              const segmentColor =
                itemGoalPercent > 0
                  ? theme.palette.success.main
                  : itemGoalPercent < 0
                    ? theme.palette.error.main
                    : theme.palette.grey[500];
              const prevPosition =
                index === 0
                  ? 0
                  : edgeOffset +
                    ((index - 1) / (progressData.length - 1 || 1)) * (100 - edgeOffset * 2);
              const currentPosition =
                edgeOffset + (index / (progressData.length - 1 || 1)) * (100 - edgeOffset * 2);

              return (
                <Box
                  key={`segment-${itemKey}`}
                  sx={{
                    position: "absolute",
                    top: "20px",
                    left: `${prevPosition}%`,
                    width: `${Math.max(0, currentPosition - prevPosition)}%`,
                    height: "4px",
                    borderRadius: "2px",
                    bgcolor: segmentColor,
                    zIndex: 1,
                  }}
                />
              );
            })}

            {progressData.map((item, index) => {
              const itemKey = item.periodKey ?? `${item.year ?? ""}-${item.month}-${index}`;
              const isActive = index === selectedMonthIndex;
              const edgeOffset = isMobile ? 7 : 4;
              const itemGoalPercent = calculateGoalPercent(item.planQty, item.factQty);
              const itemCompletionPercent = calculateCompletionPercent(item.planQty, item.factQty);
              const itemAnnualPercent = annualPlanAvailable
                ? calculateCompletionPercent(annualPlanTotal, item.factQty)
                : null;
              const markerColor =
                itemGoalPercent > 0
                  ? theme.palette.success.main
                  : itemGoalPercent < 0
                    ? theme.palette.error.main
                    : theme.palette.grey[500];
              const position =
                edgeOffset + (index / (progressData.length - 1 || 1)) * (100 - edgeOffset * 2);
              const deviation = toNumber(item.factQty) - toNumber(item.planQty);

              return (
                <Tooltip
                  key={itemKey}
                  title={
                    <CustomTooltip>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, textTransform: "capitalize" }}
                      >
                        {item.month} ({item.year})
                      </Typography>
                      <TooltipRow
                        label={cumulative ? "Накопленный план" : "План"}
                        value={formatNumber(item.planQty)}
                      />
                      <TooltipRow
                        label={cumulative ? "Накопленный факт" : "Факт"}
                        value={formatNumber(item.factQty)}
                      />
                      <TooltipRow
                        label="Отклонение"
                        value={`${deviation > 0 ? "+" : deviation < 0 ? "−" : ""}${formatNumber(
                          Math.abs(deviation),
                        )}`}
                        color={deviation >= 0 ? "success.main" : "error.main"}
                      />
                      <TooltipRow
                        label={cumulative ? "% плана периода" : "% к цели"}
                        value={
                          cumulative
                            ? `${itemCompletionPercent.toFixed(1)}%`
                            : formatSignedPercent(itemGoalPercent)
                        }
                        color={
                          cumulative
                            ? getCompletionColor(itemCompletionPercent)
                            : getGoalPercentColor(itemGoalPercent)
                        }
                      />
                      {cumulative ? (
                        <TooltipRow
                          label="% годового плана"
                          value={
                            annualPlanAvailable
                              ? `${itemAnnualPercent.toFixed(1)}% из ${formatNumber(annualPlanTotal)}`
                              : "Нет данных"
                          }
                          color={
                            annualPlanAvailable
                              ? getCompletionColor(itemAnnualPercent)
                              : "text.secondary"
                          }
                        />
                      ) : null}
                    </CustomTooltip>
                  }
                  placement="top"
                  arrow
                >
                  <MonthMarker position={position}>
                    <MarkerCircle
                      isActive={isActive}
                      markerColor={markerColor}
                    />
                    <MonthLabel>
                      <Typography
                        variant="caption"
                        fontWeight={isActive ? 700 : 400}
                        sx={{ textTransform: "uppercase" }}
                      >
                        {getShortMonthName(item.month)}
                      </Typography>
                      {!isMobile ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {formatNumber(item.planQty)}
                        </Typography>
                      ) : null}
                    </MonthLabel>
                  </MonthMarker>
                </Tooltip>
              );
            })}
          </TimelineContainer>
        </Box>
      </>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, width: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          mb: expanded ? 3 : 0,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#333" }}
        >
          {title}
        </Typography>
        {collapsible ? (
          <Button
            size="small"
            onClick={() => setExpanded((value) => !value)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? "Свернуть" : "Развернуть"}
          </Button>
        ) : null}
      </Box>
      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
      >
        {renderContent()}
      </Collapse>
    </Paper>
  );
};

export default ProgressTimeline;
