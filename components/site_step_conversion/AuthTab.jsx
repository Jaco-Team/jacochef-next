"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { displayText, formatNumber, formatPercent, formatSeconds } from "./format";
import {
  CodeText,
  FunnelBlock,
  KpiGrid,
  MetricTable,
  SectionCard,
  ShareCell,
  StackedDayChart,
  ToneText,
} from "./widgets";

const FUNNEL_TABS = [
  { id: "passwordless", label: "Без пароля" },
  { id: "recovery", label: "Восстановление" },
  { id: "password", label: "Пароль" },
];

function funnelSteps(funnels, id) {
  const source = funnels?.[id];
  if (Array.isArray(source)) return source;
  return source?.steps || [];
}

export default function AuthTab({ data, onRowClick }) {
  const [funnel, setFunnel] = useState("passwordless");
  const chart = data?.chart || {};

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <KpiGrid items={data?.kpis || []} />
      <StackedDayChart
        title={chart.title || "Успешные входы по способам"}
        subtitle={chart.subtitle || "по дням, все города"}
        series={chart.series || []}
        points={chart.points || []}
      />
      <SectionCard
        title="Неудачи по причинам"
        note="outcome ≠ success"
      >
        <MetricTable
          rows={data?.failures || []}
          getRowKey={(row) => row.code}
          columns={[
            { key: "reason", label: "Причина", render: (row) => row.reason },
            { key: "code", label: "Код", render: (row) => <CodeText>{row.code}</CodeText> },
            {
              key: "attempts",
              label: "Попыток",
              align: "right",
              render: (row) => formatNumber(row.attempts),
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
        title="Доставка кода по каналам"
        note="user.send_code"
      >
        <MetricTable
          rows={data?.channels || []}
          getRowKey={(row) => row.channel}
          columns={[
            { key: "channel", label: "Канал", render: (row) => row.channel },
            {
              key: "mode",
              label: "Выбор",
              render: (row) => <Box sx={{ color: "#6B7280" }}>{displayText(row.mode)}</Box>,
            },
            {
              key: "sent",
              label: "Отправлено",
              align: "right",
              render: (row) => formatNumber(row.sent),
            },
            {
              key: "failed",
              label: "Не доставлено",
              align: "right",
              render: (row) => formatNumber(row.failed),
            },
            {
              key: "error_share",
              label: "Доля ошибок",
              align: "right",
              render: (row) => formatPercent(row.error_share),
            },
            {
              key: "median_sec",
              label: "Медиана",
              align: "right",
              render: (row) => formatSeconds(row.median_sec),
            },
          ]}
        />
      </SectionCard>
      <SectionCard
        title="Воронка"
        note="экраны → UI, шаги → auth.attempt"
      >
        <FunnelBlock
          tabs={FUNNEL_TABS}
          value={funnel}
          onChange={setFunnel}
          steps={funnelSteps(data?.funnels, funnel)}
          color="#F08A24"
        />
      </SectionCard>
      <SectionCard
        title="Последние неудачи"
        note="клик по строке — все этапы попытки (flow_id)"
      >
        <MetricTable
          rows={data?.recent_failures || []}
          onRowClick={onRowClick}
          getRowKey={(row) => row.flow_id || row.time}
          columns={[
            { key: "time", label: "Время", render: (row) => row.time },
            { key: "scenario", label: "Сценарий", render: (row) => row.scenario },
            { key: "step", label: "Шаг", render: (row) => <CodeText>{row.step}</CodeText> },
            {
              key: "reason",
              label: "Причина",
              render: (row) => <ToneText tone={row.reason_tone}>{row.reason}</ToneText>,
            },
            { key: "channel", label: "Канал", render: (row) => displayText(row.channel) },
            { key: "client", label: "Клиент", render: (row) => displayText(row.client) },
            {
              key: "user_id",
              label: "Пользователь",
              align: "right",
              render: (row) =>
                row.user_id == null ? (
                  "—"
                ) : (
                  <Box sx={{ color: "#DD1A32", fontWeight: 700 }}>#{row.user_id}</Box>
                ),
            },
          ]}
        />
      </SectionCard>
    </Box>
  );
}
