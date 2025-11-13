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
import CompositionOfOrdersGroupGraph from "./CompositionOfOrdersGroupGraph";
import { Close } from "@mui/icons-material";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import "dayjs/locale/ru";
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.locale("ru");

export default function CompositionOfOrdersGroupGraphModal({ open, onClose, data, rowName }) {
  const [selectedMetrics, setSelectedMetrics] = useState(["group_count"]);
  const [step, setStep] = useState("day"); // "day" | "month"
  const metricsList = [
    {
      key: "group_count",
      label: "Количество",
      color: "#4e79a7",
      tooltip: "Количество продаж за период",
    },
    { key: "group_sum", label: "Сумма", color: "#59a14f", tooltip: "Сумма продаж за период, руб" },
    {
      key: "count_percent",
      label: "% Кол-ва",
      color: "#9c755f",
      tooltip: "Доля % количества выбранной позиции к общему количеству за период",
    },
    {
      key: "sum_percent",
      label: "% Суммы",
      color: "#f28e2b",
      tooltip: "Доля % от суммы выбранной позиции к общей сумме за период",
    },
  ];
  const handleToggleMetric = (metricKey) => (e) => {
    setSelectedMetrics((prev) =>
      e.target.checked ? [...prev, metricKey] : prev.filter((m) => m !== metricKey),
    );
  };

  const handleStepChange = (_, value) => value && setStep(value);

  const compactedData = useMemo(() => {
    if (!data) return [];

    // generic aggregator
    const aggregate = (getKey, getDate) => {
      const map = {};

      data.forEach((d) => {
        const key = getKey(d.date);
        if (!map[key]) {
          map[key] = {
            date: getDate(d.date),
            group_count: 0,
            group_sum: 0,
            count_percent_sum: 0,
            sum_percent_sum: 0,
            count: 0,
          };
        }

        const entry = map[key];
        entry.group_count += d.group_count;
        entry.group_sum += d.group_sum;
        entry.count_percent_sum += d.count_percent;
        entry.sum_percent_sum += d.sum_percent;
        entry.count++;
      });

      return Object.values(map).map((m) => ({
        date: m.date,
        group_count: m.group_count,
        group_sum: m.group_sum,
        count_percent: m.count_percent_sum / m.count,
        sum_percent: m.sum_percent_sum / m.count,
      }));
    };

    switch (step) {
      case "day":
        return data;

      case "week":
        return aggregate(
          (d) => {
            const date = dayjs(d);
            return `${date.year()}-W${String(date.isoWeek()).padStart(2, "0")}`;
          },
          (d) => dayjs(d).startOf("isoWeek").format("YYYY-MM-DD"),
        );

      case "month":
        return aggregate(
          (d) => dayjs(d).format("YYYY-MM"),
          (d) => dayjs(d).startOf("month").format("YYYY-MM-DD"),
        );

      default:
        return data;
    }
  }, [data, step]);

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

        <CompositionOfOrdersGroupGraph
          data={compactedData}
          metrics={selectedMetricObjs}
        />
      </DialogContent>
    </Dialog>
  );
}
