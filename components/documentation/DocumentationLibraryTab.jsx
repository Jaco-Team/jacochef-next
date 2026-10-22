"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
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

import { normalizeEntityId } from "./accessBlocks";
import DocumentationArticleContent from "./DocumentationArticleContent";
import { groupArticlesBySection, unwrapArticlePayload } from "./moduleOptions";

function pdfFileName(title) {
  const safe = String(title || "статья")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  return `${safe || "статья"}.pdf`;
}

async function readDownloadError(value) {
  if (!value) {
    return "";
  }

  if (typeof value.text === "function") {
    try {
      const raw = await value.text();
      const parsed = JSON.parse(raw);
      const payload = parsed?.data && typeof parsed.data === "object" ? parsed.data : parsed;
      return payload?.text || "";
    } catch {
      return "";
    }
  }

  return value?.text || value?.data?.text || "";
}

function articleKey(article) {
  return article?.id != null && article.id !== "" ? article.id : article?.module_key;
}

function matchesQuery(article, query) {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();

  return [
    article.title,
    article.group,
    article.group_name,
    article.module_key,
    article.moduleName,
  ].some((value) =>
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
  activeId,
  preferredModuleKey,
  onActiveIdChange: setActiveId,
  canEdit = false,
  canDownloadPdf = false,
  canCreate = false,
  onEdit,
  onCreate,
}) {
  const isMobile = useMediaQuery("(max-width:900px)");

  const [listLoading, setListLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("");
  const [articleLoading, setArticleLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const preferredAppliedRef = useRef(false);

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
      if (!activeId || listLoading) {
        if (!activeId) {
          setActiveArticle(null);
        }
        return;
      }

      const item = articles.find((article) => String(articleKey(article)) === String(activeId));
      const request =
        item?.id != null && item.id !== ""
          ? { article_id: normalizeEntityId(item.id) }
          : item?.module_key
            ? { module_key: item.module_key }
            : /^\d+$/.test(String(activeId))
              ? { article_id: normalizeEntityId(activeId) }
              : { module_key: activeId };

      setArticleLoading(true);

      try {
        const response = await api_laravel("get_article", request);
        const payload = unwrapArticlePayload(response);

        if (!active) {
          return;
        }

        if (payload?.st === false) {
          showAlert(false, payload?.text || "Статья не найдена");
          setActiveArticle(null);
          return;
        }

        if (!payload?.article) {
          showAlert(false, "Статья не найдена");
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
  }, [activeId, api_laravel, articles, listLoading, refreshKey, showAlert]);

  const groups = useMemo(() => groupArticlesBySection(articles, modules), [articles, modules]);

  const filteredGroups = useMemo(
    () =>
      groups
        .map((section) => ({
          ...section,
          modules: section.modules
            .map((module) => ({
              ...module,
              groups: module.groups
                .map((group) => ({
                  ...group,
                  items: group.items.filter((article) => matchesQuery(article, query)),
                }))
                .filter((group) => group.items.length > 0),
            }))
            .filter((module) => module.groups.length > 0),
        }))
        .filter((section) => section.modules.length > 0),
    [groups, query],
  );

  const activeItem = useMemo(
    () =>
      groups
        .flatMap((section) => section.modules)
        .flatMap((module) => module.groups)
        .flatMap((group) => group.items)
        .find((item) => String(articleKey(item)) === String(activeId)) || null,
    [activeId, groups],
  );

  useEffect(() => {
    if (preferredAppliedRef.current || activeId || listLoading || !preferredModuleKey) {
      return;
    }

    const first = articles.find((article) => article.module_key === preferredModuleKey);
    if (!first) {
      return;
    }

    preferredAppliedRef.current = true;
    setActiveId(articleKey(first));
  }, [activeId, articles, listLoading, preferredModuleKey, setActiveId]);

  const downloadPdf = async () => {
    const articleId = activeArticle?.id ?? activeItem?.id;
    if (articleId == null || articleId === "") {
      return;
    }

    setPdfLoading(true);

    try {
      const response = await api_laravel(
        "download_article_pdf",
        { article_id: normalizeEntityId(articleId) },
        { responseType: "blob" },
      );
      const blob = response instanceof Blob ? response : new Blob([response]);
      if (blob.type !== "application/pdf") {
        const errorText = await readDownloadError(blob);
        if (errorText || blob.type.includes("json") || blob.type.startsWith("text/")) {
          showAlert(false, errorText || "Не удалось скачать PDF");
          return;
        }
      }

      const url = window.URL.createObjectURL(
        blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFileName(activeArticle?.title || activeItem?.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showAlert(
        false,
        (await readDownloadError(error?.response?.data)) || "Не удалось скачать PDF",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const loading = listLoading || modulesLoading;
  const showList = !isMobile || !activeId;
  const showReader = !isMobile || Boolean(activeId);

  if (!loading && articles.length === 0) {
    return (
      <JacoSurface>
        <EmptyState
          icon={<MenuBookOutlinedIcon />}
          title="Пока нет готовых статей"
          text={
            canCreate
              ? "Создайте первую статью о модуле во вкладке редактора — она сразу появится здесь."
              : "Готовых статей пока нет."
          }
          action={
            canCreate ? (
              <JacoButton
                compact
                onClick={onCreate}
              >
                Создать статью
              </JacoButton>
            ) : null
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
                filteredGroups.map((section) => {
                  const sectionCount = section.modules.reduce(
                    (sum, module) =>
                      sum +
                      module.groups.reduce((groupSum, group) => groupSum + group.items.length, 0),
                    0,
                  );

                  return (
                    <Box
                      key={section.name}
                      sx={{ mb: 2 }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 1,
                          mb: 0.5,
                        }}
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
                          {section.name}
                        </Typography>
                        <Typography
                          sx={{ ...uiTypography.compactLabel, color: uiColors.textSubtle }}
                        >
                          {sectionCount}
                        </Typography>
                      </Stack>
                      {section.modules.map((module) => (
                        <Box
                          key={module.key}
                          sx={{ mb: 1 }}
                        >
                          <Typography
                            sx={{
                              px: 1,
                              mb: 0.5,
                              ...uiTypography.label,
                              fontWeight: 500,
                              color: uiColors.textStrong,
                            }}
                          >
                            {module.name}
                          </Typography>
                          {module.groups.map((group) => {
                            const showGroup =
                              module.groups.length > 1 || group.name !== "Без группы";

                            return (
                              <Box key={`${module.key}-${group.name}`}>
                                {showGroup ? (
                                  <Typography
                                    sx={{
                                      px: 1,
                                      mb: 0.5,
                                      ...uiTypography.compactLabel,
                                      color: uiColors.textMuted,
                                    }}
                                  >
                                    {group.name}
                                  </Typography>
                                ) : null}
                                <List
                                  dense
                                  disablePadding
                                >
                                  {group.items.map((item) => {
                                    const key = articleKey(item);
                                    const selected = String(key) === String(activeId);

                                    return (
                                      <JacoSelectableListItem
                                        key={String(key)}
                                        selected={selected}
                                        onClick={() => setActiveId(key)}
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
                                          sx={{
                                            color: selected
                                              ? uiColors.primary
                                              : uiColors.textSubtle,
                                          }}
                                        />
                                      </JacoSelectableListItem>
                                    );
                                  })}
                                </List>
                              </Box>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>
                  );
                })
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
            {!activeId ? (
              <EmptyState
                icon={<MenuBookOutlinedIcon />}
                title="Выберите статью"
                text="Откройте статью из списка слева. У одного модуля может быть несколько статей в разных группах."
              />
            ) : (
              <Box>
                {isMobile ? (
                  <JacoButton
                    tone="secondary"
                    compact
                    startIcon={<ArrowBackRoundedIcon fontSize="small" />}
                    onClick={() => setActiveId(null)}
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
                      {[
                        activeItem?.moduleName,
                        activeItem?.group && activeItem.group !== "Без группы"
                          ? activeItem.group
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Документация"}
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
                    {String(activeArticle?.html || "").includes("doc-access-hidden") ? (
                      <Typography sx={{ mt: 1, ...uiTypography.label, color: uiColors.textMuted }}>
                        Часть статьи скрыта ограничениями доступа
                      </Typography>
                    ) : null}
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: "wrap" }}
                  >
                    {canDownloadPdf && (activeArticle?.id != null || activeItem?.id != null) ? (
                      <JacoButton
                        tone="secondary"
                        compact
                        loading={pdfLoading}
                        disabled={articleLoading}
                        startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                        onClick={downloadPdf}
                      >
                        Скачать PDF
                      </JacoButton>
                    ) : null}
                    {canEdit && activeItem?.module ? (
                      <JacoButton
                        tone="secondary"
                        compact
                        startIcon={<EditOutlinedIcon fontSize="small" />}
                        onClick={() => onEdit(activeItem.module, activeItem.id ?? null)}
                      >
                        Редактировать
                      </JacoButton>
                    ) : null}
                  </Stack>
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
