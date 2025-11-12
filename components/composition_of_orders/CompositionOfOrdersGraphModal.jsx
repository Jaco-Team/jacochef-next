"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
} from "@mui/material";

import CompositionOfOrdersGraph from "./CompositionOfOrdersGraph";
import { Close } from "@mui/icons-material";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import "dayjs/locale/ru";
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.locale("ru");

const metricsList = [
  { key: "count", label: "Количество", color: "#4e79a7", tooltip: "Количество продаж за период" },
  { key: "price", label: "Сумма", color: "#59a14f", tooltip: "Сумма продаж за период, руб" },
  {
    key: "count_percent",
    label: "% Кол-во",
    color: "#9c755f",
    tooltip: "Доля % количества выбранной группы к общему количеству за период",
  },
  {
    key: "price_percent",
    label: "% Сумма",
    color: "#f28e2b",
    tooltip: "Доля % от суммы выбранной группы к общей сумме за период",
  },
];

export default function CompositionOfOrdersGraphModal({ open, onClose, data, rowName }) {
  const [selectedMetrics, setSelectedMetrics] = useState(["count"]);
  const [step, setStep] = useState("day"); // "day" | "week" | "month"

  const handleToggleMetric = (metricKey) => (e) => {
    setSelectedMetrics((prev) =>
      e.target.checked ? [...prev, metricKey] : prev.filter((m) => m !== metricKey),
    );
  };

  const handleStepChange = (_, value) => value && setStep(value);

  const compactedData = useMemo(() => {
    if (!data) return [];

    const aggregate = (getKey, getLabel) => {
      const map = {};

      data.forEach((d) => {
        const cat = d.categories.find((c) => c.name === rowName);
        if (!cat) return;

        const date = dayjs(d.date);
        const key = getKey(date);
        if (!map[key]) {
          map[key] = {
            date: date.startOf("day").format("YYYY-MM-DD"),
            label: getLabel(date),
            categories: [],
            all_count: 0,
            all_sum: 0,
          };
        }

        const entry = map[key];
        entry.all_count += cat.count;
        entry.all_sum += cat.price;
        entry.categories.push(cat);
      });

      return Object.values(map).map((m) => {
        const avgCountPercent =
          m.categories.reduce((a, c) => a + c.count_percent, 0) / m.categories.length;
        const avgPricePercent =
          m.categories.reduce((a, c) => a + c.price_percent, 0) / m.categories.length;

        return {
          date: m.date,
          label: m.label,
          all_count: m.all_count,
          all_sum: m.all_sum,
          categories: [
            {
              name: rowName,
              count: m.all_count,
              price: m.all_sum,
              count_percent: avgCountPercent,
              price_percent: avgPricePercent,
            },
          ],
        };
      });
    };

    switch (step) {
      case "day":
        return data;

      case "week":
        return aggregate(
          (d) => `${d.year()}-W${String(d.isoWeek()).padStart(2, "0")}`,
          (d) => {
            const start = d.startOf("isoWeek");
            const end = d.endOf("isoWeek");
            return `Неделя ${String(d.isoWeek()).padStart(2, "0")} (${start.format(
              "DD MMM",
            )}–${end.format("DD MMM")})`;
          },
        );

      case "month":
        return aggregate(
          (d) => d.format("YYYY-MM"),
          (d) => d.format("MMMM YYYY"),
        );

      default:
        return data;
    }
  }, [data, rowName, step]);

  const selectedMetricObjs = metricsList.filter((m) => selectedMetrics.includes(m.key));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        {rowName}
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, padding: 20 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ToggleButtonGroup
          value={step}
          exclusive
          onChange={handleStepChange}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="day">День</ToggleButton>
          <ToggleButton value="week">Неделя</ToggleButton>
          <ToggleButton value="month">Месяц</ToggleButton>
        </ToggleButtonGroup>

        <FormGroup
          row
          sx={{ mb: 2 }}
        >
          {metricsList.map(({ key, label, color, tooltip }) => (
            <Tooltip
              key={key}
              title={tooltip}
            >
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={selectedMetrics.includes(key)}
                    onChange={handleToggleMetric(key)}
                  />
                }
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: color,
                      }}
                    />
                    {label}
                  </Box>
                }
              />
            </Tooltip>
          ))}
        </FormGroup>

        <CompositionOfOrdersGraph
          data={compactedData}
          rowName={rowName}
          metrics={selectedMetricObjs}
        />
      </DialogContent>
    </Dialog>
  );
}
