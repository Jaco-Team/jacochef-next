"use client";

import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

export default function DownloadButton({ children, url = null, ...restProps }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!url) return;

    setLoading(true);
    try {
      // if url is a function, await it
      const resolvedUrl = typeof url === "function" ? await url() : url;
      if (!resolvedUrl) return;

      const link = document.createElement("a");
      link.href = resolvedUrl;
      link.download = ""; // triggers download
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.append(link);
      link.click();
      link.remove();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={`${(restProps.title || "Скачать Excel файл")}${loading ? " (ждите ответа...)" : ""}`}>
      <span>
        <IconButton
          size="small"
          onClick={handleDownload}
          disabled={loading}
          {...restProps}
        >
          {loading ? <CircularProgress size={10} /> : children}
        </IconButton>
      </span>
    </Tooltip>
  );
}
