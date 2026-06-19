import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const TimelineContainer = styled(Box)(({ theme }) => ({
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

const MonthMarker = styled(Box)(({ theme, isActive, position }) => ({
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

const MarkerCircle = styled(Box)(({ theme, isActive, markerColor }) => ({
  width: isActive ? "24px" : "16px",
  height: isActive ? "24px" : "16px",
  borderRadius: "50%",
  backgroundColor: isActive ? theme.palette.background.paper : markerColor,
  border: `3px solid ${markerColor}`,
  transition: "all 0.3s ease",
  "&::after": isActive
    ? {
        content: '""',
        position: "absolute",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: markerColor,
      }
    : {},
}));

const MonthLabel = styled(Box)(({ theme, isActive }) => ({
  marginTop: "8px",
  textAlign: "center",
}));

const CustomTooltip = styled(Paper)(({ theme }) => ({
  padding: "16px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[3],
  maxWidth: "250px",
}));

const formatNumber = (num) => {
  return new Intl.NumberFormat("ru-RU").format(num);
};

const calculateGoalPercent = (plan, fact) => {
  const safePlan = Number(plan);
  const safeFact = Number(fact);

  if (!safePlan) return 0;

  return ((safeFact - safePlan) / safePlan) * 100;
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

const getShortMonthName = (monthName) => {
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
  return shortNames[monthName.toLowerCase()] || monthName;
};

const ProgressTimeline = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeMonth, setActiveMonth] = useState(null);
  const [summaryMode, setSummaryMode] = useState("actual");

  const {
    totalPlan,
    totalFact,
    currentMonthIndex,
    lastMonthData,
    actualMonthIndex,
    actualMonthData,
  } = useMemo(() => {
    const toNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const totalPlan = data.reduce((sum, item) => sum + toNumber(item.planQty), 0);
    const totalFact = data.reduce((sum, item) => sum + toNumber(item.factQty), 0);
    const currentMonthIndex = data.length - 1;
    const lastMonthData = data[currentMonthIndex];
    const detectedActualMonthIndex = [...data].reduce((lastIndex, item, index) => {
      return toNumber(item.factQty) > 0 ? index : lastIndex;
    }, -1);
    const actualMonthIndex =
      detectedActualMonthIndex >= 0 ? detectedActualMonthIndex : currentMonthIndex;
    const actualMonthData = data[actualMonthIndex];

    return {
      totalPlan,
      totalFact,
      currentMonthIndex,
      lastMonthData,
      actualMonthIndex,
      actualMonthData,
    };
  }, [data]);

  const summaryData =
    summaryMode === "period"
      ? {
          month: `${data[0]?.month ?? ""} - ${lastMonthData?.month ?? ""}`,
          planQty: totalPlan,
          factQty: totalFact,
        }
      : actualMonthData;
  const summaryMonthLabel = summaryMode === "period" ? "ПЕРИОД" : "МЕСЯЦ";
  const summaryTitle =
    summaryMode === "period"
      ? "Выполнение цели за период"
      : `Выполнение цели ${summaryData?.month ?? ""}`;
  const summaryTargetLabel = summaryMode === "period" ? "периода" : (summaryData?.month ?? "");
  const summaryProgressPercentage =
    Number(summaryData?.planQty) > 0
      ? (Number(summaryData?.factQty) / Number(summaryData?.planQty)) * 100
      : 0;
  const summaryGoalPercent = calculateGoalPercent(summaryData?.planQty, summaryData?.factQty);
  const isPlanReached = Number(summaryData?.factQty) >= Number(summaryData?.planQty);
  const selectedMonthIndex = summaryMode === "period" ? currentMonthIndex : actualMonthIndex;

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, width: "100%" }}
    >
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
            gutterBottom
            sx={{ mb: 0 }}
          >
            {summaryTitle}
          </Typography>
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
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 2 },
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {summaryProgressPercentage.toFixed(1)}%
            {isPlanReached
              ? " · план выполнен"
              : ` · осталось ${formatNumber((100 - summaryProgressPercentage).toFixed(2))}% до ${summaryTargetLabel}`}
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

      {summaryData && (
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
                sm: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {summaryMonthLabel}
              </Typography>
              <Typography
                variant="h6"
                sx={{ textTransform: "capitalize" }}
              >
                {summaryData.month}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                ПЛАН
              </Typography>
              <Typography variant="h6">{formatNumber(summaryData.planQty)}</Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                ФАКТ
              </Typography>
              <Typography
                variant="h6"
                color={getGoalPercentColor(summaryGoalPercent)}
              >
                {formatNumber(summaryData.factQty)}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                % К ЦЕЛИ
              </Typography>
              <Typography
                variant="h6"
                color={getGoalPercentColor(summaryGoalPercent)}
              >
                {formatSignedPercent(summaryGoalPercent)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

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

          {data.map((item, index) => {
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
                : edgeOffset + ((index - 1) / (data.length - 1 || 1)) * (100 - edgeOffset * 2);
            const currentPosition =
              edgeOffset + (index / (data.length - 1 || 1)) * (100 - edgeOffset * 2);

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

          {data.map((item, index) => {
            const itemKey = item.periodKey ?? `${item.year ?? ""}-${item.month}-${index}`;
            const isActive = index === selectedMonthIndex;
            const edgeOffset = isMobile ? 7 : 4;
            const itemGoalPercent = calculateGoalPercent(item.planQty, item.factQty);
            const markerColor =
              itemGoalPercent > 0
                ? theme.palette.success.main
                : itemGoalPercent < 0
                  ? theme.palette.error.main
                  : theme.palette.grey[500];
            const position = edgeOffset + (index / (data.length - 1 || 1)) * (100 - edgeOffset * 2);

            return (
              <Tooltip
                key={itemKey}
                title={
                  <CustomTooltip>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, textTransform: "capitalize" }}
                    >
                      {item.month}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        План
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {formatNumber(item.planQty)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Факт
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {formatNumber(item.factQty)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Отклонение
                      </Typography>
                      <Typography
                        variant="body2"
                        color={item.planQty - item.factQty < 0 ? "success.main" : "error.main"}
                      >
                        ㅤ{item.planQty - item.factQty < 0 ? " + " : " - "}
                        {formatNumber(Math.abs(item.planQty - item.factQty))}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        % к цели
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={getGoalPercentColor(itemGoalPercent)}
                      >
                        {formatSignedPercent(itemGoalPercent)}
                      </Typography>
                    </Box>
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
    </Paper>
  );
};

export default ProgressTimeline;
