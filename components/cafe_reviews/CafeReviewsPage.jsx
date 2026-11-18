import { useEffect, useMemo } from "react";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import {
  JacoAlert,
  JacoBackdropLoader,
  JacoButton,
  JacoSurface,
  uiColors,
} from "@/design-system/shared/ui";
import CafeReviewsContent from "./CafeReviewsContent";
import CafeReviewsPageHeader from "./CafeReviewsPageHeader";
import CafeReviewsResponsiveOverlays from "./CafeReviewsResponsiveOverlays";
import useCafeReviewsPage from "./useCafeReviewsPage";

const sections = [
  { value: "overview", label: "Обзор", accessKey: "reviews" },
  { value: "incidents", label: "Инциденты", accessKey: "incidents" },
  { value: "reviews", label: "Все отзывы", accessKey: "reviews" },
  { value: "links", label: "QR-ссылки", accessKey: "links" },
];

export default function CafeReviewsPage() {
  const page = useCafeReviewsPage();
  const isMobile = useMediaQuery("(max-width: 667px)", { noSsr: true });
  const isTablet = useMediaQuery("(min-width: 668px) and (max-width: 990px)", { noSsr: true });
  const isDesktop = useMediaQuery("(min-width: 991px)", { noSsr: true });

  const visibleSections = useMemo(
    () => sections.filter((section) => page.canView(section.accessKey)),
    [page.canView],
  );

  useEffect(() => {
    document.title = page.moduleInfo?.name || "Отзывы кафе";
  }, [page.moduleInfo?.name]);
  const hasAccess = visibleSections.length > 0;
  const showFilters = page.section !== "links";
  const singlePointTitle =
    page.points.length === 1
      ? `${page.moduleInfo?.name || "Отзывы кафе"} — ${page.points[0].name}`
      : page.moduleInfo?.name || "Отзывы кафе";

  return (
    <Box>
      <JacoBackdropLoader
        open={
          page.bootstrapLoading || page.contentLoading || page.detailLoading || page.mutationLoading
        }
        sx={{ color: uiColors.surface }}
      />
      <JacoAlert
        isOpen={page.isAlert}
        onClose={page.closeAlert}
        status={page.alertStatus}
        text={page.alertMessage}
      />

      <Grid
        container
        spacing={2.5}
        className="container_first_child"
      >
        <Grid size={12}>
          <CafeReviewsPageHeader
            title={singlePointTitle}
            onRefresh={page.refresh}
            refreshDisabled={!page.bootstrapReady || page.contentLoading}
            autoRefreshEnabled={page.autoRefreshEnabled}
            onToggleAutoRefresh={page.toggleAutoRefresh}
          />
        </Grid>

        {!page.bootstrapReady && !page.bootstrapLoading ? (
          <Grid size={12}>
            <JacoSurface
              role="alert"
              sx={{ p: 4, textAlign: "center" }}
            >
              <Typography sx={{ color: uiColors.danger, mb: 1.5 }}>
                {page.bootstrapError || "Не удалось загрузить модуль"}
              </Typography>
              <JacoButton
                tone="outlinePrimary"
                onClick={page.loadBootstrap}
              >
                Повторить
              </JacoButton>
            </JacoSurface>
          </Grid>
        ) : hasAccess ? (
          <CafeReviewsContent
            page={page}
            isDesktop={isDesktop}
            visibleSections={visibleSections}
          />
        ) : page.bootstrapReady ? (
          <Grid size={12}>
            <JacoSurface
              role="status"
              sx={{ p: 4, textAlign: "center", color: uiColors.text }}
            >
              У вас нет доступа к отзывам кафе.
            </JacoSurface>
          </Grid>
        ) : null}
      </Grid>

      <CafeReviewsResponsiveOverlays
        page={page}
        isMobile={isMobile}
        isTablet={isTablet}
        showFilters={showFilters}
      />
    </Box>
  );
}
