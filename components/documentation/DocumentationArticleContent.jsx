"use client";

import { useEffect, useRef, useState } from "react";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import Box from "@mui/material/Box";
import { uiColors, uiRadii, uiStateColors, uiTypography } from "@/design-system/shared/ui";

const HEADING_SELECTOR = "h1, h2, h3, h4";

function headingLevel(tagName) {
  const level = Number(String(tagName || "").replace(/\D/g, ""));
  return level >= 1 && level <= 4 ? level : 2;
}

function cleanText(node) {
  return node.textContent.replace(/\s+/g, " ").trim();
}

function readBoldChapters(root) {
  return [...root.querySelectorAll("p")].flatMap((node) => {
    if (node.closest(".doc-access-hidden") || node.closest("li")) {
      return [];
    }

    const text = cleanText(node);
    const strong = node.querySelector(":scope > strong, :scope > b");
    if (!strong || text.length < 2 || text.length > 80 || cleanText(strong) !== text) {
      return [];
    }

    return [{ node, level: 2, text }];
  });
}

function readArticleHeadings(root) {
  if (!root) {
    return [];
  }

  const real = [...root.querySelectorAll(HEADING_SELECTOR)].flatMap((node) => {
    if (node.closest(".doc-access-hidden")) {
      return [];
    }

    const text = cleanText(node);
    return text ? [{ node, level: headingLevel(node.tagName), text }] : [];
  });
  const source = real.length > 1 ? real : readBoldChapters(root);

  return source.map((item, index) => {
    const id = `doc-heading-${index}`;
    item.node.setAttribute("data-doc-heading", id);
    return { id, level: item.level, text: item.text };
  });
}

function ArticleOutline({ headings, activeId, open, minLevel, onToggle, onSelect }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const list = listRef.current;
    const current = list?.querySelector('[aria-current="location"]');
    if (!list || !current) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const itemRect = current.getBoundingClientRect();
    if (itemRect.top < listRect.top) {
      list.scrollTop -= listRect.top - itemRect.top;
    } else if (itemRect.bottom > listRect.bottom) {
      list.scrollTop += itemRect.bottom - listRect.bottom;
    }
  }, [activeId, open]);

  return (
    <Box
      component="aside"
      aria-label="Содержание статьи"
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxHeight: open ? 280 : "none",
        overflow: "hidden",
        border: `1px solid ${uiColors.border}`,
        borderRadius: uiRadii.md,
        backgroundColor: uiColors.surface,
        "@container (min-width: 760px)": {
          maxHeight: "calc(100dvh - 32px)",
        },
      }}
    >
      {open ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              px: 1.5,
              py: 1,
              borderBottom: `1px solid ${uiColors.borderLight}`,
            }}
          >
            <Box
              component="p"
              sx={{ m: 0, ...uiTypography.label, fontWeight: 600, color: uiColors.textStrong }}
            >
              Содержание
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="Скрыть содержание"
              onClick={onToggle}
              sx={outlineIconButtonSx}
            >
              <KeyboardArrowRightRoundedIcon fontSize="small" />
            </Box>
          </Box>
          <Box
            ref={listRef}
            component="ul"
            sx={{ m: 0, p: 1, listStyle: "none", overflowY: "auto" }}
          >
            {headings.map((item) => {
              const active = item.id === activeId;
              return (
                <Box
                  component="li"
                  key={item.id}
                  sx={{ pl: `${(item.level - minLevel) * 12}px` }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={active ? "location" : undefined}
                    sx={{
                      width: "100%",
                      minHeight: 36,
                      px: 1,
                      py: 0.75,
                      border: 0,
                      borderRadius: uiRadii.sm,
                      backgroundColor: active ? uiColors.primarySoft : "transparent",
                      color: active ? uiColors.primary : uiColors.text,
                      ...uiTypography.label,
                      fontWeight: active ? 600 : 500,
                      lineHeight: 1.3,
                      textAlign: "left",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: active ? uiColors.primarySoft : uiStateColors.hover,
                      },
                    }}
                  >
                    {item.text}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      ) : (
        <Box
          component="button"
          type="button"
          aria-label="Показать содержание"
          aria-expanded={false}
          onClick={onToggle}
          sx={{
            ...outlineIconButtonSx,
            width: "100%",
            minHeight: 48,
            border: 0,
            borderRadius: uiRadii.md,
            "@container (min-width: 760px)": {
              width: 48,
            },
          }}
        >
          <FormatListBulletedRoundedIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
}

const outlineIconButtonSx = {
  display: "grid",
  placeItems: "center",
  width: 32,
  height: 32,
  p: 0,
  border: 0,
  borderRadius: uiRadii.sm,
  backgroundColor: "transparent",
  color: uiColors.textMuted,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: uiStateColors.hover,
    color: uiColors.textStrong,
  },
};

export default function DocumentationArticleContent({ html }) {
  const rootRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [outlineOpen, setOutlineOpen] = useState(true);

  useEffect(() => {
    const next = readArticleHeadings(rootRef.current);
    setHeadings(next);
    setActiveId(next[0]?.id || "");
  }, [html]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || headings.length < 2 || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const nodes = headings
      .map((item) => root.querySelector(`[data-doc-heading="${item.id}"]`))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        const id = visible?.target?.getAttribute("data-doc-heading");
        if (id) {
          setActiveId(id);
        }
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: [0.2, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id) => {
    const node = rootRef.current?.querySelector(`[data-doc-heading="${id}"]`);
    if (!node) {
      return;
    }

    setActiveId(id);
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const minLevel = headings.reduce((min, item) => Math.min(min, item.level), 4);

  return (
    <>
      <style
        jsx
        global
      >{`
        .chef-documentation-article-content {
          font-family: Roboto, Helvetica, Arial, sans-serif;
          font-size: 16px;
          line-height: 26px;
          color: #2b2b2b;
          word-break: break-word;
        }

        .chef-documentation-article-content > *:first-child {
          margin-top: 0;
        }

        .chef-documentation-article-content h1,
        .chef-documentation-article-content h2,
        .chef-documentation-article-content h3,
        .chef-documentation-article-content h4 {
          margin: 28px 0 12px !important;
          color: #2b2b2b;
          font-weight: 600;
          line-height: 1.3;
          scroll-margin-top: 24px;
        }

        .chef-documentation-article-content h1 {
          font-size: 28px;
        }

        .chef-documentation-article-content h2 {
          font-size: 22px;
        }

        .chef-documentation-article-content h3 {
          font-size: 18px;
        }

        .chef-documentation-article-content p {
          margin: 0 0 14px;
        }

        .chef-documentation-article-content ul,
        .chef-documentation-article-content ol {
          margin: 0 0 14px;
          padding-left: 24px;
        }

        .chef-documentation-article-content li {
          margin-bottom: 6px;
        }

        .chef-documentation-article-content a {
          color: #dd1a32;
          text-decoration: none;
          border-bottom: 1px solid rgba(221, 26, 50, 0.3);
        }

        .chef-documentation-article-content a:hover {
          border-bottom-color: #dd1a32;
        }

        .chef-documentation-article-content img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 16px 0;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
        }

        .chef-documentation-article-content blockquote {
          margin: 16px 0;
          padding: 12px 16px;
          border-left: 3px solid #dd1a32;
          border-radius: 0 12px 12px 0;
          background: #fff1f3;
          color: #5e5e5e;
        }

        .chef-documentation-article-content code {
          padding: 2px 6px;
          border-radius: 6px;
          background: #f3f3f3;
          font-size: 14px;
        }

        .chef-documentation-article-content pre {
          padding: 12px 16px;
          border-radius: 12px;
          background: #f3f3f3;
          overflow-x: auto;
        }

        .chef-documentation-article-content table {
          width: 100%;
          margin: 16px 0;
          border-collapse: collapse;
          font-size: 14px;
        }

        .chef-documentation-article-content th,
        .chef-documentation-article-content td {
          padding: 10px 12px;
          border: 1px solid #e5e5e5;
          text-align: left;
        }

        .chef-documentation-article-content th {
          background: #f3f3f3;
          font-weight: 600;
        }

        .chef-documentation-article-content .doc-access-block {
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
        }

        .chef-documentation-article-content .doc-access-hidden {
          margin: 16px 0;
          padding: 12px 16px;
          border: 1px dashed #e5e5e5;
          border-radius: 12px;
          background: #f8f8f8;
          color: #a6a6a6;
          font-size: 14px;
          line-height: 20px;
        }

        .chef-documentation-article-content .doc-access-hidden::before {
          content: "Фрагмент скрыт ограничениями доступа";
        }
      `}</style>
      <Box sx={{ containerType: "inline-size" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            alignItems: "stretch",
            "@container (min-width: 760px)": {
              flexDirection: "row",
              alignItems: "flex-start",
            },
          }}
        >
          <Box
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              order: 1,
              "@container (min-width: 760px)": { order: 0 },
            }}
          >
            <div
              ref={rootRef}
              className="chef-documentation-article-content"
              dangerouslySetInnerHTML={{ __html: html || "" }}
            />
          </Box>
          {headings.length > 1 ? (
            <Box
              sx={{
                order: 0,
                position: "sticky",
                top: 0,
                zIndex: 2,
                alignSelf: "flex-start",
                width: "100%",
                "@container (min-width: 760px)": {
                  order: 1,
                  top: 16,
                  width: outlineOpen ? 280 : 48,
                  flex: "0 0 auto",
                },
              }}
            >
              <ArticleOutline
                headings={headings}
                activeId={activeId}
                open={outlineOpen}
                minLevel={minLevel}
                onToggle={() => setOutlineOpen((current) => !current)}
                onSelect={scrollToHeading}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
}
