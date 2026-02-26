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
  Stack,
  Typography,
} from "@mui/material";
import { memo } from "react";

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
});

/* item */

function HtmlDiff({ items }) {
  return (
    <>
      <Accordion
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ wordBreak: "break-word" }}
          >
            {items.map((i) => i.field).join(", ")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2}>
            {items.map(({ field, from, to }) => (
              <FieldDiff
                key={field}
                field={field}
                from={from ?? ""}
                to={to ?? ""}
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider />
    </>
  );
}

export default memo(HtmlDiff);
