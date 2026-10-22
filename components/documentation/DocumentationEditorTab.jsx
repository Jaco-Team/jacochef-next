"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import {
  JacoAutocomplete,
  JacoButton,
  JacoSurface,
  JacoTextInput,
  uiColors,
  uiTypography,
  useJacoConfirm,
} from "@/design-system/shared/ui";
import HistoryLog from "@/ui/history/HistoryLog";

import DocumentationAccessPanel from "./DocumentationAccessPanel";
import DocumentationAiChatDialog from "./DocumentationAiChatDialog";
import DocumentationArticleContent from "./DocumentationArticleContent";
import DocumentationEditor from "./DocumentationEditor";
import DocumentationSaveAccessDialog from "./DocumentationSaveAccessDialog";
import {
  ACCESS_ERROR_TEXT,
  normalizeAccessBlocks,
  normalizeAccessOptions,
  normalizeEntityId,
  reconcileAccessBlocks,
  serializeAccessBlocks,
  syncArticleAccess,
} from "./accessBlocks";
import {
  buildHistoryLogItems,
  filterModuleOptions,
  getModulePath,
  hasDocumentationAccess,
  unwrapArticlePayload,
} from "./moduleOptions";

function sameId(left, right) {
  return left != null && right != null && String(left) === String(right);
}

export default function DocumentationEditorTab({
  api_laravel,
  api_upload,
  modules,
  selected,
  initialArticleId = null,
  editorGuardRef = null,
  access = {},
  onSelect,
  showAlert,
  onSaved,
}) {
  const canEditArticle = hasDocumentationAccess(access, "edit_tab_edit_access");
  const canCreateArticle = hasDocumentationAccess(access, "edit_tab_new_access");
  const canUseAi = hasDocumentationAccess(access, "edit_tab_ai_auto_access");
  const canUseBlocks = hasDocumentationAccess(access, "edit_tab_block_access");
  const isMobile = useMediaQuery("(max-width:600px)");
  const { confirm, ConfirmDialog } = useJacoConfirm();
  const commandRef = useRef(null);

  const [articleLoading, setArticleLoading] = useState(false);
  const [moduleArticles, setModuleArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const [mode, setMode] = useState("edit");
  const [title, setTitle] = useState("");
  const [groupName, setGroupName] = useState("");
  const [draftHtml, setDraftHtml] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [accessError, setAccessError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [positions, setPositions] = useState([]);
  const [rights, setRights] = useState([]);
  const [rightsConnected, setRightsConnected] = useState(false);
  const [articleMissing, setArticleMissing] = useState(false);
  const editing = mode === "edit" && (article?.id != null ? canEditArticle : canCreateArticle);

  const moduleKey = selected?.key_query || null;
  const historyItems = useMemo(() => buildHistoryLogItems(history), [history]);
  const groupOptions = useMemo(() => {
    const names = new Set(
      moduleArticles.map((item) => String(item?.group_name || "").trim()).filter(Boolean),
    );
    if (groupName.trim()) {
      names.add(groupName.trim());
    }
    return [...names].sort((left, right) => left.localeCompare(right, "ru"));
  }, [groupName, moduleArticles]);
  const selectedArticleOption = useMemo(() => {
    if (article?.id == null) {
      return null;
    }

    return (
      moduleArticles.find((item) => sameId(item.id, article.id)) || {
        id: article.id,
        title: article.title || title || "Статья",
        group_name: article.group_name || groupName || "",
      }
    );
  }, [article, groupName, moduleArticles, title]);

  const applyArticle = useCallback((next) => {
    const synced = syncArticleAccess(next?.html || "", next?.access_blocks);
    setArticle(next ? { ...next, html: synced.html, access_blocks: synced.blocks } : null);
    setTitle(next?.title || "");
    setGroupName(next?.group_name || "");
    setDraftHtml(synced.html);
    setBlocks(synced.blocks);
    setActiveBlockId(null);
    setAccessError("");
    setArticleMissing(false);
    setMode(synced.html ? "view" : "edit");
  }, []);

  const startBlank = useCallback(() => {
    setArticle(null);
    setTitle("");
    setGroupName("");
    setDraftHtml("");
    setBlocks([]);
    setActiveBlockId(null);
    setAccessError("");
    setArticleMissing(false);
    setMode("edit");
  }, []);

  const markArticleMissing = useCallback(() => {
    setArticle(null);
    setTitle("");
    setGroupName("");
    setDraftHtml("");
    setBlocks([]);
    setActiveBlockId(null);
    setAccessError("");
    setArticleMissing(true);
    setMode("view");
  }, []);

  const isDirty = useCallback(() => {
    const baseBlocks = JSON.stringify(
      serializeAccessBlocks(normalizeAccessBlocks(article?.access_blocks)),
    );
    const currentBlocks = JSON.stringify(serializeAccessBlocks(blocks));

    return (
      title !== (article?.title || "") ||
      groupName !== (article?.group_name || "") ||
      draftHtml !== (article?.html || "") ||
      currentBlocks !== baseBlocks
    );
  }, [article, blocks, draftHtml, groupName, title]);

  const searchUsers = useCallback(
    async (query) => {
      try {
        const response = await api_laravel("search_access_users", { query: query || "" });
        const payload = unwrapArticlePayload(response);
        if (payload?.st === false) {
          return [];
        }
        return normalizeAccessOptions(payload?.users);
      } catch {
        return [];
      }
    },
    [api_laravel],
  );

  const loadArticleById = useCallback(
    async (articleId, moduleKeyFallback = moduleKey) => {
      const request =
        articleId != null && articleId !== ""
          ? { article_id: normalizeEntityId(articleId) }
          : { module_key: moduleKeyFallback };
      const response = await api_laravel("get_article", request);
      const payload = unwrapArticlePayload(response);

      if (payload?.st === false || !payload?.article) {
        showAlert(false, payload?.text || "Статья не найдена");
        return false;
      }

      applyArticle(payload.article);
      return true;
    },
    [api_laravel, applyArticle, moduleKey, showAlert],
  );

  useEffect(() => {
    setAiChatOpen(false);
  }, [moduleKey]);

  useEffect(() => {
    if (!editing) {
      setAiChatOpen(false);
    }
  }, [editing]);

  useEffect(() => {
    let active = true;

    async function loadDirectories() {
      if (!moduleKey) {
        setPositions([]);
        setRights([]);
        setRightsConnected(false);
        return;
      }

      try {
        const response = await api_laravel("get_access_directories", { module_key: moduleKey });
        const payload = unwrapArticlePayload(response);

        if (!active) {
          return;
        }

        if (payload?.st === false) {
          setPositions([]);
          setRights([]);
          setRightsConnected(false);
          return;
        }

        setPositions(normalizeAccessOptions(payload?.positions));
        setRights(normalizeAccessOptions(payload?.rights));
        setRightsConnected(payload?.rights_connected === true);
      } catch {
        if (active) {
          setRights([]);
          setRightsConnected(false);
        }
      }
    }

    loadDirectories();

    return () => {
      active = false;
    };
  }, [api_laravel, moduleKey]);

  useEffect(() => {
    let active = true;

    async function loadModule() {
      if (!moduleKey) {
        setModuleArticles([]);
        startBlank();
        return;
      }

      setArticleLoading(true);

      try {
        let articles = [];
        let listLoaded = false;

        try {
          const listResponse = await api_laravel("get_module_articles", { module_key: moduleKey });
          const listPayload = unwrapArticlePayload(listResponse);

          if (!active) {
            return;
          }

          if (listPayload?.st !== false && Array.isArray(listPayload?.articles)) {
            articles = listPayload.articles;
            listLoaded = true;
          }
        } catch {
          listLoaded = false;
        }

        if (!active) {
          return;
        }

        if (!listLoaded) {
          const singleResponse = await api_laravel("get_article", { module_key: moduleKey });
          const singlePayload = unwrapArticlePayload(singleResponse);

          if (!active) {
            return;
          }

          if (singlePayload?.article) {
            applyArticle(singlePayload.article);
            setModuleArticles([singlePayload.article]);
            return;
          }
        }

        setModuleArticles(articles);

        const requested = articles.find((item) => sameId(item.id, initialArticleId));
        let loaded = false;
        if (requested?.id != null) {
          loaded = await loadArticleById(requested.id, moduleKey);
        } else if (initialArticleId) {
          loaded = await loadArticleById(initialArticleId, moduleKey);
        } else if (articles[0]?.id != null) {
          loaded = await loadArticleById(articles[0].id, moduleKey);
        } else if (active) {
          startBlank();
          return;
        }

        if (active && !loaded) {
          markArticleMissing();
        }
      } catch {
        if (active) {
          showAlert(false, "Не удалось загрузить статьи модуля");
          setModuleArticles([]);
          startBlank();
        }
      } finally {
        if (active) {
          setArticleLoading(false);
        }
      }
    }

    loadModule();

    return () => {
      active = false;
    };
  }, [
    api_laravel,
    applyArticle,
    initialArticleId,
    loadArticleById,
    markArticleMissing,
    moduleKey,
    showAlert,
    startBlank,
  ]);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      if (!moduleKey || article?.id == null) {
        setHistory([]);
        return;
      }

      try {
        const response = await api_laravel("get_article_history", {
          article_id: normalizeEntityId(article.id),
          module_key: moduleKey,
        });
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
      const response = await api_upload("upload_image", file, {
        module_key: moduleKey,
        article_id: article?.id != null ? normalizeEntityId(article.id) : null,
      });
      const payload = unwrapArticlePayload(response);

      if (payload?.st === false || !payload?.url) {
        throw new Error(payload?.text || "Не удалось загрузить изображение");
      }

      return payload.url;
    },
    [api_upload, article?.id, moduleKey],
  );

  const handleHtmlChange = (html) => {
    setAccessError("");
    setDraftHtml(html);
    setBlocks((current) => reconcileAccessBlocks(current, html));
  };

  const confirmDiscard = async (message) => {
    if (!isDirty()) {
      return true;
    }

    return confirm({
      title: "Сменить статью?",
      message,
      confirmLabel: "Сменить",
      cancelLabel: "Остаться",
      confirmTone: "danger",
    });
  };

  useEffect(() => {
    if (!editorGuardRef) {
      return undefined;
    }

    editorGuardRef.current = () =>
      confirmDiscard("Несохранённые изменения текущей статьи будут потеряны.");

    return () => {
      editorGuardRef.current = null;
    };
  });

  const selectModuleArticle = async (_event, option) => {
    if (!option) {
      return;
    }

    if (sameId(option.id, article?.id)) {
      return;
    }

    const accepted = await confirmDiscard("Несохранённые изменения текущей статьи будут потеряны.");
    if (!accepted) {
      return;
    }

    setArticleLoading(true);
    try {
      await loadArticleById(option.id);
    } catch {
      showAlert(false, "Не удалось загрузить статью");
    } finally {
      setArticleLoading(false);
    }
  };

  const startNewArticle = async () => {
    if (!canCreateArticle) {
      return;
    }

    const accepted = await confirmDiscard("Несохранённые изменения текущей статьи будут потеряны.");
    if (!accepted) {
      return;
    }

    startBlank();
  };

  const restoreVersion = useCallback(
    async (item) => {
      if (!moduleKey || item?.id == null || article?.id == null) {
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
          article_id: normalizeEntityId(article.id),
          module_key: moduleKey,
          version_id: item.id,
        });
        const payload = unwrapArticlePayload(response);

        if (payload?.st === false || !payload?.article) {
          showAlert(false, payload?.text || "Не удалось восстановить версию");
          return;
        }

        applyArticle(payload.article);
        setHistoryKey((key) => key + 1);
        showAlert(true, "Версия восстановлена");
        onSaved?.();
      } catch {
        showAlert(false, "Не удалось восстановить версию");
      }
    },
    [api_laravel, applyArticle, article?.id, confirm, moduleKey, onSaved, showAlert],
  );

  const startEdit = () => {
    if (!canEditArticle) {
      return;
    }

    setDraftHtml(article?.html || "");
    setBlocks(normalizeAccessBlocks(article?.access_blocks));
    setMode("edit");
  };

  const cancelEdit = async () => {
    if (isDirty()) {
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

    applyArticle(article);
  };

  const requestSave = () => {
    if (!moduleKey) {
      return;
    }

    if (!title.trim()) {
      showAlert(false, "Укажите название статьи");
      return;
    }

    setBlocks((current) => reconcileAccessBlocks(current, draftHtml));
    setSaveOpen(true);
  };

  const saveArticle = async () => {
    if (!moduleKey) {
      return;
    }

    const nextBlocks = reconcileAccessBlocks(blocks, draftHtml);
    setSaving(true);

    try {
      const response = await api_laravel("save_article", {
        id: article?.id != null ? normalizeEntityId(article.id) : null,
        module_key: moduleKey,
        title: title.trim(),
        group_name: groupName.trim(),
        html: draftHtml,
        access_blocks: serializeAccessBlocks(nextBlocks),
      });
      const payload = unwrapArticlePayload(response);

      if (payload?.st === false) {
        showAlert(false, payload?.text || "Не удалось сохранить статью");
        return;
      }

      const savedArticle = payload?.article || {
        id: article?.id ?? null,
        module_key: moduleKey,
        title: title.trim(),
        group_name: groupName.trim(),
        html: draftHtml,
        access_blocks: nextBlocks,
      };
      const synced = syncArticleAccess(
        savedArticle.html || draftHtml,
        Array.isArray(savedArticle.access_blocks) ? savedArticle.access_blocks : nextBlocks,
      );

      applyArticle({
        ...savedArticle,
        title: savedArticle.title || title.trim(),
        group_name: savedArticle.group_name ?? groupName.trim(),
        html: synced.html,
        access_blocks: synced.blocks,
      });
      setModuleArticles((current) => {
        const nextItem = {
          id: savedArticle.id,
          title: savedArticle.title || title.trim(),
          group_name: savedArticle.group_name || groupName.trim(),
          module_key: moduleKey,
        };
        const index = current.findIndex((item) => sameId(item.id, savedArticle.id));
        if (index === -1) {
          return savedArticle.id == null ? current : [...current, nextItem];
        }
        return current.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...nextItem } : item,
        );
      });
      setSaveOpen(false);
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
    if (!canUseAi || !moduleKey) {
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
        module_key: moduleKey,
        module_path: getModulePath(selected),
      });
      const payload = unwrapArticlePayload(response);

      if (payload?.st === false || !payload?.html) {
        showAlert(false, payload?.text || "Не удалось сгенерировать текст");
        return;
      }

      handleHtmlChange(payload.html);
      showAlert(true, "Текст сгенерирован. Проверьте и сохраните статью.");
    } catch {
      showAlert(false, "Не удалось сгенерировать текст");
    } finally {
      setGenerating(false);
    }
  };

  const deleteBlock = async (block) => {
    const accepted = await confirm({
      title: "Убрать ограничение?",
      message: "Текст фрагмента останется в статье, ограничение доступа будет снято.",
      confirmLabel: "Убрать",
      cancelLabel: "Отмена",
      confirmTone: "danger",
    });

    if (!accepted) {
      return;
    }

    const html = commandRef.current?.remove(block.id);
    if (typeof html === "string") {
      handleHtmlChange(html);
    } else {
      setBlocks((current) => current.filter((item) => item.id !== block.id));
    }

    if (activeBlockId === block.id) {
      setActiveBlockId(null);
    }
  };

  const updateBlock = (id, patch) => {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    );
  };

  const sectionNames = selected?.navs?.map((nav) => nav.name).filter(Boolean) ?? [];
  const hasExistingArticle = Boolean(article?.html);
  const articleHtml = article?.html || draftHtml;
  const restrictionLabel = articleMissing
    ? ""
    : blocks.length
      ? `Ограничения: ${blocks.filter((block) => block.users.length || block.positions.length || block.rights.length).length} из ${blocks.length}`
      : String(articleHtml).includes("doc-access-hidden")
        ? "Часть статьи скрыта ограничениями доступа"
        : "Ограничения доступа не заданы";

  return (
    <Grid
      container
      spacing={3}
    >
      <ConfirmDialog />
      <DocumentationSaveAccessDialog
        open={saveOpen}
        blocks={blocks}
        saving={saving}
        onClose={() => setSaveOpen(false)}
        onConfirm={saveArticle}
      />
      {canUseAi ? (
        <DocumentationAiChatDialog
          key={moduleKey || "documentation-ai-chat"}
          open={aiChatOpen}
          moduleKey={moduleKey}
          moduleName={selected?.name || ""}
          api_laravel={api_laravel}
          onClose={() => setAiChatOpen(false)}
          showAlert={showAlert}
        />
      ) : null}

      <Grid size={{ xs: 12, md: 6 }}>
        <JacoAutocomplete
          label="Модуль"
          placeholder="Поиск модуля"
          options={modules}
          value={selected}
          onChange={async (_event, next) => {
            if (String(next?.id ?? "") === String(selected?.id ?? "")) {
              return;
            }

            const accepted = await confirmDiscard(
              "Несохранённые изменения текущей статьи будут потеряны.",
            );
            if (!accepted) {
              return;
            }

            onSelect(next);
          }}
          groupBy={(option) => option.group}
          filterOptions={filterModuleOptions}
          selectAppearance
          noOptionsText="Модуль не найден"
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <JacoAutocomplete
          label="Статья модуля"
          placeholder={moduleKey ? "Выберите статью" : "Сначала выберите модуль"}
          options={moduleArticles}
          value={selectedArticleOption}
          disabled={!moduleKey || articleLoading}
          groupBy={(option) => option.group_name || "Без группы"}
          getOptionLabel={(option) => option?.title || ""}
          onChange={selectModuleArticle}
          selectAppearance
          noOptionsText="В модуле пока нет статей"
          isOptionEqualToValue={(option, value) => sameId(option?.id, value?.id)}
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
                    {title.trim() || selected.name}
                  </Typography>
                  <Typography sx={{ mt: 0.5, ...uiTypography.label, color: uiColors.textMuted }}>
                    {[selected.group, groupName.trim() || "Без группы"].join(" · ")}
                  </Typography>
                  {sectionNames.length > 0 ? (
                    <Typography sx={{ mt: 1, ...uiTypography.label, color: uiColors.text }}>
                      {sectionNames.join(" · ")}
                    </Typography>
                  ) : null}
                  {!articleLoading && restrictionLabel ? (
                    <Typography sx={{ mt: 1, ...uiTypography.label, color: uiColors.textMuted }}>
                      {restrictionLabel}
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
                    {canCreateArticle ? (
                      <JacoButton
                        tone="secondary"
                        compact
                        startIcon={<NoteAddOutlinedIcon fontSize="small" />}
                        onClick={startNewArticle}
                      >
                        Новая статья
                      </JacoButton>
                    ) : null}
                    {!editing ? (
                      canEditArticle ? (
                        <JacoButton
                          tone="secondary"
                          compact
                          startIcon={<EditOutlinedIcon fontSize="small" />}
                          onClick={startEdit}
                        >
                          Редактировать
                        </JacoButton>
                      ) : null
                    ) : (
                      <>
                        {canUseAi ? (
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
                            <JacoButton
                              tone="outlinePrimary"
                              compact
                              startIcon={<ChatOutlinedIcon fontSize="small" />}
                              onClick={() => {
                                if (!moduleKey) {
                                  return;
                                }

                                setAiChatOpen(true);
                              }}
                            >
                              Помощь от ИИ
                            </JacoButton>
                          </>
                        ) : null}
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
                          onClick={requestSave}
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
                ) : articleMissing ? (
                  <Typography sx={{ ...uiTypography.body, color: uiColors.textMuted }}>
                    Статья не найдена.
                  </Typography>
                ) : !editing ? (
                  <DocumentationArticleContent html={article?.html} />
                ) : (
                  <>
                    <Grid
                      container
                      spacing={2}
                      sx={{ mb: 2 }}
                    >
                      <Grid size={{ xs: 12, md: 7 }}>
                        <JacoTextInput
                          label="Название статьи"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <JacoAutocomplete
                          freeSolo
                          clearOnBlur={false}
                          label="Группа статей"
                          placeholder="Новая или существующая группа"
                          options={groupOptions}
                          value={groupName || null}
                          onChange={(_event, value) =>
                            setGroupName(typeof value === "string" ? value : "")
                          }
                          onInputChange={(_event, value, reason) => {
                            if (reason === "input" || reason === "clear" || reason === "reset") {
                              setGroupName(value);
                            }
                          }}
                          selectAppearance
                          noOptionsText="Введите название группы"
                        />
                      </Grid>
                    </Grid>

                    <Grid
                      container
                      spacing={2}
                    >
                      <Grid size={{ xs: 12, lg: canUseBlocks ? 8 : 12 }}>
                        {canUseBlocks && accessError ? (
                          <Typography
                            sx={{ mb: 1, ...uiTypography.label, color: uiColors.primary }}
                          >
                            {ACCESS_ERROR_TEXT[accessError] || accessError}
                          </Typography>
                        ) : canUseBlocks && activeBlockId ? (
                          <Typography
                            sx={{ mb: 1, ...uiTypography.label, color: uiColors.textMuted }}
                          >
                            Выбран блок доступа. Нажмите «Снять ограничение» в панели редактора,
                            чтобы убрать розовую рамку. Текст останется.
                          </Typography>
                        ) : null}
                        <DocumentationEditor
                          key={`${selected.id}-${article?.id || "new"}-${canUseBlocks ? 1 : 0}`}
                          value={draftHtml}
                          height={isMobile ? 480 : 640}
                          accessBlocksEnabled={canUseBlocks}
                          activeBlockId={activeBlockId}
                          commandRef={commandRef}
                          onChange={handleHtmlChange}
                          onUploadImage={uploadImage}
                          onAccessError={setAccessError}
                          onAccessCreated={(id) => {
                            setAccessError("");
                            setActiveBlockId(id);
                          }}
                          onAccessRemoved={(result) => {
                            setAccessError("");
                            if (typeof result?.html === "string") {
                              handleHtmlChange(result.html);
                            }
                            setActiveBlockId(null);
                          }}
                          onActivateBlock={setActiveBlockId}
                        />
                      </Grid>
                      {canUseBlocks ? (
                        <Grid
                          size={{ xs: 12, lg: 4 }}
                          sx={{ height: "max-content" }}
                        >
                          <DocumentationAccessPanel
                            blocks={blocks}
                            html={draftHtml}
                            activeId={activeBlockId}
                            positions={positions}
                            rights={rights}
                            rightsConnected={rightsConnected}
                            searchUsers={searchUsers}
                            onSelect={(id) => {
                              setActiveBlockId(id);
                              commandRef.current?.focus(id);
                            }}
                            onChange={updateBlock}
                            onDelete={deleteBlock}
                          />
                        </Grid>
                      ) : null}
                    </Grid>
                  </>
                )}
              </Box>
            </>
          ) : (
            <Typography sx={{ ...uiTypography.body, color: uiColors.textMuted }}>
              Выберите модуль, чтобы открыть или создать его статьи.
            </Typography>
          )}
        </JacoSurface>
      </Grid>

      {selected && article?.id != null && !articleLoading ? (
        <Grid size={12}>
          <HistoryLog
            history={historyItems}
            title="История изменений статьи"
            restoreFunc={!editing && canEditArticle ? restoreVersion : null}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}
