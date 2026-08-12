import { useEffect, useMemo } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MyAlert from "@/ui/MyAlert";
import CafeReviewsContent from "./CafeReviewsContent";
import CafeReviewsPageHeader from "./CafeReviewsPageHeader";
import CafeReviewsResponsiveOverlays from "./CafeReviewsResponsiveOverlays";
import useCafeReviewsPage from "./useCafeReviewsPage";
import { blockBorder } from "./shared";

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

  return (
    <Box>
      <Backdrop
        open={page.bootstrapLoading || page.mutationLoading}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MyAlert
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
            title={page.moduleInfo?.name || "Отзывы кафе"}
            onRefresh={page.refresh}
            refreshDisabled={!page.bootstrapReady || page.contentLoading}
          />
        </Grid>

        {!page.bootstrapReady && !page.bootstrapLoading ? (
          <Grid size={12}>
            <Paper
              role="alert"
              variant="outlined"
              sx={{ p: 4, textAlign: "center", borderRadius: "12px", borderColor: blockBorder }}
            >
              <Typography sx={{ color: "error.main", mb: 1.5 }}>
                {page.bootstrapError || "Не удалось загрузить модуль"}
              </Typography>
              <Button
                variant="outlined"
                onClick={page.loadBootstrap}
                sx={{ textTransform: "none", borderRadius: "12px" }}
              >
                Повторить
              </Button>
            </Paper>
          </Grid>
        ) : hasAccess ? (
          <CafeReviewsContent
            page={page}
            isDesktop={isDesktop}
            visibleSections={visibleSections}
          />
        ) : page.bootstrapReady ? (
          <Grid size={12}>
            <Paper
              role="status"
              variant="outlined"
              sx={{ p: 4, textAlign: "center", borderRadius: "12px", borderColor: blockBorder }}
            >
              У вас нет доступа к отзывам кафе.
            </Paper>
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
