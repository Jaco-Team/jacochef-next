export const REVIZION_ANALYSIS_THEME_EVENT = "revizion-analysis-theme-change";
export const REVIZION_ANALYSIS_THEME_STORAGE_KEY = "revizion-analysis-theme";

export function getRevizionAnalysisTheme() {
  if (typeof window === "undefined") return "dark";

  return localStorage.getItem(REVIZION_ANALYSIS_THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

export function setRevizionAnalysisTheme(mode) {
  if (typeof window === "undefined") return;

  const nextMode = mode === "light" ? "light" : "dark";
  localStorage.setItem(REVIZION_ANALYSIS_THEME_STORAGE_KEY, nextMode);
  document.documentElement.dataset.revizionAnalysisTheme = nextMode;
  window.dispatchEvent(new CustomEvent(REVIZION_ANALYSIS_THEME_EVENT, { detail: nextMode }));
}
