"use client";

import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { memo } from "react";

function tokenizeHtml(html = "") {
  return html.match(/(<[^>]+>|&nbsp;|\s+|[^<\s]+)/g) || [];
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

const FieldDiff = memo(function FieldDiff({ from, to }) {
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
    <Box
      sx={{
        minWidth: 0,
        maxWidth: "100%",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        "& img, & video": { maxWidth: "100%", height: "auto", display: "block" },
        "& pre": { maxWidth: "100%", overflowX: "auto", whiteSpace: "pre-wrap" },
        "& table": { display: "block", maxWidth: "100%", overflowX: "auto" },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

function HtmlDiff({ items }) {
  return (
    <>
      <Accordion
        disableGutters
        elevation={0}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            minWidth: 0,
            "& .MuiAccordionSummary-content": { minWidth: 0 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 0, overflowWrap: "anywhere" }}
          >
            {items.map((i) => i.field).join(", ")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0, minWidth: 0 }}>
          <Stack
            spacing={2}
            sx={{ minWidth: 0 }}
          >
            {items.map(({ field, from, to }) => (
              <FieldDiff
                key={field}
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
