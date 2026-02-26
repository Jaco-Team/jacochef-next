"use client";

import { ExpandMore, Restore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { memo, useMemo } from "react";

/* utils */

function tokenizeHtml(html = "") {
  return html.match(/(<[^>]+>|&nbsp;|\s+|[^<\s]+)/g) || [];
}

function parseDiff(json) {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function buildHtmlDiff(oldHtml = "", newHtml = "") {
  const a = tokenizeHtml(oldHtml);
  const b = tokenizeHtml(newHtml);

  const dp = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ type: "same", value: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "del", value: a[i++] });
    } else {
      result.push({ type: "add", value: b[j++] });
    }
  }

  while (i < a.length) result.push({ type: "del", value: a[i++] });
  while (j < b.length) result.push({ type: "add", value: b[j++] });

  return result;
}

/* field */

const FieldDiff = memo(function FieldDiff({ field, from, to }) {
  if (field === "content") {
    const parts = buildHtmlDiff(from, to);

    const html = parts
      .map((part) => {
        if (part.type === "same") return part.value;

        if (part.type === "del") {
          return `<span style="background:rgba(255,0,0,0.2);text-decoration:line-through;">${part.value}</span>`;
        }

        return `<span style="background:rgba(0,200,0,0.2);">${part.value}</span>`;
      })
      .join("");

    return (
      <Box key={field}>
        <Typography
          variant="body2"
          sx={{ mb: 1, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {field}
        </Typography>

        <Box
          sx={{ wordBreak: "break-word" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Box>
    );
  }

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid size={12}>
        <Typography
          variant="body2"
          sx={{ mb: 0.5, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {field}
        </Typography>
      </Grid>

      <Grid size={6}>
        <Typography
          variant="body2"
          sx={{
            textDecoration: "line-through",
            color: "text.secondary",
            wordBreak: "break-word",
          }}
        >
          {from}
        </Typography>
      </Grid>

      <Grid size={6}>
        <Typography
          variant="body2"
          fontWeight={500}
          sx={{ wordBreak: "break-word" }}
        >
          {to}
        </Typography>
      </Grid>
    </Grid>
  );
});

/* item */

const HistoryItem = memo(function HistoryItem({ item, restoreFunc }) {
  const diff = useMemo(() => parseDiff(item?.diff_json), [item?.diff_json]);
  const fields = useMemo(() => Object.keys(diff), [diff]);

  return (
    <>
      <Accordion
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Grid
            container
            alignItems="center"
            spacing={2}
          >
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2">
                {dayjs(item.created_at).format("DD.MM.YYYY HH:mm")}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2">{item.actor_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ wordBreak: "break-word" }}
              >
                {fields.join(", ")}
              </Typography>
            </Grid>

            {!!restoreFunc && (
              <Grid size={{ xs: 12, md: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    restoreFunc(item);
                  }}
                >
                  <Restore fontSize="small" />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2}>
            {fields.map((field) => (
              <FieldDiff
                key={field}
                field={field}
                from={diff[field]?.from ?? ""}
                to={diff[field]?.to ?? ""}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider />
    </>
  );
});

/* root */

function HistoryLogAccordion({ history, title = "История изменений", restoreFunc = null }) {
  return (
    <Accordion
      component={Paper}
      variant="outlined"
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>{title}</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        {!history?.length && (
          <Box p={2}>
            <Typography>Нет данных</Typography>
          </Box>
        )}

        {!!history?.length &&
          history.map((item, index) => (
            <HistoryItem
              key={item.id || index}
              item={item}
              restoreFunc={restoreFunc}
            />
          ))}
      </AccordionDetails>
    </Accordion>
  );
}

export default memo(HistoryLogAccordion);
