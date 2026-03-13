import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import { InfoOutlined, ArrowUpward, ArrowDownward } from "@mui/icons-material";

const QualityByPointsTable = ({ data }) => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("count");

  // Преобразуем данные в массив объектов
  const tableData = data.map((item) => ({
    location: item[0],
    count: item[1].count,
    rating: item[1].rating,
    mediumRating: item[1].mediumRating,
    negativeRating: item[1].negativeRating,
    trend: item[1].trend,
  }));

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (order === "asc") {
      return a[orderBy] < b[orderBy] ? -1 : 1;
    } else {
      return a[orderBy] > b[orderBy] ? -1 : 1;
    }
  });

  // Определение тренда (для примера, так как trend=0 во всех записях)
  const getTrendInfo = (trendValue, mediumRating) => {
    // Если trend=0, используем mediumRating для демонстрации
    const value = trendValue !== 0 ? trendValue : 0;
    const isPositive = value >= 4.0;

    return {
      isPositive,
      value: Math.abs(value).toFixed(1),
      icon: isPositive ? ArrowUpward : ArrowDownward,
      color: isPositive ? "#4caf50" : "#f44336",
    };
  };

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {/* Заголовок */}
      <Typography
        variant="h6"
        fontWeight="600"
        gutterBottom
      >
        Качество по точкам
      </Typography>

      {/* Таблица */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  fontSize: "0.475rem",
                  borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                }}
              >
                <TableSortLabel
                  active={orderBy === "location"}
                  direction={orderBy === "location" ? order : "asc"}
                  onClick={() => handleRequestSort("location")}
                  IconComponent={() => (
                    <Box sx={{ display: "flex", flexDirection: "column", ml: -0.5 }}>
                      <ArrowUpward
                        sx={{
                          fontSize: 14,
                          opacity: orderBy === "location" && order === "asc" ? 1 : 0.3,
                        }}
                      />
                      <ArrowDownward
                        sx={{
                          fontSize: 14,
                          opacity: orderBy === "location" && order === "desc" ? 1 : 0.3,
                        }}
                      />
                    </Box>
                  )}
                >
                  <span className="text-14px">Точка</span>
                </TableSortLabel>
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                }}
              >
                <TableSortLabel
                  active={orderBy === "count"}
                  direction={orderBy === "count" ? order : "asc"}
                  onClick={() => handleRequestSort("count")}
                  IconComponent={() => (
                    <Box sx={{ display: "flex", flexDirection: "column", ml: -0.5 }}>
                      <ArrowUpward
                        sx={{
                          fontSize: 14,
                          opacity: orderBy === "count" && order === "asc" ? 1 : 0.3,
                        }}
                      />
                      <ArrowDownward
                        sx={{
                          fontSize: 14,
                          opacity: orderBy === "count" && order === "desc" ? 1 : 0.3,
                        }}
                      />
                    </Box>
                  )}
                >
                  <span className="text-14px">Отзывов</span>
                </TableSortLabel>
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <TableSortLabel
                    active={orderBy === "mediumRating"}
                    direction={orderBy === "mediumRating" ? order : "asc"}
                    onClick={() => handleRequestSort("mediumRating")}
                    IconComponent={() => (
                      <Box sx={{ display: "flex", flexDirection: "column", ml: -0.5 }}>
                        <ArrowUpward
                          sx={{
                            fontSize: 14,
                            opacity: orderBy === "mediumRating" && order === "asc" ? 1 : 0.3,
                          }}
                        />
                        <ArrowDownward
                          sx={{
                            fontSize: 14,
                            opacity: orderBy === "mediumRating" && order === "desc" ? 1 : 0.3,
                          }}
                        />
                      </Box>
                    )}
                  >
                    <span className="text-14px">Ср. оценка</span>
                  </TableSortLabel>
                  <Tooltip
                    title="Средняя оценка"
                    placement="top"
                  >
                    <IconButton
                      size="small"
                      sx={{ ml: 0.5 }}
                    >
                      <InfoOutlined
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <TableSortLabel
                    active={orderBy === "negativeRating"}
                    direction={orderBy === "negativeRating" ? order : "asc"}
                    onClick={() => handleRequestSort("negativeRating")}
                    IconComponent={() => (
                      <Box sx={{ display: "flex", flexDirection: "column", ml: -0.5 }}>
                        <ArrowUpward
                          sx={{
                            fontSize: 14,
                            opacity: orderBy === "negativeRating" && order === "asc" ? 1 : 0.3,
                          }}
                        />
                        <ArrowDownward
                          sx={{
                            fontSize: 14,
                            opacity: orderBy === "negativeRating" && order === "desc" ? 1 : 0.3,
                          }}
                        />
                      </Box>
                    )}
                  >
                    <span className="text-14px">Негатив %</span>
                  </TableSortLabel>
                  <Tooltip
                    title="Доля отзывов с оценкой 1 - 3"
                    placement="top"
                  >
                    <IconButton
                      size="small"
                      sx={{ ml: 0.5 }}
                    >
                      <InfoOutlined
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                }}
              >
                <TableSortLabel
                  active={orderBy === "trend"}
                  direction={orderBy === "trend" ? order : "asc"}
                  onClick={() => handleRequestSort("trend")}
                  IconComponent={() => (
                    <Box sx={{ display: "flex", flexDirection: "column", ml: -0.5 }}>
                      <ArrowUpward
                        sx={{
                          fontSize: 14,
                          opacity: orderBy === "trend" && order === "asc" ? 1 : 0.3,
                        }}
                      />
                      <ArrowDownward
                        sx={{
                          fontSize: 14,
                          opacity: orderBy === "trend" && order === "desc" ? 1 : 0.3,
                        }}
                      />
                    </Box>
                  )}
                >
                  <span className="text-14px">Тренд</span>
                  <Tooltip
                    title="Изменение показателей по сравнению с предыдущим периодом"
                    placement="top"
                  >
                    <IconButton
                      size="small"
                      sx={{ ml: 0.5 }}
                    >
                      <InfoOutlined
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                    </IconButton>
                  </Tooltip>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((row, index) => {
              const trendInfo = getTrendInfo(row.trend, row.mediumRating);
              const TrendIcon = trendInfo.icon;

              return (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      py: 2,
                      borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                    }}
                  >
                    {row.location}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      py: 2,
                      borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                    }}
                  >
                    {row.count}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      py: 2,
                      borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                    }}
                  >
                    {row.mediumRating.toFixed(2)}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      py: 2,
                      borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                    }}
                  >
                    {row.negativeRating.toFixed(1)}%
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      py: 2,
                      borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: trendInfo.color,
                        fontWeight: 500,
                      }}
                    >
                      <TrendIcon sx={{ fontSize: 16 }} />
                      {trendInfo.value}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QualityByPointsTable;
