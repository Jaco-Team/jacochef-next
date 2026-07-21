import Link from "next/link";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

const tabs = [
  { value: "revisions", label: "Ревизии", href: "/revizion" },
  {
    value: "analysis",
    label: "Сверка ревизий",
    href: "/revizion/analysis",
    permission: "analysis",
  },
  {
    value: "analysis-v2",
    label: "Анализ ревизий",
    href: "/revizion/analysis-v2",
    permission: "analysisV2",
  },
];

export default function RevisionPageTabs({
  value,
  analysisAccess,
  analysisV2Access,
  themeMode = null,
}) {
  const isDark = themeMode === "dark";
  const isThemed = themeMode === "dark" || themeMode === "light";

  return (
    <Tabs
      value={value}
      variant="scrollable"
      scrollButtons="auto"
      sx={
        isThemed
          ? {
              "& .MuiTab-root": {
                color: isDark ? "#B0ADA4" : "#616161",
              },
              "& .MuiTab-root:hover": {
                color: isDark ? "#F5F4EE" : "#c03",
              },
              "& .Mui-selected": {
                color: `${isDark ? "#A2A9B8" : "#c03"} !important`,
              },
              "& .MuiTabs-indicator": {
                bgcolor: isDark ? "#A2A9B8" : "#c03",
              },
            }
          : undefined
      }
    >
      {tabs
        .filter(
          (tab) =>
            !tab.permission ||
            (tab.permission === "analysis" && analysisAccess) ||
            (tab.permission === "analysisV2" && analysisV2Access),
        )
        .map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            component={Link}
            href={tab.href}
          />
        ))}
    </Tabs>
  );
}
