import { Box, Dialog, DialogContent, SwipeableDrawer, Typography } from "@mui/material";
import { DetailContent, FilterSurface } from "./CafeReviewsSectionContent";

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

export default function CafeReviewsResponsiveOverlays({ page, isMobile, isTablet, showFilters }) {
  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={showFilters && isMobile && page.filtersOpen}
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
    </>
  );
}
