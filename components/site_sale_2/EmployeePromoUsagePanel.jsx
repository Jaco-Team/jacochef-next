import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import { formatPromoPhone } from "@/components/site_sale_2/promoPhone";
import {
  findCatalogName,
  formatEmployeePromoDateTime,
  getEmployeePromoUsageStats,
} from "@/components/site_sale_2/employeePromoUsage";

function StatCard({ label, value, hint }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        height: "100%",
        minWidth: 140,
        flex: "1 1 140px",
        bgcolor: "grey.50",
        borderLeft: "3px solid",
        borderLeftColor: "primary.main",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: { xs: 20, sm: 24 }, lineHeight: 1.15 }}>
        {value}
      </Typography>
      {hint ? (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            mt: 0.5,
            display: "block",
          }}
        >
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

export function EmployeePromoUsageSummaryChips({ history }) {
  const stats = getEmployeePromoUsageStats(history);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.75,
        ml: { xs: 0, sm: "auto" },
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <Chip
        size="small"
        label={`Выдач: ${stats.total}`}
        sx={{ fontWeight: 700 }}
      />
      <Chip
        size="small"
        variant="outlined"
        label={`Сотрудников: ${stats.employees}`}
      />
      <Chip
        size="small"
        variant="outlined"
        label={`Сегодня: ${stats.issuedToday}`}
      />
    </Box>
  );
}

export function EmployeePromoUsagePanel({ history = [], cities = [], points = [] }) {
  const list = Array.isArray(history) ? history : [];
  const stats = getEmployeePromoUsageStats(list);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: 16, sm: 18 } }}>
        Использование
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <StatCard
          label="Всего выдач"
          value={stats.total}
        />
        <StatCard
          label="Сотрудников"
          value={stats.employees}
        />
        <StatCard
          label="Точек"
          value={stats.points}
        />
        <StatCard
          label="Сегодня"
          value={stats.issuedToday}
        />
        <StatCard
          label="Последняя выдача"
          value={stats.lastIssuedLabel || "—"}
          hint={stats.promos ? `Промокодов: ${stats.promos}` : undefined}
        />
      </Box>
      <Accordion
        expanded={historyOpen}
        onChange={(event, isExpanded) => setHistoryOpen(isExpanded)}
        disableGutters
        variant="outlined"
        sx={{
          borderRadius: "8px",
          overflow: "hidden",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: "grey.50",
            "& .MuiAccordionSummary-content": {
              my: 1,
              alignItems: "center",
            },
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>История выдач</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {list.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                По этому конфигу пока нет выдач
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table
                size="small"
                stickyHeader
              >
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        fontWeight: 700,
                        bgcolor: "grey.50",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell>Сотрудник</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Промокод</TableCell>
                    <TableCell>Город</TableCell>
                    <TableCell>Точка</TableCell>
                    <TableCell>Смена</TableCell>
                    <TableCell>Выдан</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                    >
                      <TableCell>{row.employee_name || "—"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatPromoPhone(row.employee_phone) || row.employee_phone || "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.promo_name || "—"}</TableCell>
                      <TableCell>{findCatalogName(cities, row.city_id)}</TableCell>
                      <TableCell>{findCatalogName(points, row.point_id)}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatEmployeePromoDateTime(row.shift_date)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatEmployeePromoDateTime(row.issued_at || row.issue_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
