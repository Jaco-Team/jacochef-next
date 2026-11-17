import { Button, Grid, Paper } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CafeReviewsSectionContent, { FilterSurface } from "./CafeReviewsSectionContent";
import CafeReviewsSectionTabs from "./CafeReviewsSectionTabs";
import { blockBackground, desktopOnlySx, mobileOnlySx } from "./shared";

export default function CafeReviewsContent({ page, isDesktop, visibleSections }) {
  const showFilters = page.section !== "links";

  return (
    <>
      <Grid size={12}>
        <CafeReviewsSectionTabs
          value={page.section}
          sections={visibleSections}
          newIncidentCount={page.newIncidentCount}
          onChange={page.setSection}
        />
      </Grid>

      {showFilters ? (
        <>
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
        </>
      ) : null}

      <CafeReviewsSectionContent
        page={page}
        isDesktop={isDesktop}
      />
    </>
  );
}
