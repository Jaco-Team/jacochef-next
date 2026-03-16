import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
  IconButton,
  Collapse,
  TableSortLabel,
} from "@mui/material";
import {
  Star as StarIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from "@mui/icons-material";

const ReviewsTable = ({ reviews }) => {
  const [filter, setFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleExpandClick = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const getStarRating = (stars) => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;
    const starComponents = [];

    for (let i = 0; i < fullStars; i++) {
      starComponents.push(
        <StarIcon
          key={i}
          sx={{ color: stars >= 4 ? "#4caf50" : stars === 3 ? "#ff9800" : "#f44336", fontSize: 16 }}
        />,
      );
    }

    if (hasHalfStar) {
      starComponents.push(
        <StarIcon
          key="half"
          sx={{ color: "#ff9800", fontSize: 16 }}
        />,
      );
    }

    const emptyStars = 5 - starComponents.length;
    for (let i = 0; i < emptyStars; i++) {
      starComponents.push(
        <StarIcon
          key={`empty-${i}`}
          sx={{ color: "#e0e0e0", fontSize: 16 }}
        />,
      );
    }

    return starComponents;
  };

  const getClientTypeLabel = (type) => {
    const labels = {
      VIP: "VIP",
      "Новый клиент": "Новый клиент",
      "Постоянный клиент": "Постоянный клиент",
      "": "",
    };
    return labels[type] || type;
  };

  const getClientTypeColor = (type) => {
    if (type === "VIP") return "#9c27b0";
    if (type === "Постоянный клиент") return "#2196f3";
    if (type === "Новый клиент") return "#4caf50";
    return "#757575";
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    return review.star === parseInt(filter);
  });

  return (
    <Box sx={{ width: "100%", p: 0, bgcolor: "#f5f5f5" }}>
      <Paper
        elevation={0}
        sx={{ borderRadius: 2, overflow: "hidden" }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#212121" }}
          >
            Последние отзывы
          </Typography>

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            size="small"
            sx={{ "& .MuiToggleButton-root": { borderColor: "#e0e0e0", minWidth: 36 } }}
          >
            <ToggleButton
              value="all"
              sx={{
                fontWeight: filter === "all" ? 600 : 400,
                bgcolor: filter === "all" ? "#2196f3" : "transparent",
                color: filter === "all" ? "white" : "inherit",
              }}
            >
              Все
            </ToggleButton>
            {[1, 2, 3, 4, 5].map((star) => (
              <ToggleButton
                key={star}
                value={star}
                sx={{
                  fontWeight: filter === star ? 600 : 400,
                  bgcolor: filter === star ? "#2196f3" : "transparent",
                  color: filter === star ? "white" : "inherit",
                  "&:hover": { bgcolor: filter === star ? "#1976d2" : "rgba(0,0,0,0.04)" },
                }}
              >
                {star}★
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Table */}
        <TableContainer sx={{ maxHeight: "500px", overflowX: "auto" }}>
          <Table
            sx={{ minWidth: 650 }}
            size="medium"
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#616161",
                    fontSize: "0.875rem",
                    minWidth: "100px",
                  }}
                >
                  Дата
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#616161", fontSize: "0.875rem" }}>
                  Заказ
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#616161",
                    fontSize: "0.875rem",
                    minWidth: "250px",
                  }}
                >
                  Кафе
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#616161", fontSize: "0.875rem" }}>
                  Оценка
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, color: "#616161", fontSize: "0.875rem", minWidth: 200 }}
                >
                  Комментарий
                </TableCell>
                <TableCell sx={{ width: 40 }}></TableCell>
                <TableCell sx={{ width: 40 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReviews.map((review, key) => (
                <React.Fragment key={key}>
                  <TableRow
                    sx={{
                      "&:hover": { bgcolor: "#f5f5f5" },
                      borderBottom: "1px solid #eeeeee",
                    }}
                  >
                    <TableCell sx={{ fontSize: "0.875rem", color: "#424242" }}>
                      {review.date_time_create}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.875rem", color: "#424242", fontFamily: "monospace" }}
                    >
                      {review.order_id}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#424242" }}>
                      {review.point_name || ""}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>{getStarRating(review.star)}</Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#424242" }}>
                      {review.comment || "-"}
                    </TableCell>
                    <TableCell sx={{ width: 40 }}></TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandClick(review.order_id)}
                        sx={{ color: "#757575" }}
                      >
                        {expandedRow === review.order_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={7}
                    >
                      <Collapse
                        in={expandedRow === review.order_id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ margin: 1, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            Детали заказа
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            ID заказа: {review.order_id}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Дата: {review.date_time_create}
                          </Typography>
                          {review.comment && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1 }}
                            >
                              Комментарий: {review.comment}
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredReviews.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center", color: "#757575" }}>
            <Typography>Отзывы не найдены</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ReviewsTable;
