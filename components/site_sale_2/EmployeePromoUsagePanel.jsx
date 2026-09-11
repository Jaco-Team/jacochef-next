import React from "react";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import { MyDatePickerNew, MySelect } from "@/ui/Forms";
import { formatPromoPhone } from "@/components/site_sale_2/promoPhone";
import {
  findCatalogName,
  formatEmployeePromoDateTime,
  getEmployeePromoUsageStats,
} from "@/components/site_sale_2/employeePromoUsage";

const EMPTY_SUMMARY = {
  issued_count: 0,
  used_count: 0,
  orders_count: 0,
  original_amount: 0,
  discounted_amount: 0,
  discount_amount: 0,
};

function formatMoney(value) {
  const number = Number(value);

  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(number) ? number : 0)} ₽`;
}

function StatCard({ label, value, hint }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        height: "100%",
        bgcolor: "grey.50",
        borderLeft: "3px solid",
        borderLeftColor: "primary.main",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}
      >
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: { xs: 20, sm: 24 }, lineHeight: 1.15 }}>
        {value}
      </Typography>
      {hint ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
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

export function EmployeePromoUsagePanel({ stats = {}, points = [], onLoad }) {
  const today = dayjs();
  const [filters, setFilters] = React.useState({
    point_id: 0,
    date_start: today.startOf("month").format("YYYY-MM-DD"),
    date_end: today.format("YYYY-MM-DD"),
  });
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const initialRequestSent = React.useRef(false);
  const summary = { ...EMPTY_SUMMARY, ...(stats.summary || {}) };
  const rows = Array.isArray(stats.rows) ? stats.rows : [];
  const usagePercent =
    summary.issued_count > 0 ? (summary.used_count / summary.issued_count) * 100 : 0;
  const pointOptions = [
    { id: 0, name: "Все кафе" },
    ...(points || []).filter((point) => parseInt(point.id, 10) !== 0),
  ];

  const submit = React.useCallback(() => {
    if (onLoad) {
      onLoad(filters);
    }
  }, [filters, onLoad]);

  React.useEffect(() => {
    if (!initialRequestSent.current) {
      initialRequestSent.current = true;
      submit();
    }
  }, [submit]);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: 16, sm: 18 } }}>
        Статистика использования
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, mb: 2 }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MySelect
              data={pointOptions}
              value={filters.point_id}
              func={(event) =>
                setFilters((current) => ({
                  ...current,
                  point_id: parseInt(event.target.value, 10) || 0,
                }))
              }
              label="Кафе выдачи"
              is_none={false}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Дата с"
              value={filters.date_start}
              func={(value) =>
                setFilters((current) => ({
                  ...current,
                  date_start: value?.isValid() ? value.format("YYYY-MM-DD") : "",
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MyDatePickerNew
              label="Дата до"
              value={filters.date_end}
              func={(value) =>
                setFilters((current) => ({
                  ...current,
                  date_end: value?.isValid() ? value.format("YYYY-MM-DD") : "",
                }))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="contained"
              onClick={submit}
              fullWidth
            >
              Показать
            </Button>
          </Grid>
          <Grid size={12}>
            <Alert
              severity="info"
              sx={{ py: 0 }}
            >
              Период применяется одновременно к дате выдачи промокода и дате заказа. Фильтр кафе
              означает место выдачи; использование учитывается во всех доступных кафе.
            </Alert>
          </Grid>
        </Grid>
      </Paper>

      <Grid
        container
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: "grow" }}>
          <StatCard
            label="Выписано"
            value={summary.issued_count}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: "grow" }}>
          <StatCard
            label="Воспользовались"
            value={summary.used_count}
            hint={`${usagePercent.toLocaleString("ru-RU", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}% · заказов: ${summary.orders_count}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: "grow" }}>
          <StatCard
            label="Исходная стоимость"
            value={formatMoney(summary.original_amount)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: "grow" }}>
          <StatCard
            label="Стоимость со скидкой"
            value={formatMoney(summary.discounted_amount)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6, lg: "grow" }}>
          <StatCard
            label="Размер скидки"
            value={formatMoney(summary.discount_amount)}
          />
        </Grid>
      </Grid>

      <Accordion
        expanded={historyOpen}
        onChange={(event, isExpanded) => setHistoryOpen(isExpanded)}
        disableGutters
        variant="outlined"
        sx={{ borderRadius: "8px", overflow: "hidden", "&:before": { display: "none" } }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: "grey.50",
            "& .MuiAccordionSummary-content": { my: 1, alignItems: "center" },
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>Детализация выдач</Typography>
          <Chip
            size="small"
            label={`Записей: ${rows.length}`}
            sx={{ ml: "auto", mr: 1, fontWeight: 700 }}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {rows.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">За выбранный период выдач нет</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 520 }}>
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
                    <TableCell>Кафе выдачи</TableCell>
                    <TableCell>Выдан</TableCell>
                    <TableCell>Использование</TableCell>
                    <TableCell align="right">Заказов</TableCell>
                    <TableCell align="right">Исходная стоимость</TableCell>
                    <TableCell align="right">Со скидкой</TableCell>
                    <TableCell align="right">Скидка</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                    >
                      <TableCell>{row.employee_name || "—"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatPromoPhone(row.employee_phone) || row.employee_phone || "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.promo_name || "—"}</TableCell>
                      <TableCell>{findCatalogName(points, row.point_id)}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatEmployeePromoDateTime(row.issued_at || row.issue_date)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Chip
                          size="small"
                          color={row.is_used ? "success" : "default"}
                          label={row.is_used ? "Использован" : "Не использован"}
                        />
                        {row.used_at ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {formatEmployeePromoDateTime(row.used_at)}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell align="right">{row.orders_count || 0}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {formatMoney(row.original_amount)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {formatMoney(row.discounted_amount)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {formatMoney(row.discount_amount)}
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
