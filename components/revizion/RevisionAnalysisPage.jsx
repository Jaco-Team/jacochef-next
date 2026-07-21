import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import GlobalStyles from "@mui/material/GlobalStyles";
import Grid from "@mui/material/Grid";

import RevisionAnalysisTab from "@/components/revizion/RevisionAnalysisTab";
import RevisionAnalysisV2Tab, { ptSans } from "@/components/revizion/RevisionAnalysisV2Tab";
import RevisionPageTabs from "@/components/revizion/RevisionPageTabs";
import { api_laravel } from "@/src/api_new";
import handleUserAccess from "@/src/helpers/access/handleUserAccess";
import {
  getRevizionAnalysisTheme,
  REVIZION_ANALYSIS_THEME_EVENT,
} from "@/src/revizionAnalysisTheme";

const getResponseData = (response) => response?.data ?? response;

export default function RevisionAnalysisPage({ version }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(null);
  const [analysisAccess, setAnalysisAccess] = useState(false);
  const [analysisV2Access, setAnalysisV2Access] = useState(false);
  const [themeMode, setThemeMode] = useState("dark");
  const isV2 = version === "v2";

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await api_laravel("revizion", "get_analysis_filters");
      const data = getResponseData(response);
      if (!active) return;

      const access = handleUserAccess(data?.access);
      const canViewAnalysis = access.userCan("view", "analysis");
      const canViewAnalysisV2 = access.userCan("view", "analysis_v2");
      const canView = isV2 ? canViewAnalysisV2 : canViewAnalysis;
      if (!canView) {
        router.replace("/revizion");
        return;
      }

      setAnalysisAccess(canViewAnalysis);
      setAnalysisV2Access(canViewAnalysisV2);
      setFilters(data);
      setLoading(false);
      document.title = data?.module_info?.name || "Ревизия";
    }

    load();
    return () => {
      active = false;
    };
  }, [isV2, router]);

  useEffect(() => {
    if (!isV2) return undefined;

    const currentTheme = getRevizionAnalysisTheme();
    setThemeMode(currentTheme);
    document.documentElement.dataset.revizionAnalysisTheme = currentTheme;

    const handleThemeChange = (event) => {
      setThemeMode(event.detail === "light" ? "light" : "dark");
    };
    window.addEventListener(REVIZION_ANALYSIS_THEME_EVENT, handleThemeChange);

    return () => {
      window.removeEventListener(REVIZION_ANALYSIS_THEME_EVENT, handleThemeChange);
      delete document.documentElement.dataset.revizionAnalysisTheme;
    };
  }, [isV2]);

  const isDark = themeMode === "dark";

  return (
    <>
      {isV2 ? (
        <GlobalStyles
          styles={{
            body: {
              minHeight: "100vh",
              color: isDark ? "#F5F4EE" : "#212121",
              background: isDark
                ? "radial-gradient(1100px 600px at 12% 6%, rgba(72,68,62,.5), transparent 60%), radial-gradient(960px 560px at 90% 14%, rgba(52,49,45,.55), transparent 60%), linear-gradient(160deg, #2b2a27, #201f1d)"
                : "#fafafa",
              backgroundAttachment: "fixed",
            },
          }}
        />
      ) : null}
      <Backdrop
        open={loading}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: isV2 ? (isDark ? "#F5F4EE" : "#212121") : undefined,
          bgcolor: isV2 ? (isDark ? "rgba(32,31,29,.72)" : "rgba(250,250,250,.72)") : undefined,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {!loading && filters ? (
        <Grid
          container
          spacing={3}
          className="container_first_child"
          sx={
            isV2
              ? {
                  color: isDark ? "#F5F4EE" : "#212121",
                  fontFamily: ptSans.style.fontFamily,
                }
              : undefined
          }
        >
          <Grid size={12}>
            <h1>{filters?.module_info?.name || "Ревизия"}</h1>
          </Grid>
          <Grid size={12}>
            <RevisionPageTabs
              value={version === "v2" ? "analysis-v2" : "analysis"}
              analysisAccess={analysisAccess}
              analysisV2Access={analysisV2Access}
              themeMode={isV2 ? themeMode : null}
            />
          </Grid>
          <Grid size={12}>
            {version === "v2" ? (
              <RevisionAnalysisV2Tab
                initialData={filters}
                themeMode={themeMode}
              />
            ) : (
              <RevisionAnalysisTab initialData={filters} />
            )}
          </Grid>
        </Grid>
      ) : null}
    </>
  );
}
