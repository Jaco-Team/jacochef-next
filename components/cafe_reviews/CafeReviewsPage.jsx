import { useEffect, useMemo } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  SwipeableDrawer,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import MyAlert from "@/ui/MyAlert";
import CafeReviewsFilters from "./CafeReviewsFilters";
import CafeReviewsList from "./CafeReviewsList";
import CafeReviewsOverview from "./CafeReviewsOverview";
import CafeReviewDetail from "./CafeReviewDetail";
import useCafeReviewsPage from "./useCafeReviewsPage";
import {
  blockBackground,
  blockBorder,
  desktopOnlySx,
  mobileOnlySx,
  tabletOnlySx,
  textSecondary,
} from "./shared";

const sections = [
  { value: "overview", label: "Обзор", accessKey: "reviews" },
  { value: "incidents", label: "Инциденты", accessKey: "incidents" },
  { value: "reviews", label: "Все отзывы", accessKey: "reviews" },
];

function DrawerHandle() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 48,
        height: 5,
        borderRadius: 999,
        bgcolor: "#C7C7C7",
        mx: "auto",
        mt: 1,
        mb: 1.5,
      }}
    />
  );
}

function FilterSurface({ page, idPrefix, compact = false }) {
  const isIncidentSection = page.section === "incidents";
  const sectionDictionaries = {
    ...page.dictionaries,
    statuses: isIncidentSection
      ? page.dictionaries.incident_statuses
      : page.dictionaries.review_statuses,
  };

  return (
    <CafeReviewsFilters
      filters={page.activeDraftFilters}
      cities={page.cities}
      points={page.filteredPoints}
      dictionaries={sectionDictionaries}
      onChange={page.updateDraftFilter}
      onApply={page.applyFilters}
      onReset={page.resetFilters}
      idPrefix={idPrefix}
      compact={compact}
    />
  );
}

function DetailContent({ page, idPrefix, showClose = false }) {
  const kind = page.selected?.kind || (page.section === "incidents" ? "incident" : "review");
  const safeDetail = page.detail
    ? {
        ...page.detail,
        photos: page.canView("photos") ? page.detail.photos || [] : [],
        ai_analysis: page.canView("ai") ? page.detail.ai_analysis : null,
      }
    : null;

  return (
    <CafeReviewDetail
      kind={kind}
      detail={safeDetail}
      loading={page.detailLoading}
      dictionaries={page.dictionaries}
      canEdit={page.canEdit("incidents")}
      canViewAi={page.canView("ai")}
      canDecideAi={page.canEdit("incidents") && page.canAccess("ai")}
      canOpenIncident={page.canView("incidents")}
      getPhoto={page.getPhoto}
      onUpdateIncident={page.updateIncident}
      onDecideAi={page.decideAi}
      onOpenIncident={(id) => page.openDetail("incident", id)}
      onClose={page.closeDetail}
      error={page.detailError}
      onRetry={page.retryDetail}
      idPrefix={idPrefix}
      showClose={showClose}
    />
  );
}

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

  const listKind = page.section === "incidents" ? "incident" : "review";
  const listItems = listKind === "incident" ? page.incidents : page.reviews;
  const hasAccess = visibleSections.length > 0;

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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
              flexDirection: "column",
              "@media (min-width: 668px)": {
                alignItems: "center",
                flexDirection: "row",
              },
            }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: 28,
                  "@media (min-width: 668px)": { fontSize: 32 },
                  fontWeight: 700,
                }}
              >
                {page.moduleInfo?.name || "Отзывы кафе"}
              </Typography>
              <Typography sx={{ color: textSecondary, mt: 0.5 }}>
                Контроль обратной связи и работа с инцидентами
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={page.refresh}
              disabled={!page.bootstrapReady || page.contentLoading}
              sx={{ minHeight: 40, borderRadius: "12px", textTransform: "none" }}
            >
              Обновить
            </Button>
          </Box>
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
          <>
            <Grid size={12}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: "12px", borderColor: blockBorder, overflow: "hidden" }}
              >
                <Tabs
                  value={page.section}
                  onChange={(_, value) => page.setSection(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="Разделы отзывов кафе"
                  sx={{
                    "& .MuiTab-root": {
                      minHeight: 48,
                      textTransform: "none",
                      fontWeight: 700,
                    },
                  }}
                >
                  {visibleSections.map((section) => (
                    <Tab
                      key={section.value}
                      value={section.value}
                      label={section.label}
                    />
                  ))}
                </Tabs>
              </Paper>
            </Grid>

            <Grid
              size={12}
              sx={desktopOnlySx}
            >
              <Paper
                component="section"
                aria-label="Фильтры"
                sx={{ p: 2, borderRadius: "12px", bgcolor: blockBackground, boxShadow: "none" }}
              >
                <FilterSurface
                  page={page}
                  idPrefix="cafe-reviews-filters-desktop"
                />
              </Paper>
            </Grid>

            <Grid
              size={12}
              sx={mobileOnlySx}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterAltOutlinedIcon />}
                onClick={() => page.setFiltersOpen(true)}
                sx={{ minHeight: 44, borderRadius: "12px", textTransform: "none" }}
              >
                Фильтры
              </Button>
            </Grid>

            {page.section === "overview" ? (
              <>
                <Grid
                  size={12}
                  sx={{
                    ...tabletOnlySx,
                    "@media (min-width: 668px) and (max-width: 990px)": {
                      display: "block",
                      flexBasis: "33.333333%",
                      maxWidth: "33.333333%",
                    },
                  }}
                >
                  <Paper
                    component="aside"
                    aria-label="Фильтры"
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: blockBackground,
                      boxShadow: "none",
                      position: "sticky",
                      top: 80,
                    }}
                  >
                    <FilterSurface
                      page={page}
                      idPrefix="cafe-reviews-filters-tablet-overview"
                      compact
                    />
                  </Paper>
                </Grid>
                <Grid
                  size={12}
                  sx={{
                    "@media (min-width: 668px) and (max-width: 990px)": {
                      flexBasis: "66.666667%",
                      maxWidth: "66.666667%",
                    },
                    "@media (min-width: 991px)": { flexBasis: "100%", maxWidth: "100%" },
                  }}
                >
                  {page.contentLoading ? (
                    <Box
                      role="status"
                      aria-label="Загрузка обзора"
                      sx={{ minHeight: 260, display: "grid", placeItems: "center" }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : page.contentError ? (
                    <Paper
                      role="alert"
                      variant="outlined"
                      sx={{ p: 3, textAlign: "center", borderRadius: "12px" }}
                    >
                      <Typography sx={{ color: "error.main", mb: 1.5 }}>
                        {page.contentError}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={page.refresh}
                        sx={{ textTransform: "none", borderRadius: "12px" }}
                      >
                        Повторить
                      </Button>
                    </Paper>
                  ) : (
                    <CafeReviewsOverview dashboard={page.dashboard} />
                  )}
                </Grid>
              </>
            ) : (
              <>
                <Grid
                  size={12}
                  sx={{
                    ...tabletOnlySx,
                    "@media (min-width: 668px) and (max-width: 990px)": {
                      display: "block",
                      flexBasis: "33.333333%",
                      maxWidth: "33.333333%",
                    },
                  }}
                >
                  <Paper
                    component="aside"
                    aria-label="Фильтры"
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      bgcolor: blockBackground,
                      boxShadow: "none",
                      position: "sticky",
                      top: 80,
                    }}
                  >
                    <FilterSurface
                      page={page}
                      idPrefix="cafe-reviews-filters-tablet-list"
                      compact
                    />
                  </Paper>
                </Grid>
                <Grid
                  size={12}
                  sx={{
                    "@media (min-width: 668px) and (max-width: 990px)": {
                      flexBasis: "66.666667%",
                      maxWidth: "66.666667%",
                    },
                    "@media (min-width: 991px)": {
                      flexBasis: page.selected ? "62%" : "100%",
                      maxWidth: page.selected ? "62%" : "100%",
                    },
                  }}
                >
                  {page.contentLoading ? (
                    <Box
                      role="status"
                      aria-label="Загрузка списка"
                      sx={{ minHeight: 260, display: "grid", placeItems: "center" }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : page.contentError ? (
                    <Paper
                      role="alert"
                      variant="outlined"
                      sx={{ p: 3, textAlign: "center", borderRadius: "12px" }}
                    >
                      <Typography sx={{ color: "error.main", mb: 1.5 }}>
                        {page.contentError}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={page.refresh}
                        sx={{ textTransform: "none", borderRadius: "12px" }}
                      >
                        Повторить
                      </Button>
                    </Paper>
                  ) : (
                    <CafeReviewsList
                      kind={listKind}
                      items={listItems}
                      dictionaries={page.dictionaries}
                      selectedId={page.selected?.id}
                      onOpen={(id) => page.openDetail(listKind, id)}
                      pagination={page.pagination}
                      onPageChange={page.changePage}
                    />
                  )}
                </Grid>
                {page.selected && isDesktop ? (
                  <Grid
                    size={12}
                    sx={{
                      ...desktopOnlySx,
                      "@media (min-width: 991px)": {
                        display: "block",
                        flexBasis: "calc(38% - 20px)",
                        maxWidth: "calc(38% - 20px)",
                        height: "max-content",
                      },
                    }}
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        borderRadius: "12px",
                        borderColor: blockBorder,
                        maxHeight: "calc(100vh - 110px)",
                        overflowY: "auto",
                      }}
                    >
                      <DetailContent
                        page={page}
                        idPrefix="cafe-reviews-detail-desktop"
                      />
                    </Paper>
                  </Grid>
                ) : null}
              </>
            )}
          </>
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

      <SwipeableDrawer
        anchor="bottom"
        open={isMobile && page.filtersOpen}
        onOpen={() => page.setFiltersOpen(true)}
        onClose={() => page.setFiltersOpen(false)}
        disableSwipeToOpen
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": "cafe-reviews-mobile-filters-title",
          sx: {
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "92vh",
          },
        }}
      >
        <DrawerHandle />
        <Box sx={{ px: 2, pb: 3, overflowY: "auto" }}>
          <Typography
            id="cafe-reviews-mobile-filters-title"
            component="h2"
            sx={{ fontSize: 20, fontWeight: 800, mb: 2 }}
          >
            Фильтры
          </Typography>
          <FilterSurface
            page={page}
            idPrefix="cafe-reviews-filters-mobile"
          />
        </Box>
      </SwipeableDrawer>

      <SwipeableDrawer
        anchor="bottom"
        open={isMobile && page.detailOpen}
        onOpen={() => page.setDetailOpen(true)}
        onClose={page.closeDetail}
        disableSwipeToOpen
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": "cafe-reviews-mobile-detail-drawer-title",
          sx: {
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "94vh",
          },
        }}
      >
        <DrawerHandle />
        <Typography
          id="cafe-reviews-mobile-detail-drawer-title"
          component="h2"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            p: 0,
            m: -1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Детали отзыва или инцидента
        </Typography>
        <Box sx={{ overflowY: "auto" }}>
          {isMobile ? (
            <DetailContent
              page={page}
              idPrefix="cafe-reviews-detail-mobile"
              showClose
            />
          ) : null}
        </Box>
      </SwipeableDrawer>

      <Dialog
        open={isTablet && page.detailOpen}
        onClose={page.closeDetail}
        maxWidth="sm"
        fullWidth
        aria-label="Детали отзыва или инцидента"
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.3)" } },
          paper: { sx: { borderRadius: "16px", boxShadow: "none" } },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {isTablet ? (
            <DetailContent
              page={page}
              idPrefix="cafe-reviews-detail-tablet"
              showClose
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
