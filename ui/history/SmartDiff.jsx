"use client";

import { Stack } from "@mui/material";
import { useMemo } from "react";
import HtmlDiff from "./diffs/HtmlDiff";
import MediaDiff from "./diffs/MediaDiff";
import TextDiff from "./diffs/TextDiff";

const HTML_FIELDS = ["content", "description", "text"];

function safeParse(v) {
  if (!v) return {};
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
}

function normalizeField(key) {
  // banner.link → link
  const last = key.split(".").pop();

  // img.0 → img
  if (last?.match(/^\d+$/)) {
    return key.split(".")[0];
  }

  return last;
}

function isJpg(name) {
  return (
    typeof name === "string" &&
    (name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".jpeg"))
  );
}

export default function SmartDiff({ item }) {
  const diffRaw = useMemo(() => safeParse(item?.diff_json), [item?.diff_json]);

  const meta = useMemo(() => safeParse(item?.meta_json), [item?.meta_json]);

  const html = [];
  const media = [];
  const text = [];

  Object.entries(diffRaw).forEach(([key, value]) => {
    const field = normalizeField(key);
    const from = value?.from ?? "";
    const to = value?.to ?? "";

    // upload event → only jpg media
    if (item?.event_type === "upload") {
      if (isJpg(to)) {
        media.push({ field, from, to });
      }
      return;
    }

    // html
    if (HTML_FIELDS.includes(field)) {
      html.push({ field, from, to });
      return;
    }

    // media (image update)
    if (field.startsWith("img") || meta?.type === "image") {
      if (isJpg(to)) {
        media.push({ field, from, to });
      }
      return;
    }

    // default text
    text.push({ field, from, to });
  });

  if (!html.length && !media.length && !text.length) return null;

  return (
    <Stack spacing={2}>
      {html.length > 0 && <HtmlDiff items={html} />}
      {media.length > 0 && <MediaDiff items={media} />}
      {text.length > 0 && <TextDiff items={text} />}
    </Stack>
  );
}
