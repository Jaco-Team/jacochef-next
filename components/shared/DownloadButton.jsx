"use client";

import { IconButton, Tooltip } from "@mui/material";

export default function DownloadButton({ children, url = null, ...restProps }) {
  if (!url) {
    // console.warn("no excel link");
    return null;
  }

  // console.info(`Excel link passed: ${url}`); 

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Important inside AccordionSummary

    const link = document.createElement("a");
    link.href = url;
    link.download = ""; // triggers download instead of navigation
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.append(link);
    link.click();
    link.remove();
  };

  return (
    <Tooltip title="Скачать Excel файл">
      <IconButton
        size="small"
        onClick={handleDownload}
        {...restProps}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
