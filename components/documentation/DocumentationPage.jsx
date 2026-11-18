"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import {
  JacoAlert,
  JacoBackdropLoader,
  JacoButton,
  JacoSegmentedTabs,
} from "@/design-system/shared/ui";
import useApi from "@/src/hooks/useApi";

import DocumentationEditorTab from "./DocumentationEditorTab";
import DocumentationHelpDialog from "./DocumentationHelpDialog";
import DocumentationLibraryTab from "./DocumentationLibraryTab";
import {
  buildModuleOptions,
  getDocumentationTitle,
  hasDocumentationAccess,
  unwrapDocumentationPayload,
} from "./moduleOptions";

const MODULE = "documentation";

const TABS = [
  { id: "library", label: "База знаний" },
  { id: "editor", label: "Редактор статей" },
];

export default function DocumentationPage() {
  const router = useRouter();
  const { api_laravel, api_upload } = useApi(MODULE);
  const queryAppliedRef = useRef(false);
  const editorGuardRef = useRef(null);

  const [modulesLoading, setModulesLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, status: false, text: "" });
  const [pageTitle, setPageTitle] = useState("Документирование модулей");
  const [modules, setModules] = useState([]);
  const [access, setAccess] = useState({});
  const [tab, setTab] = useState("library");
  const [editorSelected, setEditorSelected] = useState(null);
  const [editorArticleId, setEditorArticleId] = useState(null);
  const [libraryActiveId, setLibraryActiveId] = useState(null);
  const [libraryModuleKey, setLibraryModuleKey] = useState(null);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  const showAlert = useCallback((status, text) => setAlert({ open: true, status, text }), []);

  useEffect(() => {
    if (queryAppliedRef.current || !router.isReady || modulesLoading) {
      return;
    }

    queryAppliedRef.current = true;

    const moduleKey = typeof router.query.module === "string" ? router.query.module : null;
    const articleId = typeof router.query.article === "string" ? router.query.article : null;

    if (router.query.tab === "editor" && hasDocumentationAccess(access, "edit_tab_access")) {
      setEditorSelected(
        moduleKey ? modules.find((module) => module.key_query === moduleKey) || null : null,
      );
      setEditorArticleId(articleId);
      setTab("editor");
      return;
    }

    if (articleId) {
      setLibraryActiveId(articleId);
      return;
    }

    if (moduleKey) {
      setLibraryModuleKey(moduleKey);
    }
  }, [
    access,
    modules,
    modulesLoading,
    router.isReady,
    router.query.article,
    router.query.module,
    router.query.tab,
  ]);

  const openLibraryArticle = useCallback(
    (articleId) => {
      setLibraryActiveId(articleId);
      router.replace(
        { pathname: router.pathname, query: articleId ? { article: articleId } : {} },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    let active = true;

    async function loadModules() {
      setModulesLoading(true);

      try {
        const response = await api_laravel("get_all");
        const payload = unwrapDocumentationPayload(response);

        if (!active) {
          return;
        }

        if (payload?.st === false) {
          showAlert(false, payload?.text || "Не удалось загрузить список модулей");
          setModules([]);
          setAccess({});
          return;
        }

        const menu = payload?.full_menu;
        const accessSource = [payload?.access, response?.access].find(
          (value) => value && typeof value === "object" && !Array.isArray(value),
        );
        setPageTitle(getDocumentationTitle(menu));
        setModules(buildModuleOptions(menu));
        setAccess(accessSource || {});
      } catch {
        if (active) {
          showAlert(false, "Не удалось загрузить список модулей");
        }
      } finally {
        if (active) {
          setModulesLoading(false);
        }
      }
    }

    loadModules();

    return () => {
      active = false;
    };
  }, [api_laravel, showAlert]);

  const canOpenEditor = hasDocumentationAccess(access, "edit_tab_access");
  const visibleTabs = canOpenEditor ? TABS : TABS.filter((item) => item.id === "library");

  useEffect(() => {
    if (!modulesLoading && !canOpenEditor && tab !== "library") {
      setTab("library");
    }
  }, [canOpenEditor, modulesLoading, tab]);

  const openEditor = useCallback(
    async (module, articleId = null) => {
      if (!hasDocumentationAccess(access, "edit_tab_access")) {
        return;
      }

      const allowed = (await editorGuardRef.current?.()) ?? true;
      if (!allowed) {
        return;
      }

      setEditorSelected(module ?? null);
      setEditorArticleId(articleId);
      setTab("editor");
    },
    [access],
  );

  const selectEditorModule = useCallback((module) => {
    setEditorSelected(module ?? null);
    setEditorArticleId(null);
  }, []);

  const handleSaved = useCallback(() => setLibraryRefreshKey((key) => key + 1), []);

  return (
    <>
      <JacoBackdropLoader open={modulesLoading && tab === "editor"} />
      <JacoAlert
        isOpen={alert.open}
        status={alert.status}
        text={alert.text}
        onClose={() => setAlert((current) => ({ ...current, open: false }))}
      />
      <DocumentationHelpDialog
        open={helpOpen}
        tab={canOpenEditor ? tab : "library"}
        access={access}
        onClose={() => setHelpOpen(false)}
      />

      <Grid
        container
        spacing={3}
        className="container_first_child"
        sx={{ pb: 4 }}
      >
        <Grid size={12}>
          <h1>{pageTitle}</h1>
        </Grid>

        <Grid size={12}>
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ flex: "1 1 280px", maxWidth: { xs: "100%", md: 480 } }}>
              <JacoSegmentedTabs
                items={visibleTabs}
                value={canOpenEditor ? tab : "library"}
                onChange={(_event, next) => setTab(next)}
                size="compact"
              />
            </Box>
            <JacoButton
              tone="secondary"
              compact
              startIcon={<HelpOutlineRoundedIcon fontSize="small" />}
              onClick={() => setHelpOpen(true)}
            >
              Справка
            </JacoButton>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: tab === "library" ? "block" : "none" }}>
            <DocumentationLibraryTab
              api_laravel={api_laravel}
              modules={modules}
              modulesLoading={modulesLoading}
              refreshKey={libraryRefreshKey}
              showAlert={showAlert}
              activeId={libraryActiveId}
              preferredModuleKey={libraryModuleKey}
              onActiveIdChange={openLibraryArticle}
              canEdit={hasDocumentationAccess(access, "edit_base_access")}
              canDownloadPdf={hasDocumentationAccess(access, "pdf_upload_access")}
              canCreate={canOpenEditor && hasDocumentationAccess(access, "edit_tab_new_access")}
              onEdit={openEditor}
              onCreate={() => openEditor(null)}
            />
          </Box>

          {canOpenEditor ? (
            <Box sx={{ display: tab === "editor" ? "block" : "none" }}>
              <DocumentationEditorTab
                api_laravel={api_laravel}
                api_upload={api_upload}
                modules={modules}
                selected={editorSelected}
                initialArticleId={editorArticleId}
                editorGuardRef={editorGuardRef}
                access={access}
                onSelect={selectEditorModule}
                showAlert={showAlert}
                onSaved={handleSaved}
              />
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </>
  );
}
