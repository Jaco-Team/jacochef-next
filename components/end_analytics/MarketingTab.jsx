import React, { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import dayjs from "dayjs";
import { api_laravel } from "@/src/api_new";
import { MyAutocomplite, MyDatePickerNew } from "@/ui/Forms";

const PRIMARY_COLOR = "#cc0033";
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DEVICE_NAMES = {
  mobile: "Телефон",
  desktop: "Компьютер",
  laptop: "Ноутбук",
  tablet: "Планшет",
};

const rub = (value) =>
  value === null || value === undefined
    ? "—"
    : `${Math.round(Number(value)).toLocaleString("ru-RU")} ₽`;
const int = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString("ru-RU");
const pct = (value, digits = 1) =>
  value === null || value === undefined ? "—" : `${(Number(value) * 100).toFixed(digits)}%`;

function Kpi({ label, value, hint }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, height: "100%" }}
    >
      <Typography
        variant="body2"
        sx={{ color: "text.secondary" }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary" }}
        >
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

function Section({ title, hint, children }) {
  return (
    <Grid size={{ xs: 12 }}>
      <Paper sx={{ p: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700 }}
        >
          {title}
        </Typography>
        {hint && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 1 }}
          >
            {hint}
          </Typography>
        )}
        {children}
      </Paper>
    </Grid>
  );
}

/** Таблица с сортировкой по клику на заголовок; columns: {key, label, format, align}. */
function SortableTable({ columns, rows, initialSort, rowKey, highlight }) {
  const [sort, setSort] = useState(initialSort);
  const sorted = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => {
      const left = a[sort.key] ?? -Infinity;
      const right = b[sort.key] ?? -Infinity;
      const result =
        typeof left === "string" ? String(left).localeCompare(String(right), "ru") : left - right;
      return sort.dir === "asc" ? result : -result;
    });
    return list;
  }, [rows, sort]);

  if (!rows.length) {
    return (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary" }}
      >
        Нет данных за период
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ maxHeight: 520 }}>
      <Table
        size="small"
        stickyHeader
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align || "right"}
                sortDirection={sort.key === column.key ? sort.dir : false}
                sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
              >
                <TableSortLabel
                  active={sort.key === column.key}
                  direction={sort.key === column.key ? sort.dir : "desc"}
                  onClick={() =>
                    setSort((prev) => ({
                      key: column.key,
                      dir: prev.key === column.key && prev.dir === "desc" ? "asc" : "desc",
                    }))
                  }
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((row) => (
            <TableRow
              key={rowKey(row)}
              hover
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || "right"}
                  sx={{
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: column.align === "left" ? "normal" : "nowrap",
                    ...(column.align === "left" ? { minWidth: 160 } : {}),
                    ...(highlight?.(row, column.key)
                      ? { color: PRIMARY_COLOR, fontWeight: 600 }
                      : {}),
                  }}
                >
                  {column.format ? column.format(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function Funnel({ steps }) {
  const top = steps[0]?.visits || 0;
  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      {steps.map((step, index) => {
        // Шаги не строго последовательны (в корзину добавляют и из каталога), поэтому доля — от визитов.
        const share = index > 0 && top ? step.visits / top : null;
        return (
          <Box
            key={step.step}
            sx={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 200px",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Typography variant="body2">{step.label}</Typography>
            <LinearProgress
              variant="determinate"
              value={top ? (step.visits / top) * 100 : 0}
              sx={{
                height: 14,
                borderRadius: 1,
                "& .MuiLinearProgress-bar": { backgroundColor: PRIMARY_COLOR },
              }}
            />
            <Typography
              variant="body2"
              sx={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
            >
              {int(step.visits)}
              {share !== null ? ` · ${pct(share)} визитов` : ""}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function HoursHeatmap({ cells }) {
  const hours = [...new Set(cells.map((cell) => cell.hour))].sort((a, b) => a - b);
  const byKey = Object.fromEntries(cells.map((cell) => [`${cell.weekday}:${cell.hour}`, cell]));
  const max = Math.max(0, ...cells.map((cell) => cell.conversion || 0));

  if (!hours.length) {
    return (
      <Typography
        variant="body2"
        sx={{ color: "text.secondary" }}
      >
        Нет данных за период
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `32px repeat(${hours.length}, minmax(30px, 1fr))`,
          gap: "2px",
          minWidth: hours.length * 32 + 32,
        }}
      >
        <Box />
        {hours.map((hour) => (
          <Typography
            key={hour}
            variant="caption"
            sx={{ textAlign: "center", color: "text.secondary" }}
          >
            {hour}
          </Typography>
        ))}
        {WEEKDAYS.map((weekday, index) => (
          <React.Fragment key={weekday}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", lineHeight: "26px" }}
            >
              {weekday}
            </Typography>
            {hours.map((hour) => {
              const cell = byKey[`${index + 1}:${hour}`];
              const share = cell?.conversion && max ? cell.conversion / max : 0;
              return (
                <Tooltip
                  key={hour}
                  title={
                    cell
                      ? `${weekday} ${hour}:00 — визиты ${int(cell.visits)}, заказы ${int(cell.orders)}, конверсия ${pct(cell.conversion)}`
                      : `${weekday} ${hour}:00 — нет данных`
                  }
                >
                  <Box
                    sx={{
                      height: 26,
                      borderRadius: "3px",
                      backgroundColor: cell?.conversion
                        ? `rgba(204, 0, 51, ${0.08 + share * 0.82})`
                        : "action.hover",
                    }}
                  />
                </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default function MarketingTab({ cities, onError }) {
  const [cityValue, setCityValue] = useState(
    () => cities.find((city) => Number(city.id) === 0) || null,
  );
  const [dateStart, setDateStart] = useState(dayjs().startOf("month"));
  const [dateEnd, setDateEnd] = useState(dayjs());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await api_laravel("end_analytics", "get_marketing", {
        city_id: Number(cityValue?.id || 0),
        dateStart: dayjs(dateStart).format("YYYY-MM-DD"),
        dateEnd: dayjs(dateEnd).format("YYYY-MM-DD"),
      });
      // GlobalResource оборачивает ответ в data.
      const data = result?.data && typeof result.data === "object" ? result.data : result || {};
      if (!data.st) {
        onError?.(data.text || "Не удалось загрузить маркетинговую аналитику");
        return;
      }
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  const kpi = report?.kpi;
  const coverage = report?.coverage;
  const addRates = (report?.products || [])
    .map((row) => row.add_rate)
    .filter((rate) => rate !== null);
  const medianAddRate = addRates.length
    ? [...addRates].sort((a, b) => a - b)[Math.floor(addRates.length / 2)]
    : null;

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2 }}>
          <Grid
            container
            spacing={2}
            sx={{ alignItems: "center" }}
          >
            <Grid size={{ xs: 12, sm: 4 }}>
              <MyAutocomplite
                label="Город"
                data={cities}
                multiple={false}
                value={cityValue}
                func={(event, data) => setCityValue(data)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew
                label="Дата от"
                customActions={true}
                value={dayjs(dateStart)}
                maxDate={dayjs(dateEnd)}
                func={(value) => setDateStart(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <MyDatePickerNew
                label="Дата до"
                customActions={true}
                value={dayjs(dateEnd)}
                maxDate={dayjs()}
                func={(value) => setDateEnd(value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={load}
                sx={{ backgroundColor: PRIMARY_COLOR, "&:hover": { backgroundColor: "#a3002a" } }}
              >
                Показать
              </Button>
            </Grid>
          </Grid>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>
      </Grid>

      {report && (
        <>
          <Grid size={{ xs: 12 }}>
            <Alert
              severity={
                coverage.linked_share !== null && coverage.linked_share < 0.5 ? "warning" : "info"
              }
            >
              Связано с визитом сайта: {int(coverage.linked_orders)} из {int(coverage.orders)}{" "}
              заказов ({pct(coverage.linked_share)}). Каналы и кампании считаются только по
              связанным заказам; связь пишется с момента выкладки сайта с vid/sid.
              {!coverage.umami_available &&
                " Umami не подключён — воронка, товары, устройства и визиты не показаны."}
            </Alert>
          </Grid>

          {[
            ["Заказы", int(kpi.orders)],
            ["Выручка", rub(kpi.revenue)],
            ["Средний чек", rub(kpi.avg_check)],
            ["Новые клиенты", int(kpi.new_clients), `${pct(kpi.new_share)} заказов`],
            [
              "Расход",
              rub(kpi.spend),
              kpi.spend_ads === undefined
                ? "реклама и ручные расходы"
                : `реклама ${rub(kpi.spend_ads)} · ручные ${rub(kpi.spend_manual)}`,
            ],
            ["CAC", rub(kpi.cac), "расход / новые клиенты"],
            ["ДРР", pct(kpi.drr), "расход / выручка"],
            ["Конверсия визита", pct(kpi.conversion, 2), `${int(kpi.visits)} визитов`],
          ].map(([label, value, hint]) => (
            <Grid
              key={label}
              size={{ xs: 6, sm: 3 }}
            >
              <Kpi
                label={label}
                value={value}
                hint={hint}
              />
            </Grid>
          ))}

          <Section
            title="Каналы: первое и последнее касание"
            hint="Первое касание — откуда человек пришёл впервые, последнее — визит, в котором заказал. Переходы внутри нашего сайта и возвраты со страницы оплаты источником не считаются. CAC — по новым клиентам первого касания. Красным — CAC выше среднего по всем каналам."
          >
            <SortableTable
              rows={report.channels}
              rowKey={(row) => row.channel}
              initialSort={{ key: "last_revenue", dir: "desc" }}
              highlight={(row, key) =>
                key === "cac" && row.cac !== null && kpi.cac !== null && row.cac > kpi.cac
              }
              columns={[
                { key: "channel", label: "Канал", align: "left" },
                { key: "first_orders", label: "Первое: заказы", format: int },
                { key: "first_new_clients", label: "Первое: новые", format: int },
                { key: "first_revenue", label: "Первое: выручка", format: rub },
                { key: "last_orders", label: "Последнее: заказы", format: int },
                { key: "last_revenue", label: "Последнее: выручка", format: rub },
                { key: "spend", label: "Расход", format: rub },
                { key: "cac", label: "CAC", format: rub },
                { key: "drr", label: "ДРР", format: (value) => pct(value) },
              ]}
            />
          </Section>

          <Section
            title="Кампании (utm_campaign, последнее касание)"
            hint="Расход — из рекламного кабинета (кампания определяется по её номеру в метке) и из ручных расходов с той же кампанией. Красным — ДРР выше 30%."
          >
            <SortableTable
              rows={report.campaigns}
              rowKey={(row) => `${row.source}|${row.medium}|${row.campaign}`}
              initialSort={{ key: "revenue", dir: "desc" }}
              highlight={(row, key) => key === "drr" && row.drr !== null && row.drr > 0.3}
              columns={[
                { key: "campaign", label: "Кампания", align: "left" },
                {
                  key: "source",
                  label: "Источник",
                  align: "left",
                  format: (value, row) => `${value} / ${row.medium}`,
                },
                { key: "orders", label: "Заказы", format: int },
                { key: "new_clients", label: "Новые", format: int },
                { key: "revenue", label: "Выручка", format: rub },
                { key: "spend", label: "Расход", format: rub },
                { key: "drr", label: "ДРР", format: (value) => pct(value) },
                { key: "cac", label: "CAC", format: rub },
              ]}
            />
          </Section>

          {report.funnel.length > 0 && (
            <Section
              title="Воронка визита"
              hint="Визиты Umami, в которых было действие; процент — доля от всех визитов. «Оформили заказ» — подтверждённый заказ с любой оплатой: онлайн и при получении."
            >
              <Funnel steps={report.funnel} />
            </Section>
          )}

          <Section
            title="По дням"
            hint="Визиты — Umami, заказы и выручка — база заказов."
          >
            <SortableTable
              rows={report.daily.map((row) => ({
                ...row,
                conversion: row.visits ? row.orders / row.visits : null,
              }))}
              rowKey={(row) => row.date}
              initialSort={{ key: "date", dir: "asc" }}
              columns={[
                {
                  key: "date",
                  label: "Дата",
                  align: "left",
                  format: (value) => dayjs(value).format("DD.MM, dd"),
                },
                { key: "visits", label: "Визиты", format: int },
                { key: "orders", label: "Заказы", format: int },
                { key: "conversion", label: "Конверсия", format: (value) => pct(value, 2) },
                { key: "revenue", label: "Выручка", format: rub },
              ]}
            />
          </Section>

          {coverage.umami_available && (
            <Section
              title="Конверсия по дням недели и часам"
              hint="Насыщенность — заказы / визиты в этот час. Помогает решить, когда поднимать и снижать ставки."
            >
              <HoursHeatmap cells={report.hours} />
            </Section>
          )}

          {report.products.length > 0 && (
            <Section
              title="Товары: смотрят, но не берут"
              hint="Просмотры карточки и добавления в корзину (Umami). Красным — доля добавлений вдвое ниже медианы."
            >
              <SortableTable
                rows={report.products}
                rowKey={(row) => row.item_id}
                initialSort={{ key: "views", dir: "desc" }}
                highlight={(row, key) =>
                  key === "add_rate" &&
                  medianAddRate !== null &&
                  row.add_rate !== null &&
                  row.add_rate < medianAddRate / 2
                }
                columns={[
                  { key: "tovar", label: "Товар", align: "left" },
                  { key: "views", label: "Просмотры", format: int },
                  { key: "adds", label: "В корзину", format: int },
                  { key: "add_rate", label: "Доля добавлений", format: (value) => pct(value) },
                ]}
              />
            </Section>
          )}

          {report.devices.length > 0 && (
            <Section
              title="Устройства"
              hint="Заказы — связанные с визитом, по устройству последней сессии посетителя."
            >
              <SortableTable
                rows={report.devices.map((row) => ({
                  ...row,
                  name: DEVICE_NAMES[row.device] || row.device,
                }))}
                rowKey={(row) => row.device}
                initialSort={{ key: "visits", dir: "desc" }}
                columns={[
                  { key: "name", label: "Устройство", align: "left" },
                  { key: "visits", label: "Визиты", format: int },
                  { key: "linked_orders", label: "Заказы", format: int },
                  { key: "conversion", label: "Конверсия", format: (value) => pct(value, 2) },
                ]}
              />
            </Section>
          )}
        </>
      )}
    </Grid>
  );
}
