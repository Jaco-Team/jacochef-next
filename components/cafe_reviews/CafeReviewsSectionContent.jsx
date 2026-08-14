import { Box, Button, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import CafeReviewsFilters from "./CafeReviewsFilters";
import CafeReviewsLinks from "./CafeReviewsLinks";
import CafeReviewsList from "./CafeReviewsList";
import CafeReviewsOverview from "./CafeReviewsOverview";
import CafeReviewDetail from "./CafeReviewDetail";
import { blockBackground, blockBorder, desktopOnlySx, tabletOnlySx } from "./shared";

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
      points={page.points}
      dictionaries={sectionDictionaries}
      showCafeFilter={page.points.length > 1}
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
      onMarkIncident={page.markReviewIncident}
      onDecideAi={page.decideAi}
      onReanalyzeAi={page.reanalyzeAi}
      onOpenIncident={(id) => page.openDetail("incident", id)}
      onClose={page.closeDetail}
      error={page.detailError}
      onRetry={page.retryDetail}
      idPrefix={idPrefix}
      showClose={showClose}
    />
  );
}

function ContentState({ loadingLabel, loading, error, onRetry, children }) {
  if (loading) {
    return (
      <Box
        role="status"
        aria-label={loadingLabel}
        sx={{ minHeight: 260, display: "grid", placeItems: "center" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        role="alert"
        variant="outlined"
        sx={{ p: 3, textAlign: "center", borderRadius: "12px" }}
      >
        <Typography sx={{ color: "error.main", mb: 1.5 }}>{error}</Typography>
        <Button
          variant="outlined"
          onClick={onRetry}
          sx={{ textTransform: "none", borderRadius: "12px" }}
        >
          Повторить
        </Button>
      </Paper>
    );
  }

  return children;
}

function TabletFilters({ page, idPrefix }) {
  return (
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
          idPrefix={idPrefix}
          compact
        />
      </Paper>
    </Grid>
  );
}

export default function CafeReviewsSectionContent({ page, isDesktop }) {
  const listKind = page.section === "incidents" ? "incident" : "review";
  const listItems = listKind === "incident" ? page.incidents : page.reviews;

  if (page.section === "links") {
    return (
      <Grid size={12}>
        <CafeReviewsLinks
          links={page.links}
          points={page.points}
          canEdit={page.canEdit("links")}
          loading={page.contentLoading || page.mutationLoading}
          filters={page.linkFilters}
          onFiltersChange={page.updateLinkFilters}
          onGenerate={page.generateLink}
          onDelete={page.deleteLink}
          onLoadHistory={page.loadLinkHistory}
          onLoadQr={page.loadLinkQr}
        />
      </Grid>
    );
  }

  if (page.section === "overview") {
    return (
      <>
        <TabletFilters
          page={page}
          idPrefix="cafe-reviews-filters-tablet-overview"
        />
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
          <ContentState
            loadingLabel="Загрузка обзора"
            loading={page.contentLoading}
            error={page.contentError}
            onRetry={page.refresh}
          >
            <CafeReviewsOverview dashboard={page.dashboard} />
          </ContentState>
        </Grid>
      </>
    );
  }

  return (
    <>
      <TabletFilters
        page={page}
        idPrefix="cafe-reviews-filters-tablet-list"
      />
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
        <ContentState
          loadingLabel="Загрузка списка"
          loading={page.contentLoading}
          error={page.contentError}
          onRetry={page.refresh}
        >
          <CafeReviewsList
            kind={listKind}
            items={listItems}
            dictionaries={page.dictionaries}
            selectedId={page.selected?.id}
            onOpen={(id) => page.openDetail(listKind, id)}
            pagination={page.pagination}
            onPageChange={page.changePage}
            sort={page.filters.sort}
            direction={page.filters.direction}
            onSort={page.updateSort}
          />
        </ContentState>
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
  );
}

export { DetailContent, FilterSurface };
