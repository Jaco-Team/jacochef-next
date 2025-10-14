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
import CompositionOfOrdersGraph from "./CompositionOfOrdersGraph";
import { Close } from "@mui/icons-material";

const metricsList = [
  { key: "count", label: "Количество", color: "#4e79a7" },
  { key: "price", label: "Сумма", color: "#59a14f" },
  { key: "count_percent", label: "% Кол-во", color: "#9c755f" },
  { key: "price_percent", label: "% Сумма", color: "#f28e2b" },
];

export default function CompositionOfOrdersGraphModal({ open, onClose, data, rowName }) {
  const [selectedMetrics, setSelectedMetrics] = useState(["count"]);
  const [step, setStep] = useState("day"); // "day" | "month"

  const handleToggleMetric = (metricKey) => (e) => {
    setSelectedMetrics((prev) =>
      e.target.checked ? [...prev, metricKey] : prev.filter((m) => m !== metricKey),
    );
  };

  const handleStepChange = (_, value) => value && setStep(value);

  // Compact data when monthly
  const compactedData = useMemo(() => {
    if (step === "day") return data;

    const map = {};
    data?.forEach((d) => {
      const month = dayjs(d.date).format("YYYY-MM");
      const cat = d.categories.find((c) => c.name === rowName);
      if (!cat) return;

      if (!map[month]) {
        map[month] = {
          date: `${month}-01`,
          categories: [],
          all_count: 0,
          all_sum: 0,
        };
      }
      const existing = map[month];
      existing.all_count += cat.count;
      existing.all_sum += cat.price;
      existing.categories.push(cat);
    });

    // Aggregate percent as average of entries
    return Object.values(map)?.map((m) => {
      const avgCountPercent =
        m.categories.reduce((a, c) => a + c.count_percent, 0) / m.categories.length;
      const avgPricePercent =
        m.categories.reduce((a, c) => a + c.price_percent, 0) / m.categories.length;

      return {
        date: m.date,
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

        <CompositionOfOrdersGraph
          data={compactedData}
          rowName={rowName}
          metrics={selectedMetricObjs}
        />
      </DialogContent>
    </Dialog>
  );
}
