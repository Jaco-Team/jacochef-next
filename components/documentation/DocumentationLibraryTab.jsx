"use client";

import { useEffect, useMemo, useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  JacoButton,
  JacoSearchField,
  JacoSelectableListItem,
  JacoSurface,
  uiColors,
  uiRadii,
  uiTypography,
} from "@/design-system/shared/ui";

import DocumentationArticleContent from "./DocumentationArticleContent";
import { groupArticlesBySection, unwrapArticlePayload } from "./moduleOptions";

function matchesQuery(article, query) {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();

  return [article.title, article.group, article.module_key].some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(normalized),
  );
}

function ArticleMeta({ article }) {
  const parts = [
    article?.updated_at ? `Обновлено ${article.updated_at}` : "",
    article?.updated_by || "",
  ].filter(Boolean);

  if (!parts.length) {
    return null;
  }

  return (
    <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted }}>
      {parts.join(" · ")}
    </Typography>
  );
}

function EmptyState({ icon, title, text, action }) {
  return (
    <Stack
      spacing={1.5}
      sx={{ alignItems: "center", textAlign: "center", py: { xs: 6, md: 10 }, px: 2 }}
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
        {icon}
      </Box>
      <Typography sx={{ ...uiTypography.bodyMedium, color: uiColors.textStrong }}>
        {title}
      </Typography>
      {text ? (
        <Typography sx={{ ...uiTypography.label, color: uiColors.textMuted, maxWidth: 360 }}>
          {text}
        </Typography>
      ) : null}
      {action}
    </Stack>
  );
}

export default function DocumentationLibraryTab({
  api_laravel,
  modules,
  modulesLoading,
  refreshKey,
  showAlert,
  activeKey,
  onActiveKeyChange: setActiveKey,
  onEdit,
  onCreate,
}) {
  const isMobile = useMediaQuery("(max-width:900px)");

  const [listLoading, setListLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("");
  const [articleLoading, setArticleLoading] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadList() {
      setListLoading(true);

      try {
        const response = await api_laravel("get_articles_list");
        const payload = unwrapArticlePayload(response);

        if (!active) {
          return;
        }

        if (payload?.st === false) {
          showAlert(false, payload?.text || "Не удалось загрузить список статей");
          setArticles([]);
          return;
        }

        setArticles(Array.isArray(payload?.articles) ? payload.articles : []);
      } catch {
        if (active) {
          showAlert(false, "Не удалось загрузить список статей");
          setArticles([]);
        }
      } finally {
        if (active) {
          setListLoading(false);
        }
      }
    }

    loadList();

    return () => {
      active = false;
    };
  }, [api_laravel, refreshKey, showAlert]);

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      if (!activeKey) {
        setActiveArticle(null);
        return;
      }

      setArticleLoading(true);

      try {
        const response = await api_laravel("get_article", { module_key: activeKey });
        const payload = unwrapArticlePayload(response);

        if (!active) {
          return;
        }

        if (payload?.st === false || !payload?.article) {
          showAlert(false, payload?.text || "Статья не найдена");
          setActiveArticle(null);
          return;
        }

        setActiveArticle(payload.article);
      } catch {
        if (active) {
          showAlert(false, "Не удалось загрузить статью");
          setActiveArticle(null);
        }
      } finally {
        if (active) {
          setArticleLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      active = false;
    };
  }, [activeKey, api_laravel, refreshKey, showAlert]);

  const groups = useMemo(() => groupArticlesBySection(articles, modules), [articles, modules]);

  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((article) => matchesQuery(article, query)),
        }))
        .filter((group) => group.items.length > 0),
    [groups, query],
  );

  const activeItem = useMemo(
    () =>
      groups.flatMap((group) => group.items).find((item) => item.module_key === activeKey) || null,
    [activeKey, groups],
  );

  const loading = listLoading || modulesLoading;
  const showList = !isMobile || !activeKey;
  const showReader = !isMobile || Boolean(activeKey);

  if (!loading && articles.length === 0) {
    return (
      <JacoSurface>
        <EmptyState
          icon={<MenuBookOutlinedIcon />}
          title="Пока нет готовых статей"
          text="Создайте первую статью о модуле во вкладке редактора — она сразу появится здесь."
          action={
            <JacoButton
              compact
              onClick={onCreate}
            >
              Создать статью
            </JacoButton>
          }
        />
      </JacoSurface>
    );
  }

  return (
    <Grid
      container
      spacing={3}
    >
      {showList ? (
        <Grid
          size={{ xs: 12, md: 4, lg: 3 }}
          sx={{ height: "max-content" }}
        >
          <JacoSurface
            sx={{
              p: 2,
              position: { md: "sticky" },
              top: { md: 88 },
              maxHeight: { md: "calc(100vh - 112px)" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <JacoSearchField
              label="Поиск по статьям"
              value={query}
              onValueChange={setQuery}
            />

            <Typography sx={{ mt: 2, mb: 1, ...uiTypography.label, color: uiColors.textMuted }}>
              {loading ? "Загрузка…" : `Статей: ${articles.length}`}
            </Typography>

            <Box sx={{ overflowY: "auto", mx: -1, px: 1, flex: 1 }}>
              {loading ? (
                <Stack spacing={1}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      variant="rounded"
                      height={44}
                      sx={{ borderRadius: uiRadii.md }}
                    />
                  ))}
                </Stack>
              ) : filteredGroups.length === 0 ? (
                <Typography sx={{ py: 3, ...uiTypography.label, color: uiColors.textMuted }}>
                  Ничего не найдено
                </Typography>
              ) : (
                filteredGroups.map((group) => (
                  <Box
                    key={group.name}
                    sx={{ mb: 2 }}
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", justifyContent: "space-between", px: 1, mb: 0.5 }}
                    >
                      <Typography
                        sx={{
                          ...uiTypography.compactLabel,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: uiColors.textMuted,
                        }}
                      >
                        {group.name}
                      </Typography>
                      <Typography sx={{ ...uiTypography.compactLabel, color: uiColors.textSubtle }}>
                        {group.items.length}
                      </Typography>
                    </Stack>
                    <List
                      dense
                      disablePadding
                    >
                      {group.items.map((item) => {
                        const selected = item.module_key === activeKey;

                        return (
                          <JacoSelectableListItem
                            key={item.module_key}
                            selected={selected}
                            onClick={() => setActiveKey(item.module_key)}
                            sx={{
                              minHeight: 44,
                              mb: 0.5,
                              px: 1.5,
                              borderRadius: uiRadii.md,
                              color: uiColors.text,
                              transition: "background-color 120ms ease",
                              "&:hover": { backgroundColor: uiColors.surfaceMuted },
                              "&.Mui-selected, &.Mui-selected:hover": {
                                backgroundColor: uiColors.primarySoft,
                                color: uiColors.primary,
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                ...uiTypography.label,
                                fontWeight: selected ? 500 : 400,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {item.title}
                            </Typography>
                            <ChevronRightRoundedIcon
                              fontSize="small"
                              sx={{ color: selected ? uiColors.primary : uiColors.textSubtle }}
                            />
                          </JacoSelectableListItem>
                        );
                      })}
                    </List>
                  </Box>
                ))
              )}
            </Box>
          </JacoSurface>
        </Grid>
      ) : null}

      {showReader ? (
        <Grid
          size={{ xs: 12, md: 8, lg: 9 }}
          sx={{ height: "max-content" }}
        >
          <JacoSurface sx={{ p: { xs: 2, md: 4 }, minHeight: { md: 480 } }}>
            {!activeKey ? (
              <EmptyState
                icon={<MenuBookOutlinedIcon />}
                title="Выберите статью"
                text="Откройте модуль из списка слева, чтобы прочитать его документацию."
              />
            ) : (
              <Box sx={{ maxWidth: 860, mx: "auto" }}>
                {isMobile ? (
                  <JacoButton
                    tone="secondary"
                    compact
                    startIcon={<ArrowBackRoundedIcon fontSize="small" />}
                    onClick={() => setActiveKey(null)}
                    sx={{ mb: 2 }}
                  >
                    К списку
                  </JacoButton>
                ) : null}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
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
                      {activeItem?.group || "Документация"}
                    </Typography>
                    <Typography
                      component="h2"
                      sx={{
                        mt: 1,
                        fontSize: { xs: 24, md: 30 },
                        lineHeight: 1.2,
                        fontWeight: 600,
                        color: uiColors.textStrong,
                      }}
                    >
                      {activeArticle?.title || activeItem?.title}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <ArticleMeta article={activeArticle || activeItem} />
                    </Box>
                  </Box>

                  {activeItem?.module ? (
                    <JacoButton
                      tone="secondary"
                      compact
                      startIcon={<EditOutlinedIcon fontSize="small" />}
                      onClick={() => onEdit(activeItem.module)}
                    >
                      Редактировать
                    </JacoButton>
                  ) : null}
                </Stack>

                <Divider sx={{ my: 3, borderColor: uiColors.border }} />

                {articleLoading ? (
                  <Stack spacing={1.5}>
                    <Skeleton
                      variant="text"
                      height={28}
                      width="60%"
                    />
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        variant="text"
                        height={22}
                      />
                    ))}
                  </Stack>
                ) : (
                  <DocumentationArticleContent html={activeArticle?.html} />
                )}
              </Box>
            )}
          </JacoSurface>
        </Grid>
      ) : null}
    </Grid>
  );
}
