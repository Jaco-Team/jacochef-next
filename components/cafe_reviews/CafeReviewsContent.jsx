import { Grid } from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { JacoButton, JacoSurface, uiColors } from "@/design-system/shared/ui";
import CafeReviewsSectionContent, { FilterSurface } from "./CafeReviewsSectionContent";
import CafeReviewsSectionTabs from "./CafeReviewsSectionTabs";
import { desktopOnlySx, mobileOnlySx } from "./shared";

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
            <JacoSurface
              component="section"
              aria-label="Фильтры"
              sx={{ p: 2, bgcolor: uiColors.surfaceMuted }}
            >
              <FilterSurface
                page={page}
                idPrefix="cafe-reviews-filters-desktop"
              />
            </JacoSurface>
          </Grid>

          <Grid
            size={12}
            sx={mobileOnlySx}
          >
            <JacoButton
              fullWidth
              tone="secondary"
              startIcon={<FilterAltOutlinedIcon />}
              onClick={() => page.setFiltersOpen(true)}
            >
              Фильтры
            </JacoButton>
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
