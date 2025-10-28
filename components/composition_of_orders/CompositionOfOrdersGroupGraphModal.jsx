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
} from "@mui/material";
import dayjs from "dayjs";
import CompositionOfOrdersGroupGraph from "./CompositionOfOrdersGroupGraph";
import { Close } from "@mui/icons-material";



export default function CompositionOfOrdersGroupGraphModal({ open, onClose, data, rowName }) {
  const [selectedMetrics, setSelectedMetrics] = useState(["group_count"]);
  const [step, setStep] = useState("day"); // "day" | "month"
const metricsList = [
  { key: "group_count", label: "Количество", color: "#4e79a7" },
  { key: "group_sum", label: "Сумма", color: "#59a14f" },
  { key: "count_percent", label: "% Кол-ва", color: "#9c755f" },
  { key: "sum_percent", label: "% Суммы", color: "#f28e2b" },
];
  const handleToggleMetric = (metricKey) => (e) => {
    setSelectedMetrics((prev) =>
      e.target.checked ? [...prev, metricKey] : prev.filter((m) => m !== metricKey)
    );
  };

  const handleStepChange = (_, value) => value && setStep(value);

  // Aggregate to monthly if needed
  const compactedData = useMemo(() => {
    if (step === "day") return data;
    const map = {};
    data?.forEach((d) => {
      const month = dayjs(d.date).format("YYYY-MM");
      if (!map[month]) {
        map[month] = {
          date: `${month}-01`,
          group_count: 0,
          group_sum: 0,
          count_percent_sum: 0,
          sum_percent_sum: 0,
          count: 0,
        };
      }
      const entry = map[month];
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
  }, [data, step]);

  const selectedMetricObjs = metricsList.filter((m) => selectedMetrics.includes(m.key));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle className="button">
        {rowName}
        <IconButton onClick={onClose}>
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
          <ToggleButton value="month">Месяц</ToggleButton>
        </ToggleButtonGroup>

        <FormGroup
          row
          sx={{ mb: 2 }}
        >
          {metricsList.map(({ key, label, color }) => (
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
