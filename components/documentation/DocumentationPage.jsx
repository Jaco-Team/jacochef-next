"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import { JacoAlert, JacoBackdropLoader, JacoSegmentedTabs } from "@/design-system/shared/ui";
import useApi from "@/src/hooks/useApi";

import DocumentationEditorTab from "./DocumentationEditorTab";
import DocumentationLibraryTab from "./DocumentationLibraryTab";
import {
  buildModuleOptions,
  getDocumentationTitle,
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

  const [modulesLoading, setModulesLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, status: false, text: "" });
  const [pageTitle, setPageTitle] = useState("Документирование модулей");
  const [modules, setModules] = useState([]);
  const [tab, setTab] = useState("library");
  const [editorSelected, setEditorSelected] = useState(null);
  const [libraryActiveKey, setLibraryActiveKey] = useState(null);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  const showAlert = useCallback((status, text) => setAlert({ open: true, status, text }), []);

  useEffect(() => {
    if (queryAppliedRef.current || !router.isReady || modulesLoading) {
      return;
    }

    queryAppliedRef.current = true;

    const moduleKey = typeof router.query.module === "string" ? router.query.module : null;

    if (!moduleKey) {
      return;
    }

    if (router.query.tab === "editor") {
      setEditorSelected(modules.find((module) => module.key_query === moduleKey) || null);
      setTab("editor");
      return;
    }

    setLibraryActiveKey(moduleKey);
  }, [modules, modulesLoading, router.isReady, router.query.module, router.query.tab]);

  const openLibraryArticle = useCallback(
    (moduleKey) => {
      setLibraryActiveKey(moduleKey);
      router.replace(
        { pathname: router.pathname, query: moduleKey ? { module: moduleKey } : {} },
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
          return;
        }

        const menu = payload?.full_menu;
        setPageTitle(getDocumentationTitle(menu));
        setModules(buildModuleOptions(menu));
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

  const openEditor = useCallback((module) => {
    setEditorSelected(module ?? null);
    setTab("editor");
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

      <Grid
        container
        spacing={3}
        className="container_first_child"
        sx={{ pb: 4 }}
      >
        <Grid size={12}>
          <h1>{pageTitle}</h1>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <JacoSegmentedTabs
            items={TABS}
            value={tab}
            onChange={(_event, next) => setTab(next)}
            size="compact"
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: tab === "library" ? "block" : "none" }}>
            <DocumentationLibraryTab
              api_laravel={api_laravel}
              modules={modules}
              modulesLoading={modulesLoading}
              refreshKey={libraryRefreshKey}
              showAlert={showAlert}
              activeKey={libraryActiveKey}
              onActiveKeyChange={openLibraryArticle}
              onEdit={openEditor}
              onCreate={() => openEditor(null)}
            />
          </Box>

          {tab === "editor" ? (
            <DocumentationEditorTab
              api_laravel={api_laravel}
              api_upload={api_upload}
              modules={modules}
              selected={editorSelected}
              onSelect={setEditorSelected}
              showAlert={showAlert}
              onSaved={handleSaved}
            />
          ) : null}
        </Grid>
      </Grid>
    </>
  );
}
