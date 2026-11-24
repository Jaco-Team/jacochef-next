"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { displayText, formatMoney, formatNumber, formatPercent, formatSeconds } from "./format";
import {
  CodeText,
  FunnelBlock,
  KpiGrid,
  MetricTable,
  SectionCard,
  ShareCell,
  StackedDayChart,
  ToneChip,
  ToneText,
} from "./widgets";

const FUNNEL_TABS = [
  { id: "all", label: "Все" },
  { id: "bank_card", label: "Карта" },
  { id: "sbp", label: "СБП" },
];

function funnelSteps(funnels, id) {
  const source = funnels?.[id];
  if (Array.isArray(source)) return source;
  return source?.steps || [];
}

export default function PaymentsTab({ data, onRowClick }) {
  const [funnel, setFunnel] = useState("all");
  const chart = data?.chart || {};

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <KpiGrid items={data?.kpis || []} />
      <StackedDayChart
        title={chart.title || "Успешные оплаты по способам"}
        subtitle={chart.subtitle || "по дням, подтверждено webhook"}
        series={chart.series || []}
        points={chart.points || []}
      />
      <SectionCard
        title="Воронка оплаты"
        note="по payment_flow_id"
      >
        <FunnelBlock
          tabs={FUNNEL_TABS}
          value={funnel}
          onChange={setFunnel}
          steps={funnelSteps(data?.funnels, funnel)}
          color="#3B82F6"
        />
      </SectionCard>
      <SectionCard
        title="Способы оплаты"
        note="все переходы"
      >
        <MetricTable
          rows={data?.methods || []}
          getRowKey={(row) => row.code}
          columns={[
            {
              key: "method",
              label: "Способ",
              render: (row) => (
                <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
                  <Box>{row.method}</Box>
                  <CodeText>{row.code}</CodeText>
                </Box>
              ),
            },
            {
              key: "started",
              label: "Начато",
              align: "right",
              render: (row) => formatNumber(row.started),
            },
            {
              key: "paid",
              label: "Оплачено",
              align: "right",
              render: (row) => formatNumber(row.paid),
            },
            {
              key: "conversion",
              label: "Конверсия",
              align: "right",
              render: (row) => formatPercent(row.conversion),
            },
            {
              key: "amount",
              label: "Сумма",
              align: "right",
              render: (row) => formatMoney(row.amount),
            },
            {
              key: "median_sec",
              label: "Медиана до оплаты",
              align: "right",
              render: (row) => formatSeconds(row.median_sec),
            },
          ]}
        />
      </SectionCard>
      <SectionCard
        title="Ошибки и отмены по причинам"
        note="outcome = failure, отмены отдельно"
      >
        <MetricTable
          rows={data?.problems || []}
          getRowKey={(row) => row.code}
          columns={[
            { key: "reason", label: "Причина", render: (row) => row.reason },
            { key: "code", label: "Код", render: (row) => <CodeText>{row.code}</CodeText> },
            {
              key: "type_label",
              label: "Тип",
              render: (row) => <ToneChip tone={row.type_tone}>{row.type_label}</ToneChip>,
            },
            {
              key: "count",
              label: "Случаев",
              align: "right",
              render: (row) => formatNumber(row.count),
            },
            {
              key: "share",
              label: "Доля",
              align: "right",
              render: (row) => <ShareCell value={row.share} />,
            },
          ]}
        />
      </SectionCard>
      <SectionCard
        title="Последние проблемные оплаты"
        note="клик по строке — все события попытки (payment_flow_id)"
      >
        <MetricTable
          rows={data?.recent_problems || []}
          onRowClick={onRowClick}
          getRowKey={(row) => row.payment_flow_id || row.time}
          columns={[
            { key: "time", label: "Время", render: (row) => row.time },
            {
              key: "order_label",
              label: "Заказ",
              render: (row) => (
                <Box sx={{ color: "#DD1A32", fontWeight: 700 }}>{row.order_label}</Box>
              ),
            },
            { key: "point_name", label: "Точка", render: (row) => displayText(row.point_name) },
            { key: "method", label: "Способ", render: (row) => displayText(row.method) },
            { key: "stage", label: "Стадия", render: (row) => <CodeText>{row.stage}</CodeText> },
            {
              key: "reason",
              label: "Причина",
              render: (row) => <ToneText tone={row.reason_tone}>{row.reason}</ToneText>,
            },
            {
              key: "amount",
              label: "Сумма",
              align: "right",
              render: (row) => formatMoney(row.amount),
            },
          ]}
        />
      </SectionCard>
    </Box>
  );
}
