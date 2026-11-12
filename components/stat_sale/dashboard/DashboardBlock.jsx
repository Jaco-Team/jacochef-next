import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import { JacoSurface, uiColors } from "@/design-system/shared/ui";

/** Блок дашборда: заголовок, подзаголовок, действия справа, собственная загрузка и ошибка. */
export default function DashboardBlock({
  title,
  subtitle,
  actions,
  loading = false,
  error = "",
  hasData = true,
  minHeight = 240,
  children,
  sx,
}) {
  return (
    <JacoSurface
      sx={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        boxSizing: "border-box",
        p: { xs: 2, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      {loading && hasData ? (
        <LinearProgress
          sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3 }}
          color="error"
        />
      ) : null}

      {title || actions ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title ? (
              <Typography
                component="h2"
                sx={{ fontSize: 18, lineHeight: 1.3, fontWeight: 600, color: uiColors.textStrong }}
              >
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography component="div" sx={{ mt: 0.5, fontSize: 13, lineHeight: 1.4, color: uiColors.text }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {actions}
        </Box>
      ) : null}

      <Box
        sx={{
          mt: title || actions ? 2 : 0,
          flex: 1,
          minHeight,
          opacity: loading && hasData ? 0.55 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {!hasData && loading ? (
          <Skeleton
            variant="rounded"
            height={minHeight}
          />
        ) : null}
        {!hasData && !loading ? (
          <Box
            sx={{
              minHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: uiColors.text,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error || "Нет данных за выбранный период"}
          </Box>
        ) : null}
        {hasData ? children : null}
      </Box>
    </JacoSurface>
  );
}
