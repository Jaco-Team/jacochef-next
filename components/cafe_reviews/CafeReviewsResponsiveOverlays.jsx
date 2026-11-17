import { JacoModal } from "@/design-system/shared/ui";
import { DetailContent, FilterSurface } from "./CafeReviewsSectionContent";

/**
 * Below the desktop width the filters and the detail card open in the design
 * system modal: a bottom sheet on phones and a dialog on tablets.
 */
export default function CafeReviewsResponsiveOverlays({ page, isMobile, isTablet, showFilters }) {
  const detailOpen = (isMobile || isTablet) && page.detailOpen;
  const detailKind = page.selected?.kind || (page.section === "incidents" ? "incident" : "review");

  return (
    <>
      <JacoModal
        open={showFilters && isMobile && page.filtersOpen}
        onClose={() => page.setFiltersOpen(false)}
        title="Фильтры"
        maxWidth="sm"
      >
        <FilterSurface
          page={page}
          idPrefix="cafe-reviews-filters-mobile"
        />
      </JacoModal>

      <JacoModal
        open={detailOpen}
        onClose={page.closeDetail}
        title={detailKind === "incident" ? "Инцидент" : "Отзыв"}
        maxWidth="sm"
        contentSx={{ p: 0 }}
      >
        {detailOpen ? (
          <DetailContent
            page={page}
            idPrefix={isMobile ? "cafe-reviews-detail-mobile" : "cafe-reviews-detail-tablet"}
          />
        ) : null}
      </JacoModal>
    </>
  );
}
