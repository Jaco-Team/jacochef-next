"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";

const FIELD_LABELS = {
  name: "Наименование сырья",
  category_id: "Категория",
  unit_id: "Единица измерения",
  calc_type: "Тип расчёта",
  packaging: "Упаковка",
  comment: "Комментарий",
  is_active: "Активность позиции",
  supplier_id: "Поставщик",
  allocated_qty: "Выделенное количество",
  stock_at_supplier: "Остаток у поставщика",
  in_transit: "Товар в пути",
  expected_arrival_date: "Ожидаемая дата прихода",
  production_days: "Наработка, дни",
  logistics_days: "Логистика, дни",
  holiday_days: "Праздничные дни",
  safety_days: "Страховой запас, дни",
  price_current: "Текущая цена",
  price_future: "Будущая цена",
  price_future_comment: "Комментарий к будущей цене",
};

const EVENT_LABELS = {
  created: "Создание",
  create: "Создание",
  updated: "Изменение",
  update: "Изменение",
  deleted: "Удаление",
  delete: "Удаление",
  disabled: "Отключение",
  enabled: "Включение",
};

const CALC_TYPE_LABELS = {
  without_packaging: "Без упаковки",
  with_packaging: "Через упаковку",
  min_lot: "По минимальной партии",
};

function parseJson(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function fieldKey(field) {
  return field?.split(".").pop() || field;
}

function fieldLabel(field) {
  const key = fieldKey(field);
  return FIELD_LABELS[key] || key;
}

function formatValue(value, field) {
  if (value === null || value === undefined || value === "") return "—";
  if (fieldKey(field) === "is_active") {
    return value === true || value === 1 || value === "1" ? "Активна" : "Отключена";
  }
  if (fieldKey(field) === "calc_type") {
    return CALC_TYPE_LABELS[value] || String(value);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function normalizeChanges(item) {
  const diff = parseJson(item?.diff_json);
  const entries = Object.entries(diff).map(([field, value]) => ({
    field,
    from: value?.from ?? value?.old ?? value?.old_value ?? null,
    to: value?.to ?? value?.new ?? value?.new_value ?? value,
  }));

  if (entries.length) return entries;

  if (item?.field || item?.field_name) {
    return [
      {
        field: item.field || item.field_name,
        from: item.old_value ?? item.from ?? null,
        to: item.new_value ?? item.to ?? null,
      },
    ];
  }

  return [];
}

function buildSummary(changes) {
  if (!changes.length) return "без деталей";

  if (changes.length === 1) {
    const change = changes[0];
    return `${fieldLabel(change.field)}: ${formatValue(change.from, change.field)} → ${formatValue(change.to, change.field)}`;
  }

  const names = changes.slice(0, 3).map((change) => fieldLabel(change.field));
  const more = changes.length > 3 ? ` и ещё ${changes.length - 3}` : "";
  return `${names.join(", ")}${more}`;
}

function HistoryItem({ item, index }) {
  const changes = normalizeChanges(item);
  const event = item.event_type || item.action || item.type;
  const eventLabel = EVENT_LABELS[event] || event || "Изменение";
  const author = item.actor_name || item.user_name || "Пользователь";
  const date = item.created_at ? dayjs(item.created_at).format("DD.MM.YYYY HH:mm") : "—";

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ minHeight: 44, "& .MuiAccordionSummary-content": { my: 0.75, gap: 1 } }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            width: "100%",
            minWidth: 0,
            pr: 1,
          }}
        >
          <Chip
            size="small"
            label={eventLabel}
            color={event === "deleted" || event === "delete" ? "error" : "default"}
            variant="outlined"
          />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              whiteSpace: "nowrap",
            }}
          >
            {date}
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "nowrap" }}
          >
            {author}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            title={buildSummary(changes)}
            sx={{
              color: "text.secondary",
              flex: 1,
              minWidth: 0,
            }}
          >
            {buildSummary(changes)}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
        {changes.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="34%">Поле</TableCell>
                <TableCell width="33%">Было</TableCell>
                <TableCell width="33%">Стало</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {changes.map((change, changeIndex) => (
                <TableRow key={`${change.field}-${changeIndex}`}>
                  <TableCell>{fieldLabel(change.field)}</TableCell>
                  <TableCell sx={{ color: "text.secondary", textDecoration: "line-through" }}>
                    {formatValue(change.from, change.field)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {formatValue(change.to, change.field)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            Подробности изменения не переданы сервером
          </Typography>
        )}
        {item.comment ? (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 1,
            }}
          >
            Комментарий: {item.comment}
          </Typography>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
}

export default function CoverageControlHistory({ history = [] }) {
  return (
    <Accordion
      component={Paper}
      variant="outlined"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <Typography>История изменений</Typography>
          <Chip
            size="small"
            label={history.length}
            variant="outlined"
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {!history.length ? (
          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
            Изменений пока нет
          </Typography>
        ) : (
          <Stack spacing={1}>
            {history.map((item, index) => (
              <HistoryItem
                key={item.id || index}
                item={item}
                index={index}
              />
            ))}
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
