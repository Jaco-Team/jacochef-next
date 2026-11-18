"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import {
  JacoAutocomplete,
  JacoButton,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";
import useApi from "@/src/hooks/useApi";

import { normalizeEntityId } from "./accessBlocks";
import DocumentationArticleContent from "./DocumentationArticleContent";
import { unwrapArticlePayload } from "./moduleOptions";

const EXCLUDED_KEYS = new Set(["documentation", "auth", "registration"]);

function getCurrentModuleKey(pathname) {
  const [segment] = String(pathname || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  return segment || null;
}

export default function ModuleHelpButton({ fullMenu, sx }) {
  const router = useRouter();
  const { api_laravel } = useApi("documentation");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [articles, setArticles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [article, setArticle] = useState(null);

  const moduleKey = getCurrentModuleKey(router.asPath);
  const module = useMemo(
    () =>
      moduleKey && !EXCLUDED_KEYS.has(moduleKey)
        ? (Array.isArray(fullMenu) ? fullMenu : []).find((item) => item?.key_query === moduleKey)
        : null,
    [fullMenu, moduleKey],
  );

  useEffect(() => {
    if (!open || !moduleKey) {
      return undefined;
    }

    let active = true;

    async function loadArticles() {
      setLoading(true);
      setFailed(false);
      setArticle(null);
      setArticles([]);
      setSelectedId(null);
      let deferLoading = false;

      try {
        let nextArticles = [];
        let listLoaded = false;
        try {
          const response = await api_laravel("get_module_articles", { module_key: moduleKey });
          const payload = unwrapArticlePayload(response);
          if (payload?.st !== false && Array.isArray(payload?.articles)) {
            nextArticles = payload.articles;
            listLoaded = true;
          }
        } catch {
          listLoaded = false;
        }

        if (!listLoaded) {
          const response = await api_laravel("get_article", { module_key: moduleKey });
          const payload = unwrapArticlePayload(response);
          if (!active) {
            return;
          }
          if (payload?.st === false) {
            setFailed(true);
            return;
          }
          nextArticles = payload?.article ? [payload.article] : [];
          setArticles(nextArticles);
          setSelectedId(nextArticles[0]?.id ?? nextArticles[0]?.module_key ?? null);
          setArticle(payload?.article || null);
          return;
        }

        if (!active) {
          return;
        }

        const first = nextArticles[0];
        deferLoading = Boolean(first?.id != null && first.id !== "" && !first.html);
        setArticles(nextArticles);
        setSelectedId(first?.id ?? null);
      } catch {
        if (active) {
          setFailed(true);
        }
      } finally {
        if (active && !deferLoading) {
          setLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      active = false;
    };
  }, [api_laravel, moduleKey, open]);

  useEffect(() => {
    if (!open || selectedId == null || articles.length === 0) {
      return undefined;
    }

    const selected = articles.find(
      (item) => String(item.id ?? item.module_key) === String(selectedId),
    );
    if (selected?.html) {
      setArticle(selected);
      return undefined;
    }

    let active = true;

    async function loadArticle() {
      setLoading(true);
      setFailed(false);

      try {
        const request =
          selected?.id != null && selected.id !== ""
            ? { article_id: normalizeEntityId(selected.id) }
            : { module_key: moduleKey };
        const response = await api_laravel("get_article", request);
        const payload = unwrapArticlePayload(response);

        if (!active) {
          return;
        }

        if (payload?.st === false || !payload?.article) {
          setFailed(true);
          return;
        }

        setArticle(payload.article);
      } catch {
        if (active) {
          setFailed(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      active = false;
    };
  }, [api_laravel, articles, moduleKey, open, selectedId]);

  if (!module) {
    return null;
  }

  const goToDocumentation = (tab) => {
    setOpen(false);
    const articleId = article?.id ?? selectedId;
    const query = { module: moduleKey };
    if (articleId != null && articleId !== "" && articleId !== moduleKey) {
      query.article = articleId;
    }
    if (tab) {
      query.tab = tab;
    }
    router.push({ pathname: "/documentation", query });
  };

  const selectedOption =
    articles.find((item) => String(item.id ?? item.module_key) === String(selectedId)) || null;

  return (
    <>
      <Tooltip title="Справка по модулю">
        <IconButton
          color="inherit"
          aria-label="Справка по модулю"
          onClick={() => setOpen(true)}
          sx={sx}
        >
          <HelpOutlineRoundedIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 560 },
              maxWidth: "100%",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            borderBottom: `1px solid ${uiColors.border}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                ...uiTypography.compactLabel,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: uiColors.primary,
              }}
            >
              Справка
            </Typography>
            <Typography
              component="h2"
              sx={{
                mt: 0.5,
                fontSize: 22,
                lineHeight: 1.25,
                fontWeight: 600,
                color: uiColors.textStrong,
              }}
            >
              {module.name}
            </Typography>
            {article?.updated_at ? (
              <Typography sx={{ mt: 0.5, ...uiTypography.label, color: uiColors.textMuted }}>
                {[`Обновлено ${article.updated_at}`, article.updated_by]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            ) : null}
          </Box>
          <IconButton
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
          {!loading && articles.length > 1 ? (
            <Box sx={{ mb: 2 }}>
              <JacoAutocomplete
                label="Статья"
                options={articles}
                value={selectedOption}
                groupBy={(option) => option.group_name || "Без группы"}
                getOptionLabel={(option) => option?.title || module.name}
                isOptionEqualToValue={(option, value) =>
                  String(option?.id ?? option?.module_key) ===
                  String(value?.id ?? value?.module_key)
                }
                onChange={(_event, next) => setSelectedId(next?.id ?? next?.module_key ?? null)}
                selectAppearance
                disableClearable
              />
            </Box>
          ) : null}
          {loading ? (
            <Stack spacing={1.5}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  variant="text"
                  height={22}
                />
              ))}
            </Stack>
          ) : failed ? (
            <Typography sx={{ ...uiTypography.body, color: uiColors.textMuted }}>
              Не удалось загрузить справку. Попробуйте позже.
            </Typography>
          ) : article?.html ? (
            <DocumentationArticleContent html={article.html} />
          ) : (
            <Stack
              spacing={1.5}
              sx={{ alignItems: "center", textAlign: "center", py: 8 }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: uiRadii.lg,
                  display: "grid",
                  placeItems: "center",
                  color: uiColors.primary,
                  backgroundColor: uiColors.primarySoft,
                }}
              >
                <MenuBookOutlinedIcon />
              </Box>
              <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
                Справка ещё не написана
              </Typography>
              <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted, maxWidth: 320 }}>
                Для этого модуля пока нет статей в базе знаний.
              </Typography>
            </Stack>
          )}
        </Box>

        {!loading && !failed ? (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: "wrap",
              justifyContent: "flex-end",
              px: 3,
              py: 2,
              borderTop: `1px solid ${uiColors.border}`,
            }}
          >
            {article?.html ? (
              <JacoButton
                tone="secondary"
                compact
                startIcon={<MenuBookOutlinedIcon fontSize="small" />}
                onClick={() => goToDocumentation(null)}
              >
                Открыть в базе знаний
              </JacoButton>
            ) : null}
            <JacoButton
              tone={article?.html ? "secondary" : "primary"}
              compact
              startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={() => goToDocumentation("editor")}
            >
              {article?.html ? "Редактировать" : "Написать статью"}
            </JacoButton>
          </Stack>
        ) : null}
      </Drawer>
    </>
  );
}
