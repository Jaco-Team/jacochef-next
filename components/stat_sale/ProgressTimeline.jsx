import React, { useState, useMemo } from "react";
import { Box, Typography, Paper, Tooltip, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  padding: "40px 20px 60px",
}));

const ProgressBar = styled(Box)(({ theme, progress }) => ({
  position: "absolute",
  top: "20px",
  left: 0,
  height: "4px",
  backgroundColor: theme.palette.grey[200],
  borderRadius: "2px",
  overflow: "hidden",
  width: "100%",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: `${progress}%`,
    backgroundColor: theme.palette.error.main,
    borderRadius: "2px",
    transition: "width 0.6s ease",
  },
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

const MarkerCircle = styled(Box)(({ theme, isActive }) => ({
  width: isActive ? "24px" : "16px",
  height: isActive ? "24px" : "16px",
  borderRadius: "50%",
  backgroundColor: isActive ? theme.palette.background.paper : theme.palette.error.main,
  border: `3px solid ${theme.palette.error.main}`,
  transition: "all 0.3s ease",
  "&::after": isActive
    ? {
        content: '""',
        position: "absolute",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: theme.palette.error.main,
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
  const [activeMonth, setActiveMonth] = useState(null);

  const { totalPlan, totalFact, currentMonthIndex, lastMonthData, progressPercentage } =
    useMemo(() => {
      const totalPlan = data.reduce((sum, item) => sum + parseFloat(item.planQty), 0);
      const totalFact = data.reduce((sum, item) => sum + item.factQty, 0);
      const currentMonthIndex = data.length - 1;
      const lastMonthData = data[currentMonthIndex];

      const progressPercentage = data.length > 0 ? (totalPlan / totalFact) * 100 : 0;

      return { totalPlan, totalFact, currentMonthIndex, lastMonthData, progressPercentage };
    }, [data]);

  const remainingToGoal = Math.max(0, totalPlan - totalFact);
  const deviation = totalFact - totalPlan;

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 2 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
        >
          Выполнение цели {lastMonthData.month}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {progressPercentage.toFixed(1)}% · осталось{" "}
            {formatNumber((100 - progressPercentage).toFixed(2))}% до {lastMonthData.month}
          </Typography>
          <Typography
            variant="body2"
            color="success.main"
          >
            ↗ +{formatNumber(deviation)} к плану
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "error.main" }} />
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

      {lastMonthData && (
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
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                МЕСЯЦ
              </Typography>
              <Typography
                variant="h6"
                sx={{ textTransform: "capitalize" }}
              >
                {lastMonthData.month}
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
              <Typography variant="h6">{formatNumber(lastMonthData.planQty)}</Typography>
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
                color="error.main"
              >
                {formatNumber(lastMonthData.factQty)}
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
                color="success.main"
              >
                {(
                  ((lastMonthData.planQty - lastMonthData.factQty) / lastMonthData.planQty) *
                  100
                ).toFixed(2)}
                %
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <TimelineContainer>
        <ProgressBar progress={progressPercentage} />

        {data.map((item, index) => {
          const isActive = index === currentMonthIndex;
          const position = (index / (data.length - 1 || 1)) * 100;

          return (
            <Tooltip
              key={item.month}
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
                      color="error.main"
                    >
                      {(((item.planQty - item.factQty) / item.planQty) * 100).toFixed(2)}%
                    </Typography>
                  </Box>
                </CustomTooltip>
              }
              placement="top"
              arrow
            >
              <MonthMarker position={position}>
                <MarkerCircle isActive={isActive} />
                <MonthLabel>
                  <Typography
                    variant="caption"
                    fontWeight={isActive ? 700 : 400}
                    sx={{ textTransform: "uppercase" }}
                  >
                    {getShortMonthName(item.month)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {formatNumber(item.planQty)}
                  </Typography>
                </MonthLabel>
              </MonthMarker>
            </Tooltip>
          );
        })}
      </TimelineContainer>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        Шкала value-based: позиция заполнения зависит от выполнения цели декабря, а не от прошедшего
        времени.
      </Typography>
    </Paper>
  );
};

export default ProgressTimeline;
