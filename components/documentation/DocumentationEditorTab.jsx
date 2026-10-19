"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  JacoAutocomplete,
  JacoButton,
  JacoSurface,
  uiColors,
  uiTypography,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import HistoryLog from "@/ui/history/HistoryLog";

import DocumentationArticleContent from "./DocumentationArticleContent";
import DocumentationEditor from "./DocumentationEditor";
import {
  buildHistoryLogItems,
  filterModuleOptions,
  getModulePath,
  unwrapArticlePayload,
} from "./moduleOptions";

export default function DocumentationEditorTab({
  api_laravel,
  api_upload,
  modules,
  selected,
  onSelect,
  showAlert,
  onSaved,
}) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { confirm, ConfirmDialog } = useJacoConfirm();

  const [articleLoading, setArticleLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [mode, setMode] = useState("view");
  const [draftHtml, setDraftHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyKey, setHistoryKey] = useState(0);

  const moduleKey = selected?.key_query || null;
  const historyItems = useMemo(() => buildHistoryLogItems(history), [history]);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      if (!moduleKey || !article?.id) {
        setHistory([]);
        return;
      }

      try {
        const response = await api_laravel("get_article_history", { module_key: moduleKey });
        const payload = unwrapArticlePayload(response);

        if (active) {
          setHistory(payload?.st === false ? [] : payload?.history || []);
        }
      } catch {
        if (active) {
          setHistory([]);
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [api_laravel, article?.id, historyKey, moduleKey]);

  const uploadImage = useCallback(
    async (file) => {
      const response = await api_upload("upload_image", file, { module_key: moduleKey });
      const payload = unwrapArticlePayload(response);

      if (payload?.st === false || !payload?.url) {
        throw new Error(payload?.text || "Не удалось загрузить изображение");
      }

      return payload.url;
    },
    [api_upload, moduleKey],
  );

  const restoreVersion = useCallback(
    async (item) => {
      if (!moduleKey || item?.id == null) {
        return;
      }

      const date = dayjs(item.created_at);
      const accepted = await confirm({
        title: "Восстановить версию?",
        message: `Статья вернётся к состоянию${
          date.isValid() ? ` от ${date.format("DD.MM.YYYY HH:mm")}` : ""
        }. Текущий текст сохранится в истории.`,
        confirmLabel: "Восстановить",
        cancelLabel: "Отмена",
        confirmTone: "primary",
      });

      if (!accepted) {
        return;
      }

      try {
        const response = await api_laravel("restore_version", {
          module_key: moduleKey,
          version_id: item.id,
        });
        const payload = unwrapArticlePayload(response);

        if (payload?.st === false || !payload?.article) {
          showAlert(false, payload?.text || "Не удалось восстановить версию");
          return;
        }

        setArticle(payload.article);
        setDraftHtml(payload.article.html || "");
        setMode("view");
        setHistoryKey((key) => key + 1);
        showAlert(true, "Версия восстановлена");
        onSaved?.();
      } catch {
        showAlert(false, "Не удалось восстановить версию");
      }
    },
    [api_laravel, confirm, moduleKey, onSaved, showAlert],
  );

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      if (!selected?.key_query) {
        setArticle(null);
        setDraftHtml("");
        setMode("view");
        return;
      }

      setArticleLoading(true);

      try {
        const response = await api_laravel("get_article", { module_key: selected.key_query });
        const payload = unwrapArticlePayload(response);

        if (!active) {
          return;
        }

        if (payload?.st === false) {
          showAlert(false, payload?.text || "Не удалось загрузить статью модуля");
          setArticle(null);
          setDraftHtml("");
          setMode("edit");
          return;
        }

        const loadedArticle = payload?.article || null;

        setArticle(loadedArticle);
        setDraftHtml(loadedArticle?.html || "");
        setMode(loadedArticle?.html ? "view" : "edit");
      } catch {
        if (!active) {
          return;
        }

        showAlert(false, "Не удалось загрузить статью модуля");
        setArticle(null);
        setDraftHtml("");
        setMode("edit");
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
  }, [api_laravel, selected, showAlert]);

  const startEdit = () => {
    setDraftHtml(article?.html || "");
    setMode("edit");
  };

  const cancelEdit = async () => {
    const hasChanges = draftHtml !== (article?.html || "");

    if (hasChanges) {
      const accepted = await confirm({
        title: "Отменить редактирование?",
        message: "Несохранённые изменения статьи будут потеряны.",
        confirmLabel: "Отменить изменения",
        cancelLabel: "Продолжить редактирование",
        confirmTone: "danger",
      });

      if (!accepted) {
        return;
      }
    }

    setDraftHtml(article?.html || "");
    setMode("view");
  };

  const saveArticle = async () => {
    if (!selected?.key_query) {
      return;
    }

    setSaving(true);

    try {
      const response = await api_laravel("save_article", {
        module_key: selected.key_query,
        title: selected.name,
        html: draftHtml,
      });
      const payload = unwrapArticlePayload(response);

      if (payload?.st === false) {
        showAlert(false, payload?.text || "Не удалось сохранить статью");
        return;
      }

      const savedArticle = payload?.article || {
        module_key: selected.key_query,
        title: selected.name,
        html: draftHtml,
      };

      setArticle(savedArticle);
      setDraftHtml(savedArticle.html || draftHtml);
      setMode("view");
      setHistoryKey((key) => key + 1);
      showAlert(true, "Статья сохранена");
      onSaved?.();
    } catch {
      showAlert(false, "Не удалось сохранить статью");
    } finally {
      setSaving(false);
    }
  };

  const generateWithAi = async () => {
    if (!selected?.key_query) {
      return;
    }

    if (draftHtml.trim()) {
      const accepted = await confirm({
        title: "Сгенерировать текст ИИ?",
        message: "Текущий текст в редакторе будет заменён сгенерированным описанием.",
        confirmLabel: "Сгенерировать",
        cancelLabel: "Отмена",
        confirmTone: "primary",
      });

      if (!accepted) {
        return;
      }
    }

    setGenerating(true);

    try {
      const response = await api_laravel("generate_article", {
        module_key: selected.key_query,
        module_path: getModulePath(selected),
      });
      const payload = unwrapArticlePayload(response);

      if (payload?.st === false || !payload?.html) {
        showAlert(false, payload?.text || "Не удалось сгенерировать текст");
        return;
      }

      setDraftHtml(payload.html);
      showAlert(true, "Текст сгенерирован. Проверьте и сохраните статью.");
    } catch {
      showAlert(false, "Не удалось сгенерировать текст");
    } finally {
      setGenerating(false);
    }
  };

  const sectionNames = selected?.navs?.map((nav) => nav.name).filter(Boolean) ?? [];
  const hasExistingArticle = Boolean(article?.html);

  return (
    <Grid
      container
      spacing={3}
    >
      <ConfirmDialog />

      <Grid size={{ xs: 12, md: 6 }}>
        <JacoAutocomplete
          label="Модуль"
          placeholder="Поиск модуля"
          options={modules}
          value={selected}
          onChange={(_event, next) => onSelect(next)}
          groupBy={(option) => option.group}
          filterOptions={filterModuleOptions}
          selectAppearance
          noOptionsText="Модуль не найден"
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
        />
      </Grid>

      <Grid size={12}>
        <JacoSurface sx={{ p: { xs: 2, md: 3 } }}>
          {selected ? (
            <>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
              >
                <Box>
                  <Typography
                    component="h2"
                    sx={{ ...uiTypography.bodyLarge, fontWeight: 500, color: uiColors.textStrong }}
                  >
                    {selected.name}
                  </Typography>
                  <Typography sx={{ mt: 0.5, ...uiTypography.label, color: uiColors.textMuted }}>
                    {selected.group}
                  </Typography>
                  {sectionNames.length > 0 ? (
                    <Typography sx={{ mt: 1, ...uiTypography.label, color: uiColors.text }}>
                      {sectionNames.join(" · ")}
                    </Typography>
                  ) : null}
                </Box>

                {!articleLoading ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: "wrap" }}
                  >
                    {mode === "view" ? (
                      <JacoButton
                        tone="secondary"
                        compact
                        startIcon={<EditOutlinedIcon fontSize="small" />}
                        onClick={startEdit}
                      >
                        Редактировать
                      </JacoButton>
                    ) : (
                      <>
                        <JacoButton
                          tone="outlinePrimary"
                          compact
                          loading={generating}
                          startIcon={<AutoAwesomeOutlinedIcon fontSize="small" />}
                          onClick={generateWithAi}
                        >
                          Сгенерировать текст ИИ
                        </JacoButton>
                        {hasExistingArticle ? (
                          <JacoButton
                            tone="secondary"
                            compact
                            disabled={saving || generating}
                            onClick={cancelEdit}
                          >
                            Отмена
                          </JacoButton>
                        ) : null}
                        <JacoButton
                          tone="primary"
                          compact
                          loading={saving}
                          disabled={generating}
                          onClick={saveArticle}
                        >
                          Сохранить
                        </JacoButton>
                      </>
                    )}
                  </Stack>
                ) : null}
              </Stack>

              <Box sx={{ mt: 2 }}>
                {articleLoading ? (
                  <Box sx={{ py: 6, textAlign: "center", color: uiColors.textMuted }}>
                    Загрузка статьи…
                  </Box>
                ) : mode === "view" ? (
                  <DocumentationArticleContent html={article?.html} />
                ) : (
                  <DocumentationEditor
                    key={selected.id}
                    value={draftHtml}
                    height={isMobile ? 480 : 640}
                    onChange={setDraftHtml}
                    onUploadImage={uploadImage}
                  />
                )}
              </Box>
            </>
          ) : (
            <Typography sx={{ ...uiTypography.body, color: uiColors.textMuted }}>
              Выберите модуль, чтобы открыть или создать его статью.
            </Typography>
          )}
        </JacoSurface>
      </Grid>

      {selected && article?.id && !articleLoading ? (
        <Grid size={12}>
          <HistoryLog
            history={historyItems}
            title="История изменений статьи"
            restoreFunc={mode === "view" ? restoreVersion : null}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}
